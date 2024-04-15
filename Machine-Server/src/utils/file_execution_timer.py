import time

# timer module while the file execution process


class FileExecutionTimer:
    def __init__(self):
        self._start_time = 0
        self._pause_time = 0
        self._paused_duration = 0
        self._is_running = False

    def start(self):
        if not self._is_running:
            self._start_time = time.time() - self._paused_duration
            self._is_running = True

    def pause(self):
        if self._is_running:
            self._pause_time = time.time()
            self._is_running = False

    def resume(self):
        if self._is_running and self._start_time > 0:
            self._paused_duration += time.time() - self._pause_time
            self._is_running = True

    def stop(self):
        if self._is_running:
            self._is_running = False

    def reset(self):
        self._start_time = 0
        self._pause_time = 0
        self._paused_duration = 0
        self._is_running = False

    def get_elapsed_time(self):
        if self._is_running:
            current_time = time.time()
            return current_time - self._start_time - self._paused_duration
        elif self._start_time:
            return self._pause_time - self._start_time - self._paused_duration
        else:
            return 0
