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
  props.movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${props.movie.poster_path}`
    : null,
)

function onClick() {
  emit('toggle-wishlist', props.movie)
}
</script>

<style scoped>
.movie-card {
  position: relative;
  width: 140px;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  margin-right: 0.75rem;
}
.poster-wrap {
  border-radius: 8px;
  overflow: hidden;
  background: #222;
}
.poster-wrap img {
  display: block;
  width: 100%;
  height: 210px;
  object-fit: cover;
  transition: transform 0.25s ease;
}
.poster-placeholder {
  width: 100%;
  height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  font-size: 0.8rem;
}

.movie-card:hover {
  transform: translateY(-6px) scale(1.05);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.8);
}
.movie-card:hover img {
  transform: scale(1.08);
}

.movie-info {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: #e5e5e5;
}
.title {
  font-size: 0.8rem;
  margin-bottom: 0.1rem;
}
.meta {
  font-size: 0.7rem;
  color: #aaa;
}

/* 추천된 영화 스타일 */
.movie-card--wish::after {
  content: '★';
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e50914;
  color: #fff;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.movie-card--wish {
  outline: 2px solid #e50914;
}
</style>
