import { Constants } from 'src/constants';
import { executeNormalGCommands } from 'src/services/execute.commands.service';
import { useMachineStatusStore } from 'src/stores/machine-status';

interface JoystickData {
  type: string;
  x_axis_step: number;
  y_axis_step: number;
  feedRate: number;
  rest_xy: boolean;
  time: string;
}

export const handleJoystickData = (res: JoystickData) => {
  // reset x and y
  // if (res.rest_xy) {
  //   resetXY();
  // } else {
  jogXY(res.x_axis_step, res.y_axis_step, res.feedRate);
  // }
};

const resetXY = () => {
  executeNormalGCommands(Constants.GRBL_COMMAND_RESET_ZERO_XY);
  useMachineStatusStore().resetXYJobPosition();
};
const jogXY = (x: number, y: number, feedRate: number) => {
  // jog x and y
  executeNormalGCommands(Constants.GRBL_COMMAND_RELATIVE_POSITION);
  executeNormalGCommands('G1 X' + x + ' Y' + y + ' F' + feedRate * 60);
  executeNormalGCommands(Constants.GRBL_COMMAND_ABSOLUTE_POSITION);
};
