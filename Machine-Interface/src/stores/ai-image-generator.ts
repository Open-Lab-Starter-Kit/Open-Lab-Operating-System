import axios, { AxiosError } from 'axios';
import { defineStore } from 'pinia';
import { Constants } from 'src/constants';
import {
  AiGeneratorSettingsData,
  AISetting,
} from 'src/interfaces/aiGeneratorImage.interface';
import { AIApiResponse } from 'src/interfaces/API.interface';
import API from 'src/services/API.service';
import { svgStringToBase64DataUri } from 'src/services/svg.editor.service';

export const useAiImageGeneratorStore = defineStore('imageGeneratorStore', {
  state: () => ({
    aiGeneratorSettingsData: structuredClone(
      Constants.DEFAULT_AI_GENERATOR_SETTINGS
    ) as AiGeneratorSettingsData,
    isAIImageGeneratorDialogShown: false as boolean,
    originalGeneratedImages: [] as Array<string>,
    base64GeneratedImages: [] as Array<string>,
    aiSettingName: '' as string,
    aiSettingsList: [] as AISetting[],
    isLoadingImages: false as boolean,
    aiModelsList: [] as string[],
    isReceivedImagesSVGForm: false as boolean,
  }),
  actions: {
    async fetchAIConfigData() {
      await API.getAIConfigData()
        .then((response) => {
          this.updateAIConfigurations(response.data);
        })
        .catch((error: AxiosError | unknown) => {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data.detail);
          }
        });
      if (this.aiModelsList.length) {
        this.aiGeneratorSettingsData.model = this.aiModelsList[0];
      }
    },
    showAIGeneratorDialog() {
      this.isAIImageGeneratorDialogShown = true;
    },
    closeAIGeneratorDialog() {
      this.isAIImageGeneratorDialogShown = false;
    },
    async addAISetting(name: string) {
      const aiSettings = {
        name,
        settings: {
          ...this.aiGeneratorSettingsData,
        },
      };

      await API.addNewAISettings(aiSettings)
        .then((response) => {
          this.updateAIConfigurations(response.data);
        })
        .catch((error: AxiosError | unknown) => {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data.detail);
          }
        });

      this.aiSettingName = name;
    },
    async modifyAISetting(name: string) {
      const aiSettings = this.aiSettingsList.find(
        (setting) => setting.name === name
      );
      if (aiSettings) {
        // update the settings with the new user settings
        aiSettings.settings = this.aiGeneratorSettingsData;

        await API.updateAISetting(aiSettings)
          .then((response) => {
            this.updateAIConfigurations(response.data);
          })
          .catch((error: AxiosError | unknown) => {
            if (axios.isAxiosError(error)) {
              throw new Error(error.response?.data.detail);
            }
          });
      }
    },
    async deleteAISetting(aiSettingId: number) {
      // check if the deleted setting is currently used
      const settingName = this.aiSettingsList.find(
        (setting) => setting.settingsId === aiSettingId
      )?.name;
      if (settingName && settingName === this.aiSettingName) {
        this.resetAiImageGeneratorSettings();
      }

      // delete api call
      await API.deleteAISetting(aiSettingId)
        .then((response) => {
          this.updateAIConfigurations(response.data);
        })
        .catch((error: AxiosError | unknown) => {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data.detail);
          }
        });
    },
    async generateAIImages() {
      this.isLoadingImages = true;
      await API.generateAIImages(this.aiGeneratorSettingsData)
        .then(async (response) => {
          const generatedImagesData = response.data.data.images;
          this.isReceivedImagesSVGForm = response.data.data.isSVGImages;
          if (generatedImagesData) {
            this.originalGeneratedImages = this.base64GeneratedImages =
              JSON.parse(generatedImagesData);
          }
          this.isLoadingImages = false;
        })
        .catch((error: AxiosError | unknown) => {
          if (axios.isAxiosError(error)) {
            // client cancel http code
            if (error.response?.status === 499) {
              throw new Error('Generating images process got canceled');
            }

            throw new Error(
              Constants.API_ERROR_MESSAGES.GENERATE_MESSAGE +
                error.response?.data.detail
            );
          }
        });
    },
    async cancelGeneratingImages() {
      await API.cancelGeneratingImages()
        .then(() => (this.isLoadingImages = false))
        .catch((error: AxiosError | unknown) => {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data.detail);
          }
        });
    },
    async updateAIConfigurations(data: AIApiResponse) {
      const aiModelsListData = data.data.aiModelsList;
      const aiSettingsData = data.data.aiSettingsList;
      this.aiModelsList = JSON.parse(aiModelsListData);
      this.aiSettingsList = JSON.parse(aiSettingsData);
    },
    resetAiImageGeneratorSettings() {
      this.aiGeneratorSettingsData = structuredClone(
        Constants.DEFAULT_AI_GENERATOR_SETTINGS
      );
      this.aiGeneratorSettingsData.model = this.aiModelsList[0];
      this.aiSettingName = '';
    },
  },
});
