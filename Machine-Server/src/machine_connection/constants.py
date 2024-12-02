class MachineConstants:
    MACHINE_TYPES = {
        'LASER_CUTTER': 'Laser Cutter',
        'CNC': 'cnc',
        'VINYL_CUTTER': 'Vinyl Cutter',
        '3D_SCANNER': '3D Scanner'
    }
    # Serial port settings
    TIMEOUT = 0.01  # 5 ms
    # refresh every 100 ms while the machine is running
    STATUS_REFRESH_INTERVAL_RUN = 0.1
    # refresh every 1 second while the machine is paused
    STATUS_REFRESH_INTERVAL_PAUSE = 1

    # delimiters
    NEWLINE = "\n"

    # GRBL answers
    GRBL_ANSWER_OK = "ok"
    GRBL_ANSWER_ERROR = "error"

    # GRBL status
    GRBL_PAUSE_STATUS = 'Hold'

    # GRBL commands
    GRBL_COMMAND_STATUS = '?'
    GRBL_COMMAND_PAUSE = '!'
    GRBL_COMMAND_RESUME = '~'
    GRBL_COMMAND_STOP = '\x18'
    GRBL_COMMAND_UNLOCK = '$X'
    GRBL_COMMAND_TOOL_CHANGE = 'M6'
    GRBL_COMMAND_RESET_ZERO = 'G92 X0 Y0 Z0'
    GRBL_COMMAND_HOMING = '$H'
    GRBL_COMMAND_RETURN_TO_ZERO = 'G1 X0 Y0 F5000'
    GRBL_COMMAND_SOFT_RESET = '\x18'
    GRBL_COMMAND_DUMMY_STATUS_HOMING = "<Home|MPos:0.000,0.000,0.000|FS:0.0,0>"

    # PICO commands
    PICO_ENABLE_STATUS = 'GSE'
    PICO_DISABLE_STATUS = 'GSD'

    # tool change reply messages
    TOOL_CHANGER_SUCCESS = 'TCOK'
    TOOL_CHANGER_ERROR = 'TCSE'
    # soft limits reply message
    SOFT_LIMITS_TRIGGER = 'MPOUT'

    # priority constants for the priority queue
    HIGH_PRIORITY_COMMAND = 1
    MIDDLE_PRIORITY_COMMAND = 2
    LOW_PRIORITY_COMMAND = 3

    MAX_COUNTER_VALUE = 900  # second => 15 mins

    # machine messages types
    MACHINE_STATUS_DATA_TYPE = 'MACHINE_STATUS'
    SERIAL_COMMAND_DATA_TYPE = 'SERIAL_COMMAND'
    REAL_TIME_COMMAND_DATA_TYPE = 'REAL_TIME_COMMAND'
    NORMAL_COMMAND_DATA_TYPE = 'NORMAL_COMMAND'
    MACHINE_CONNECTION_DATA_TYPE = 'MACHINE_CONNECTION'
    JOYSTICK_STATUS_DATA_TYPE = 'JOYSTICK_STATUS'

    # Joystick speed mm/s
    LOW_JOYSTICK_SPEED = 1
    LOW_JOYSTICK_SPEED = 10
    LOW_JOYSTICK_SPEED = 100
