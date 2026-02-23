<script setup lang="ts">
import { computed, ref } from "vue";
import { Event } from "../types/gantt";
import { cloneDateRangeItem } from "../utils/common";
import { formatDurationInDays } from "../utils/temporal";
import UDatePicker from "./UDatePicker.vue";
import UHoldButton from "./UHoldButton.vue";

const props = defineProps<{
  item: Event;
}>();

const emit = defineEmits<{
  close: [payload?: { event?: Event; mode?: "copy" | "delete" }];
}>();

const clonedEvent = ref<Event>(cloneDateRangeItem(props.item));
const itemTypes = ref(["event", "deadline"]);

// TODO: deduplicate. Task editor modal has a lot of code in common.
const startDate = computed({
  get: () => clonedEvent.value.startDate,
  set: (newDate) => {
    clonedEvent.value.startDate = newDate;
  },
});

const endDate = computed({
  get: () => clonedEvent.value.endDate ?? clonedEvent.value.startDate,
  set: (newDate) => {
    clonedEvent.value.endDate = newDate;
  },
});

const toast = useToast();
const itemType = computed({
  get: () => clonedEvent.value.type ?? "event",
  set: (newType) => {
    if (newType == "deadline") {
      if (startDate.value.until(endDate.value).days != 0) {
        toast.add({
          title: "Failed type conversion",
          description:
            "An event can only be converted to a deadline if the start date equals end date.",
          icon: "i-lucide-circle-x",
          color: "error",
        });
        return;
      }
    }
    clonedEvent.value.type = newType;
  },
});
</script>

<template>
  <UModal
    title="Task configuration"
    description="Edit the task configuration. Cancelling will revert all made changes."
    :close="false"
  >
    <template #body>
      <UForm class="space-y-4">
        <div class="grid grid-cols-2 gap-x-4">
          <UFormField label="Label">
            <UInput v-model="clonedEvent.label" />
          </UFormField>
          <UFormField label="Type">
            <USelect
              v-model="itemType"
              :ui="{ base: 'w-full capitalize', item: 'capitalize' }"
              :items="itemTypes"
            />
          </UFormField>
        </div>
        <UFormField label="Description">
          <UTextarea v-model="clonedEvent.description" class="w-full" />
        </UFormField>
        <div class="grid grid-cols-3 gap-x-4">
          <UFormField label="Start date">
            <UDatePicker v-model="startDate" :max-value="endDate" />
          </UFormField>
          <UFormField label="End date">
            <UDatePicker v-model="endDate" :min-value="startDate" />
          </UFormField>
          <UFormField label="Duration">
            <!-- TODO: Allow duration input -->
            <UInput
              disabled
              :placeholder="formatDurationInDays(clonedEvent.startDate, clonedEvent.endDate)"
            />
          </UFormField>
        </div>
      </UForm>
    </template>
    <template #footer>
      <UHoldButton
        label="Delete task"
        variant="subtle"
        @click:complete="emit('close', { event: undefined, mode: 'delete' })"
      />
      <UButton
        label="Cancel"
        class="ml-auto"
        variant="subtle"
        @click="emit('close', { event: undefined, mode: 'copy' })"
      />
      <UButton label="Submit" @click="emit('close', { event: clonedEvent, mode: 'copy' })" />
    </template>
  </UModal>
</template>
