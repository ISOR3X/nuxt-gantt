<script lang="ts" setup>
import { useGanttContext } from "../composables/gantt.ts";
import { Task } from "../types";

const props = defineProps<{
  visibleRows: { index: number; label: string; top: number }[];
  hoveredRow: number | undefined;
}>();

const tasks = defineModel<Task[]>("tasks", { required: true });

const emit = defineEmits<{
  settingsClick: [{ taskId: number }];
}>();

const { cellSize, totalHeight, scrollTop } = useGanttContext();
</script>

<template>
  <div class="row-start-2 overflow-hidden border-r border-muted">
    <div
      :style="{
        height: `${totalHeight}px`,
        transform: `translateY(-${scrollTop}px)`,
      }"
      class="relative w-full"
    >
      <template v-for="row in visibleRows" :key="row.index">
        <div
          v-if="row.index < tasks.length"
          :style="{
            top: `${row.top}px`,
            height: `${cellSize.y}px`,
          }"
          class="group absolute left-0 flex w-full gap-2 border-b border-default px-1 text-sm"
          :title="tasks[row.index].label"
          :class="{ highlight: row.index === hoveredRow }"
        >
          <UInput
            v-model="tasks[row.index].label"
            class="h-full min-w-0 flex-1 truncate py-0.5"
            :ui="{ base: 'truncate' }"
            size="md"
            variant="ghost"
          />
          <UButton
            icon="i-lucide-settings-2"
            size="md"
            variant="ghost"
            class="hidden shrink-0 group-hover:block"
            title="Open task configuration"
            @click="emit('settingsClick', { taskId: tasks[row.index].id })"
          />
        </div>
        <div
          v-else
          :style="{
            top: `${row.top}px`,
            height: `${cellSize.y}px`,
          }"
          class="absolute left-0 w-full border-b border-default"
        />
      </template>
    </div>
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
