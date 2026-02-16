<script setup lang="ts">
import { computed, ref } from "vue";
import { Task } from "../types/gantt";
import { cloneTask } from "../utils/common";
import { formatDurationInDays } from "../utils/temporal";
import UDatePicker from "./UDatePicker.vue";

const props = defineProps<{
  item: Task;
}>();

const emit = defineEmits<{
  close: [Task | null];
}>();

const clonedTask = ref<Task>(cloneTask(props.item));

const itemTypes = ref(["task", "milestone"]);

const toast = useToast();

// Create computed properties for two-way binding
const startDate = computed({
  get: () => clonedTask.value.startDate,
  set: (newDate) => {
    clonedTask.value.startDate = newDate;
  },
});

const endDate = computed({
  get: () => clonedTask.value.endDate ?? clonedTask.value.startDate,
  set: (newDate) => {
    clonedTask.value.endDate = newDate;
  },
});

const itemType = computed({
  get: () => clonedTask.value.type ?? "task",
  set: (newType) => {
    if (newType == "milestone") {
      if (startDate.value.until(endDate.value).days != 0) {
        toast.add({
          title: "Failed type conversion",
          description:
            "A task can only be converted to milestone if the start date equals end date.",
          icon: "i-lucide-circle-x",
          color: "error",
        });
        return;
      }
    }
    clonedTask.value.type = newType;
  },
});

const open = ref(true);
</script>

<template>
  <UModal
    title="Task configuration"
    description="Edit the task configuration. Cancelling will revert all made changes."
    v-model:open="open"
    :close="false"
  >
    <template #body>
      <UForm class="space-y-4">
        <div class="grid grid-cols-2 gap-x-4">
          <UFormField label="Label">
            <UInput v-model="clonedTask.label" />
          </UFormField>
          <UFormField label="Type">
            <USelect
              :ui="{ base: 'w-full capitalize', item: 'capitalize' }"
              :items="itemTypes"
              v-model="itemType"
            />
          </UFormField>
        </div>
        <UFormField label="Description">
          <UTextarea v-model="clonedTask.description" class="w-full" />
        </UFormField>
        <UFormField label="Progress" :hint="`${((clonedTask.progress ?? 0) * 100).toFixed(0)}%`">
          <USlider v-model="clonedTask.progress" :max="1" :step="0.01" />
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
              :placeholder="formatDurationInDays(clonedTask.startDate, clonedTask.endDate)"
            />
          </UFormField>
        </div>
        <div v-if="clonedTask.dependencies">
          <UFormField label="Dependencies">
            <!-- TODO: Make a table? & Show dependency label. -->
            <div v-for="d in clonedTask.dependencies" class="inline-flex w-full items-center gap-2">
              <span class="mr-4">
                {{ d.taskId }}
              </span>
              {{ d.type }}
              <UButton
                icon="i-lucide-x"
                size="xs"
                variant="soft"
                color="error"
                class="ml-auto"
                disabled
              />
            </div>
          </UFormField>
        </div>
      </UForm>
    </template>
    <template #footer>
      <UButton label="Cancel" class="ml-auto" variant="outline" @click="emit('close', null)" />
      <UButton label="Submit" @click="emit('close', clonedTask)" />
    </template>
  </UModal>
</template>
