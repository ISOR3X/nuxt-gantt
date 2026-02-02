<script setup lang="ts">
import AppLogo from "./components/AppLogo.vue";
</script>

<template>
  <Suspense>
    <UApp>
      <UHeader>
        <template #left>
            <AppLogo class="h-6 w-auto shrink-0" />
        </template>
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
    </UApp>
  </Suspense>
</template>
