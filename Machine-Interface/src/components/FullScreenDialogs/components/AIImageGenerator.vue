<template>
  <q-dialog
    v-model="isAIImageGeneratorDialogShown"
    persistent
    maximized
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="bg-grey-4">
      <div class="column fit">
        <q-bar
          class="row full-width text-white bg-primary items-center justify-between q-py-lg"
        >
          <h5 class="text-bold">AI Image Generator</h5>
          <q-btn
            dense
            flat
            icon="close"
            size="lg"
            @click="aiImageGeneratorDialogStore.closeAIGeneratorDialog"
          >
            <q-tooltip class="text-white">Close</q-tooltip>
          </q-btn>
        </q-bar>

        <div class="row full-width col">
          <div
            class="column col-md-6 col-sm-12 col-xs-12 items-center justify-between q-pa-md q-gutter-y-md"
          >
            <div class="row flex-center images-container">
              <transition
                appear
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut"
              >
                <q-carousel
                  v-if="originalGeneratedImages.length"
                  v-model="imageSliderNumber"
                  v-model:fullscreen="isFullScreen"
                  swipeable
                  animated
                  thumbnails
                  infinite
                  class="fit"
                >
                  <q-carousel-slide
                    v-for="(image, index) in base64GeneratedImages"
                    :key="index"
                    :name="index"
                    :img-src="image"
                    class="images-style"
                  />
                  <template v-slot:control>
                    <image-controls-button
                      :is-full-screen="isFullScreen"
                      :is-loading-images="isLoadingImages"
                      :handle-full-screen
                      :handle-use-image
                      :handle-save-image
                      :handle-download-image
                    />
                  </template>
                </q-carousel>

                <q-icon v-else name="image" size="10vw" color="grey" />
              </transition>

              <q-inner-loading
                class="column fit items-center justify-between"
                :showing="isLoadingImages"
              >
                <q-spinner class="col" size="100" color="primary" />
              </q-inner-loading>
            </div>

            <div class="column full-width">
              <span class="text-h6">Prompts:</span>
              <q-input
                v-model="aiGeneratorSettingsData.mainPrompts"
                autofocus
                outlined
                color="primary"
                bg-color="white"
                type="textarea"
                :placeholder="
                  Constants.AI_ASSISTANT_MESSAGES.PROMPTS_PLACEHOLDER
                "
                class="full-width"
                :disable="isLoadingImages"
              />
            </div>
            <div class="column full-width">
              <div class="row items-center q-gutter-x-md">
                <span class="text-h6"
                  >Negative Prompts: (set guidance scale > 1.0)</span
                >
                <q-icon name="help" size="sm" color="blue-grey-9">
                  <q-tooltip
                    anchor="center right"
                    self="center left"
                    :offset="[10, 10]"
                  >
                    {{
                      Constants.AI_ASSISTANT_MESSAGES.NEGATIVE_PROMPTS_MESSAGE
                    }}
                  </q-tooltip>
                </q-icon>
              </div>
              <q-input
                v-model="aiGeneratorSettingsData.negativePrompts"
                outlined
                color="primary"
                bg-color="white"
                type="text"
                :placeholder="
                  Constants.AI_ASSISTANT_MESSAGES.NEGATIVE_PROMPTS_PLACEHOLDER
                "
                class="full-width"
                :disable="isLoadingImages"
              />
            </div>
            <div class="row full-width items-center justify-between">
              <q-btn
                :loading="isLoadingImages"
                size="lg"
                :class="{
                  'col-11': isLoadingImages,
                  'full-width': !isLoadingImages,
                }"
                color="primary"
                @click="handleAIGenerateImages"
                :disable="
                  !aiGeneratorSettingsData.mainPrompts || isLoadingImages
                "
              >
                Generate
                <template v-slot:loading>
                  <div class="row items-center q-gutter-x-md">
                    Please be patient. This process may take some time
                    <q-spinner-hourglass />
                  </div>
                </template>
              </q-btn>
              <q-btn
                v-if="isLoadingImages"
                icon="cancel"
                size="lg"
                color="negative"
                class="q-ml-sm col"
                @click="handleCancelGeneratingImage"
              />
            </div>
          </div>

          <q-separator
            :vertical="!$q.screen.lt.md"
            color="black"
            class="q-my-md"
            size="sm"
          />

          <div
            class="column full-width col items-center justify-between q-pa-md q-gutter-y-md"
          >
            <div class="column full-width">
              <span class="text-h6">AI Models List:</span>
              <q-select
                outlined
                v-model="aiGeneratorSettingsData.model"
                :options="aiModelsList"
                bg-color="white"
                behavior="menu"
                :disable="isLoadingImages"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt }}</q-item-label>
                      <q-item-label caption>{{
                        getAIModelDescription(scope.opt)
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <q-separator class="full-width" />

            <div class="column full-width">
              <span class="text-h6">Number of Images:</span>
              <div class="row flex-center q-gutter-x-md">
                <q-slider
                  v-model="aiGeneratorSettingsData.numberOfImages"
                  markers
                  snap
                  :min="1"
                  :max="5"
                  thumb-size="15px"
                  class="col"
                  :disable="isLoadingImages"
                />
                <span
                  class="col-1 q-pa-sm bg-white rounded-borders text-center"
                >
                  {{ aiGeneratorSettingsData.numberOfImages }}</span
                >
              </div>
            </div>
            <div class="column full-width">
              <span class="text-h6">Image Width:</span>
              <q-select
                outlined
                v-model="aiGeneratorSettingsData.imageWidth"
                :options="Constants.AI_IMAGE_SIZE_OPTIONS"
                suffix="px"
                bg-color="white"
                behavior="menu"
                :disable="isLoadingImages"
              />
            </div>
            <div class="column full-width">
              <span class="text-h6">Image Height:</span>
              <q-select
                outlined
                v-model="aiGeneratorSettingsData.imageHeight"
                :options="Constants.AI_IMAGE_SIZE_OPTIONS"
                suffix="px"
                bg-color="white"
                behavior="menu"
                :disable="isLoadingImages"
              />
            </div>

            <div class="row items-center full-width">
              <span class="text-h6">Image Type:</span>
              <div class="row col">
                <q-radio
                  v-model="aiGeneratorSettingsData.imageForm"
                  val="PNG"
                  label="PNG"
                  size="lg"
                  :disable="isLoadingImages"
                />
                <q-radio
                  v-model="aiGeneratorSettingsData.imageForm"
                  val="SVG"
                  label="SVG"
                  size="lg"
                  :disable="isLoadingImages"
                />
              </div>
            </div>

            <q-separator class="full-width" />

            <div class="column full-width">
              <div class="row items-center q-gutter-x-md">
                <span class="text-h6">Number of Inference Steps:</span>
                <q-icon name="help" size="sm" color="blue-grey-9">
                  <q-tooltip
                    anchor="center right"
                    self="center left"
                    :offset="[10, 10]"
                  >
                    {{
                      Constants.AI_ASSISTANT_MESSAGES.INFERENCE_STEPS_MESSAGE
                    }}
                  </q-tooltip>
                </q-icon>
              </div>
              <div class="row flex-center q-gutter-x-md">
                <q-slider
                  v-model="aiGeneratorSettingsData.inferenceSteps"
                  markers
                  snap
                  :min="1"
                  :max="10"
                  thumb-size="15px"
                  class="col"
                  :disable="isLoadingImages"
                />
                <span
                  class="col-1 q-pa-sm bg-white rounded-borders text-center"
                >
                  {{ aiGeneratorSettingsData.inferenceSteps }}</span
                >
              </div>
            </div>
            <div class="column full-width">
              <div class="row items-center q-gutter-x-md">
                <span class="text-h6">Guidance Scale:</span>
                <q-icon name="help" size="sm" color="blue-grey-9">
                  <q-tooltip
                    anchor="center right"
                    self="center left"
                    :offset="[10, 10]"
                  >
                    {{ Constants.AI_ASSISTANT_MESSAGES.GUIDANCE_SCALE_MESSAGE }}
                  </q-tooltip>
                </q-icon>
              </div>
              <div class="row flex-center q-gutter-x-md">
                <q-slider
                  v-model="aiGeneratorSettingsData.guidanceScale"
                  markers
                  snap
                  :min="1"
                  :max="2"
                  :step="0.1"
                  thumb-size="15px"
                  class="col"
                  :disable="isLoadingImages"
                />
                <span
                  class="col-1 q-pa-sm bg-white rounded-borders text-center"
                >
                  {{ aiGeneratorSettingsData.guidanceScale }}</span
                >
              </div>
            </div>
            <div class="column full-width">
              <div class="row items-center q-gutter-x-md">
                <span class="text-h6">Seed:</span>
                <q-icon name="help" size="sm" color="blue-grey-9">
                  <q-tooltip
                    anchor="center right"
                    self="center left"
                    :offset="[10, 10]"
                  >
                    {{ Constants.AI_ASSISTANT_MESSAGES.SEEDS_MESSAGE }}
                  </q-tooltip>
                </q-icon>
              </div>
              <div class="row flex-center q-gutter-x-md">
                <q-slider
                  v-model="aiGeneratorSettingsData.seed"
                  :min="0"
                  :max="999999"
                  thumb-size="15px"
                  class="col"
                  :disable="
                    !aiGeneratorSettingsData.isSeedsUsed || isLoadingImages
                  "
                />
                <span
                  class="col-1 q-pa-sm bg-white rounded-borders text-center"
                >
                  {{ aiGeneratorSettingsData.seed }}</span
                >
              </div>
              <q-checkbox
                v-model="aiGeneratorSettingsData.isSeedsUsed"
                left-label
                label="Use Seeds:"
                color="primary"
                size="md"
                class="text-subtitle1 self-start"
                :disable="isLoadingImages"
              />
            </div>

            <q-separator class="full-width" />

            <div class="row items-center justify-between full-width">
              <div class="row q-gutter-x-md">
                <q-btn
                  unelevated
                  color="positive"
                  size="lg"
                  label="Save Settings"
                  @click="showSaveAISettingsDialog"
                  :disable="isLoadingImages"
                />
                <q-btn
                  unelevated
                  color="accent"
                  size="lg"
                  label="Load Settings"
                  @click="showLoadAISettingsDialog"
                  :disable="!aiSettingsList.length || isLoadingImages"
                />
              </div>
              <q-btn
                unelevated
                color="deep-orange-10"
                size="lg"
                label="Reset All"
                class="self-end"
                @click="
                  aiImageGeneratorDialogStore.resetAiImageGeneratorSettings
                "
                :disable="isLoadingImages"
              />
            </div>
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import ImageControlsButton from 'src/components/FullScreenDialogs/components/components/ImageControlsButton.vue';
import AISettingsListDialog from 'src/components/FullScreenDialogs/components/components/AISettingsListDialog.vue';
import { storeToRefs } from 'pinia';
import { useAiImageGeneratorStore } from 'src/stores/ai-image-generator';
import { useImageToGcodeConvertor } from 'src/stores/image-to-gcode';
import { useImageFilesManagementStore } from 'src/stores/image-files-management';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { Constants } from 'src/constants';
import { showNotifyMessage } from 'src/services/notify.messages.service';
import { AISetting } from 'src/interfaces/aiGeneratorImage.interface';
import { fileFromImageUrl } from 'src/services/image.editor.service';

const $q = useQuasar();

const aiImageGeneratorDialogStore = useAiImageGeneratorStore();
const imageToGcodeConvertorStore = useImageToGcodeConvertor();
const imageFilesManagementStore = useImageFilesManagementStore();

const {
  aiGeneratorSettingsData,
  isAIImageGeneratorDialogShown,
  originalGeneratedImages,
  base64GeneratedImages,
  isLoadingImages,
  aiModelsList,
  isReceivedImagesSVGForm,
  aiSettingsList,
  aiSettingName,
} = storeToRefs(aiImageGeneratorDialogStore);
const { imageFile } = storeToRefs(imageToGcodeConvertorStore);

const imageSliderNumber = ref<number>(0);
const isFullScreen = ref<boolean>(false);

const notifyMessage = showNotifyMessage();

const handleAIGenerateImages = async () => {
  // make sure that the user will not enter settings that may crash the system
  if (isAISettingsValid()) {
    aiImageGeneratorDialogStore
      .generateAIImages()
      .catch((error) => notifyMessage.error(error.message));
  } else {
    showWarningAISettingsDialog();
  }
};

const handleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value;
};

const handleDownloadImage = () => {
  showImageNameDialog().onOk(async (name) => {
    const imageSrc = originalGeneratedImages.value[imageSliderNumber.value];

    const blob = await fetch(imageSrc).then((res) => res.blob());

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const imageName = name + (isReceivedImagesSVGForm.value ? '.svg' : '.png');
    // upload to system
    link.download = imageName;
    // Trigger download
    link.click();
    // Clean up the URL object
    URL.revokeObjectURL(link.href);
  });
};

const handleUseImage = () => {
  showImageNameDialog().onOk(async (name) => {
    const imageSrc = originalGeneratedImages.value[imageSliderNumber.value];
    // first, upload to system
    const imageName = name + (isReceivedImagesSVGForm.value ? '.svg' : '.png');
    // upload to system
    const image = await fileFromImageUrl(imageSrc, imageName);
    await imageFilesManagementStore.uploadImageFile(image);
    // assign the image to the imageGcodeStore
    imageFile.value = image;
    // Close the generator dialog
    aiImageGeneratorDialogStore.closeAIGeneratorDialog();
  });
};

const handleSaveImage = () => {
  showImageNameDialog().onOk(async (name) => {
    const imageSrc = originalGeneratedImages.value[imageSliderNumber.value];
    const imageName = name + (isReceivedImagesSVGForm.value ? '.svg' : '.png');

    // upload to system
    const image = await fileFromImageUrl(imageSrc, imageName);
    await imageFilesManagementStore.uploadImageFile(image).then(() => {
      notifyMessage.success('Image saved successfully in the system');
    });
  });
};

const showSaveAISettingsDialog = () => {
  $q.dialog({
    title: 'Give your settings a name',
    prompt: {
      model: aiSettingName.value,
      type: 'text',
      isValid: (val) => val.length > 0,
    },
    cancel: true,
    persistent: true,
    color: 'positive',
  }).onOk((settingName: string) => handleSaveAISettings(settingName));
};

const showImageNameDialog = () => {
  return $q.dialog({
    title: 'AI Image Generator',
    html: true,
    color: 'primary',
    prompt: {
      model: '',
      suffix: isReceivedImagesSVGForm.value ? '.svg' : '.png',
      isValid: (val) => {
        if (val.length > 0) {
          return true;
        }
        return false;
      },
      type: 'text',
    },
    message: 'what would you like to name your image?',
    cancel: true,
  });
};

const handleSaveAISettings = async (settingName: string) => {
  const settingsNamesList = aiSettingsList.value.map(
    (setting: AISetting) => setting.name
  );

  // check if the use is changing an already exist setting
  if (settingsNamesList.includes(settingName.trim())) {
    showAlreadyExistAISetting(settingName).onOk(() => {
      aiImageGeneratorDialogStore
        .modifyAISetting(settingName)
        .then(() => notifyMessage.success('AI Setting modified successfully'))
        .catch((error) => {
          notifyMessage.error(error.message);
        });
    });
  } else {
    aiImageGeneratorDialogStore
      .addAISetting(settingName)
      .then(() => notifyMessage.success('AI Setting saved successfully'))
      .catch((error) => {
        notifyMessage.error(error.message);
      });
  }
};

const showAlreadyExistAISetting = (settingsName: string) => {
  return $q.dialog({
    title: `<strong>${settingsName}</strong> setting Already exist!`,
    message: 'Are sure you want to modify this setting?',
    html: true,
    color: 'primary',
    ok: {
      label: 'Yes',
      flat: true,
    },
    cancel: {
      flat: true,
      label: 'No',
    },
  });
};

const isAISettingsValid = () => {
  // images number
  if (
    aiGeneratorSettingsData.value.numberOfImages >
    Constants.AI_SETTINGS_LIMITATION.NUMBER_OF_IMAGES
  ) {
    if (
      aiGeneratorSettingsData.value.inferenceSteps >
        Constants.AI_SETTINGS_LIMITATION.INFERENCE_STEPS ||
      aiGeneratorSettingsData.value.imageWidth >
        Constants.AI_SETTINGS_LIMITATION.IMAGE_WIDTH ||
      aiGeneratorSettingsData.value.inferenceSteps >
        Constants.AI_SETTINGS_LIMITATION.IMAGE_HEIGHT
    )
      return false;
  }
  // inference steps
  if (
    aiGeneratorSettingsData.value.inferenceSteps >
    Constants.AI_SETTINGS_LIMITATION.INFERENCE_STEPS
  ) {
    if (
      aiGeneratorSettingsData.value.numberOfImages >
        Constants.AI_SETTINGS_LIMITATION.NUMBER_OF_IMAGES ||
      aiGeneratorSettingsData.value.imageWidth >
        Constants.AI_SETTINGS_LIMITATION.IMAGE_WIDTH ||
      aiGeneratorSettingsData.value.imageHeight >
        Constants.AI_SETTINGS_LIMITATION.IMAGE_HEIGHT
    )
      return false;
  }
  // image width
  if (
    aiGeneratorSettingsData.value.imageWidth >
    Constants.AI_SETTINGS_LIMITATION.IMAGE_WIDTH
  ) {
    if (
      aiGeneratorSettingsData.value.numberOfImages >
        Constants.AI_SETTINGS_LIMITATION.NUMBER_OF_IMAGES ||
      aiGeneratorSettingsData.value.inferenceSteps >
        Constants.AI_SETTINGS_LIMITATION.INFERENCE_STEPS ||
      aiGeneratorSettingsData.value.imageHeight >
        Constants.AI_SETTINGS_LIMITATION.IMAGE_HEIGHT
    )
      return false;
  }
  // image height
  if (
    aiGeneratorSettingsData.value.imageHeight >
    Constants.AI_SETTINGS_LIMITATION.IMAGE_HEIGHT
  ) {
    if (
      aiGeneratorSettingsData.value.numberOfImages >
        Constants.AI_SETTINGS_LIMITATION.NUMBER_OF_IMAGES ||
      aiGeneratorSettingsData.value.inferenceSteps >
        Constants.AI_SETTINGS_LIMITATION.INFERENCE_STEPS ||
      aiGeneratorSettingsData.value.imageWidth >
        Constants.AI_SETTINGS_LIMITATION.IMAGE_WIDTH
    )
      return false;
  }
  return true;
};

const handleCancelGeneratingImage = () => {
  aiImageGeneratorDialogStore
    .cancelGeneratingImages()
    .catch((error) => notifyMessage.error(error.message));
};

const showLoadAISettingsDialog = () => {
  $q.dialog({
    component: AISettingsListDialog,
  });
};

const getAIModelDescription = (modelName: string) => {
  // check if the ai model is supported by olos
  const supportedModels = Constants.SUPPORTED_AI_MODELS.map(
    (model) => model.name
  );
  if (supportedModels.includes(modelName)) {
    return Constants.SUPPORTED_AI_MODELS.find(
      (model) => model.name === modelName
    )?.description;
  }
  return 'This model is not supported. Use on your own risk';
};

const showWarningAISettingsDialog = () => {
  $q.dialog({
    color: 'primary',
    title: 'Warning!',
    message:
      'The selected settings may exceed system limits and cause instability. Please adjust them to ensure smooth operation.',
    progress: false,
    ok: true,
  });
};
</script>
<style scoped>
.images-container {
  width: 100%;
  height: 60vh;
  position: relative;
  background-color: white;
  border-radius: 5px;
  border: 2px solid gray;
}

.images-style {
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
