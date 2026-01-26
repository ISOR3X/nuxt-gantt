<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef } from "vue";
import { Temporal } from "temporal-polyfill";
import { Task } from "../utils/types";
import { daysBetween, isBetween } from "../utils/temporal";
import { saveTasks as saveTasksToFile, loadTasksFromFile } from "../utils/taskStorage";

const scrollArea = useTemplateRef("scrollArea");
const fileInput = useTemplateRef("fileInput");

const pixelsWidth = ref(20);
const pixelsHeight = ref(20);

const visibleDates = computed<Temporal.PlainDate[]>(() => {
  const indexes: number[] = scrollArea.value?.virtualizer?.getVirtualIndexes() ?? [];
  return indexes.map((i) => items.value[i].date);
});

const taskBarMeta = computed(() => {
  // We search in reverse so the ganttbar that uses this is draw latest, so if we have borders they are drawn under.
  // Additionally, we offset the end date by one so we can draw the drag handles a bit outside of the container.
  const meta = tasks.value.map((t) => {
    const date = visibleDates.value.findLast((d) => {
      return isBetween(t.startDate, t.endDate.add({ days: 1 }), d);
    });
    if (date) {
      return {
        endDate: date,
        span: daysBetween(date, t.startDate),
      };
    }
  });
  return meta;
});

const _tasks: Task[] = [
  {
    id: "0",
    label: "Do task",
    startDate: Temporal.Now.plainDateISO(),
    endDate: Temporal.Now.plainDateISO(),
  },
  {
    id: "1",
    label: "Do other task",
    startDate: Temporal.Now.plainDateISO().subtract({ days: 2 }),
    endDate: Temporal.Now.plainDateISO().add({ days: 50 }),
  },
  {
    id: "2",
    label: "Do another task",
    startDate: Temporal.Now.plainDateISO().subtract({ days: 5 }),
    endDate: Temporal.Now.plainDateISO().subtract({ days: 3 }),
  },
];
const tasks = ref(Array.from({ length: 10 }, () => _tasks).flat());

const now = Temporal.Now.plainDateISO();
const startDate = now.subtract({ years: 1 });
const endDate = now.add({ years: 1 });
const totalDays = startDate.until(endDate).total("days");

const items = computed<any[]>(() =>
  Array.from({ length: totalDays + 1 }, (_, i) => {
    const date = startDate.add({ days: i });
    return {
      id: i + 1,
      date: date,
      title: date.toString(),
      description: date.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  }),
);

function scrollToDate(date: Temporal.PlainDate) {
  const idx = items.value.findIndex((d) => d.date.toLocaleString() == date.toLocaleString());
  scrollArea.value?.virtualizer?.scrollToIndex(idx, {
    align: "start",
    behavior: "auto",
  });
}

onMounted(() => {
  nextTick(() => {
    scrollToDate(Temporal.Now.plainDateISO());
  });
});

function addTask() {
  tasks.value = [
    ...tasks.value,
    {
      id: "0",
      label: "Do task",
      startDate: Temporal.Now.plainDateISO(),
      endDate: Temporal.Now.plainDateISO(),
    },
  ];
}

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
  <div class="grid grid-cols-[20rem_1fr]">
    <div class="sticky top-0">
      <div class="flex h-8 items-center justify-center border border-muted/50">Tasks</div>
      <div
        v-for="t in tasks"
        class="flex items-center justify-center border-r border-b border-muted/50"
        :style="{ height: `${pixelsHeight}px` }"
      >
        {{ t.label }}
      </div>
    </div>
    <UScrollArea
      v-slot="{ item }"
      :items="items"
      ref="scrollArea"
      orientation="horizontal"
      class="h-full"
      :virtualize="{ estimateSize: pixelsWidth }"
    >
      <div
        class="flex h-8 items-center justify-center border-b border-muted/50 text-right text-sm text-nowrap"
        :style="{
          width: `${pixelsWidth}px`,
        }"
      >
        {{
          item.date.dayOfWeek == 1
            ? item.date.toLocaleString("en", { month: "short", day: "numeric" })
            : ""
        }}
      </div>
      <div v-for="(_, i) in tasks">
        <div class="relative border-b border-muted/50" :style="{ height: `${pixelsHeight}px` }">
          <GanttBar
            v-model="tasks[i]"
            v-if="taskBarMeta[i] !== undefined && taskBarMeta[i].endDate == item.date"
            class="absolute top-0 right-0 bottom-0 my-1"
            :style="{
              width: taskBarMeta[i].span * pixelsWidth + 'px',
              right: pixelsWidth + 'px',
            }"
            :pixels-width="pixelsWidth"
          />
        </div>
      </div>
    </UScrollArea>
  </div>
  <div>
    <UButton label="Add task" class="mt-2 ml-2" @click="addTask()" />
  </div>

  <!-- Hidden file input for loading tasks -->
  <input
    type="file"
    ref="fileInput"
    accept="application/json,.json"
    @change="handleFileChange"
    style="display: none"
  />

  <UCard :ui="{ body: 'flex gap-4' }" class="fixed bottom-4 left-4">
    <UButton label="Scroll to today" @click="scrollToDate(Temporal.Now.plainDateISO())" />
    <UFormField label="Height" orientation="horizontal" class="w-32">
      <UInput v-model="pixelsHeight" type="number" />
    </UFormField>
    <UFormField label="Width" orientation="horizontal" class="w-32">
      <UInput v-model="pixelsWidth" type="number" />
    </UFormField>
    <UButton title="load" icon="i-lucide-upload" @click="loadTasks()" />
    <UButton title="save" icon="i-lucide-download" @click="saveTasks()" />
  </UCard>
</template>

<style>
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--ui-bg-inverted);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--ui-bg-inverted);
}

* {
  scrollbar-width: thin;
  scrollbar-color: var(--ui-bg-inverted) transparent;
}
</style>
