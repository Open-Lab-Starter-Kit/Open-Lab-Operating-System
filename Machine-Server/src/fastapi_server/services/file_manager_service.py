from ..constants import FastAPIServerConstants as constants


class FileManagerService:
    @classmethod
    def open_file(cls, shared_core_data, filename):
        shared_core_data.fastapi_read_queue.put(
            [constants.FILE_MANAGER_DATA_TYPE,
                {
                    'process': constants.OPEN_FILE_PROCESS,
                    'file': filename,
                }])

        response = shared_core_data.fastapi_write_queue.get()
        return response

    @classmethod
    def delete_file(cls, shared_core_data, filename):
        shared_core_data.fastapi_read_queue.put(
            [constants.FILE_MANAGER_DATA_TYPE,
                {
                    'process': constants.DELETE_FILE_PROCESS,
                    'file': filename,
                }])

        response = shared_core_data.fastapi_write_queue.get()
        return response

    @classmethod
    def rename_file(cls, shared_core_data, old_filename, new_filename):
        shared_core_data.fastapi_read_queue.put(
            [constants.FILE_MANAGER_DATA_TYPE,
                {
                    'process': constants.RENAME_FILE_PROCESS,
                    'old_filename': old_filename,
                    'new_filename': new_filename
                }])

        response = shared_core_data.fastapi_write_queue.get()
        return response

    @classmethod
    def start_file(cls, shared_core_data):
        shared_core_data.fastapi_read_queue.put(
            [constants.FILE_MANAGER_DATA_TYPE,
                {
                    'process': constants.START_FILE_PROCESS,

                }])
        response = shared_core_data.fastapi_write_queue.get()
        return response

    @classmethod
    def upload_file(cls, shared_core_data, file):

        shared_core_data.fastapi_read_queue.put(
            [constants.FILE_MANAGER_DATA_TYPE,
                {
                    'process': constants.UPLOAD_FILE_PROCESS,
                    'file': file.filename,
                    'content': file.file.read()
                }])
        response = shared_core_data.fastapi_write_queue.get()
        return response

    @classmethod
    def check_opened_file(cls, shared_core_data):
        shared_core_data.fastapi_read_queue.put(
            [constants.FILE_MANAGER_DATA_TYPE,
             {
                 'process': constants.CHECK_FILE_PROCESS,

             }])
        response = shared_core_data.fastapi_write_queue.get()
        return response

    @classmethod
    def get_files_list(cls, shared_core_data):
        shared_core_data.fastapi_read_queue.put(
            [constants.FILE_MANAGER_DATA_TYPE,
             {
                 'process': constants.LIST_FILES_PROCESS,
             }])
        response = shared_core_data.fastapi_write_queue.get()
        return response
