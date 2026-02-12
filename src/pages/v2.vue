<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from "vue";
import { Task } from "../runtime/types/gantt";
import { Temporal } from "temporal-polyfill";
import Chart from "../runtime/components/gantt/Chart.vue";

const chart = useTemplateRef("chart");

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

const tasks = ref<Task[]>([]);

onMounted(() => {
  let idx = 0;
  for (let i = 0; i < 20; i++) {
    for (const task of uniqueTasks) {
      const newTask = task;
      newTask.startDate = newTask.startDate.add({ days: 4 });
      if (newTask.endDate) newTask.endDate = newTask.endDate.add({ days: 4 });
      tasks.value.push({ ...newTask, label: `${newTask.label} ${idx}`, id: crypto.randomUUID() });
      idx++;
    }
  }
});
</script>

<template>
  <div class="flex h-full w-full flex-col gap-4 bg-black p-12">
    <Chart
      ref="chart"
      class="rounded-md"
      :dateRange="{
        start: Temporal.Now.plainDateISO(),
        end: Temporal.Now.plainDateISO().add({ years: 1 }),
      }"
      v-model:tasks="tasks"
    />
    <div class="space-x-4">
      <UButton label="Scroll to 10th task" @click="chart?.scrollToItem(tasks[10])" />
    </div>
  </div>
</template>
