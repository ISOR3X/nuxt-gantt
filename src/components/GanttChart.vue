<script lang="ts">
import { Temporal } from "temporal-polyfill";
import { ALL_WEEKDAYS, weekDaysInRange } from "../utils/temporal.ts";
import { Deadline, Task, Vec2, Weekday } from "../types";
import GanttLabel from "./GanttLabel.vue";
import ULabel from "./ULabel.vue";
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
import GanttBar from "./GanttBar.vue";
import { useGanttGrid } from "../composables/useGanttGrid.ts";
import { useGanttMouse } from "../composables/useGanttMouse.ts";

const {
  cellSize = { x: 30, y: 30 },
  cellHighlight = { row: false, col: false },
  startDate = Temporal.Now.plainDateISO().subtract({ months: 1 }),
  endDate = Temporal.Now.plainDateISO().add({ years: 1 }),
  weekOptions = { workDays: weekDaysInRange(1, 5), hideDaysOff: false },
} = defineProps<GanttChartProps>();

const tasks = defineModel<Task[]>("tasks", { required: true });
const deadlines = defineModel<Deadline[]>("deadlines", { required: true });

// #region: Week-option derived state
const effectiveWorkDays = computed<Weekday[] | undefined>(() =>
  weekOptions.hideDaysOff ? weekOptions.workDays : undefined,
);

const offDays = computed<Weekday[]>(() =>
  ALL_WEEKDAYS.filter((d) => !weekOptions.workDays.includes(d)),
);

const firstWorkDay = computed<Weekday>(() => {
  const sorted = [...weekOptions.workDays].sort((a, b) => a - b);
  return sorted[0];
});
// #endregion

// #region: Scroll & viewport
const HEADERHEIGHT = 40;
const HEADERWIDTH = 240;
const OVERSCAN = 5;

const scrollContainerRef = ref<HTMLElement | null>(null);
const { x: scrollLeft, y: scrollTop } = useScroll(scrollContainerRef);
const { width: viewportWidth, height: viewportHeight } = useElementSize(scrollContainerRef);
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
  viewportWidth,
  viewportHeight,
  overscan: OVERSCAN,
});

