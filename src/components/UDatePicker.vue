<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { Temporal } from "temporal-polyfill";
import { computed, shallowRef, watch } from "vue";
import { IntDateToTemporal, TemporalToIntDate } from "../utils/temporal";

const model = defineModel<Temporal.PlainDate>({ required: true });

const props = defineProps<{
  minValue?: Temporal.PlainDate;
  maxValue?: Temporal.PlainDate;
}>();

const intDate = shallowRef<CalendarDate>(TemporalToIntDate(model.value));

// Convert min/max to CalendarDate
const minDate = computed(() => {
  return props.minValue ? TemporalToIntDate(props.minValue) : undefined;
});

const maxDate = computed(() => {
  return props.maxValue ? TemporalToIntDate(props.maxValue) : undefined;
});

// Watch the intDate ref
watch(intDate, (newDate) => {
  if (newDate) {
    const temporalDate = IntDateToTemporal(newDate);
    // Only update if different to avoid infinite loops
    if (!model.value || model.value.toString() !== temporalDate.toString()) {
      model.value = temporalDate;
    }
  }
});

// Watch for external changes to model
watch(model, (newValue) => {
  if (newValue) {
    const newIntDate = TemporalToIntDate(newValue);
    // Only update if actually different to avoid infinite loops
    if (intDate.value?.toString() !== newIntDate.toString()) {
      intDate.value = newIntDate;
    }
  }
});
</script>

<template>
  <UPopover>
    <UButton color="neutral" variant="subtle" icon="i-lucide-calendar">
      {{ intDate ? intDate.toString() : "Select a date" }}
    </UButton>
    <template #content>
      <UCalendar v-model="intDate" class="p-2" :min-value="minDate" :max-value="maxDate" />
    </template>
  </UPopover>
</template>
