<template>
  <header class="head-bar">
    <div class="head-bar__inner page-shell">
      <button class="head-bar__brand" type="button" @click="goHome">
        PB<span>neteflix</span>
      </button>

      <button
        class="head-bar__menu"
        type="button"
        :aria-expanded="isMenuOpen"
        aria-label="Toggle navigation"
        @click="toggleMenu"
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        class="head-bar__nav"
        :class="{ 'head-bar__nav--open': isMenuOpen }"
        aria-label="Primary navigation"
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          class="head-bar__link"
          :to="item.to"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="head-bar__actions" :class="{ 'head-bar__actions--open': isMenuOpen }">
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
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { getCurrentUserId, logout } from '@/services/auth'

const router = useRouter()
const userId = ref<string | null>(getCurrentUserId())
const isMenuOpen = ref(false)

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/popular', label: 'Popular' },
  { to: '/search', label: 'Search' },
  { to: '/wishlist', label: 'Wishlist' },
]

const isAuthenticated = computed(() => userId.value !== null)

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    userId.value = getCurrentUserId()
    isMenuOpen.value = false
  },
  { immediate: true },
)

function goHome() {
  router.push('/')
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
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
  z-index: 30;
  background: linear-gradient(180deg, rgba(3, 7, 18, 0.85), rgba(3, 7, 18, 0.2));
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.head-bar__inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
}

.head-bar__brand {
  display: inline-flex;
  align-items: baseline;
  gap: 0.15rem;
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--color-accent);
  background: transparent;
  border: none;
  cursor: pointer;
  letter-spacing: 0.06em;
}

.head-bar__brand span {
  color: #fff;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
}

.head-bar__menu {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 0.3rem;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.head-bar__menu span {
  display: block;
  width: 1.35rem;
  height: 2px;
  background: #fff;
  margin: 0 auto;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.head-bar__nav {
  display: flex;
  gap: 1.25rem;
  justify-content: flex-end;
}

.head-bar__link {
  color: #d1d5db;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  position: relative;
}

.head-bar__link.router-link-active::after,
.head-bar__link:hover::after {
  width: 100%;
}

.head-bar__link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.35rem;
  width: 0;
  height: 2px;
  background: var(--color-accent);
  transition: width 0.2s ease;
}

.head-bar__actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.head-bar__user {
  font-size: 0.85rem;
  color: var(--color-muted);
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.head-bar__button {
  background: var(--color-accent);
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
  border: 1px solid rgba(255, 255, 255, 0.4);
}

@media (max-width: 900px) {
  .head-bar__inner {
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;
  }

  .head-bar__nav,
  .head-bar__actions {
    grid-column: 1 / -1;
    width: 100%;
  }

  .head-bar__nav {
    justify-content: flex-start;
  }
}

@media (max-width: 720px) {
  .head-bar__inner {
    grid-template-columns: auto auto;
  }

  .head-bar__menu {
    display: inline-flex;
    justify-self: end;
  }

  .head-bar__nav,
  .head-bar__actions {
    display: none;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    background: rgba(3, 7, 18, 0.95);
    padding: 0.75rem 0;
    border-radius: 0.75rem;
    margin-top: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
  }

  .head-bar__nav--open,
  .head-bar__actions--open {
    display: flex;
  }

  .head-bar__actions {
    gap: 0.4rem;
  }

  .head-bar__user {
    max-width: none;
  }
}
</style>
