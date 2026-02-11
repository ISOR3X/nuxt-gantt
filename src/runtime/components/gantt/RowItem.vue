<script lang="ts">
import { AppConfig, computed } from "vue";
import theme from "../../../theme/row-item";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";
import { Task } from "../../types/gantt";

type RowItem = ComponentConfig<typeof theme, AppConfig, "rowItem">;

export interface ChartProps<T extends Task> {
  item: T;
  class?: any;
  ui?: RowItem["slots"];
}

export interface RowItemSlots<T extends Task> {
  default(props: { ui: RowItem["ui"]; item: T }): any;
}
</script>

<script setup lang="ts" generic="T extends Task">
const props = withDefaults(defineProps<ChartProps<T>>(), {});
const slots = defineSlots<RowItemSlots<T>>();

const appConfig = useAppConfig() as RowItem["AppConfig"];

const ui = computed(() =>
  tv({ extend: tv(theme), ...appConfig.ui?.rowItem })({
    // ...
  }),
);
</script>

<template>
  <div :class="ui.root({ class: [props.ui?.root, props.class] })">
    <slot :ui="ui" :item="props.item" />
  </div>
</template>
