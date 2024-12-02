import { defineStore } from 'pinia';

const sliderLabelsValues = [0.1, 1, 10, 100];
const speedChoices = { slow: 10, normal: 50, fast: 200 };

export const useJogControlsStore = defineStore('jogControls', {
  state: () => ({
    jobProgress: 0,
    isXYLocked: true as boolean,
    isCustomXStepValue: false as boolean,
    isCustomYStepValue: false as boolean,
    isCustomZStepValue: false as boolean,
    xSliderValue: 0 as number,
    ySliderValue: 0 as number,
    zSliderValue: 0 as number,
    xJogStep: 0.1 as number,
    yJogStep: 0.1 as number,
    zJogStep: 0.1 as number,
    isCustomXYSpeedValue: false as boolean,
    isCustomZSpeedValue: false as boolean,
    xyJogSpeed: speedChoices.slow as number,
    zJogSpeed: speedChoices.slow as number,
    xyChosenSpeed: 'slow' as string,
    zChosenSpeed: 'slow' as string,
  }),

  actions: {
    changeXYLockStatus() {
      this.isXYLocked = !this.isXYLocked;
      this.yJogStep = this.xJogStep;
      this.ySliderValue = this.xSliderValue;
    },
    setXJogStepSlider() {
      this.xJogStep = sliderLabelsValues[this.xSliderValue];
    },
    setYJogStepSlider() {
      this.yJogStep = sliderLabelsValues[this.ySliderValue];
    },
    setZJogStepSlider() {
      this.zJogStep = sliderLabelsValues[this.zSliderValue];
    },
    setCustomXStep(value: number) {
      this.xJogStep = value;
    },
    setCustomYStep(value: number) {
      this.yJogStep = value;
    },
    setCustomZStep(value: number) {
      this.zJogStep = value;
    },
    setXYSpeedChoice(choice: string) {
      if (choice === 'slow') this.xyJogSpeed = speedChoices.slow;
      else if (choice === 'normal') this.xyJogSpeed = speedChoices.normal;
      else if (choice === 'fast') this.xyJogSpeed = speedChoices.fast;

      // change the label based on the choice
      this.xyChosenSpeed = choice;
    },
    setZSpeedChoice(choice: string) {
      if (choice === 'slow') this.zJogSpeed = speedChoices.slow;
      else if (choice === 'normal') this.zJogSpeed = speedChoices.normal;
      else if (choice === 'fast') this.zJogSpeed = speedChoices.fast;

      // change the label based on the choice
      this.zChosenSpeed = choice;
    },
    setCustomXYSpeed(value: number) {
      this.xyJogSpeed = value;
    },
    setCustomZSpeed(value: number) {
      this.zJogSpeed = value;
    },
  },
});
