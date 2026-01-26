<script setup lang="ts">
import { Task } from '../utils/types';

const model = defineModel<Task>()
</script>

<template>
    <div class="flex items-center px-4 border-b border-default text-sm">
        <slot>
            {{model?.label}}
        </slot>
    </div>
</template>