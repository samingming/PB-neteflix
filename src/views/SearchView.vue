<template>
  <div class="page">
    <main class="search">
      <header class="search__header">
        <div>
          <p class="search__eyebrow">Find anything</p>
          <h1>Search Movies</h1>
        </div>
        <form class="search__form" @submit.prevent="handleSearch">
          <input
            v-model="query"
            type="search"
            placeholder="Search by title, keyword, or genre..."
            aria-label="Search movies"
          />
          <button type="submit">Search</button>
        </form>
      </header>

      <LoaderSpinner v-if="isSearching" />
      <p v-else-if="error" class="search__error">{{ error }}</p>
      <p v-else-if="hasSearched && !results.length" class="search__empty">
        No movies matched your search.
      </p>
      <div v-else class="movie-grid">
        <MovieCard v-for="movie in results" :key="movie.id" :movie="movie" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import LoaderSpinner from '@/components/common/LoaderSpinner.vue'
import MovieCard from '@/components/movie/MovieCard.vue'
import { searchMovies } from '@/services/tmdb'
import type { TmdbMovie } from '@/services/tmdb'

const query = ref('')
const results = ref<TmdbMovie[]>([])
const isSearching = ref(false)
const error = ref<string | null>(null)
const hasSearched = ref(false)

async function handleSearch() {
  if (!query.value.trim()) {
    error.value = 'Enter a movie title to start searching.'
    return
  }
  isSearching.value = true
  error.value = null
  try {
    const response = await searchMovies(query.value.trim())
    results.value = response.results
    hasSearched.value = true
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Search failed.'
  } finally {
    isSearching.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #020202;
  color: #fff;
  padding: 0 5vw 4rem;
}

.search {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.search__header {
  padding-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #8d8d8d;
  margin: 0;
}

.search__form {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.search__form input {
  flex: 1;
  min-width: 250px;
  padding: 0.85rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.search__form button {
  border-radius: 999px;
  background: #e50914;
  border: none;
  color: #fff;
  padding: 0.85rem 1.6rem;
  font-weight: 600;
  cursor: pointer;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.search__error {
  color: #ff7070;
}

.search__empty {
  color: #9d9d9d;
}
</style>
