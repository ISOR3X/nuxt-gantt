<script setup lang="ts">
import { Task } from "../utils/types";

const model = defineModel<Task>();
</script>

<template>
  <div class="flex items-center border-b border-default px-4 text-sm">
    <slot>
      {{ model?.label }}
    </slot>
  </div>
</template>
