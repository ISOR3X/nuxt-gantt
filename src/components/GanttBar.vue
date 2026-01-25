<script setup lang="ts">
import { Task } from "../utils/types";

const model = defineModel<Task>();

function increment() {
  if (model.value) {
    model.value.endDate = model.value.endDate.add({days: 1})
  }
}

function decrement() {
  if (model.value) {
    model.value.startDate = model.value.startDate.subtract({days: 1})
  }
}

</script>

<template>
    <div class="bg-error z-50 rounded-md ">
        <UButton icon="i-lucide-minus" @click="decrement()"/>
        <UButton icon="i-lucide-plus" class="float-right" @click="increment()"/>
    </div>
</template>
