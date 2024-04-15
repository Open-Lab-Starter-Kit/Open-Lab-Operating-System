<template>
  <div v-if="imageFile" class="column q-pa-sm">
    <q-table
      ref="table"
      :key="renderTrigger"
      :columns="getMappingColumns()"
      :rows="getFilteredElements()"
      :row-key="filterType"
      flat
      selection="multiple"
      v-model:selected="selected"
      @selection="handleSelectingRowsProcess"
      virtual-scroll
      :virtual-scroll-item-size="10"
      :virtual-scroll-sticky-size-start="10"
      :rows-per-page-options="[0]"
      hide-bottom
    >
      <template v-slot:top>
        <div class="row full-width items-center justify-between">
          <div class="row flex-center">
            <span class="text-bold">Filtered By:</span>
            <div class="q-gutter-lg">
              <q-radio
                v-model="filterType"
                val="shape"
                label="Shape"
                @update:model-value="handleFilterChange"
              />
              <q-radio
                v-model="filterType"
                val="color"
                label="Color"
                @update:model-value="handleFilterChange"
              />
            </div>
          </div>
          <q-select
            square
            outlined
            dense
            behavior="menu"
            :options="Object.values(profileAllOptions)"
            v-model="profileAllModels"
            @update:model-value="handleChangeOfAllProfiles"
          />
        </div>
      </template>
      <template v-slot:body-cell-color="props">
        <q-td key="color" :props="props" class="row flex-center">
          <div
            class="color-boxes"
            :style="{
              'background-color': props.row.color,
            }"
          ></div>
        </q-td>
      </template>
      <template v-slot:body-cell-shapeProfile="props">
        <q-td key="color" :props="props" class="row flex-center">
          <q-select
            square
            outlined
            dense
            behavior="menu"
            v-model="profileModels[props.row.shape]"
            :options="Object.values(profileOptions)"
            style="width: 8vw"
            @update:model-value="handleChangeOfSVGElementProfile(props)"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-colorProfile="props">
        <q-td key="color" :props="props" class="row flex-center">
          <q-select
            square
            outlined
            dense
            behavior="menu"
            v-model="profileModels[props.row.color]"
            :options="Object.values(profileOptions)"
            style="width: 8vw"
            @update:model-value="handleChangeOfSVGElementProfile(props)"
          />
        </q-td>
      </template>
    </q-table>
  </div>
  <div v-else class="q-pa-lg text-h5">No file uploaded yet.</div>
</template>
<script setup lang="ts">
import { INode, parse } from 'svgson';
import { useImageToGcodeConvertor } from 'src/stores/image-to-gcode';
import { storeToRefs } from 'pinia';
import { onMounted, ref, toRaw, watch } from 'vue';
import { QTableProps, QTableSlots } from 'quasar';
import {
  elementsFilterByColor,
  elementsFilterByShape,
  filterSvgElements,
} from 'src/services/svg.parse.service';
import { Constants } from 'src/constants';

const imageToGcodeConvertorStore = useImageToGcodeConvertor();
const { imageFile, svgElementsToModify, isCanvasLoading } = storeToRefs(
  imageToGcodeConvertorStore
);

// setup the mapping
const table = ref<QTableProps | null>(null);
const filterType = ref<string>('shape');
const selected = ref<QTableProps['selected']>([]);
const profileOptions = Constants.PROFILE_OPTIONS;
const profileAllOptions = Constants.PROFILE_ALL_OPTIONS;
const profileModels = ref<Record<string, string>>({});
const profileAllModels = ref<string>(profileAllOptions.NOTHING);
const renderTrigger = ref<number>(0); // Reactive variable to trigger rerender
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
  if (filterType.value === Constants.SVG_ELEMENTS_FILTER.SHAPE) {
    return mappingShapeColumns;
  } else if (filterType.value === Constants.SVG_ELEMENTS_FILTER.COLOR) {
    return mappingColorColumns;
  }
};

const getFilteredElements = () => {
  if (filterType.value === Constants.SVG_ELEMENTS_FILTER.SHAPE) {
    return elementsFilterByShape;
  } else if (filterType.value === Constants.SVG_ELEMENTS_FILTER.COLOR) {
    return elementsFilterByColor;
  }
  return [];
};

const parseSVGContent = (svgContent: string) => {
  parse(svgContent).then((json) => filterSvgElements(json));
};

