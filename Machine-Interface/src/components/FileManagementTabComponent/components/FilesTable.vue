<template>
  <q-table
    class="header-table q-mb-lg bg-grey-4"
    flat
    row-key="name"
    bordered
    :rows="filesList"
    :columns="columns"
    :dense="$q.screen.lt.md"
    :filter="filter"
    virtual-scroll
    :virtual-scroll-item-size="10"
    :virtual-scroll-sticky-size-start="10"
    :rows-per-page-options="[0]"
    hide-bottom
    style="max-height: 50vh"
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
        <q-td key="files" :props="props">
          <span class="row-text-size">{{ props.row.file }}</span>
        </q-td>
        <q-td key="date" :props="props">
          <span class="row-text-size">{{ props.row.date }}</span>
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
import { useFileManagementStore } from 'src/stores/file-management';
import { QTableProps, useQuasar } from 'quasar';
import { ref } from 'vue';

interface TableRow {
  file: string;
  date: string;
}

const columns: QTableProps['columns'] = [
  {
    name: 'files',
    label: 'Loaded Files',
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
    field: (row) => row.date,
  },
  {
    name: 'delete',
    label: '',
    align: 'center',
    sortable: false,
    required: true,
    field: 'delete',
  },
];

const $q = useQuasar();

// filter for the search bar
const filter = ref('');

const store = useFileManagementStore();

const { filesList, selectedFilename } = storeToRefs(store);
const { selectFile } = store;

const onRowClick = (row: TableRow) => {
  selectFile(row.file);
};

const onDeleteFile = (row: TableRow) => {
  $q.dialog({
    title: 'Confirm',
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
    store.deleteFile(row.file);
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
