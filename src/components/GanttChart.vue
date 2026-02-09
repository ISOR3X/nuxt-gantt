<script lang="ts">
import { DropdownMenuItem } from "@nuxt/ui";
import { useResizeObserver } from "@vueuse/core";
import { Temporal } from "temporal-polyfill";
import { colToDate, formatColumnDate, formatColumnHeader } from "../utils/temporal.ts";
import { computeVisibleArrows, type BBox, type GanttArrow } from "../utils/arrows.ts";
import { Deadline, Task, Vec2 } from "../utils/types.ts";
import GanttLabel from "./GanttLabel.vue";
import { useMemoize } from "@vueuse/core";
import { useTaskEditor } from "../composables/gantt.ts";
import ULabel from "./ULabel.vue";

type CellHighlight = { row: boolean; col: boolean };
export interface GanttChartProps {
  cellSize?: Vec2;
  cellHighlight?: CellHighlight;
  startDate?: Temporal.PlainDate;
  endDate?: Temporal.PlainDate;
  dropdownItems?: DropdownMenuItem[];
}
</script>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import GanttBar from "./GanttBar.vue";

const {
  cellSize = { x: 30, y: 30 },
  cellHighlight = { row: false, col: false },
  startDate = Temporal.Now.plainDateISO().subtract({ months: 1 }),
  endDate = Temporal.Now.plainDateISO().add({ years: 1 }),
} = defineProps<GanttChartProps>();

const tasks = defineModel<Task[]>("tasks", { required: true });
const deadlines = defineModel<Deadline[]>("deadlines", { required: true });

const { editTask } = useTaskEditor(tasks);

// O(1) task lookup map for dependency arrow resolution
const taskMap = computed(() => {
  const map = new Map<number, Task>();
  for (const task of tasks.value) map.set(task.id, task);
  return map;
});

const HEADERHEIGHT = 40; // Height of the header in pixels
const HEADERWIDTH = 240; // Width of the header in pixels
const OVERSCAN = 5;

const scrollContainerRef = ref<HTMLElement | null>(null);

// Get current scroll position for virtualization
const scrollLeft = ref(0);
const scrollTop = ref(0);

const viewportWidth = computed(() => scrollContainerRef.value?.clientWidth ?? 0);
const viewportHeight = computed(() => scrollContainerRef.value?.clientHeight ?? 0);
const maxRowsOnScreen = computed(() => Math.ceil(viewportHeight.value / cellSize.y) - 1);
const maxColsOnScreen = computed(() => Math.ceil(viewportWidth.value / cellSize.x) - 1);

// Virtual grid dimensions
const totalRows = computed(() => {
  return Math.max(maxRowsOnScreen.value, tasks.value.length);
});
const totalColumns = computed(() => {
  return Math.max(maxColsOnScreen.value, startDate.until(endDate).days + 1);
});

// Total size in pixels
const totalWidth = computed(() => totalColumns.value * cellSize.x);
const totalHeight = computed(() => totalRows.value * cellSize.y);

// Calculate visible column range
const visibleColumnStart = computed(() => Math.floor(scrollLeft.value / cellSize.x));
const visibleColumnEnd = computed(() =>
  Math.ceil((scrollLeft.value + viewportWidth.value) / cellSize.x),
);

// Calculate visible row range
const visibleRowStart = computed(() => Math.floor(scrollTop.value / cellSize.y));
const visibleRowEnd = computed(() =>
  Math.ceil((scrollTop.value + viewportHeight.value) / cellSize.y),
);

// Cache task layout calculations. useMemoize uses the arguments passed to the function, so taskId is still used.
const getTaskLayout = useMemoize((_taskId: number, startDateStr: string, endDateStr: string) => {
  const taskStartDate = Temporal.PlainDate.from(startDateStr);
  const taskEndDate = Temporal.PlainDate.from(endDateStr);
  return {
    col: startDate.until(taskStartDate).days,
    width: taskStartDate.until(taskEndDate).days,
  };
});

const getDeadlineLayout = useMemoize((_taskId: number, dateStr: string) => {
  const deadlineDate = Temporal.PlainDate.from(dateStr);
  return {
    col: startDate.until(deadlineDate).days,
  };
});

// Visible viewport bounds in virtual (scroll) coordinates for arrow virtualization
const viewportBBox = computed<BBox>(() => ({
  left: scrollLeft.value,
  top: scrollTop.value,
  right: scrollLeft.value + viewportWidth.value,
  bottom: scrollTop.value + viewportHeight.value,
}));

// Compute visible dependency arrows (virtualized via bounding box intersection)
const visibleArrows = computed<GanttArrow[]>(() => {
  return computeVisibleArrows(
    tasks.value,
    taskMap.value,
    getTaskLayout,
    cellSize,
    viewportBBox.value,
  );
});

// Then use tasksWithLayout instead of tasks.value
const visibleTasks = computed(() => {
  const rowStart = Math.max(0, visibleRowStart.value - OVERSCAN);
  const rowEnd = Math.min(totalRows.value, visibleRowEnd.value + OVERSCAN);
  const colStart = Math.max(0, visibleColumnStart.value - OVERSCAN);
  const colEnd = Math.min(totalColumns.value, visibleColumnEnd.value + OVERSCAN);

  return tasks.value
    .filter((task: Task) => task.row >= rowStart && task.row <= rowEnd) // Remove tasks outside of viewport (in y-axis) first to reduce unnecessary computations.
    .map((task: Task) => {
      // Map task to its position and size in the grid.
      return {
        ...task,
        ...getTaskLayout(task.id, task.startDate.toString(), task.endDate.toString()),
      };
    })
    .filter((task) => {
      // Remove tasks outside of viewport (in x-axis).
      const taskColEnd = task.col + task.width;
      return !(task.col > colEnd || taskColEnd < colStart);
    });
});

