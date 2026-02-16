<script lang="ts">
import { Temporal } from "temporal-polyfill";
import { AppConfig, computed, ref, toRef, useTemplateRef } from "vue";
import theme from "../../../theme/chart";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";
import { Event, EventWithGanttMeta, Task } from "../../types/gantt";
import { provideGanttContext } from "../../composables/useGanttContext";
import { useGanttGrid } from "../../composables/useGanttGrid";
import { TaskWithGanttMeta } from "../../types/gantt";
import { useColDateConversion } from "../../composables/useColDateConversion";
import { buildArrowPath, computeArrowBBox, getAnchors, isArrowVisible } from "../../utils/arrows";
import { Weekday } from "../../types/temporal";

import EventMarker, { EventMarkerUiSlots } from "./EventMarker.vue";
import { ALL_WEEKDAYS } from "../../utils/temporal";
import { createTaskModal } from "../../composables/useGanttModal";

type Chart = ComponentConfig<typeof theme, AppConfig, "chart">;
export type ChartUiSlots = Chart["slots"] & {
  colItem?: ColItemUiSlots;
  rowItem?: RowItemUiSlots;
  dependencyArrow?: DependencyArrowUiSlots;
  gridPattern?: GridPatternUiSlots;
  offDayPattern?: OffDayPatternUiSlots;
  taskBar?: TaskBarUiSlots;
  event?: {
    marker?: EventMarkerUiSlots;
    body?: EventBodyUiSlots;
  };
};

export interface ChartProps {
  dateRange?: { start?: Temporal.PlainDate; end?: Temporal.PlainDate };
  readOnly?: boolean;
  header?: {
    firstRowHeight?: number;
    firstColWidth?: number;
  };
  virtual?: {
    overscan?: number;
  };
  calendarOptions?: {
    workDays?: Weekday[];
  };
  cellSize?: { width?: number; height?: number };
  class?: any;
  ui?: ChartUiSlots;
}

export interface ChartSlots {
  corner(props: { ui: Chart["ui"] }): any;
  rowItem(props: { ui: Chart["ui"]; item: TaskWithGanttMeta }): any;
  taskBar(props: { ui: Chart["ui"]; item: TaskWithGanttMeta }): any;
}
</script>

<script setup lang="ts">
import { defu } from "defu";
import RowItem, { RowItemUiSlots } from "./RowItem.vue";
import GridPattern, { GridPatternUiSlots } from "./GridPattern.vue";
import ColItem, { ColItemUiSlots } from "./ColItem.vue";
import TaskBar, { TaskBarUiSlots } from "./TaskBar.vue";
import OffDayPattern, { OffDayPatternUiSlots } from "./OffDayPattern.vue";
import EventBody, { EventBodyUiSlots } from "./EventBody.vue";
import DependencyArrow, { Arrow, DependencyArrowUiSlots } from "./DependencyArrow.vue";

const props = withDefaults(defineProps<ChartProps>(), { readOnly: false });
const slots = defineSlots<ChartSlots>();

// Using defu makes for easy merging if only partial values are passed in the props.
const headerProps = toRef(() => defu(props.header, { firstRowHeight: 48, firstColWidth: 240 }));
const cellSizeProps = toRef(() => defu(props.cellSize, { width: 24, height: 32 }));
const virtualProps = toRef(() => defu(props.virtual, { overscan: 5 }));
const calendarOptionsProps = toRef(() =>
  defu(props.calendarOptions, { workDays: [1, 2, 3, 4, 5] }),
);
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

const appConfig = useAppConfig() as Chart["AppConfig"];

const { dateToCol, colToDate } = useColDateConversion();

const el = useTemplateRef("chart");

const tasks = defineModel<Task[]>("tasks");
const events = defineModel<Event[]>("events");

const hoveredObjectId = ref<string | null>(null);

const taskMap = computed(() => {
  const map: Map<string, TaskWithGanttMeta> = new Map();
  if (tasks.value) {
    for (const [idx, t] of tasks.value.entries()) {
      map.set(t.id, {
        ...t,
        index: idx,
        col: dateToCol(dateRange.value.start, t.startDate, t.id),
        colSpan: dateToCol(t.startDate, t.endDate ?? t.startDate, t.id) + 1,
      });
    }
  }
  return map;
});

// TODO: deduplicate. This is near 1:1 copy of taskMap.
const eventMap = computed(() => {
  const map: Map<string, EventWithGanttMeta> = new Map();
  if (events.value) {
    for (const [idx, t] of events.value.entries()) {
      map.set(t.id, {
        ...t,
        index: idx,
        col: dateToCol(dateRange.value.start, t.startDate, t.id),
        colSpan: dateToCol(t.startDate, t.endDate ?? t.startDate, t.id) + 1,
      });
    }
  }
  return map;
});

