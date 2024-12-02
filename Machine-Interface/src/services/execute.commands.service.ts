import { Constants } from 'src/constants';
import { useWebSocketStore } from 'src/stores/websocket-connection';

export const executeRealTimeGCommands = (command: string) => {
  // send to server using websocket
  const req = {
    type: Constants.REAL_TIME_COMMAND_DATA_TYPE,
    data: {
      command,
    },
  };
  useWebSocketStore().send(req);
};

// Do not require a real time execution
export const executeNormalGCommands = (command: string) => {
  // send to server using websocket
  const req = {
    type: Constants.NORMAL_COMMAND_DATA_TYPE,
    data: {
      command,
    },
  };
  useWebSocketStore().send(req);
};
