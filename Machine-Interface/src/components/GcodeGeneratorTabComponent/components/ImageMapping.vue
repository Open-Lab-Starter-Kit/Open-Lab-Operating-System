<template>
  <div v-if="imageFile" class="column q-pa-sm">
    <q-table
      ref="mappingTable"
      :key="renderTrigger"
      :columns="getMappingColumns()"
      :rows="getFilteredElements()"
      :row-key="tableFilterType"
      flat
      selection="multiple"
      v-model:selected="tableSelectedElements"
      @selection="handleSelectingRowsProcess"
      virtual-scroll
      :virtual-scroll-item-size="10"
      :virtual-scroll-sticky-size-start="10"
      :rows-per-page-options="[0]"
      hide-bottom
    >
      <template v-slot:top>
        <div class="row full-width items-center justify-between">
          <div class="row full-height flex-center">
            <span class="text-bold">Filtered By:</span>
            <div class="q-gutter-lg">
              <q-radio
                v-model="tableFilterType"
                val="shape"
                label="Shape"
                @update:model-value="handleFilterChange"
              />
              <q-radio
                v-model="tableFilterType"
                val="color"
                label="Color"
                @update:model-value="handleFilterChange"
              />
            </div>
          </div>
          <q-select
            square
            outlined
            behavior="menu"
            :options="allProfileOptions"
            v-model="tableProfileAllModels"
            @update:model-value="handleChangeOfAllProfiles"
          />
        </div>
      </template>

      <template v-slot:header-selection="scope">
        <q-checkbox
          v-model="scope.selected"
          :disable="
            tableProfileAllModels !== Constants.PROFILE_ALL_OPTIONS.CUSTOM
          "
        ></q-checkbox>
      </template>

      <template v-slot:body-selection="scope">
        <q-checkbox
          v-model="scope.selected"
          :disable="scope.row.disable"
        ></q-checkbox>
      </template>

      <template v-slot:body-cell-color="props">
        <q-td key="color" :props="props">
          <div class="row full-width flex-center">
            <div
              class="color-boxes"
              :style="{
                'background-color': props.row.color,
              }"
            ></div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-shapeProfile="props">
        <q-td key="color" :props="props">
          <div class="row full-width flex-center">
            <q-select
              square
              outlined
              behavior="menu"
              v-model="tableProfileModels[props.row.shape]"
              :options="singleProfileOptions"
              style="width: 8vw"
              :disable="props.row.disable"
              @update:model-value="handleChangeOfSVGElementProfile(props)"
            />
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-colorProfile="props">
        <q-td key="color" :props="props">
          <div class="row full-width flex-center">
            <q-select
              square
              outlined
              behavior="menu"
              v-model="tableProfileModels[props.row.color]"
              :options="singleProfileOptions"
              style="width: 8vw"
              :disable="props.row.disable"
              @update:model-value="handleChangeOfSVGElementProfile(props)"
            />
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>
<script setup lang="ts">
import { INode, parse } from 'svgson';
import { useImageToGcodeConvertor } from 'src/stores/image-to-gcode';
import { storeToRefs } from 'pinia';
import { ref, toRaw, watch } from 'vue';
import { QTableProps, QTableSlots } from 'quasar';
import {
  elementsFilterByColor,
  elementsFilterByShape,
  filterSvgElements,
} from 'src/services/svg.parse.service';
import { Constants } from 'src/constants';
import { getSvgStringFromDataUri } from 'src/services/svg.editor.service';

const imageToGcodeConvertorStore = useImageToGcodeConvertor();
const {
  imageFile,
  imageContent,
  svgElementsToModify,
  isCanvasLoading,
  mappingTable,
  tableFilterType,
  tableSelectedElements,
  tableProfileModels,
  tableProfileAllModels,
  singleProfileOptions,
  allProfileOptions,
} = storeToRefs(imageToGcodeConvertorStore);

const renderTrigger = ref<number>(0);
// setup the mapping
const mappingColorColumns: QTableProps['columns'] = [
  {
    name: 'color',
    required: true,
    label: 'Color',
    align: 'center',
    field: (row) => row.color,
  },
  {
    name: 'counter',
    align: 'center',
    label: 'Number of Elements',
    field: (row) => row.elements.length,
    required: false,
  },
  {
    name: 'colorProfile',
    align: 'center',
    label: 'Profile',
    field: '',
    required: false,
  },
];

const mappingShapeColumns: QTableProps['columns'] = [
  {
    name: 'shape',
    required: true,
    label: 'Shape',
    align: 'center',
    field: (row) => row.shape,
  },
  {
    name: 'counter',
    align: 'center',
    label: 'Number of Elements',
    field: (row) => row.elements.length,
    required: false,
  },
  {
    name: 'shapeProfile',
    align: 'center',
    label: 'Profile',
    field: '',
    required: false,
  },
];

const getMappingColumns = () => {
  if (tableFilterType.value === Constants.SVG_ELEMENTS_FILTER.SHAPE) {
    return mappingShapeColumns;
  } else if (tableFilterType.value === Constants.SVG_ELEMENTS_FILTER.COLOR) {
    return mappingColorColumns;
  }
};

const getFilteredElements = () => {
  if (tableFilterType.value === Constants.SVG_ELEMENTS_FILTER.SHAPE) {
    return elementsFilterByShape;
  } else if (tableFilterType.value === Constants.SVG_ELEMENTS_FILTER.COLOR) {
    return elementsFilterByColor;
  }
  return [];
};

// get the filtered elements of the svg file
const parseSVGContent = async (svgContent: string) => {
  const svgString = getSvgStringFromDataUri(svgContent);
  if (svgString) {
    const json = await parse(svgString);
    filterSvgElements(json);
  }
};

