<template>
  <main class="popular-page">
    <header class="page-header">
      <h1>대세 콘텐츠</h1>

      <div class="view-toggle">
        <button
          :class="['toggle-btn', viewMode === 'table' ? 'active' : '']"
          @click="switchMode('table')"
        >
          Table View
        </button>
        <button
          :class="['toggle-btn', viewMode === 'infinite' ? 'active' : '']"
          @click="switchMode('infinite')"
        >
          Infinite Scroll
        </button>
      </div>
    </header>

    <!-- Table View -->
    <section v-if="viewMode === 'table'" class="table-view">
      <LoaderSpinner v-if="tableState.loading" />
      <p v-else-if="tableState.error" class="error-text">{{ tableState.error }}</p>

      <div v-else>
        <table class="movie-table">
          <thead>
            <tr>
              <th>#</th>
              <th>포스터</th>
              <th>제목</th>
              <th>평점</th>
              <th>개봉일</th>
              <th>추천</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(movie, idx) in tableState.movies"
              :key="movie.id"
              @click="toggleWishlist(movie)"
              class="row-clickable"
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
              <td class="title-cell">
                {{ movie.title }}
              </td>
              <td>{{ movie.vote_average?.toFixed(1) ?? '-' }}</td>
              <td>{{ movie.release_date ?? '-' }}</td>
              <td>
                <span
                  :class="[
                    'wish-indicator',
                    isInWishlist(movie.id) ? 'wish-indicator--on' : '',
                  ]"
                >
                  {{ isInWishlist(movie.id) ? '★' : '☆' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="pagination">
          <button
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
            class="page-btn"
            :disabled="tableState.page >= tableState.totalPages"
            @click="changeTablePage(tableState.page + 1)"
          >
            다음
          </button>
        </div>
      </div>
    </section>

    <!-- Infinite Scroll View -->
    <section v-else class="infinite-view">
      <div class="info-bar">
        <p>스크롤을 내려 더 많은 대세 콘텐츠를 확인해보세요 👀</p>
      </div>

      <div class="movie-grid">
        <MovieCard
          v-for="movie in infiniteState.movies"
          :key="movie.id"
          :movie="movie"
          :is-wishlisted="isInWishlist(movie.id)"
          @toggle-wishlist="toggleWishlist"
        />
      </div>

      <LoaderSpinner v-if="infiniteState.loading" />
      <p v-else-if="infiniteState.error" class="error-text">
        {{ infiniteState.error }}
      </p>
      <p v-else-if="infiniteState.isEnd" class="end-text">
        모든 대세 콘텐츠를 다 불러왔어요 🎉
      </p>

      <button
        v-if="showTopButton"
        class="top-btn"
        type="button"
        @click="scrollToTop"
      >
        ↑ Top
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

type ViewMode = 'table' | 'infinite'

const viewMode = ref<ViewMode>('table')

const { toggleWishlist, isInWishlist } = useWishlist()

// ------- Table View 상태 -------
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

// ------- Infinite View 상태 -------
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
  loading: true,
  error: null,
  isEnd: false,
})

const showTopButton = ref(false)

// ------- 공통 함수 -------
function getPosterUrl(path: string) {
  return `https://image.tmdb.org/t/p/w200${path}`
}

// Table View 데이터 로드
async function loadTablePage(page: number) {
  tableState.loading = true
  tableState.error = null
  try {
    const res = await fetchPopularMovies(page)
    tableState.movies = res.results
    tableState.page = res.page
    tableState.totalPages = res.total_pages
  } catch (err) {
    console.error(err)
    tableState.error = '대세 콘텐츠를 불러오지 못했습니다.'
  } finally {
    tableState.loading = false
  }
}

// 페이지 변경
function changeTablePage(page: number) {
  if (page < 1 || page > tableState.totalPages) return
  loadTablePage(page)
}

// Infinite View 데이터 로드
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
    infiniteState.error = '대세 콘텐츠를 불러오지 못했습니다.'
  } finally {
    infiniteState.loading = false
  }
}

function switchMode(mode: ViewMode) {
  viewMode.value = mode

  // 모드 전환 시 첫 로딩이 안 되어 있으면 로딩
  if (mode === 'table' && tableState.movies.length === 0 && !tableState.loading) {
    loadTablePage(1)
  }
  if (
    mode === 'infinite' &&
    infiniteState.movies.length === 0 &&
    !infiniteState.loading
  ) {
    loadMoreInfinite()
  }
}

// 스크롤 핸들러 (무한 스크롤 + Top 버튼)
function onScroll() {
  const scrollTop =
    window.pageYOffset || document.documentElement.scrollTop || 0
  const viewportHeight = window.innerHeight
  const fullHeight = document.documentElement.scrollHeight

  showTopButton.value = scrollTop > 300

  if (viewMode.value === 'infinite') {
    if (scrollTop + viewportHeight >= fullHeight - 200) {
      loadMoreInfinite()
    }
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 초기 로딩
onMounted(async () => {
  // 기본: table 1페이지, infinite 첫 페이지
  await Promise.all([loadTablePage(1), loadMoreInfinite()])
  window.addEventListener('scroll', onScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.popular-page {
  min-height: 100vh;
  background: #000;
  color: #fff;
  padding: 1.5rem 1rem 3rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.page-header h1 {
  font-size: 1.6rem;
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
}
.toggle-btn.active {
  background: #e50914;
  border-color: #e50914;
  color: #fff;
}
.toggle-btn:hover {
  transform: translateY(-1px);
}

/* ------- Table View ------- */
.table-view {
  margin-top: 0.5rem;
}
.movie-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.movie-table th,
.movie-table td {
  padding: 0.5rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.7);
  text-align: left;
}
.movie-table th {
  font-weight: 600;
  color: #e5e5e5;
  background: rgba(15, 23, 42, 0.8);
}
.row-clickable {
  cursor: pointer;
}
.row-clickable:hover {
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

.wish-indicator {
  font-size: 1.1rem;
  color: #9ca3af;
}
.wish-indicator--on {
  color: #facc15;
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
  padding: 0.3rem 0.9rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.page-btn:not(:disabled):hover {
  background: #374151;
}
.page-info {
  font-size: 0.85rem;
}

/* ------- Infinite View ------- */
.infinite-view {
  margin-top: 0.5rem;
}
.info-bar {
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: #9ca3af;
}
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 1rem 0.75rem;
}

/* Top 버튼 */
.top-btn {
  position: fixed;
  right: 1.2rem;
  bottom: 1.5rem;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: none;
  background: rgba(15, 23, 42, 0.9);
  color: #e5e5e5;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
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
  color: #9ca3af;
}

/* 반응형 */
@media (max-width: 768px) {
  .page-header {
    align-items: flex-start;
  }
  .movie-table th:nth-child(1),
  .movie-table td:nth-child(1),
  .movie-table th:nth-child(4),
  .movie-table td:nth-child(4),
  .movie-table th:nth-child(5),
  .movie-table td:nth-child(5) {
    display: none;
  }
}
</style>
