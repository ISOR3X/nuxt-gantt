<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef } from "vue";
import { Task, TaskDependency } from "../runtime/types/gantt";
import { Temporal } from "temporal-polyfill";
import Chart from "../runtime/components/gantt/Chart.vue";
import { loadProjectFromFile, saveProject as _saveProject } from "../runtime/utils/storage";
import { Project } from "../runtime/types/common";
import SearchModal from "../runtime/components/SearchModal.vue";
import {
  CommandPaletteGroup,
  CommandPaletteItem,
} from "@nuxt/ui/runtime/components/CommandPalette.vue.js";

const chart = useTemplateRef("chart");
const fileInput = useTemplateRef("fileInput");
const searchModal = useTemplateRef("searchModal");

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

const searchModalItems = computed(() => {
  let events: CommandPaletteItem[] = [];
  let tasks: CommandPaletteItem[] = [];
  if (project.value.events) {
    events = project.value.events.map((t) => ({
      id: t.id,
      label: t.label,
      type: t.type ?? "event",
    }));
  }
  if (project.value.tasks) {
    tasks = project.value.tasks.map((t) => ({
      label: t.label,
      id: t.id,
      type: t.type ?? "task",
    }));
  }
  const result: CommandPaletteGroup[] = [
    {
      id: "actions",
      items: [
        {
          id: "newTask",
          type: "task",
          label: "Add new task",
          icon: "i-lucide-file-plus-corner",
        },
        {
          id: "newEvent",
          type: "event",
          label: "Add new event",
          icon: "i-lucide-calendar-plus",
        },
      ],
    },
    {
      id: "events",
      label: "Events",
      items: events,
    },
    {
      id: "tasks",
      label: "Tasks",
      items: tasks,
    },
  ];
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

defineShortcuts({
  meta_k: () => {
    searchModal.value?.open();
  },
});

function onSelect(value: CommandPaletteItem) {
  if (["event", "deadline"].includes(value.type)) {
    if (project.value.events) {
      let event = project.value.events.find((t) => t.id == value.id);

      if (!event) {
        const id = crypto.randomUUID();
        event = {
          label: "New event",
          type: "deadline",
          startDate: Temporal.Now.plainDateISO().add({ weeks: 2 }),
          id,
        };
        project.value.events.push(event);
      }

      nextTick(() => {
        chart.value?.scrollToItem(event.id);
        chart.value?.editEvent(event.id);
      });
    }
  } else if (["task", "milestone"].includes(value.type)) {
    if (project.value.tasks) {
      let task = project.value.tasks.find((t) => t.id == value.id);

      if (!task) {
        const id = crypto.randomUUID();
        task = {
          label: "New task",
          startDate: Temporal.Now.plainDateISO().add({ weeks: 2 }),
          id,
        };
        project.value.tasks.push(task);
      }

      nextTick(() => {
        chart.value?.scrollToItem(task.id);
        chart.value?.editTask(task.id);
      });
    }
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
      <SearchModal
        ref="searchModal"
        label="Edit item..."
        :groups="searchModalItems"
        @item-select="(i) => onSelect(i)"
      >
        <UButton
          class="w-48"
          color="neutral"
          variant="soft"
        >
          Edit items...
          <template #trailing>
            <div class="ml-auto">
              <UKbd value="meta" />
              <UKbd value="k" />
            </div>
          </template>
        </UButton>
      </SearchModal>
      <UFieldGroup class="ml-auto">
        <UButton
          label="Save project"
          variant="soft"
          icon="i-lucide-download"
          @click="saveProject()"
        />
        <UButton
          label="Load project"
          variant="soft"
          icon="i-lucide-upload"
          @click="loadProject()"
        />
      </UFieldGroup>
      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        style="display: none"
        @change="handleFileChange"
      >
    </div>
  </div>
</template>
