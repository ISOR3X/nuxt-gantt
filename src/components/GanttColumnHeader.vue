<script lang="ts" setup>
import { Temporal } from "temporal-polyfill";
import { useGanttContext } from "../composables/gantt.ts";
import { Deadline } from "../types";
import ULabel from "./ULabel.vue";

const props = defineProps<{
  visibleColumns: {
    index: number;
    date: Temporal.PlainDate;
    left: number;
    label: string | undefined;
    dateLabel: string;
  }[];
  visibleDeadlines: (Deadline & { col: number })[];
  hoveredCol: number | undefined;
}>();

const { cellSize, scrollLeft } = useGanttContext();
</script>

<template>
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
          v-if="hoveredCol != null && hoveredCol === col.index"
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
            :class="[deadline.id === -1 ? 'bg-error' : 'bg-primary']"
          />
        </UTooltip>
      </div>
    </div>
  </div>
</template>
