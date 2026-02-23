<script lang="ts">
import { AppConfig, computed, ref } from "vue";
import theme from "#build/ui/event-marker";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";
import { Event } from "../../types/gantt";
import { Temporal } from "temporal-polyfill";

type EventMarker = ComponentConfig<typeof theme, AppConfig, "event">;
export type EventMarkerUiSlots = EventMarker["slots"];

export interface EventMarkerProps {
  item: Event;
  color?: EventMarker["variants"]["color"];
  class?: any;
  ui?: EventMarkerUiSlots;
}
</script>

<script lang="ts" setup>
const props = defineProps<EventMarkerProps>();

const isDeadline = computed(
  () =>
    (props.item.endDate == null ||
      Temporal.PlainDate.compare(props.item.startDate, props.item.endDate) == 0) &&
    props.item.type == "deadline",
);

const appConfig = useAppConfig() as EventMarker["AppConfig"];

const readOnly = ref(true);

const ui = computed(() =>
  tv({ extend: tv(theme), ...appConfig.ui?.event })({
    color: props.color,
    deadline: isDeadline.value,
    readOnly: readOnly?.value,
  }),
);
</script>

<template>
  <div :class="ui.markerRoot({ class: [props.ui?.markerRoot, props.class] })">
    <div :class="ui.markerBody({ class: props.ui?.markerBody })" />
    <div :class="ui.markerContent({ class: props.ui?.markerContent })">
      <slot :ui="ui" :item="props.item" />
    </div>
  </div>
</template>
