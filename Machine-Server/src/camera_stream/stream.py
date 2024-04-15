import base64
from multiprocessing import Process
import time
import cv2
import numpy as np

# This module is used to handle the stream from the cameras


class CameraStream(Process):
    def __init__(self, index, pipe_end):
        super(CameraStream, self).__init__()
        self.index = index
        self.pipe_end = pipe_end

    def run(self):
        camera = self.open_camera()
        try:
            if camera:
                while True:
                    ret, frame = camera.read()
                    if ret:
                        self.pipe_end.send(frame)

        except Exception as Error:
            pass
        except KeyboardInterrupt:
            camera.release()

    def open_camera(self):
        camera = cv2.VideoCapture(self.index,  cv2.CAP_DSHOW)
        # if the camera is not open try again to open the camera
        if not camera.isOpened():
            print('Camera with index number: ',
                  self.index, 'is not connected')

            return None

        return camera
