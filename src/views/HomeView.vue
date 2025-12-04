<!-- src/views/HomeView.vue -->
<template>
  <main class="home-page">
    <!-- 히어로 영역 (간단 배경/타이틀) -->
    <section class="hero">
      <div class="hero-overlay">
        <h1 class="hero-title">당신만의 영화 취향을 찾으세요</h1>
        <p class="hero-subtitle">
          TMDB 데이터를 기반으로 인기 영화, 최신 상영작, 장르별 추천을 한 곳에서.
        </p>
      </div>
    </section>

    <section class="section" v-for="section in sections" :key="section.key">
      <div class="section-header">
        <h2>{{ section.title }}</h2>
      </div>

      <LoaderSpinner v-if="section.loading" />
      <p v-else-if="section.error" class="error-text">
        {{ section.error }}
      </p>

      <div v-else class="movie-row">
        <MovieCard
          v-for="movie in section.movies"
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
import { onMounted, reactive } from 'vue'
import LoaderSpinner from '@/components/common/LoaderSpinner.vue'
import MovieCard from '@/components/movie/MovieCard.vue'
import {
  fetchPopularMovies,
  fetchNowPlayingMovies,
  fetchDiscoverMovies,
  type TmdbMovie,
} from '@/services/tmdb'
import { useWishlist } from '@/composables/useWishlist'

interface HomeSectionState {
  key: string
  title: string
  loading: boolean
  error: string | null
  movies: TmdbMovie[]
}

const { toggleWishlist, isInWishlist } = useWishlist()

const sections = reactive<HomeSectionState[]>([
  {
    key: 'popular',
    title: '지금 인기 있는 콘텐츠',
    loading: true,
    error: null,
    movies: [],
  },
  {
    key: 'nowPlaying',
    title: '현재 상영 중인 영화',
    loading: true,
    error: null,
    movies: [],
  },
  {
    key: 'topRated',
    title: '평점이 높은 영화',
    loading: true,
    error: null,
    movies: [],
  },
  {
    key: 'genreAction',
    title: '액션 영화 추천',
    loading: true,
    error: null,
    movies: [],
  },
])

async function loadSection(
  key: HomeSectionState['key'],
  loader: () => Promise<TmdbMovie[]>,
) {
  const section = sections.find((s) => s.key === key)
  if (!section) return

  section.loading = true
  section.error = null
  try {
    const movies = await loader()
    section.movies = movies
  } catch (err) {
    console.error(err)
    section.error = '영화 목록을 불러오지 못했습니다.'
  } finally {
    section.loading = false
  }
}

onMounted(async () => {
  await Promise.all([
    loadSection('popular', async () => {
      const res = await fetchPopularMovies(1)
      return res.results
    }),
    loadSection('nowPlaying', async () => {
      const res = await fetchNowPlayingMovies(1)
      return res.results
    }),
    // 평점 높은 영화: discover + sort_by=vote_average.desc + vote_count.gte로 필터
    loadSection('topRated', async () => {
      const res = await fetchDiscoverMovies(
        '&sort_by=vote_average.desc&vote_count.gte=500',
        1,
      )
      return res.results
    }),
    // 액션 장르: genre=28 (TMDB 고정 ID)
    loadSection('genreAction', async () => {
      const res = await fetchDiscoverMovies('&with_genres=28', 1)
      return res.results
    }),
  ])
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: radial-gradient(circle at top, #1b2838 0, #000 55%);
  color: #fff;
  padding-bottom: 3rem;
}

/* 히어로 */
.hero {
  position: relative;
  height: 280px;
  background-image: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.85),
      rgba(0, 0, 0, 0.2)
    ),
    url('https://image.tmdb.org/t/p/original/8sMmAmN2x7mBiNKEX2o0aOTozEB.jpg');
  background-size: cover;
  background-position: center;
}
.hero-overlay {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1rem;
}
.hero-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}
.hero-subtitle {
  max-width: 480px;
  color: #d1d5db;
  font-size: 0.95rem;
}

/* 섹션 */
.section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem 0;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.section-header h2 {
  font-size: 1.1rem;
}

.movie-row {
  display: flex;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}
.movie-row::-webkit-scrollbar {
  height: 6px;
}
.movie-row::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.8);
  border-radius: 999px;
}
.movie-row::-webkit-scrollbar-track {
  background: transparent;
}

.error-text {
  color: #f97373;
  font-size: 0.9rem;
}

/* 반응형 */
@media (max-width: 768px) {
  .hero {
    height: 220px;
  }
  .hero-title {
    font-size: 1.6rem;
  }
}
</style>
