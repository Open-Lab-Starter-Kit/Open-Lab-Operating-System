from ..constants import FastAPIServerConstants as constants


class JobsManagerService:
    @classmethod
    def _check_response(cls, response, error_msg=''):
        if isinstance(response, dict) and not response.get('data').get('success'):
            raise Exception(error_msg)
        return response

    @classmethod
    def open_file(cls, shared_core_data, filename):
        shared_core_data.fastapi_read_queue.put(
            [constants.JOBS_MANAGER_DATA_TYPE,
                {
                    'process': constants.OPEN_JOB_PROCESS,
                    'filename': filename,
                }])
        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_OPEN_JOB_PROCESS)

    @classmethod
    def delete_file(cls, shared_core_data, filename):
        shared_core_data.fastapi_read_queue.put(
            [constants.JOBS_MANAGER_DATA_TYPE,
                {
                    'process': constants.DELETE_JOB_PROCESS,
                    'filename': filename,
                }])
        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_DELETE_JOB_PROCESS)

    @classmethod
    def download_file(cls, shared_core_data, filename):
        shared_core_data.fastapi_read_queue.put(
            [constants.JOBS_MANAGER_DATA_TYPE,
                {
                    'process': constants.DOWNLOAD_JOB_PROCESS,
                    'filename': filename,
                }])
        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_DOWNLOAD_JOB_PROCESS)

    @classmethod
    def rename_file(cls, shared_core_data, old_filename, new_filename):
        shared_core_data.fastapi_read_queue.put(
            [constants.JOBS_MANAGER_DATA_TYPE,
                {
                    'process': constants.RENAME_JOB_PROCESS,
                    'old_filename': old_filename,
                    'new_filename': new_filename
                }])
        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_RENAME_JOB_PROCESS)

    @classmethod
    def start_file(cls, shared_core_data):
        shared_core_data.fastapi_read_queue.put(
            [constants.JOBS_MANAGER_DATA_TYPE,
                {
                    'process': constants.START_JOB_PROCESS,
                }])
        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_START_JOB_PROCESS)

    @classmethod
    def upload_file(cls, shared_core_data, file):
        shared_core_data.fastapi_read_queue.put(
            [constants.JOBS_MANAGER_DATA_TYPE,
                {
                    'process': constants.UPLOAD_JOB_PROCESS,
                    'filename': file.filename,
                    'file_content': file.file.read()
                }])
        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_UPLOAD_JOB_PROCESS)

    @classmethod
    def check_opened_file(cls, shared_core_data):
        shared_core_data.fastapi_read_queue.put(
            [constants.JOBS_MANAGER_DATA_TYPE,
                {
                    'process': constants.CHECK_JOB_PROCESS,
                }])
        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_CHECK_JOB_PROCESS)

    @classmethod
    def generate_file(cls, shared_core_data, cutting_svg_content, marking_svg_content, image_content, gcode_settings):
        shared_core_data.fastapi_read_queue.put(
            [constants.JOBS_MANAGER_DATA_TYPE,
                {
                    'process': constants.GENERATE_JOB_PROCESS,
                    'cutting_svg_file_content': cutting_svg_content,
                    'marking_svg_file_content': marking_svg_content,
                    'image_file_content': image_content,
                    'gcode_settings': gcode_settings
                }])
        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_GENERATE_JOB_PROCESS)

    @classmethod
    def cancel_generate_file(cls, shared_core_data):
        shared_core_data.fastapi_read_queue.put(
            [constants.JOBS_MANAGER_DATA_TYPE,
                {
                    'process': constants.CANCEL_GENERATE_JOB_PROCESS,
                }])

    @classmethod
    def upload_usb_job_file(cls, shared_core_data, file_path):
        shared_core_data.fastapi_read_queue.put(
            [constants.JOBS_MANAGER_DATA_TYPE,
                {
                    'process': constants.UPLOAD_USB_JOB_FILE_PROCESS,
                    'file_path': file_path,
                }])
        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_UPLOAD_USB_JOB_FILE_PROCESS)
