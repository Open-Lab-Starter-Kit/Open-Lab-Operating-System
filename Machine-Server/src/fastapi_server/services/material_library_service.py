from ..constants import FastAPIServerConstants as constants


class MaterialLibraryService:
    @classmethod
    def _check_response(cls, response, error_msg=''):
        if isinstance(response, dict) and not response.get('data').get('success'):
            raise Exception(error_msg)
        return response

    @classmethod
    def get_materials_list(cls, shared_core_data):

        shared_core_data.fastapi_read_queue.put(
            [constants.MATERIAL_LIBRARY_DATA_TYPE,
             {
                 'process': constants.LIST_MATERIAL_PROCESS,
             }])

        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_LIST_MATERIAL_PROCESS)

    @classmethod
    def add_new_material(cls, shared_core_data, material_data):

        shared_core_data.fastapi_read_queue.put(
            [constants.MATERIAL_LIBRARY_DATA_TYPE,
             {
                 'process': constants.ADD_MATERIAL_PROCESS,
                 'material_data': material_data,
             }])

        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_ADD_MATERIAL_PROCESS)

    @classmethod
    def update_material(cls, shared_core_data, material_data):

        shared_core_data.fastapi_read_queue.put(
            [constants.MATERIAL_LIBRARY_DATA_TYPE,
             {
                 'process': constants.UPDATE_MATERIAL_PROCESS,
                 'material_data': material_data,
             }])

        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_UPDATE_MATERIAL_PROCESS)

    @classmethod
    def delete_material(cls, shared_core_data, material_id):

        shared_core_data.fastapi_read_queue.put(
            [constants.MATERIAL_LIBRARY_DATA_TYPE,
             {
                 'process': constants.DELETE_MATERIAL_PROCESS,
                 'material_id': material_id
             }])

        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_DELETE_MATERIAL_PROCESS)
