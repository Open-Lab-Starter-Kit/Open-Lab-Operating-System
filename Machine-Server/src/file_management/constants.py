import os


class GCodeFileManagerConstants:
    # to get the relative path for the gcode file management
    # where ever the module is getting called from
    BASE_DIR = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), 'gcode_stored_files')
    GCODE_FILE_EXTENSIONS = [".nc", ".cnc", "gcode"]

    # file limit size in bytes, in this case 50MB;
    MAX_FILE_SIZE = 52428800
