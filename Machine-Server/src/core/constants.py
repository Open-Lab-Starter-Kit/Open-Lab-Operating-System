class CoreConstants:
    MACHINE_TYPES = {
        'LASER_CUTTER': 'Laser Cutter',
        'CNC': 'cnc',
        'VINYL_CUTTER': 'Vinyl Cutter',
        '3D_SCANNER': '3D Scanner'
    }

    SERVER_READY_FILE_NAME = 'server_ready'

    # Data types for websocket messages
    MACHINE_STATUS_DATA_TYPE = 'MACHINE_STATUS'
    SERIAL_COMMAND_DATA_TYPE = 'SERIAL_COMMAND'
    JOB_EXECUTION_DATA_TYPE = 'JOB_EXECUTION'
    REAL_TIME_COMMAND_DATA_TYPE = 'REAL_TIME_COMMAND'
    NORMAL_COMMAND_DATA_TYPE = 'NORMAL_COMMAND'
    MACHINE_CONNECTION_DATA_TYPE = 'MACHINE_CONNECTION'
    JOBS_MANAGER_DATA_TYPE = 'JOBS_MANAGER'
    IMAGES_MANAGER_DATA_TYPE = 'IMAGES_MANAGER'
    AI_DATA_TYPE = 'AI_SERVICE'
    MATERIALS_LIBRARY_DATA_TYPE = 'MATERIALS_LIBRARY'
    CAMERAS_SYSTEM_STREAM_DATA_TYPE = 'CAMERAS_STREAM'
    JOYSTICK_STATUS_DATA_TYPE = 'JOYSTICK_STATUS'
    USB_STORAGE_MONITOR_DATA_TYPE = 'USB_STORAGE_MONITOR'

    NEW_LINE = '\n'

    TIMEOUT = 0.01  # 10 ms

    # make sure the joystick change its position to more than 500 ms to prevent any error movements
    JOYSTICK_STATUS_INTERVAL = 0.2
    # joystick error threshold
    JOYSTICK_ERROR_THRESHOLD = 10
    # max bit value for joystick
    MAX_BIT_VALUE_JOYSTICK = 1024

    # machine speed movement for the joystick
    LOW_SPEED_MOVEMENT = 10
    NORMAL_SPEED_MOVEMENT = 50
    FAST_SPEED_MOVEMENT = 200

    # center point where the initial point of joystick will start at
    JOYSTICK_CENTER_POINT = [512, 512]

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
    GRBL_COMMAND_MOVE_BED = 'G53 Z'
    GRBL_MATERIAL_THICKNESS_COMMENT = ' ;Move the bed based on the material thickness'
    GRBL_COMMAND_RELATIVE_POSITION = 'G90'
    GRBL_COMMAND_UNLOCK = '$X'
    GRBL_COMMAND_SOFT_RESET = '\x18'
    GRBL_END_PROGRAM = 'M2'
    GRBL_COOLANT_OFF = 'M9'
    GRBL_TOOL_CHANGE = 'M6'
    GRBL_NO_TOOL = 'T0'

    REAL_TIME_COMMANDS = [GRBL_COMMAND_PAUSE, GRBL_COMMAND_RESUME,
                          GRBL_COMMAND_STOP, GRBL_COMMAND_STATUS]

    # GRBL status
    GBRL_PAUSE_STATUS = 'Hold'

    # priority constants for the priority queue
    HIGH_PRIORITY_COMMAND = 1
    MIDDLE_PRIORITY_COMMAND = 2
    LOW_PRIORITY_COMMAND = 3

    # Jobs manager processes
    UPLOAD_JOB_PROCESS = "Upload"
    OPEN_JOB_PROCESS = "Open"
    START_JOB_PROCESS = "Start"
    DELETE_JOB_PROCESS = "Delete"
    DOWNLOAD_JOB_PROCESS = "Download"
    RENAME_JOB_PROCESS = "Rename"
    CHECK_JOB_PROCESS = "Check"
    GENERATE_JOB_PROCESS = "Generate"
    CANCEL_GENERATE_JOB_PROCESS = "Cancel"
    UPLOAD_USB_JOB_FILE_PROCESS = "Upload_USB_Job_File"

    # images manager processes
    UPLOAD_IMAGE_PROCESS = "Upload"
    DELETE_IMAGE_PROCESS = "Delete"
    RENAME_IMAGE_PROCESS = "Rename"
    FETCH_IMAGE_DATA_PROCESS = "Fetch"
    LIST_IMAGES_DATA_PROCESS = "List"
    UPLOAD_USB_IMAGE_FILE_PROCESS = "Upload_USB_Image_File"

    # AI processes
    AI_GENERATE_IMAGES_PROCESS = "Generate"
    AI_CANCEL_GENERATE_IMAGES_PROCESS = "Cancel"
    CONFIG_AI_SETTINGS_PROCESS = "Config"
    ADD_AI_SETTING_PROCESS = "Add"
    DELETE_AI_SETTING_PROCESS = "Delete"
    UPDATE_AI_SETTING_PROCESS = "Update"

    # Material Library Process
    LIST_MATERIAL_PROCESS = "List"
    ADD_MATERIAL_PROCESS = "Add"
    UPDATE_MATERIAL_PROCESS = "Update"
    DELETE_MATERIAL_PROCESS = "Delete"

    MATERIAL_NAME_SEARCH_KEYWORD = ";Material Name: "
    MATERIAL_THICKNESS_SEARCH_KEYWORD = ";Material Thickness: "

    BOUNDING_DIMENSION = 20

    AI_MODELS = {
        "openvino": [
            'rupeshs--sd-turbo-openvino',
            'rupeshs--sdxs-512-0.9-openvino',
            'rupeshs--hyper-sd-sdxl-1-step-openvino-int8',
            'rupeshs--sdxl-turbo-openvino-int8',
            'Disty0--LCM_SoteMix'
        ],
        "lcm_lora": [
            'runwayml--stable-diffusion-v1-5'
        ]
    }

    ACCEPTED_JOB_FILES_EXTENSIONS = ('.nc', '.cnc', '.gcode')
    ACCEPTED_IMAGE_FILES_EXTENSIONS = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.dxf': 'application/dxf',
    }
