<script setup lang="ts">
import { CommandPaletteItem } from "@nuxt/ui";
import { computed, ref } from "vue";

const searchTerm = ref("");
const open = ref(false);

const emit = defineEmits<{
  itemSelect: [id: CommandPaletteItem];
}>();
const props = defineProps<{
  items: { label: string; id: string }[];
}>();

const groups = computed(() => [
  {
    id: "tasks",
    label: "Tasks",
    items: props.items,
  },
]);

function emitSelect(i: CommandPaletteItem) {
  open.value = false;
  emit("itemSelect", i);
}
</script>

<template>
  <UModal v-model:open="open">
    <UButton label="Scroll to task..." icon="i-lucide-search" />
    <template #content>
      <UCommandPalette
        v-model:search-term="searchTerm"
        @update:model-value="emitSelect"
        :groups="groups"
        placeholder="Search tasks..."
        class="h-80"
      />
    </template>
  </UModal>
</template>
