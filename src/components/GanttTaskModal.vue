<script setup lang="ts">
import { Temporal } from "temporal-polyfill";
import { computed } from "vue";
import { Task } from "../utils/types";
import UDatePicker from "./UDatePicker.vue";

const { task } = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  close: [Task | null];
}>();

// Helper to check if something is a Temporal.PlainDate
function isTemporalPlainDate(value: any): boolean {
  return value && typeof value.until === "function" && typeof value.toString === "function";
}

// Helper to ensure we get a valid Temporal.PlainDate
function ensureTemporalDate(date: any): Temporal.PlainDate | null {
  if (!date) return null;

  if (isTemporalPlainDate(date)) {
    return date;
  }

  // Try to convert it
  try {
    if (typeof date === "string") {
      return Temporal.PlainDate.from(date);
    }
    if (date.toString && typeof date.toString === "function") {
      return Temporal.PlainDate.from(date.toString());
    }
  } catch (e) {
    console.error("Failed to convert to Temporal.PlainDate:", date, e);
  }

  return null;
}

// Create computed properties for two-way binding
const startDate = computed({
  get: () => task.startDate,
  set: (newDate) => {
    const newTemporal = ensureTemporalDate(newDate);
    task.startDate = newTemporal || newDate;
  },
});

const endDate = computed({
  get: () => task.endDate,
  set: (newDate) => {
    const newTemporal = ensureTemporalDate(newDate);
    task.endDate = newTemporal || newDate;
  },
});
</script>

<template>
  <UModal
    title="Task configuration"
    description="Edit the task configuration. Cancelling will revert all made changes."
    :close="false"
  >
    <template #body>
      <UForm v-if="task" class="space-y-2">
        <UFormField label="Label">
          <UInput v-model="task.label" />
        </UFormField>
        <UFormField label="Progress" :hint="`${(task.progress * 100).toFixed(0)}%`">
          <USlider v-model="task.progress" :max="1" :step="0.01" />
        </UFormField>
        <div class="flex gap-4">
          <UFormField label="Start date">
            <UDatePicker v-model="startDate" :max-value="endDate" />
          </UFormField>
          <UFormField label="End date">
            <UDatePicker v-model="endDate" :min-value="startDate" />
          </UFormField>
        </div>
      </UForm>
      <p v-else>No task found</p>
    </template>
    <template #footer>
      <UButton label="Cancel" class="ml-auto" variant="outline" @click="emit('close', null)" />
      <UButton label="Submit" @click="emit('close', task)" />
    </template>
  </UModal>
</template>