const handleSelectingRowsProcess = (
  event: Parameters<NonNullable<QTableProps['onSelection']>>[0]
) => {
  // create an array for all the selected elements
  const selectedElements = event.rows?.reduce((elements, row) => {
    const selectedElement = getSelectedElementData(
      row[filterType.value],
      row.elements,
      event.added
    );
    elements.push(selectedElement);

    return elements;
  }, []);

  imageToGcodeConvertorStore.applySVGProfilingChanges(selectedElements);
};

const handleChangeOfSVGElementProfile = (
  props: Parameters<QTableSlots['item']>[0]
) => {
  if (props.selected) {
    // reset the profiling all option
    profileAllModels.value = profileAllOptions.NOTHING;

    const selectedElement = getSelectedElementData(
      props.row[filterType.value],
      props.row.elements,
      // make sure it is not an empty profile option
      profileModels.value[props.row[filterType.value]] !==
        profileOptions.NOTHING
    );
    imageToGcodeConvertorStore.applySVGProfilingChanges([selectedElement]);
  }
};

const handleChangeOfAllProfiles = () => {
  if (imageFile.value?.type === 'image/svg+xml') {
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
  if (profileAllModels.value === profileAllOptions.CUT_EVERYTHING) {
    selectedElements = processAllRows(profileOptions.CUT, true);
  }
  // mark everything
  else if (profileAllModels.value === profileAllOptions.MARK_EVERYTHING) {
    selectedElements = processAllRows(profileOptions.MARK, true);
  }
  // engrave everything
  else if (profileAllModels.value === profileAllOptions.ENGRAVE_EVERYTHING) {
    selectedElements = processAllRows(profileOptions.ENGRAVE, true);
  } else {
    selectedElements = processAllRows(profileOptions.NOTHING, false);
    // unselect all rows
    selected.value = [];
  }

  imageToGcodeConvertorStore.applySVGProfilingChanges(selectedElements);
};

const processAllRows = (option: string, isSelectAll: boolean) => {
  // helper function to get the key value for the profile option
  const profileKeys = Object.keys(profileOptions);

  const profile =
    profileKeys.find((key) => profileOptions[key] === option) || 'NOTHING';

  // select all rows
  selected.value = table.value?.rows as QTableProps['selected'];

  // give all rows the specified profile option value
  return selected.value?.reduce((elements, row) => {
    profileModels.value[row[filterType.value]] = profileOptions[profile];
    const selectedElement = getSelectedElementData(
      row[filterType.value],
      row.elements,
      isSelectAll
    );
    elements.push(selectedElement);
    return elements;
  }, []);
};

const processProfilingForImageFile = () => {
  imageToGcodeConvertorStore.applyImageProfilingChanges(profileAllModels.value);
};

const handleFilterChange = async () => {
  // clear the profile models and selected elements
  profileModels.value = {};
  selected.value = [];
  profileAllModels.value = profileAllOptions.NOTHING;
  isCanvasLoading.value = true;
  imageToGcodeConvertorStore.resetAllModifications();

  if (filterType.value === Constants.SVG_ELEMENTS_FILTER.SHAPE) {
    // fill it with cut values for all the shapes
    elementsFilterByShape.forEach((element) => {
      profileModels.value[element.shape] = profileOptions.NOTHING;
    });
  } else if (filterType.value === Constants.SVG_ELEMENTS_FILTER.COLOR) {
    // fill it with cut values for all the shapes
    elementsFilterByColor.forEach((element) => {
      profileModels.value[element.color] = profileOptions.NOTHING;
    });
  }
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
  const elementProfileType = profileModels.value[identifier];

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

// watch for changes on the svg file
watch(imageFile, (newSVGFile) => {
  if (newSVGFile) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const fileReader = e.target as FileReader;
      if (fileReader && fileReader.result) {
        if (newSVGFile.type === 'image/svg+xml') {
          const svgContent = fileReader.result as string;
          parseSVGContent(svgContent);
        }
        // reactive element in case the user uploaded a new file to show parsed elements
        renderTrigger.value++;
      }
    };
    reader.readAsText(newSVGFile);

    // wait small time until the svg file gets uploaded
    setTimeout(() => handleFilterChange(), 100);
  }
});

onMounted(() => {
  if (imageFile.value) {
    handleFilterChange();
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
