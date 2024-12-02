<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    :persistent="true"
    backdrop-filter="blur(4px)"
  >
    <q-card class="q-dialog-plugin dialog-box">
      <div class="column q-ma-lg q-gutter-y-md">
        <span class="full-width text-bold text-h6">AI Settings List:</span>

        <q-scroll-area class="settings-list-box">
          <div v-for="setting in aiSettingsList" :key="setting.settingsId">
            <div
              class="row items-center justify-between q-py-sm"
              :class="[
                {
                  'bg-white': selectedSettingName === setting.name,
                },
              ]"
              @click="() => (selectedSettingName = setting.name)"
            >
              <span class="text-h6 q-pl-md">{{ setting.name }}</span>

              <q-btn
                icon="remove"
                color="negative"
                flat
                @click="handleDeleteSettings(setting.settingsId)"
              >
                <q-tooltip>Delete Setting</q-tooltip>
              </q-btn>
            </div>
            <q-separator />
          </div>
        </q-scroll-area>

        <q-card-actions align="right">
          <q-btn flat color="primary" label="Cancel" @click="onDialogCancel" />
          <q-btn
            unelevated
            color="accent"
            label="Load"
            @click="handleLoadSetting"
            :disable="!selectedSettingName"
          />
        </q-card-actions>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useDialogPluginComponent } from 'quasar';
import { watch, ref } from 'vue';
import { useAiImageGeneratorStore } from 'src/stores/ai-image-generator';
import { showNotifyMessage } from 'src/services/notify.messages.service';

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
defineEmits([...useDialogPluginComponent.emits]);

const aiImageGeneratorDialogStore = useAiImageGeneratorStore();

const { aiSettingsList, aiGeneratorSettingsData, aiSettingName } = storeToRefs(
  aiImageGeneratorDialogStore
);

const selectedSettingName = ref<string>(aiSettingName.value);
const notifyMessage = showNotifyMessage();

const handleLoadSetting = () => {
  const selectedSetting = aiSettingsList.value.find(
    (setting) => setting.name === selectedSettingName.value
  );
  if (selectedSetting) {
    aiGeneratorSettingsData.value = {
      ...aiGeneratorSettingsData.value,
      ...selectedSetting.settings,
    };
    aiSettingName.value = selectedSetting.name;
  }
  onDialogOK();
};

const handleDeleteSettings = async (aiSettingId: number | undefined) => {
  if (aiSettingId) {
    await aiImageGeneratorDialogStore
      .deleteAISetting(aiSettingId)
      .then(() => notifyMessage.success('AI Setting deleted successfully'))
      .catch(() =>
        notifyMessage.error('Something went wrong while deleting the settings')
      );
  }
};

// close the dialog if the settings list is empty
watch(aiSettingsList, (newSettingsList) => {
  if (!newSettingsList.length) {
    onDialogHide();
  }
});
</script>

<style scoped>
.settings-list-box {
  background-color: rgb(236, 236, 236);
  border: solid rgb(206, 206, 206) 2px;
  border-radius: 5px;
  height: 200px;
  width: 100%;
}
.dialog-box {
  min-width: 50vw;
}
</style>
src/stores/ai-image-generator
