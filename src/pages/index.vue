<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef } from "vue";
import { Temporal } from "temporal-polyfill";
import { Task } from "../utils/types";
import { daysBetween, isBetween } from "../utils/temporal";

const scrollArea = useTemplateRef("scrollArea");

const pixelsWidth = ref(120);
const pixelsHeight = ref(40);

const visibleDates = computed<Temporal.PlainDate[]>(() => {
    const indexes: number[] =
        scrollArea.value?.virtualizer?.getVirtualIndexes() ?? [];
    return indexes.map((i) => items.value[i].date);
});

const taskBarMeta = computed(() => {
    // We search in reverse so the ganttbar that uses this is draw latest, so if we have borders they are drawn under.
    // Additionally, we offset the end date by one so we can draw the drag handles a bit outside of the container.
    const meta = tasks.value.map((t) => {
        const date = visibleDates.value.findLast((d) => {
            return isBetween(t.startDate, t.endDate.add({ days: 1 }), d);
        });
        if (date) {
            return {
                endDate: date,
                span: daysBetween(date, t.startDate),
            };
        }
    });
    return meta;
});

const _tasks: Task[] = [
    {
        id: "0",
        label: "Do task",
        startDate: Temporal.Now.plainDateISO(),
        endDate: Temporal.Now.plainDateISO(),
    },
    {
        id: "1",
        label: "Do other task",
        startDate: Temporal.Now.plainDateISO().subtract({ days: 2 }),
        endDate: Temporal.Now.plainDateISO().add({ days: 50 }),
    },
    {
        id: "2",
        label: "Do another task",
        startDate: Temporal.Now.plainDateISO().subtract({ days: 5 }),
        endDate: Temporal.Now.plainDateISO().subtract({ days: 3 }),
    },
];
const tasks = ref(Array.from({ length: 1 }, () => _tasks).flat());

const now = Temporal.Now.plainDateISO();
const startDate = now.subtract({ years: 1 });
const endDate = now.add({ years: 1 });
const totalDays = startDate.until(endDate).total("days");

const items = computed<any[]>(() =>
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

onMounted(() => {
    nextTick(() => {
        scrollToDate(Temporal.Now.plainDateISO());
    });
});
</script>

<template>
    <div class="grid grid-cols-[20rem_1fr]">
        <div>
            <div
                class="flex h-8 items-center justify-center border border-muted"
            >
                Tasks
            </div>
            <div
                v-for="t in tasks"
                class="flex items-center justify-center border border-muted"
                :style="{ height: `${pixelsHeight}px` }"
            >
                {{ t.endDate }}
            </div>
        </div>
        <UScrollArea
            v-slot="{ item, index }"
            :items="items"
            ref="scrollArea"
            orientation="horizontal"
            class="h-full"
            @scroll=""
            :virtualize="{ estimateSize: pixelsWidth }"
        >
            <div
                class="flex items-center justify-center border border-muted h-8"
                :style="{
                    width: `${pixelsWidth}px`,
                }"
            >
                {{ item.date.toPlainMonthDay() }}
            </div>
            <div v-for="(_, i) in tasks">
                <div
                    class="border-l border-muted relative"
                    :style="{ height: `${pixelsHeight}px` }"
                >
                    <GanttBar
                        v-model="tasks[i]"
                        v-if="
                            taskBarMeta[i] !== undefined &&
                            taskBarMeta[i].endDate == item.date
                        "
                        class="absolute top-0 bottom-0 right-0 my-1"
                        :style="{
                            width:
    (taskBarMeta[i].span) * pixelsWidth + 'px',
                                right: pixelsWidth + 'px'
                        }"
                        :pixels-width="pixelsWidth"
                    />
                </div>
            </div>
        </UScrollArea>
    </div>
    <UCard :ui="{ body: 'flex gap-4'}" class="absolute bottom-4 left-4 ">
        <UButton
            label="Scroll to today"
            @click="scrollToDate(Temporal.Now.plainDateISO())"
        />
        <UFormField label="Height" orientation="horizontal" class="w-32">
            <UInput v-model="pixelsHeight" type="number"/>
        </UFormField>
        <UFormField label="Width" orientation="horizontal" class="w-32">
            <UInput v-model="pixelsWidth" type="number"/>
        </UFormField>
    </UCard>
</template>

<style>
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: var(--ui-bg-inverted);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--ui-bg-inverted);
}

* {
    scrollbar-width: thin;
    scrollbar-color: var(--ui-bg-inverted) transparent;
}
</style>
