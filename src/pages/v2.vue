<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Task } from "../runtime/types/gantt";
import { Temporal } from "temporal-polyfill";
import Chart from "../runtime/components/gantt/Chart.vue";

const uniqueTasks: Task[] = [
  {
    id: "19g4nh",
    label: "Task",
    startDate: Temporal.Now.plainDateISO().add({ days: 2 }),
    endDate: Temporal.Now.plainDateISO().add({ days: 5 }),
  },
  {
    id: "f93mgi",
    label: "Milestone",
    type: "milestone",
    startDate: Temporal.Now.plainDateISO().add({ days: 2 }),
  },
];

const tasks = ref<Task[]>([]);

onMounted(() => {
  for (let i = 0; i < 20; i++) {
    for (const task of uniqueTasks) {
      const newTask = task;
      newTask.startDate = newTask.startDate.add({ days: i });
      if (newTask.endDate) newTask.endDate = newTask.endDate.add({ days: i });
      tasks.value.push({ ...newTask });
    }
  }
});
</script>

<template>
  <div class="h-full w-full bg-black p-12">
    <Chart
      class="rounded-md"
      :dateRange="{
        start: Temporal.Now.plainDateISO(),
        end: Temporal.Now.plainDateISO().add({ years: 1 }),
      }"
      v-model:tasks="tasks"
    />
  </div>
</template>
