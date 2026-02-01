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
  <UModal title="Task configuration" description="Edit the task configuration." :close="false">
    <template #body>
      <UForm v-if="task">
        <UFormField label="Label">
          <UInput v-model="task.label" />
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
