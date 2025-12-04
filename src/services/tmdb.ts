// src/services/tmdb.ts
import axios from 'axios'
import { getTmdbKey } from './auth'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const LANGUAGE = 'ko-KR'

const client = axios.create({
  baseURL: TMDB_BASE_URL,
})

function getApiKeyOrThrow(): string {
  const key = getTmdbKey()
  if (!key) {
    throw new Error('TMDB API 키가 없습니다. 먼저 로그인/회원가입을 완료하세요.')
  }
  return key
}

// 공통 파라미터가 포함된 URL 생성
function withCommonParams(path: string, page = 1): string {
  const apiKey = getApiKeyOrThrow()
  const url = `${path}?api_key=${apiKey}&language=${LANGUAGE}&page=${page}`
  return url
}

// 기본 영화 타입 (간단 버전)
export interface TmdbMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  vote_average?: number
  release_date?: string
  genre_ids?: number[]
}

export interface TmdbResponse {
  page: number
  results: TmdbMovie[]
  total_pages: number
}

// 인기 영화
export async function fetchPopularMovies(page = 1): Promise<TmdbResponse> {
  const url = withCommonParams('/movie/popular', page)
  const { data } = await client.get<TmdbResponse>(url)
  return data
}

// 현재 상영작
export async function fetchNowPlayingMovies(page = 1): Promise<TmdbResponse> {
  const url = withCommonParams('/movie/now_playing', page)
  const { data } = await client.get<TmdbResponse>(url)
  return data
}

// discover(장르 등)
export async function fetchDiscoverMovies(extraParams = '', page = 1): Promise<TmdbResponse> {
  const apiKey = getApiKeyOrThrow()
  const url = `/discover/movie?api_key=${apiKey}&language=${LANGUAGE}&page=${page}${extraParams}`
  const { data } = await client.get<TmdbResponse>(url)
  return data
}

// 검색
export async function searchMovies(query: string, page = 1): Promise<TmdbResponse> {
  const apiKey = getApiKeyOrThrow()
  const url = `/search/movie?api_key=${apiKey}&language=${LANGUAGE}&page=${page}&query=${encodeURIComponent(
    query,
  )}`
  const { data } = await client.get<TmdbResponse>(url)
  return data
}

export interface TmdbGenre {
  id: number
  name: string
}

export async function fetchGenres(): Promise<TmdbGenre[]> {
  const apiKey = getApiKeyOrThrow()
  const url = `/genre/movie/list?api_key=${apiKey}&language=${LANGUAGE}`
  const { data } = await client.get<{ genres: TmdbGenre[] }>(url)
  return data.genres
}