// Mouse tracking
const { hoveredCell, handleMouseMove, handleMouseLeave } = useGanttMouse(
  scrollContainerRef,
  scrollLeft,
  scrollTop,
  cellSize,
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

  // Calculate the target scroll position
  let targetScrollLeft = idx * cellSize.x;

  // Adjust for alignment
  if (alignment === "center") {
    targetScrollLeft -= (viewportWidth.value - cellSize.x) / 2;
  } else if (alignment === "end") {
    targetScrollLeft -= viewportWidth.value - cellSize.x;
  }

  // Ensure we don't scroll beyond bounds
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
    <div class="isolate z-50 col-start-2 row-start-1 overflow-x-clip border-b border-muted">
      <div
        :style="{
          transform: `translateX(-${scrollLeft}px)`,
        }"
        class="right-0 h-full"
      >
        <!-- Virtualized column headers -->
        <div
          v-for="col in visibleColumns"
          :key="col.index"
          :style="{
            left: `${col.left}px`,
            width: `${cellSize.x}px`,
          }"
          class="group absolute top-0 flex h-full items-center border-default text-left text-sm text-nowrap"
          :class="{ 'border-l-2 pl-2': col.label }"
        >
          <span class="pointer-events-none">
            {{ col.label }}
          </span>
          <ULabel
            v-if="hoveredCell && hoveredCell.col == col.index"
            class="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2"
          >
            {{ col.dateLabel }}
          </ULabel>
        </div>

        <!-- Deadline header markers -->
        <div
          v-for="deadline in visibleDeadlines"
          :key="deadline.id"
          :style="{
            left: `${deadline.col * cellSize.x}px`,
            width: `${cellSize.x}px`,
          }"
          class="pointer-events-none absolute z-20 h-full"
        >
          <UTooltip
            :text="deadline.label"
            :content="{ side: 'top' }"
            :ui="{ content: 'text-sm' }"
            :delay-duration="0"
          >
            <div
              class="pointer-events-auto absolute -bottom-1.5 -left-1.5 flex size-3 cursor-pointer items-center justify-center rounded-full"
              :class="[deadline.id == -1 ? 'bg-error' : 'bg-primary']"
            />
          </UTooltip>
        </div>
      </div>
    </div>

    <!-- Row labels (left sidebar) -->
    <div class="row-start-2 overflow-hidden border-r border-muted">
      <div
        :style="{
          height: `${totalHeight}px`,
          transform: `translateY(-${scrollTop}px)`,
        }"
        class="relative w-full"
      >
        <template v-for="row in visibleRows" :key="row.index">
          <GanttLabel
            v-if="row.index < tasks.length"
            v-model="tasks[row.index]"
            :style="{
              top: `${row.top}px`,
              height: `${cellSize.y}px`,
            }"
            class="absolute left-0 w-full"
            :highlight="row.index == hoveredCell?.row"
            @settings-click="({ taskId }) => handleClick(taskId)"
          />
          <div
            v-else
            :style="{
              top: `${row.top}px`,
              height: `${cellSize.y}px`,
            }"
            class="absolute left-0 w-full border-b border-default"
          />
        </template>
      </div>
    </div>

    <!-- Main scrollable grid area -->
    <div
      v-if="tasks"
      ref="scrollContainerRef"
      class="relative col-start-2 row-start-2 flex-1 overflow-auto"
    >
      <!-- SVG Grid Background -->
      <svg
        class="pointer-events-none absolute inset-0 z-0 h-full w-full"
        :style="{
          minHeight: `${totalHeight}px`,
          minWidth: `${totalWidth}px`,
        }"
      >
        <defs>
          <pattern
            id="grid-pattern"
            :height="cellSize.y"
            :width="cellSize.x"
            patternUnits="userSpaceOnUse"
          >
            <rect :height="cellSize.y" :width="cellSize.x" fill="transparent" />
            <path
              :d="`M ${cellSize.x} 0 L ${cellSize.x} ${cellSize.y}`"
              fill="none"
              class="stroke-default"
              stroke-width="1"
            />
            <path
              :d="`M 0 ${cellSize.y} L ${cellSize.x} ${cellSize.y}`"
              fill="none"
              class="stroke-default"
              stroke-width="1"
            />
          </pattern>
        </defs>
        <rect fill="url(#grid-pattern)" height="100%" width="100%" />

        <!-- Off-day shading pattern (only when days-off are visible) -->
        <template v-if="!weekOptions.hideDaysOff && offDays.length > 0">
          <defs>
            <pattern
              id="off-days-pattern"
              :x="-(startDate.dayOfWeek - 1) * cellSize.x"
              :height="cellSize.y"
              :width="7 * cellSize.x"
              patternUnits="userSpaceOnUse"
            >
              <rect
                v-for="day in offDays"
                :key="day"
                :x="(day - 1) * cellSize.x"
                y="0"
                :width="cellSize.x"
                :height="cellSize.y"
                class="fill-default/20"
              />
            </pattern>
          </defs>
          <rect fill="url(#off-days-pattern)" height="100%" width="100%" />
        </template>

        <!-- Deadline vertical lines -->
        <g
          v-for="deadline in visibleDeadlines"
          :key="`line-${deadline.id}`"
          :transform="`translate(${deadline.col * cellSize.x}, 0)`"
        >
          <line
            y1="0"
            y2="100%"
            stroke-width="1"
            class="pointer-events-none"
            :class="[deadline.id == -1 ? 'stroke-error' : 'stroke-primary']"
          />
        </g>
      </svg>

      <!-- SVG Dependency Arrows Layer -->
      <svg
        class="pointer-events-none absolute inset-0 z-10 h-full w-full"
        :style="{
          minHeight: `${totalHeight}px`,
          minWidth: `${totalWidth}px`,
        }"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="10"
            refX="4.5"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 5 5 L 0 10 Z" class="fill-(--ui-border-accented)" />
          </marker>
        </defs>
        <path
          v-for="arrow in visibleArrows"
          :key="`${arrow.fromTaskId}-${arrow.toTaskId}-${arrow.type}`"
          :d="arrow.path"
          fill="none"
          class="stroke-(--ui-border-accented)"
          stroke-width="1.5"
          marker-end="url(#arrowhead)"
        />
      </svg>

      <!-- HTML Div Container for Tasks -->
      <div
        :style="{
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
        }"
        class="pointer-events-none absolute z-20"
      >
        <GanttBar
          v-for="task in visibleTasks"
          :key="task.id"
          class="pointer-events-auto absolute z-20"
          :style="{
            left: `${task.col * cellSize.x}px`,
            top: `${task.row * cellSize.y}px`,
            width: `${task.width * cellSize.x}px`,
            height: `${cellSize.y}px`,
          }"
          :pixels-width="cellSize.x"
          :task="task"
          @update-dates="({ startDate, endDate }) => updateTaskDates(task.id, startDate, endDate)"
          @popover-clicked="({ taskId }) => handleClick(taskId)"
        />

        <!-- Cell highlight -->
        <div
          v-if="hoveredCell && cellHighlight.col"
          class="pointer-events-auto absolute z-0 h-full bg-accented/10"
          :style="{
            left: `${hoveredCell.col * cellSize.x}px`,
            width: `${cellSize.x}px`,
          }"
        />
        <div
          v-if="hoveredCell && cellHighlight.row"
          class="pointer-events-auto absolute z-0 w-full bg-accented/10"
          :style="{
            top: `${hoveredCell.row * cellSize.y}px`,
            height: `${cellSize.y}px`,
          }"
        />
      </div>
    </div>
  </div>
</template>
