<template>
  <main class="popular-page page-shell">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">TMDB Highlights</p>
        <h1>인기 영화 탐색</h1>
        <p class="page-subtitle">표와 카드, 두 가지 뷰로 원하는 방식에 맞게 살펴보세요.</p>
      </div>
      <div class="view-toggle">
        <button
          type="button"
          :class="['toggle-btn', viewMode === 'table' ? 'active' : '']"
          @click="switchMode('table')"
        >
          Table View
        </button>
        <button
          type="button"
          :class="['toggle-btn', viewMode === 'infinite' ? 'active' : '']"
          @click="switchMode('infinite')"
        >
          Infinite Scroll
        </button>
      </div>
    </header>

    <section v-if="viewMode === 'table'" class="panel">
      <LoaderSpinner v-if="tableState.loading" />
      <p v-else-if="tableState.error" class="error-text">{{ tableState.error }}</p>

      <div v-else class="table-wrapper">
        <table class="movie-table">
          <thead>
            <tr>
              <th>#</th>
              <th>포스터</th>
              <th>제목</th>
              <th>평점</th>
              <th>개봉</th>
              <th>추천</th>
              <th>위시리스트</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(movie, idx) in tableState.movies"
              :key="movie.id"
              class="row-clickable"
              @click="toggleRecommendation(movie)"
            >
              <td>{{ (tableState.page - 1) * 20 + idx + 1 }}</td>
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
              <td class="title-cell">{{ movie.title }}</td>
              <td>{{ movie.vote_average?.toFixed(1) ?? '-' }}</td>
              <td>{{ movie.release_date ?? '-' }}</td>
              <td>
                <span
                  :class="[
                    'recommend-indicator',
                    isRecommended(movie.id) ? 'recommend-indicator--on' : '',
                  ]"
                >
                  {{ isRecommended(movie.id) ? '추천됨' : '추천하기' }}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  class="wishlist-chip"
                  @click.stop="toggleWishlist(movie)"
                >
                  {{ isInWishlist(movie.id) ? '해제' : '담기' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="pagination">
          <button
            type="button"
            class="page-btn"
            :disabled="tableState.page <= 1"
            @click="changeTablePage(tableState.page - 1)"
          >
            이전
          </button>
          <span class="page-info">
            {{ tableState.page }} / {{ tableState.totalPages }}
          </span>
          <button
            type="button"
            class="page-btn"
            :disabled="tableState.page >= tableState.totalPages"
            @click="changeTablePage(tableState.page + 1)"
          >
            다음
          </button>
        </div>
      </div>
    </section>

    <section v-else class="panel infinite-view">
      <div class="info-bar">
        <p>스크롤을 내리면 자동으로 다음 인기 영화가 이어집니다.</p>
      </div>

      <div class="movie-grid">
        <MovieCard
          v-for="movie in infiniteState.movies"
          :key="movie.id"
          :movie="movie"
          :is-wishlisted="isInWishlist(movie.id)"
          :is-recommended="isRecommended(movie.id)"
          @toggle-wishlist="toggleWishlist"
          @toggle-recommend="toggleRecommendation"
        />
      </div>

      <LoaderSpinner v-if="infiniteState.loading" />
      <p v-else-if="infiniteState.error" class="error-text">{{ infiniteState.error }}</p>
      <p v-else-if="infiniteState.isEnd" class="end-text">
        모든 인기 목록을 확인했습니다!
      </p>

      <button
        v-if="showTopButton"
        class="top-btn"
        type="button"
        @click="scrollToTop"
      >
        Top
      </button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, ref } from 'vue'
import LoaderSpinner from '@/components/common/LoaderSpinner.vue'
import MovieCard from '@/components/movie/MovieCard.vue'
import { fetchPopularMovies, type TmdbMovie } from '@/services/tmdb'
import { useWishlist } from '@/composables/useWishlist'
import { useRecommendations } from '@/composables/useRecommendations'

type ViewMode = 'table' | 'infinite'

const viewMode = ref<ViewMode>('table')
const { toggleWishlist, isInWishlist } = useWishlist()
const { toggleRecommendation, isRecommended } = useRecommendations()

interface TableState {
  page: number
  totalPages: number
  movies: TmdbMovie[]
  loading: boolean
  error: string | null
}

const tableState = reactive<TableState>({
  page: 1,
  totalPages: 1,
  movies: [],
  loading: true,
  error: null,
})

interface InfiniteState {
  page: number
  totalPages: number
  movies: TmdbMovie[]
  loading: boolean
  error: string | null
  isEnd: boolean
}

const infiniteState = reactive<InfiniteState>({
  page: 1,
  totalPages: 1,
  movies: [],
  loading: false,
  error: null,
  isEnd: false,
})

const showTopButton = ref(false)

function getPosterUrl(path: string) {
  return `https://image.tmdb.org/t/p/w200${path}`
}

async function loadTablePage(page: number) {
  tableState.loading = true
  tableState.error = null
  try {
    const res = await fetchPopularMovies(page)
    tableState.movies = res.results
    tableState.page = res.page
    tableState.totalPages = Math.min(res.total_pages, 500)
  } catch (err) {
    console.error(err)
    tableState.error = '인기 영화를 불러오지 못했습니다.'
  } finally {
    tableState.loading = false
  }
}

function changeTablePage(page: number) {
  if (page < 1 || page > tableState.totalPages) return
  void loadTablePage(page)
}

async function loadMoreInfinite() {
  if (infiniteState.loading || infiniteState.isEnd) return

  infiniteState.loading = true
  infiniteState.error = null
  try {
    const nextPage = infiniteState.page + (infiniteState.movies.length ? 1 : 0)
    const res = await fetchPopularMovies(nextPage)
    infiniteState.page = res.page
    infiniteState.totalPages = res.total_pages

    if (res.results.length === 0 || res.page >= res.total_pages) {
      infiniteState.isEnd = true
    }

    infiniteState.movies.push(...res.results)
  } catch (err) {
    console.error(err)
    infiniteState.error = '다음 영화를 불러오지 못했습니다.'
  } finally {
    infiniteState.loading = false
  }
}

function switchMode(mode: ViewMode) {
  viewMode.value = mode

  if (mode === 'table' && tableState.movies.length === 0 && !tableState.loading) {
    void loadTablePage(1)
  }
  if (
    mode === 'infinite' &&
    infiniteState.movies.length === 0 &&
    !infiniteState.loading
  ) {
    void loadMoreInfinite()
  }
}

function onScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0
  const viewportHeight = window.innerHeight
  const fullHeight = document.documentElement.scrollHeight
  const preloadGap = Math.max(400, viewportHeight * 0.5)

  showTopButton.value = scrollTop > 300

  if (viewMode.value === 'infinite' && scrollTop + viewportHeight >= fullHeight - preloadGap) {
    void loadMoreInfinite()
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  await Promise.all([loadTablePage(1), loadMoreInfinite()])
  window.addEventListener('scroll', onScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.popular-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.page-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-muted);
  margin: 0 0 0.3rem;
  font-size: 0.8rem;
}

.page-header h1 {
  margin: 0;
}

.page-subtitle {
  color: var(--color-muted);
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.toggle-btn {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  background: transparent;
  color: #e5e5e5;
  font-size: 0.85rem;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
  will-change: background-color, color, transform;
}

.toggle-btn.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.table-wrapper {
  overflow-x: auto;
}

.movie-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  min-width: 640px;
}

.movie-table th,
.movie-table td {
  padding: 0.75rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.6);
  text-align: left;
}

