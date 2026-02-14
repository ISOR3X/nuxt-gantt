<script lang="ts">
// This component copies the styling from Nuxt UI tooltip since that is what it is used for, except we can't use it how regular tooltips are used.
import theme from "#build/ui/tooltip";
import { ComponentConfig } from "@nuxt/ui";
import { tv } from "@nuxt/ui/runtime/utils/tv.js";
import { AppConfig, computed } from "vue";

type Label = ComponentConfig<typeof theme, AppConfig, "tooltip">;

export interface LabelProps {
  class?: any;
  ui?: Label["slots"];
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<LabelProps>(), {});
const appConfig = useAppConfig() as Label["AppConfig"];

const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.tooltip })({}));
</script>

<template>
  <span :class="ui.content({ class: [props.ui?.content, props.class] })">
    <slot />
  </span>
</template>
