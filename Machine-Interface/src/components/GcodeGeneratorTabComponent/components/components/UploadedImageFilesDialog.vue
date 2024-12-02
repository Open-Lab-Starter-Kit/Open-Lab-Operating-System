<template>
  <q-dialog
    v-model="isUploadedImagesDialogShown"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="dialog-box">
      <div class="column fit">
        <q-bar
          class="row full-width text-white bg-brown-5 items-center justify-between q-py-lg"
        >
          <h5 class="text-bold">Uploaded Images</h5>
          <q-btn
            dense
            flat
            icon="close"
            size="lg"
            @click="imageFilesManagementStore.closeUploadedImageFilesDialog"
          >
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-table
          class="header-table-top bg-white"
          flat
          row-key="image"
          bordered
          :rows="imagesListData"
          :columns="columns"
          :dense="$q.screen.lt.md"
          :filter="filter"
          virtual-scroll
          :virtual-scroll-item-size="10"
          :virtual-scroll-sticky-size-start="10"
          :rows-per-page-options="[0]"
          hide-bottom
          :loading="imagesListData === undefined"
          style="max-height: 80vh"
          no-data-label="Could not find images"
          selection="multiple"
          v-model:selected="selectedImageFiles"
        >
          <template v-slot:top-right>
            <q-input
              dense
              debounce="300"
              color="brown-5"
              v-model="filter"
              placeholder="Search"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template v-slot:top-left>
            <div
              v-if="selectedImageFiles.length && imagesListData.length"
              class="row flex-center q-gutter-x-md"
            >
              <!-- <q-btn
                label="Use Selected Files"
                size="md"
                color="orange-8"
                @click="handleUseMultipleImageFiles"
              /> -->
              <q-btn
                label="Download Selected Files"
                size="md"
                color="info"
                @click="handleDownloadMultipleImageFiles"
              />
              <q-btn
                label="Delete Selected Files"
                size="md"
                color="negative"
                @click="handleDeleteMultipleImageFiles"
              />
            </div>
          </template>

          <template v-slot:header-selection="scope">
            <q-checkbox v-model="scope.selected" color="brown-5"></q-checkbox>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props" class="bg-white cursor-pointer">
              <q-td auto-width>
                <q-checkbox
                  v-model="props.selected"
                  color="brown-5"
                ></q-checkbox>
              </q-td>

              <q-td key="image" :props="props">
                <span class="row-text-size">{{ props.row.image }}</span>
              </q-td>

              <q-td key="date" :props="props">
                <span class="row-text-size">{{ props.row.date }}</span>
              </q-td>

              <q-td key="size" :props="props">
                <span class="row-text-size">{{ props.row.size }} KB</span>
              </q-td>

              <q-td key="use" :props="props">
                <q-icon
                  @click="handleUseImageFile(props.row)"
                  name="edit"
                  size="md"
                />
              </q-td>

              <q-td key="download" :props="props">
                <q-icon
                  @click="handleDownloadImage(props.row)"
                  name="download"
                  size="md"
                />
              </q-td>

              <q-td key="rename" :props="props">
                <q-icon
                  @click="handleRenameImage(props.row)"
                  name="edit_square"
                  size="md"
                />
              </q-td>

              <q-td key="delete" :props="props">
                <q-icon
                  @click="handleDeleteImage(props.row)"
                  name="delete_forever"
                  size="md"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useQuasar, QTableProps } from 'quasar';
import { useImageFilesManagementStore } from 'src/stores/image-files-management';
import { useImageToGcodeConvertor } from 'src/stores/image-to-gcode';
import { useUSBMonitorStore } from 'src/stores/usb-monitor';
import { ImageFileData } from 'src/interfaces/imageFilesManagement.interface';
import { showNotifyMessage } from 'src/services/notify.messages.service';
import { Constants } from 'src/constants';

const $q = useQuasar();

