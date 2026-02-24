<script setup lang="ts">
import { NavigationMenuItem } from "@nuxt/ui";
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppLogo from "../AppLogo.vue";

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Showcase",
    to: "/",
    active: route.path == "/",
  },
  {
    label: "Docs",
    to: "/docs",
    active: route.path == "/docs",
  },
  {
    label: "Fullscreen",
    to: "/export",
    active: route.path.endsWith("/export"),
  },
]);
</script>

<template>
  <UHeader>
    <template #left>
      <AppLogo class="h-6 w-auto shrink-0" />
    </template>
    <UNavigationMenu :items="items" />
    <template #right>
      <UColorModeButton />
      <UButton
        to="https://github.com/ISOR3X/nuxt-gantt/"
        target="_blank"
        icon="simple-icons:github"
        aria-label="GitHub"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UHeader>
  <UMain class="h-[calc(100vh-var(--ui-header-height))]">
    <RouterView />
  </UMain>
</template>
