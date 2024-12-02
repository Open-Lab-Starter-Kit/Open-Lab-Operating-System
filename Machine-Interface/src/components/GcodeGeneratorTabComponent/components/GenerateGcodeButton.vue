<template>
  <transition
    appear
    enter-active-class="animated  fadeIn"
    leave-active-class="animated fadeOut"
  >
    <q-btn
      v-if="!isGenerateGcodeButtonDisabled"
      label="Generate Gcode"
      icon="note_add"
      size="lg"
      color="primary"
      unelevated
      class="self-start"
      @click="handleGenerateGcode"
      :loading="isGeneratingFile"
    />
  </transition>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useTabsStore } from 'src/stores/active-tab';
import { useJobsFilesManagementStore } from 'src/stores/jobs-files-management';
import { showNotifyMessage } from 'src/services/notify.messages.service';
import { useImageToGcodeConvertor } from 'src/stores/image-to-gcode';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { Constants } from 'src/constants';
import { watch, ref } from 'vue';

const $q = useQuasar();

const tabsStore = useTabsStore();
const imageToGcodeConvertorStore = useImageToGcodeConvertor();
const jobManagerStore = useJobsFilesManagementStore();
const machineStatusStore = useMachineStatusStore();

const { navList } = storeToRefs(tabsStore);
const { filesListData } = storeToRefs(jobManagerStore);
const { machineState } = storeToRefs(machineStatusStore);
const { modifiedImage, modifiedSVGCutting, modifiedSVGMarking, gcodeSettings } =
  storeToRefs(imageToGcodeConvertorStore);

const notifyMessage = showNotifyMessage();
const isGeneratingFile = ref<boolean>(false);
const isGenerateGcodeButtonDisabled = ref<boolean>(true);

watch(
  () => [modifiedImage, modifiedSVGCutting, modifiedSVGMarking],
  () => {
    if (
      modifiedImage.value === null &&
      modifiedSVGCutting.value === null &&
      modifiedSVGMarking.value === null
    ) {
      isGenerateGcodeButtonDisabled.value = true;
    } else {
      isGenerateGcodeButtonDisabled.value = false;
    }
  },
  { deep: true }
);

const handleGenerateGcode = () => {
  // ask the user to enter the job name
  showFileNameDialog().onOk((name: string) => {
    const filename = `${name}.nc`;
    const filesNameList = filesListData.value.map((fileData) => fileData.file);
    // file name already exist
    if (filesNameList.includes(filename)) {
      showAlreadyExistFileAlert().onOk(() => startGeneratingGcode(filename));
    } else {
      startGeneratingGcode(filename);
    }
  });
};

const startGeneratingGcode = (filename: string) => {
  if (gcodeSettings.value) {
    gcodeSettings.value.mainSettings.filename = filename;
    isGeneratingFile.value = true;
    const generatingDialog = showGeneratingFileDialog();
    // api call
    jobManagerStore
      .generateGcodeFile(
        modifiedSVGCutting.value,
        modifiedSVGMarking.value,
        modifiedImage.value,
        gcodeSettings.value
      )
      .then(() => {
        if (isGeneratingFile.value) {
          generatingDialog.hide();
          isGeneratingFile.value = false;
          showDoneGeneratingFileDialog();
        }
      })
      .catch((error) => {
        isGeneratingFile.value = false;
        notifyMessage.error(error.message);
      });
    // incase the user cancel the generating process
    generatingDialog.onCancel(async () => {
      if (isGeneratingFile.value) {
        isGeneratingFile.value = false;
        await jobManagerStore.cancelGenerateGcodeFile();
      }
    });
  }
};

const showFileNameDialog = () => {
  return $q.dialog({
    title: 'Gcode Generator',
    html: true,
    color: 'primary',
    prompt: {
      model: '',
      suffix: '.nc',
      isValid: (val) => {
        if (val.length > 0) {
          return true;
        }
        return false;
      },
      type: 'text',
    },
    message: 'what would you like to name your job file?',
    cancel: true,
  });
};

const showGeneratingFileDialog = () => {
  return $q.dialog({
    title: 'Generating...',
    progress: {
      color: 'primary',
    },
    persistent: true,
    ok: false,
    cancel: true,
  });
};

const showAlreadyExistFileAlert = () => {
  return $q.dialog({
    title: 'Gcode Generator',
    html: true,
    color: 'primary',
    message: 'Do you want to overwrite an already exist job file?',
    ok: {
      color: 'negative',
      label: 'Yes ⚠️',
      push: false,
    },
    cancel: {
      flat: true,
      label: 'No',
    },
  });
};

const showDoneGeneratingFileDialog = () => {
  $q.dialog({
    color: 'primary',
    title: 'Done!',
    message: 'File generated and saved successfully in the Jobs Manager',
    progress: false,
    ok: {
      color: 'primary',
      label: 'Jobs Manager',
      push: false,
      disable: machineState.value === Constants.RUN,
    },
    cancel: true,
  }).onOk(() => tabsStore.changeTab(navList.value.files));
};
</script>