const columns: QTableProps['columns'] = [
  {
    name: 'image',
    label: 'Image',
    align: 'left',
    sortable: true,
    required: true,
    field: (row) => row.file,
    format: (val) => `${val}`,
  },
  {
    name: 'date',
    label: 'Upload Date',
    align: 'center',
    sortable: true,
    required: false,
    sort: (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    field: (row) => row.date,
  },
  {
    name: 'size',
    label: 'Image Size',
    align: 'center',
    sortable: true,
    required: false,
    field: (row) => row.size,
  },
  {
    name: 'download',
    label: '',
    align: 'center',
    sortable: false,
    required: false,
    field: (row) => row.download,
  },
  {
    name: 'rename',
    label: '',
    align: 'center',
    sortable: false,
    required: false,
    field: (row) => row.rename,
  },
  {
    name: 'delete',
    label: '',
    align: 'center',
    sortable: false,
    required: false,
    field: (row) => row.delete,
  },
  {
    name: 'use',
    label: '',
    align: 'center',
    sortable: false,
    required: false,
    field: (row) => row.use,
  },
];

const imageFilesManagementStore = useImageFilesManagementStore();
const imageToGcodeConvertorStore = useImageToGcodeConvertor();
const usbMonitorStore = useUSBMonitorStore();

const { isUploadedImagesDialogShown, imagesListData } = storeToRefs(
  imageFilesManagementStore
);
const { imageFile } = storeToRefs(imageToGcodeConvertorStore);

const notifyMessage = showNotifyMessage();

// filter for the search bar
const filter = ref('');

// selected job files
const selectedImageFiles = ref<Array<ImageFileData>>([]);

const handleDownloadImage = (imageData: ImageFileData) => {
  $q.dialog({
    title: 'Confirm',
    color: 'primary',
    message: `Would you like to download "${imageData.image}"?`,
    style: {
      backdropFilter: 'none',
    },
    ok: {
      label: 'Yes',
      flat: true,
    },
    cancel: {
      label: 'No',
      flat: true,
    },
  }).onOk(() => {
    imageFilesManagementStore
      .downloadImageFile(imageData.image)
      .then(() =>
        notifyMessage.success(Constants.API_SUCCESS_MESSAGES.DOWNLOAD_MESSAGE)
      )
      .catch((error) => notifyMessage.error(error.message));
  });
};

const handleDownloadMultipleImageFiles = () => {
  selectedImageFiles.value.map((file) => handleDownloadImage(file));
};

const handleDeleteImage = (imageData: ImageFileData) => {
  $q.dialog({
    title: 'Confirm',
    color: 'primary',
    message: `Would you like to delete "${imageData.image}"?`,
    ok: {
      label: 'Yes',
      flat: true,
    },
    cancel: {
      label: 'No',
      flat: true,
    },
  }).onOk(() => {
    imageFilesManagementStore
      .deleteImageFile(imageData.image)
      .then(() => {
        usbMonitorStore.checkIfDeletedImageExistInUSBImageFiles(
          imageData.image
        );
        notifyMessage.success(Constants.API_SUCCESS_MESSAGES.DELETE_MESSAGE);
      })
      .catch((error) => notifyMessage.error(error.message));
  });
};

const handleDeleteMultipleImageFiles = () => {
  selectedImageFiles.value.map((file) => handleDeleteImage(file));
};

const handleUseImageFile = (imageData: ImageFileData) => {
  // get the image data from the system
  imageFilesManagementStore
    .fetchImageFile(imageData.image)
    .then((image) => {
      if (image) {
        imageFile.value = image;
      }
      imageFilesManagementStore.closeUploadedImageFilesDialog();
    })
    .catch((error) => {
      notifyMessage.error(error.message);
    });
};

const handleRenameImage = (imageData: ImageFileData) => {
  const { name, ext } = getImageNameInfo(imageData.image);
  $q.dialog({
    title: 'Rename File',
    color: 'primary',
    html: true,
    prompt: {
      model: name,
      rules: [
        (val) => !!val || '* Required',
        (val) =>
          !imagesListData.value.find(
            (file) => `${val}.${ext}` === file.image
          ) || 'Image name already exist',
      ],
      isValid: (val) => {
        // make sure it is not an already image name from the images list
        if (
          val.length > 0 &&
          !imagesListData.value.find((file) => `${val}.${ext}` === file.image)
        ) {
          return true;
        }
        return false;
      },
      type: 'text',
      suffix: `.${ext}`,
    },
    cancel: true,
  }).onOk((data) => {
    const newImageName = data + '.' + ext;
    imageFilesManagementStore
      .renameImageFile(imageData.image, newImageName)
      .then(() => {
        notifyMessage.success(Constants.API_SUCCESS_MESSAGES.RENAME_MESSAGE);
      })
      .catch((error) => {
        notifyMessage.error(error.message);
      });
  });
};

const getImageNameInfo = (fullImageName: string) => {
  const imageNameParts = fullImageName.split('.');
  const firstPart = imageNameParts[0];
  const secondPart =
    imageNameParts.length > 1 ? imageNameParts[imageNameParts.length - 1] : '';

  return {
    name: firstPart,
    ext: secondPart,
  };
};
</script>

<style scoped lang="scss">
.dialog-box {
  min-width: 80%;
}

.header-table-top {
  thead tr:first-child th {
    border-bottom: solid 1px;
  }
  thead tr:first-child th {
    /* bg color is important for th; just specify one */
    background-color: #fff !important;
  }
  thead tr:first-child th {
    font-weight: bold;
    font-size: 1.25rem;
  }
}
.q-table__top,
thead tr th {
  position: sticky;
  z-index: 1;
}
/* prevent scrolling behind sticky top row on focus */
tbody {
  /* height of all previous header rows */
  scroll-margin-top: 48px;
}
</style>
