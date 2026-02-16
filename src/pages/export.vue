<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from "vue";
import { Task, TaskDependency } from "../runtime/types/gantt";
import { Temporal } from "temporal-polyfill";
import Chart from "../runtime/components/gantt/Chart.vue";
import { loadProjectFromFile, saveProject as _saveProject } from "../runtime/utils/storage";
import { Project } from "../runtime/types/common";
import { useStorage } from "@vueuse/core";

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
      label: "Deadline 1",
      type: "deadline",
      startDate: Temporal.Now.plainDateISO().add({ weeks: 1 }),
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


const cellSize = useStorage('cellSize', {
  width: 30,
  height: 30,
})

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
  <div class="h-screen w-screen">
    <Chart
      ref="chart"
      v-model:tasks="project.tasks"
      v-model:events="project.events"
      readOnly
      :date-range="{
        start: project.startDate,
        end: project.endDate,
      }"
      :cell-size
      >
          <template #corner>
      
      <div class="grid grid-cols-7 items-center place-items-center">
        <UButton
          to="https://github.com/ISOR3X/nuxt-gantt/"
          target="_blank"
          icon="simple-icons:github"
          class="mr-auto"
          color="neutral"
          variant="ghost"
        />
      
        <UButton variant="link" title="Download" @click="saveProject()" icon="i-lucide-download" size="sm"/>
        <UButton variant="link" title="Upload" @click="loadProject()" icon="i-lucide-upload" size="sm"/>
          
        <UIcon name="i-lucide-arrow-left-right"/>
        <UInput type="number" v-model="cellSize.width" />
        <UIcon name="i-lucide-arrow-up-down"/>
        <UInput type="number" v-model="cellSize.height" />
      </div>
          
          </template>
      </Chart>
  </div>
  <input
    ref="fileInput"
    type="file"
    accept="application/json,.json"
    style="display: none"
    @change="handleFileChange"
  />
</template>
