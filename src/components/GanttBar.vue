<script lang="ts" setup>
import { computed, ref } from "vue";
import { Task } from "../utils/types.ts";

const model = defineModel<Task>();

const { pixelsWidth = 120 } = defineProps<{
  pixelsWidth?: number;
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

  if (model.value) {
    originalStartDate.value = model.value.col;
    originalEndDate.value = model.value.col + model.value.width;
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseDownLeft(e: MouseEvent) {
  e.stopPropagation();
  isResizingLeft.value = true;
  dragStartX.value = e.clientX;

  if (model.value) {
    originalStartDate.value = model.value.col;
    originalEndDate.value = model.value.col + model.value.width;
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseDownRight(e: MouseEvent) {
  e.stopPropagation();
  isResizingRight.value = true;
  dragStartX.value = e.clientX;

  if (model.value) {
    originalStartDate.value = model.value.col;
    originalEndDate.value = model.value.col + model.value.width;
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(e: MouseEvent) {
  if (!model.value) return;
  if (!originalStartDate.value || !originalEndDate.value) return;

  const deltaX = e.clientX - dragStartX.value;

  // Calculate days moved with snapping
  const daysMoved = Math.round(deltaX / pixelsWidth);

  if (isDragging.value) {
    // Move the entire bar (always update, even when daysMoved is 0)
    model.value.col = originalStartDate.value + daysMoved;
    model.value.width = originalEndDate.value - originalStartDate.value;
  } else if (isResizingLeft.value) {
    const newStartDate = originalStartDate.value + daysMoved;
    // Ensure the start date doesn't go past the end date
    if (newStartDate < originalEndDate.value) {
      model.value.col = newStartDate;
      model.value.width = originalEndDate.value - newStartDate;
    }
  } else if (isResizingRight.value) {
    // Resize right edge (change end date)
    const newEndDate = originalEndDate.value + daysMoved;
    // Ensure the end date doesn't go before the start date
    if (newEndDate > originalStartDate.value) {
      model.value.width = newEndDate - originalStartDate.value;
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
  <div class="group py-1">
    <!-- Left resize handle -->
    <div
      class="absolute top-0 bottom-0 -left-1 z-20 w-4 cursor-ew-resize rounded-full group-hover:bg-inverted/10"
      @mousedown.stop="onMouseDownLeft"
    />
    <div
      :class="cursorStyle"
      class="group h-full rounded-md border-2 border-primary bg-primary/10 select-none"
      @mousedown="onMouseDownBar"
    ></div>
    <!-- Right resize handle -->
    <div
      class="absolute top-0 -right-1 bottom-0 z-20 w-4 cursor-ew-resize rounded-full group-hover:bg-inverted/10"
      @mousedown.stop="onMouseDownRight"
    />
  </div>
</template>
