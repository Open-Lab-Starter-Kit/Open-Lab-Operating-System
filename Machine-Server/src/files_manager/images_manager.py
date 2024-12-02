import base64
import datetime
import math
import os
from utils.image_convertor_helper import convert_images_to_base64
from .constants import FilesManagerConstants as constants
import shutil

# This module is to handle all the functions related to gcode file management


class ImagesManager:
    def __init__(self):
        self._images_base_directory = constants.IMAGES_BASE_DIR

    def get_images_list(self):
        if not os.path.exists(self._images_base_directory):
            os.makedirs(self._images_base_directory)

        # Get the list of images with their info
        images_list_with_info = []
        for image_name in os.listdir(self._images_base_directory):
            if any(image_name.lower().endswith(ext) for ext in constants.IMAGE_FILES_EXTENSIONS):
                image_path = self.get_image_full_path(image_name)

                # fetching file info
                image_creation_time = self.get_image_creation_time(image_path)
                image_size = self.get_image_size(image_path)

                image_info = {"image": image_name,
                              "date": image_creation_time,
                              "size": image_size}

                # add to images list
                images_list_with_info.append(image_info)

        return images_list_with_info

    def get_image_source_string(self, image_name):
        image_path = self.get_image_full_path(image_name)
        image_source_str = convert_images_to_base64([image_path])[0]

        return image_source_str

    def get_image_creation_time(self, image_path):
        try:
            creation_time = os.path.getctime(image_path)

            creation_time_formatted = datetime.datetime.fromtimestamp(
                creation_time)
            creation_time_formatted_str = creation_time_formatted.strftime(
                '%d %B %Y %H:%M:%S')

            return creation_time_formatted_str

        except FileNotFoundError:
            print(f"Image not found: {image_path}")
            return None

    def get_image_size(self, image_path):
        try:
            # Get the creation time of the file in seconds since the epoch
            file_size_bytes = os.path.getsize(image_path)

            # Convert the file size from bytes to megabytes
            file_size_kb = math.ceil(
                file_size_bytes / constants.BYTES_TO_KILOBYTES)

            return file_size_kb

        except FileNotFoundError:
            print(f"Image not found: {image_path}")
            return None

    def rename_image(self, old_image_name, new_image_name):
        old_file = os.path.join(self._images_base_directory, old_image_name)
        new_file = os.path.join(self._images_base_directory, new_image_name)

        stat = os.stat(old_file)
        os.utime(old_file, (stat.st_atime, stat.st_mtime))
        os.rename(old_file, new_file)

    # when the user upload a image create a new file in specific directory

    def write_image_file(self, image_name, image_content):
        image_path = self.get_image_full_path(image_name)
        # Save the image to a file
        with open(image_path, "wb") as file:
            file.write(image_content)

    def copy_image_file(self, image_path):
        shutil.copy(image_path, constants.IMAGES_BASE_DIR)

    def delete_image(self, image_name):
        image_path = self.get_image_full_path(image_name)
        os.remove(image_path)

    def get_image_full_path(self, image_name):
        return os.path.join(self._images_base_directory, image_name)
