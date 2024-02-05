import { defineStore } from 'pinia';
import { Constants } from 'src/constants';
import { executeRealTimeGCommands } from 'src/services/controls.service';

export const useOverrideSettingsStore = defineStore('overrideSettings', {
  state: () => ({
    isLaserMode: true as boolean,
    feedRate: 100 as number,
    laserPower: 100 as number,
    spindleSpeed: 100 as number,
  }),
  actions: {
    increaseFeedRateOnePercent() {
      this.feedRate += 1;
      executeRealTimeGCommands(Constants.GRBL_COMMAND_INCREASE_FEED_RATE_1);
    },
    increaseFeedRateTenPercent() {
      this.feedRate += 10;
      executeRealTimeGCommands(Constants.GRBL_COMMAND_INCREASE_FEED_RATE_10);
    },
    decreaseFeedRateOnePercent() {
      this.feedRate -= 1;
      executeRealTimeGCommands(Constants.GRBL_COMMAND_DECREASE_FEED_RATE_1);
    },
    decreaseFeedRateTenPercent() {
      this.feedRate -= 10;
      executeRealTimeGCommands(Constants.GRBL_COMMAND_DECREASE_FEED_RATE_10);
    },
    defaultFeedRate() {
      this.feedRate = 100;
      executeRealTimeGCommands(Constants.GRBL_COMMAND_DEFAULT_FEED_RATE);
    },
    increaseLaserPowerOnePercent() {
      this.laserPower += 1;
      executeRealTimeGCommands(Constants.GRBL_COMMAND_INCREASE_LASER_POWER_1);
    },
    increaseLaserPowerTenPercent() {
      this.laserPower += 10;
      executeRealTimeGCommands(Constants.GRBL_COMMAND_INCREASE_LASER_POWER_10);
    },
    decreaseLaserPowerOnePercent() {
      this.laserPower -= 1;
      executeRealTimeGCommands(Constants.GRBL_COMMAND_DECREASE_LASER_POWER_1);
    },
    decreaseLaserPowerTenPercent() {
      this.laserPower -= 10;
      executeRealTimeGCommands(Constants.GRBL_COMMAND_DECREASE_LASER_POWER_10);
    },
    defaultLaserPower() {
      this.laserPower = 100;
      executeRealTimeGCommands(Constants.GRBL_COMMAND_DEFAULT_LASER_POWER);
    },
    increaseSpindleSpeedOnePercent() {
      this.spindleSpeed += 1;
      executeRealTimeGCommands(Constants.GRBL_COMMAND_INCREASE_SPINDLE_SPEED_1);
    },
    increaseSpindleSpeedTenPercent() {
      this.spindleSpeed += 10;
      executeRealTimeGCommands(
        Constants.GRBL_COMMAND_INCREASE_SPINDLE_SPEED_10
      );
    },
    decreaseSpindleSpeedOnePercent() {
      this.spindleSpeed -= 1;
      executeRealTimeGCommands(Constants.GRBL_COMMAND_DECREASE_SPINDLE_SPEED_1);
    },
    decreaseSpindleSpeedTenPercent() {
      this.spindleSpeed -= 10;
      executeRealTimeGCommands(
        Constants.GRBL_COMMAND_DECREASE_SPINDLE_SPEED_10
      );
    },
    defaultSpindleSpeed() {
      this.spindleSpeed = 100;
      executeRealTimeGCommands(Constants.GRBL_COMMAND_DEFAULT_SPINDLE_SPEED);
    },
  },
});
