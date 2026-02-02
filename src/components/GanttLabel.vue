<script setup lang="ts">
import { Task } from "../utils/types";

const model = defineModel<Task>({ required: true });

const emit = defineEmits<{
  settingsClick: [{ taskId: number }];
}>();
</script>

<template>
  <div class="group flex items-center justify-between border-b border-default px-4 text-sm">
    <slot>
      {{ model?.label }}
      <UButton
        icon="i-lucide-settings-2"
        size="xs"
        variant="ghost"
        class="hidden group-hover:block"
        title="Open task configuration"
        @click="emit('settingsClick', { taskId: model.id })"
      />
    </slot>
  </div>
</template>
