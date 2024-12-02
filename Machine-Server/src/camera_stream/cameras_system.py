import base64
import time
import cv2
from multiprocessing import Pipe, Process

import numpy as np

from utils.configuration_loader import ConfigurationLoader
from utils.camera_stream import CameraStream
from stitching import Stitcher
from .constants import CameraConstants as constants


class CamerasSystem(Process):
    def __init__(self, cameras_system_data):
        super(CamerasSystem, self).__init__()

        # shared objects dictionary with the core
        self.cameras_system_data = cameras_system_data

    def run(self):
        try:
            config = ConfigurationLoader.from_yaml()
            # Disable OpenCL in OpenCV
            cv2.ocl.setUseOpenCL(False)

            camera_pipes = []
            camera_streams = []

            for index in config.cameras_connection.cameras_port_index:
                first_end_pipe, second_end_pipe = Pipe()
                camera_pipes.append(first_end_pipe)
                camera_stream = CameraStream(
                    index=index, pipe_end=second_end_pipe)
                camera_streams.append(camera_stream)
                camera_stream.start()

            # use stitching incase of multiple cameras
            if (len(camera_streams) > 1 and
                    config.cameras_connection.stitching_settings.stitching_enabled):
                self._handle_cameras_using_stitching(camera_pipes, config)
            # incase of multiple cameras without stitching
            elif (len(camera_streams) > 1 and
                  not config.cameras_connection.stitching_settings.stitching_enabled):
                self._handle_cameras_without_stitching(camera_pipes)
            # one camera
            elif len(camera_streams) == 1:
                self._handle_one_camera(camera_pipes)

        except Exception as Error:
            print("Error in the camera system", Error)
            for stream in camera_streams:
                stream.terminate()
                stream.join()
            self._reconnect_cameras()

    def _handle_cameras_using_stitching(self, camera_pipes, config):
        algorithm_settings = config.get_dict(
            'cameras_connection.stitching_settings.algorithm_settings')

        stitcher = Stitcher(
            **algorithm_settings)

        while True:
            frames = [pipe.recv() for pipe in camera_pipes]

            if not all(frame.any() for frame in frames):
                print("Error: Could not read frames from cameras")
                break

            # calibrate frames
            adjusted_frames = []

            for i, frame in enumerate(frames):
                adjusted_frame = cv2.undistort(frame,
                                               np.array(
                                                   config.cameras_connection.stitching_settings.cameras_calibration_settings.cameras_matrix[i]),
                                               np.array(
                                                   config.cameras_connection.stitching_settings.cameras_calibration_settings.cameras_coeffs[i]),
                                               None,
                                               np.array(config.cameras_connection.stitching_settings.cameras_calibration_settings.cameras_matrix[i]))
                adjusted_frames.append(adjusted_frame)

            # Define the dimensions of the patterned strip

            strip_width = adjusted_frames[0].shape[1]

            # Create the patterned strip
            patterned_strip = self._create_patterned_strip(
                strip_width, config.cameras_connection.stitching_settings.frames_strip_height)
            # Combine the patterned strip with the frame
            frames_with_strip = [
                np.concatenate((patterned_strip, frame, patterned_strip), axis=0) for frame in adjusted_frames]

            # convert the frame to string to send to the interface
            stitched_frame = stitcher.stitch(frames_with_strip)
            stitched_frame = stitched_frame[config.cameras_connection.stitching_settings.frames_strip_height:-
                                            config.cameras_connection.stitching_settings.frames_strip_height]
            # Remove the unwanted edges from the frames
            stitched_frame = stitched_frame[:,
                                            config.cameras_connection.stitching_settings.start_strip_width:
                                            config.cameras_connection.stitching_settings.end_strip_width]

            frame_str = self._convert_frame_to_string(
                stitched_frame)

            # add to the queue shared with the core
            self._add_to_cameras_system_read_queue(frame_str)
            time.sleep(constants.TIMEOUT)

    def _handle_cameras_without_stitching(self, camera_pips):
        while True:
            frames = [pipe.recv() for pipe in camera_pips]
            frame = np.concatenate(frames, axis=1)
            frame_str = self._convert_frame_to_string(frame)

            # add to the queue shared with the core
            self._add_to_cameras_system_read_queue(frame_str)
            time.sleep(constants.TIMEOUT)

    def _handle_one_camera(self, camera_pipes):
        while True:
            frame = camera_pipes[0].recv()
            frame_str = self._convert_frame_to_string(frame)

            # add to the queue shared with the core
            self._add_to_cameras_system_read_queue(frame_str)
            time.sleep(constants.TIMEOUT)

    def _create_patterned_strip(self, width, height, direction='left', dot_size=3, dot_spacing=10, ):
        strip = np.ones((height, width), dtype=np.uint8) * \
            255  # White background
        width_range = range(
            width-height, width, dot_spacing) if direction == 'left' else range(0, height + 180, dot_spacing)
        # Add black dots
        for y in range(0, height, dot_spacing):
            for x in width_range:
                cv2.circle(strip, (x, y), dot_size, (0, 0, 0), -1)

        strip = np.repeat(np.expand_dims(strip, axis=2), 3, axis=2)

        return strip

    def _convert_frame_to_string(self, frame):

        # Convert frame to JPEG format
        _, buffer = cv2.imencode('.jpg', frame)
        # Convert the frame to base64 string
        frame_str = base64.b64encode(buffer).decode('utf-8')

        return frame_str

    # add new message to the serial read queue

    def _add_to_cameras_system_read_queue(self, frame):
        self.cameras_system_data.cameras_read_queue.put(frame)

    def _reconnect_cameras(self):
        print('Trying to connect to cameras...')
        time.sleep(5)
        # retry to run the process again
        self.run()