.movie-table th {
  font-weight: 600;
  color: #e5e5e5;
  background: rgba(15, 23, 42, 0.8);
}

[data-theme='light'] .movie-table th {
  color: #0f172a;
  background: rgba(226, 232, 240, 0.9);
}

.row-clickable {
  cursor: pointer;
}

.row-clickable:hover {
  background: rgba(30, 64, 175, 0.3);
}

.thumb {
  width: 54px;
  height: 80px;
  border-radius: 6px;
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
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recommend-indicator {
  font-size: 0.85rem;
  color: #9ca3af;
}

.recommend-indicator--on {
  color: #facc15;
}

.wishlist-chip {
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: #e5e5e5;
  padding: 0.2rem 0.8rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.wishlist-chip:hover {
  background: rgba(255, 255, 255, 0.1);
}

[data-theme='light'] .wishlist-chip {
  color: #0f172a;
  border-color: rgba(15, 23, 42, 0.3);
}

.pagination {
  margin-top: 0.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
}

.page-btn {
  border-radius: 999px;
  border: none;
  background: #1f2937;
  color: #e5e5e5;
  padding: 0.35rem 1.1rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  will-change: background-color;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.info-bar {
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: var(--color-muted);
}

.top-btn {
  position: fixed;
  right: 1.2rem;
  bottom: 1.5rem;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: none;
  background: rgba(15, 23, 42, 0.9);
  color: #e5e5e5;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  will-change: transform, box-shadow;
}

.top-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.9);
}

.error-text {
  margin-top: 0.75rem;
  color: #f97373;
  font-size: 0.9rem;
}

.end-text {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: var(--color-muted);
}

@media (max-width: 720px) {
  .view-toggle {
    width: 100%;
  }

  .view-toggle .toggle-btn {
    flex: 1;
  }
}
</style>
