<script lang="ts">
import { AppConfig, computed, ref } from "vue";
import theme from "../../../theme/task-bar";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";
import { Task } from "../../types/gantt";
import { Temporal } from "temporal-polyfill";
import { useGanttContext } from "../../composables/useGanttContext";

type TaskBar = ComponentConfig<typeof theme, AppConfig, "taskBar">;
export type TaskBarUiSlots = TaskBar["slots"];

export interface ChartProps {
  milestone?: boolean;
  class?: any;
  ui?: TaskBarUiSlots;
}

export interface TaskBarSlots {
  default(props: { ui: TaskBar["ui"] }): any;
}
</script>

<script setup lang="ts" generic="T extends Task">
const props = defineProps<ChartProps>();
const slots = defineSlots<TaskBarSlots>();

const appConfig = useAppConfig() as TaskBar["AppConfig"];

const item = defineModel<T>();
const { cellSize, readOnly } = useGanttContext();

type DragMode = "none" | "dragging" | "resizing-left" | "resizing-right";

const dragMode = ref<DragMode>("none");
const isDragging = computed(() => dragMode.value === "dragging");
const isResizingLeft = computed(() => dragMode.value === "resizing-left");
const isResizingRight = computed(() => dragMode.value === "resizing-right");
const dragStartX = ref(0);

const originalStartDate = ref<Temporal.PlainDate | undefined>(undefined);
const originalEndDate = ref<Temporal.PlainDate | undefined>(undefined);

const cursorStyle = computed(() => {
  if (readOnly?.value) return "";
  if (isDragging.value) return "cursor-grabbing";
  if (isResizingLeft.value || isResizingRight.value) return "cursor-ew-resize";
  return "cursor-grab";
});

function startDrag(e: MouseEvent, mode: DragMode) {
  e.stopPropagation();
  dragMode.value = mode;
  dragStartX.value = e.clientX;

  if (item.value) {
    originalStartDate.value = item.value.startDate;
    originalEndDate.value = item.value.endDate;
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
  if (!originalStartDate.value || !item.value || readOnly?.value) return;

  const deltaX = e.clientX - dragStartX.value;
  const daysMoved = Math.round(deltaX / cellSize.value.width);

  let newStartDate = originalStartDate.value;
  let newEndDate = originalEndDate.value;
  const pseudoEndDate = originalEndDate.value ?? originalStartDate.value;

  if (isDragging.value) {
    newStartDate = originalStartDate.value.add({ days: daysMoved });
    if (originalEndDate.value) newEndDate = originalEndDate.value.add({ days: daysMoved });
  } else if (isResizingLeft.value) {
    newStartDate = originalStartDate.value.add({ days: daysMoved });
    if (newEndDate == undefined) {
      newEndDate = originalStartDate.value;
    }
    if (Temporal.PlainDate.compare(newStartDate, pseudoEndDate) > 0) {
      return; // Don't update if invalid
    }
  } else if (isResizingRight.value) {
    newEndDate = pseudoEndDate.add({ days: daysMoved });
    if (Temporal.PlainDate.compare(newEndDate, originalStartDate.value) < 0) {
      return; // Don't update if invalid
    }
  }

  item.value.startDate = newStartDate;
  // if ((Temporal.PlainDate.compare(newEndDate, originalStartDate.value) <= 0))
  item.value.endDate = newEndDate;
}

function onMouseUp() {
  dragMode.value = "none";
  originalStartDate.value = undefined;
  originalEndDate.value = undefined;

  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
}

const ui = computed(() =>
  tv({ extend: tv(theme), ...appConfig.ui?.taskBar })({
    milestone: props.milestone,
    readOnly: readOnly?.value,
  }),
);
</script>

<template>
  <div :class="ui.root({ class: props.ui?.root })">
    <div
      v-if="!props.milestone"
      :class="ui.leftHandle({ class: props.ui?.leftHandle })"
      @mousedown.stop="onMouseDownLeft"
    />
    <div
      :class="ui.base({ class: [props.ui?.base, props.class, cursorStyle] })"
      :title="item?.label"
      @mousedown="onMouseDownBar"
    >
      <slot :ui="ui" />
      <div
        v-if="item && item.progress"
        :class="ui.progress({ class: props.ui?.progress })"
        :style="{ width: `${item.progress * 100}%` }"
      />
    </div>
    <div
      v-if="!props.milestone"
      :class="ui.rightHandle({ class: props.ui?.rightHandle })"
      @mousedown.stop="onMouseDownRight"
    />
  </div>
</template>
