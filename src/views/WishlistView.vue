<template>
  <main class="wishlist-page page-shell">
    <header class="page-header">
      <p class="page-eyebrow">My Collection</p>
      <h1>위시리스트</h1>
      <p class="page-subtitle">
        관심 있는 영화를 저장해 두면 어느 기기에서든 동일한 목록을 볼 수 있어요.
      </p>
    </header>

    <section class="panel wishlist-panel">
      <p v-if="!wishlist.length" class="empty-text">
        아직 추가한 영화가 없습니다. 홈, 인기, 검색 페이지에서 마음에 드는 작품을
        <strong>Wishlist</strong> 버튼으로 저장해 보세요.
      </p>

      <div v-else class="wishlist-grid">
        <article
          v-for="movie in wishlist"
          :key="movie.id"
          class="wishlist-card"
        >
          <img
            v-if="movie.poster_path"
            :src="getPosterUrl(movie.poster_path)"
            :alt="movie.title"
            loading="lazy"
          />
          <div v-else class="wishlist-card__placeholder">No Image</div>

          <div class="wishlist-card__body">
            <div>
              <h3>{{ movie.title }}</h3>
              <p class="wishlist-card__meta">TMDB #{{ movie.id }}</p>
            </div>
            <button type="button" class="remove-btn" @click="handleRemove(movie.id)">
              제거
            </button>
          </div>
        </article>
      </div>

      <p v-if="wishlist.length" class="info-text">
        위시리스트는 브라우저 Local Storage에 저장되며 같은 브라우저에서는 자동으로 동기화됩니다.
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useWishlist } from '@/composables/useWishlist'
import type { TmdbMovie } from '@/services/tmdb'

const { wishlist, toggleWishlist } = useWishlist()

function getPosterUrl(path: string | null) {
  return path ? `https://image.tmdb.org/t/p/w300${path}` : ''
}

function handleRemove(movieId: number) {
  const movie = wishlist.value.find((item) => item.id === movieId)
  if (!movie) return

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
.wishlist-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.page-header h1 {
  margin: 0.3rem 0 0;
}

.page-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-muted);
  margin: 0;
  font-size: 0.8rem;
}

.page-subtitle {
  color: var(--color-muted);
  margin: 0.4rem 0 0;
}

.empty-text {
  margin: 1rem 0 0;
  font-size: 0.95rem;
  color: var(--color-muted);
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.wishlist-card {
  background: var(--color-card);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.wishlist-card img,
.wishlist-card__placeholder {
  width: 100%;
  height: 320px;
  object-fit: cover;
  background: #111827;
}

.wishlist-card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.wishlist-card__body {
  padding: var(--space-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.wishlist-card__body h3 {
  margin: 0;
  font-size: 1rem;
}

.wishlist-card__meta {
  margin: 0.2rem 0 0;
  font-size: 0.85rem;
  color: var(--color-muted);
}

.remove-btn {
  border-radius: 999px;
  border: none;
  background: var(--color-accent);
  color: #fff;
  font-size: 0.85rem;
  padding: 0.35rem 1.1rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  will-change: transform, box-shadow;
}

.remove-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(229, 9, 20, 0.4);
}

.info-text {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--color-muted);
}

@media (max-width: 640px) {
  .wishlist-card img,
  .wishlist-card__placeholder {
    height: 260px;
  }
}
</style>
