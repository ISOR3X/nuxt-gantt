<script setup lang="ts">
import { Task } from "../utils/types";

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  close: [Task | null];
}>();
</script>

<template>
  <UModal title="Task configuration" description="Edit the task configuration. Cancelling will revert all made changes." :close="false">
    <template #body>
      <UForm v-if="task" class="space-y-2">
        <UFormField label="Label">
          <UInput v-model="task.label" />
        </UFormField>
        <UFormField label="Progress" :hint="`${(task.progress * 100).toFixed(0)}%`">
            <USlider v-model="task.progress" :max="1" :step="0.01"/>
        </UFormField>
      </UForm>
      <p v-else>No task found</p>
    </template>
    <template #footer>
      <UButton label="Cancel" class="ml-auto" variant="outline" @click="emit('close', null)" />
      <UButton label="Submit" @click="emit('close', task)" />
    </template>
  </UModal>
</template>
