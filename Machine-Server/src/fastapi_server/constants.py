import os


class FastAPIServerConstants:
    # to get the relative path for the gcode file management
    # where ever the module is getting called from
    BASE_DIR = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), 'gcode_stored_files')
    GCODE_FILE_EXTENSIONS = [".nc", ".cnc", "gcode"]

    # server routers
    FILE_MANAGER_ROUTE = "/api/file_manager"

    # file limit size in bytes, in this case 50MB;
    MAX_FILE_SIZE = 52428800

    # Frontend messages
    FILE_UPLOAD_MESSAGE = 'File uploaded'
    FILE_START_MESSAGE = 'File started'
    FILE_START_ERROR = 'Error: File did not start'
    FILE_OPEN_MESSAGE = 'File opened successfully'
    FILE_CLOSE_MESSAGE = 'File closed successfully'
    FILE_DELETE_MESSAGE = 'File deleted successfully'

    # Fast API types
    FILE_MANAGER_DATA_TYPE = 'FILE_MANAGER'

    # File manager processes
    UPLOAD_FILE_PROCESS = "Upload"
    OPEN_FILE_PROCESS = "Open"
    START_FILE_PROCESS = "Start"
    DELETE_FILE_PROCESS = "Delete"
    RENAME_FILE_PROCESS = "Rename"
    LIST_FILES_PROCESS = "List"
    CHECK_FILE_PROCESS = "Check"
