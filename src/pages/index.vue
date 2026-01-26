<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useVirtualizer } from "@tanstack/vue-virtual";

// Grid settings
const cellWidth = ref(50);
const cellHeight = ref(50);

// Scroll container ref
const scrollContainerRef = ref<HTMLElement | null>(null);
const headerHeight = 40; // Height of the header in pixels
const headerWidth = 240; // Height of the header in pixels

// Virtual grid dimensions (very large for "infinite" feel)
const totalRows = 100;
const totalColumns = 100;

// Total size in pixels
const totalWidth = computed(() => totalColumns * cellWidth.value);
const totalHeight = computed(() => totalRows * cellHeight.value);

// Task interface
interface Task {
  id: number;
  row: number;
  col: number;
  width: number;
  height: number;
  color: string;
  label: string;
}

// Generate random task for a specific row (one task per row)
const generateRandomTask = (rowIndex: number): Task => {
  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#06b6d4",
    "#84cc16",
  ];

  return {
    id: rowIndex,
    row: rowIndex,
    col: Math.floor(Math.random() * 50) + 5, // Start between columns 5-55
    width: Math.floor(Math.random() * 15) + 5, // Width between 5-20 cells
    height: 1, // One row height (standard Gantt task)
    color: colors[rowIndex % colors.length],
    label: `Task ${rowIndex}`,
  };
};

// Generate tasks for all rows (one task per row)
const generateAllTasks = (): Task[] => {
  const tasks: Task[] = [];
  for (let i = 0; i < totalRows; i++) {
    tasks.push(generateRandomTask(i));
  }
  return tasks;
};

const allTasks = ref(generateAllTasks());

// Row virtualizer - properly using TanStack Virtual
const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: totalRows,
    getScrollElement: () => scrollContainerRef.value,
    estimateSize: () => cellHeight.value,
    overscan: 3,
  })),
);

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

// Setup and cleanup scroll listener
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
const visibleColumnStart = computed(() => Math.floor(scrollLeft.value / cellWidth.value));
const visibleColumnEnd = computed(() =>
  Math.ceil((scrollLeft.value + viewportWidth.value) / cellWidth.value),
);

const visibleRowStart = computed(() => Math.floor(scrollTop.value / cellHeight.value));
const visibleRowEnd = computed(() =>
  Math.ceil((scrollTop.value + viewportHeight.value) / cellHeight.value),
);

