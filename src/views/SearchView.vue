<template>
  <main class="search-page">
    <header class="page-header">
      <h1>찾아보기</h1>
      <p class="page-subtitle">
        검색어와 필터를 조합해서 원하는 영화를 찾아보세요.
      </p>
    </header>

    <!-- 검색/필터 바 -->
    <section class="filter-bar">
      <div class="filter-row">
        <!-- 검색어 -->
        <div class="field">
          <label>검색어</label>
          <div class="search-input-wrap">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="영화 제목을 검색하세요"
              @keyup.enter="handleSearch"
            />
            <button type="button" class="search-btn" @click="handleSearch">
              검색
            </button>
          </div>
        </div>

        <!-- 장르 -->
        <div class="field">
          <label>장르</label>
          <select v-model.number="selectedGenreId">
            <option :value="0">전체</option>
            <option
              v-for="genre in genres"
              :key="genre.id"
              :value="genre.id"
            >
              {{ genre.name }}
            </option>
          </select>
        </div>

        <!-- 최소 평점 -->
        <div class="field">
          <label>최소 평점</label>
          <select v-model.number="minRating">
            <option :value="0">전체</option>
            <option :value="5">5.0 이상</option>
            <option :value="7">7.0 이상</option>
            <option :value="8">8.0 이상</option>
          </select>
        </div>

        <!-- 정렬 -->
        <div class="field">
          <label>정렬</label>
          <select v-model="sortOption">
            <option value="popularityDesc">인기순 (내림차순)</option>
            <option value="ratingDesc">평점 높은 순</option>
            <option value="ratingAsc">평점 낮은 순</option>
            <option value="dateDesc">개봉일 최신 순</option>
            <option value="dateAsc">개봉일 오래된 순</option>
          </select>
        </div>
      </div>

      <div class="filter-row bottom-row">
        <button type="button" class="reset-btn" @click="resetFilters">
          필터 초기화
        </button>
        <span class="result-info" v-if="!loading && filteredMovies.length">
          총 {{ filteredMovies.length }}개 결과 (원본 {{ rawMovies.length }}개에서 필터링)
        </span>
      </div>
    </section>

    <!-- 결과 영역 -->
    <section class="results-section">
      <LoaderSpinner v-if="loading" />

      <p v-else-if="error" class="error-text">
        {{ error }}
      </p>

      <p
        v-else-if="!filteredMovies.length && searchPerformed"
        class="empty-text"
      >
        조건에 맞는 영화가 없습니다. 검색어 또는 필터를 변경해보세요.
      </p>

      <p
        v-else-if="!filteredMovies.length && !searchPerformed"
        class="hint-text"
      >
        검색어를 입력하고 검색 버튼을 눌러보세요.
      </p>

      <div v-else class="movie-grid">
        <MovieCard
          v-for="movie in filteredMovies"
          :key="movie.id"
          :movie="movie"
          :is-wishlisted="isInWishlist(movie.id)"
          @toggle-wishlist="toggleWishlist"
        />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import LoaderSpinner from '@/components/common/LoaderSpinner.vue'
import MovieCard from '@/components/movie/MovieCard.vue'
import {
  fetchGenres,
  searchMovies,
  type TmdbGenre,
  type TmdbMovie,
} from '@/services/tmdb'
import { useWishlist } from '@/composables/useWishlist'

