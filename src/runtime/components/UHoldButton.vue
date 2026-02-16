<script setup lang="ts">
import { useHoldAction } from "../composables/useHoldAction";

const props = defineProps<{
  label: string;
}>();

const emit = defineEmits<{
  onComplete: [];
}>();

const { progress, start, cancel } = useHoldAction({
  duration: 1000,
  onComplete: () => {
    emit("onComplete");
  },
  onCancel: () => {
    console.log("Delete cancelled");
  },
});
</script>

<template>
  <UButton
    @mousedown="start"
    @mouseup="cancel"
    @mouseleave="cancel"
    @touchstart="start"
    @touchend="cancel"
    @touchcancel="cancel"
    class="relative overflow-clip"
    color="error"
    variant="subtle"
  >
    <span class="z-10">
      {{ props.label }}
    </span>
    <div class="absolute left-0 z-0 h-full bg-error/50" :style="{ width: `${progress * 100}%` }" />
  </UButton>
</template>
