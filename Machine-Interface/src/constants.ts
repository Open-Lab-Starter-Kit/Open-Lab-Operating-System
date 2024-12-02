import Konva from 'konva';
import {
  AiGeneratorSettingsData,
  AIModelData,
} from './interfaces/aiGeneratorImage.interface';
import {
  DitheringSettings,
  EngravingSettings,
  ImageMetrics,
  MainSettings,
  MaterialThickness,
  ThicknessOperation,
} from './interfaces/imageToGcode.interface';

export const Constants = {
  MACHINE_TYPE: {
    LASER_CUTTER: 'Laser Cutter',
    CNC: 'cnc',
    VINYL_CUTTER: 'Vinyl Cutter',
    Three_D_SCANNER: '3D Scanner0',
  } as Record<string, string>,

  // data types for websocket and api messages
  MACHINE_STATUS_DATA_TYPE: 'MACHINE_STATUS' as string,
  SERIAL_COMMAND_DATA_TYPE: 'SERIAL_COMMAND' as string,
  JOB_EXECUTION_DATA_TYPE: 'JOB_EXECUTION' as string,
  REAL_TIME_COMMAND_DATA_TYPE: 'REAL_TIME_COMMAND' as string,
  NORMAL_COMMAND_DATA_TYPE: 'NORMAL_COMMAND' as string,
  MACHINE_CONNECTION_DATA_TYPE: 'MACHINE_CONNECTION' as string,
  JOBS_MANAGER_DATA_TYPE: 'JOBS_MANAGER' as string,
  IMAGES_MANAGER_DATA_TYPE: 'IMAGES_MANAGER' as string,
  CONNECTION_DATA_TYPE: 'CONNECTION' as string,
  CAMERAS_SYSTEM_DATA_TYPE: 'CAMERAS_STREAM' as string,
  JOYSTICK_STATUS_DATA_TYPE: 'JOYSTICK_STATUS' as string,
  USB_STORAGE_MONITOR_DATA_TYPE: 'USB_STORAGE_MONITOR' as string,

  // small notes/messages
  SMALL_MESSAGES: {
    CONNECTING_MESSAGE: 'Please wait until the machine is ready',
    DISCONNECTED_MESSAGE: 'Server/Machine is disconnected',
    ALARM_MESSAGE: 'Alarm detected on the machine',
    HOLD_MESSAGE: 'Machine on hold/pause',
    HOMING_MESSAGE: 'Wait until the machine finishes homing',
    RUN_MESSAGE: 'Machine is running',
    IDLE_MESSAGE: 'Machine is ready to start',
    DOOR_MESSAGE: "Machine's door is open. Close the door and click Soft Reset",
    ERROR_MESSAGE: 'Error detected during running the machine ',
  } as Record<string, string>,

  // rejected uploading files
  UPLOAD_FILES_ERRORS: {
    MAX_FILES: {
      NAME: 'max-files',
      MESSAGE: 'You have exceeded the maximum number of files allowed.',
    },
    MAX_FILE_SIZE: {
      NAME: 'max-file-size',
      MESSAGE: 'The file size exceeds the maximum allowed limit.',
    },
    ACCEPT: {
      NAME: 'accept',
      MESSAGE: 'Invalid file type. Please upload files with valid extensions.',
    },
    DUPLICATE: {
      NAME: 'duplicate',
      MESSAGE: 'You can not upload the same file twice',
    },
    DEFAULT: {
      NAME: 'default',
      MESSAGE: 'File upload failed for an unknown reason.',
    },
  },

  // api error message
  API_ERROR_MESSAGES: {
    DELETE_MESSAGE: 'Error delete file: ',
    DOWNLOAD_MESSAGE: 'Error download file: ',
    OPEN_MESSAGE: 'Error open file: ',
    FETCH_MESSAGE: 'Error fetching file data: ',
    CHECK_OPEN_MESSAGE: 'Error check file: ',
    START_MESSAGE: 'Error start file: ',
    LIST_MESSAGE: 'Error list files: ',
    RENAME_MESSAGE: 'Error rename file: ',
    UPLOAD_MESSAGE: 'Error upload file: ',
    GENERATE_MESSAGE: 'Error generate file: ',
    CANCEL_GENERATE_MESSAGE: 'Error cancel generating file: ',
  },
  // api success message
  API_SUCCESS_MESSAGES: {
    DELETE_MESSAGE: 'File deleted successfully',
    DOWNLOAD_MESSAGE: 'File downloaded successfully',
    OPEN_MESSAGE: 'File opened successfully',
    FETCH_MESSAGE: 'File data fetched successfully',
    START_MESSAGE: 'File started successfully',
    RENAME_MESSAGE: 'File renamed successfully',
    UPLOAD_MESSAGE: 'File uploaded to the system successfully',
    GENERATE_MESSAGE: 'File generated successfully',
    CANCEL_GENERATE_MESSAGE: 'Canceling File generating process',
  },

  // long messages
  LONG_MESSAGES: {
    CONNECTING_MESSAGE:
      'The machine is currently connected. Wait until the machine start.',
    DISCONNECTED_MESSAGE:
      'The machine is currently disconnected. Check the server or network connection and ensure the machine is properly connected.',
    HOMING_MESSAGE: 'The machine is homing.',
    HOLD_MESSAGE:
      'The machine is on hold. Please review the status and take necessary actions to resume operation.',
    RUN_MESSAGE:
      'The machine is currently in operation. All systems are functioning normally.',
    IDLE_MESSAGE:
      'The machine is idle and waiting for the next job. All systems are ready for operation.',
    DOOR_MESSAGE:
      'Open door detected. Please check the door status of the machine and soft reset',
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
  } as Record<string, string | string[]>,

  JOBS_MANAGER_ERRORS: {
    CHECK_OPEN_FILE: 'Error Check Open File',
    OPEN_FILE: 'Error Open File',
    DELETE_FILE: 'Error Delete File',
    RENAME_FILE: 'Error Rename File',
    START_FILE: 'Error Start File',
    PREVIEW_FILE: 'Error Preview File',
    GENERATE_FILE: 'Error Generate File',
    DOWNLOAD_FILE: 'Error Download File',
  } as Record<string, string>,

  IMAGES_MANAGER_ERRORS: {
    DELETE_IMAGE: 'Error Delete Image',
    RENAME_IMAGE: 'Error Rename Image',
    DOWNLOAD_IMAGE: 'Error Download Image',
    LIST_IMAGES_DATA: 'Error Listing Images Data',
  } as Record<string, string>,

  // Real time commands
  GRBL_COMMAND_STATUS: '?' as string,
  GRBL_COMMAND_PAUSE: '!' as string,
  GRBL_COMMAND_RESUME: '~' as string,
  GRBL_COMMAND_STOP: '\x18' as string,

  GRBL_COMMAND_INCREASE_FEED_RATE_1: '\x93' as string,
  GRBL_COMMAND_DECREASE_FEED_RATE_1: '\x94' as string,
  GRBL_COMMAND_INCREASE_FEED_RATE_10: '\x91' as string,
  GRBL_COMMAND_DECREASE_FEED_RATE_10: '\x92' as string,
  GRBL_COMMAND_DEFAULT_FEED_RATE: '\x90' as string,

  GRBL_COMMAND_INCREASE_LASER_POWER_1: '\x9C' as string,
  GRBL_COMMAND_DECREASE_LASER_POWER_1: '\x9D' as string,
  GRBL_COMMAND_INCREASE_LASER_POWER_10: '\x9A' as string,
  GRBL_COMMAND_DECREASE_LASER_POWER_10: '\x9B' as string,
  GRBL_COMMAND_DEFAULT_LASER_POWER: '\x99' as string,

  GRBL_COMMAND_INCREASE_SPINDLE_SPEED_1: '\x9C' as string,
  GRBL_COMMAND_DECREASE_SPINDLE_SPEED_1: '\x9D' as string,
  GRBL_COMMAND_INCREASE_SPINDLE_SPEED_10: '\x9A' as string,
  GRBL_COMMAND_DECREASE_SPINDLE_SPEED_10: '\x9B' as string,
  GRBL_COMMAND_DEFAULT_SPINDLE_SPEED: '\x99' as string,

  GRBL_COMMAND_INCREASE_TOOL_SPEED_1: '\x9C' as string,
  GRBL_COMMAND_DECREASE_TOOL_SPEED_1: '\x9D' as string,
  GRBL_COMMAND_INCREASE_TOOL_SPEED_10: '\x9A' as string,
  GRBL_COMMAND_DECREASE_TOOL_SPEED_10: '\x9B' as string,
  GRBL_COMMAND_DEFAULT_TOOL_SPEED: '\x99' as string,

  // essential commands
  GRBL_COMMAND_HOMING: '$H' as string,
  GRBL_COMMAND_RESET_ZERO: 'G92 X0 Y0 Z0' as string,
  GRBL_COMMAND_UNLOCK: '$X' as string,
  GRBL_COMMAND_SOFT_RESET: '\x18' as string,

  // Jogging commands
  GRBL_COMMAND_RETURN_ZERO: 'G1 X0 Y0 F2000' as string,
  GRBL_COMMAND_RESET_ZERO_X: 'G92 X0' as string,
  GRBL_COMMAND_RESET_ZERO_Y: 'G92 Y0' as string,
  GRBL_COMMAND_RESET_ZERO_Z: 'G92 Z0' as string,
  GRBL_COMMAND_RESET_ZERO_XY: 'G92 X0 Y0' as string,
  GRBL_COMMAND_RESET_ZERO_XYZ: 'G92 X0 Y0 Z0' as string,
  GRBL_COMMAND_ABSOLUTE_POSITION: 'G90' as string,
  GRBL_COMMAND_RELATIVE_POSITION: 'G91' as string,

  // machine states
  DISCONNECTED: 'Disconnected' as string,
  HOLD: 'Hold' as string,
  RUN: 'Run' as string,
  IDLE: 'Idle' as string,
  DOOR: 'Door' as string,
  HOMING: 'Home' as string,
  ALARM: 'Alarm' as string,
  ERROR: 'Error' as string,
  CONNECTING: 'Connecting' as string,

  API_URI: {
    // USER: `${API_VERSION.V1}/user`,
    JOBS_MANAGER: 'api/jobs_manager/',
    IMAGES_MANAGER: 'api/images_manager/',
    AI: 'api/ai/',
    MATERIAL_LIBRARY: 'api/material_library/',
    // LOGOUT: `${API_VERSION.V1}/auth/logout`,
  } as Record<string, string>,

  // drawing on canvas functionalities
  IMAGE_DRAW_TYPE: {
    CUT_MARK: 'cut/mark',
    ENGRAVE: 'engrave',
  } as Record<string, string>,

  MAX_FILE_SIZE: 524288000 as number, // 500 MB
  MAX_IMAGE_FILE_SIZE: 52428800 as number, //50MB
  GCODE_COMMAND: 'Gcode Command' as string,

  // soft limits trigger
  SOFT_LIMITS_TRIGGER: 'MPOUT' as string,

  PREVIEWER_GCODE_ERROR_MESSAGE:
    'Syntax error detected in the G-code file. Please review the file for any formatting issues. For further assistance, refer to the error log in the debugger section.',
  PREVIEWER_BIG_GCODE_MESSAGE:
    'The job is beyond the machine platform range. Make sure the job stays inside the machine range',

  // Gcode Generator
  SVG_ELEMENTS_FILTER: {
    SHAPE: 'shape',
    COLOR: 'color',
  } as Record<string, string>,

  DITHERING_ALGORITHMS: {
    HALFTONE: 'Halftone',
    FLOYDSTEINBERG: 'Floyd-Steinberg',
    ORDERED: 'Ordered',
    RANDOM: 'Random',
    AVERAGE: 'Average',
    GRID: 'Grid',
  } as Record<string, string>,

  PROFILE_OPTIONS: {
    NOTHING: '-----',
    CUT: 'Cut',
    MARK: 'Mark',
    ENGRAVE: 'Engrave',
  } as Record<string, string>,

  PROFILE_ALL_OPTIONS: {
    CUSTOM: 'Custom',
    CUT_EVERYTHING: 'Cut Everything',
    MARK_EVERYTHING: 'Mark Everything',
    ENGRAVE_EVERYTHING: 'Engrave Everything',
  } as Record<string, string>,

  SVG_ALLOWED_ELEMENTS: [
    'rect',
    'circle',
    'ellipse',
    'line',
    'polyine',
    'polygon',
    'path',
    'text',
  ] as string[],

  SVG_DIMENSION_DEFAULT_VALUE: 500 as number,

  FALLBACK_GCODE_GENERATOR_STAGE_METRICS: {
    width: 1000,
    height: 600,
  },

  RGB_COLOR: {
    BLACK: 'rgb(0, 0, 0)',
    WHITE: 'rgb(255, 255, 255)',
  } as Record<string, string>,

  MAX_IMAGE_HEIGHT_SIZE: 700 as number,

  PREVIEWER_WORKER_BATCH_SIZE: 20000 as number,

  GCODE_PREVIEWER_RATIO: 25,

  // machine's tools
  LASER_TOOLS_NAMES: {
    DIODE_LASER: 'Diode',
    CO2_LASER: 'CO2',
    NO_LASER: '-',
  } as Record<string, string>,

  DEFAULT_GCODE_GENERATOR_SETTINGS: {
    MAIN_SETTINGS: {
      material: '',
      thickness: 1,
      metrics: {
        width: 0,
        height: 0,
        rotation: 0,
        scaleX: 0,
        scaleY: 0,
      } as ImageMetrics,
      filename: '',
    } as MainSettings,

    THICKNESS_SETTINGS: {
      thicknessOperations: [{}] as Array<ThicknessOperation>,
    } as MaterialThickness,

    CUTTING_SETTINGS: {
      speed: 3000,
      power: 50,
      tool: 'CO2',
    } as ThicknessOperation,

    MARKING_SETTINGS: {
      speed: 3000,
      power: 50,
      tool: 'CO2',
    } as ThicknessOperation,

    ENGRAVING_SETTINGS: {
      speed: 3000,
      power: 50,
      tool: 'Diode',
      dithering: {
        algorithm: 'Halftone',
        grayShift: 0,
        resolution: 1000,
        blockSize: 0.5,
        blockDistance: 0.1,
      } as DitheringSettings,
    } as EngravingSettings,

    IMAGE_CONFIGURATION: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      draggable: true,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      offsetX: 0,
      offsetY: 0,
      image: undefined,
    } as Konva.ImageConfig,
  },

  AI_IMAGE_SIZE_OPTIONS: [128, 256, 512, 1024] as number[],

  AI_ASSISTANT_MESSAGES: {
    PROMPTS_PLACEHOLDER:
      'A realistic portrait of a young woman in a forest, soft lighting, high detail.',
    NEGATIVE_PROMPTS_PLACEHOLDER:
      'blurry, low detail, cartoonish, dark lighting.',
    NEGATIVE_PROMPTS_MESSAGE:
      'Tell the AI what you don’t want to appear in the generated image.',

    INFERENCE_STEPS_MESSAGE:
      'Inference steps control image quality. More steps refine details but take longer, while fewer steps are faster but may lack detail.',
    GUIDANCE_SCALE_MESSAGE:
      'Guidance scale adjusts prompt influence—higher values strengthen prompt effects, while lower values give more creative freedom.',
    SEEDS_MESSAGE:
      'Seeds determine the randomness of image generation. Using the same seed produces similar images, while different seeds yield unique variations for creativity.',
  },

  SUPPORTED_AI_MODELS: [
    {
      name: 'rupeshs--sd-turbo-openvino',
      description: 'Fast, high-quality images for general use.',
    },
    {
      name: 'rupeshs--sdxs-512-0.9-openvino',
      description: 'Detailed square images, ideal for portraits and logos.',
    },
    {
      name: 'rupeshs--hyper-sd-sdxl-1-step-openvino-int8',
      description: 'Quick, simplified images for previews.',
    },
    {
      name: 'rupeshs--sdxl-turbo-openvino-int8',
      description: 'Detailed scenes with good speed.',
    },
    {
      name: 'Disty0--LCM_SoteMix',
      description: 'Artistic images with mixed styles.',
    },
    {
      name: 'runwayml--stable-diffusion-v1-5',
      description: 'Versatile, realistic images for any style.',
    },
  ] as Array<AIModelData>,

  DEFAULT_AI_GENERATOR_SETTINGS: {
    model: '',
    mainPrompts: '',
    negativePrompts: '',
    numberOfImages: 1,
    inferenceSteps: 1,
    guidanceScale: 1,
    seed: 0,
    isSeedsUsed: false,
    imageWidth: 512,
    imageHeight: 512,
    imageForm: 'PNG',
  } as AiGeneratorSettingsData,

  AI_SETTINGS_LIMITATION: {
    NUMBER_OF_IMAGES: 3,
    INFERENCE_STEPS: 5,
    IMAGE_WIDTH: 512,
    IMAGE_HEIGHT: 512,
  } as Record<string, number>,

  ALL_HEX_COLORS: {
    ALICEBLUE: '#f0f8ff',
    ANTIQUEWHITE: '#faebd7',
    AQUA: '#00ffff',
    AQUAMARINE: '#7fffd4',
    AZURE: '#f0ffff',
    BEIGE: '#f5f5dc',
    BISQUE: '#ffe4c4',
    BLACK: '#000000',
    BLANCHEDALMOND: '#ffebcd',
    BLUE: '#0000ff',
    BLUEVIOLET: '#8a2be2',
    BROWN: '#a52a2a',
    BURLYWOOD: '#deb887',
    CADETBLUE: '#5f9ea0',
    CHARTREUSE: '#7fff00',
    CHOCOLATE: '#d2691e',
    CORAL: '#ff7f50',
    CORNFLOWERBLUE: '#6495ed',
    CORNSILK: '#fff8dc',
    CRIMSON: '#dc143c',
    CYAN: '#00ffff',
    DARKBLUE: '#00008b',
    DARKCYAN: '#008b8b',
    DARKGOLDENROD: '#b8860b',
    DARKGRAY: '#a9a9a9',
    DARKGREEN: '#006400',
    DARKKHAKI: '#bdb76b',
    DARKMAGENTA: '#8b008b',
    DARKOLIVEGREEN: '#556b2f',
    DARKORANGE: '#ff8c00',
    DARKORCHID: '#9932cc',
    DARKRED: '#8b0000',
    DARKSALMON: '#e9967a',
    DARKSEAGREEN: '#8fbc8f',
    DARKSLATEBLUE: '#483d8b',
    DARKSLATEGRAY: '#2f4f4f',
    DARKTURQUOISE: '#00ced1',
    DARKVIOLET: '#9400d3',
    DEEPPINK: '#ff1493',
    DEEPSKYBLUE: '#00bfff',
    DIMGRAY: '#696969',
    DODGERBLUE: '#1e90ff',
    FIREBRICK: '#b22222',
    FLORALWHITE: '#fffaf0',
    FORESTGREEN: '#228b22',
    FUCHSIA: '#ff00ff',
    GAINSBORO: '#dcdcdc',
    GHOSTWHITE: '#f8f8ff',
    GOLD: '#ffd700',
    GOLDENROD: '#daa520',
    GRAY: '#808080',
    GREEN: '#008000',
    GREENYELLOW: '#adff2f',
    HONEYDEW: '#f0fff0',
    HOTPINK: '#ff69b4',
    INDIANRED: '#cd5c5c',
    INDIGO: '#4b0082',
    IVORY: '#fffff0',
    KHAKI: '#f0e68c',
    LAVENDER: '#e6e6fa',
    LAVENDERBLUSH: '#fff0f5',
    LAWNGREEN: '#7cfc00',
    LEMONCHIFFON: '#fffacd',
    LIGHTBLUE: '#add8e6',
    LIGHTCORAL: '#f08080',
    LIGHTCYAN: '#e0ffff',
    LIGHTGOLDENRODYELLOW: '#fafad2',
    LIGHTGREY: '#d3d3d3',
    LIGHTGREEN: '#90ee90',
    LIGHTPINK: '#ffb6c1',
    LIGHTSALMON: '#ffa07a',
    LIGHTSEAGREEN: '#20b2aa',
    LIGHTSKYBLUE: '#87cefa',
    LIGHTSLATEGRAY: '#778899',
    LIGHTSTEELBLUE: '#b0c4de',
    LIGHTYELLOW: '#ffffe0',
    LIME: '#00ff00',
    LIMEGREEN: '#32cd32',
    LINEN: '#faf0e6',
    MAGENTA: '#ff00ff',
    MAROON: '#800000',
    MEDIUMAQUAMARINE: '#66cdaa',
    MEDIUMBLUE: '#0000cd',
    MEDIUMORCHID: '#ba55d3',
    MEDIUMPURPLE: '#9370d8',
    MEDIUMSEAGREEN: '#3cb371',
    MEDIUMSLATEBLUE: '#7b68ee',
    MEDIUMSPRINGGREEN: '#00fa9a',
    MEDIUMTURQUOISE: '#48d1cc',
    MEDIUMVIOLETRED: '#c71585',
    MIDNIGHTBLUE: '#191970',
    MINTCREAM: '#f5fffa',
    MISTYROSE: '#ffe4e1',
    MOCCASIN: '#ffe4b5',
    NAVAJOWHITE: '#ffdead',
    NAVY: '#000080',
    OLDLACE: '#fdf5e6',
    OLIVE: '#808000',
    OLIVEDRAB: '#6b8e23',
    ORANGE: '#ffa500',
    ORANGERED: '#ff4500',
    ORCHID: '#da70d6',
    PALEGOLDENROD: '#eee8aa',
    PALEGREEN: '#98fb98',
    PALETURQUOISE: '#afeeee',
    PALEVIOLETRED: '#d87093',
    PAPAYAWHIP: '#ffefd5',
    PEACHPUFF: '#ffdab9',
    PERU: '#cd853f',
    PINK: '#ffc0cb',
    PLUM: '#dda0dd',
    POWDERBLUE: '#b0e0e6',
    PURPLE: '#800080',
    REBECCAPURPLE: '#663399',
    RED: '#ff0000',
    ROSYBROWN: '#bc8f8f',
    ROYALBLUE: '#4169e1',
    SADDLEBROWN: '#8b4513',
    SALMON: '#fa8072',
    SANDYBROWN: '#f4a460',
    SEAGREEN: '#2e8b57',
    SEASHELL: '#fff5ee',
    SIENNA: '#a0522d',
    SILVER: '#c0c0c0',
    SKYBLUE: '#87ceeb',
    SLATEBLUE: '#6a5acd',
    SLATEGRAY: '#708090',
    SNOW: '#fffafa',
    SPRINGGREEN: '#00ff7f',
    STEELBLUE: '#4682b4',
    TAN: '#d2b48c',
    TEAL: '#008080',
    THISTLE: '#d8bfd8',
    TOMATO: '#ff6347',
    TURQUOISE: '#40e0d0',
    VIOLET: '#ee82ee',
    WHEAT: '#f5deb3',
    WHITE: '#ffffff',
    WHITESMOKE: '#f5f5f5',
    YELLOW: '#ffff00',
    YELLOWGREEN: '#9acd32',
  } as Record<string, string>,
} as const;

export type Constants = typeof Constants;