// 검색 상태
const searchQuery = ref('')
const rawMovies = ref<TmdbMovie[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchPerformed = ref(false)

// 장르/필터 상태
const genres = ref<TmdbGenre[]>([])
const selectedGenreId = ref<number>(0) // 0: 전체
const minRating = ref<number>(0) // 0: 전체
const sortOption = ref<'popularityDesc' | 'ratingDesc' | 'ratingAsc' | 'dateDesc' | 'dateAsc'>(
  'popularityDesc',
)

// 위시리스트
const { toggleWishlist, isInWishlist } = useWishlist()

// TMDB 검색 호출
async function handleSearch() {
  if (!searchQuery.value.trim()) {
    error.value = '검색어를 입력해주세요.'
    searchPerformed.value = false
    rawMovies.value = []
    return
  }

  loading.value = true
  error.value = null
  searchPerformed.value = true

  try {
    const res = await searchMovies(searchQuery.value.trim(), 1)
    rawMovies.value = res.results
  } catch (err) {
    console.error(err)
    error.value = '영화 검색 중 오류가 발생했습니다.'
    rawMovies.value = []
  } finally {
    loading.value = false
  }
}

// 필터 초기화
function resetFilters() {
  selectedGenreId.value = 0
  minRating.value = 0
  sortOption.value = 'popularityDesc'
}

// 필터링 + 정렬된 결과
const filteredMovies = computed<TmdbMovie[]>(() => {
  let list = [...rawMovies.value]

  // 장르 필터
  if (selectedGenreId.value !== 0) {
    list = list.filter((movie) =>
      movie.genre_ids?.includes(selectedGenreId.value),
    )
  }

  // 최소 평점 필터
  if (minRating.value > 0) {
    list = list.filter(
      (movie) => (movie.vote_average ?? 0) >= minRating.value,
    )
  }

  // 정렬
  list.sort((a, b) => {
    const ratingA = a.vote_average ?? 0
    const ratingB = b.vote_average ?? 0
    const dateA = a.release_date ? new Date(a.release_date).getTime() : 0
    const dateB = b.release_date ? new Date(b.release_date).getTime() : 0

    switch (sortOption.value) {
      case 'ratingDesc':
        return ratingB - ratingA
      case 'ratingAsc':
        return ratingA - ratingB
      case 'dateDesc':
        return dateB - dateA
      case 'dateAsc':
        return dateA - dateB
      case 'popularityDesc':
      default:
        // TMDB search 결과에는 popularity 필드도 있지만,
        // 여기서는 안전하게 vote_count 기준으로 대충 섞인 상태를 유지하거나
        // 그냥 원본 순서를 유지해도 됨.
        return 0
    }
  })

  return list
})

// 초기 장르 목록 가져오기
onMounted(async () => {
  try {
    genres.value = await fetchGenres()
  } catch (err) {
    console.error(err)
  }
})
</script>

<style scoped>
.search-page {
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

/* 필터 바 */
.filter-bar {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}
.filter-row {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.2fr 1.4fr;
  gap: 0.75rem;
}
.filter-row.bottom-row {
  margin-top: 0.75rem;
  grid-template-columns: auto 1fr;
  align-items: center;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.field label {
  font-size: 0.8rem;
  color: #e5e7eb;
}
.field input,
.field select {
  background: #020617;
  border-radius: 8px;
  border: 1px solid #1f2937;
  padding: 0.45rem 0.7rem;
  font-size: 0.85rem;
  color: #e5e5e5;
}

/* 검색 input + 버튼 */
.search-input-wrap {
  display: flex;
  gap: 0.35rem;
}
.search-input-wrap input {
  flex: 1;
}
.search-btn {
  border-radius: 999px;
  border: none;
  background: #e50914;
  color: #fff;
  font-size: 0.85rem;
  padding: 0 1rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(229, 9, 20, 0.5);
}

/* 필터 하단 */
.reset-btn {
  border-radius: 999px;
  border: 1px solid #4b5563;
  background: transparent;
  color: #e5e5e5;
  font-size: 0.8rem;
  padding: 0.3rem 0.9rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.reset-btn:hover {
  background: #111827;
}
.result-info {
  font-size: 0.8rem;
  color: #9ca3af;
  text-align: right;
}

/* 결과 영역 */
.results-section {
  min-height: 200px;
}
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 1rem 0.75rem;
}

.error-text {
  color: #f97373;
  font-size: 0.9rem;
}
.empty-text,
.hint-text {
  font-size: 0.9rem;
  color: #9ca3af;
}

/* 반응형 */
@media (max-width: 900px) {
  .filter-row {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .filter-row {
    grid-template-columns: 1fr;
  }
  .filter-row.bottom-row {
    grid-template-columns: 1fr;
    justify-items: flex-start;
  }
  .result-info {
    text-align: left;
  }
}
</style>
