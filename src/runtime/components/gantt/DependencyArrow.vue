<script lang="ts">
import { AppConfig, computed } from "vue";
import theme from "../../../theme/dependency-arrow.ts";
import { ComponentConfig } from "@nuxt/ui";
import { TaskDependencyType } from "../../types/gantt.ts";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";

type DependencyArrow = ComponentConfig<typeof theme, AppConfig, "dependencyArrow">;

export interface Arrow {
  fromId: string;
  toId: string;
  type: TaskDependencyType;
  path: string; // SVG path `d` attribute
}

export interface DependencyArrowProps {
  item: Arrow;
  class?: any;
  ui?: DependencyArrow["slots"];
}
</script>

<script lang="ts" setup>
const props = withDefaults(defineProps<DependencyArrowProps>(), {});

const appConfig = useAppConfig() as DependencyArrow["AppConfig"];

const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.dependencyArrow })({}));
</script>

<template>
  <defs>
    <marker
      id="arrowhead"
      markerWidth="8"
      markerHeight="10"
      refX="4.5"
      refY="5"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path d="M 0 0 L 5 5 L 0 10 Z" :class="ui.head({ class: props.ui?.head })" />
    </marker>
  </defs>
  <path
    :d="props.item.path"
    fill="none"
    :class="ui.path({ class: [props.ui?.path, props.class] })"
    stroke-width="1.5"
    marker-end="url(#arrowhead)"
  />
</template>
