<script setup lang="ts">
import { Task } from "../utils/types";

const model = defineModel<Task>({ required: true });

const emit = defineEmits<{
  settingsClick: [{ taskId: number }];
}>();
</script>

<template>
  <div class="group flex w-10 items-center border-b border-default px-4 text-sm">
    <span class="min-w-0 flex-1 truncate">
      {{ model?.label }}
    </span>

    <UButton
      icon="i-lucide-settings-2"
      size="xs"
      variant="ghost"
      class="hidden shrink-0 group-hover:block"
      title="Open task configuration"
      @click="emit('settingsClick', { taskId: model.id })"
    />
  </div>
</template>
