<template>
  <div class="page">
    <main class="popular">
      <header class="popular__header">
        <div>
          <p class="popular__eyebrow">Trending now</p>
          <h1>Popular Movies</h1>
        </div>
        <div class="popular__controls">
          <button type="button" class="popular__button" @click="refresh">
            Refresh
          </button>
        </div>
      </header>

      <LoaderSpinner v-if="isLoading" />
      <p v-else-if="error" class="popular__error">{{ error }}</p>
      <div v-else class="movie-grid">
        <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" />
      </div>

      <div class="popular__pagination">
        <button type="button" :disabled="currentPage === 1" @click="prevPage">
          Previous
        </button>
        <span>Page {{ currentPage }} / {{ totalPages }}</span>
        <button type="button" :disabled="currentPage === totalPages" @click="nextPage">
          Next
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import LoaderSpinner from '@/components/common/LoaderSpinner.vue'
import MovieCard from '@/components/movie/MovieCard.vue'
import { fetchPopularMovies } from '@/services/tmdb'
import type { TmdbMovie } from '@/services/tmdb'

const movies = ref<TmdbMovie[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const isLoading = ref(false)
const error = ref<string | null>(null)

async function loadPopular(page = currentPage.value) {
  isLoading.value = true
  error.value = null
  try {
    const response = await fetchPopularMovies(page)
    movies.value = response.results
    currentPage.value = response.page
    totalPages.value = Math.min(response.total_pages, 500)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load popular movies.'
  } finally {
    isLoading.value = false
  }
}

function nextPage() {
  if (currentPage.value >= totalPages.value) {
    return
  }
  void loadPopular(currentPage.value + 1)
}

function prevPage() {
  if (currentPage.value <= 1) {
    return
  }
  void loadPopular(currentPage.value - 1)
}

function refresh() {
  void loadPopular()
}

onMounted(() => {
  void loadPopular()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #010101;
  color: #fff;
  padding: 0 5vw 4rem;
}

.popular {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.popular__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 2rem;
}

.popular__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #8d8d8d;
  margin-bottom: 0.5rem;
}

.popular__controls {
  display: flex;
  gap: 0.5rem;
}

.popular__button {
  border-radius: 999px;
  padding: 0.6rem 1.6rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: #fff;
  cursor: pointer;
}

.popular__button:hover {
  border-color: #fff;
}

.popular__error {
  color: #ff7676;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.25rem;
}

.popular__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.popular__pagination button {
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: #fff;
  padding: 0.4rem 1.4rem;
  cursor: pointer;
}

.popular__pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
