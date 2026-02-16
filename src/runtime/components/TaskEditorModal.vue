<script setup lang="ts">
import { computed, ref } from "vue";
import { Task, TaskDependencyType } from "../types/gantt";
import { cloneTask } from "../utils/common";
import { formatDurationInDays } from "../utils/temporal";
import UDatePicker from "./UDatePicker.vue";
import UHoldButton from "./UHoldButton.vue";

const props = defineProps<{
  item: Task;
  itemMap?: Map<string, Task>;
}>();

const emit = defineEmits<{
  close: [payload: { task?: Task; mode?: "copy" | "delete" }];
}>();

const toast = useToast();

const clonedTask = ref<Task>(cloneTask(props.item));
const itemTypes = ref(["task", "milestone"]);
const itemMapAsLabelKey = computed(() => {
  const arr: { label: string; id: string }[] = [];
  if (props.itemMap) {
    for (const t of props.itemMap) arr.push({ id: t[0], label: t[1].label });
    return arr;
  }
});
const depTypeAsLabelKey = ref<{ label: string; id: TaskDependencyType }[]>([
  {
    label: "Start to finish",
    id: "SF",
  },
  {
    label: "Start to start",
    id: "SS",
  },
  {
    label: "Finish to start",
    id: "FS",
  },
  {
    label: "Finish to finish",
    id: "FF",
  },
]);

function deleteDep(idx: number) {
  clonedTask.value.dependencies?.splice(idx, 1);
}

const bufferedDep = computed({
  get: () => "Add dependency",
  set: (value) => {
    clonedTask.value.dependencies?.push({
      taskId: value,
      type: "SF",
    });
  },
});

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
</script>

<template>
  <UModal
    title="Task configuration"
    description="Edit the task configuration. Cancelling will revert all made changes."
    :close="false"
    :dismissible="false"
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
          <UFormField label="Dependencies" :ui="{ container: 'space-y-2' }">
            <!-- TODO: Make a table? & Show dependency label. -->
            <div
              v-for="(_, idx) in clonedTask.dependencies"
              class="inline-flex w-full items-center gap-2"
            >
              <USelectMenu
                v-model="clonedTask.dependencies[idx].taskId"
                value-key="id"
                variant="soft"
                :items="itemMapAsLabelKey"
                class="w-48 grow"
              />
              <USelectMenu
                v-model="clonedTask.dependencies[idx].type"
                value-key="id"
                :items="depTypeAsLabelKey"
                variant="soft"
                class="w-48"
              />
              <UHoldButton
                icon="i-lucide-x"
                variant="subtle"
                class="ml-auto"
                @click:complete="deleteDep(idx)"
              />
            </div>
            <USelectMenu
              v-model="bufferedDep"
              value-key="id"
              variant="subtle"
              :items="itemMapAsLabelKey"
              class="w-40"
            />
          </UFormField>
        </div>
      </UForm>
    </template>
    <template #footer>
      <UHoldButton
        label="Delete task"
        variant="subtle"
        @click:complete="emit('close', { task: undefined, mode: 'delete' })"
      />
      <UButton
        label="Cancel"
        class="ml-auto"
        variant="subtle"
        @click="emit('close', { task: undefined, mode: 'copy' })"
      />
      <UButton label="Submit" @click="emit('close', { task: clonedTask, mode: 'copy' })" />
    </template>
  </UModal>
</template>
