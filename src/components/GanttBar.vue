<script lang="ts" setup>
import { computed, ref, StyleValue, useAttrs } from "vue";
import { Task } from "../utils/types.ts";
import { Temporal } from "temporal-polyfill";


const { task, pixelsWidth = 120 } = defineProps<{
  task: Task;
  pixelsWidth?: number;
  chartStartDate?: Temporal.PlainDate;
}>();

const attrs = useAttrs();
const emit = defineEmits<{
  updateDates: [{ startDate: Temporal.PlainDate; endDate: Temporal.PlainDate }];
}>();

type DragMode = "none" | "dragging" | "resizing-left" | "resizing-right";

const dragMode = ref<DragMode>("none");
const isDragging = computed(() => dragMode.value === "dragging");
const isResizingLeft = computed(() => dragMode.value === "resizing-left");
const isResizingRight = computed(() => dragMode.value === "resizing-right");
const dragStartX = ref(0);

const originalStartDate = ref<Temporal.PlainDate | null>(null);
const originalEndDate = ref<Temporal.PlainDate | null>(null);

const cursorStyle = computed(() => {
  if (isDragging.value) return "cursor-grabbing";
  if (isResizingLeft.value || isResizingRight.value) return "cursor-ew-resize";
  return "cursor-grab";
});

function startDrag(e: MouseEvent, mode: DragMode) {
  e.stopPropagation();
  dragMode.value = mode;
  dragStartX.value = e.clientX;

  if (task) {
    originalStartDate.value = task.startDate;
    originalEndDate.value = task.endDate;
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseDownBar(e: MouseEvent) {
  if (dragMode.value !== "none") return;
  startDrag(e, "dragging");
}

function onMouseDownLeft(e: MouseEvent) {
  startDrag(e, "resizing-left");
}

function onMouseDownRight(e: MouseEvent) {
  startDrag(e, "resizing-right");
}

function onMouseMove(e: MouseEvent) {
  if (!originalStartDate.value || !originalEndDate.value) return;

  const deltaX = e.clientX - dragStartX.value;
  const daysMoved = Math.round(deltaX / pixelsWidth);

  let newStartDate = originalStartDate.value;
  let newEndDate = originalEndDate.value;

  if (isDragging.value) {
    newStartDate = originalStartDate.value.add({ days: daysMoved });
    newEndDate = originalEndDate.value.add({ days: daysMoved });
  } else if (isResizingLeft.value) {
    newStartDate = originalStartDate.value.add({ days: daysMoved });
    if (Temporal.PlainDate.compare(newStartDate, originalEndDate.value) >= 0) {
      return; // Don't update if invalid
    }
  } else if (isResizingRight.value) {
    newEndDate = originalEndDate.value.add({ days: daysMoved });
    if (Temporal.PlainDate.compare(newEndDate, originalStartDate.value) <= 0) {
      return; // Don't update if invalid
    }
  }

  // Emit the update instead of mutating
  emit('updateDates', { startDate: newStartDate, endDate: newEndDate });
}

function formatDuration(): string {
  const d = task.startDate.until(task.endDate).days;
  const suffix = d == 1 ? "day" : "days";
  return `${d} ${suffix}`;
}

function onMouseUp() {
  dragMode.value = "none";
  originalStartDate.value = null;
  originalEndDate.value = null;

  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
}
</script>

<template>
  <UPopover :ui="{ content: 'grid grid-cols-2 gap-x-4 text-sm p-2' }" mode="hover">
    <div class="group py-1" :style="attrs.style as StyleValue" :class="attrs.class">
      <!-- Left resize handle. Our hitbox is larger than what is visually shown. -->
      <div
        class="absolute bottom-0 -left-4 z-20 aspect-square h-full -translate-x-1/2 cursor-ew-resize p-2"
        @mousedown.stop="onMouseDownLeft"
      >
        <div class="h-full rounded-full border-accented group-hover:border-2" />
      </div>
      <div
        :class="cursorStyle"
        class="group relative h-full rounded-md border-2 border-primary bg-primary/10 select-none"
        @mousedown="onMouseDownBar"
      >
        <div
          v-if="task.progress"
          class="absolute top-0 bottom-0 left-0 bg-primary"
          :style="{ right: `${100 - task?.progress * 100}%` }"
        />
        <slot />
      </div>
      <!-- Right resize handle -->
      <div
        class="absolute -right-4 bottom-0 z-20 aspect-square h-full translate-x-1/2 cursor-ew-resize p-2"
        @mousedown.stop="onMouseDownRight"
      >
        <div class="h-full rounded-full border-accented group-hover:border-2" />
      </div>
    </div>
    <template #content>
      <b>Label</b>
      <p>{{ task.label }}</p>
      <b>Start date</b>
      <p>{{ task.startDate }}</p>
      <b>End date</b>
      <p>{{ task.endDate }}</p>
      <b>Duration</b>
      <p>{{ formatDuration() }}</p>
      <b>Progress</b>
      <p>{{ (task!.progress * 100).toFixed() }}%</p>
    </template>
  </UPopover>
</template>