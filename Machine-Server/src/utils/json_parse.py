import datetime
import json
import re


class JsonParse:

    def parse_grbl_status_to_json(self, status):
        # Define regular expressions to extract values
        state_pattern = re.compile(r'<(\w+)|')
        machine_position_pattern = re.compile(
            r'MPos:([-\d.]+),([-\d.]+),([-\d.]+)')
        work_coordinate_offset_pattern = re.compile(
            r'WCO:([-\d.]+),([-\d.]+),([-\d.]+)')
        buffer_pattern = re.compile(r'Bf:(\d+),(\d+)')
        feed_speed_pattern = re.compile(r'FS:(\d+),(\d+)')
        override_pattern = re.compile(r'Ov:(\d+),(\d+),(\d+)')

        # Extract values using regular expressions
        state_match = state_pattern.search(status)
        machine_position_match = machine_position_pattern.search(status)
        work_coordinate_offset_match = work_coordinate_offset_pattern.search(
            status)
        buffer_match = buffer_pattern.search(status)
        feed_speed_match = feed_speed_pattern.search(status)
        override_match = override_pattern.search(status)

        # Create a dictionary with extracted values
        status_dict = {
            "type": "MACHINE_STATUS",
            "state": state_match.group(1) if state_match else None,
            "machine_position": {
                "x": float(machine_position_match.group(1)) if machine_position_match else None,
                "y": float(machine_position_match.group(2)) if machine_position_match else None,
                "z": float(machine_position_match.group(3)) if machine_position_match else None,
            },
            "work_coordinate_offset": {
                "x": float(work_coordinate_offset_match.group(1)) if work_coordinate_offset_match else None,
                "y": float(work_coordinate_offset_match.group(2)) if work_coordinate_offset_match else None,
                "z": float(work_coordinate_offset_match.group(3)) if work_coordinate_offset_match else None,
            },
            "buffer_state": {
                "commands_queued": float(buffer_match.group(1)) if buffer_match else None,
                "buffer_length": float(buffer_match.group(2)) if buffer_match else None,
            },
            "feed_and_speed": {
                "feed_rate": float(feed_speed_match.group(1)) if feed_speed_match else None,
                "spindle_speed": float(feed_speed_match.group(2)) if feed_speed_match else None,
            },
            "overrides": {
                "feed": float(override_match.group(1)) if override_match else None,
                "rapids": float(override_match.group(2)) if override_match else None,
                "spindle": float(override_match.group(3)) if override_match else None,
            }
        }

        return json.dumps(status_dict, indent=2)

    def parse_serial_command_to_json(self, command):
        dict = {"type": "SERIAL_COMMAND",
                "text": command,
                "time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

        return json.dumps(dict, indent=2)

    def parse_file_command_to_json(self, command, line_index, total_lines):
        dict = {"type": "FILE",
                "text": command,
                "line_index": line_index,
                "total_lines": total_lines,
                "time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

        return json.dumps(dict, indent=2)

    def parse_connection_status_to_json(self, success):
        dict = {"type": "MACHINE_CONNECTION",
                "success": success,
                "time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

        return json.dumps(dict, indent=2)
