class CoreConstants:

    # Data types for websocket messages
    MACHINE_STATUS_DATA_TYPE = 'MACHINE_STATUS'
    SERIAL_COMMAND_DATA_TYPE = 'SERIAL_COMMAND'
    FILE_DATA_TYPE = 'FILE'
    REAL_TIME_COMMAND_DATA_TYPE = 'REAL_TIME_COMMAND'
    NORMAL_COMMAND_DATA_TYPE = 'NORMAL_COMMAND'
    MACHINE_CONNECTION_DATA_TYPE = 'MACHINE_CONNECTION'

    # Front end prefixes API here
    FRONTEND_CONSOLE_PREFIX = 'C_'
    FRONTEND_LIST_FILE_PREFIX = 'LS_'
    FRONTEND_FILE_OPENED_STATUS = 'FOS_'
    FRONTEND_FILE_CLOSED_STATUS = 'FCS_'

    # Frontend messages
    UPLOAD_FILE_MESSAGE = 'File uploaded'
    START_FILE_MESSAGE = 'File started'
    START_FILE_ERROR = 'Error: File did not start'
    OPEN_FILE_MESSAGE = 'File opened successfully'
    CLOSE_FILE_MESSAGE = 'File closed successfully'
    DELETE_FILE_MESSAGE = 'File deleted successfully'
    RENAME_FILE_MESSAGE = 'File renamed successfully'

    COMMAND_EXECUTE = 'Command to execute: '

    NEW_LINE = '\n'

    TIMEOUT = 0.02  # 20 ms

    # Constants for G-code comments
    GCODE_COMMENT_PARENTHESES = '('
    GCODE_COMMENT_SEMICOLON = ';'

    # GBRL answers
    GRBL_ANSWER_OK = "ok"
    GRBL_ANSWER_ERROR = "error"

    # GBRL commands
    GRBL_COMMAND_STATUS = '?'
    GRBL_COMMAND_PAUSE = '!'
    GRBL_COMMAND_RESUME = '~'
    GRBL_COMMAND_STOP = '\x18'
    GRBL_COMMAND_HOMING = '$H'
    GRBL_COMMAND_RESET_ZERO = 'G92 X0 Y0 Z0'
    GRBL_COMMAND_UNLOCK = '$X'
    GRBL_COMMAND_SOFT_RESET = '\x18'
    REAL_TIME_COMMANDS = [GRBL_COMMAND_PAUSE, GRBL_COMMAND_RESUME,
                          GRBL_COMMAND_STOP, GRBL_COMMAND_STATUS]

    # GRBL status
    GBRL_PAUSE_STATUS = 'Hold'
    GBRL_ALARM_STATUS = 'Alarm'

    # priority constants for the priority queue
    HIGH_PRIORITY_COMMAND = 1
    MIDDLE_PRIORITY_COMMAND = 2
    LOW_PRIORITY_COMMAND = 3

    # File manager processes
    UPLOAD_FILE_PROCESS = "UPLOAD"
    OPEN_FILE_PROCESS = "OPEN"
    START_FILE_PROCESS = "START"
    DELETE_FILE_PROCESS = "DELETE"
    RENAME_FILE_PROCESS = "RENAME"
    LIST_FILES_PROCESS = "LIST"
    CHECK_FILE_PROCESS = "CHECK"
