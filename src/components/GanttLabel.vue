<script setup lang="ts">
import { useCloned } from "@vueuse/core";
import { Task } from "../utils/types";
import GanttTaskModal from "./GanttTaskModal.vue";

const model = defineModel<Task>();

const overlay = useOverlay();

const modal = overlay.create(GanttTaskModal);

async function openModal() {
  const copy = useCloned(model);
  const instance = modal.open({ task: copy.cloned.value as Task });
  const updatedTask = await instance.result;

  if (updatedTask != null) {
    model.value = updatedTask;
  }
}
</script>

<template>
  <div class="group flex items-center justify-between border-b border-default px-4 text-sm">
    <slot>
      {{ model?.label }}
      <UButton
        icon="i-lucide-settings-2"
        size="xs"
        variant="ghost"
        class="hidden group-hover:block"
        title="Open task configuration"
        @click="openModal"
      />
    </slot>
  </div>
</template>