const gridSize = computed(() => {
  const daysSpan = dateRange.value.start.until(dateRange.value.end).days;
  return {
    height: cellSizeProps.value.height * (tasks.value?.length ?? 3),
    width: cellSizeProps.value.width * daysSpan,
  };
});

const offDays = computed<Weekday[]>(() =>
  ALL_WEEKDAYS.filter((d) => !calendarOptionsProps.value.workDays.includes(d)),
);

const { hoveredCell, colsOnScreen, rowsOnScreen, viewport } = useGanttGrid(el, {
  cellSize: cellSizeProps.value,
  offset: { x: headerProps.value.firstColWidth, y: headerProps.value.firstRowHeight },
});

// #region virtualization
const visibleRowItems = computed(() => {
  const result: (TaskWithGanttMeta & { topOffset: number })[] = [];

  if (tasks.value) {
    for (const [idx, t] of tasks.value.entries()) {
      if (
        idx < rowsOnScreen.value.min - virtualProps.value.overscan ||
        idx > rowsOnScreen.value.max + virtualProps.value.overscan
      )
        continue;

      const task = taskMap.value.get(t.id);
      if (!task) continue;
      result.push({ ...task, topOffset: idx * cellSizeProps.value.height });
    }
  }
  return result;
});

const visibleColItems = computed(() => {
  const result: { date: Temporal.PlainDate; index: number; leftOffset: number }[] = [];
  const maxCol = dateToCol(dateRange.value.start, dateRange.value.end, "");

  for (
    let i = Math.min(0, colsOnScreen.value.min - virtualProps.value.overscan);
    i < Math.min(maxCol, colsOnScreen.value.max + virtualProps.value.overscan);
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

const visibleTasks = computed(() => {
  const result: (TaskWithGanttMeta & {
    topOffset: number;
    leftOffset: number;
    width: number;
  })[] = [];

  for (const i of visibleRowItems.value) {
    const taskColEnd = i.col + i.colSpan;
    if (i.col > colsOnScreen.value.max || taskColEnd < colsOnScreen.value.min) continue;

    result.push({
      ...i,
      leftOffset: i.col * cellSizeProps.value.width,
      width: i.colSpan * cellSizeProps.value.width,
    });
  }
  return result;
});

const visibleArrows = computed(() => {
  const result: (Arrow & { id: string })[] = [];

  for (const fromTask of taskMap.value.values()) {
    if (!fromTask.dependencies || fromTask.dependencies.length === 0) continue;

    for (const dep of fromTask.dependencies) {
      const toTask = taskMap.value.get(dep.taskId);
      if (!toTask) continue; // Target task doesn't exist

      const { source, target } = getAnchors(
        fromTask.col,
        fromTask.colSpan,
        fromTask.index,
        toTask.col,
        toTask.colSpan,
        toTask.index,
        dep.type,
        cellSizeProps.value,
      );

      const bbox = computeArrowBBox(source, target);

      // Skip arrows entirely outside the viewport
      if (!isArrowVisible(bbox, viewport.value)) continue;

      const path = buildArrowPath(source, target, dep.type);

      result.push({
        id: fromTask.id + toTask.id,
        fromId: fromTask.id,
        toId: dep.taskId,
        type: dep.type,
        path,
      });
    }
  }
  return result;
});

// TODO: deduplicate. This is near 1:1 copy of visibleTasks.
const visibleEvents = computed(() => {
  const result: (EventWithGanttMeta & {
    leftOffset: number;
    width: number;
  })[] = [];

  for (const i of eventMap.value.values()) {
    const eventColEnd = i.col + i.colSpan;
    if (i.col > colsOnScreen.value.max || eventColEnd < colsOnScreen.value.min) continue;

    result.push({
      ...i,
      leftOffset: i.col * cellSizeProps.value.width,
      width: i.colSpan * cellSizeProps.value.width,
    });
  }
  // Make sure deadlines are drawn first as they have a smaller interaction area.
  result.sort((a, _) => (a.type === "deadline" ? 1 : -1));
  return result;
});
// #endregion

provideGanttContext({
  cellSize: cellSizeProps,
  dateRange,
  hoveredObjectId,
  readOnly: toRef(() => props.readOnly),
});

const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.chart })({}));

const { open } = createTaskModal(taskMap);
async function handleSettingsClick(id: string) {
  const task = taskMap.value.get(id);
  if (!task) return;

  // const { open } = useGanttModal(task);
  const result = await open(task);

  if (tasks.value) {
    if ((result.mode != null || result.mode == "copy") && result.task) {
      tasks.value[task.index] = result.task;
    } else if (result.mode == "delete" && !result.task) {
      tasks.value.splice(task.index, 1);
    }
  }
}

