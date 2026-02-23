<script lang="ts">
import { AppConfig, computed } from "vue";
import theme from "#build/ui/event-marker";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";
import { Event } from "../../types/gantt";
import { Temporal } from "temporal-polyfill";
import { useGanttContext } from "../../composables/useGanttContext";
import { useDateDragging } from "../../composables/useDateDrag";

type EventBody = ComponentConfig<typeof theme, AppConfig, "event">;
export type EventBodyUiSlots = EventBody["slots"];

export interface EventBodyProps {
  class?: any;
  width?: number;
  ui?: EventBodyUiSlots;
}

export interface EventBodyEmits {
  activate: [id: string];
}
</script>

<script lang="ts" setup generic="T extends Event">
const props = defineProps<EventBodyProps>();
const emits = defineEmits<EventBodyEmits>();

const appConfig = useAppConfig() as EventBody["AppConfig"];

const item = defineModel<T>();
const { hoveredObjectId, readOnly, cellSize } = useGanttContext();

function onDragEnd(movedX: number, elapsedMs: number) {
  if (movedX <= 5 && elapsedMs < 200 && item.value && item.value.type != "deadline") {
    emits("activate", item.value.id);
  }
}

const { onMouseDownBar, onMouseDownLeft, onMouseDownRight, cursorStyle } = useDateDragging(item, {
  cellSize,
  readOnly,
  onDragEnd,
});

const isDeadline = computed(() => {
  if (item.value) {
    return (
      (item.value.endDate == null ||
        Temporal.PlainDate.compare(item.value.startDate, item.value.endDate) == 0) &&
      item.value.type == "deadline"
    );
  }
});

const ui = computed(() =>
  tv({ extend: tv(theme), ...appConfig.ui?.event })({
    color: item.value?.color as EventBody["variants"]["color"],
    deadline: isDeadline.value,
    readOnly: readOnly?.value,
  }),
);
</script>

<template>
  <g
    v-if="item"
    :class="ui.bodyRoot({ class: [props.ui?.bodyRoot, props.class, cursorStyle] })"
    @mouseenter="hoveredObjectId = item.id"
    @mouseleave="hoveredObjectId = null"
  >
    <g v-if="isDeadline">
      <line y1="0" y2="100%" :class="ui.bodyContent({ class: props.ui?.bodyContent })" />
      <line
        y1="0"
        y2="100%"
        :class="ui.bodyBackground({ class: props.ui?.bodyBackground })"
        @mousedown.stop="onMouseDownBar"
      />
    </g>
    <g v-else-if="props.width">
      <rect
        :width="props.width"
        x="0"
        y="0"
        :class="ui.bodyContent({ class: [props.ui?.bodyContent, cursorStyle] })"
        @mousedown.stop="onMouseDownBar"
      />
      <rect
        x="-10"
        y="0"
        :class="ui.bodyBackground({ class: props.ui?.bodyBackground })"
        @mousedown.stop="onMouseDownLeft"
      />
      <rect
        :x="props.width - 10"
        y="0"
        :class="ui.bodyBackground({ class: props.ui?.bodyBackground })"
        @mousedown.stop="onMouseDownRight"
      />
    </g>
  </g>
</template>

<style scoped>
.cursor-ew-resize * {
  pointer-events: none !important;
}
</style>
