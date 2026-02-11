<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Task } from "../runtime/types/gantt";
import { Temporal } from "temporal-polyfill";
import Chart from "../runtime/components/gantt/Chart.vue";

const uniqueTasks: Task[] = [
  {
    id: "",
    label: "",
    startDate: Temporal.Now.plainDateISO(),
    endDate: Temporal.Now.plainDateISO().add({ days: 1 }),
  },
  {
    id: "",
    label: "",
    type: "milestone",
    startDate: Temporal.Now.plainDateISO().add({ days: 2 }),
  },
];

const tasks = ref<Task[]>([]);

onMounted(() => {
  for (let i = 0; i < 20; i++) {
    for (const task of uniqueTasks) {
      tasks.value.push({ ...task });
    }
  }
});

const cellWidth = ref(30);
</script>

<template>
  <div class="h-full w-full bg-black p-12">
    <Chart
      class="rounded-md"
      :dateRange="{
        start: Temporal.Now.plainDateISO(),
        end: Temporal.Now.plainDateISO().add({ years: 1 }),
      }"
      :cellSize="{
        width: cellWidth,
      }"
      v-model:tasks="tasks"
    />
    <!-- <UInput v-model="cellWidth" type="number" /> -->
  </div>
</template>
