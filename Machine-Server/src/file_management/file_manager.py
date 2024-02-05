import datetime
import os
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
        self._line_counter = 0

        # represent the total number of lines in the opened file
        self._total_lines_number = 0

    def get_files_list(self):
        # Check if the base directory exists
        # if not create a directory
        if not os.path.exists(self._base_directory):
            os.makedirs(self._base_directory)

        # Get the list of files with their creation time
        file_list_with_creation_time = []
        for filename in os.listdir(self._base_directory):
            if any(filename.lower().endswith(ext) for ext in constants.GCODE_FILE_EXTENSIONS):
                file_path = os.path.join(self._base_directory, filename)
                creation_time = self.get_file_creation_time(file_path)
                file_info = {"file": filename, "date": creation_time}
                file_list_with_creation_time.append(file_info)

        return file_list_with_creation_time

    def get_file_creation_time(self, file_path):
        try:
            # Get the creation time of the file in seconds since the epoch
            creation_time = os.path.getctime(file_path)

            # Convert the timestamp to a human-readable format with the month's name
            creation_time_formatted = datetime.datetime.fromtimestamp(
                creation_time)
            creation_time_formatted_str = creation_time_formatted.strftime(
                '%d %B %Y %H:%M:%S')

            return creation_time_formatted_str

        except FileNotFoundError:
            print(f"File not found: {file_path}")
            return None

    def open_file(self, filename):
        if self._opened_file:
            self.close_file()

        file_path = os.path.join(self._base_directory, filename)
        self._opened_file = open(file_path, 'r')

        # get the number of lines inside the file
        self._total_lines_number = sum(1 for _ in self._opened_file)

        # rewind the file cursor to the beginning
        self._opened_file.seek(0)

        # put all the file content in one string
        self._file_contents = self._opened_file.read()

        # incase of restart procedure
        self.reset_line_index()

    def get_open_file(self):
        if self._opened_file:
            return self._opened_file
        return None

    def rename_file(self, old_filename, new_filename):
        # check if the user renaming opened file
        opened_filename = self.get_open_filename()
        is_opened_file = old_filename == opened_filename
        # close the file before renaming it
        if is_opened_file:
            self.close_file()

        old_file = os.path.join(self._base_directory, old_filename)
        new_file = os.path.join(self._base_directory, new_filename)
        os.rename(old_file, new_file)

        # reopen the new renamed file in case renaming an open file
        if is_opened_file:
            self.open_file(new_filename)

    def get_open_filename(self):
        if self._opened_file:
            # remove the base_directory from the file name
            return os.path.relpath(self._opened_file.name, self._base_directory)
        return None

    def get_line_index(self):
        return self._line_counter

    def get_total_lines(self):
        return self._total_lines_number

    # get the next line in the file that has been read
    def get_next_line(self):
        # increase the lines counter
        self._line_counter += 1

        # Find the position of the first newline character
        end_line_index = self._file_contents.find('\n')
        # If there is no newline, yield the remaining content
        if end_line_index == -1:
            if self._file_contents:
                # take the last line in the string
                line = self._file_contents.strip()
                self._file_contents = ''

                return line
            # string is empty
            else:
                return None

        # Yield the first line and remove it from the remaining content
        line = self._file_contents[:end_line_index].strip()
        self._file_contents = self._file_contents[end_line_index + 1:]

        return line

    # in case the system stopped executing the file in the middle of the process
    # or and error happened during the execution
    def reset_line_index(self):
        # reset the index
        self._line_counter = 0

    # when the user upload a file create a new file in specific directory
    def write_gcode_file(self, filename, content):
        file_path = os.path.join(self._base_directory, filename)

        # Split content into lines and exclude the first line (name of the file)
        lines = content.decode('utf-8').split('\n')[1:]

        # Join the lines back together
        updated_content = '\n'.join(lines)

        # Write the modified content to the file
        with open(file_path, 'wb') as gcode_file:
            gcode_file.write(updated_content.encode('utf-8'))

    def delete_file(self, filename):
        # close the file if it is the same open file before delete
        opened_filename = self.get_open_filename()
        if opened_filename == filename:
            self.close_file()
            self._opened_file = None

        file_path = os.path.join(self._base_directory, filename)
        os.remove(file_path)

    def close_file(self):
        self._opened_file.close()
        self._opened_file = None
        self._file_contents = ''
