<script lang="ts" setup>
import GanttChart from "../components/GanttChart.vue";
import { generateAllTasks } from "../utils/task.ts";
import { ref, useTemplateRef } from "vue";
import { saveTasks as saveTasksToFile, loadTasksFromFile } from "../utils/taskStorage";
import { Temporal } from "temporal-polyfill";

const cellWidth = ref(40);
const cellHeight = ref(50);

const tasks = ref(generateAllTasks(100));
const fileInput = useTemplateRef("fileInput");

// Save tasks to JSON file
function saveTasks() {
  try {
    saveTasksToFile(tasks.value);
  } catch (error) {
    console.error("Error saving tasks:", error);
    alert("Failed to save tasks. Please try again.");
  }
}

// Load tasks from JSON file
function loadTasks() {
  fileInput.value?.click();
}

// Handle file selection
async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    return;
  }

  try {
    const loadedTasks = await loadTasksFromFile(file);
    tasks.value = loadedTasks;

    // Reset file input so the same file can be loaded again
    target.value = "";
  } catch (error) {
    console.error("Error loading tasks:", error);
    alert(
      `Failed to load tasks: ${error instanceof Error ? error.message : "Invalid file format"}`,
    );
    target.value = "";
  }
}
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
      <UButton label="save" @click="saveTasks()" />
      <UButton label="load" @click="loadTasks()" />
      <!-- Hidden file input for loading tasks -->
      <input
        type="file"
        ref="fileInput"
        accept="application/json,.json"
        @change="handleFileChange"
        style="display: none"
      />
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
