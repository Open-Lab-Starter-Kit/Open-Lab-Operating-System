<template>
  <div class="column q-gutter-y-md">
    <p class="text-h6"><u>Main Settings:</u></p>

    <div class="row items-center justify-start q-gutter-x-md q-pb-md">
      <span class="text-size">Material Name:</span>
      <q-select
        filled
        behavior="menu"
        v-model="selectedMaterial"
        :options="materialsList ? materialsList : []"
        clearable
        class="row col"
        dense
        @update:model-value="handleRemoveMaterialThickness"
      >
        <template v-slot:selected-item="scope">
          <q-item class="row full-width items-center justify-between">
            <q-item-section>
              <q-item-label class="text-h6">{{
                scope.opt.materialName
              }}</q-item-label>
            </q-item-section>
            <q-item-section v-if="scope.opt.materialImage">
              <q-img :src="scope.opt.materialImage" class="material-img" />
            </q-item-section>
          </q-item>
        </template>
        <template v-slot:option="scope">
          <q-item
            v-bind="scope.itemProps"
            class="row full-width items-center justify-between"
          >
            <q-item-section>
              <q-item-label class="text-h6">{{
                scope.opt.materialName
              }}</q-item-label>
            </q-item-section>
            <q-item-section v-if="scope.opt.materialImage">
              <q-img :src="scope.opt.materialImage" class="material-img" />
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>

    <transition
      appear
      enter-active-class="animated slideInDown"
      v-if="selectedMaterial"
    >
      <div class="row items-center col col-xs-12">
        <span class="text-size">Material Thickness:</span>
        <q-select
          filled
          behavior="menu"
          v-model="selectedMaterialThickness"
          :options="
            selectedMaterial.materialThicknesses
              ? selectedMaterial.materialThicknesses
              : []
          "
          clearable
          class="row col"
          @update:model-value="handleThicknessChange"
        >
          <template v-slot:selected-item="scope">
            <q-item-section>
              <q-item-label>{{ scope.opt.thicknessValue }} mm</q-item-label>
            </q-item-section>
          </template>
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.thicknessValue }} mm</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </transition>

    <transition
      appear
      enter-active-class="animated slideInDown"
      v-if="selectedMaterialThickness"
    >
      <div class="column q-gutter-y-md">
        <q-separator />

        <q-select
          v-model="selectedOperation"
          label="Operations Settings"
          :options="
            selectedMaterialThickness.thicknessOperations
              ? selectedMaterialThickness.thicknessOperations
              : []
          "
          square
          outlined
          behavior="menu"
          class="settings-selector"
        >
          <template v-slot:selected-item="scope">
            <q-item-section>
              <q-item-label>{{ scope.opt.operationType }}</q-item-label>
            </q-item-section>
          </template>
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.operationType }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </transition>

    <transition
      appear
      enter-active-class="animated slideInDown"
      v-if="selectedMaterialThickness && selectedOperation"
    >
      <div>
        <div
          v-if="
            selectedOperation.operationType === Constants.PROFILE_OPTIONS.CUT
          "
          class="column"
        >
          <p class="text-h6"><u>Cutting Settings:</u></p>
          <operation-main-settings
            :config="config"
            v-model:power="laserPowerCutting"
            v-model:speed="movementSpeedCutting"
            v-model:tool="laserToolCutting"
            v-model:is-valid-power="isValidLaserPowerCutting"
            v-model:is-valid-speed="isValidMovementSpeedCutting"
          />
        </div>

        <div
          v-else-if="
            selectedOperation.operationType === Constants.PROFILE_OPTIONS.MARK
          "
          class="column"
        >
          <p class="text-h6"><u>Marking Settings:</u></p>
          <operation-main-settings
            :config="config"
            v-model:power="laserPowerMarking"
            v-model:speed="movementSpeedMarking"
            v-model:tool="laserToolMarking"
            v-model:is-valid-power="isValidLaserPowerMarking"
            v-model:is-valid-speed="isValidMovementSpeedMarking"
          />
        </div>

        <div
          v-else-if="
            selectedOperation.operationType ===
            Constants.PROFILE_OPTIONS.ENGRAVE
          "
          class="column"
        >
          <p class="text-h6"><u>Engraving Settings:</u></p>

          <operation-main-settings
            :config="config"
            v-model:power="laserPowerEngraving"
            v-model:speed="movementSpeedEngraving"
            v-model:tool="laserToolEngraving"
            v-model:is-valid-power="isValidLaserPowerEngraving"
            v-model:is-valid-speed="isValidMovementSpeedEngraving"
          />

          <dithering-settings
            :config="config"
            v-model:algorithm="ditheringAlgorithm"
            v-model:resolution="ditheringResolution"
            v-model:grayShift="ditheringGrayShift"
            v-model:block-size="ditheringBlockSize"
            v-model:block-distance="ditheringBlockDistance"
            v-model:is-valid-resolution="isValidDitheringResolution"
            class="q-pt-md"
          />
        </div>
        <q-separator />
      </div>
    </transition>

    <div
      v-if="selectedMaterial && selectedMaterialThickness"
      class="column q-gutter-y-md"
    >
      <q-btn
        label="Save Settings"
        size="lg"
        color="primary"
        unelevated
        icon="save"
        @click="handleSavingSettings"
        :disable="isSaveButtonDisabled"
      />
      <q-separator />
      <p class="note">
        Note: Changing the settings here will not modify the main material
        settings.
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import { useImageToGcodeConvertor } from 'src/stores/image-to-gcode';
import { useMaterialLibraryStore } from 'src/stores/material-library';
import {
  MaterialData,
  MaterialThickness,
  ThicknessOperation,
} from 'src/interfaces/imageToGcode.interface';
import { computed, onMounted, ref } from 'vue';
import { showNotifyMessage } from 'src/services/notify.messages.service';
import { Config } from 'src/interfaces/configSettings.interface';
import OperationMainSettings from 'src/components/GcodeGeneratorTabComponent/components/components/OperationMainSettings.vue';
import DitheringSettings from 'src/components/GcodeGeneratorTabComponent/components/components/DitheringSettings.vue';

