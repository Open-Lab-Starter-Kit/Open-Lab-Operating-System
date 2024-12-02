import json
import tempfile
import threading
import time
from files_manager.jobs_manager import JobsManager
from machine_connection.machine_connector import MachineConnector
from fastapi_server.main import FastApiServer
from camera_stream.cameras_system import CamerasSystem
from files_manager.images_manager import ImagesManager
from utils.images_manager_helper import ImagesManagerHelper
from utils.usb_storage_monitor import USBStorageMonitor
from utils.ai_helper import AIHelper
from utils.materials_library_helper import MaterialsLibraryHelper
from utils.database_connection import DataBaseConnections
from utils.job_manager_helper import JobsManagerHelper
from utils.configuration_loader import ConfigurationLoader
# from utils.joystick_handler import JoystickHandler
from utils.job_execution_timer import JobExecutionTimer
from utils.websocket_json_data import WebsocketJsonData
from utils.shared_data import SharedCamerasSystemData, SharedFastApiData, SharedMachineData, SharedWebsocketData
from websocket_connection.websocket_connector import WebSocketConnector
from .constants import CoreConstants as constants
import os
from dotenv import load_dotenv

load_dotenv()
# ServerCore is a module that manage all the services in the machine server
# Orchestrating the whole system


class ServerCore:

    def __init__(self):
        # configuration settings
        self._config = ConfigurationLoader.from_yaml()

        # shared data with processes
        self.machine_connector_shared_data = SharedMachineData()
        self.websocket_connector_shared_data = SharedWebsocketData()
        self.fastapi_server_shared_data = SharedFastApiData()
        self.cameras_system_shared_data = SharedCamerasSystemData()

        # instance for each process
        self.machine_connector = MachineConnector(
            self.machine_connector_shared_data)
        self.websocket_connector = WebSocketConnector(
            self.websocket_connector_shared_data)
        self.fastapi_server = FastApiServer(self.fastapi_server_shared_data)
        self.cameras_system = CamerasSystem(self.cameras_system_shared_data)

        # helper instances
        self.materials_library_helper = None
        if (self._config.machine_type == constants.MACHINE_TYPES['LASER_CUTTER']):
            self.materials_library_helper = MaterialsLibraryHelper()

        # check if the user want to use ai image generator
        self.ai_helper = None
        if self._config.ai_configuration.use_ai_image_generator:
            self.ai_helper = AIHelper()

        self.jobs_manager = JobsManager()
        self.images_manager = ImagesManager()

        self.jobs_manager_helper = JobsManagerHelper(
            self.jobs_manager, self.materials_library_helper)
        self.images_manager_helper = ImagesManagerHelper(
            self.images_manager)

        self.usb_storage_monitor = USBStorageMonitor(
            self.jobs_manager, self.images_manager, self.websocket_connector_shared_data.websocket_write_queue)

        self.job_execution_timer = JobExecutionTimer()

        self.database_connection = DataBaseConnections(
            self.materials_library_helper, self.ai_helper)

        '''
        flags to check if the process is job execution and
        to check if the job is being executed
        to identify between multiple interactions the user may do before/during/after
        the job execution
        '''

        self._is_job_execute_process = False
        self._is_job_executing = False

    def start(self):
        try:
            print("Server is running...")

            # create a temporary folder to inform the interface that the server finish initializing
            self.create_init_server_tmp_file()

            # start all processes

            # Machine Connection
            self.machine_connector.start()
            machine_data_thread = threading.Thread(
                target=self.run_machine_data_handler)
            machine_data_thread.start()

            # Websocket Connection
            self.websocket_connector.start()
            websocket_thread = threading.Thread(
                target=self.run_websocket_handler)
            websocket_thread.start()

            # FastApi Server
            self.fastapi_server.start()
            rest_api_thread = threading.Thread(
                target=self.run_rest_api_handler)
            rest_api_thread.start()

            # Camera System
            if ((self._config.machine_type == constants.MACHINE_TYPES['LASER_CUTTER'] and
                    self._config.laser_cutter_settings.cameras_enabled) or
                (self._config.machine_type == constants.MACHINE_TYPES['CNC'] and
                 self._config.cnc_settings.cameras_enabled)):

                self.cameras_system.start()
                cameras_thread = threading.Thread(
                    target=self.run_cameras_handler)
                cameras_thread.start()

            # job execution
            job_execution_thread = threading.Thread(
                target=self.run_job_execution_handler)
            job_execution_thread.start()

            # start usb monitor
            self.usb_storage_monitor.start()

            # Join threads to wait for their completion
            machine_data_thread.join()
            websocket_thread.join()
            rest_api_thread.join()
            cameras_thread.join()
            job_execution_thread.join()

        except Exception as e:
            print("Server core error:", e)

        finally:
            # Stop the machine connector process
            self.machine_connector.terminate()
            self.machine_connector.join()
            # Stop the websocket connector process
            self.websocket_connector.terminate()
            self.websocket_connector.join()
            # Stop the fastapi server process
            self.fastapi_server.terminate()
            self.fastapi_server.join()

            # Stop the cameras system process
            if ((self._config.machine_type == constants.MACHINE_TYPES['LASER_CUTTER'] and
                    self._config.laser_cutter_settings.cameras_enabled) or
                (self._config.machine_type == constants.MACHINE_TYPES['CNC'] and
                 self._config.cnc_settings.cameras_enabled)):
                self.cameras_system.terminate()
                self.cameras_system.join()

    def run_websocket_handler(self):
        while self.websocket_connector.is_alive():
            self.handle_incoming_websocket_messages()
            time.sleep(constants.TIMEOUT)

    def run_machine_data_handler(self):
        while self.machine_connector.is_alive():
            self.handle_incoming_machine_data()
            time.sleep(constants.TIMEOUT)

    def run_rest_api_handler(self):
        while self.fastapi_server.is_alive():
            self.handle_rest_api_calls()
            time.sleep(constants.TIMEOUT)

    def run_job_execution_handler(self):
        while self.machine_connector.is_alive() and self.websocket_connector.is_alive():
            self.handle_job_execution()
            time.sleep(constants.TIMEOUT)

    def run_cameras_handler(self):
        while self.cameras_system.is_alive():
            self.handle_cameras_system()
            time.sleep(constants.TIMEOUT)

    def create_init_server_tmp_file(self):
        # Get the system's temporary directory
        temp_dir = tempfile.gettempdir()

        # Construct the full file path
        temp_file_path = os.path.join(
            temp_dir, constants.SERVER_READY_FILE_NAME)

        # Create and write to the temporary file
        with open(temp_file_path, 'w') as ready_file:
            ready_file.write("Server is ready")

    def handle_incoming_websocket_messages(self):
        # add data coming from user interface to serial write queue
        if not self.websocket_connector_shared_data.websocket_read_queue.empty():
            type, data = self.websocket_connector_shared_data.websocket_read_queue.get()

            # handle different type of data sent from user
            self.analyze_websocket_messages(type, data)

    def analyze_websocket_messages(self, type, data):
        # handle data send to serial
        command = data.get("command")
        if constants.REAL_TIME_COMMAND_DATA_TYPE == type:
            self.handle_real_time_commands(command)
        elif constants.NORMAL_COMMAND_DATA_TYPE == type:
            self.handle_normal_commands(command)
        elif constants.SERIAL_COMMAND_DATA_TYPE == type:
            self.handle_serial_commands(type, command)

    # handle real time commands

    def handle_real_time_commands(self, command):
        # received stop command from user
        if command == constants.GRBL_COMMAND_STOP:
            self.machine_connector.stop_machine()
            self.reset_the_core_system()
            self.job_execution_timer.stop()

        # received pause command from user
        elif command == constants.GRBL_COMMAND_PAUSE:
            self.update_job_execution_status()
            self.machine_connector.pause_machine()
            self.job_execution_timer.pause()

        # received resume command from user
        elif command == constants.GRBL_COMMAND_RESUME:
            self.update_job_execution_status()
            self.machine_connector.resume_machine()
            self.job_execution_timer.resume()

        else:
            self.machine_connector.add_to_serial_write_queue(constants.REAL_TIME_COMMANDS,
                                                             constants.HIGH_PRIORITY_COMMAND,
                                                             command)

        # convert response to json data
        res = WebsocketJsonData.parse_serial_command_to_json(command)
        self.send_to_interface_via_websocket(constants.SERIAL_COMMAND_DATA_TYPE,
                                             constants.HIGH_PRIORITY_COMMAND,
                                             res)

    # handle normal commands
    def handle_normal_commands(self, command):
        # received a homing command
        if command == constants.GRBL_COMMAND_HOMING:
            self.machine_connector.homing_machine()
            self.reset_the_core_system()

        # received a rest zero command
        elif command == constants.GRBL_COMMAND_RESET_ZERO:
            self.machine_connector.reset_zero()

        # received an unlock command
        elif command == constants.GRBL_COMMAND_UNLOCK:
            self.machine_connector.unlock_machine()
            self.reset_the_core_system()

        # received a soft reset command
        elif command == constants.GRBL_COMMAND_SOFT_RESET:
            self.machine_connector.stop_machine()
            self.reset_the_core_system()

        # rest of commands (jogging)
        else:
            self.machine_connector.add_to_serial_write_queue(
                constants.NORMAL_COMMAND_DATA_TYPE, constants.MIDDLE_PRIORITY_COMMAND, command)

        # convert response to json data
        res = WebsocketJsonData.parse_serial_command_to_json(command)
        self.send_to_interface_via_websocket(constants.NORMAL_COMMAND_DATA_TYPE,
                                             constants.MIDDLE_PRIORITY_COMMAND,
                                             res)

    # handle commands user want to send to serial

    def handle_serial_commands(self, type, command):
        if command in constants.REAL_TIME_COMMANDS:
            self.handle_real_time_commands(command)
        # rest of commands
        # add them to serial write and websocket queues
        else:
            self.send_to_machine_serial(type,
                                        constants.MIDDLE_PRIORITY_COMMAND,
                                        command)
            # convert to json data
            res = WebsocketJsonData.parse_serial_command_to_json(command)
            self.send_to_interface_via_websocket(constants.SERIAL_COMMAND_DATA_TYPE,
                                                 constants.MIDDLE_PRIORITY_COMMAND,
                                                 res)

    def handle_rest_api_calls(self):
        if not self.fastapi_server_shared_data.fastapi_read_queue.empty():
            type, data = self.fastapi_server_shared_data.fastapi_read_queue.get()
            self.analyze_fastapi_requests(type, data)

    def analyze_fastapi_requests(self, type, data):
        if type == constants.JOBS_MANAGER_DATA_TYPE:
            self.handle_jobs_management_requests(data)
        if type == constants.IMAGES_MANAGER_DATA_TYPE:
            self.handle_images_management_requests(data)
        elif type == constants.AI_DATA_TYPE:
            self.handle_ai_requests(data)
        elif type == constants.MATERIALS_LIBRARY_DATA_TYPE:
            self.handle_materials_library_requests(data)

    # handle requests sent from user related to jobs management system
    def handle_jobs_management_requests(self, data):
        try:
            process = data.get("process")
            # handle uploading file
            if constants.UPLOAD_JOB_PROCESS == process:
                filename = data.get("filename")
                file_content = data.get("file_content")
                response = self.jobs_manager_helper.handle_upload_file(
                    filename, file_content)

                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            # handle open file
            elif constants.OPEN_JOB_PROCESS == process:
                filename = data.get("filename")
                response = self.jobs_manager_helper.handle_open_file(filename)

                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            # handle start file
            elif constants.START_JOB_PROCESS == process:
                response = self.jobs_manager_helper.handle_start_file(
                    self.machine_connector, self.job_execution_timer)
                # change the flags to true while executing a file
                self._is_job_execute_process = True
                self._is_job_executing = True

                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            # handle rename file
            elif constants.RENAME_JOB_PROCESS == process:
                old_filename = data.get("old_filename")
                new_filename = data.get("new_filename")
                response = self.jobs_manager_helper.handle_rename_file(
                    old_filename, new_filename)

                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            # handle deleting file
            elif constants.DELETE_JOB_PROCESS == process:
                filename = data.get("filename")
                response = self.jobs_manager_helper.handle_delete_file(
                    filename)

                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            # handle downloading file
            elif constants.DOWNLOAD_JOB_PROCESS == process:
                filename = data.get("filename")
                file_path = self.jobs_manager_helper.handle_download_file(
                    filename)
                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    file_path)

            # handle generating files only for laser cutters
            elif (constants.GENERATE_JOB_PROCESS == process and
                  self._config.machine_type == constants.MACHINE_TYPES['LASER_CUTTER']):

                gcode_settings = data.get("gcode_settings")
                cutting_svg_file_content = data.get("cutting_svg_file_content")
                marking_svg_file_content = data.get("marking_svg_file_content")
                image_file_content = data.get("image_file_content")

                self.jobs_manager_helper.handle_generate_gcode_file(
                    cutting_svg_file_content, marking_svg_file_content, image_file_content, gcode_settings, self.fastapi_server_shared_data.fastapi_write_queue)

            elif (process == constants.CANCEL_GENERATE_JOB_PROCESS and
                  self._config.machine_type == constants.MACHINE_TYPES['LASER_CUTTER']):
                response = self.jobs_manager_helper.handle_cancel_generate_file()
                # This response message will be fetch by the generate service to send an empty file response
                # whereas the cancel response will be empty body response
                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            # handle check opened file
            elif constants.CHECK_JOB_PROCESS == process:
                response = self.jobs_manager_helper.handle_check_opened_file()
                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

             # handle copy job file from usb to jobs manager storage
            elif constants.UPLOAD_USB_JOB_FILE_PROCESS == process:
                file_path = data.get("file_path")
                response = self.jobs_manager_helper.handle_copy_file_to_system(
                    file_path)

                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            # unknown request
            else:
                raise Exception('Unknown type of request')

            # update the status of the file manager to all connected clients
            self.distribute_job_manager_message_to_all_clients()

        # incase of any error in the system
        except Exception as error:
            print("FastAPI Jobs Manager Response Error: ", error)
            process = data.get("process")
            response = self.jobs_manager_helper.handle_error_requests(
                process)
            self.fastapi_server_shared_data.fastapi_write_queue.put(response)

    def handle_job_execution(self):
        '''
        incase the user is starting a file, execute a single line in every loop
        to make sure always checking the status of the machine after executing the command
        Also, when the machine is ready to receive new command
        to prevent sending all the commands at once and fill the machine
        buffer to max
        '''
        if (self._is_job_executing and
                self.machine_connector.is_machine_ready()):

            self.execute_line()

    # this function will execute the next line in the executed file
    def execute_line(self):
        # get the next command in the file
        line = self.jobs_manager.get_next_line()

        # The system did not finish executing the file
        if line is not None:
            self.send_to_machine_serial(constants.SERIAL_COMMAND_DATA_TYPE,
                                        constants.LOW_PRIORITY_COMMAND,
                                        line)

            # Add the command that is sent to machine to websocket, so that it will be shown to user being executed
            line_index = self.jobs_manager.get_line_index()
            total_lines = self.jobs_manager.get_total_lines()
            file_timer = self.job_execution_timer.get_elapsed_time()
            res = WebsocketJsonData.parse_job_execution_command_to_json(
                line, line_index, total_lines, file_timer)

            self.send_to_interface_via_websocket(constants.JOB_EXECUTION_DATA_TYPE,
                                                 constants.MIDDLE_PRIORITY_COMMAND,
                                                 res)

        # no remaining lines
        else:
            # reset
            self._is_job_execute_process = False
            self._is_job_executing = False
            self.machine_connector.reset_counter()
            self.job_execution_timer.stop()

    # handle requests sent from user related to images management system
    def handle_images_management_requests(self, data):
        try:
            process = data.get("process")

            # handle list images data
            if constants.LIST_IMAGES_DATA_PROCESS == process:
                response = self.images_manager_helper.handle_list_images_data()
                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            # handle uploading images
            elif constants.UPLOAD_IMAGE_PROCESS == process:
                image_name = data.get("image_name")
                image_content = data.get("image_content")
                response = self.images_manager_helper.handle_upload_image(
                    image_name, image_content)

                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            # handle fetch image data
            elif constants.FETCH_IMAGE_DATA_PROCESS == process:
                image_name = data.get("image_name")
                response = self.images_manager_helper.handle_fetch_image_data(
                    image_name)

                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            # handle rename image
            elif constants.RENAME_IMAGE_PROCESS == process:
                old_image_name = data.get("old_image_name")
                new_image_name = data.get("new_image_name")
                response = self.images_manager_helper.handle_rename_file(
                    old_image_name, new_image_name)

                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            # handle deleting image
            elif constants.DELETE_IMAGE_PROCESS == process:
                image_name = data.get("image_name")
                response = self.images_manager_helper.handle_delete_image(
                    image_name)

                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            # handle check opened file
            elif constants.FETCH_IMAGE_DATA_PROCESS == process:
                image_name = data.get("image_name")
                response = self.images_manager_helper.handle_fetch_image_data(
                    image_name)

                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

             # handle copy image file from usb to images manager storage
            elif constants.UPLOAD_USB_IMAGE_FILE_PROCESS == process:
                image_path = data.get("image_path")
                response = self.images_manager_helper.handle_copy_image_to_system(
                    image_path)

                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            # unknown request
            else:
                raise Exception('Unknown type of request')

        # incase of any error in the system
        except Exception as error:
            print("FastAPI Images Manager Response Error: ", error)
            process = data.get("process")
            response = self.images_manager_helper.handle_error_requests(
                process)
            self.fastapi_server_shared_data.fastapi_write_queue.put(response)

    def handle_ai_requests(self, data):
        try:
            process = data.get("process")
            if process == constants.AI_GENERATE_IMAGES_PROCESS:
                ai_generator_setting_data = data.get("ai_generator_settings")
                # passing the queue because it will run on seperate process
                self.ai_helper.handle_generate_ai_images(
                    ai_generator_setting_data, self.fastapi_server_shared_data.fastapi_write_queue)

            elif process == constants.AI_CANCEL_GENERATE_IMAGES_PROCESS:
                response = self.ai_helper.handle_cancel_generate_images()
                # This response message will be fetch by the generate service to send an empty images response
                # whereas the cancel response will be empty body response
                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            elif process == constants.CONFIG_AI_SETTINGS_PROCESS:
                response = self.ai_helper.handle_get_ai_config_data()
                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            elif process == constants.ADD_AI_SETTING_PROCESS:
                ai_setting_data = data.get("ai_settings")
                response = self.ai_helper.handle_add_new_ai_setting(
                    ai_setting_data)
                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            elif process == constants.DELETE_AI_SETTING_PROCESS:
                ai_setting_id = data.get("ai_setting_id")
                response = self.ai_helper.handle_delete_ai_setting(
                    ai_setting_id)
                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            elif process == constants.UPDATE_AI_SETTING_PROCESS:
                ai_setting_data = data.get("ai_settings")
                response = self.ai_helper.handle_update_ai_setting(
                    ai_setting_data)
                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            # unknown request
            else:
                raise Exception('Unknown type of request')

        except Exception as error:
            print("FastAPI AI Manager Response Error: ", error)
            process = data.get("process")
            response = self.ai_helper.handle_error_requests(process)

            self.fastapi_server_shared_data.fastapi_write_queue.put(response)

    def handle_materials_library_requests(self, data):
        try:
            process = data.get("process")
            if process == constants.LIST_MATERIAL_PROCESS:
                response = self.materials_library_helper.handle_get_materials_list()

                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            elif process == constants.ADD_MATERIAL_PROCESS:
                material_data = data.get("material_data")
                response = self.materials_library_helper.handle_add_new_material(
                    material_data)

                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            elif process == constants.UPDATE_MATERIAL_PROCESS:
                material_data = data.get("material_data")
                response = self.materials_library_helper.handle_update_material(
                    material_data)

                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            elif process == constants.DELETE_MATERIAL_PROCESS:
                material_id = data.get("material_id")
                response = self.materials_library_helper.handle_delete_material(
                    material_id)

                self.fastapi_server_shared_data.fastapi_write_queue.put(
                    response)

            # unknown request
            else:
                raise Exception('Unknown type of request')

        except Exception as error:
            print("FastAPI Material Library Manager Response Error: ", error)
            process = data.get("process")
            response = self.materials_library_helper.handle_error_requests(
                process)

            self.fastapi_server_shared_data.fastapi_write_queue.put(response)

    # This function will update the status of the file manager to all connected clients
    def distribute_job_manager_message_to_all_clients(self):
        opened_filename = self.jobs_manager.get_open_filename()
        files_list = self.jobs_manager.get_files_list()
        res = WebsocketJsonData.parse_file_manager_message_to_json(
            opened_filename, files_list)
        self.send_to_interface_via_websocket(
            constants.JOBS_MANAGER_DATA_TYPE, constants.LOW_PRIORITY_COMMAND, res)

    def handle_incoming_machine_data(self):
        # The serial read queue is not empty
        if not self.machine_connector_shared_data.serial_read_queue.empty():
            type, data = self.machine_connector_shared_data.serial_read_queue.get()

            # initial json data
            res = json.dumps({})
            if type == constants.MACHINE_STATUS_DATA_TYPE:
                res = WebsocketJsonData.parse_grbl_status_to_json(data)

            elif type == constants.SERIAL_COMMAND_DATA_TYPE:
                res = WebsocketJsonData.parse_serial_command_to_json(data)

            elif type == constants.MACHINE_CONNECTION_DATA_TYPE:
                res = WebsocketJsonData.parse_connection_status_to_json(
                    data)

            elif type == constants.JOYSTICK_STATUS_DATA_TYPE:
                res = WebsocketJsonData.parse_joystick_status_to_json(data)

            if res:
                self.send_to_interface_via_websocket(
                    type,
                    constants.MIDDLE_PRIORITY_COMMAND,
                    res)

    def handle_cameras_system(self):
        if not self.cameras_system_shared_data.cameras_read_queue.empty():
            cameras_frame = self.cameras_system_shared_data.cameras_read_queue.get()

            res = WebsocketJsonData.parse_cameras_frame_to_json(
                cameras_frame)

            self.send_to_interface_via_websocket(constants.CAMERAS_SYSTEM_STREAM_DATA_TYPE,
                                                 constants.MIDDLE_PRIORITY_COMMAND,
                                                 res)

    def send_to_machine_serial(self, type, priority, data):
        self.machine_connector.add_to_serial_write_queue(type,
                                                         priority,
                                                         data)

    def send_to_interface_via_websocket(self, type, priority, data):
        self.websocket_connector.add_to_websocket_write_queue(
            type, priority, data)

    def update_job_execution_status(self):
        if self._is_job_execute_process:
            self._is_job_executing = not self._is_job_executing

    def reset_the_core_system(self):
        self._is_job_execute_process = False
        self._is_job_executing = False
        # reset the line index to the begging of the file
        self.jobs_manager.reset_line_index()
