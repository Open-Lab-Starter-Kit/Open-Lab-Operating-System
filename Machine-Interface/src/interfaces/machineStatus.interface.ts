export interface StatusData {
  type: string;
  state?: string;
  machine_position: {
    x: number;
    y: number;
    z?: number;
  };

  work_coordinate_offset: {
    x: number;
    y: number;
    z?: number;
  };
  buffer_state: {
    commands_queued: number;
    buffer_length: number;
  };
  feed_and_speed: {
    feed_rate: number;
    speed: number;
  };
  overrides: {
    feed: number;
    rapids: number;
    spindle: number;
  };
  machine_tool: number;
}

export interface MachineConnectionData {
  type: string;
  success: boolean;
  time: string;
}

export interface JobPosition {
  x: number;
  y: number;
  z?: number;
}
