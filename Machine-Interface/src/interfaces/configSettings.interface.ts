import { Point } from './gcodePreivew.interface';

export interface Config {
  machine_type: string;
  machine_platform: MachinePlatform;
  machine_screen: MachineScreen;
  ai_configuration: AISettings;
  laser_cutter_settings?: LaserCutterSettings;
  cnc_settings?: CNCSettings;
  vinyl_cutter_settings?: VinylCutterSettings;
}

export interface Tool {
  name: string;
  command: string;
}

interface JobPreviewer {
  graph_step_size: number;
  parking_settings: {
    parking_enabled: boolean;
    point: Point;
    feed_rate: number;
  };
}

interface LaserPower {
  min: number;
  max: number;
}

interface MovementSpeed {
  min: number;
  max: number;
}

interface MaterialThickness {
  unit: string;
  max: number;
  min: number;
}

interface DitheringSettings {
  resolution: {
    min: number;
    max: number;
  };
  grid_algorithm: {
    block_size: {
      min: number;
      max: number;
    };
    block_distance: {
      min: number;
      max: number;
    };
  };
}

interface GcodeGenerator {
  laser_power: LaserPower;
  movement_speed: MovementSpeed;
  material_thickness: MaterialThickness;
  dithering_settings: DitheringSettings;
}

interface AISettings {
  use_ai_image_generator: boolean;
}

interface LaserCutterSettings {
  cameras_enabled: boolean;
  tool_changer: boolean;
  tools: Tool[];
  job_previewer: JobPreviewer;
  gcode_generator: GcodeGenerator;
}

interface CNCSettings {
  cameras_enabled: boolean;
  tool_changer: boolean;
  tools: Tool[];
  job_previewer: JobPreviewer;
}

interface VinylCutterSettings {
  job_previewer: JobPreviewer;
}

interface MachinePlatform {
  start_point: Point;
  end_point: Point;
}

interface MachineScreen {
  width: number;
  height: number;
}
