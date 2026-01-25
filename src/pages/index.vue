<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import { Temporal } from "temporal-polyfill";
import { Task } from "../utils/types";

const scrollArea = useTemplateRef("scrollArea");

const workDays = [2, 3, 4, 5];

const tasks: Task[] = [
    {
        id: "0",
        label: "label",
        startDate: Temporal.Now.plainDateISO(),
        endDate: Temporal.Now.plainDateISO(),
    },
];

const now = Temporal.Now.plainDateISO();
const startDate = now.subtract({ years: 1 });
const endDate = now.add({ years: 1 });
const totalDays = startDate.until(endDate).total("days");

const items = computed(() =>
    Array.from({ length: totalDays + 1 }, (_, i) => {
        const date = startDate.add({ days: i });
        return {
            id: i + 1,
            date: date,
            title: date.toString(),
            description: date.toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
        };
    }),
);

function scrollToDate(date: Temporal.PlainDate) {
    const idx = items.value.findIndex(
        (d) => d.date.toLocaleString() == date.toLocaleString(),
    );
    scrollArea.value?.virtualizer?.scrollToIndex(idx, {
        align: "start",
        behavior: "auto",
    });
}
</script>

<template>
    <UButton label="today" @click="scrollToDate(now)" />
    <div class="grid grid-cols-[20rem_1fr]">
        <div>
            <div v-for="t in tasks">
                {{ t.startDate }}
            </div>
        </div>
        <UScrollArea
            v-slot="{ item, index }"
            :items="items"
            ref="scrollArea"
            orientation="horizontal"
            class="h-14"
            :virtualize="{ estimateSize: 244 }"
        >
            <div class="w-32 border flex justify-center border-muted">
                {{ item.date.toLocaleString() }}
            </div>
        </UScrollArea>
    </div>
</template>
