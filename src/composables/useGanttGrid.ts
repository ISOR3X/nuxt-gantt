import { useMemoize } from "@vueuse/core";
import { Temporal } from "temporal-polyfill";
import { computed, onUnmounted, Ref, watch } from "vue";

import { Task, Deadline, Vec2, Weekday } from "../types";
import { computeVisibleArrows, type BBox, type GanttArrow } from "../utils/arrows.ts";
import {
  colToDate,
  countColumnsInRange,
  dateToCol,
  formatColumnDate,
  formatColumnHeader,
} from "../utils/temporal.ts";

export interface UseGanttGridOptions {
  tasks: Ref<Task[]>;
  deadlines: Ref<Deadline[]>;
  startDate: Ref<Temporal.PlainDate>;
  endDate: Ref<Temporal.PlainDate>;
  effectiveWorkDays: Ref<Weekday[] | undefined>;
  firstWorkDay: Ref<Weekday>;
  cellSize: Vec2;
  scrollLeft: Ref<number>;
  scrollTop: Ref<number>;
  viewportWidth: Ref<number>;
  viewportHeight: Ref<number>;
  overscan?: number;
}

export function useGanttGrid(options: UseGanttGridOptions) {
  const {
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
    overscan = 5,
  } = options;

  // O(1) lookup table
  const taskMap = computed(() => {
    const map = new Map<number, Task>();
    for (const task of tasks.value) map.set(task.id, task);
    return map;
  });

  // #region: Grid dimensions
  const maxRowsOnScreen = computed(() => Math.ceil(viewportHeight.value / cellSize.y) - 1);
  const maxColsOnScreen = computed(() => Math.ceil(viewportWidth.value / cellSize.x) - 1);

  const totalRows = computed(() => Math.max(maxRowsOnScreen.value, tasks.value.length));
  const totalColumns = computed(() =>
    Math.max(
      maxColsOnScreen.value,
      countColumnsInRange(startDate.value, endDate.value, effectiveWorkDays.value),
    ),
  );

  const totalWidth = computed(() => totalColumns.value * cellSize.x);
  const totalHeight = computed(() => totalRows.value * cellSize.y);
  // #endregion

  // #region: layout memoization
  const getTaskLayout = useMemoize((_taskId: number, startDateStr: string, endDateStr: string) => {
    const taskStartDate = Temporal.PlainDate.from(startDateStr);
    const taskEndDate = Temporal.PlainDate.from(endDateStr);
    const wd = effectiveWorkDays.value;
    return {
      col: dateToCol(startDate.value, taskStartDate, wd),
      width: dateToCol(taskStartDate, taskEndDate, wd),
    };
  });

  const getDeadlineLayout = useMemoize((_deadlineId: number, dateStr: string) => {
    const deadlineDate = Temporal.PlainDate.from(dateStr);
    return {
      col: dateToCol(startDate.value, deadlineDate, effectiveWorkDays.value),
    };
  });

  // Invalidate memoized layout caches when work-day configuration changes
  watch(effectiveWorkDays, () => {
    getTaskLayout.clear();
    getDeadlineLayout.clear();
  });

  onUnmounted(() => {
    getTaskLayout.clear();
    getDeadlineLayout.clear();
  });
  // #endregion

  // #region: virtualization
  // Visible cell ranges
  const visibleColumnStart = computed(() => Math.floor(scrollLeft.value / cellSize.x));
  const visibleColumnEnd = computed(() =>
    Math.ceil((scrollLeft.value + viewportWidth.value) / cellSize.x),
  );

  const visibleRowStart = computed(() => Math.floor(scrollTop.value / cellSize.y));
  const visibleRowEnd = computed(() =>
    Math.ceil((scrollTop.value + viewportHeight.value) / cellSize.y),
  );

  // Visible viewport bounds (for arrow virtualization)
  const viewportBBox = computed<BBox>(() => ({
    left: scrollLeft.value,
    top: scrollTop.value,
    right: scrollLeft.value + viewportWidth.value,
    bottom: scrollTop.value + viewportHeight.value,
  }));

  // Visible arrows
  const visibleArrows = computed<GanttArrow[]>(() =>
    computeVisibleArrows(tasks.value, taskMap.value, getTaskLayout, cellSize, viewportBBox.value),
  );

  // Visible tasks
  const visibleTasks = computed(() => {
    const rowStart = Math.max(0, visibleRowStart.value - overscan);
    const rowEnd = Math.min(totalRows.value, visibleRowEnd.value + overscan);
    const colStart = Math.max(0, visibleColumnStart.value - overscan);
    const colEnd = Math.min(totalColumns.value, visibleColumnEnd.value + overscan);

    const result: (Task & { col: number; width: number })[] = [];

    for (const task of tasks.value) {
      if (task.row < rowStart || task.row > rowEnd) continue;

      const layout = getTaskLayout(task.id, task.startDate.toString(), task.endDate.toString());
      const taskColEnd = layout.col + layout.width;
      if (layout.col > colEnd || taskColEnd < colStart) continue;

      result.push({ ...task, ...layout });
    }

    return result;
  });

  // Visible deadlines (single-pass)
  const visibleDeadlines = computed(() => {
    const colStart = visibleColumnStart.value - overscan;
    const colEnd = visibleColumnEnd.value + overscan;

    const result: (Deadline & { col: number })[] = [];

    for (const deadline of deadlines.value) {
      const layout = getDeadlineLayout(deadline.id, deadline.date.toString());
      if (layout.col < colStart || layout.col > colEnd) continue;
      result.push({ ...deadline, ...layout });
    }

    return result;
  });

  // Visible column headers
  const visibleColumns = computed(() => {
    const columns: {
      index: number;
      date: Temporal.PlainDate;
      left: number;
      label: string | undefined;
      dateLabel: string;
    }[] = [];
    const startCol = Math.max(0, visibleColumnStart.value - overscan);
    const endCol = Math.min(totalColumns.value, visibleColumnEnd.value + overscan);
    const wd = effectiveWorkDays.value;

    for (let i = startCol; i < endCol; i++) {
      const d = colToDate(startDate.value, i, wd);
      columns.push({
        index: i,
        date: d,
        left: i * cellSize.x,
        label: formatColumnHeader(d, firstWorkDay.value),
        dateLabel: formatColumnDate(d),
      });
    }

    return columns;
  });

  // Visible row headers
  const visibleRows = computed(() => {
    const rows: { index: number; label: string; top: number }[] = [];
    const startRow = Math.max(0, visibleRowStart.value - overscan);
    const endRow = Math.min(totalRows.value, visibleRowEnd.value + overscan);

    for (let i = startRow; i < endRow; i++) {
      rows.push({
        index: i,
        label: `R-${i}`,
        top: i * cellSize.y,
      });
    }
    return rows;
  });
  // #endregion

  return {
    // Data
    taskMap,

    // Grid dimensions
    totalRows,
    totalColumns,
    totalWidth,
    totalHeight,

    // Visible items
    visibleTasks,
    visibleDeadlines,
    visibleColumns,
    visibleRows,
    visibleArrows,
  };
}
