<template>
  <q-table
    class="header-table q-mb-lg bg-grey-4"
    flat
    row-key="name"
    bordered
    :rows="filesListData"
    :columns="columns"
    :dense="$q.screen.lt.md"
    :filter="filter"
    virtual-scroll
    :virtual-scroll-item-size="10"
    :virtual-scroll-sticky-size-start="10"
    :rows-per-page-options="[0]"
    hide-bottom
    style="max-height: 50vh"
    :loading="filesListData === undefined"
  >
    <template v-slot:top-right>
      <q-input dense debounce="300" v-model="filter" placeholder="Search">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
    <template v-slot:body="props">
      <q-tr
        :props="props"
        @click="onRowClick(props.row)"
        :class="[
          { 'bg-blue-grey-2': selectedFilename === props.row.file },
          'cursor-pointer',
        ]"
      >
        <q-td key="jobs" :props="props">
          <span class="row-text-size">{{ props.row.file }}</span>
        </q-td>
        <q-td key="date" :props="props">
          <span class="row-text-size">{{ props.row.date }}</span>
        </q-td>
        <q-td key="size" :props="props">
          <span class="row-text-size">{{ props.row.size }} KB</span>
        </q-td>
        <q-td key="download" :props="props">
          <q-icon
            @click="onDownloadFile(props.row)"
            name="download"
            size="md"
          />
        </q-td>
        <q-td key="delete" :props="props">
          <q-icon
            @click="onDeleteFile(props.row)"
            name="delete_forever"
            size="md"
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useJobsFilesManagementStore } from 'src/stores/jobs-files-management';
import { useUSBMonitorStore } from 'src/stores/usb-monitor';
import { QTableProps, useQuasar } from 'quasar';
import { ref } from 'vue';
import { showNotifyMessage } from 'src/services/notify.messages.service';
import { Constants } from 'src/constants';
import { useGcodePreviewStore } from 'src/stores/gcode-preview';
import { JobFileData } from 'src/interfaces/jobsFilesManagement.interface';

const columns: QTableProps['columns'] = [
  {
    name: 'jobs',
    label: 'Loaded Jobs',
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
    label: 'Job Size',
    align: 'center',
    sortable: true,
    required: false,
    field: (row) => row.size,
  },
  {
    name: 'delete',
    label: '',
    align: 'center',
    sortable: false,
    required: true,
    field: 'delete',
  },
  {
    name: 'download',
    label: '',
    align: 'center',
    sortable: false,
    required: true,
    field: 'download',
  },
];

const $q = useQuasar();

// filter for the search bar
const filter = ref('');

const jobManagerStore = useJobsFilesManagementStore();
const gcodePreviewStore = useGcodePreviewStore();
const usbMonitorStore = useUSBMonitorStore();

const { filesListData, selectedFilename } = storeToRefs(jobManagerStore);

const notifyMessage = showNotifyMessage();

const onRowClick = (row: JobFileData) => {
  jobManagerStore.selectFile(row.file);
};

const onDeleteFile = (row: JobFileData) => {
  $q.dialog({
    title: 'Confirm',
    color: 'primary',
    message: `Would you like to delete "${row.file}"?`,
    ok: {
      label: 'Yes',
      flat: true,
    },
    cancel: {
      label: 'No',
      flat: true,
    },
  }).onOk(() => {
    const filename = row.file;

    jobManagerStore
      .deleteFile(filename)
      .then(() => {
        notifyMessage.success(Constants.API_SUCCESS_MESSAGES.DELETE_MESSAGE);
        usbMonitorStore.checkIfDeletedFileExistInUSBJobFiles(filename);
        gcodePreviewStore.reset2DGraph();
      })
      .catch((error) => notifyMessage.error(error.message));
  });
};

const onDownloadFile = (row: JobFileData) => {
  $q.dialog({
    title: 'Confirm',
    color: 'primary',
    message: `Would you like to download "${row.file}"?`,
    ok: {
      label: 'Yes',
      flat: true,
    },
    cancel: {
      label: 'No',
      flat: true,
    },
  }).onOk(() => {
    jobManagerStore
      .downloadFile(row.file)
      .then(() =>
        notifyMessage.success(Constants.API_SUCCESS_MESSAGES.DOWNLOAD_MESSAGE)
      )
      .catch((error) => notifyMessage.error(error.message));
  });
};
</script>

<style lang="scss">
.header-table {
  thead tr:first-child th {
    border-bottom: solid 1px;
  }
  thead tr:first-child th {
    /* bg color is important for th; just specify one */
    background-color: #e0e0e0 !important;
  }
  thead tr:first-child th {
    font-weight: bold;
    font-size: 1.25rem;
  }
}

.row-text-size {
  font-size: 1rem;
}
thead tr:first-child th {
  top: 0;
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
src/interfaces/jobManagement.interface
