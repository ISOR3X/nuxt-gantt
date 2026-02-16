<script lang="ts">
import { ButtonProps as UButtonProps } from "@nuxt/ui";

export interface ButtonProps extends Omit<UButtonProps, "color"> {
  duration?: number;
}
</script>

<script setup lang="ts">
import { useHoldAction } from "../composables/useHoldAction";

const props = withDefaults(defineProps<ButtonProps>(), {
  duration: 500,
});

const emit = defineEmits<{
  "click:complete": [];
}>();

const { progress, start, cancel } = useHoldAction({
  duration: props.duration,
  onComplete: () => {
    emit("click:complete");
  },
});
</script>

<template>
  <UButton
    color="error"
    class="relative"
    v-bind="props"
    @mousedown="start"
    @mouseup="cancel"
    @mouseleave="cancel"
    @touchstart="start"
    @touchend="cancel"
    @touchcancel="cancel"
  >
    <template #trailing>
      <div
        class="absolute left-0 z-0 h-full bg-error/50"
        :style="{ width: `${progress * 100}%` }"
      />
    </template>
  </UButton>
</template>
