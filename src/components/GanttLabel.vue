<script setup lang="ts">
import { Task } from "../utils/types";

const model = defineModel<Task>({ required: true });

const emit = defineEmits<{
  settingsClick: [{ taskId: number }];
}>();
</script>

<template>
  <div class="group flex gap-2 border-b border-default px-1 text-sm">
    <UInput
      class="h-full min-w-0 flex-1 truncate py-0.5"
      size="md"
      variant="ghost"
      v-model="model.label"
    />

    <UButton
      icon="i-lucide-settings-2"
      size="md"
      variant="ghost"
      class="my-1 hidden shrink-0 group-hover:block"
      title="Open task configuration"
      @click="emit('settingsClick', { taskId: model.id })"
    />
  </div>
</template>
