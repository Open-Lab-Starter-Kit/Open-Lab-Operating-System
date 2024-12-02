class FastAPIServerConstants:
    # server routers
    JOBS_MANAGER_ROUTE = "/api/jobs_manager"
    IMAGES_MANAGER_ROUTE = "/api/images_manager"
    AI_ROUTE = "/api/ai"
    MATERIAL_LIBRARY_ROUTE = "/api/material_library"

    # job limit size in bytes, in this case 50MB;
    MAX_JOB_SIZE = 52428800

    # Fast API types
    JOBS_MANAGER_DATA_TYPE = 'JOBS_MANAGER'
    IMAGES_MANAGER_DATA_TYPE = 'IMAGES_MANAGER'
    AI_DATA_TYPE = 'AI_SERVICE'
    MATERIAL_LIBRARY_DATA_TYPE = 'MATERIALS_LIBRARY'

    # job manager processes
    UPLOAD_JOB_PROCESS = "Upload"
    OPEN_JOB_PROCESS = "Open"
    START_JOB_PROCESS = "Start"
    DELETE_JOB_PROCESS = "Delete"
    DOWNLOAD_JOB_PROCESS = "Download"
    RENAME_JOB_PROCESS = "Rename"
    LIST_JOBS_PROCESS = "List"
    CHECK_JOB_PROCESS = "Check"
    GENERATE_JOB_PROCESS = "Generate"
    CANCEL_GENERATE_JOB_PROCESS = "Cancel"
    UPLOAD_USB_JOB_FILE_PROCESS = "Upload_USB_Job_File"

    ERROR_UPLOAD_JOB_PROCESS = "Problem ocurred while uploading the job process"
    ERROR_OPEN_JOB_PROCESS = "Problem ocurred while opening the job process"
    ERROR_START_JOB_PROCESS = "Problem ocurred while starting the job process"
    ERROR_DELETE_JOB_PROCESS = "Problem ocurred while deleting the job process"
    ERROR_DOWNLOAD_JOB_PROCESS = "Problem ocurred while downloading the job process"
    ERROR_RENAME_JOB_PROCESS = "Problem ocurred while renaming the job process"
    ERROR_CHECK_JOB_PROCESS = "Problem ocurred while checking if there is an opened job process"
    ERROR_GENERATE_JOB_PROCESS = "Problem ocurred while generating gcode job process"
    ERROR_CANCEL_GENERATE_JOB_PROCESS = "Problem ocurred while canceling generating a job process"
    ERROR_UPLOAD_USB_JOB_FILE_PROCESS = "Problem ocurred while uploading job from usb process"

    # images manager processes
    UPLOAD_IMAGE_PROCESS = "Upload"
    DELETE_IMAGE_PROCESS = "Delete"
    RENAME_IMAGE_PROCESS = "Rename"
    FETCH_IMAGE_DATA_PROCESS = "Fetch"
    LIST_IMAGES_DATA_PROCESS = "List"
    UPLOAD_USB_IMAGE_FILE_PROCESS = "Upload_USB_Image_File"

    ERROR_UPLOAD_IMAGE_PROCESS = "Problem ocurred while uploading the image process"
    ERROR_DELETE_IMAGE_PROCESS = "Problem ocurred while deleting the image process"
    ERROR_RENAME_IMAGE_PROCESS = "Problem ocurred while renaming the image process"
    ERROR_FETCH_IMAGE_DATA_PROCESS = "Problem ocurred while fetching image data process"
    ERROR_LIST_IMAGES_DATA_PROCESS = "Problem ocurred while list images data process"
    ERROR_UPLOAD_USB_IMAGE_FILE_PROCESS = "Problem ocurred while uploading image from usb process"

    # AI Processes
    AI_GENERATE_IMAGES_PROCESS = "Generate"
    AI_CANCEL_GENERATE_IMAGES_PROCESS = "Cancel"
    CONFIG_AI_SETTINGS_PROCESS = "Config"
    ADD_AI_SETTING_PROCESS = "Add"
    DELETE_AI_SETTING_PROCESS = "Delete"
    UPDATE_AI_SETTING_PROCESS = "Update"

    ERROR_AI_GENERATE_IMAGES_PROCESS = "Problem occurred while generating images process"
    ERROR_AI_CANCEL_GENERATE_IMAGES_PROCESS = "Problem occurred while canceling generating images process"
    ERROR_CONFIG_AI_SETTINGS_PROCESS = "Problem occurred while fetching AI settings infos process"
    ERROR_ADD_AI_SETTING_PROCESS = "Problem occurred while adding AI setting process"
    ERROR_DELETE_AI_SETTING_PROCESS = "Problem occurred while deleting AI setting process"
    ERROR_UPDATE_AI_SETTING_PROCESS = "Problem occurred while updating AI setting process"

    # Material Library Processes
    LIST_MATERIAL_PROCESS = "List"
    ADD_MATERIAL_PROCESS = "Add"
    UPDATE_MATERIAL_PROCESS = "Update"
    DELETE_MATERIAL_PROCESS = "Delete"

    ERROR_LIST_MATERIAL_PROCESS = "Problem occurred while fetching materials infos process"
    ERROR_ADD_MATERIAL_PROCESS = "Problem occurred while adding new material process"
    ERROR_UPDATE_MATERIAL_PROCESS = "Problem occurred while updating a material process"
    ERROR_DELETE_MATERIAL_PROCESS = "Problem occurred while deleting a material process"
