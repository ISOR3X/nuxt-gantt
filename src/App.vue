<script setup lang="ts">
import AppLogo from "./components/AppLogo.vue";
</script>

<template>
  <Suspense>
    <UApp>
      <UHeader>
        <template #left>
          <RouterLink to="/">
            <AppLogo class="h-6 w-auto shrink-0" />
          </RouterLink>
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
      <UMain class="flex flex-col">
        <RouterView />
      </UMain>
    </UApp>
  </Suspense>
</template>
