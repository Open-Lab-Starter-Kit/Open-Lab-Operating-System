import os
import numpy as np
from .constants import GCodeFileManagerConstants as constants

# This module is to handle all the functions related to gcode file management


class GCodeFileManager:
    def __init__(self):
        self._base_directory = constants.BASE_DIR
        self._opened_file = None

        # sum all the lines in the file in one string
        # the reason to use this method is to minimize the usage of memory in the system
        self._file_contents = ''

        # an indicator which represent which line the system is processing
        self._read_line_index = 0

    def get_file_listing(self):
        # Check if the base directory exists
        # if not create a directory
        if not os.path.exists(self._base_directory):
            os.makedirs(self._base_directory)

        file_list = [f for f in os.listdir(self._base_directory) if any(
            f.lower().endswith(ext) for ext in constants.GCODE_FILE_EXTENSIONS)]
        return file_list

    def open_file(self, filename):
        if self._opened_file:
            self.close_file()

        file_path = os.path.join(self._base_directory, filename)
        self._opened_file = open(file_path, 'r')

        # put all the file content in one string
        self._file_contents = self._opened_file.read()

        # incase of restart procedure
        self.reset_line_index()

    def get_open_file(self):
        if self._opened_file:
            return self._opened_file
        return None

    def get_open_filename(self):
        if self._opened_file:
            # remove the base_directory from the file name
            return os.path.relpath(self._opened_file.name, self._base_directory)
        return None

    # get the next line in the file that has been read
    def get_next_line(self):
        # Find the position of the first newline character
        self._read_line_index = self._file_contents.find('\n')

        # If there is no newline, yield the remaining content
        if self._read_line_index == -1:
            if self._file_contents:
                # take the last line in the string
                line = self._file_contents.strip()
                self._file_contents = ''

                return line
            # string is empty
            else:
                return None

        # Yield the first line and remove it from the remaining content
        line = self._file_contents[:self._read_line_index].strip()
        self._file_contents = self._file_contents[self._read_line_index + 1:]

        return line

    # in case the system stopped executing the file in the middle of the process
    # or and error happened during the execution
    def reset_line_index(self):
        # reset the index
        self._read_line_index = 0

    # when the user upload a file create a new file in specific directory
    def write_gcode_file(self, content, filename):
        file_path = os.path.join(self._base_directory, filename)

        with open(file_path, 'w') as gcode_file:
            gcode_file.write(content)

    def delete_file(self, filename):
        # close the file if it is the same open file before delete
        opened_filename = self.get_open_filename()
        if opened_filename == filename:
            self.close_file()
            self._opened_file = None

        file_path = os.path.join(self._base_directory, filename)
        os.remove(file_path)

    def close_file(self):
        if self._opened_file:
            self._opened_file.close()
            self._opened_file = None
            self._file_contents = ''
