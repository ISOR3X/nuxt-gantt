<script setup lang="ts">
import { CommandPaletteGroup, CommandPaletteItem } from "@nuxt/ui";
import { ref } from "vue";

const searchTerm = ref("");
const open = ref(false);

const emit = defineEmits<{
  itemSelect: [id: CommandPaletteItem];
}>();

const props = withDefaults(
  defineProps<{
    groups: CommandPaletteGroup[];
    label: string;
    icon?: string;
  }>(),
  {},
);

function emitSelect(i: CommandPaletteItem) {
  open.value = false;
  emit("itemSelect", i);
}

function openModal() {
  open.value = true;
}

defineExpose({
  open: openModal,
});
</script>

<template>
  <UModal v-model:open="open">
    <slot>
      <UButton :label="props.label" :icon="props.icon" />
    </slot>
    <template #content>
      <UCommandPalette
        v-model:search-term="searchTerm"
        :groups="props.groups"
        :placeholder="props.label"
        class="h-80"
        @update:model-value="emitSelect"
      />
    </template>
  </UModal>
</template>
