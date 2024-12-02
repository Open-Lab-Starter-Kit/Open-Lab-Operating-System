import datetime
import math
import os
import shutil

from utils.image_to_gcode_generator import ImageToGcodeGenerator
from .constants import FilesManagerConstants as constants

# This module is to handle all the functions related to gcode file management


class JobsManager:
    def __init__(self):
        self._job_base_directory = constants.JOB_BASE_DIR
        self._opened_file = None

        # sum all the lines in the file in one string
        # the reason to use this method is to minimize the usage of memory in the system
        self._file_content = ''

        # an indicator which represent which line the system is processing
        self._line_counter = 0

        # represent the total number of lines in the opened file
        self._total_lines_number = 0

    def get_files_list(self):
        # Check if the base directory exists
        # if not create a directory
        if not os.path.exists(self._job_base_directory):
            os.makedirs(self._job_base_directory)

        # Get the list of files with their file info
        files_list_with_info = []
        for filename in os.listdir(self._job_base_directory):
            if any(filename.lower().endswith(ext) for ext in constants.GCODE_FILE_EXTENSIONS):
                file_path = os.path.join(self._job_base_directory, filename)

                # fetching file info
                file_creation_time = self.get_file_creation_time(file_path)
                file_size = self.get_file_size(file_path)

                file_info = {"file": filename,
                             "date": file_creation_time,
                             "size": file_size}

                # add to files list
                files_list_with_info.append(file_info)

        return files_list_with_info

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

    def get_file_size(self, file_path):
        try:
            # Get the creation time of the file in seconds since the epoch
            file_size_bytes = os.path.getsize(file_path)

            # Convert the file size from bytes to megabytes
            file_size_kb = math.ceil(
                file_size_bytes / constants.BYTES_TO_KILOBYTES)

            return file_size_kb

        except FileNotFoundError:
            print(f"File not found: {file_path}")
            return None

    def open_file(self, filename):
        if self._opened_file:
            self.close_file()

        file_path = os.path.join(self._job_base_directory, filename)
        self._opened_file = open(file_path, 'r')

        # get the number of lines inside the file
        self._total_lines_number = sum(1 for _ in self._opened_file)

        # rewind the file cursor to the beginning
        self._opened_file.seek(0)

        # put all the file content in one string
        self._file_content = self._opened_file.read()
        self._opened_file.seek(0)

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

        old_file = os.path.join(self._job_base_directory, old_filename)
        new_file = os.path.join(self._job_base_directory, new_filename)

        stat = os.stat(old_file)
        os.utime(old_file, (stat.st_atime, stat.st_mtime))
        os.rename(old_file, new_file)

        # reopen the new renamed file in case renaming an open file
        if is_opened_file:
            self.open_file(new_filename)

    def get_open_filename(self):
        if self._opened_file:
            # remove the base_directory from the file name
            return os.path.relpath(self._opened_file.name, self._job_base_directory)
        return ''

    def get_opened_file_content(self):
        return self._file_content

    def get_line_index(self):
        return self._line_counter

    def get_total_lines(self):
        return self._total_lines_number

    def get_next_line(self):
        # increase the lines counter
        self._line_counter += 1

        # Read the next line from the file
        line = self._opened_file.readline()

        # If the line is empty, it means end of file (EOF)
        if not line:
            return None

        # Strip any trailing newline or extra spaces
        return line.strip()

    # in case the system stopped executing the file in the middle of the process
    # or and error happened during the execution
    def reset_line_index(self):
        # reset the index
        self._line_counter = 0

    # when the user upload a file create a new file in specific directory
    def write_gcode_file(self, filename, file_content):
        file_path = os.path.join(self._job_base_directory, filename)

        # Split content into lines
        lines = file_content.decode('utf-8').splitlines()

        # Join the lines back together
        updated_content = '\n'.join(lines)

        # Write the modified content to the file
        with open(file_path, 'wb') as gcode_file:
            gcode_file.write(updated_content.encode('utf-8'))

            # incase the user uploaded the file that has the name similar to opened file
            if filename == self.get_open_filename():
                self._file_content = updated_content

    def copy_gcode_file(self, file_path):
        shutil.copy(file_path, constants.JOB_BASE_DIR)

    def delete_file(self, filename):
        # close the file if it is the same open file before delete
        opened_filename = self.get_open_filename()
        if opened_filename == filename:
            self.close_file()
            self._opened_file = None

        file_path = os.path.join(self._job_base_directory, filename)
        os.remove(file_path)

    def get_file_path(self, filename):
        if filename:
            file_path = os.path.join(self._job_base_directory, filename)
            return file_path
        return ''

    def generate_gcode_file(self, cutting_svg_file_content, marking_svg_file_content, image_file_content, gcode_settings):
        gcode_file_content = ImageToGcodeGenerator.generate_gcode(
            cutting_svg_file_content, marking_svg_file_content, image_file_content, gcode_settings)
        # write the generated gcode in the file system
        filename = gcode_settings.get('mainSettings').get('filename')
        self.write_gcode_file(filename, gcode_file_content)

    def close_file(self):
        self._opened_file.close()
        self._opened_file = None
        self._file_content = ''
