export const Constants = {
  // data types for websocket messages
  MACHINE_STATUS_DATA_TYPE: 'MACHINE_STATUS',
  SERIAL_COMMAND_DATA_TYPE: 'SERIAL_COMMAND',
  FILE_DATA_TYPE: 'FILE',
  REAL_TIME_COMMAND_DATA_TYPE: 'REAL_TIME_COMMAND',
  NORMAL_COMMAND_DATA_TYPE: 'NORMAL_COMMAND',
  MACHINE_CONNECTION_DATA_TYPE: 'MACHINE_CONNECTION',

  // small notes/messages
  SMALL_MESSAGES: {
    DISCONNECTED_MESSAGE: 'Server/Machine is disconnected',
    ALARM_MESSAGE: 'Alarm detected on the machine',
    HOLD_MESSAGE: 'Machine on hold/pause',
    RUN_MESSAGE: 'Machine is running',
    IDLE_MESSAGE: 'Machine is ready to start',
    ERROR_MESSAGE: 'Error detected during running the machine ',
  },

  // long messages
  LONG_MESSAGES: {
    DISCONNECTED_MESSAGE:
      'The machine is currently disconnected. Check the server connection and ensure the machine is properly connected.',
    HOLD_MESSAGE:
      'The machine is on hold. Please review the status and take necessary actions to resume operation.',
    RUN_MESSAGE:
      'The machine is currently in operation. All systems are functioning normally.',
    IDLE_MESSAGE:
      'The machine is idle and waiting for the next job. All systems are ready for operation.',
    ALARM_MESSAGES: [
      'Unknown alarm code. Check the machine and G-code for issues.',
      'Hard limit triggered. Position is likely lost due to a sudden and immediate halt. Re-homing is highly recommended before resuming.',
      'Soft limit alarm. Position is kept, and unlocking is safe. Review soft limit settings and program size.',
      'Reset while in motion. Position is lost. Investigate and resolve the cause before continuing.',
      'Probe fail. Probe is not in the expected initial state. Check probe wiring and connections.',
      'Probe fail. Probe did not contact the work. Check probe, wiring, and workpiece setup.',
      'Homing fail. The active homing cycle was reset. Investigate and resolve homing issues.',
      'Homing fail. Door opened during homing cycle. Ensure the door remains closed during homing.',
      'Homing fail. Pull off failed to clear limit switch. Check limit switch wiring and position.',
      'Homing fail. Could not find limit switch. Check limit switch wiring and position.',
    ],
    ERROR_MESSAGES: [
      'Unknown error code. Check the machine and G-code for issues.',
      'GCode Command letter was not found. Check the GCode command for typos or missing letters.',
      'GCode Command value invalid or missing. Ensure that the GCode command includes a valid value.',
      "Grbl '$' not recognized or supported. Check the GCode program for unsupported commands.",
      'Negative value for an expected positive value. Ensure that all values in the GCode command are positive.',
      'Homing fail. Homing is not enabled in settings. Enable homing in Grbl settings.',
      'Min step pulse must be greater than 3usec. Adjust the step pulse duration in Grbl settings.',
      'EEPROM read failed. Default values used. Check the EEPROM and ensure it is functioning correctly.',
      "Grbl '$' command Only valid when Idle. Ensure that the Grbl machine is in an idle state before using '$' commands.",
      'GCode commands invalid in alarm or jog state. Check the machine state and send GCode commands when the machine is not in an alarm or jog state.',
      'Soft limits require homing to be enabled. Enable homing in Grbl settings to use soft limits.',
      'Max characters per line exceeded. Ignored. Check the GCode program for lines that exceed the maximum allowed length.',
      "Grbl '$' setting exceeds the maximum step rate. Adjust the step rate settings in Grbl.",
      'Safety door opened and door state initiated. Close the safety door to resume operation.',
      'Build info or start-up line > EEPROM line length. Check the EEPROM and ensure it can store the build information or start-up line.',
      'Jog target exceeds machine travel, ignored. Check the jog commands and ensure they are within the machine travel limits.',
      "Jog Cmd missing '=' or has prohibited GCode. Check the jog commands and correct any syntax errors.",
      'Laser mode requires PWM output. Ensure that the machine setup supports PWM output for laser mode.',
      '', // no code
      '', // no code
      'Unsupported or invalid GCode command. Check the GCode program for unsupported or invalid commands.',
      '> 1 GCode command in a modal group in block. Ensure that each GCode block contains only one command from a modal group.',
      'Feed rate has not yet been set or is undefined. Set the feed rate using the F command in the GCode program.',
      'GCode command requires an integer value. Check the GCode program and provide integer values where required.',
      '> 1 GCode command using axis words found. Each GCode block should contain only one GCode command using axis words.',
      'Repeated GCode word found in block. Check the GCode program for repeated words in the same block.',
      'No axis words found in command block. Provide axis words in the GCode command.',
      'Line number value is invalid. Check the GCode program for invalid line number values.',
      'GCode Cmd missing a required value word. Check the GCode program for missing required value words in commands.',
      'G59.x WCS are not supported. Check the GCode program and use a supported WCS.',
      'G53 only valid with G0 and G1 motion modes. Use G53 only with G0 and G1 motion modes in the GCode program.',
      'Unneeded Axis words found in block. Remove unnecessary axis words from the GCode command block.',
      'G2/G3 arcs need >= 1 in-plane axis word. Provide at least one in-plane axis word for G2/G3 arcs in the GCode program.',
      'Motion command target is invalid. Check the motion command and provide a valid target.',
      'Arc radius value is invalid. Check the GCode program for invalid arc radius values.',
      'G2/G3 arcs need >= 1 in-plane offset word. Provide at least one in-plane offset word for G2/G3 arcs in the GCode program.',
      'Unused value words found in block. Remove unused value words from the GCode command block.',
      'G43.1 offset not assigned to tool length axis. Ensure that the G43.1 offset is assigned to the tool length axis.',
      'Tool number greater than max value. Check the tool number in the GCode program and ensure it is within the supported range.',
    ],
  },

  // Real time commands
  GRBL_COMMAND_STATUS: '?',
  GRBL_COMMAND_PAUSE: '!',
  GRBL_COMMAND_RESUME: '~',
  GRBL_COMMAND_STOP: '\x18',

  GRBL_COMMAND_INCREASE_FEED_RATE_1: '\x93',
  GRBL_COMMAND_DECREASE_FEED_RATE_1: '\x94',
  GRBL_COMMAND_INCREASE_FEED_RATE_10: '\x91',
  GRBL_COMMAND_DECREASE_FEED_RATE_10: '\x92',
  GRBL_COMMAND_DEFAULT_FEED_RATE: '\x90',

  GRBL_COMMAND_INCREASE_LASER_POWER_1: '\x9C',
  GRBL_COMMAND_DECREASE_LASER_POWER_1: '\x9D',
  GRBL_COMMAND_INCREASE_LASER_POWER_10: '\x9A',
  GRBL_COMMAND_DECREASE_LASER_POWER_10: '\x9B',
  GRBL_COMMAND_DEFAULT_LASER_POWER: '\x99',

  GRBL_COMMAND_INCREASE_SPINDLE_SPEED_1: '\x9C',
  GRBL_COMMAND_DECREASE_SPINDLE_SPEED_1: '\x9D',
  GRBL_COMMAND_INCREASE_SPINDLE_SPEED_10: '\x9A',
  GRBL_COMMAND_DECREASE_SPINDLE_SPEED_10: '\x9B',
  GRBL_COMMAND_DEFAULT_SPINDLE_SPEED: '\x99',

  // essential commands
  GRBL_COMMAND_HOMING: '$H',
  GRBL_COMMAND_RESET_ZERO: 'G92 X0 Y0 Z0',
  GRBL_COMMAND_UNLOCK: '$X',
  GRBL_COMMAND_SOFT_RESET: '\x18',

  // Jogging commands
  COMMAND_RETURN_ZERO: 'G1 X0 Y0 F2000',
  COMMAND_RESET_ZERO: 'G92 X0 Y0 Z0',
  COMMAND_RESET_ZERO_X: 'G92 X0',
  COMMAND_RESET_ZERO_Y: 'G92 Y0',
  COMMAND_RESET_ZERO_Z: 'G92 Z0',
  COMMAND_RESET_ZERO_XY: 'G92 X0 Y0',
  COMMAND_ABSOLUTE_POSITION: 'G90',
  COMMAND_RELATIVE_POSITION: 'G91',

  // machine states
  DISCONNECTED: 'Disconnected',
  HOLD: 'Hold',
  RUN: 'Run',
  IDLE: 'Idle',
  ALARM: 'Alarm',
  ERROR: 'Error',
  CONNECTED: 'Connected',
  API_URI: {
    // USER: `${API_VERSION.V1}/user`,
    FILES: 'api/file_manager/',
    // LOGOUT: `${API_VERSION.V1}/auth/logout`,
  },

  MAX_FILE_SIZE: 524288000, // 500 MB
} as const;

export type Constants = typeof Constants;
