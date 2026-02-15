<script setup lang="ts">
import { computed, ref } from "vue";
import { Task } from "../types";
import UDatePicker from "./UDatePicker.vue";
import { cloneTask } from "../utils/gantt";
import { formatDurationInDays } from "../utils/temporal";

const { task } = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  close: [Task | null];
}>();

const clonedTask = ref<Task>(cloneTask(task));

// Create computed properties for two-way binding
const startDate = computed({
  get: () => task.startDate,
  set: (newDate) => {
    clonedTask.value.startDate = newDate;
  },
});

const endDate = computed({
  get: () => task.endDate,
  set: (newDate) => {
    clonedTask.value.endDate = newDate;
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
      <UForm v-if="task" class="space-y-4">
        <UFormField label="Label">
          <UInput v-model="clonedTask.label" />
        </UFormField>
        <UFormField label="Progress" :hint="`${(task.progress * 100).toFixed(0)}%`">
          <USlider v-model="clonedTask.progress" :max="1" :step="0.01" />
        </UFormField>
        <div class="grid grid-cols-3 gap-x-4">
          <UFormField label="Start date">
            <UDatePicker v-model="startDate" :max-value="endDate" />
          </UFormField>
          <UFormField label="End date">
            <UDatePicker v-model="endDate" :min-value="startDate" />
          </UFormField>
          <UFormField label="Duration">
            <!-- TODO: Allow duration input -->
            <UButton disabled variant="subtle" color="neutral">
              {{ formatDurationInDays(clonedTask.startDate.until(clonedTask.endDate)) }}
            </UButton>
          </UFormField>
        </div>
        <div v-if="task.dependencies">
          <UFormField label="Dependencies">
            <div v-for="d in task.dependencies">{{ d.toId }}: {{ d.type }}</div>
          </UFormField>
        </div>
      </UForm>
      <p v-else>No task found</p>
    </template>
    <template #footer>
      <UButton label="Cancel" class="ml-auto" variant="outline" @click="emit('close', null)" />
      <UButton label="Submit" @click="emit('close', clonedTask)" />
    </template>
  </UModal>
</template>
