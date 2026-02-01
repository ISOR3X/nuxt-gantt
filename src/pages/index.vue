<script lang="ts" setup>
import GanttChart from "../components/GanttChart.vue";
import {
  generateRandomDeadlines,
  generateRandomTask,
  generateRandomTasks,
} from "../utils/random.ts";
import { ref, useTemplateRef } from "vue";
import { saveProject as _saveProject, loadProjectFromFile } from "../utils/storage.ts";
import { Temporal } from "temporal-polyfill";
import { Project } from "../utils/types.ts";
import { DropdownMenuItem } from "@nuxt/ui";

const cellWidth = ref(30);
const cellHeight = ref(30);

const fileInput = useTemplateRef("fileInput");
const ganttChart = useTemplateRef<InstanceType<typeof GanttChart>>("ganttChart");

const startDate = Temporal.Now.plainDateISO().subtract({ months: 1 });
const endDate = Temporal.Now.plainDateISO().add({ months: 3 });

function generateRandomDeadlinesWithToday(count: number, inBetween: number[]) {
  const deadlines = generateRandomDeadlines(count, inBetween);

  deadlines.push({
    col: startDate.until(Temporal.Now.plainDateISO()).days,
    id: -1,
    label: "today",
  });

  return deadlines;
}

const project = ref<Project>({
  label: "sample-project",
  startDate: startDate,
  endDate: endDate,
  tasks: generateRandomTasks(10, [0, startDate.until(endDate).days]),
  deadlines: generateRandomDeadlinesWithToday(10, [0, startDate.until(endDate).days]),
});

// Save tasks to JSON file
function saveProject() {
  try {
    _saveProject(project.value);
  } catch (error) {
    console.error("Error saving tasks:", error);
    alert("Failed to save tasks. Please try again.");
  }
}

// Load tasks from JSON file
function loadProject() {
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
    const loadedProject = await loadProjectFromFile(file);
    project.value = loadedProject;

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

// Test scrollTo function
function testScrollTo() {
  const d = startDate.add({ months: 1 });
  console.log("Scrolling to", d.toString());
  ganttChart.value?.scrollTo(startDate.until(d).days, {
    behavior: "smooth",
    alignment: "start",
  });
}

function addTask() {
  project.value.tasks.push(
    generateRandomTask(project.value.tasks.length, [0, startDate.until(endDate).days]),
  );
}

const items = ref<DropdownMenuItem[][]>([
  [
    {
      label: "Edit project",
      icon: "i-lucide-calendar-cog",
      onSelect() {
        console.log("");
      },
      disabled: true,
    },
    {
      label: "Edit deadlines",
      icon: "i-lucide-flag-triangle-left",
      onSelect() {
        console.log("");
      },
      disabled: true,
    },

    {
      label: "Load project",
      icon: "i-lucide-upload",
      onSelect() {
        loadProject();
      },
    },
    {
      label: "Save project",
      icon: "i-lucide-download",
      onSelect() {
        saveProject();
      },
    },
    {
      label: "Settings",
      icon: "i-lucide-settings",
      onSelect() {
        console.log("");
      },
      disabled: true,
    },
  ],
]);
</script>

<template>
  <div class="flex h-full flex-1 flex-col gap-4 p-4">
    <GanttChart
      ref="ganttChart"
      class="grow"
      :start-date="project.startDate"
      :end-date="project.endDate"
      :cell-width
      :cell-height
      :dropdown-items="items"
      v-model="project"
    />
    <div class="flex items-center gap-4 rounded-md border border-muted p-4">
      <UFormField label="Cell width (px)" orientation="horizontal">
        <UInput v-model.number="cellWidth" max="200" min="5" type="number" />
      </UFormField>
      <UFormField label="Cell height (px)" orientation="horizontal">
        <UInput v-model.number="cellHeight" max="200" min="5" type="number" />
      </UFormField>
      <UButton label="scroll to date" @click="testScrollTo()" />
      <UButton label="add task" @click="addTask()" />
      <UButton
        icon="simple-icons:github"
        color="neutral"
        variant="subtle"
        to="https://github.com/ISOR3X/nuxt-gantt"
        target="_blank"
      />
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
