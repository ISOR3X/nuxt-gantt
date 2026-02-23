<script setup lang="ts">
import { computed } from "vue";
import { Color } from "../utils/common";

const item = defineModel<Color>({ default: "primary" });

function bgFromColor(color: Color) {
  return { backgroundColor: `var(--ui-${color})` };
}
const chip = computed(() => bgFromColor(item.value));
const config = useAppConfig();
const allColors = computed(() => Object.keys(config.ui.colors));
</script>

<template>
  <UPopover :ui="{ content: 'grid grid-cols-4 gap-2' }">
    <UButton :label="item" color="neutral" variant="outline" class="w-full capitalize">
      <template #leading>
        <span :style="chip" class="size-3 rounded-full" />
      </template>
    </UButton>

    <template #content>
      <div
        v-for="color in allColors"
        class="size-6 rounded-full hover:opacity-75"
        :key="color"
        :style="bgFromColor(color)"
        :title="color"
        @click="item = color"
      />
    </template>
  </UPopover>
</template>
