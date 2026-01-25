<script setup lang="ts">
import { ref, computed } from "vue";
import { Temporal } from "temporal-polyfill";
import { Task } from "../utils/types";

const model = defineModel<Task>();

const props = defineProps<{
  pixelsWidth?: number;
}>();

const isDragging = ref(false);
const isResizingLeft = ref(false);
const isResizingRight = ref(false);
const dragStartX = ref(0);
const originalStartDate = ref<Temporal.PlainDate | null>(null);
const originalEndDate = ref<Temporal.PlainDate | null>(null);

function onMouseDownBar(e: MouseEvent) {
  if (isResizingLeft.value || isResizingRight.value) return;
  
  e.stopPropagation();
  isDragging.value = true;
  dragStartX.value = e.clientX;
  
  if (model.value) {
    originalStartDate.value = model.value.startDate;
    originalEndDate.value = model.value.endDate;
  }
  
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseDownLeft(e: MouseEvent) {
  e.stopPropagation();
  isResizingLeft.value = true;
  dragStartX.value = e.clientX;
  
  if (model.value) {
    originalStartDate.value = model.value.startDate;
    originalEndDate.value = model.value.endDate;
  }
  
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseDownRight(e: MouseEvent) {
  e.stopPropagation();
  isResizingRight.value = true;
  dragStartX.value = e.clientX;
  
  if (model.value) {
    originalStartDate.value = model.value.startDate;
    originalEndDate.value = model.value.endDate;
  }
  
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(e: MouseEvent) {
  if (!model.value) return;
  if (!originalStartDate.value || !originalEndDate.value) return;
  
  const pixelWidth = props.pixelsWidth || 120;
  const deltaX = e.clientX - dragStartX.value;
  
  // Calculate days moved with snapping
  const daysMoved = Math.round(deltaX / pixelWidth);
  
  if (isDragging.value) {
    // Move entire bar (always update, even when daysMoved is 0)
    model.value.startDate = originalStartDate.value.add({ days: daysMoved });
    model.value.endDate = originalEndDate.value.add({ days: daysMoved });
  } else if (isResizingLeft.value) {
    // Resize left edge (change start date)
    const newStartDate = originalStartDate.value.add({ days: daysMoved });
    // Ensure start date doesn't go past end date
    if (Temporal.PlainDate.compare(newStartDate, originalEndDate.value) <= 0) {
      model.value.startDate = newStartDate;
    }
  } else if (isResizingRight.value) {
    // Resize right edge (change end date)
    const newEndDate = originalEndDate.value.add({ days: daysMoved });
    // Ensure end date doesn't go before start date
    if (Temporal.PlainDate.compare(newEndDate, originalStartDate.value) >= 0) {
      model.value.endDate = newEndDate;
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
  <div 
    class="bg-primary rounded-md select-none"
    :class="cursorStyle"
    @mousedown="onMouseDownBar"
  >
    <!-- Left resize handle -->
    <div
      class="absolute -left-5 top-0 bottom-0 bg-error/50 cursor-ew-resize z-20 w-10"
      @mousedown.stop="onMouseDownLeft"
    />
    
    
    <!-- Right resize handle -->
    <div
      class="absolute -right-5 top-0 bottom-0 bg-error/50 cursor-ew-resize z-20 w-10"
      @mousedown.stop="onMouseDownRight"
    />
  </div>
</template>