const handleSelectingRowsProcess = (
  event: Parameters<NonNullable<QTableProps['onSelection']>>[0]
) => {
  // create an array for all the selected elements
  const selectedElements = event.rows?.reduce((elements, row) => {
    const selectedElement = getSelectedElementData(
      row[tableFilterType.value],
      row.elements,
      event.added
    );
    elements.push(selectedElement);

    return elements;
  }, []);
  imageToGcodeConvertorStore.setSvgElementsToModify(selectedElements);
  imageToGcodeConvertorStore.applySVGChanges();
};

const handleChangeOfSVGElementProfile = (
  props: Parameters<QTableSlots['item']>[0]
) => {
  if (props.selected) {
    // reset the profiling all option
    tableProfileAllModels.value = Constants.PROFILE_ALL_OPTIONS.CUSTOM;

    const selectedElement = getSelectedElementData(
      props.row[tableFilterType.value],
      props.row.elements,
      // make sure it is not an empty profile option
      tableProfileModels.value[props.row[tableFilterType.value]] !==
        Constants.PROFILE_OPTIONS.NOTHING
    );
    imageToGcodeConvertorStore.setSvgElementsToModify([selectedElement]);
    imageToGcodeConvertorStore.applySVGChanges();
  }
};

const handleChangeOfAllProfiles = () => {
  // disable all rows in case of profile all value other than 'Custom'
  if (tableProfileAllModels.value !== Constants.PROFILE_ALL_OPTIONS.CUSTOM) {
    disableAllTableRows();
  } else {
    enableAllTableRows();
  }
  processProfiling();
};

const disableAllTableRows = () => {
  mappingTable.value?.rows.map((row) => (row.disable = true));
};

const enableAllTableRows = () => {
  mappingTable.value?.rows.map((row) => (row.disable = false));
};

const processProfiling = () => {
  if (imageContent.value.startsWith('data:image/svg+xml;base64')) {
    //svg file
    processProfilingForSVGFile();
  } else {
    // other image files
    processProfilingForImageFile();
  }
};

const processProfilingForSVGFile = () => {
  let selectedElements;
  // Cut everything
  if (
    tableProfileAllModels.value === Constants.PROFILE_ALL_OPTIONS.CUT_EVERYTHING
  ) {
    selectedElements = processAllRows(Constants.PROFILE_OPTIONS.CUT, true);
  }
  // mark everything
  else if (
    tableProfileAllModels.value ===
    Constants.PROFILE_ALL_OPTIONS.MARK_EVERYTHING
  ) {
    selectedElements = processAllRows(Constants.PROFILE_OPTIONS.MARK, true);
  }
  // engrave everything
  else if (
    tableProfileAllModels.value ===
    Constants.PROFILE_ALL_OPTIONS.ENGRAVE_EVERYTHING
  ) {
    selectedElements = processAllRows(Constants.PROFILE_OPTIONS.ENGRAVE, true);
  } else {
    selectedElements = processAllRows(Constants.PROFILE_OPTIONS.NOTHING, false);
    // unselect all rows
    tableSelectedElements.value = [];
  }

  imageToGcodeConvertorStore.setSvgElementsToModify(selectedElements);
  imageToGcodeConvertorStore.applySVGChanges();
};

const processAllRows = (option: string, isSelectAll: boolean) => {
  // helper function to get the key value for the profile option
  const profileKeys = Object.keys(Constants.PROFILE_OPTIONS);

  const profile =
    profileKeys.find((key) => Constants.PROFILE_OPTIONS[key] === option) ||
    Constants.PROFILE_OPTIONS.NOTHING;

  // select all rows
  tableSelectedElements.value = mappingTable.value
    ?.rows as QTableProps['selected'];

  // give all rows the specified profile option value
  return tableSelectedElements.value?.reduce((elements, row) => {
    tableProfileModels.value[row[tableFilterType.value]] =
      Constants.PROFILE_OPTIONS[profile];
    const selectedElement = getSelectedElementData(
      row[tableFilterType.value],
      row.elements,
      isSelectAll
    );
    elements.push(selectedElement);
    return elements;
  }, []);
};

const processProfilingForImageFile = () => {
  imageToGcodeConvertorStore.applyImageChanges();
};

const handleFilterChange = async () => {
  isCanvasLoading.value = true;
  // reset table
  imageToGcodeConvertorStore.resetMappingTable();
  // reset modified image
  imageToGcodeConvertorStore.resetAllImageModifications();
  // reset the canvas elements array
  svgElementsToModify.value = [];
  // finish loading
  isCanvasLoading.value = false;
};

const getSelectedElementData = (
  identifier: string,
  elements: INode[],
  added: boolean
) => {
  // get the profile type for an element based on its name
  const elementProfileType = tableProfileModels.value[identifier];

  // create an object that contains the selected element data plus its profile type
  const selectedElement = {
    identifier,
    // prevent modifying the main elements
    // crate a copy of the elements
    elements: structuredClone(toRaw(elements)),
    profileType: elementProfileType,
    added: added,
  };

  return selectedElement;
};

// watch for changes on the image file
watch(imageContent, (newImageContent) => {
  if (newImageContent) {
    // dxf and svg images
    if (newImageContent.startsWith('data:image/svg+xml;base64')) {
      // parse the svg content and then reset the mapping table
      parseSVGContent(newImageContent).then(() => {
        // reactive element in case the user uploaded a new file to show parsed elements
        renderTrigger.value++;
        imageToGcodeConvertorStore.resetMappingTable();
      });
    } else {
      imageToGcodeConvertorStore.resetMappingTable();
    }
  }
});
</script>
<style scoped>
.color-boxes {
  width: 2rem;
  height: 2rem;
  border: solid black 1px;
  border-radius: 10px;
}
</style>
