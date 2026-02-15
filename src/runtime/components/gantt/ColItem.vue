<script lang="ts">
import { AppConfig, computed } from "vue";
import theme from "../../../theme/col-item";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";
import { Temporal } from "temporal-polyfill";

type HasDate = { date: Temporal.PlainDate };
type ColItem = ComponentConfig<typeof theme, AppConfig, "colItem">;
export type ColItemUiSlots = ColItem["slots"];

export interface ChartProps<T extends HasDate> {
  item: T;
  formatDate?: (date: Temporal.PlainDate) => string | null;
  class?: any;
  ui?: ColItemUiSlots;
}

export interface ColItemSlots<T extends HasDate> {
  default(props: { ui: ColItem["ui"]; item: T }): any;
}

export function formatDate(date: Temporal.PlainDate): string | undefined {
  if (date.dayOfWeek !== 1) return;

  const isFirstFullWeekOfYear = date.day <= 7 && date.month === 1;

  const formatted = date.toLocaleString("en", {
    month: "short",
    day: "numeric",
    ...(isFirstFullWeekOfYear && date.dayOfWeek == 1 ? { year: "numeric" } : {}),
  });

  return formatted;
}
</script>

<script setup lang="ts" generic="T extends HasDate">
const props = defineProps<ChartProps<T>>();
const slots = defineSlots<ColItemSlots<T>>();

const formatDateProp = props.formatDate ?? formatDate;

const appConfig = useAppConfig() as ColItem["AppConfig"];

const dateStr = computed(() => formatDateProp(props.item.date));

const ui = computed(() =>
  tv({ extend: tv(theme), ...appConfig.ui?.colItem })({
    hasDate: dateStr.value != null,
  }),
);
</script>

<template>
  <div :class="ui.root({ class: [props.ui?.root, props.class] })">
    <slot :ui="ui" :item="props.item">
      {{ dateStr }}
    </slot>
  </div>
</template>
