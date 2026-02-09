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

// ---------------------------------------------------------------------------
// Week-option derived state
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Scroll & viewport (via VueUse)
// ---------------------------------------------------------------------------

const HEADERHEIGHT = 40;
const HEADERWIDTH = 240;
const OVERSCAN = 5;

const scrollContainerRef = ref<HTMLElement | null>(null);
const { x: scrollLeft, y: scrollTop } = useScroll(scrollContainerRef);
const { width: viewportWidth, height: viewportHeight } = useElementSize(scrollContainerRef);

// ---------------------------------------------------------------------------
// Grid layout & virtualized items
// ---------------------------------------------------------------------------

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
  viewportWidth,
  viewportHeight,
  overscan: OVERSCAN,
});

// ---------------------------------------------------------------------------
// Provide shared context to sub-components
// ---------------------------------------------------------------------------

provideGanttContext({
  cellSize,
  totalWidth,
  totalHeight,
  scrollLeft,
  scrollTop,
});

// ---------------------------------------------------------------------------
// Mouse tracking
// ---------------------------------------------------------------------------

const { hoveredCell, handleMouseMove, handleMouseLeave } = useGanttMouse(
  scrollContainerRef,
  scrollLeft,
  scrollTop,
  cellSize,
);

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

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
    targetScrollLeft -= (viewportWidth.value - cellSize.x) / 2;
  } else if (alignment === "end") {
    targetScrollLeft -= viewportWidth.value - cellSize.x;
  }

  targetScrollLeft = Math.max(
    0,
    Math.min(targetScrollLeft, totalWidth.value - viewportWidth.value),
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
    class="grid min-h-0 rounded-md border border-muted"
    :style="{
      gridTemplateColumns: `${HEADERWIDTH}px 1fr`,
      gridTemplateRows: `${HEADERHEIGHT}px 1fr`,
    }"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <!-- Header corner -->
    <div
      class="col-start-1 row-start-1 flex items-center justify-between border-r border-b border-muted px-1"
    >
      <slot name="header" />
    </div>

    <!-- Column headers -->
    <GanttColumnHeader
      :visible-columns="visibleColumns"
      :visible-deadlines="visibleDeadlines"
      :hovered-col="hoveredCell?.col"
    />

    <!-- Row labels (left sidebar) -->
    <GanttRowLabels
      v-model:tasks="tasks"
      :visible-rows="visibleRows"
      :hovered-row="hoveredCell?.row"
      @settings-click="({ taskId }) => handleClick(taskId)"
    />

    <!-- Main scrollable grid area -->
    <div
      v-if="tasks"
      ref="scrollContainerRef"
      class="relative col-start-2 row-start-2 flex-1 overflow-auto"
    >
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
