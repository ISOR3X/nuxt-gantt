<script lang="ts">
import { AppConfig, computed } from "vue";
import theme from "../../../theme/col-item";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";
import { Temporal } from "temporal-polyfill";

type HasDate = { date: Temporal.PlainDate };
type ColItem = ComponentConfig<typeof theme, AppConfig, "colItem">;

export interface ChartProps<T extends HasDate> {
  item: T;
  class?: any;
  ui?: ColItem["slots"];
}

export interface ColItemSlots<T extends HasDate> {
  default(props: { ui: ColItem["ui"]; item: T }): any;
}
</script>

<script setup lang="ts" generic="T extends HasDate">
const props = withDefaults(defineProps<ChartProps<T>>(), {});
const slots = defineSlots<ColItemSlots<T>>();

const appConfig = useAppConfig() as ColItem["AppConfig"];

const ui = computed(() =>
  tv({ extend: tv(theme), ...appConfig.ui?.colItem })({
    // ...
  }),
);
</script>

<template>
  <div :class="ui.root({ class: [props.ui?.root, props.class] })">
    <slot :ui="ui" :item="props.item" />
  </div>
</template>
