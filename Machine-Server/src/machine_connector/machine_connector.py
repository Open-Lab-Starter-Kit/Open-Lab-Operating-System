from multiprocessing import Process
import time
from decouple import config

from .serial_connection import SerialConnection
from .constants import MachineConstants as constants

# Special module to control the machine command execution


class MachineConnector(Process):
    def __init__(self, machine_connector_data):
        super(MachineConnector, self).__init__()

        # shared objects dictionary with the core
        self.machine_connector_data = machine_connector_data

        # instance of the serial connection
        self._serial_connection = SerialConnection()

        # Get the current time seconds
        self._current_refresh_status_time = time.time()

    def run(self):
        try:
            # start serial connection
            self._serial_connection.connect_to_serial()

            if self._serial_connection.is_serial_connected():
                self.start_machine_communication()

            else:
                print("There is no serial connection")
                self.reconnect_to_serial()

        except Exception as error:
            print("Serial Connection Error:", error)
            self._serial_connection.disconnect_serial()
            self.reconnect_to_serial()

        finally:
            self._serial_connection.disconnect_serial()
            self._serial_connection.disconnect_serial()
            self.reconnect_to_serial()

    # Start fetching and sending data
    def start_machine_communication(self):
        # disable the pico from fetching the status during the tool change
        # because the server will ask for it (prevent overflowing the buffer)
        self.handle_tool_change_status(enabled=False)
        self.reset_counter()

        while True:
            self.handle_writing_to_serial()
            self.handle_reading_from_serial()
            self.handle_machine_status()

            print(
                f'is_tool_change: {self.machine_connector_data.is_tool_change}\n')
            print(
                f'is_machine_pause: {self.machine_connector_data.is_machine_pause}\n')
            print(
                f'ok_counter: {self.machine_connector_data.ok_messages_counter}\n')
            print(
                "######################################################################")

    # This method is to enable/disable the pico controller from fetching the status
    def handle_tool_change_status(self, enabled):
        if enabled:
            self._serial_connection.write_to_serial(
                constants.PICO_ENABLE_STATUS)
        else:
            self._serial_connection.write_to_serial(
                constants.PICO_DISABLE_STATUS)

    # Writing data to the serial port
    def handle_writing_to_serial(self):
        '''
        make sure that the queue is not empty and 
        all the command in the machine got executed
        and the machine is not changing the tool to not overflow the buffer
        '''

        if not self.machine_connector_data.serial_write_queue.empty():
            gcode_command = self.machine_connector_data.serial_write_queue.get()
            if gcode_command:
                # increase the counter to wait for
                # an ok message after sending a command to the machine
                self.machine_connector_data.ok_messages_counter += 1

                # check if the command is tool change
                if constants.GRBL_COMMAND_TOOL_CHANGE in gcode_command:
                    self.machine_connector_data.is_tool_change = True

                self._serial_connection.write_to_serial(gcode_command)

                '''
                Add the command that is sent to machine to the read queue
                so that it will be shown to user being executed in the console
                Plus, no need to show status command to user
                '''
                if gcode_command != constants.GRBL_COMMAND_STATUS:
                    self.add_to_serial_read_queue(constants.MIDDLE_PRIORITY_COMMAND,
                                                  constants.COMMAND_EXECUTE + gcode_command)

    # Reading data from the serial
    def handle_reading_from_serial(self):
        # read incoming bytes from serial and convert it to string
        data_to_fetch = self._serial_connection.read_from_serial()
        if data_to_fetch:
            if data_to_fetch == constants.GRBL_ANSWER_OK:
                # decrease the counter because the machine replied
                # with an ok message after sending a command to the machine
                self.machine_connector_data.ok_messages_counter -= 1
                # prevent continuing the process to stop adding ok messages to queue
                return

            elif constants.TOOL_CHANGER_SUCCESS == data_to_fetch:
                # check if the machine finished changing the tool
                # it will reply with TOCK message
                self.machine_connector_data.is_tool_change = False
                # reset the counter after tool change because the pico will
                # execute different commands where the server will not count
                self.reset_counter()

            elif constants.TOOL_CHANGER_ERROR == data_to_fetch:
                # Error happened during changing the tool
                if config('ENV') == 'development':
                    print('Error happened during changing the tool')
                self.stop_machine()

            self.add_to_serial_read_queue(constants.MIDDLE_PRIORITY_COMMAND,
                                          data_to_fetch)

    def handle_machine_status(self):
        # Refresh every specific time interval
        time_interval = constants.STATUS_REFRESH_INTERVAL_PAUSE if self.machine_connector_data.is_machine_pause else constants.STATUS_REFRESH_INTERVAL_RUN
        if time.time() - self._current_refresh_status_time > time_interval:
            self.update_status()

    def update_status(self):
        # Update the time
        self._current_refresh_status_time = time.time()

        # Stop asking the status after a specific value
        if self.machine_connector_data.ok_messages_counter <= constants.MAX_COUNTER_VALUE:
            # Send a status command to the machine
            self.add_to_serial_write_queue(
                constants.MIDDLE_PRIORITY_COMMAND, constants.GRBL_COMMAND_STATUS)

    # add new command to the serial write queue
    def add_to_serial_write_queue(self, priority, command):
        self.machine_connector_data.serial_write_queue.put(
            priority, command)

    # add new command to the serial read queue
    def add_to_serial_read_queue(self, priority, command):
        self.machine_connector_data.serial_read_queue.put(priority, command)

    def homing_machine(self):
        self.reset_the_machine_system()

        # add stop command to the queue so that the serial will get notified
        self.add_to_serial_write_queue(constants.HIGH_PRIORITY_COMMAND,
                                       constants.GRBL_HOMING)

    def pause_machine(self):
        self.machine_connector_data.is_machine_pause = True
        # add pause command to the queue so that the serial will get notified
        self.add_to_serial_write_queue(constants.HIGH_PRIORITY_COMMAND,
                                       constants.GRBL_COMMAND_PAUSE)

        # update the status directly to prevent the delay in the interface (1 second while pause)
        self.add_to_serial_write_queue(constants.MIDDLE_PRIORITY_COMMAND,
                                       constants.GRBL_COMMAND_STATUS)

    def stop_machine(self):
        # reset the system
        self.reset_the_machine_system()

        # add stop command to the queue so that the serial will get notified
        self.add_to_serial_write_queue(constants.HIGH_PRIORITY_COMMAND,
                                       constants.GRBL_COMMAND_STOP)

    def resume_machine(self):
        self.machine_connector_data.is_machine_pause = False
        # add resume command to the queue so that the serial will get notified
        self.add_to_serial_write_queue(constants.HIGH_PRIORITY_COMMAND,
                                       constants.GRBL_COMMAND_RESUME)

    def reset_zero(self):
        self.reset_counter()
        # add reset zero command to the queue so that the serial will get notified
        self.add_to_serial_write_queue(constants.HIGH_PRIORITY_COMMAND,
                                       constants.GRBL_RESET_ZERO)

    def reset_the_machine_system(self):
        self.machine_connector_data.is_tool_change = False
        self.machine_connector_data.is_machine_pause = False
        self.reset_counter()
        self.flush_write_queue()
        self.flush_read_queue()

    def reset_counter(self):
        self.machine_connector_data.ok_messages_counter = 0

    # delete all the elements inside the write queue
    def flush_write_queue(self):
        # clear the write queue
        while not self.machine_connector_data.serial_write_queue.empty():
            self.machine_connector_data.serial_write_queue.get()

    # delete all the elements inside the read queue
    def flush_read_queue(self):
        # clear the write queue
        while not self.machine_connector_data.serial_read_queue.empty():
            self.machine_connector_data.serial_read_queue.get()

    # Handshake custom protocol to make sure that the
    # machine is ready to receive the next command
    def is_machine_ready(self):
        if (self.machine_connector_data.ok_messages_counter <= 0 and
            not self.machine_connector_data.is_tool_change and
                not self.machine_connector_data.is_machine_pause):
            return True

        return False

    # try to reconnect to serial incase of not detecting any device or
    # serial port is busy
    def reconnect_to_serial(self):
        while not self._serial_connection.is_serial_connected():
            print('Wait 5 seconds.Trying to connect to serial...')
            time.sleep(5)

            # retry to run the process again
            self.run()
