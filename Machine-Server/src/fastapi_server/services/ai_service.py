from ..constants import FastAPIServerConstants as constants


class AIService:
    @classmethod
    def _check_response(cls, response, error_msg=''):
        if isinstance(response, dict) and not response.get('data').get('success'):
            raise Exception(error_msg)
        return response

    @classmethod
    def ai_generate_images(cls, shared_core_data, ai_generator_settings):

        shared_core_data.fastapi_read_queue.put(
            [constants.AI_DATA_TYPE,
             {
                 'process': constants.AI_GENERATE_IMAGES_PROCESS,
                 "ai_generator_settings":  ai_generator_settings
             }])

        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_AI_GENERATE_IMAGES_PROCESS)

    @classmethod
    def cancel_generate_images(cls, shared_core_data,):
        # prevent both generate and cancel from writing data in the queue at the same time
        if shared_core_data.fastapi_write_queue.empty():
            shared_core_data.fastapi_read_queue.put(
                [constants.AI_DATA_TYPE,
                 {
                     'process': constants.AI_CANCEL_GENERATE_IMAGES_PROCESS,
                 }])

    @classmethod
    def add_new_ai_settings(cls, shared_core_data, ai_settings):
        shared_core_data.fastapi_read_queue.put(
            [constants.AI_DATA_TYPE,
             {
                 'process': constants.ADD_AI_SETTING_PROCESS,
                 "ai_settings": ai_settings,
             }])

        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_ADD_AI_SETTING_PROCESS)

    @classmethod
    def get_ai_config_data(cls, shared_core_data):
        shared_core_data.fastapi_read_queue.put(
            [constants.AI_DATA_TYPE,
             {
                 'process': constants.CONFIG_AI_SETTINGS_PROCESS,
             }])

        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_CONFIG_AI_SETTINGS_PROCESS)

    @classmethod
    def delete_ai_setting(cls, shared_core_data, ai_setting_id):

        shared_core_data.fastapi_read_queue.put(
            [constants.AI_DATA_TYPE,
             {
                 'process': constants.DELETE_AI_SETTING_PROCESS,
                 'ai_setting_id': ai_setting_id
             }])

        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_DELETE_AI_SETTING_PROCESS)

    @classmethod
    def update_ai_settings(cls, shared_core_data, ai_settings):
        shared_core_data.fastapi_read_queue.put(
            [constants.AI_DATA_TYPE,
             {
                 'process': constants.UPDATE_AI_SETTING_PROCESS,
                 "ai_settings": ai_settings,
             }])

        response = shared_core_data.fastapi_write_queue.get()
        return cls._check_response(response, constants.ERROR_UPDATE_AI_SETTING_PROCESS)
