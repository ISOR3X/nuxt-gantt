<script lang="ts">
import { AppConfig, computed } from "vue";
import theme from "#build/ui/off-day-pattern";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";
import { Weekday } from "../../types/temporal";

type OffDayPattern = ComponentConfig<typeof theme, AppConfig, "offDayPattern">;
export type OffDayPatternUiSlots = OffDayPattern["slots"];

export interface OffDayPatternProps {
  offDays: Weekday[];
  class?: any;
  ui?: OffDayPatternUiSlots;
}
</script>

<script lang="ts" setup>
import { useGanttContext } from "../../composables/useGanttContext";

const props = defineProps<OffDayPatternProps>();

const appConfig = useAppConfig() as OffDayPattern["AppConfig"];

const { cellSize, dateRange } = useGanttContext();

const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.offDayPattern })({}));
</script>

<template>
  <defs>
    <pattern
      id="off-days-pattern"
      :x="-(dateRange.start.dayOfWeek - 1) * cellSize.width"
      :height="cellSize.height"
      :width="7 * cellSize.width"
      patternUnits="userSpaceOnUse"
    >
      <rect
        v-for="day in offDays"
        :key="day"
        :x="(day - 1) * cellSize.width"
        y="0"
        :width="cellSize.width"
        :height="cellSize.height"
        :class="ui.root({ class: [props.ui?.root, props.class] })"
      />
    </pattern>
  </defs>
  <rect fill="url(#off-days-pattern)" height="100%" width="100%" />
</template>
