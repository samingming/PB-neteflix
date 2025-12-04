<template>
  <main class="wishlist-page">
    <header class="page-header">
      <h1>내가 찜한 리스트</h1>
      <p class="page-subtitle">
        추천(위시리스트)에 등록한 영화들을 한 눈에 확인할 수 있습니다.
      </p>
    </header>

    <section class="content">
      <p v-if="!wishlist.length" class="empty-text">
        아직 찜한 영화가 없습니다. 홈 또는 대세 콘텐츠에서 영화를 클릭해
        추천 목록에 추가해 보세요.
      </p>

      <div v-else>
        <table class="movie-table">
          <thead>
            <tr>
              <th>#</th>
              <th>포스터</th>
              <th>제목</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(movie, index) in wishlist"
              :key="movie.id"
              class="row"
            >
              <td>{{ index + 1 }}</td>
              <td>
                <div class="thumb">
                  <img
                    v-if="movie.poster_path"
                    :src="getPosterUrl(movie.poster_path)"
                    :alt="movie.title"
                  />
                  <div v-else class="thumb-placeholder">No Image</div>
                </div>
              </td>
              <td class="title-cell">
                {{ movie.title }}
              </td>
              <td>
                <button
                  type="button"
                  class="remove-btn"
                  @click="handleRemove(movie.id)"
                >
                  찜 해제
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <p class="info-text">
          이 페이지의 데이터는 브라우저 Local Storage에 저장되어 있습니다.
          다른 페이지에서 영화를 클릭하면 이 리스트에 추가되거나 제거됩니다.
        </p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useWishlist } from '@/composables/useWishlist'

const { wishlist, toggleWishlist } = useWishlist()

function getPosterUrl(path: string | null) {
  if (!path) return ''
  return `https://image.tmdb.org/t/p/w200${path}`
}

function handleRemove(id: number) {
  const found = wishlist.value.find((m) => m.id === id)
  if (!found) return
  toggleWishlist({
    id: found.id,
    title: found.title,
    poster_path: found.poster_path,
    // toggleWishlist는 TmdbMovie 타입을 받게 되어 있어서
    // 사용하지 않는 필드는 그냥 undefined로 둬도 됨
    overview: '',
  } as any)
}
</script>

<style scoped>
.wishlist-page {
  min-height: 100vh;
  background: #000;
  color: #fff;
  padding: 1.5rem 1rem 3rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1rem;
}
.page-header h1 {
  font-size: 1.6rem;
  margin-bottom: 0.25rem;
}
.page-subtitle {
  font-size: 0.9rem;
  color: #9ca3af;
}

.content {
  margin-top: 0.5rem;
}

.empty-text {
  margin-top: 2rem;
  font-size: 0.95rem;
  color: #9ca3af;
}

/* 테이블 */
.movie-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
.movie-table th,
.movie-table td {
  padding: 0.6rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.7);
  text-align: left;
}
.movie-table th {
  font-weight: 600;
  color: #e5e5e5;
  background: rgba(15, 23, 42, 0.9);
}
.row:hover {
  background: rgba(30, 64, 175, 0.3);
}

.thumb {
  width: 50px;
  height: 75px;
  border-radius: 4px;
  overflow: hidden;
  background: #111827;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-placeholder {
  width: 100%;
  height: 100%;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}
.title-cell {
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-btn {
  border-radius: 999px;
  border: none;
  background: #e50914;
  color: #fff;
  font-size: 0.8rem;
  padding: 0.3rem 0.9rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.remove-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(229, 9, 20, 0.5);
}

.info-text {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #9ca3af;
}

/* 반응형 */
@media (max-width: 768px) {
  .movie-table th:nth-child(1),
  .movie-table td:nth-child(1) {
    display: none;
  }
}
</style>
