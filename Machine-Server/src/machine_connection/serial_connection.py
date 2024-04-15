import glob
import sys
import time
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
        available_ports = self.serial_ports()
        for port in available_ports:
            ser = serial.Serial(port=port,
                                baudrate=constants.SERIAL_BAUDRATE,
                                timeout=constants.TIMEOUT)
            # make sure we are connecting to the right controller by sending a command
            # and receive data from the controller
            if self.is_connected_to_controller(ser):
                # set the serial connection
                self._serial_connection = ser
                self._is_connected = True

                if config('ENV') == 'development':
                    print(f"Serial connected")
                    print("Serial Settings:")
                    print("-> Port:", port)
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

    def serial_ports(self):
        """ Lists serial port names

            :raises EnvironmentError:
                On unsupported or unknown platforms
            :returns:
                A list of the serial ports available on the system
        """
        if sys.platform.startswith('win'):
            ports = ['COM%s' % (i + 1) for i in range(256)]
        elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
            # this excludes your current terminal "/dev/tty"
            ports = glob.glob('/dev/tty[A-Za-z]*')
        elif sys.platform.startswith('darwin'):
            ports = glob.glob('/dev/tty.*')
        else:
            raise EnvironmentError('Unsupported platform')

        result = []
        for port in ports:
            try:
                s = serial.Serial(port)
                s.close()
                result.append(port)
            except (OSError, serial.SerialException):
                pass
        return result

    def is_serial_connected(self):
        return self._is_connected

    # make sure that the serial is waiting to send data back
    def is_serial_waiting(self):
        return self._serial_connection.in_waiting

    def write_to_serial(self, data):
        try:
            self._serial_connection.write((data + constants.NEWLINE).encode())
        except serial.SerialTimeoutException:
            print("Write operation timed out")
            self.disconnect_serial()
            while not self.is_serial_connected():
                print('Trying to connect to serial...')
                time.sleep(1)

                # retry to run the process again
                self.connect_to_serial()

    def read_from_serial(self):
        try:
            if self._serial_connection.in_waiting > 0:
                return self._serial_connection.readline().decode("utf-8").strip()
            else:
                return None  # No data available
        except Exception as e:
            print("Error reading from serial:", e)
            return None  # Handle the error gracefully

    # Close the serial connection

    def disconnect_serial(self):
        if self._is_connected:
            self._serial_connection.close()
            self._serial_connection = None
            self._is_connected = False
            print("Serial is disconnected")

        else:
            print("Serial is already disconnected")
