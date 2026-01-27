<script lang="ts">
import { Task, Deadline } from "../utils/types.ts";
import GanttLabel from "./GanttLabel.vue";
import { Temporal } from "temporal-polyfill";
import { colToDate } from "../utils/temporal.ts";

export interface GanttChartProps {
  cellWidth?: number;
  cellHeight?: number;
  startDate?: Temporal.PlainDate;
  endDate?: Temporal.PlainDate;
}
</script>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import GanttBar from "./GanttBar.vue";

const {
  cellWidth = 50,
  cellHeight = 50,
  startDate = Temporal.Now.plainDateISO().subtract({ months: 1 }),
  endDate = Temporal.Now.plainDateISO().add({ years: 1 }),
} = defineProps<GanttChartProps>();


// Get the column index for a date
function getColumnForDate(date: Temporal.PlainDate): number {
  return startDate.until(date).days;
}

// Format the date for display in the header
function formatColumnHeader(date: Temporal.PlainDate, idx: number): string | undefined {
  if (date.dayOfWeek !== 1) return;

  const isFirstFullWeekOfYear = date.day <= 7 && date.month === 1;

  const formatted = date.toLocaleString("en", {
    month: "short",
    day: "numeric",
    ...(isFirstFullWeekOfYear ? { year: "numeric" } : {}),
  });

  return formatted;
}

// Scroll container ref
const scrollContainerRef = ref<HTMLElement | null>(null);
const headerHeight = 40; // Height of the header in pixels
const headerWidth = 240; // Width of the header in pixels

// Virtual grid dimensions (very large for "infinite" feel)
const totalRows = 100;
const totalColumns = startDate.until(endDate).days;
const overscan = 5;

// Total size in pixels
const totalWidth = computed(() => totalColumns * cellWidth);
const totalHeight = computed(() => totalRows * cellHeight);

const allTasks = defineModel<Task[]>("tasks", { default: [] });
const allDeadlines = defineModel<Deadline[]>("deadlines", { default: [] });

// Get current scroll position for horizontal virtualization
const scrollLeft = ref(0);
const scrollTop = ref(0);
const viewportWidth = computed(() => scrollContainerRef.value?.clientWidth || 1000);
const viewportHeight = computed(() => scrollContainerRef.value?.clientHeight || 1000);

// Update scroll position on scroll event
const handleScroll = () => {
  if (scrollContainerRef.value) {
    scrollLeft.value = scrollContainerRef.value.scrollLeft;
    scrollTop.value = scrollContainerRef.value.scrollTop;
  }
};

// Set up and cleanup scroll listener
onMounted(() => {
  if (scrollContainerRef.value) {
    scrollContainerRef.value.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial update
  }
});

onUnmounted(() => {
  if (scrollContainerRef.value) {
    scrollContainerRef.value.removeEventListener("scroll", handleScroll);
  }
});

// Calculate visible column range
const visibleColumnStart = computed(() => Math.floor(scrollLeft.value / cellWidth));
const visibleColumnEnd = computed(() =>
  Math.ceil((scrollLeft.value + viewportWidth.value) / cellWidth),
);

const visibleRowStart = computed(() => Math.floor(scrollTop.value / cellHeight));
const visibleRowEnd = computed(() =>
  Math.ceil((scrollTop.value + viewportHeight.value) / cellHeight),
);

// Virtualized tasks - only render those in visible viewport
const visibleTasks = computed(() => {
  const rowStart = visibleRowStart.value - overscan;
  const rowEnd = visibleRowEnd.value + overscan;
  const colStart = visibleColumnStart.value - overscan;
  const colEnd = visibleColumnEnd.value + overscan;

  if (allTasks.value == undefined) {
    throw Error("No tasks found");
  }

  return allTasks.value.filter((task: Task) => {
    const taskColEnd = task.col + task.width;

    // Check if a task intersects with visible area
    // Since each task is exactly on its row, we just check row range and column range
    return (
      task.row >= rowStart && task.row <= rowEnd && !(task.col > colEnd || taskColEnd < colStart)
    );
  });
});

// Virtualized deadlines - only render those in visible viewport
const visibleDeadlines = computed(() => {
  const colStart = visibleColumnStart.value - overscan;
  const colEnd = visibleColumnEnd.value + overscan;

  return allDeadlines.value.filter((deadline) => deadline.col >= colStart && deadline.col <= colEnd);
});

// Generate column headers based on visible columns
const visibleColumns = computed(() => {
  const columns = [];
  const startCol = Math.max(0, visibleColumnStart.value - overscan); // Add overscan
  const endCol = Math.min(totalColumns, visibleColumnEnd.value + overscan);

  for (let i = startCol; i < endCol; i++) {
    const d = colToDate(startDate, i);
    columns.push({
      index: i,
      label: formatColumnHeader(d, i),
      left: i * cellWidth,
    });
  }

  return columns;
});

const visibleRows = computed(() => {
  const rows = [];
  const startRow = Math.max(0, visibleRowStart.value - overscan); // Add overscan
  const endRow = Math.min(totalRows, visibleRowEnd.value + overscan);

  for (let i = startRow; i < endRow; i++) {
    rows.push({
      index: i,
      label: `R-${i}`,
      top: i * cellHeight,
    });
  }
  return rows;
});