// Virtualized deadlines - only render those in visible viewport
const visibleDeadlines = computed(() => {
  const colStart = visibleColumnStart.value - OVERSCAN;
  const colEnd = visibleColumnEnd.value + OVERSCAN;

  return deadlines.value
    .map((deadline) => {
      return {
        ...deadline,
        ...getDeadlineLayout(deadline.id, deadline.date.toString()),
      };
    })
    .filter((deadline) => deadline.col >= colStart && deadline.col <= colEnd);
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
      left: i * cellSize.x,
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
      top: i * cellSize.y,
    });
  }
  return rows;
});

// Update scroll position on scroll event
function handleScroll() {
  if (scrollContainerRef.value) {
    scrollLeft.value = scrollContainerRef.value.scrollLeft;
    scrollTop.value = scrollContainerRef.value.scrollTop;
  }
}

// Scroll to a specific column index
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
  getTaskLayout.clear();
  getDeadlineLayout.clear();
});

useResizeObserver(scrollContainerRef, () => {
  handleScroll();
});

function updateTaskDates(
  taskId: number,
  startDate: Temporal.PlainDate,
  endDate: Temporal.PlainDate,
) {
  const task = tasks.value.find((t) => t.id === taskId);
  if (task) {
    task.startDate = startDate;
    task.endDate = endDate;
  }
}

// Expose scrollTo function for parent components
defineExpose({
  scrollTo,
});

async function handleClick(id: number) {
  await editTask(id);
}

const mousePos = ref<Vec2 | null>({ x: 0, y: 0 });

const hoveredCell = computed(() => {
  if (mousePos.value) {
    const relativeX = mousePos.value.x + scrollLeft.value;
    const col = Math.floor(relativeX / cellSize.x);

    const relativeY = mousePos.value.y + scrollTop.value;
    const row = Math.floor(relativeY / cellSize.y);

    return { col: col, row: row };
  }
});

function handleMouseMove(event: MouseEvent) {
  const rect = scrollContainerRef.value?.getBoundingClientRect();
  if (!rect) return;
  mousePos.value = { x: event.clientX - rect.left, y: event.clientY - rect.top };
}
</script>

<template>
  <div
    class="grid min-h-0 rounded-md border border-muted"
    :style="{
      gridTemplateColumns: `${HEADERWIDTH}px 1fr`,
      gridTemplateRows: `${HEADERHEIGHT}px 1fr`,
    }"
    @mousemove="handleMouseMove"
    @mouseleave="
      () => {
        mousePos = null;
      }
    "
  >
    <div
      class="col-start-1 row-start-1 flex items-center justify-between border-r border-b border-muted px-1"
    >
      <slot name="header" />
      <UDropdownMenu v-if="dropdownItems" :items="dropdownItems" :content="{ align: 'start' }">
        <UButton icon="i-lucide-menu" color="neutral" variant="ghost" />
      </UDropdownMenu>
    </div>
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
            {{ formatColumnDate(col.date) }}
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
        <!-- <UTooltip
          text="Holiday"
          :content="{ side: 'top' }"
          :ui="{ content: 'text-sm' }"
          :delay-duration="0"
        >
       <div
        :style="{
          left: `${10 * cellSize.x}px`,
          width: `${10 * cellSize.x}px`,
        }"
        class="absolute -bottom-0.5 bg-primary h-1 cursor-pointer z-10 rounded-full"
      />
      </UTooltip> -->
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
            v-if="row.index < tasks.length"
            v-model="tasks[row.index]"
            :style="{
              top: `${row.top}px`,
              height: `${cellSize.y}px`,
            }"
            class="absolute left-0 w-full"
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
              :d="`M ${cellSize.x} 0 L 0 0 0 ${cellSize.y}`"
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
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 8 3 L 0 6 Z" fill="var(--ui-text-muted)" />
          </marker>
        </defs>
        <path
          v-for="arrow in visibleArrows"
          :key="`${arrow.fromTaskId}-${arrow.toTaskId}-${arrow.type}`"
          :d="arrow.path"
          fill="none"
          stroke="var(--ui-text-muted)"
          stroke-width="1.5"
          marker-end="url(#arrowhead)"
        />
      </svg>

      <!-- HTML Div Container for Tasks/Squares -->
      <div
        :style="{
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
        }"
        class="pointer-events-none absolute z-20"
      >
        <!-- Virtualized HTML Div Tasks (one per row) -->
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
      <!-- <div
        :style="{
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
        }"
        class="absolute z-10 pointer-events-none"
      >
          <div
          class="absolute bg-primary/10 h-full border-x-primary pointer-events-auto"
          :style="{
            left: `${10 * cellSize.x}px`,
            top: `${0 * cellSize.y}px`,
            width: `${10 * cellSize.x}px`,
          }"/>
          
          <div
          v-for="i in [0,7,14]"
          class="absolute bg-accented/10 h-full border-x-primary pointer-events-auto"
          :style="{
            left: `${(20 + i)* cellSize.x}px`,
            top: `${0 * cellSize.y}px`,
            width: `${3 * cellSize.x}px`,
          }"/>
      </div> -->
    </div>
  </div>
</template>
