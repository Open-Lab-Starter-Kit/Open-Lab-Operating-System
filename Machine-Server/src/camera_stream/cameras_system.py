import base64
import time
import cv2
from multiprocessing import Pipe, Process

from camera_stream.stream import CameraStream
from stitching import AffineStitcher


class CamerasSystem(Process):
    def __init__(self, cameras_system_data):
        super(CamerasSystem, self).__init__()

        # shared objects dictionary with the core
        self.cameras_system_data = cameras_system_data

    def run(self):
        try:
            # Disable OpenCL in OpenCV
            cv2.ocl.setUseOpenCL(False)

            first_end_pip_camera_1, second_end_pipe_camera_1 = Pipe()
            first_end_pip_camera_2, second_end_pipe_camera_2 = Pipe()

            first_camera_stream = CameraStream(
                index=0, pipe_end=second_end_pipe_camera_1)
            second_camera_stream = CameraStream(
                index=1, pipe_end=second_end_pipe_camera_2)

            first_camera_stream.start()
            second_camera_stream.start()

            affine_stitcher = AffineStitcher(confidence_threshold=0)

            while True:
                first_camera_frame = first_end_pip_camera_1.recv()
                second_camera_frame = first_end_pip_camera_2.recv()

                if not first_camera_frame.any() or not second_camera_frame.any():
                    print("Error: Could not read frames from cameras")
                    break

                # adjust the frames to match color
                adjusted_frames = self.matching_frames(
                    (second_camera_frame, first_camera_frame))

                # convert the frame to string to send to the interface
                stitched_frame = self.convert_frame_to_string(affine_stitcher.stitch(
                    adjusted_frames))

                # add to the queue shared with the core
                self.add_to_cameras_system_read_queue(stitched_frame)

            cv2.destroyAllWindows()

        except Exception as Error:
            print("Error in the camera system", Error)
            first_camera_stream.terminate()
            first_camera_stream.join()
            second_camera_stream.terminate()
            second_camera_stream.join()
            self.reconnect_cameras()

    # this function will match the brightness and contrast for both frames
    def matching_frames(self, frames):
        (frame1, frame2) = frames

        # Separate the frames into individual color channels
        b, g, r = cv2.split(frame1)
        b2, g2, r2 = cv2.split(frame2)

        # Apply histogram matching to each channel of frame1 to match frame2
        b_matched = cv2.equalizeHist(b)
        g_matched = cv2.equalizeHist(g)
        r_matched = cv2.equalizeHist(r)
        b2_matched = cv2.equalizeHist(b2)
        g2_matched = cv2.equalizeHist(g2)
        r2_matched = cv2.equalizeHist(r2)

        # Merge the color channels back together
        matched_frame1 = cv2.merge((b_matched, g_matched, r_matched))
        matched_frame2 = cv2.merge((b2_matched, g2_matched, r2_matched))

        return [matched_frame2, matched_frame1]

    def convert_frame_to_string(self, frame):
        # Convert frame to JPEG format
        _, buffer = cv2.imencode('.jpg', frame)
        # Convert the frame to base64 string
        frame_str = base64.b64encode(buffer).decode('utf-8')

        return frame_str

    # add new message to the serial read queue

    def add_to_cameras_system_read_queue(self, frame):
        self.cameras_system_data.cameras_read_queue.put(frame)

    def reconnect_cameras(self):
        print('Trying to connect to cameras...')
        time.sleep(5)
        # retry to run the process again
        self.run()
