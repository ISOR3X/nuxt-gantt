<script lang="ts">
import { Task, Deadline } from "../utils/types.ts";
import GanttLabel from "./GanttLabel.vue";
import { Temporal } from "temporal-polyfill";
import { colToDate } from "../utils/temporal.ts";
import { useResizeObserver } from "@vueuse/core";

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

const allTasks = defineModel<Task[]>("tasks", { default: [] });
const allDeadlines = defineModel<Deadline[]>("deadlines", { default: [] });

const HEADERHEIGHT = 40; // Height of the header in pixels
const HEADERWIDTH = 240; // Width of the header in pixels
const OVERSCAN = 5;

const scrollContainerRef = ref<HTMLElement | null>(null);

// Get current scroll position for virtualization
const scrollLeft = ref(0);
const scrollTop = ref(0);

const viewportWidth = computed(() => scrollContainerRef.value?.clientWidth ?? 0);
const viewportHeight = computed(() => scrollContainerRef.value?.clientHeight ?? 0);
const maxRowsOnScreen = computed(() => Math.ceil(viewportHeight.value / cellHeight) - 1);
const maxColsOnScreen = computed(() => Math.ceil(viewportWidth.value / cellWidth) - 1);

// Virtual grid dimensions
const totalRows = computed(() => {
  return Math.max(maxRowsOnScreen.value, allTasks.value.length);
});
const totalColumns = computed(() => {
  return Math.max(maxColsOnScreen.value,  startDate.until(endDate).days + 1);
});

// Total size in pixels
const totalWidth = computed(() => totalColumns.value * cellWidth); 
const totalHeight = computed(() => totalRows.value * cellHeight);


// Calculate visible column range
const visibleColumnStart = computed(() => Math.floor(scrollLeft.value / cellWidth));
const visibleColumnEnd = computed(() =>
  Math.ceil((scrollLeft.value + viewportWidth.value) / cellWidth),
);

// Calculate visible row range
const visibleRowStart = computed(() => Math.floor(scrollTop.value / cellHeight));
const visibleRowEnd = computed(() =>
  Math.ceil((scrollTop.value + viewportHeight.value) / cellHeight),
);

// Virtualized tasks - only render those in visible viewport
const visibleTasks = computed(() => {
  const rowStart = Math.max(0, visibleRowStart.value - OVERSCAN);
  const rowEnd = Math.min(totalRows.value, visibleRowEnd.value + OVERSCAN);
  const colStart = Math.max(0, visibleColumnStart.value - OVERSCAN);
  const colEnd = Math.min(totalColumns.value, visibleColumnEnd.value + OVERSCAN);


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
  const colStart = visibleColumnStart.value - OVERSCAN;
  const colEnd = visibleColumnEnd.value + OVERSCAN;

  return allDeadlines.value.filter(
    (deadline) => deadline.col >= colStart && deadline.col <= colEnd,
  );
});

// Generate column headers based on visible columns
const visibleColumns = computed(() => {
  const columns = [];
  const startCol = Math.max(0, visibleColumnStart.value - OVERSCAN); 
  const endCol = Math.min(totalColumns.value, visibleColumnEnd.value + OVERSCAN);

  for (let i = startCol; i < endCol; i++) {
    const d = colToDate(startDate, i);
    columns.push({
      index: i,
      date: d,
      left: i * cellWidth,
      label: formatColumnHeader(d),
    });
  }

  return columns;
});

const visibleRows = computed(() => {
  const rows = [];
  const startRow = Math.max(0, visibleRowStart.value - OVERSCAN);
  const endRow = Math.min(totalRows.value, visibleRowEnd.value + OVERSCAN);

  for (let i = startRow; i < endRow; i++) {
    rows.push({
      index: i,
      label: `R-${i}`,
      top: i * cellHeight,
    });
  }
  return rows;
});

// Format the date for display in the header
function formatColumnHeader(date: Temporal.PlainDate, force: boolean = false): string | undefined {
  if (date.dayOfWeek !== 1 && !force) return;

  const isFirstFullWeekOfYear = date.day <= 7 && date.month === 1;

  const formatted = date.toLocaleString("en", {
    month: "short",
    day: "numeric",
    ...(isFirstFullWeekOfYear && date.dayOfWeek == 1 ? { year: "numeric" } : {}),
  });

  return formatted;
}

// Update scroll position on scroll event
function handleScroll() {
  if (scrollContainerRef.value) {
    scrollLeft.value = scrollContainerRef.value.scrollLeft;
    scrollTop.value = scrollContainerRef.value.scrollTop;
  }
}

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


// Expose scrollTo function for parent components
defineExpose({
  scrollTo,
});

