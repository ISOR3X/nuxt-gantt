<script lang="ts">
import { AppConfig, computed } from "vue";
import theme from "../../../theme/task-bar";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";
import { Task } from "../../types/gantt";
import { useGanttContext } from "../../composables/useGanttContext";
import { useDateDragging } from "../../composables/useDateDrag";

type TaskBar = ComponentConfig<typeof theme, AppConfig, "taskBar">;
export type TaskBarUiSlots = TaskBar["slots"];

export interface ChartProps {
  milestone?: boolean;
  color?: TaskBar["variants"]["color"];
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

const { onMouseDownBar, onMouseDownLeft, onMouseDownRight, cursorStyle } = useDateDragging(item, {
  cellSize,
  readOnly,
});

const ui = computed(() =>
  tv({ extend: tv(theme), ...appConfig.ui?.taskBar })({
    color: props.color,
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
