import time
from decouple import config
from file_management.gcode_file_manager import GCodeFileManager
from machine_connector.machine_connector import MachineConnector
from utils.shared_data import SharedMachineData, SharedWebsocketData
from utils.common_methods import CommonMethods
from websocket_connector.websocket_server import WebSocketServer
from .constants import CoreConstants as constants

# ServerCore is a module that manage all the services in the machine server
# Orchestrating the whole system


class ServerCore:

    def __init__(self):

        # shared data with processes
        self.machine_connector_data = SharedMachineData()
        self.websocket_server_data = SharedWebsocketData()

        # instance for each process
        self.machine_connector = MachineConnector(self.machine_connector_data)
        self.websocket_server = WebSocketServer(self.websocket_server_data)

        # regular instance
        self.gcode_file_manager = GCodeFileManager()
        self.common_methods = CommonMethods()

        '''
        flags to check if the process is file execution and
        to check if the file is being executed
        to identify between multiple interactions the user may do before/during/after
        the file execution
        '''

        self._is_file_execute_process = False
        self._is_file_executing = False

        # attributes
        self.current_refresh_file_time = time.time()

    def start(self):
        try:
            if config('ENV') == "development":
                print("Server core Started")

            # start all processes
            self.machine_connector.start()
            self.websocket_server.start()

            while self.machine_connector.is_alive() or self.websocket_server.is_alive():
                # Check for incoming messages from the user to be handled
                self.handle_incoming_user_data()

                # Check for incoming messages from the machine to be handled
                self.handle_incoming_machine_data()

                # Check the list of gcode files in the system
                self.handle_files_listing()

                # Check if there is a file getting executed
                self.handle_file_execution()

                # Delay to reduce the cpu usage
                time.sleep(constants.TIMEOUT)

        except Exception as e:
            print("Server core error:", e)

        finally:
            # Stop the machine connector process
            self.machine_connector.terminate()
            self.machine_connector.join()
            # Stop the websocket server process
            self.websocket_server.terminate()
            self.websocket_server.join()

    def handle_incoming_user_data(self):
        # add data coming from user interface to serial write queue
        if not self.websocket_server_data.websocket_read_queue.empty():
            data = self.websocket_server_data.websocket_read_queue.get()

            # handle different type of data sent from user
            self.analyze_user_data(data)

    def analyze_user_data(self, data):
        # handle data send to serial
        if constants.SERIAL_PREFIX in data:
            self.handle_serial_commands(data)

        # handle file commands from user
        elif constants.FILE_PREFIX in data:
            self.handle_file_management_commands(data)

    # handle commands user want to send to serial

    def handle_serial_commands(self, data):
        # remove serial commands prefix and send it to serial
        serial_command = data.removeprefix(constants.SERIAL_PREFIX)

        # received stop command from user
        if serial_command == constants.GRBL_COMMAND_STOP:
            self.machine_connector.stop_machine()
            self.reset_the_core_system()

        # received a homing command
        elif serial_command == constants.GRBL_COMMAND_HOMING:
            self.machine_connector.homing_machine()
            self.reset_the_core_system()

        # received pause command from user
        elif serial_command == constants.GRBL_COMMAND_PAUSE:
            self.update_file_execution_status()
            self.machine_connector.pause_machine()

        # received resume command from user
        elif serial_command == constants.GRBL_COMMAND_RESUME:
            self.update_file_execution_status()
            self.machine_connector.resume_machine()

        elif serial_command == constants.GRBL_RESET_ZERO:
            self.machine_connector.reset_zero()

        # rest of commands
        # add them to serial write queue
        else:
            self.machine_connector.add_to_serial_write_queue(constants.MIDDLE_PRIORITY_COMMAND,
                                                             serial_command)

    # handle commands sent from user related to file management system
    def handle_file_management_commands(self, data):
        # remove file prefix from data
        data = data.removeprefix(constants.FILE_PREFIX)

        # handle uploading file
        if constants.FILENAME_PREFIX in data:
            self.handle_uploaded_file(data)
        # handle open file
        elif constants.OPEN_FILE_PREFIX in data:
            self.handle_open_file(data)

        # handle start file
        elif constants.START_FILE_PREFIX in data:
            self.handle_start_file()

        elif constants.CLOSE_FILE_PREFIX in data:
            self.handle_close_file()

        # handle deleting file
        elif constants.DELETE_FILE_PREFIX in data:
            self.handle_delete_file(data)

    def handle_uploaded_file(self, data):
        # Process the data line by line using a generator
        data_generator = (line for line in data.split('\n'))

        # Extract the file name by removing the FILENAME_PREFIX
        filename = next(data_generator).removeprefix(constants.FILENAME_PREFIX)

        # Extract the G-code data (excluding the first line)
        gcode_data = '\n'.join(data_generator)

        # Create a new file with the same name of the file uploaded
        self.gcode_file_manager.write_gcode_file(gcode_data, filename)

        # Send log message to the user
        log_entry = constants.FRONTEND_CONSOLE_PREFIX + \
            self.common_methods.log_message(constants.FILE_UPLOAD_MESSAGE +
                                            constants.NEW_LINE)

        self.websocket_server.add_to_websocket_write_queue(
            constants.MIDDLE_PRIORITY_COMMAND, log_entry)

    # open selected file by user
    def handle_open_file(self, data):
        filename = data.removeprefix(constants.OPEN_FILE_PREFIX)
        self.gcode_file_manager.open_file(filename)

        # send the opened file name to websocket
        self.websocket_server.add_to_websocket_write_queue(constants.MIDDLE_PRIORITY_COMMAND,
                                                           constants.FRONTEND_FILE_OPENED_STATUS + filename)

        # send log message to user
        log_entry = constants.FRONTEND_CONSOLE_PREFIX + \
            self.common_methods.log_message(
                constants.FILE_OPEN_MESSAGE + constants.NEW_LINE)

        self.websocket_server.add_to_websocket_write_queue(constants.MIDDLE_PRIORITY_COMMAND,
                                                           log_entry)

    # start executing the gcode commands inside the opened file
    def handle_start_file(self):
        opened_file = self.gcode_file_manager.get_open_filename()
        # make sure the file is open
        if opened_file is not None:
            # reopen in case of restarting the file again
            self.gcode_file_manager.open_file(opened_file)
            # send log message to user
            log_entry = constants.FRONTEND_CONSOLE_PREFIX + \
                self.common_methods.log_message(
                    constants.FILE_START_MESSAGE + constants.NEW_LINE)
            self.websocket_server.add_to_websocket_write_queue(constants.MIDDLE_PRIORITY_COMMAND,
                                                               log_entry)

            # change the flags to true while executing a file
            self._is_file_execute_process = True
            self._is_file_executing = True

            # when start executing file reset the counter
            self.machine_connector.reset_counter()

        else:
            print('There is no file open in the system')

            # send log message to user
            log_entry = constants.FRONTEND_CONSOLE_PREFIX + \
                self.common_methods.log_message(
                    constants.FILE_START_ERROR + constants.NEW_LINE)
            self.websocket_server.add_to_websocket_write_queue(constants.MIDDLE_PRIORITY_COMMAND,
                                                               log_entry)

            # change the flag to false if there is no file opened
            self._is_file_execute_process = False
            self._is_file_executing = False

    # close the opened file
    def handle_close_file(self):
        filename = self.gcode_file_manager.get_open_filename()
        if filename:
            # close the file
            self.gcode_file_manager.close_file()

            # send the closed file name to frontend
            self.websocket_server.add_to_websocket_write_queue(constants.MIDDLE_PRIORITY_COMMAND,
                                                               constants.FRONTEND_FILE_CLOSED_STATUS + filename)

            # reset the file execution flags
            self._is_file_execute_process = False
            self._is_file_executing = False

            # send log message to user
            log_entry = constants.FRONTEND_CONSOLE_PREFIX + \
                self.common_methods.log_message(
                    constants.FILE_CLOSE_MESSAGE + constants.NEW_LINE)
            self.websocket_server.add_to_websocket_write_queue(constants.MIDDLE_PRIORITY_COMMAND,
                                                               log_entry)

        else:
            print('file not found in the system')

    # delete specific file base on its name
    def handle_delete_file(self, data):
        filename = data.removeprefix(constants.DELETE_FILE_PREFIX)

        # remove the open file name from Frontend(user-interface)
        self.websocket_server.add_to_websocket_write_queue(constants.MIDDLE_PRIORITY_COMMAND,
                                                           constants.FRONTEND_FILE_CLOSED_STATUS)

        # delete the file from the system
        self.gcode_file_manager.delete_file(filename)

        # send log message to user
        log_entry = constants.FRONTEND_CONSOLE_PREFIX + \
            self.common_methods.log_message(constants.FILE_DELETE_MESSAGE +
                                            constants.NEW_LINE)
        self.websocket_server.add_to_websocket_write_queue(constants.MIDDLE_PRIORITY_COMMAND,
                                                           log_entry)

    def handle_incoming_machine_data(self):
        # The serial read queue is not empty
        if not self.machine_connector_data.serial_read_queue.empty():
            data = self.machine_connector_data.serial_read_queue.get()

            # check if there is data to process
            if data:
                # stop executing the rest of the file in case of an error
                # and clear the serial write queue
                if constants.GRBL_ANSWER_ERROR in data:
                    self.machine_connector.stop_machine()
                    self.reset_the_core_system()

                # show log message
                log_entry = constants.FRONTEND_CONSOLE_PREFIX + \
                    self.common_methods.log_message(data) + constants.NEW_LINE

                self.websocket_server.add_to_websocket_write_queue(
                    constants.MIDDLE_PRIORITY_COMMAND,
                    log_entry)

    def handle_files_listing(self):
        # Refresh every specific time interval
        if (time.time() - self.current_refresh_file_time >
                constants.DIRECTORY_LISTING_REFRESH_INTERVAL):

            # always check if there is an open file
            # in case the user decided to refresh the browser
            self.handle_opened_filename()

            self.current_refresh_file_time = time.time()
            gcode_files = self.gcode_file_manager.get_file_listing()

            # start the list with the prefix for the file list
            file_list = constants.FRONTEND_LIST_FILE_PREFIX
            if len(gcode_files) > 0:
                for index, file in enumerate(gcode_files):
                    # don't add the last new line in the list
                    if index == len(gcode_files) - 1:
                        file_list += file
                    else:
                        file_list += file + constants.NEW_LINE

                # Add the file_list data to the websocket_write_queue to be send to user
                self.websocket_server.add_to_websocket_write_queue(constants.MIDDLE_PRIORITY_COMMAND,
                                                                   file_list)

    # incase of refreshing the browser, show the user which file is already open
    def handle_opened_filename(self):
        # check if there is already an opened file in the system
        opened_filename = self.gcode_file_manager.get_open_filename()
        if opened_filename is not None:
            # send the name to websocket
            self.websocket_server.add_to_websocket_write_queue(constants.MIDDLE_PRIORITY_COMMAND,
                                                               constants.FRONTEND_FILE_OPENED_STATUS + opened_filename)

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
                self.machine_connector.add_to_serial_write_queue(constants.LOW_PRIORITY_COMMAND,
                                                                 gcode_command)

            # not a valid gcode command repeat the process to get the next line
            else:
                self.execute_line()

        # no remaining lines
        else:
            # reset
            self._is_file_execute_process = False
            self._is_file_executing = False
            self.machine_connector.reset_counter()

    def update_file_execution_status(self):
        if self._is_file_execute_process:
            self._is_file_executing = not self._is_file_executing

    def reset_the_core_system(self):
        self._is_file_execute_process = False
        self._is_file_executing = False
        # reset the line index to the begging of the file
        self.gcode_file_manager.reset_line_index()