type ScrollToOptions = {
  behavior?: ScrollBehavior;
  alignment?: { vertical?: "start" | "center" | "end"; horizontal?: "start" | "center" | "end" };
};
function scrollToItem<T extends Task>(itemOrId: T | string, options?: ScrollToOptions) {
  if (taskMap.value) {
    const _options = defu(options, {
      behavior: "smooth" as ScrollBehavior,
      alignment: { vertical: "start", horizontal: "start" },
    });
    const itemId = typeof itemOrId === "string" ? itemOrId : itemOrId.id;
    const _item = taskMap.value.get(itemId);
    if (_item !== undefined) {
      const vOffset =
        _options.alignment.vertical == "start"
          ? 0
          : _options.alignment.vertical == "center"
            ? 0.5
            : 1;
      const hOffset =
        _options.alignment.horizontal == "start"
          ? 0
          : _options.alignment.horizontal == "center"
            ? 0.5
            : 1;
      const left =
        dateToCol(dateRange.value.start, _item.startDate, _item.id) * cellSizeProps.value.width -
        (viewport.value.width.value - headerProps.value.firstColWidth) * hOffset;
      const top =
        _item.index * cellSizeProps.value.height -
        (viewport.value.height.value - headerProps.value.firstRowHeight) * vOffset;
      el.value?.scrollTo({
        behavior: _options.behavior,
        left,
        top,
      });
    }
  }
}

defineExpose({
  scrollToItem,
});
</script>

<template>
  <div
    ref="chart"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
    :style="{
      gridTemplateColumns: `${headerProps.firstColWidth}px ${gridSize.width}px`,
      gridTemplateRows: `${headerProps.firstRowHeight}px ${gridSize.height}px`,
    }"
  >
    <div :class="ui.corner({ class: props.ui?.corner })">
      <slot name="corner" :ui="ui" />
    </div>
    <div :class="ui.firstRow({ class: props.ui?.firstRow })">
      <!-- Dates -->
      <ColItem
        v-for="t in visibleColItems"
        :key="t.index"
        v-slot="{ item }"
        :style="{ width: `${cellSizeProps.width}px`, left: `${t.leftOffset}px` }"
        :item="t"
        :ui="props.ui?.colItem"
      >
        <UBadge
          v-if="t.index == hoveredCell?.col"
          class="z-10 -translate-x-1/2"
          variant="outline"
          color="neutral"
        >
          {{ item.date }}
        </UBadge>
      </ColItem>
      <!-- Events -->
      <EventMarker
        v-for="e in visibleEvents"
        v-if="visibleEvents"
        :style="{
          left: `${e.leftOffset}px`,
          width: `${e.width}px`,
        }"
        :item="e"
        :ui="props.ui?.event?.marker"
      >
        <Transition
          enter-active-class="transition-opacity duration-200"
          leave-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
          enter-to-class="opacity-100"
          leave-from-class="opacity-100"
        >
          <UBadge v-if="e.id == hoveredObjectId" color="neutral" variant="outline">{{
            e.label
          }}</UBadge>
        </Transition>
      </EventMarker>
    </div>
    <div :class="ui.firstCol({ class: props.ui?.firstCol })">
      <RowItem
        v-for="t in visibleRowItems"
        v-if="tasks"
        :key="t.index"
        v-model="tasks[t.index]"
        :style="{ height: `${cellSizeProps.height}px`, top: `${t.topOffset}px` }"
        :highlight="hoveredCell?.row == t.index"
        :ui="props.ui?.rowItem"
        @settings-click="handleSettingsClick"
      >
        <slot name="rowItem" :ui="ui" :item="t" />
      </RowItem>
    </div>
    <div :class="ui.gridContainer({ class: props.ui?.gridContainer })">
      <svg :class="ui.svgLayer({ class: props.ui?.svgLayer })">
        <GridPattern :ui="props.ui?.gridPattern" />
        <OffDayPattern :off-days="offDays" :ui="props.ui?.offDayPattern" />
        <!-- Arrows -->
        <DependencyArrow
          v-for="a in visibleArrows"
          v-if="visibleArrows"
          :key="a.id"
          :item="a"
          :ui="props.ui?.dependencyArrow"
        />
        <!-- Events -->
        <EventBody
          v-for="e in visibleEvents"
          v-if="events"
          :transform="`translate(${e.leftOffset}, 0)`"
          :width="e.width"
          v-model="events[e.index]"
          :ui="props.ui?.event?.body"
        />
      </svg>
      <!-- Tasks -->
      <TaskBar
        v-for="t in visibleTasks"
        v-if="tasks"
        :key="t.index"
        v-model="tasks[t.index]"
        :milestone="t.type && t.type == 'milestone'"
        :ui="props.ui?.taskBar"
        :style="{
          height: `${cellSizeProps.height}px`,
          width: `${t.width}px`,
          top: `${t.topOffset}px`,
          left: `${t.leftOffset}px`,
        }"
      >
        <slot name="taskBar" :ui="ui" :item="t" />
      </TaskBar>
    </div>
  </div>
</template>
