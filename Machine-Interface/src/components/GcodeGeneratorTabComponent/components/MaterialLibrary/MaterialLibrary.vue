<template>
  <div class="row items-center justify-between">
    <p class="text-h6"><u>List of Saved Materials:</u></p>
    <q-btn @click="addNewMaterial" color="primary" icon="add" unelevated>
      <q-tooltip>Add new Material</q-tooltip></q-btn
    >
  </div>
  <div v-if="materialsList">
    <q-list
      v-for="material in materialsList"
      :key="material.materialId"
      bordered
    >
      <q-expansion-item
        dense-toggle
        expand-icon-toggle
        expand-separator
        header-style="fontSize: 18px"
      >
        <template v-slot:header="{ expanded }">
          <q-item-section style="font-size: 18px">
            {{ material.materialName }}
          </q-item-section>
          <q-item-section v-if="expanded && material.isEditable">
            <transition
              appear
              enter-active-class="animated slideInRight"
              leave-active-class="animated slideInLeft"
            >
              <q-btn
                flat
                color="primary"
                icon="settings"
                class="row self-end"
                style="width: fit-content"
                @click="showMaterialSettings(material)"
              >
                <q-tooltip>Material Settings</q-tooltip>
              </q-btn>
            </transition>
          </q-item-section>
        </template>

        <q-list
          v-for="thickness in material.materialThicknesses"
          :key="thickness.thicknessId"
          bordered
          class="bg-grey-3"
        >
          <q-expansion-item
            dense-toggle
            expand-icon-toggle
            expand-separator
            :header-inset-level="1"
            :content-inset-level="2"
          >
            <template v-slot:header>
              <q-item-section avatar>
                <q-icon color="dark" name="straighten" />
              </q-item-section>
              <q-item-section style="font-size: 15px"
                >{{ thickness.thicknessValue }} mm
              </q-item-section>
            </template>
            <q-list
              v-for="operation in thickness.thicknessOperations"
              :key="operation.operationId"
            >
              <q-item>
                <q-item-section avatar>
                  <q-icon
                    color="dark"
                    :name="
                      operation.operationType ===
                        Constants.PROFILE_OPTIONS.CUT ||
                      operation.operationType === Constants.PROFILE_OPTIONS.MARK
                        ? 'category'
                        : 'apps'
                    "
                  />
                </q-item-section>
                <q-item-section style="font-size: 15px"
                  >{{ operation.operationType }}
                </q-item-section>
              </q-item>
              <q-separator inset />
            </q-list>
          </q-expansion-item>
        </q-list>
      </q-expansion-item>
    </q-list>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useMaterialLibraryStore } from 'src/stores/material-library';
import { Constants } from 'src/constants';
import { useQuasar } from 'quasar';
import MaterialLibraryDialog from './components/MaterialLibraryDialog.vue';
import { MaterialData } from 'src/interfaces/imageToGcode.interface';

const $q = useQuasar();
const materialLibraryStore = useMaterialLibraryStore();

const { materialsList } = storeToRefs(materialLibraryStore);

const showMaterialSettings = (material: MaterialData) => {
  $q.dialog({
    component: MaterialLibraryDialog,
    componentProps: {
      isEditMaterial: true,
      material,
    },
  });
};

const addNewMaterial = () => {
  $q.dialog({
    component: MaterialLibraryDialog,
    componentProps: {
      isEditMaterial: false,
      material: null,
    },
  });
};
</script>
