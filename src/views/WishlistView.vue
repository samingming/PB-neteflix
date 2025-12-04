<template>
  <div class="page">
    <main class="wishlist">
      <header class="wishlist__header">
        <div>
          <p class="wishlist__eyebrow">Your collection</p>
          <h1>Wishlist</h1>
          <p class="wishlist__count">{{ wishlist.length }} movie(s) saved</p>
        </div>
      </header>

      <p v-if="wishlist.length === 0" class="wishlist__empty">
        Save movies from the home, popular, or search pages to build your personal watchlist.
      </p>
      <div v-else class="wishlist__grid">
        <article v-for="movie in wishlist" :key="movie.id" class="wishlist-card">
          <img
            v-if="movie.poster_path"
            :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
            :alt="movie.title"
            loading="lazy"
            width="180"
            height="270"
          />
          <div v-else class="wishlist-card__placeholder">No Image</div>
          <div class="wishlist-card__body">
            <h3>{{ movie.title }}</h3>
            <button type="button" @click="remove(movie.id)">Remove</button>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useWishlist } from '@/composables/useWishlist'
import type { TmdbMovie } from '@/services/tmdb'

const { wishlist, toggleWishlist } = useWishlist()

function remove(movieId: number) {
  const movie = wishlist.value.find((item) => item.id === movieId)
  if (!movie) {
    return
  }
  const payload: TmdbMovie = {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    overview: '',
  }
  toggleWishlist(payload)
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #010101;
  color: #fff;
  padding: 0 5vw 4rem;
}

.wishlist {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-top: 2rem;
}

.wishlist__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #8d8d8d;
}

.wishlist__count {
  color: #b5b5b5;
}

.wishlist__empty {
  color: #9d9d9d;
}

.wishlist__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.wishlist-card {
  background: rgba(20, 20, 20, 0.75);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
}

.wishlist-card img,
.wishlist-card__placeholder {
  width: 100%;
  height: 280px;
  object-fit: cover;
}

.wishlist-card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2c2c2c, #1a1a1a);
  color: #888;
  font-size: 0.85rem;
}

.wishlist-card__body {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.wishlist-card__body button {
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: #fff;
  padding: 0.4rem 1.2rem;
  cursor: pointer;
}
</style>
