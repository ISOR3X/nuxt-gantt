<script lang="ts">
import { AppConfig, computed, ref } from "vue";
import theme from "../../../theme/event-marker";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";
import { Event } from "../../types/gantt";
import { Temporal } from "temporal-polyfill";
import { useGanttContext } from "../../composables/useGanttContext";

type EventBody = ComponentConfig<typeof theme, AppConfig, "event">;
export type EventBodyUiSlots = EventBody["slots"];

export interface EventBodyProps {
  item: Event;
  class?: any;
  width?: number;
  ui?: EventBodyUiSlots;
}
</script>

<script lang="ts" setup>
const props = defineProps<EventBodyProps>();

const isDeadline = computed(
  () =>
    (props.item.endDate == null ||
      Temporal.PlainDate.compare(props.item.startDate, props.item.endDate) == 0) &&
    props.item.type == "deadline",
);

const { hoveredObjectId } = useGanttContext();
const readOnly = ref(true);

const appConfig = useAppConfig() as EventBody["AppConfig"];

const ui = computed(() =>
  tv({ extend: tv(theme), ...appConfig.ui?.event })({
    deadline: isDeadline.value,
    readOnly: readOnly?.value,
  }),
);
</script>

<template>
  <g
    :class="ui.bodyRoot({ class: [props.ui?.bodyRoot, props.class] })"
    @mouseenter="hoveredObjectId = props.item.id"
    @mouseleave="hoveredObjectId = null"
  >
    <g v-if="isDeadline">
      <line y1="0" y2="100%" :class="ui.bodyContent({ class: props.ui?.bodyContent })" />
      <line y1="0" y2="100%" :class="ui.bodyBackground({ class: props.ui?.bodyBackground })" />
    </g>
    <g v-else-if="props.width">
      <rect
        :width="props.width"
        x="0"
        y="0"
        :class="ui.bodyContent({ class: props.ui?.bodyContent })"
      />
      <rect x="-10" y="0" :class="ui.bodyBackground({ class: props.ui?.bodyBackground })" />
      <rect
        :x="props.width - 10"
        y="0"
        :class="ui.bodyBackground({ class: props.ui?.bodyBackground })"
      />
    </g>
  </g>
</template>
