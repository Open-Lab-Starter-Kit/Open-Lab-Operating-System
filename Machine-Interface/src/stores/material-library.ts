import axios, { AxiosError } from 'axios';
import { defineStore } from 'pinia';
import { Constants } from 'src/constants';
import { MaterialData } from 'src/interfaces/imageToGcode.interface';
import API from 'src/services/API.service';
import { shallowRef } from 'vue';
import { useImageToGcodeConvertor } from './image-to-gcode';

export const useMaterialLibraryStore = defineStore('materialLibrary', {
  state: () => ({
    // material library
    materialsList: shallowRef<Array<MaterialData>>([]),
    imageToGcodeConvertorStore: useImageToGcodeConvertor(),
  }),

  actions: {
    async fetchMaterialLibraryData() {
      await API.getMaterialsList()
        .then((response) => {
          // update material list
          const materialsListData = response.data.data.materialsList;
          this.materialsList = JSON.parse(materialsListData);
        })
        .catch((error: AxiosError | unknown) => {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data.detail);
          }
        });
    },
    async addNewMaterial(material: MaterialData) {
      await API.addNewMaterial(material)
        .then((response) => {
          // update material list
          const materialsListData = response.data.data.materialsList;
          this.materialsList = JSON.parse(materialsListData);
        })
        .catch((error: AxiosError | unknown) => {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data.detail);
          }
        });
    },
    async updateMaterial(material: MaterialData) {
      await API.updateMaterial(material)
        .then((response) => {
          // update material list
          const materialsListData = response.data.data.materialsList;
          this.materialsList = JSON.parse(materialsListData);
          // update gcode settings incase of user updating the same materials data
          if (
            material.materialName ===
            this.imageToGcodeConvertorStore.gcodeSettings.mainSettings.material
          ) {
            this.updateGcodeFileSettings(material);
          }
        })
        .catch((error: AxiosError | unknown) => {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data.detail);
          }
        });
    },
    async deleteMaterial(materialId: number) {
      // check if the deleted material is the same material that is used in the settings
      const materialName = this.materialsList.find(
        (material) => material.materialId === materialId
      )?.materialName;

      // set default gcode settings
      if (materialName) {
        this.updateGcodeFileSettings();
      }

      // delete material from database
      await API.deleteMaterial(materialId)
        .then((response) => {
          // update material list
          const materialsListData = response.data.data.materialsList;
          this.materialsList = JSON.parse(materialsListData);
        })
        .catch((error: AxiosError | unknown) => {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data.detail);
          }
        });
    },
    updateGcodeFileSettings(material: MaterialData | null = null) {
      if (material) {
        this.setupGcodeSettings(material);
      } else {
        if (this.materialsList.length) {
          const defaultMaterialSettings = this.materialsList[0];
          this.setupGcodeSettings(defaultMaterialSettings);
        }
      }
    },
    setupGcodeSettings(material: MaterialData) {
      // material settings
      this.imageToGcodeConvertorStore.gcodeSettings.mainSettings.material =
        material.materialName;

      // check if material's thickness settings changed
      let thicknessSettings = material.materialThicknesses.find(
        (thickness) =>
          thickness.thicknessValue ===
          this.imageToGcodeConvertorStore.gcodeSettings.mainSettings.thickness
      );

      // incase thickness got deleted, take the first thickness for the material thicknesses list
      if (!thicknessSettings) {
        thicknessSettings = material.materialThicknesses[0];
      }

      if (thicknessSettings) {
        this.imageToGcodeConvertorStore.gcodeSettings.mainSettings.thickness =
          thicknessSettings.thicknessValue;
        // operations settings

        // initial values for profile
        this.imageToGcodeConvertorStore.singleProfileOptions = [
          Constants.PROFILE_OPTIONS.NOTHING,
        ];
        this.imageToGcodeConvertorStore.allProfileOptions = [
          Constants.PROFILE_ALL_OPTIONS.CUSTOM,
        ];

        thicknessSettings.thicknessOperations.map((operation) => {
          if (operation.operationType === Constants.PROFILE_OPTIONS.CUT) {
            this.imageToGcodeConvertorStore.gcodeSettings.cuttingSettings.power =
              operation.power;
            this.imageToGcodeConvertorStore.gcodeSettings.cuttingSettings.speed =
              operation.speed;
            this.imageToGcodeConvertorStore.gcodeSettings.cuttingSettings.tool =
              operation.tool;

            // set profile options
            this.imageToGcodeConvertorStore.singleProfileOptions.push(
              Constants.PROFILE_OPTIONS.CUT
            );
            this.imageToGcodeConvertorStore.allProfileOptions.push(
              Constants.PROFILE_ALL_OPTIONS.CUT_EVERYTHING
            );
          } else if (
            operation.operationType === Constants.PROFILE_OPTIONS.MARK
          ) {
            this.imageToGcodeConvertorStore.gcodeSettings.markingSettings.power =
              operation.power;
            this.imageToGcodeConvertorStore.gcodeSettings.markingSettings.speed =
              operation.speed;
            this.imageToGcodeConvertorStore.gcodeSettings.markingSettings.tool =
              operation.tool;

            // set profile options
            this.imageToGcodeConvertorStore.singleProfileOptions.push(
              Constants.PROFILE_OPTIONS.MARK
            );
            this.imageToGcodeConvertorStore.allProfileOptions.push(
              Constants.PROFILE_ALL_OPTIONS.MARK_EVERYTHING
            );
          } else if (
            operation.operationType === Constants.PROFILE_OPTIONS.ENGRAVE
          ) {
            this.imageToGcodeConvertorStore.gcodeSettings.engravingSettings.power =
              operation.power;
            this.imageToGcodeConvertorStore.gcodeSettings.engravingSettings.speed =
              operation.speed;
            this.imageToGcodeConvertorStore.gcodeSettings.engravingSettings.tool =
              operation.tool;
            if (operation.dithering) {
              this.imageToGcodeConvertorStore.gcodeSettings.engravingSettings.dithering =
                operation.dithering;
            }

            // set profile options
            this.imageToGcodeConvertorStore.singleProfileOptions.push(
              Constants.PROFILE_OPTIONS.ENGRAVE
            );
            this.imageToGcodeConvertorStore.allProfileOptions.push(
              Constants.PROFILE_ALL_OPTIONS.ENGRAVE_EVERYTHING
            );
          }
        });
      } else {
        // incase the material does not have any thickness, setup default material settings
        this.updateGcodeFileSettings();
      }
    },
  },
});
