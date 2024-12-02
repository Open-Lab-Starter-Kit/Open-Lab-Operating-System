<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    :persistent="true"
    backdrop-filter="blur(4px)"
  >
    <q-card class="q-dialog-plugin dialog-box">
      <div class="column q-ma-lg q-gutter-y-lg">
        <q-btn
          v-if="isEditMaterial"
          icon="delete"
          color="negative"
          unelevated
          @click="handleDeleteMaterial"
          text-color="white"
          class="row self-end"
        >
          <q-tooltip>Delete Material</q-tooltip>
        </q-btn>
        <div class="row items-center justify-start q-gutter-x-md">
          <span class="text-bold text-h6">Material Name:</span>
          <q-input
            clearable
            clear-icon="close"
            filled
            color="primary"
            class="row col"
            v-model="materialName"
            error-message="This material already exist"
            :error="!isValidMaterialName"
          />
        </div>

        <div class="row items-center justify-start q-gutter-x-md">
          <span class="text-bold text-h6">Material image:</span>
          <q-file
            v-if="!materialImage"
            filled
            label="Pick an image file"
            accept=".svg,.jpg,.png,.jpeg"
            label-color="blue"
            use-chips
            :max-file-size="Constants.MAX_IMAGE_FILE_SIZE"
            @rejected="onRejected"
            v-model="materialImageFile"
            @update:model-value="handleUploadMaterialImage"
          >
            <template v-slot:append>
              <q-icon name="attachment" color="primary" />
            </template>
          </q-file>

          <div v-else class="material-img-container relative-position">
            <q-btn
              icon="cancel"
              size="sm"
              flat
              class="absolute-top-right"
              style="z-index: 1"
              @click="handleRemoveImage"
            />
            <q-img :src="materialImage" />
          </div>
        </div>

        <div class="column q-gutter-y-md">
          <div class="row full-width items-center justify-between">
            <span class="text-bold text-h6">Material thicknesses:</span>
            <q-btn
              icon="add"
              color="primary"
              unelevated
              @click="handleAddNewThickness"
              :disable="!materialName"
            >
              <q-tooltip>Add Thickness</q-tooltip>
            </q-btn>
          </div>
          <q-scroll-area class="thickness-list-box">
            <div
              v-for="thickness in materialThicknesses"
              :key="thickness.thicknessId"
            >
              <div class="row items-center justify-between q-py-sm">
                <span class="text-h6 q-pl-md"
                  >{{ thickness.thicknessValue }} mm</span
                >
                <div>
                  <q-btn
                    icon="settings"
                    color="primary"
                    flat
                    @click="handleUpdateThickness(thickness.thicknessValue)"
                  >
                    <q-tooltip>Edit Thickness</q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="remove"
                    color="negative"
                    flat
                    @click="handleDeleteThickness(thickness.thicknessValue)"
                  >
                    <q-tooltip>Delete Thickness</q-tooltip>
                  </q-btn>
                </div>
              </div>
              <q-separator />
            </div>
          </q-scroll-area>
        </div>

        <q-card-actions align="right">
          <q-btn color="gray-6" flat label="Cancel" @click="onDialogCancel" />
          <q-btn
            v-if="isEditMaterial"
            color="positive"
            label="Update Material"
            unelevated
            @click="handleUpdateMaterial"
            :disable="!isValidMaterialData"
          />

          <q-btn
            v-else
            color="positive"
            label="Add Material"
            unelevated
            @click="handleAddNewMaterial"
            :disable="!isValidMaterialData"
          />
        </q-card-actions>
      </div>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, onMounted, computed } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { useQuasar } from 'quasar';
import { Constants } from 'src/constants';
import { showNotifyMessage } from 'src/services/notify.messages.service';
import {
  MaterialData,
  MaterialThickness,
  RejectedFileEntry,
} from 'src/interfaces/imageToGcode.interface';
import { configurationSettings } from 'src/services/configuration.loader.service';
import { Config } from 'src/interfaces/configSettings.interface';
import { useMaterialLibraryStore } from 'src/stores/material-library';
import AddNewThicknessDialog from './components/AddNewThicknessDialog.vue';

const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
defineEmits([...useDialogPluginComponent.emits]);

const materialLibraryStore = useMaterialLibraryStore();
const { materialsList } = storeToRefs(materialLibraryStore);

const notifyMessage = showNotifyMessage();

const props = defineProps<{
  isEditMaterial: boolean;
  material: MaterialData;
}>();
const config = ref<Config | null>(null);

// initial hooks
const materialName = ref<string>('');
const materialThicknesses = ref<Array<MaterialThickness>>([]);
const materialImage = ref<string | null>(null);
const materialImageFile = ref<File | null>(null);

// check if the material that the user enter is already exist or not
const isValidMaterialName = computed(
  () =>
    !materialsList.value
      .map((material) => {
        if (props.isEditMaterial) {
          if (props.material.materialName !== materialName.value)
            return material.materialName.toLowerCase();
        } else {
          return material.materialName.toLowerCase();
        }
      })
      .includes(materialName.value.toLowerCase())
);

const isValidMaterialData = computed(
  () => materialName.value !== '' && isValidMaterialName.value
);

