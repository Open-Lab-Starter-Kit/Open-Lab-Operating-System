<template>
  <div class="column q-gutter-y-lg q-pa-md">
    <div class="row items-center justify-between">
      <div class="row flex-center">
        <span class="text-size q-pr-sm">Platform Size:</span>
        <div class="row flex-center q-gutter-x-sm">
          <span>Width</span>
          <!-- <q-input
            v-model.number="platformSize.width"
            type="number"
            outlined
            dense
          />
          <span>Height</span>
          <q-input
            v-model.number="platformSize.height"
            type="number"
            outlined
            dense
          /> -->
        </div>
      </div>
      <div class="row flex-center">
        <span class="text-size q-pr-sm">Laser Power:</span>
        <!-- <q-input v-model.number="laserPower" type="number" outlined dense /> -->
      </div>
    </div>
    <q-separator />
    <div class="row items-center justify-between">
      <div class="row flex-center">
        <span class="text-size q-pr-sm">FeedRate (G1 movement):</span>
        <q-input v-model.number="feedRate" type="number" outlined dense />
      </div>
      <div class="row flex-center">
        <span class="text-size q-pr-sm">SeekRate (G0 movement):</span>
        <q-input v-model.number="seekRate" type="number" outlined dense />
      </div>
    </div>
    <q-separator />
    <div class="row items-center justify-between">
      <div class="row flex-center">
        <span class="text-size q-pr-sm">Margin:</span>
        <q-input v-model.number="margin" type="number" outlined dense />
      </div>
      <div class="row flex-center q-gutter-xl">
        <div class="row flex-center">
          <span class="text-size q-pr-sm">Flip X-Axis:</span>
          <q-select
            square
            outlined
            dense
            behavior="menu"
            :options="['Yes', 'No']"
            v-model="flipX"
          />
        </div>
        <div class="row flex-center">
          <span class="text-size q-pr-sm">Flip Y-Axis:</span>
          <q-select
            square
            outlined
            dense
            behavior="menu"
            :options="['Yes', 'No']"
            v-model="flipY"
          />
        </div>
      </div>
    </div>
    <q-separator />
    <div class="row items-center justify-start full-width">
      <span class="text-size q-pr-sm">File Name:</span>
      <q-input
        v-model.text="fileName"
        type="text"
        outlined
        dense
        class="col"
        suffix=".gcode"
      />
    </div>
    <!-- <q-btn
      label="Save Changes"
      color="green"
      size="lg"
      dense
      class="self-end q-pa-sm"
      style="width: fit-content"
      @click="handleSavingGcodeSettings"
      :disable="isSaveButtonDisabled"
    /> -->
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useImageToGcodeConvertor } from 'src/stores/image-to-gcode';
import { computed, ref } from 'vue';

const $q = useQuasar();
const svgToGcodeConvertorStore = useImageToGcodeConvertor();
const { gcodeSettings } = storeToRefs(svgToGcodeConvertorStore);

// const platformSize = ref({
//   width: gcodeSettings.value.paperSize[0],
//   height: gcodeSettings.value.paperSize[1],
// });

// get the laser power number from the onCommand string
// const gcodeSettingsLaserPower = computed(() => {
//   // const index = gcodeSettings.value.onCommand.indexOf('S');
//   // if (index !== -1 && index < gcodeSettings.value.onCommand.length - 1) {
//   //   return parseFloat(gcodeSettings.value.onCommand.substring(index + 1));
//   // } else {
//   //   return 0;
//   // }
// });

// const laserPower = ref(gcodeSettingsLaserPower.value);
const margin = ref(gcodeSettings.value.margin);
const feedRate = ref(gcodeSettings.value.feedRate);
const seekRate = ref(gcodeSettings.value.seekRate);

const flipX = ref(gcodeSettings.value.flipX ? 'Yes' : 'No');
const flipY = ref(gcodeSettings.value.flipY ? 'Yes' : 'No');
const fileName = ref(gcodeSettings.value.fileName);

const handleSavingGcodeSettings = () => {
  // gcodeSettings.value = {
  //   paperSize: [platformSize.value.width, platformSize.value.height],
  //   margin: margin.value,
  //   feedRate: feedRate.value,
  //   seekRate: seekRate.value,
  //   flipX: flipX.value === 'Yes',
  //   flipY: flipY.value === 'Yes',
  //   onCommand: `M3S${laserPower.value}`,
  //   offCommand: 'S0',
  //   fileName: fileName.value,
  // };
  // // show notification to confirm saving settings
  // $q.notify({
  //   message: 'Settings saved successfully',
  //   icon: 'task_alt',
  //   color: 'green-4',
  //   timeout: 1000,
  // });
};

// make sure all fields contain values
// const isSaveButtonDisabled = computed(
//   () =>
//     typeof platformSize.value.width !== 'number' ||
//     typeof platformSize.value.height !== 'number' ||
//     typeof margin.value !== 'number' ||
//     typeof feedRate.value !== 'number' ||
//     typeof seekRate.value !== 'number' ||
//     typeof laserPower.value !== 'number' ||
//     laserPower.value > 100 ||
//     margin.value > platformSize.value.width ||
//     margin.value > platformSize.value.height ||
//     fileName.value === ''
// );
</script>
<style>
.text-size {
  font-size: 18px;
}
</style>
