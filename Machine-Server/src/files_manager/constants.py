import os


class FilesManagerConstants:
    # to get the relative path for the gcode file management
    # where ever the module is getting called from
    JOB_BASE_DIR = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), 'jobs_stored_files')
    IMAGES_BASE_DIR = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), 'images_stored_files')

    GCODE_FILE_EXTENSIONS = (".nc", ".cnc", "gcode")
    IMAGE_FILES_EXTENSIONS = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.dxf': 'application/dxf',
    }

    # file size units
    BYTES_TO_KILOBYTES = 1024
    BYTES_TO_MEGABYTES = 1048576

    # file limit size in bytes, in this case 50MB;
    MAX_FILE_SIZE = 50 * BYTES_TO_MEGABYTES
