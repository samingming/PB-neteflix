<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- /signin 페이지가 아니면 헤더 표시 -->
    <HeaderBar v-if="showHeader" />

    <RouterView v-slot="{ Component }">
      <transition name="route-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HeaderBar from '@/components/layout/HeaderBar.vue'

const route = useRoute()

const showHeader = computed(() => route.name !== 'signin')
</script>

<style>
.route-fade-enter-active,
.route-fade-leave-active {
  transition: opacity 0.3s ease;
}
.route-fade-enter-from,
.route-fade-leave-to {
  opacity: 0;
}
</style>
