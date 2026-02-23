<script lang="ts">
import { AppConfig, computed } from "vue";
import theme from "#build/ui/row-item";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";
import { Task } from "../../types/gantt";
import { useGanttContext } from "../../composables/useGanttContext";

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

const { readOnly } = useGanttContext();

const emit = defineEmits<{
  settingsClick: [id: string];
}>();

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
        :title="item.label"
        :disabled="readOnly"
        variant="ghost"
        :ui="{
          base: ui.inputBase({ class: props.ui?.inputBase }),
          root: ui.inputRoot({ class: props.ui?.inputRoot }),
        }"
      />
      <UButton
        v-if="!readOnly"
        icon="i-lucide-settings-2"
        variant="ghost"
        color="neutral"
        :class="ui.button({ class: props.ui?.button })"
        @click="emit('settingsClick', item.id)"
      />
    </slot>
  </div>
</template>
