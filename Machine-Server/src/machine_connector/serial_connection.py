import serial
from decouple import config

import serial.tools.list_ports
from .constants import MachineConstants as constants
from decouple import config

# Serial connection with GRBL (inheriting Process)


class SerialConnection:
    def __init__(self):
        self._is_connected = False
        self._serial_connection = None

    # Test serial connection on different ports and baud_rates if exist
    def connect_to_serial(self):
        # check available serial ports in the operation system
        available_ports = serial.tools.list_ports.comports()
        for port in available_ports:
            ser = serial.Serial(port=port.device,
                                baudrate=constants.SERIAL_BAUDRATE,
                                timeout=constants.TIMEOUT)
            # make sure we are connecting to the right controller by sending a command
            # and receive data from the controller
            if self.is_connected_to_controller(ser):
                # set the serial connection
                self._serial_connection = ser
                self._is_connected = True

                print(f"Serial connected")

                if config('ENV') == 'development':
                    print("Serial Settings:")
                    print("-> Port:", port.device)
                    print("-> Baudrate:", constants.SERIAL_BAUDRATE)

                # stop when there is a connection available
                return

    # Check the connection to specific controller by sending machine position command !
    def is_connected_to_controller(self, ser):
        # Get the current position of the machine
        ser.write((constants.GRBL_COMMAND_STATUS + constants.NEWLINE).encode())
        # Reading data from the serial port
        data_from_serial = ser.readline().decode("utf-8").strip()

        if data_from_serial:
            if config('ENV') == 'development':
                print("====== Testing connection to controller ======")

            return True
        return False

    def is_serial_connected(self):
        return self._is_connected

    # make sure that the serial is waiting to send data back
    def is_serial_waiting(self):
        return self._serial_connection.in_waiting

    def write_to_serial(self, data):
        self._serial_connection.write((data + constants.NEWLINE).encode())

    def read_from_serial(self):
        return self._serial_connection.readline().decode("utf-8").strip()

    # Close the serial connection
    def disconnect_serial(self):
        if self._is_connected:
            self._serial_connection.close()
            self._serial_connection = None
            self._is_connected = False
            print("Serial is disconnected")

        else:
            print("Serial is already disconnected")