useResizeObserver(scrollContainerRef, () => {
  handleScroll();
})

</script>

<template>
  <div
    class="grid min-h-0 rounded-md border border-muted"
    :style="{
      gridTemplateColumns: `${HEADERWIDTH}px 1fr`,
      gridTemplateRows: `${HEADERHEIGHT}px 1fr`,
    }"
  >
    <div
      class="col-start-1 row-start-1 flex items-center justify-center border-r border-b border-muted"
    >
      <UIcon name="simple-icons:nuxt" class="text-[#00DC82]" />
    </div>
    <div class="z-10 col-start-2 row-start-1 overflow-x-clip border-b border-muted">
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
            width: `${cellWidth}px`,
          }"
          class="group absolute top-0 flex h-full items-center border-default text-left text-sm text-nowrap"
          :class="{ 'border-l-2 pl-2': col.label }"
        >
          <span class="pointer-events-none">
            {{ col.label }}
          </span>
          <div
            class="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 rounded-md border border-default bg-default px-2 py-0.5 opacity-0 group-hover:opacity-100"
          >
            {{ formatColumnHeader(col.date, true) }}
          </div>
        </div>

        <!-- Deadline header markers -->
        <div
          v-for="deadline in visibleDeadlines"
          :key="deadline.id"
          :style="{
            left: `${deadline.col * cellWidth}px`,
            width: `${cellWidth}px`,
          }"
          class="pointer-events-none absolute h-full"
        >
          <UTooltip
            :text="deadline.label"
            :content="{ side: 'top' }"
            :ui="{ content: 'text-sm' }"
            :delayDuration="0"
          >
            <div
              class="pointer-events-auto absolute -bottom-1.5 -left-1.5 flex size-3 cursor-pointer items-center justify-center rounded-full"
              :class="[deadline.id == -1 ? 'bg-error' : 'bg-primary']"
            />
          </UTooltip>
        </div>
      </div>
    </div>

    <div class="row-start-2 overflow-hidden border-r border-muted">
      <div
        :style="{
          height: `${totalHeight}px`,
          transform: `translateY(-${scrollTop}px)`,
        }"
        class="relative w-full"
      >
        <!-- Virtualized row headers (task names) -->
        <template v-for="row in visibleRows" :key="row.index">
          <!-- TODO: Remove style duplication -->
          <GanttLabel
            :style="{
              top: `${row.top}px`,
              height: `${cellHeight}px`,
            }"
            v-if="row.index < allTasks.length"
            v-model="allTasks[row.index]"
            class="absolute left-0 w-full"
          />
          <div
            v-else
            :style="{
              top: `${row.top}px`,
              height: `${cellHeight}px`,
            }"
            class="absolute left-0 w-full border-b border-default"
          />
        </template>
      </div>
    </div>

    <div
      ref="scrollContainerRef"
      class="relative col-start-2 row-start-2 flex-1 overflow-auto"
      v-if="allTasks"
    >
      <!-- SVG Grid Background -->
      <svg 
        class="pointer-events-none absolute z-0 inset-0 h-full w-full"
        :style="{
          minHeight: `${totalHeight}px`,
          minWidth: `${totalWidth}px`,
        }"
      >
        <defs>
          <pattern
            id="grid-pattern"
            :height="cellHeight"
            :width="cellWidth"
            patternUnits="userSpaceOnUse"
          >
            <rect :height="cellHeight" :width="cellWidth" fill="transparent" />
            <path
              :d="`M ${cellWidth} 0 L 0 0 0 ${cellHeight}`"
              fill="none"
              stroke="var(--ui-border)"
              stroke-width="1"
            />
          </pattern>
        </defs>
        <rect fill="url(#grid-pattern)" height="100%" width="100%" />
        <!-- Deadline vertical lines -->
        <g
          v-for="deadline in visibleDeadlines"
          :key="`line-${deadline.id}`"
          :transform="`translate(${deadline.col * cellWidth}, 0)`"
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

      <!-- HTML Div Container for Tasks/Squares -->
      <div
        :style="{
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
        }"
        class="absolute"
      >
        <!-- Virtualized HTML Div Tasks (one per row) -->
        <GanttBar
          v-for="task in visibleTasks"
          :key="task.id"
          :style="{
            left: `${task.col * cellWidth}px`,
            top: `${task.row * cellHeight}px`,
            width: `${task.width * cellWidth}px`,
            height: `${cellHeight}px`,
          }"
          v-model="visibleTasks[task.row]"
          class="absolute"
          @click="() => console.log('Clicked:', task.label)"
          :pixels-width="cellWidth"
        />
      </div>
    </div>
  </div>
</template>