// Virtualized tasks - only render those in visible viewport
const visibleTasks = computed(() => {
  // const virtualRows = rowVirtualizer.value.getVirtualItems();
  // if (!virtualRows.length) return [];

  // const visibleRowStart = virtualRows[0].index;
  const rowStart = visibleRowStart.value - 5;
  // const visibleRowEnd = virtualRows[virtualRows.length - 1].index;
  const rowEnd = visibleRowEnd.value + 5;
  const colStart = visibleColumnStart.value - 5; // overscan
  const colEnd = visibleColumnEnd.value + 5; // overscan

  return allTasks.value.filter((task) => {
    const taskColEnd = task.col + task.width;

    // Check if task intersects with visible area
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
  const startCol = Math.max(0, visibleColumnStart.value - 5); // Add overscan
  const endCol = Math.min(totalColumns, visibleColumnEnd.value + 5);

  for (let i = startCol; i < endCol; i++) {
    columns.push({
      index: i,
      label: `C-${i}`,
      left: i * cellWidth.value,
    });
  }

  return columns;
});

const visibleRows = computed(() => {
  const rows = [];
  const startRow = Math.max(0, visibleRowStart.value - 5); // Add overscan
  const endRow = Math.min(totalRows, visibleRowEnd.value + 5);

  for (let i = startRow; i < endRow; i++) {
    rows.push({
      index: i,
      label: `R-${i}`,
      top: i * cellHeight.value,
    });
  }

  return rows;
});

// Watch for cell size changes and remeasure
watch([cellWidth, cellHeight], () => {
  rowVirtualizer.value?.measure();
});
</script>

<template>
  <div class="flex h-screen w-screen flex-col bg-inverted p-4 gap-4">
    <!-- Scroll Container -->
    <!-- TODO: Figure out a better way to add the corner fill  -->
    <div
      ref="scrollContainerRef"
      class="relative flex-1 bg-default overflow-auto "
    >
      <div aria-label="sticky-corner" class="sticky top-0 left-0 z-50 h-0">
        <div
          class="flex items-center justify-center border-r border-b border-muted bg-muted"
          :style="{
            width: `${headerWidth}px`,
            height: `${headerHeight}px`,
          }"
        >
          TASKS
        </div>
      </div>
      <div
        aria-label="sticky-row"
        class="sticky top-0 z-50 w-full overflow-hidden bg-muted"
        :style="{
          left: `${headerWidth}px`,
          height: `${headerHeight}px`,
        }"
      >
        <!-- Header content container (moves with scroll) -->
        <div
          :style="{
            position: 'relative',
            width: `${totalWidth}px`,
            height: '100%',
            transform: `translateX(-${scrollLeft}px)`,
          }"
        >
          <!-- Virtualized column headers -->
          <div
            v-for="col in visibleColumns"
            class="absolute top-0 flex items-center justify-center border-r border-b border-muted text-sm"
            :key="col.index"
            :style="{
              left: `${col.left}px`,
              width: `${cellWidth}px`,
              height: `${headerHeight}px`,
            }"
          >
            {{ col.label }}
          </div>
        </div>
      </div>
      <div
        aria-label="sticky-col"
        class="sticky left-0 z-50 h-full overflow-hidden bg-muted"
        :style="{
          top: `${headerHeight}px`,
          width: `${headerWidth}px`,
        }"
      >
        <!-- Header content container (moves with scroll) -->
        <div
          :style="{
            position: 'relative',
            width: '100%',
            height: `${totalHeight}px`,
            transform: `translateY(-${scrollTop}px)`,
          }"
        >
          <!-- Virtualized column headers -->
          <div
            v-for="row in visibleRows"
            class="absolute left-0 flex items-center justify-center border-r border-b border-muted text-sm"
            :key="row.index"
            :style="{
              top: `${row.top}px`,
              width: `${headerWidth}px`,
              height: `${cellHeight}px`,
            }"
          >
            {{ row.label }}
          </div>
        </div>
      </div>
      <!-- SVG Grid Background (offset by header height) -->
      <svg
        :width="totalWidth"
        :height="totalHeight"
        class="pointer-events-none absolute z-0"
        :style="{
          top: `${headerHeight}px`,
          left: `${headerWidth}px`,
        }"
      >
        <defs>
          <pattern
            :id="gridPatternId"
            :width="cellWidth"
            :height="cellHeight"
            patternUnits="userSpaceOnUse"
          >
            <rect :width="cellWidth" :height="cellHeight" fill="var(--ui-bg)" />
            <path
              :d="`M ${cellWidth} 0 L 0 0 0 ${cellHeight}`"
              fill="none"
              stroke="var(--ui-bg-elevated)"
              stroke-width="1"
            />
          </pattern>
        </defs>

        <rect :width="totalWidth" :height="totalHeight" :fill="`url(#${gridPatternId})`" />
      </svg>

      <!-- HTML Div Container for Tasks/Squares -->
      <div
      class="absolute"
        :style="{
          top: `${headerHeight}px`,
          left: `${headerWidth}px`,
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
          zIndex: 1,
        }"
      >
        <!-- Virtualized HTML Div Tasks (one per row) -->
        <div
          v-for="task in visibleTasks"
          :key="task.id"
          class="absolute overflow-hidden"
          :style="{
            left: `${task.col * cellWidth }px`,
            top: `${task.row * cellHeight}px`,
            width: `${task.width * cellWidth}px`,
            height: `${task.height * cellHeight}px`,
            backgroundColor: task.color,
          }"
          @click="() => console.log('Clicked:', task.label)"
        >
          <div>{{ task.label }}</div>
          <div style="font-size: 10px; opacity: 0.8; margin-top: 2px">
            Row {{ task.row }} | Col {{ task.col }}-{{ task.col + task.width }}
          </div>
        </div>
      </div>
    </div>
    <!-- Controls -->
    <div class="mb-4 flex items-center gap-4 rounded-lg bg-white p-4 shadow">
      <UFormField label="Cell width (px)" orientation="horizontal">
        <UInput
          v-model.number="cellWidth"
          type="number"
          min="5"
          max="200"
        />
      </UFormField>
      <UFormField label="Cell width (px)" orientation="horizontal">
        <UInput
          v-model.number="cellHeight"
          type="number"
          min="5"
          max="200"
        />
      </UFormField>
      <div class="ml-auto flex gap-4 text-sm text-gray-600">
        <span>Total tasks: {{ allTasks.length }}</span>
        <span class="font-semibold text-blue-600">Rendered in DOM: {{ visibleTasks.length }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--ui-bg-inverted);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--ui-bg-inverted);
}

* {
  scrollbar-width: thin;
  scrollbar-color: var(--ui-bg-inverted) transparent;
}
</style>
