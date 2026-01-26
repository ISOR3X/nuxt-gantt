<script lang="ts">
import { Task } from "../utils/types.ts";
import GanttLabel from "./GanttLabel.vue";

export interface GanttChartProps {
  // tasks: Task[];
  cellWidth: number;
  cellHeight: number;
}
</script>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import GanttBar from "./GanttBar.vue";

const props = defineProps<GanttChartProps>();

// Scroll container ref
const scrollContainerRef = ref<HTMLElement | null>(null);
const headerHeight = 40; // Height of the header in pixels
const headerWidth = 240; // Width of the header in pixels

// Virtual grid dimensions (very large for "infinite" feel)
const totalRows = 100;
const totalColumns = 300;
const overscan = 5;

// Total size in pixels
const totalWidth = computed(() => totalColumns * props.cellWidth);
const totalHeight = computed(() => totalRows * props.cellHeight);

const allTasks = defineModel<Task[]>();

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
const visibleColumnStart = computed(() => Math.floor(scrollLeft.value / props.cellWidth));
const visibleColumnEnd = computed(() =>
  Math.ceil((scrollLeft.value + viewportWidth.value) / props.cellWidth),
);

const visibleRowStart = computed(() => Math.floor(scrollTop.value / props.cellHeight));
const visibleRowEnd = computed(() =>
  Math.ceil((scrollTop.value + viewportHeight.value) / props.cellHeight),
);

// Virtualized tasks - only render those in visible viewport
const visibleTasks = computed(() => {
  const rowStart = visibleRowStart.value - overscan;
  const rowEnd = visibleRowEnd.value + overscan;
  const colStart = visibleColumnStart.value - overscan;
  const colEnd = visibleColumnEnd.value + overscan;

  return allTasks.value.filter((task: Task) => {
    const taskColEnd = task.col + task.width;

    // Check if a task intersects with visible area
    // Since each task is exactly on its row, we just check row range and column range
    return (
      task.row >= rowStart && task.row <= rowEnd && !(task.col > colEnd || taskColEnd < colStart)
    );
  });
});

// Grid pattern ID
const gridPatternId = "grid-pattern";

// Generate column headers based on visible columns
const visibleColumns = computed(() => {
  const columns = [];
  const startCol = Math.max(0, visibleColumnStart.value - overscan); // Add overscan
  const endCol = Math.min(totalColumns, visibleColumnEnd.value + overscan);

  for (let i = startCol; i < endCol; i++) {
    columns.push({
      index: i,
      label: `C-${i}`,
      left: i * props.cellWidth,
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
      top: i * props.cellHeight,
    });
  }
  return rows;
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
      <div class="z-10 flex items-center justify-center bg-default border-muted border-b border-r"><UIcon name="i-simple-icons:nuxt" class="size-5 text-[#00DC82]"/></div>

      <div
        :style="{
          width: `${totalWidth}px`,
          transform: `translateX(-${scrollLeft}px)`,
        }"
        class="relative h-full bg-default border-b border-muted"
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
          class="absolute top-0 flex items-center justify-center border-r border-default text-sm"
        >
          {{ col.label }}
        </div>
      </div>

      <div
        :style="{
          height: `${totalHeight}px`,
          transform: `translateY(-${scrollTop}px)`,
        }"
        class="relative w-full bg-default border-r border-muted"
      >
        <!-- Virtualized column headers -->
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
          :id="gridPatternId"
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

      <rect :fill="`url(#${gridPatternId})`" :height="totalHeight" :width="totalWidth" />
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
          height: `${task.height * cellHeight}px`,
        }"
        v-model="visibleTasks[i]"
        class="absolute"
        @click="() => console.log('Clicked:', task.label)"
        :pixels-width="cellWidth"
      />
    </div>
  </div>
</template>