const handleAddNewMaterial = () => {
  const newMaterialData = {
    materialName: materialName.value,
    materialImage: materialImage.value,
    materialThicknesses: materialThicknesses.value,
  } as MaterialData;
  materialLibraryStore
    .addNewMaterial(newMaterialData)
    .then(() => {
      notifyMessage.success('Material added successfully');
    })
    .catch(() => {
      notifyMessage.error('Something went wrong while adding the material');
    });

  onDialogOK();
};

const handleUpdateMaterial = () => {
  const updatedMaterialData = {
    ...props.material,
    materialName: materialName.value,
    materialImage: materialImage.value,
    materialThicknesses: materialThicknesses.value,
  } as MaterialData;
  materialLibraryStore
    .updateMaterial(updatedMaterialData)
    .then(() => {
      notifyMessage.success('Material updated successfully');
    })
    .catch(() => {
      notifyMessage.error('Something went wrong while updating the material');
    });

  onDialogOK();
};

const handleDeleteMaterial = () => {
  // confirmation dialog
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete the material?',
    cancel: true,
    persistent: true,
    color: 'primary',
  }).onOk(async () => {
    materialLibraryStore
      .deleteMaterial(props.material.materialId)
      .then(() => notifyMessage.success('Material deleted successfully'))
      .catch(() =>
        notifyMessage.error('Something went wrong while deleting the material')
      );
    onDialogOK();
  });
};

const handleAddNewThickness = () => {
  $q.dialog({
    component: AddNewThicknessDialog,
    componentProps: {
      materialThicknesses: materialThicknesses.value,
      thicknessData: null,
      isEditThickness: false,
      addThickness: (newThickness: MaterialThickness) => {
        materialThicknesses.value.push(newThickness);
      },
      updateThickness: null,
    },
  });
};

const handleUpdateThickness = (thicknessValue: number) => {
  $q.dialog({
    component: AddNewThicknessDialog,
    componentProps: {
      materialThicknesses: materialThicknesses.value,
      thicknessData: materialThicknesses.value.find(
        (thickness) => thickness.thicknessValue === thicknessValue
      ),
      isEditThickness: true,
      addThickness: (newThickness: MaterialThickness) => {
        materialThicknesses.value.push(newThickness);
      },
      updateThickness: (newThickness: MaterialThickness) => {
        const thicknessIndex = materialThicknesses.value.findIndex(
          (thickness) => thickness.thicknessValue === thicknessValue
        );
        materialThicknesses.value[thicknessIndex] = newThickness;
      },
    },
  });
};

const handleDeleteThickness = (thicknessValue: number) => {
  const selectedThicknessData = materialThicknesses.value.find(
    (thickness) => thickness.thicknessValue === thicknessValue
  );
  materialThicknesses.value = materialThicknesses.value.filter(
    (thickness) =>
      thickness.thicknessValue !== selectedThicknessData?.thicknessValue
  );
};

const handleUploadMaterialImage = () => {
  if (materialImageFile.value) {
    const file = materialImageFile.value;
    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryString = event.target?.result;
      if (typeof binaryString === 'string') {
        materialImage.value = binaryString;
      }
    };

    // Read the image file as a binary string
    reader.readAsDataURL(file);
  }
};

const handleRemoveImage = () => {
  if (materialImage.value) {
    materialImage.value = null;
  }
  if (materialImageFile.value) {
    materialImageFile.value = null;
  }
};

// validation function for svg file picker
const onRejected = (rejectedEntries: RejectedFileEntry[]) => {
  rejectedEntries.forEach((entry) => {
    const notifyMessage = showNotifyMessage();

    switch (entry.failedPropValidation) {
      case Constants.UPLOAD_FILES_ERRORS.MAX_FILES.NAME:
        notifyMessage.error(Constants.UPLOAD_FILES_ERRORS.MAX_FILES.MESSAGE);
        break;
      case Constants.UPLOAD_FILES_ERRORS.MAX_FILE_SIZE.NAME:
        notifyMessage.error(
          Constants.UPLOAD_FILES_ERRORS.MAX_FILE_SIZE.MESSAGE
        );
        break;
      case Constants.UPLOAD_FILES_ERRORS.ACCEPT.NAME:
        notifyMessage.error(Constants.UPLOAD_FILES_ERRORS.ACCEPT.MESSAGE);
        break;
      case Constants.UPLOAD_FILES_ERRORS.DUPLICATE.NAME:
        notifyMessage.error(Constants.UPLOAD_FILES_ERRORS.DUPLICATE.MESSAGE);
        break;
      default:
        notifyMessage.error(Constants.UPLOAD_FILES_ERRORS.DEFAULT.MESSAGE);
    }
  });
};

onMounted(async () => {
  config.value = await configurationSettings();
  if (props.material) {
    materialName.value = props.material.materialName;
    materialImage.value = props.material.materialImage;
    // Create a deep copy of the materialThickness array to not change the main materialThickness
    materialThicknesses.value = JSON.parse(
      JSON.stringify(props.material.materialThicknesses)
    );
  }
});
</script>
<style scoped>
.dialog-box {
  min-width: 80vw;
}

.material-img-container {
  width: 10vw;
}

.thickness-list-box {
  background-color: rgb(236, 236, 236);
  border: solid rgb(206, 206, 206) 2px;
  border-radius: 5px;
  height: 200px;
  width: 100%;
}
</style>