// Scroll to a specific column index
function scrollTo(
  idx: number,
  options?: {
    behavior?: ScrollBehavior;
    alignment?: "start" | "center" | "end";
  },
) {
  if (!scrollContainerRef.value) return;
  if (idx > totalColumns) {
    throw Error("scrollTo index larger than visible range.");
  }

  const { behavior = "auto", alignment = "start" } = options || {};

  // Calculate the target scroll position
  let targetScrollLeft = idx * cellWidth;

  // Adjust for alignment
  if (alignment === "center") {
    targetScrollLeft -= (viewportWidth.value - cellWidth) / 2;
  } else if (alignment === "end") {
    targetScrollLeft -= viewportWidth.value - cellWidth;
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

// Expose scrollTo function for parent components
defineExpose({
  scrollTo,
});
</script>

<template>
  <div ref="scrollContainerRef" class="relative flex-1 overflow-auto bg-default" v-if="allTasks">
    <div
      :style="{
        gridTemplateColumns: `${headerWidth}px 1fr`,
        gridTemplateRows: `${headerHeight}px 1fr`,
      }"
      class="pointer-events-none sticky top-0 left-0 z-50 grid h-full w-full"
    >
      <div class="z-10 flex items-center justify-center border-r border-b border-muted bg-default">
        <UIcon name="i-simple-icons:nuxt" class="size-5 text-[#00DC82]" />
      </div>

      <div
        :style="{
          width: `${totalWidth}px`,
          transform: `translateX(-${scrollLeft}px)`,
        }"
        class="relative h-full border-b border-muted bg-default"
      >
        <!-- Virtualized column headers -->
        <div
          v-for="col in visibleColumns"
          :key="col.index"
          :style="{
            left: `${col.left}px`,
            width: `${cellWidth}px`,
            height: `${headerHeight}px`,
          }"
          class="absolute top-0 flex items-center border-default text-left text-sm text-nowrap"
          :class="{ 'border-l-2 pl-2': col.label }"
        >
          {{ col.label }}
        </div>

        <!-- Deadline header markers -->
        <div
          v-for="deadline in visibleDeadlines"
          :key="deadline.id"
          :style="{
            left: `${deadline.col * cellWidth}px`,
            width: `${cellWidth}px`,
            height: `${headerHeight}px`,
          }"
          class="pointer-events-auto absolute top-0"
        >
          <UTooltip :text="deadline.label">
            <div
              class="absolute -bottom-1 -left-1 flex size-2 cursor-pointer items-center justify-center rounded-full" 
              :class="[deadline.id == -1 ? 'bg-error' : 'bg-primary']"
            />
          </UTooltip>
        </div>
      </div>

      <div
        :style="{
          height: `${totalHeight}px`,
          transform: `translateY(-${scrollTop}px)`,
        }"
        class="relative w-full border-r border-muted bg-default"
      >
        <!-- Virtualized row headers (task names) -->
        <GanttLabel
          v-for="row in visibleRows"
          :key="row.index"
          :style="{
            top: `${row.top}px`,
            width: `${headerWidth}px`,
            height: `${cellHeight}px`,
          }"
          v-model="allTasks[row.index]"
          class="absolute left-0"
        />
      </div>
    </div>
    <!-- SVG Grid Background (offset by header height) -->
    <svg
      :height="totalHeight"
      :style="{
        top: `${headerHeight}px`,
        left: `${headerWidth}px`,
      }"
      :width="totalWidth"
      class="pointer-events-none absolute z-0"
    >
      <defs>
        <pattern
          id="grid-pattern"
          :height="cellHeight"
          :width="cellWidth"
          patternUnits="userSpaceOnUse"
        >
          <rect :height="cellHeight" :width="cellWidth" fill="var(--ui-bg)" />
          <path
            :d="`M ${cellWidth} 0 L 0 0 0 ${cellHeight}`"
            fill="none"
            stroke="var(--ui-border)"
            stroke-width="1"
          />
        </pattern>
      </defs>

      <rect :fill="`url(#grid-pattern)`" :height="totalHeight" :width="totalWidth" />
      <!-- Deadline vertical lines -->
      <g
        v-for="deadline in visibleDeadlines"
        :key="`line-${deadline.id}`"
        :transform="`translate(${deadline.col * cellWidth}, 0)`"
      >
        <line
          :y1="0"
          :y2="totalHeight"
          stroke-width="1"
          class="pointer-events-none"
          :class="[deadline.id == -1 ? 'stroke-error' : 'stroke-primary']"
        />
      </g>
    </svg>

    <!-- HTML Div Container for Tasks/Squares -->
    <div
      :style="{
        top: `${headerHeight}px`,
        left: `${headerWidth}px`,
        width: `${totalWidth}px`,
        height: `${totalHeight}px`,
      }"
      class="absolute"
    >
      <!-- Virtualized HTML Div Tasks (one per row) -->
      <GanttBar
        v-for="(task, i) in visibleTasks"
        :key="task.id"
        :style="{
          left: `${task.col * cellWidth}px`,
          top: `${task.row * cellHeight}px`,
          width: `${task.width * cellWidth}px`,
          height: `${cellHeight}px`,
        }"
        v-model="visibleTasks[i]"
        class="absolute"
        @click="() => console.log('Clicked:', task.label)"
        :pixels-width="cellWidth"
      />
    </div>
  </div>
</template>
