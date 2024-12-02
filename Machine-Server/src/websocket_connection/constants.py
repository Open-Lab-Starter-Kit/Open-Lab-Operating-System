class WebsocketConstants:
    TIMEOUT = 0.01  # 5 ms

    # priority constants for the priority queue
    HIGH_PRIORITY_COMMAND = 1
    MIDDLE_PRIORITY_COMMAND = 2
    LOW_PRIORITY_COMMAND = 3

    MAX_FRAME_SIZE = 1024 * 1024 * 500  # 500MB