const imageToGcodeConvertorStore = useImageToGcodeConvertor();
const materialLibraryStore = useMaterialLibraryStore();

const {
  gcodeSettings,
  imageFile,
  modifiedImage,
  modifiedSVGCutting,
  modifiedSVGMarking,
  singleProfileOptions,
  allProfileOptions,
} = storeToRefs(imageToGcodeConvertorStore);

const { materialsList } = storeToRefs(materialLibraryStore);

defineProps<{
  config: Config | null;
}>();

// initial hooks
const selectedMaterial = ref<MaterialData | null>();
const selectedMaterialThickness = ref<MaterialThickness | null>();
const selectedOperation = ref<ThicknessOperation | null>();

// cutting
const movementSpeedCutting = ref<number>(
  gcodeSettings.value.cuttingSettings.speed
);
const laserPowerCutting = ref<number>(
  gcodeSettings.value.cuttingSettings.power
);
const laserToolCutting = ref<string>(gcodeSettings.value.cuttingSettings.tool);

// marking
const movementSpeedMarking = ref<number>(
  gcodeSettings.value.markingSettings.speed
);
const laserPowerMarking = ref<number>(
  gcodeSettings.value.markingSettings.power
);
const laserToolMarking = ref<string>(gcodeSettings.value.markingSettings.tool);

// engraving
const movementSpeedEngraving = ref<number>(
  gcodeSettings.value.engravingSettings.speed
);
const laserPowerEngraving = ref<number>(
  gcodeSettings.value.engravingSettings.power
);
const laserToolEngraving = ref<string>(
  gcodeSettings.value.engravingSettings.tool
);
const ditheringAlgorithm = ref<string>(
  gcodeSettings.value.engravingSettings.dithering.algorithm
);
const ditheringResolution = ref<number>(
  gcodeSettings.value.engravingSettings.dithering.resolution
);
const ditheringGrayShift = ref<number>(
  gcodeSettings.value.engravingSettings.dithering.grayShift
);
const ditheringBlockSize = ref<number>(
  gcodeSettings.value.engravingSettings.dithering.blockSize
);
const ditheringBlockDistance = ref<number>(
  gcodeSettings.value.engravingSettings.dithering.blockDistance
);

const isValidLaserPowerCutting = ref<boolean>(true);
const isValidMovementSpeedCutting = ref<boolean>(true);
const isValidLaserPowerMarking = ref<boolean>(true);
const isValidMovementSpeedMarking = ref<boolean>(true);
const isValidLaserPowerEngraving = ref<boolean>(true);
const isValidMovementSpeedEngraving = ref<boolean>(true);
const isValidDitheringResolution = ref<boolean>(true);

const handleSavingSettings = () => {
  // save all the settings
  if (selectedMaterial.value && selectedMaterialThickness.value) {
    // main settings
    gcodeSettings.value.mainSettings.material =
      selectedMaterial.value.materialName;
    gcodeSettings.value.mainSettings.thickness =
      selectedMaterialThickness.value.thicknessValue;

    // cutting settings
    gcodeSettings.value.cuttingSettings.speed = movementSpeedCutting.value;
    gcodeSettings.value.cuttingSettings.power = laserPowerCutting.value;
    gcodeSettings.value.cuttingSettings.tool = laserToolCutting.value;

    // // marking settings
    gcodeSettings.value.markingSettings.speed = movementSpeedMarking.value;
    gcodeSettings.value.markingSettings.power = laserPowerMarking.value;
    gcodeSettings.value.markingSettings.tool = laserToolMarking.value;

    // engraving settings
    gcodeSettings.value.engravingSettings.speed = movementSpeedEngraving.value;
    gcodeSettings.value.engravingSettings.power = laserPowerEngraving.value;
    gcodeSettings.value.engravingSettings.tool = laserToolEngraving.value;
    gcodeSettings.value.mainSettings.thickness =
      selectedMaterialThickness.value.thicknessValue;
    gcodeSettings.value.engravingSettings.dithering = {
      algorithm: ditheringAlgorithm.value,
      resolution: ditheringResolution.value,
      grayShift: ditheringGrayShift.value,
      blockSize: ditheringBlockSize.value,
      blockDistance: ditheringBlockDistance.value,
    };

    changeProfileOptions();

    applySettings();

    const notifyMessage = showNotifyMessage();

    // show notification to confirm saving settings
    notifyMessage.success('Settings saved successfully');
  }
};

