<script lang="ts" setup>
import GanttChart from "../components/GanttChart.vue";
import {
  generateRandomDeadlines,
  generateRandomTask,
  generateRandomTasks,
} from "../utils/random.ts";
import { ref, useTemplateRef } from "vue";
import { loadProjectFromFile, saveProject as _saveProject } from "../utils/storage.ts";
import { Temporal } from "temporal-polyfill";
import { Deadline, Project, Vec2 } from "../types";
import { DropdownMenuItem } from "@nuxt/ui";

const cellSize = ref<Vec2>({ x: 30, y: 30 });

const fileInput = useTemplateRef("fileInput");
const ganttChart = useTemplateRef<InstanceType<typeof GanttChart>>("ganttChart");

const startDate = Temporal.Now.plainDateISO().subtract({ months: 1 });
const endDate = Temporal.Now.plainDateISO().add({ months: 3 });

function generateRandomDeadlinesWithToday(
  count: number,
  dateRange: [Temporal.PlainDate, Temporal.PlainDate],
): Deadline[] {
  const deadlines = generateRandomDeadlines(count, dateRange);
  const today = Temporal.Now.plainDateISO();

  deadlines.push({
    id: -1,
    date: today,
    label: "Today",
  });

  return deadlines;
}

const project = ref<Project>({
  label: "sample-project",
  startDate: startDate,
  endDate: endDate,
  tasks: generateRandomTasks(200, [startDate, endDate]),
  deadlines: generateRandomDeadlinesWithToday(10, [startDate, endDate]),
});

// Save tasks to a JSON file
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
    // FIXME: Why isn't min/max dates in header updates on project load?
    project.value = await loadProjectFromFile(file);

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
    generateRandomTask(project.value.tasks.length, [
      project.value.startDate,
      project.value.endDate,
    ]),
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
  <div class="h-full p-4">
    <GanttChart
      ref="ganttChart"
      v-model:tasks="project.tasks"
      v-model:deadlines="project.deadlines"
      class="rounded-md border border-default"
      :start-date="project.startDate"
      :end-date="project.endDate"
      :cell-size
    >
      <template #header>
        <UInput v-model="project.label" variant="ghost" class="font-bold" />
        <UDropdownMenu :items="items" :content="{ align: 'start' }">
          <UButton icon="i-lucide-menu" color="neutral" variant="ghost" />
        </UDropdownMenu>
      </template>
    </GanttChart>
  </div>
  <div
    class="fixed right-12 bottom-12 z-50 flex items-center gap-4 rounded-md border border-muted bg-muted p-4"
  >
    <UFormField label="Cell width (px)" orientation="horizontal">
      <UInput v-model.number="cellSize.x" max="200" min="20" type="number" />
    </UFormField>
    <UFormField label="Cell height (px)" orientation="horizontal">
      <UInput v-model.number="cellSize.y" max="200" min="20" type="number" />
    </UFormField>
    <UButton label="scroll to date" @click="testScrollTo()" />
    <UButton label="add task" @click="addTask()" />
    <!-- Hidden file input for loading tasks -->
    <input
      ref="fileInput"
      type="file"
      accept="application/json,.json"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>
