<script lang="ts">
import { Temporal } from "temporal-polyfill";
import { AppConfig, computed, toRef, useTemplateRef } from "vue";
import theme from "../../../theme/chart";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";
import { Task } from "../../types/gantt";
import { provideGanttContext } from "../../composables/useGanttContext";
import { useGanttGrid } from "../../composables/useGanttGrid";

type Chart = ComponentConfig<typeof theme, AppConfig, "chart">;

export interface ChartProps {
  dateRange?: { start?: Temporal.PlainDate; end?: Temporal.PlainDate };
  header?: {
    firstRowHeight?: number;
    firstColWidth?: number;
  };
  virtual?: {
    overscan?: number;
  };
  cellSize?: { width?: number; height?: number };
  class?: any;
  ui?: Chart["slots"];
}
</script>

<script setup lang="ts">
import { defu } from "defu";
import GridBackground from "./GridBackground.vue";

const props = withDefaults(defineProps<ChartProps>(), {});

// const emits = defineEmits<...>()
// const slots = defineSlots<...>()

// Using defu makes for easy merging if only partial values are passed in the props.
const headerProps = toRef(() => defu(props.header, { firstRowHeight: 40, firstColWidth: 240 }));
const cellSizeProps = toRef(() => defu(props.cellSize, { width: 30, height: 30 }));
const virtualProps = toRef(() => defu(props.virtual, { overscan: 10 }));

const appConfig = useAppConfig() as Chart["AppConfig"];

const tasks = defineModel<Task[]>("tasks");

const dateRange = computed(() => {
  if (!tasks.value?.length) {
    const now = Temporal.Now.plainDateISO();
    return { start: now.subtract({ months: 1 }), end: now.add({ months: 1 }) };
  }

  let min = tasks.value[0].startDate;
  let max = tasks.value[0].startDate;

  for (const t of tasks.value) {
    if (Temporal.PlainDate.compare(t.startDate, min) < 0) min = t.startDate;
    if (Temporal.PlainDate.compare(t.startDate, max) > 0) max = t.startDate;
    if (t.endDate) {
      if (Temporal.PlainDate.compare(t.endDate, max) > 0) max = t.endDate;
    }
  }
  return { start: props.dateRange?.start ?? min, end: props.dateRange?.end ?? max };
});

const gridSize = computed(() => {
  const daysSpan = dateRange.value.start.until(dateRange.value.end).days;
  return {
    height: cellSizeProps.value.height * (tasks.value?.length ?? 3),
    width: cellSizeProps.value.width * daysSpan,
  };
});

const el = useTemplateRef("chart");

const { hoveredCell, colsOnScreen, rowsOnScreen } = useGanttGrid(el, {
  cellSize: cellSizeProps.value,
  offset: { x: headerProps.value.firstColWidth, y: headerProps.value.firstRowHeight },
});

provideGanttContext({ cellSize: cellSizeProps });

const ui = computed(() =>
  tv({ extend: tv(theme), ...appConfig.ui?.chart })({
    // ...
  }),
);
</script>

<template>
  <div
    ref="chart"
    data-slot="root"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
    :style="{
      gridTemplateColumns: `${headerProps.firstColWidth}px ${gridSize.width}px`,
      gridTemplateRows: `${headerProps.firstRowHeight}px ${gridSize.height}px`,
    }"
  >
    <div data-slot="corner" :class="ui.corner({ class: props.ui?.corner })"></div>
    <div data-slot="firstRow" :class="ui.firstRow({ class: props.ui?.firstRow })"></div>
    <div data-slot="firstCol" :class="ui.firstCol({ class: props.ui?.firstCol })"></div>
    <div data-slot="gridContainer" :class="ui.gridContainer({ class: props.ui?.gridContainer })">
      <GridBackground />
    </div>
  </div>
  <div class="fixed right-10 bottom-10 bg-black">
    {{ hoveredCell }}
    {{ rowsOnScreen }}
    {{ colsOnScreen }}
  </div>
</template>
