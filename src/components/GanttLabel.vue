<script setup lang="ts">
import { Task } from "../utils/types";

const props = defineProps<{ highlight: boolean }>();

const model = defineModel<Task>({ required: true });

const emit = defineEmits<{
  settingsClick: [{ taskId: number }];
}>();
</script>

<template>
  <div
    class="group flex gap-2 border-b border-default px-1 text-sm"
    :class="{ highlight: highlight }"
  >
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
      class="hidden shrink-0 group-hover:block"
      title="Open task configuration"
      @click="emit('settingsClick', { taskId: model.id })"
    />
  </div>
</template>

<style>
.highlight::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;
  background-color: var(--color-primary);
  pointer-events: none;
}
</style>
