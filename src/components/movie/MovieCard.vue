<!-- src/components/movie/MovieCard.vue -->
<template>
  <article
    class="movie-card"
    :class="{ 'movie-card--wish': isWishlisted }"
    @click="onClick"
  >
    <div class="poster-wrap">
      <img
        v-if="posterUrl"
        :src="posterUrl"
        :alt="movie.title"
        loading="lazy"
      />
      <div v-else class="poster-placeholder">No Image</div>
    </div>
    <div class="movie-info">
      <h3 class="title">{{ movie.title }}</h3>
      <p v-if="movie.vote_average" class="meta">⭐ {{ movie.vote_average.toFixed(1) }}</p>
      <p v-if="movie.release_date" class="meta">{{ movie.release_date }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TmdbMovie } from '@/services/tmdb'

const props = defineProps<{
  movie: TmdbMovie
  isWishlisted?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-wishlist', movie: TmdbMovie): void
}>()

const posterUrl = computed(() =>
  props.movie.poster_path ? `https://image.tmdb.org/t/p/w500${props.movie.poster_path}` : null,
)

function onClick() {
  emit('toggle-wishlist', props.movie)
}
</script>

<style scoped>
.movie-card {
  position: relative;
  width: 100%;
  min-width: 140px;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border-radius: 1rem;
}

.poster-wrap {
  border-radius: 1rem;
  overflow: hidden;
  background: #111827;
  aspect-ratio: 2 / 3;
}

.poster-wrap img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.movie-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.45);
}

.movie-card:hover img {
  transform: scale(1.05);
}

.movie-info {
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: #e5e5e5;
}

.title {
  font-size: 0.9rem;
  margin-bottom: 0.1rem;
}

.meta {
  font-size: 0.75rem;
  color: #9ca3af;
}

.movie-card--wish::after {
  content: 'WL';
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-accent);
  color: #fff;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(229, 9, 20, 0.35);
}

@media (max-width: 640px) {
  .movie-card {
    min-width: unset;
  }
}
</style>
