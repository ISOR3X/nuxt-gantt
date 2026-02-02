<script setup lang="ts">
import { computed } from "vue";
import { Task } from "../utils/types";
import UDatePicker from "./UDatePicker.vue";

const { task } = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  close: [Task | null];
}>();

// Create computed properties for two-way binding
const startDate = computed({
  get: () => task.startDate,
  set: (newDate) => {
    task.startDate = newDate;
  },
});

const endDate = computed({
  get: () => task.endDate,
  set: (newDate) => {
    task.endDate = newDate;
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
