<script lang="ts" setup>
import GanttChart from "../components/GanttChart.vue";
import { generateAllTasks } from "../utils/task.ts";
import { ref } from "vue";

const cellWidth = ref(40);
const cellHeight = ref(50);

const tasks = ref(generateAllTasks(100));
</script>

<template>
  <div class="flex h-screen w-screen flex-col gap-4 bg-black p-4">
    <GanttChart v-model="tasks" :cell-width="cellWidth" :cell-height="cellHeight" />
    <div class="flex items-center gap-4 bg-muted p-4">
      <UFormField label="Cell width (px)" orientation="horizontal">
        <UInput v-model.number="cellWidth" max="200" min="5" type="number" />
      </UFormField>
      <UFormField label="Cell height (px)" orientation="horizontal">
        <UInput v-model.number="cellHeight" max="200" min="5" type="number" />
      </UFormField>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--ui-bg-elevated);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--ui-bg-elevated);
}

* {
  scrollbar-width: thin;
  scrollbar-color: var(--ui-bg-elevated) transparent;
}
</style>
