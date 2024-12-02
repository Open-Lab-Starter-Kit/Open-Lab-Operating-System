<template>
  <div class="column q-gutter-y-md">
    <div class="row items-center justify-between">
      <span>Job name:</span>
      <span class="text-bold">{{ fileData.fileName }}</span>
    </div>

    <div class="row items-center justify-between">
      <span>Material:</span>
      <div class="row items-end q-gutter-x-sm">
        <span>{{ fileData.materialName }}</span>
        <img
          v-if="fileData.materialImage"
          :src="fileData.materialImage"
          class="material-img"
          alt="material image"
        />
      </div>
    </div>

    <div class="row items-center justify-between">
      <span>Thickness:</span>
      <span>{{ fileData.materialThickness }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useJobsFilesManagementStore } from 'src/stores/jobs-files-management';

const filesManagerStore = useJobsFilesManagementStore();
const { fileData } = storeToRefs(filesManagerStore);
</script>
<style scoped>
.material-img {
  border: solid rgb(218, 215, 215) 2px;
  border-radius: 5px;
  max-width: 3vw;
  max-height: 3vw;
}
</style>
