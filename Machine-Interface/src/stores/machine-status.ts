import { defineStore } from 'pinia';
import { Constants } from 'src/constants';

interface StatusData {
  type: string;
  state?: string | null;
  machine_position: {
    x: number | null;
    y: number | null;
    z: number | null;
  };

  work_coordinate_offset: {
    x: number | null;
    y: number | null;
    z: number | null;
  };
  buffer_state: {
    commands_queued: number | null;
    buffer_length: number | null;
  };
  feed_and_speed: {
    feed_rate: number | null;
    spindle_speed: number | null;
  };
  overrides: {
    feed: number | null;
    rapids: number | null;
    spindle: number | null;
  };
}

interface MachineConnectionData {
  type: string;
  success: boolean;
  time: string;
}

const statusInitialValue: StatusData = {
  type: Constants.MACHINE_STATUS_DATA_TYPE,
  state: Constants.DISCONNECTED,
  machine_position: {
    x: 0,
    y: 0,
    z: 0,
  },
  work_coordinate_offset: {
    x: 0,
    y: 0,
    z: 0,
  },
  buffer_state: {
    commands_queued: 0,
    buffer_length: 0,
  },
  feed_and_speed: {
    feed_rate: 0,
    spindle_speed: 0,
  },
  overrides: {
    feed: 0,
    rapids: 0,
    spindle: 0,
  },
};

const jobPositionInitialValue = {
  x: 0,
  y: 0,
  z: 0,
};

export const useMachineStatusStore = defineStore('status', {
  state: () => ({
    status: statusInitialValue as StatusData,
    job_position: jobPositionInitialValue,
  }),
  getters: {
    machineState: (state) => state.status.state,
    machinePosition: (state) => state.status.machine_position,
    jobPosition: (state) => {
      state.job_position.x =
        state.status.machine_position.x && state.status.work_coordinate_offset.x
          ? state.status.machine_position.x -
            state.status.work_coordinate_offset.x
          : state.job_position.x;

      state.job_position.y =
        state.status.machine_position.y && state.status.work_coordinate_offset.y
          ? state.status.machine_position?.y -
            state.status.work_coordinate_offset.y
          : state.job_position.y;
      state.job_position.z =
        state.status.machine_position.z && state.status.work_coordinate_offset.z
          ? state.status.machine_position?.z -
            state.status.work_coordinate_offset.z
          : state.job_position.z;

      return {
        x: state.job_position.x.toFixed(2),
        y: state.job_position.y.toFixed(2),
        z: state.job_position.z.toFixed(2),
      };
    },
    bufferState: (state) => state.status.buffer_state,
    feedAndSpeed: (state) => state.status.feed_and_speed,
    overrides: (state) => state.status.overrides,
  },
  actions: {
    updateConnectionStatus(connect: MachineConnectionData) {
      // check status incase machine disconnection
      if (!connect.success) {
        this.status = statusInitialValue;
      }
    },
    updateStatus(status: StatusData) {
      // Check if the offset values are present in the incoming status
      if (
        status.work_coordinate_offset &&
        status.work_coordinate_offset.x &&
        status.work_coordinate_offset.y &&
        status.work_coordinate_offset.z
      ) {
        this.status = status; // Update status directly
      } else {
        // If offset values are missing, preserve the existing offset values
        const pre_work_coordinate_offset = this.status.work_coordinate_offset;
        this.status = {
          ...status, // Override with new status values
          work_coordinate_offset: pre_work_coordinate_offset,
        };
      }
    },

    resetXJobPosition() {
      this.status.work_coordinate_offset.x = this.machinePosition.x;
      this.job_position.x = 0;
    },
    resetYJobPosition() {
      this.status.work_coordinate_offset.y = this.machinePosition.y;
      this.job_position.y = 0;
    },
    resetZJobPosition() {
      this.status.work_coordinate_offset.z = this.machinePosition.z;
      this.job_position.z = 0;
    },
    resetXYJobPosition() {
      this.status.work_coordinate_offset.x = this.machinePosition.x;
      this.job_position.x = 0;
      this.status.work_coordinate_offset.y = this.machinePosition.y;
      this.job_position.y = 0;
    },
    setXJobPosition(value: number) {
      this.status.work_coordinate_offset.x = this.machinePosition.x
        ? this.machinePosition.x - value
        : value;
      this.job_position.x = value;
    },
    setYJobPosition(value: number) {
      this.status.work_coordinate_offset.y = this.machinePosition.y
        ? this.machinePosition.y - value
        : value;
      this.job_position.y = value;
    },
    setZJobPosition(value: number) {
      this.status.work_coordinate_offset.z = this.machinePosition.z
        ? this.machinePosition.z - value
        : value;
      this.job_position.z = value;
    },
  },
});