const applySettings = () => {
  if (
    imageFile.value?.type === 'image/svg+xml' &&
    (modifiedSVGCutting.value || modifiedSVGMarking.value)
  ) {
    imageToGcodeConvertorStore.applySVGChanges();
  } else if (modifiedImage.value) {
    imageToGcodeConvertorStore.applyImageChanges();
  }
};

const changeProfileOptions = () => {
  // initial values
  singleProfileOptions.value = [Constants.PROFILE_OPTIONS.NOTHING];
  allProfileOptions.value = [Constants.PROFILE_ALL_OPTIONS.CUSTOM];
  if (selectedMaterialThickness.value) {
    selectedMaterialThickness.value.thicknessOperations.forEach((operation) => {
      // set profiles options
      switch (operation.operationType) {
        case Constants.PROFILE_OPTIONS.CUT:
          singleProfileOptions.value.push(Constants.PROFILE_OPTIONS.CUT);
          allProfileOptions.value.push(
            Constants.PROFILE_ALL_OPTIONS.CUT_EVERYTHING
          );
          break;
        case Constants.PROFILE_OPTIONS.MARK:
          singleProfileOptions.value.push(Constants.PROFILE_OPTIONS.MARK);
          allProfileOptions.value.push(
            Constants.PROFILE_ALL_OPTIONS.MARK_EVERYTHING
          );
          break;
        case Constants.PROFILE_OPTIONS.ENGRAVE:
          singleProfileOptions.value.push(Constants.PROFILE_OPTIONS.ENGRAVE);
          allProfileOptions.value.push(
            Constants.PROFILE_ALL_OPTIONS.ENGRAVE_EVERYTHING
          );
          break;
      }
    });
  }
};

// make sure all fields contain values
const isSaveButtonDisabled = computed(
  () =>
    !(
      isValidLaserPowerCutting.value &&
      isValidLaserPowerMarking.value &&
      isValidLaserPowerEngraving.value &&
      isValidMovementSpeedCutting.value &&
      isValidMovementSpeedMarking.value &&
      isValidMovementSpeedEngraving.value &&
      isValidDitheringResolution.value
    )
);

const handleRemoveMaterialThickness = () => {
  selectedMaterialThickness.value = null;
};

const handleThicknessChange = (thickness: MaterialThickness | null) => {
  if (thickness) {
    // clear selected operation
    selectedOperation.value = null;

    // Handle operations individually
    thickness.thicknessOperations.forEach((operation) => {
      switch (operation.operationType) {
        case Constants.PROFILE_OPTIONS.CUT:
          laserPowerCutting.value = operation.power;
          movementSpeedCutting.value = operation.speed;
          laserToolCutting.value = operation.tool;
          break;

        case Constants.PROFILE_OPTIONS.MARK:
          laserPowerMarking.value = operation.power;
          movementSpeedMarking.value = operation.speed;
          laserToolMarking.value = operation.tool;
          break;

        case Constants.PROFILE_OPTIONS.ENGRAVE:
          laserPowerEngraving.value = operation.power;
          movementSpeedEngraving.value = operation.speed;
          laserToolEngraving.value = operation.tool;
          if (operation.dithering) {
            ditheringAlgorithm.value = operation.dithering.algorithm;
            ditheringResolution.value = operation.dithering.resolution;
            ditheringGrayShift.value = operation.dithering.grayShift;
            ditheringBlockSize.value = operation.dithering.blockSize;
            ditheringBlockDistance.value = operation.dithering.blockDistance;
          }
          break;
      }
    });
  }
};

const setupSettingBasedOnGcodeSettings = () => {
  if (materialsList.value) {
    selectedMaterial.value = materialsList.value.find(
      (material) =>
        material.materialName === gcodeSettings.value.mainSettings.material
    );
    selectedMaterialThickness.value =
      selectedMaterial.value?.materialThicknesses.find(
        (thickness) =>
          thickness.thicknessValue ===
          gcodeSettings.value.mainSettings.thickness
      );
  }
};

onMounted(() => {
  setupSettingBasedOnGcodeSettings();
});
</script>
<style>
.text-size {
  font-size: 18px;
  padding-right: 10px;
}

.settings-selector {
  width: 15vw;
}
.material-img {
  flex-direction: row;
  align-self: self-end;
  max-width: 3vw;
  max-height: 3vw;
}
.note {
  color: red;
}
</style>
