<script lang="ts">
import { AppConfig, computed } from "vue";
import theme from "../../../theme/task-bar";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";
import { Task } from "../../types/gantt";

type TaskBar = ComponentConfig<typeof theme, AppConfig, "taskBar">;

export interface ChartProps {
  milestone?: boolean;
  class?: any;
  ui?: TaskBar["slots"];
}

export interface TaskBarSlots {
  default(props: { ui: TaskBar["ui"] }): any;
}
</script>

<script setup lang="ts" generic="T extends Task">
const props = withDefaults(defineProps<ChartProps>(), {});
const slots = defineSlots<TaskBarSlots>();

const appConfig = useAppConfig() as TaskBar["AppConfig"];

// const item = defineModel<T>({ required: true });

const ui = computed(() =>
  tv({ extend: tv(theme), ...appConfig.ui?.taskBar })({
    milestone: props.milestone,
  }),
);
</script>

<template>
  <div :class="ui.root({ class: props.ui?.root })">
    <div :class="ui.base({ class: [props.ui?.base, props.class] })">hi</div>
    <slot :ui="ui"> </slot>
  </div>
</template>
