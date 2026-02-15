<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from "vue";
import { Task, TaskDependency } from "../runtime/types/gantt";
import { Temporal } from "temporal-polyfill";
import Chart from "../runtime/components/gantt/Chart.vue";
import { loadProjectFromFile, saveProject as _saveProject } from "../runtime/utils/storage";
import { Project } from "../runtime/types/common";
import SearchModal from "../runtime/components/SearchModal.vue";

const chart = useTemplateRef("chart");
const fileInput = useTemplateRef("fileInput");

const uniqueTasks: Task[] = [
  {
    id: "19g4nh",
    label: "Task",
    progress: 0.9,
    startDate: Temporal.Now.plainDateISO().add({ days: 2 }),
    endDate: Temporal.Now.plainDateISO().add({ days: 5 }),
  },
  {
    id: "f93mgi",
    label: "Milestone",
    type: "milestone",
    startDate: Temporal.Now.plainDateISO().add({ days: 4 }),
  },
];

const project = ref<Project>({
  label: "",
  startDate: Temporal.Now.plainDateISO().subtract({ weeks: 1 }),
  endDate: Temporal.Now.plainDateISO().add({ months: 6 }),
  events: [
    {
      id: "10g92n",
      label: "Today",
      type: "deadline",
      startDate: Temporal.Now.plainDateISO(),
    },
    {
      id: "g02cnt",
      label: "Holiday",
      startDate: Temporal.Now.plainDateISO().add({ days: 2 }),
      endDate: Temporal.Now.plainDateISO().add({ weeks: 1 }),
    },
  ],
  tasks: [],
});

const tasksForSearchModal = computed(() => {
  let result: { label: string; id: string }[] = [];
  if (project.value.tasks) {
    result = project.value.tasks.map((t) => ({
      label: t.label,
      id: t.id,
    }));
  }
  return result;
});

onMounted(() => {
  let idx = 0;
  for (let i = 0; i < 20; i++) {
    for (const task of uniqueTasks) {
      const newTask = task;
      const prevTask = project.value.tasks?.[i - 1];
      let dep: TaskDependency[] = [];

      if (prevTask !== undefined) {
        dep.push({
          taskId: prevTask.id,
          type: "SF",
        });
      }

      newTask.startDate = newTask.startDate.add({ days: 4 });

      if (newTask.endDate) newTask.endDate = newTask.endDate.add({ days: 4 });

      project.value.tasks?.push({
        ...newTask,
        label: `${newTask.label} ${idx}`,
        id: crypto.randomUUID(),
        dependencies: dep,
      });
      idx++;
    }
  }
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
</script>

<template>
  <div class="flex h-full w-full flex-col gap-4 p-12">
    <Chart
      ref="chart"
      v-model:tasks="project.tasks"
      v-model:events="project.events"
      class="rounded-md border border-muted"
      :date-range="{
        start: project.startDate,
        end: project.endDate,
      }"
    />
    <div class="inline-flex items-center space-x-4">
      <SearchModal :items="tasksForSearchModal" @itemSelect="(i) => chart?.scrollToItem(i.id)" />
      <UFieldGroup>
        <UButton label="Save project" @click="saveProject()" icon="i-lucide-download" />
        <UButton label="Load project" @click="loadProject()" icon="i-lucide-upload" />
      </UFieldGroup>
      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        style="display: none"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>
