<script lang="ts">
import { Temporal } from "temporal-polyfill";
import { AppConfig, computed, toRef, useTemplateRef } from "vue";
import theme from "../../../theme/chart";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";
import { Task } from "../../types/gantt";
import { provideGanttContext } from "../../composables/useGanttContext";
import { useGanttGrid } from "../../composables/useGanttGrid";
import { useMemoize } from "@vueuse/core";
import { colToDate, dateToCol } from "../../utils/temporal";

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
import RowItem from "./RowItem.vue";
import ColItem from "./ColItem.vue";

const props = withDefaults(defineProps<ChartProps>(), {});

// const emits = defineEmits<...>()
// const slots = defineSlots<...>()

// Using defu makes for easy merging if only partial values are passed in the props.
const headerProps = toRef(() => defu(props.header, { firstRowHeight: 40, firstColWidth: 240 }));
const cellSizeProps = toRef(() => defu(props.cellSize, { width: 30, height: 30 }));
const virtualProps = toRef(() => defu(props.virtual, { overscan: 5 }));

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

const getTaskLayout = useMemoize(
  (
    taskIdx: number,
    taskStartDate: Temporal.PlainDate,
    taskEndDate: Temporal.PlainDate,
    chartStartDate: Temporal.PlainDate,
  ) => {
    return {
      col: dateToCol(chartStartDate, taskStartDate),
      width: dateToCol(taskStartDate, taskEndDate),
      index: taskIdx,
    };
  },
);

const visibleRowItems = computed(() => {
  const result: (Task & { index: number; topOffset: number })[] = [];

  if (tasks.value) {
    for (const [idx, task] of tasks.value.entries()) {
      if (
        idx < rowsOnScreen.value.min - virtualProps.value.overscan ||
        idx > rowsOnScreen.value.max + virtualProps.value.overscan
      )
        continue;

      const layout = getTaskLayout(
        idx,
        task.startDate,
        task.endDate ?? task.startDate,
        dateRange.value.start,
      );

      // const taskColEnd = layout.col + layout.width;
      // if (layout.col > (colsOnScreen.value.max + virtualProps.value.overscan) || taskColEnd < (colsOnScreen.value.min - virtualProps.value.overscan)) continue;
      result.push({ ...task, ...layout, topOffset: idx * cellSizeProps.value.height });
    }
  }
  return result;
});

const visibleColItems = computed(() => {
  const result: { date: Temporal.PlainDate; index: number; leftOffset: number }[] = [];

  for (
    let i = colsOnScreen.value.min - virtualProps.value.overscan;
    i < colsOnScreen.value.max + virtualProps.value.overscan;
    i++
  ) {
    const d = colToDate(dateRange.value.start, i);
    result.push({
      date: d,
      index: i,
      leftOffset: i * cellSizeProps.value.width,
    });
  }

  return result;
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
    <div data-slot="firstRow" :class="ui.firstRow({ class: props.ui?.firstRow })">
      <ColItem
        v-for="t in visibleColItems"
        :key="t.index"
        :style="{ width: `${cellSizeProps.width}px`, left: `${t.leftOffset}px` }"
        :item="t"
        v-slot="{ item }"
      >
        {{ item.index }}
      </ColItem>
    </div>
    <div data-slot="firstCol" :class="ui.firstCol({ class: props.ui?.firstCol })">
      <RowItem
        v-for="t in visibleRowItems"
        :key="t.index"
        :style="{ height: `${cellSizeProps.height}px`, top: `${t.topOffset}px` }"
        :item="t"
        v-slot="{ item }"
      >
        {{ item.index }}
      </RowItem>
    </div>
    <div data-slot="gridContainer" :class="ui.gridContainer({ class: props.ui?.gridContainer })">
      <GridBackground />
    </div>
  </div>
  <div class="fixed right-10 bottom-10 bg-black">
    {{ visibleColItems.map((t) => t.index)[0] }}
    {{ visibleColItems.map((t) => t.index)[visibleColItems.length - 1] }}
    {{ colsOnScreen }}
    {{ hoveredCell }}
  </div>
</template>
