<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { Temporal } from "temporal-polyfill";
import { computed, shallowRef, watch } from "vue";
import { IntDateToTemporal, TemporalToIntDate } from "../utils/temporal";

const modelValue = defineModel<Temporal.PlainDate>({ required: true });

const props = defineProps<{
  minValue?: Temporal.PlainDate;
  maxValue?: Temporal.PlainDate;
}>();

// Helper to check if something is a Temporal.PlainDate
function isTemporalPlainDate(value: any): boolean {
  return value && typeof value.until === "function" && typeof value.toString === "function";
}

// Ensure initial value is a proper Temporal.PlainDate
const initialTemporal = isTemporalPlainDate(modelValue.value)
  ? modelValue.value
  : Temporal.PlainDate.from(modelValue.value.toString());

const intDate = shallowRef<CalendarDate>(TemporalToIntDate(initialTemporal));

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
    if (!modelValue.value || modelValue.value.toString() !== temporalDate.toString()) {
      modelValue.value = temporalDate;
    }
  }
});

// Watch for external changes to modelValue
watch(modelValue, (newValue) => {
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
