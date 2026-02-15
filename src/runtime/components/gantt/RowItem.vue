<script lang="ts">
import { AppConfig, computed } from "vue";
import theme from "../../../theme/row-item";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";
import { Task } from "../../types/gantt";

type RowItem = ComponentConfig<typeof theme, AppConfig, "rowItem">;
export type RowItemUiSlots = RowItem["slots"];

export interface ChartProps {
  highlight?: boolean;
  class?: any;
  ui?: RowItemUiSlots;
}

export interface RowItemSlots {
  default(props: { ui: RowItem["ui"] }): any;
}
</script>

<script setup lang="ts" generic="T extends Task">
const props = defineProps<ChartProps>();
const slots = defineSlots<RowItemSlots>();

const appConfig = useAppConfig() as RowItem["AppConfig"];

const item = defineModel<T>({ required: true });

const ui = computed(() =>
  tv({ extend: tv(theme), ...appConfig.ui?.rowItem })({
    highlight: props.highlight,
  }),
);
</script>

<template>
  <div :class="ui.root({ class: [props.ui?.root, props.class] })">
    <slot :ui="ui">
      <UInput
        v-model="item.label"
        variant="ghost"
        :ui="{ base: ui.input({ class: props.ui?.input }) }"
      />
    </slot>
  </div>
</template>
