<script lang="ts" setup>
import { computed, ref } from "vue";
import { Task } from "../utils/types.ts";

const task = defineModel<Task>();

const { pixelsWidth = 120 } = defineProps<{
  pixelsWidth?: number;
  class?: string
  style?: object
}>();

const isDragging = ref(false);
const isResizingLeft = ref(false);
const isResizingRight = ref(false);
const dragStartX = ref(0);
const originalStartDate = ref<number | null>(null);
const originalEndDate = ref<number | null>(null);

function onMouseDownBar(e: MouseEvent) {
  if (isResizingLeft.value || isResizingRight.value) return;

  e.stopPropagation();
  isDragging.value = true;
  dragStartX.value = e.clientX;

  if (task.value) {
    originalStartDate.value = task.value.col;
    originalEndDate.value = task.value.col + task.value.width;
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseDownLeft(e: MouseEvent) {
  e.stopPropagation();
  isResizingLeft.value = true;
  dragStartX.value = e.clientX;

  if (task.value) {
    originalStartDate.value = task.value.col;
    originalEndDate.value = task.value.col + task.value.width;
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseDownRight(e: MouseEvent) {
  e.stopPropagation();
  isResizingRight.value = true;
  dragStartX.value = e.clientX;

  if (task.value) {
    originalStartDate.value = task.value.col;
    originalEndDate.value = task.value.col + task.value.width;
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(e: MouseEvent) {
  if (!task.value) return;
  if (!originalStartDate.value || !originalEndDate.value) return;

  const deltaX = e.clientX - dragStartX.value;

  // Calculate days moved with snapping
  const daysMoved = Math.round(deltaX / pixelsWidth);

  if (isDragging.value) {
    // Move the entire bar (always update, even when daysMoved is 0)
    task.value.col = originalStartDate.value + daysMoved;
    task.value.width = originalEndDate.value - originalStartDate.value;
  } else if (isResizingLeft.value) {
    const newStartDate = originalStartDate.value + daysMoved;
    // Ensure the start date doesn't go past the end date
    if (newStartDate < originalEndDate.value) {
      task.value.col = newStartDate;
      task.value.width = originalEndDate.value - newStartDate;
    }
  } else if (isResizingRight.value) {
    // Resize right edge (change end date)
    const newEndDate = originalEndDate.value + daysMoved;
    // Ensure the end date doesn't go before the start date
    if (newEndDate > originalStartDate.value) {
      task.value.width = newEndDate - originalStartDate.value;
    }
  }
}

function onMouseUp() {
  isDragging.value = false;
  isResizingLeft.value = false;
  isResizingRight.value = false;
  originalStartDate.value = null;
  originalEndDate.value = null;

  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
}

const cursorStyle = computed(() => {
  if (isDragging.value) return "cursor-grabbing";
  if (isResizingLeft.value || isResizingRight.value) return "cursor-ew-resize";
  return "cursor-grab";
});
</script>

<template>
  <UPopover :ui="{ content: 'grid grid-cols-2 gap-x-4 text-sm'}" mode="hover">
    <div class="group py-1" :style="$props.style"  :class="$props.class" >
      <!-- Left resize handle -->
      <div
        class="absolute top-0 bottom-0 -left-1 z-20 w-4 cursor-ew-resize rounded-full group-hover:bg-inverted/10"
        @mousedown.stop="onMouseDownLeft"
      />
      <div
        :class="cursorStyle"
        class="group relative h-full rounded-md border-2 border-primary bg-primary/10 select-none"
        @mousedown="onMouseDownBar"
      >
        <div
          v-if="task?.progress"
          class="absolute top-0 bottom-0 left-0 bg-primary"
          :style="{ right: `${100 - task?.progress * 100}%` }"
        />
        <slot />
      </div>
      <!-- Right resize handle -->
      <div
        class="absolute top-0 -right-1 bottom-0 z-20 w-4 cursor-ew-resize rounded-full group-hover:bg-inverted/10"
        @mousedown.stop="onMouseDownRight"
      />
    </div>
    <template #content>
        <b>Label</b>
        <p>{{task?.label}}</p>
        <b>Start date</b>
        <p>{{task?.label}}</p>
        <b>End date</b>
        <p>{{task!.label}}</p>
        <b>Progress</b>
        <p>{{(task!.progress * 100).toFixed() }}%</p>
      </template>
  </UPopover>
</template>
