class CoreConstants:
    DIRECTORY_LISTING_REFRESH_INTERVAL = 0.1  # 100 ms

    # websocket server API information here
    SERIAL_PREFIX = 'S_'  # serial commands have this prefix
    FILE_PREFIX = 'F_'  # uploaded files have this prefix; the filename is added to the string payload of the message as first line of the file with "NAME_" prefix
    # this is the prefix to indicate the name of the file in the websocket message
    FILENAME_PREFIX = 'NAME_'
    DELETE_FILE_PREFIX = 'DF_'  # this prefix is used to delete files on the server
    # this prefix is used to open a file on the server, the server should send the preview etc
    OPEN_FILE_PREFIX = 'OF_'
    # with this prefix we close the file currently open in the server
    CLOSE_FILE_PREFIX = 'CF_'
    # with this we will start the execution of a previously opened file
    START_FILE_PREFIX = 'SF_'

    # Front end prefixes API here
    FRONTEND_CONSOLE_PREFIX = 'C_'
    FRONTEND_LIST_FILE_PREFIX = 'LS_'
    FRONTEND_FILE_OPENED_STATUS = 'FOS_'
    FRONTEND_FILE_CLOSED_STATUS = 'FCS_'

    # Frontend messages
    FILE_UPLOAD_MESSAGE = 'File uploaded'
    FILE_START_MESSAGE = 'File started'
    FILE_START_ERROR = 'Error: File did not start'
    FILE_OPEN_MESSAGE = 'File opened successfully'
    FILE_CLOSE_MESSAGE = 'File closed successfully'
    FILE_DELETE_MESSAGE = 'File deleted successfully'
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
    GRBL_RESET_ZERO = 'G92 X0 Y0 Z0'

    # GRBL status
    GBRL_PAUSE_STATUS = 'Hold'
    GBRL_ALARM_STATUS = 'Alarm'

    # priority constants for the priority queue
    HIGH_PRIORITY_COMMAND = 1
    MIDDLE_PRIORITY_COMMAND = 2
    LOW_PRIORITY_COMMAND = 3
