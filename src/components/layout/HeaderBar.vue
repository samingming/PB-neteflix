<template>
  <header class="head-bar">
    <div class="head-bar__brand" role="banner" @click="goHome">
      PB-neteflix
    </div>
    <nav class="head-bar__nav" aria-label="Primary navigation">
      <RouterLink class="head-bar__link" to="/">Home</RouterLink>
      <RouterLink class="head-bar__link" to="/popular">Popular</RouterLink>
      <RouterLink class="head-bar__link" to="/search">Search</RouterLink>
      <RouterLink class="head-bar__link" to="/wishlist">Wishlist</RouterLink>
    </nav>
    <div class="head-bar__actions">
      <span v-if="isAuthenticated" class="head-bar__user">
        {{ userId }}
      </span>
      <button
        v-if="isAuthenticated"
        type="button"
        class="head-bar__button head-bar__button--ghost"
        @click="handleLogout"
      >
        Logout
      </button>
      <button
        v-else
        type="button"
        class="head-bar__button"
        @click="handleSignIn"
      >
        Sign In
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { getCurrentUserId, logout } from '@/services/auth'

const router = useRouter()
const userId = ref<string | null>(getCurrentUserId())

const isAuthenticated = computed(() => userId.value !== null)

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    userId.value = getCurrentUserId()
  },
  { immediate: true },
)

function goHome() {
  router.push('/')
}

function handleSignIn() {
  router.push('/signin')
}

function handleLogout() {
  logout()
  userId.value = null
  router.push('/signin')
}
</script>

<style scoped>
.head-bar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0));
}

.head-bar__brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: #e50914;
  cursor: pointer;
  letter-spacing: 0.08em;
}

.head-bar__nav {
  display: flex;
  gap: 1.25rem;
  flex: 1;
}

.head-bar__link {
  color: #b5b5b5;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.head-bar__link.router-link-active {
  color: #fff;
}

.head-bar__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.head-bar__user {
  font-size: 0.85rem;
  color: #b0b0b0;
}

.head-bar__button {
  background: #e50914;
  border: none;
  border-radius: 999px;
  color: #fff;
  font-weight: 600;
  padding: 0.45rem 1.2rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.head-bar__button:hover {
  opacity: 0.85;
}

.head-bar__button--ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .head-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .head-bar__nav {
    flex-wrap: wrap;
  }
}
</style>
