export type AiGeneratorSettingsData = {
  mainPrompts: string;
  negativePrompts: string;
} & AISetting['settings'];

export interface AISetting {
  settingsId?: number;
  name: string;
  settings: {
    inferenceSteps: number;
    numberOfImages: number;
    guidanceScale: number;
    isSeedsUsed: boolean;
    seed: number;
    imageWidth: number;
    imageHeight: number;
    imageForm: string;
    model: string;
  };
}

export interface AIModelData {
  name: string;
  description: string;
}
