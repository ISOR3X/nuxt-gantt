<script lang="ts">
import { AppConfig, computed } from "vue";
import theme from "../../../theme/grid-pattern";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";

type GridBackground = ComponentConfig<typeof theme, AppConfig, "gridBackground">;

export interface ChartProps {
  class?: any;
  ui?: GridBackground["slots"];
}
</script>

<script lang="ts" setup>
import { useGanttContext } from "../../composables/useGanttContext";

const props = defineProps<ChartProps>();

const appConfig = useAppConfig() as GridBackground["AppConfig"];

const { cellSize } = useGanttContext();

const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.gridBackground })({}));
</script>

<template>
  <defs>
    <pattern
      id="grid-pattern"
      :height="cellSize.height"
      :width="cellSize.width"
      patternUnits="userSpaceOnUse"
    >
      <rect
        :height="cellSize.height"
        :width="cellSize.width"
        :class="ui.backgroundRect({ class: props.ui?.backgroundRect })"
      />
      <path
        :d="`M ${cellSize.width} 0 L ${cellSize.width} ${cellSize.height}`"
        :class="ui.verticalLines({ class: props.ui?.verticalLines })"
      />
      <path
        :d="`M 0 ${cellSize.height} L ${cellSize.width} ${cellSize.height}`"
        :class="ui.horizontalLines({ class: props.ui?.horizontalLines })"
      />
    </pattern>
  </defs>
  <rect fill="url(#grid-pattern)" height="100%" width="100%" />
</template>
