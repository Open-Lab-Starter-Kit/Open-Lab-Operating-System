from ..constants import FastAPIServerConstants as constants


class ImagesManagerService:
    @classmethod
    def _check_response(cls, response, error_msg=''):
        if isinstance(response, dict) and not response.get('data').get('success'):
            raise Exception(error_msg)
        return response

    @classmethod
    def images_list_data(cls, shared_core_data):
        shared_core_data.fastapi_read_queue.put(
            [constants.IMAGES_MANAGER_DATA_TYPE,
                {
                    'process': constants.LIST_IMAGES_DATA_PROCESS,
                }])
        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_LIST_IMAGES_DATA_PROCESS)

    @classmethod
    def fetch_image_data(cls, shared_core_data, image_name):
        shared_core_data.fastapi_read_queue.put(
            [constants.IMAGES_MANAGER_DATA_TYPE,
                {
                    'process': constants.FETCH_IMAGE_DATA_PROCESS,
                    'image_name': image_name,
                }])
        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_FETCH_IMAGE_DATA_PROCESS)

    @classmethod
    def delete_image(cls, shared_core_data, image_name):
        shared_core_data.fastapi_read_queue.put(
            [constants.IMAGES_MANAGER_DATA_TYPE,
                {
                    'process': constants.DELETE_IMAGE_PROCESS,
                    'image_name': image_name,
                }])
        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_DELETE_IMAGE_PROCESS)

    @classmethod
    def rename_image(cls, shared_core_data, old_image_name, new_image_name):
        shared_core_data.fastapi_read_queue.put(
            [constants.IMAGES_MANAGER_DATA_TYPE,
                {
                    'process': constants.RENAME_IMAGE_PROCESS,
                    'old_image_name': old_image_name,
                    'new_image_name': new_image_name
                }])
        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_RENAME_IMAGE_PROCESS)

    @classmethod
    def upload_image(cls, shared_core_data, file):
        shared_core_data.fastapi_read_queue.put(
            [constants.IMAGES_MANAGER_DATA_TYPE,
                {
                    'process': constants.UPLOAD_IMAGE_PROCESS,
                    'image_name': file.filename,
                    'image_content': file.file.read()
                }])
        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_UPLOAD_IMAGE_PROCESS)

    @classmethod
    def upload_usb_image_file(cls, shared_core_data, image_path):
        shared_core_data.fastapi_read_queue.put(
            [constants.IMAGES_MANAGER_DATA_TYPE,
                {
                    'process': constants.UPLOAD_USB_IMAGE_FILE_PROCESS,
                    'image_path': image_path,
                }])
        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_UPLOAD_USB_IMAGE_FILE_PROCESS)
