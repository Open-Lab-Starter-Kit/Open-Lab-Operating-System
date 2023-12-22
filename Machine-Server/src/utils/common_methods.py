# this module contains methods and functions that can be used by two different modules or more
# the purpose of it is to reduce rewriting the same function or methods in different modules
import datetime


class CommonMethods:
    # filter commands in the gcode file lines
    def filtered_commands(self, line):
        # Split the line by the comment delimiter (';')
        parts = line.split(';', 1)
        # Return the part without the comment
        return parts[0].strip()

    # Show a log message
    def log_message(self, message):
        # Don't add the timestamp to the status messages
        if self.is_status_message(message):
            return message

        current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return f"[{current_time}] {message}"
    # check if the message is a status message or not

    def is_status_message(self, message):
        if '<' in message and '>' in message:
            return True
        return False
