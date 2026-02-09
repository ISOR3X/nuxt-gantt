<script lang="ts">
import { Temporal } from "temporal-polyfill";
import { weekDaysInRange } from "../utils/temporal.ts";
import { Deadline, Task, Vec2, Weekday } from "../types";
import { useGanttModal } from "../composables/gantt.ts";

type CellHighlight = { row: boolean; col: boolean };

interface WeekOptions {
  workDays: Weekday[];
  hideDaysOff: boolean;
}

export interface GanttChartProps {
  cellSize?: Vec2;
  cellHighlight?: CellHighlight;
  startDate?: Temporal.PlainDate;
  endDate?: Temporal.PlainDate;
  weekOptions?: WeekOptions;
}
</script>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useScroll, useElementSize } from "@vueuse/core";
import { useGanttGrid } from "../composables/useGanttGrid.ts";
import { useGanttMouse } from "../composables/useGanttMouse.ts";
import { provideGanttContext } from "../composables/gantt.ts";
import GanttColumnHeader from "./GanttColumnHeader.vue";
import GanttRowLabels from "./GanttRowLabels.vue";
import GanttGridBackground from "./GanttGridBackground.vue";
import GanttArrowLayer from "./GanttArrowLayer.vue";
import GanttTaskLayer from "./GanttTaskLayer.vue";

const {
  cellSize = { x: 30, y: 30 },
  cellHighlight = { row: false, col: false },
  startDate = Temporal.Now.plainDateISO().subtract({ months: 1 }),
  endDate = Temporal.Now.plainDateISO().add({ years: 1 }),
  weekOptions = { workDays: weekDaysInRange(1, 5), hideDaysOff: false },
} = defineProps<GanttChartProps>();

const tasks = defineModel<Task[]>("tasks", { required: true });
const deadlines = defineModel<Deadline[]>("deadlines", { required: true });

// #region: week-option derived state
const effectiveWorkDays = computed<Weekday[] | undefined>(() =>
  weekOptions.hideDaysOff ? weekOptions.workDays : undefined,
);

const ALL_WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];
const offDays = computed<Weekday[]>(() =>
  ALL_WEEKDAYS.filter((d) => !weekOptions.workDays.includes(d)),
);

const firstWorkDay = computed<Weekday>(() => {
  const sorted = [...weekOptions.workDays].sort((a, b) => a - b);
  return sorted[0];
});
// #endregion

// #region: scroll & viewport (via VueUse)
const HEADERHEIGHT = 40;
const HEADERWIDTH = 240;
const OVERSCAN = 5;

const scrollContainerRef = ref<HTMLElement | null>(null);
const { x: scrollLeft, y: scrollTop } = useScroll(scrollContainerRef);
const { width: viewportWidth, height: viewportHeight } = useElementSize(scrollContainerRef);

// The content viewport is the visible area minus the sticky header dimensions.
// scrollLeft/scrollTop already map directly to content offsets because the
// content grid cell starts at (HEADERWIDTH, HEADERHEIGHT) in the scrollable
// space — so scrolling by N pixels reveals content pixel N.
const contentViewportWidth = computed(() => Math.max(0, viewportWidth.value - HEADERWIDTH));
const contentViewportHeight = computed(() => Math.max(0, viewportHeight.value - HEADERHEIGHT));
// #endregion

// Grid layout & virtualized items
const {
  taskMap,
  totalColumns,
  totalWidth,
  totalHeight,
  visibleTasks,
  visibleDeadlines,
  visibleColumns,
  visibleRows,
  visibleArrows,
} = useGanttGrid({
  tasks,
  deadlines,
  startDate,
  endDate,
  effectiveWorkDays,
  firstWorkDay,
  cellSize,
  scrollLeft,
  scrollTop,
  viewportWidth: contentViewportWidth,
  viewportHeight: contentViewportHeight,
  overscan: OVERSCAN,
});

// Provide shared context to sub-components
provideGanttContext({
  cellSize,
});

// Mouse tracking
const { hoveredCell, handleMouseMove, handleMouseLeave } = useGanttMouse(
  scrollContainerRef,
  scrollLeft,
  scrollTop,
  cellSize,
  HEADERWIDTH,
  HEADERHEIGHT,
);

function scrollTo(
  idx: number,
  options?: {
    behavior?: ScrollBehavior;
    alignment?: "start" | "center" | "end";
  },
) {
  if (!scrollContainerRef.value) return;
  if (idx > totalColumns.value) {
    throw Error("scrollTo index larger than visible range.");
  }

  const { behavior = "auto", alignment = "start" } = options || {};

  let targetScrollLeft = idx * cellSize.x;

  if (alignment === "center") {
    targetScrollLeft -= (contentViewportWidth.value - cellSize.x) / 2;
  } else if (alignment === "end") {
    targetScrollLeft -= contentViewportWidth.value - cellSize.x;
  }

  targetScrollLeft = Math.max(
    0,
    Math.min(targetScrollLeft, totalWidth.value - contentViewportWidth.value),
  );

  scrollContainerRef.value.scrollTo({
    left: targetScrollLeft,
    behavior,
  });
}

function updateTaskDates(
  taskId: number,
  newStartDate: Temporal.PlainDate,
  newEndDate: Temporal.PlainDate,
) {
  const task = taskMap.value.get(taskId);
  if (task) {
    task.startDate = newStartDate;
    task.endDate = newEndDate;
  }
}

async function handleClick(id: number) {
  const task = taskMap.value.get(id);
  if (!task) return;

  const { openModal } = useGanttModal(task);
  const updatedTask = await openModal();

  if (updatedTask != null) {
    const idx = tasks.value.findIndex((t) => t.id === id);
    if (idx !== -1) tasks.value[idx] = updatedTask;
  }
}

defineExpose({ scrollTo });
</script>

<template>
  <div
    class="relative isolate grid h-full overflow-y-scroll"
    ref="scrollContainerRef"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    :style="{
      gridTemplateColumns: `${HEADERWIDTH}px ${totalWidth}px`,
      gridTemplateRows: `${HEADERHEIGHT}px ${totalHeight}px`,
    }"
  >
    <div
      class="sticky-left sticky-top z-20 flex items-center justify-between border-r border-b border-muted bg-default px-1"
    >
      <slot name="header" />
    </div>
    <GanttColumnHeader
      class="sticky-top z-10"
      :visible-columns="visibleColumns"
      :visible-deadlines="visibleDeadlines"
      :hovered-col="hoveredCell?.col"
    />
    <GanttRowLabels
      class="sticky-left z-10"
      v-model:tasks="tasks"
      :visible-rows="visibleRows"
      :hovered-row="hoveredCell?.row"
      @settings-click="({ taskId }) => handleClick(taskId)"
    />
    <div class="relative isolate">
      <GanttGridBackground
        :start-date="startDate"
        :off-days="offDays"
        :hide-days-off="weekOptions.hideDaysOff"
        :visible-deadlines="visibleDeadlines"
      />
      <GanttArrowLayer :visible-arrows="visibleArrows" />
      <GanttTaskLayer
        :visible-tasks="visibleTasks"
        :hovered-cell="hoveredCell"
        :cell-highlight="cellHighlight"
        @update-dates="(taskId, startDate, endDate) => updateTaskDates(taskId, startDate, endDate)"
        @task-click="(taskId) => handleClick(taskId)"
      />
    </div>
  </div>
</template>

<style>
.sticky-top {
  position: sticky;
  top: 0;
}

.sticky-left {
  position: sticky;
  left: 0;
}
</style>
