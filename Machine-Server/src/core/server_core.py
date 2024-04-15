import json
import time
from file_management.file_manager import GCodeFileManager
from machine_connection.machine_connector import MachineConnector
from fastapi_server.main import FastApiServer
from camera_stream.cameras_system import CamerasSystem
from utils.file_execution_timer import FileExecutionTimer
from utils.json_parse import JsonParse
from utils.shared_data import SharedCamerasSystemData, SharedFastApiData, SharedMachineData, SharedWebsocketData
from utils.common_methods import CommonMethods
from websocket_connection.websocket_connector import WebSocketConnector
from .constants import CoreConstants as constants

# ServerCore is a module that manage all the services in the machine server
# Orchestrating the whole system


class ServerCore:

    def __init__(self):
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

        # regular instance
        self.gcode_file_manager = GCodeFileManager()

        # helper instances
        self.common_methods = CommonMethods()
        self.json_parse = JsonParse()
        self.file_execution_timer = FileExecutionTimer()

        '''
        flags to check if the process is file execution and
        to check if the file is being executed
        to identify between multiple interactions the user may do before/during/after
        the file execution
        '''

        self._is_file_execute_process = False
        self._is_file_executing = False

    def start(self):
        try:
            print("Server is running...")

            # start all processes
            self.machine_connector.start()
            self.websocket_connector.start()
            self.fastapi_server.start()
            self.cameras_system.start()

            while (self.machine_connector.is_alive() or
                   self.websocket_connector.is_alive() or
                   self.fastapi_server.is_alive()):

                # Check for incoming websocket messages from the user to be handled
                self.handle_incoming_websocket_messages()

                # Check for incoming messages from the machine to be handled
                self.handle_incoming_machine_data()

                # Check if there is any reset api requests
                self.handle_rest_api_calls()

                # Check if there is a file getting executed
                self.handle_file_execution()

                # Check cameras stream frames
                self.handle_cameras_system()

                # Delay to reduce the cpu usage
                time.sleep(constants.TIMEOUT)

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
            self.cameras_system.terminate()
            self.cameras_system.join()

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
            self.file_execution_timer.stop()

        # received pause command from user
        elif command == constants.GRBL_COMMAND_PAUSE:
            self.update_file_execution_status()
            self.machine_connector.pause_machine()
            self.file_execution_timer.pause()

        # received resume command from user
        elif command == constants.GRBL_COMMAND_RESUME:
            self.update_file_execution_status()
            self.machine_connector.resume_machine()
            self.file_execution_timer.resume()

        else:
            self.machine_connector.add_to_serial_write_queue(constants.REAL_TIME_COMMANDS,
                                                             constants.HIGH_PRIORITY_COMMAND,
                                                             command)

        # convert response to json data
        res = self.json_parse.parse_serial_command_to_json(command)
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
        res = self.json_parse.parse_serial_command_to_json(command)
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
            res = self.json_parse.parse_serial_command_to_json(command)
            self.send_to_interface_via_websocket(constants.SERIAL_COMMAND_DATA_TYPE,
                                                 constants.MIDDLE_PRIORITY_COMMAND,
                                                 res)

    def handle_rest_api_calls(self):
        if not self.fastapi_server_shared_data.fastapi_read_queue.empty():
            type, data = self.fastapi_server_shared_data.fastapi_read_queue.get()
            self.analyze_fastapi_requests(type, data)

    def analyze_fastapi_requests(self, type, data):
        if type == constants.FILE_MANAGER_DATA_TYPE:
            self.handle_file_management_requests(data)

    # handle requests sent from user related to file management system
    def handle_file_management_requests(self, data):
        try:
            process = data.get("process")

            # handle uploading file
            if constants.UPLOAD_FILE_PROCESS == process:
                file = data.get("file")
                content = data.get("content")
                self.handle_upload_file(file, content)

            # handle open file
            elif constants.OPEN_FILE_PROCESS == process:
                file = data.get("file")
                self.handle_open_file(file)

            # handle start file
            elif constants.START_FILE_PROCESS == process:
                self.handle_start_file()

            # handle rename file
            elif constants.RENAME_FILE_PROCESS == process:
                old_filename = data.get("old_filename")
                new_filename = data.get("new_filename")
                self.handle_rename_file(old_filename, new_filename)

            # handle deleting file
            elif constants.DELETE_FILE_PROCESS == process:
                file = data.get("file")
                self.handle_delete_file(file)

            # handle check opened file
            elif constants.CHECK_FILE_PROCESS == process:
                self.handle_check_opened_file()

            # update the status of the file manager to all connected clients
            self.distribute_file_manager_message_to_all_clients()

        # incase of any error in the system
        except Exception as error:
            response = self.fastapi_file_manager_response(
                type=constants.FILE_MANAGER_DATA_TYPE,
                process=process,
                message=error,
                file='',
                content='',
                files_list='',
                success=False
            )

            self.fastapi_server_shared_data.fastapi_write_queue.put(response)

    def handle_upload_file(self, file, content):
        # Create a new file with the same name of the file uploaded
        self.gcode_file_manager.write_gcode_file(file, content)
        response = self.fastapi_file_manager_response(
            type=constants.FILE_MANAGER_DATA_TYPE,
            process=constants.UPLOAD_FILE_PROCESS,
            message=constants.UPLOAD_FILE_MESSAGE,
            file=file,
            content=self.gcode_file_manager.get_opened_file_content(),
            files_list=self.gcode_file_manager.get_files_list(),
            success=True
        )

        self.fastapi_server_shared_data.fastapi_write_queue.put(response)

    # open selected file by user

    def handle_open_file(self, file):
        self.gcode_file_manager.open_file(file)
        response = self.fastapi_file_manager_response(
            type=constants.FILE_MANAGER_DATA_TYPE,
            process=constants.OPEN_FILE_PROCESS,
            message=constants.OPEN_FILE_MESSAGE,
            file=file,
            content=self.gcode_file_manager.get_opened_file_content(),
            files_list=self.gcode_file_manager.get_files_list(),
            success=True
        )

        self.fastapi_server_shared_data.fastapi_write_queue.put(response)

    # start executing the gcode commands inside the opened file
    def handle_start_file(self):
        opened_file = self.gcode_file_manager.get_open_filename()
        # make sure the file is open
        if opened_file is not None:
            # reopen in case of restarting the file again
            self.gcode_file_manager.open_file(opened_file)
            # change the flags to true while executing a file
            self._is_file_execute_process = True
            self._is_file_executing = True

            # when start executing file reset the counter
            self.machine_connector.reset_counter()

            # reset the file execution timer and start new one
            self.file_execution_timer.reset()
            self.file_execution_timer.start()

            # get opened file
            response = self.fastapi_file_manager_response(
                type=constants.FILE_MANAGER_DATA_TYPE,
                process=constants.START_FILE_PROCESS,
                message=constants.START_FILE_MESSAGE,
                file=opened_file,
                content=self.gcode_file_manager.get_opened_file_content(),
                files_list=self.gcode_file_manager.get_files_list(),
                success=True
            )

        else:
            print('There is no file open in the system')
            # get opened file
            response = self.fastapi_file_manager_response(
                type=constants.FILE_MANAGER_DATA_TYPE,
                process=constants.START_FILE_PROCESS,
                message=constants.START_FILE_ERROR,
                file='',
                content='',
                files_list=self.gcode_file_manager.get_files_list(),
                success=False
            )

        self.fastapi_server_shared_data.fastapi_write_queue.put(response)

    # delete specific file base on its name

    def handle_delete_file(self, file):
        # delete the file from the system
        self.gcode_file_manager.delete_file(file)

        response = self.fastapi_file_manager_response(
            type=constants.FILE_MANAGER_DATA_TYPE,
            process=constants.DELETE_FILE_PROCESS,
            message=constants.DELETE_FILE_MESSAGE,
            file=file,
            content=self.gcode_file_manager.get_opened_file_content(),
            files_list=self.gcode_file_manager.get_files_list(),
            success=True
        )

        self.fastapi_server_shared_data.fastapi_write_queue.put(response)

    def handle_rename_file(self, old_filename, new_filename):
        self.gcode_file_manager.rename_file(old_filename, new_filename)

        response = self.fastapi_file_manager_response(
            type=constants.FILE_MANAGER_DATA_TYPE,
            process=constants.RENAME_FILE_PROCESS,
            message=constants.RENAME_FILE_MESSAGE,
            file=new_filename,
            content=self.gcode_file_manager.get_opened_file_content(),
            files_list=self.gcode_file_manager.get_files_list(),
            success=True
        )

        self.fastapi_server_shared_data.fastapi_write_queue.put(response)

    def handle_check_opened_file(self):
        response = self.fastapi_file_manager_response(
            type=constants.FILE_MANAGER_DATA_TYPE,
            process=constants.CHECK_FILE_PROCESS,
            message=constants.CHECK_OPEN_FILE_MESSAGE,
            file=self.gcode_file_manager.get_open_filename(),
            content=self.gcode_file_manager.get_opened_file_content(),
            files_list=self.gcode_file_manager.get_files_list(),
            success=True
        )

        self.fastapi_server_shared_data.fastapi_write_queue.put(response)

    def fastapi_file_manager_response(self, type, process, message, file, content, files_list, success):
        return {
            'type': type,
            'data': {
                'process': process,
                'message': message,
                'file': file,
                'content': content,
                'filesList': files_list,
                'success': success
            }
        }

    # This function will update the status of the file manager to all connected clients
    def distribute_file_manager_message_to_all_clients(self):
        opened_filename = self.gcode_file_manager.get_open_filename()
        files_list = self.gcode_file_manager.get_files_list()
        res = self.json_parse.parse_file_manager_message_to_json(
            opened_filename, files_list)
        self.send_to_interface_via_websocket(
            constants.FILE_MANAGER_DATA_TYPE, constants.LOW_PRIORITY_COMMAND, res)

    def handle_incoming_machine_data(self):
        # The serial read queue is not empty
        if not self.machine_connector_shared_data.serial_read_queue.empty():
            type, data = self.machine_connector_shared_data.serial_read_queue.get()

            # initial json data
            res = json.dumps({})
            if type == constants.MACHINE_STATUS_DATA_TYPE:
                res = self.json_parse.parse_grbl_status_to_json(data)

            elif type == constants.SERIAL_COMMAND_DATA_TYPE:
                res = self.json_parse.parse_serial_command_to_json(data)

            elif type == constants.MACHINE_CONNECTION_DATA_TYPE:
                res = self.json_parse.parse_connection_status_to_json(data)

            self.send_to_interface_via_websocket(
                type,
                constants.MIDDLE_PRIORITY_COMMAND,
                res)

    def handle_file_execution(self):
        '''
        incase the user is starting a file, execute a single line in every loop
        to make sure always checking the status of the machine after executing the command
        Also, when the machine is ready to receive new command
        to prevent sending all the commands at once and fill the machine
        buffer to max
        '''
        if (self._is_file_executing and
                self.machine_connector.is_machine_ready()):

            self.execute_line()

    # this function will execute the next line in the executed file
    def execute_line(self):
        # get the next command in the file
        line = self.gcode_file_manager.get_next_line()

        # The system did not finish executing the file
        if line is not None:
            # get valid gcode command (exclude any unnecessary comments or lines)
            gcode_command = self.common_methods.filtered_commands(line)
            # valid gcode command
            if gcode_command:
                self.send_to_machine_serial(constants.SERIAL_COMMAND_DATA_TYPE,
                                            constants.LOW_PRIORITY_COMMAND,
                                            gcode_command)

                # Add the command that is sent to machine to websocket, so that it will be shown to user being executed
                line_index = self.gcode_file_manager.get_line_index()
                total_lines = self.gcode_file_manager.get_total_lines()
                file_timer = self.file_execution_timer.get_elapsed_time()
                res = self.json_parse.parse_file_execution_command_to_json(
                    gcode_command, line_index, total_lines, file_timer)

                self.send_to_interface_via_websocket(constants.FILE_EXECUTION_DATA_TYPE,
                                                     constants.MIDDLE_PRIORITY_COMMAND,
                                                     res)

            # not a valid gcode command repeat the process to get the next line
            else:
                self.execute_line()

        # no remaining lines
        else:
            # reset
            self._is_file_execute_process = False
            self._is_file_executing = False
            self.machine_connector.reset_counter()
            self.file_execution_timer.stop()

    def handle_cameras_system(self):
        if not self.cameras_system_shared_data.cameras_read_queue.empty():
            cameras_frame = self.cameras_system_shared_data.cameras_read_queue.get()

            res = self.json_parse.parse_cameras_frame_to_json(cameras_frame)

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

    def update_file_execution_status(self):
        if self._is_file_execute_process:
            self._is_file_executing = not self._is_file_executing

    def reset_the_core_system(self):
        self._is_file_execute_process = False
        self._is_file_executing = False
        # reset the line index to the begging of the file
        self.gcode_file_manager.reset_line_index()
