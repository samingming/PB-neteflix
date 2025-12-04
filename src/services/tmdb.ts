// src/services/tmdb.ts
import axios, { type AxiosInstance } from 'axios'
import { getTmdbKey } from './auth'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const LANGUAGE = 'ko-KR'

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

export interface TmdbGenre {
  id: number
  name: string
}

class TmdbService {
  private readonly client: AxiosInstance
  private readonly language: string

  constructor(language = LANGUAGE) {
    this.language = language
    this.client = axios.create({
      baseURL: TMDB_BASE_URL,
    })
  }

  private getApiKeyOrThrow(): string {
    const key = getTmdbKey()
    if (!key) {
      throw new Error('TMDB API Key가 없습니다. 로그인 화면에서 다시 입력해 주세요.')
    }
    return key
  }

  private withCommonParams(path: string, page = 1): string {
    const apiKey = this.getApiKeyOrThrow()
    return `${path}?api_key=${apiKey}&language=${this.language}&page=${page}`
  }

  async fetchPopularMovies(page = 1): Promise<TmdbResponse> {
    const url = this.withCommonParams('/movie/popular', page)
    const { data } = await this.client.get<TmdbResponse>(url)
    return data
  }

  async fetchNowPlayingMovies(page = 1): Promise<TmdbResponse> {
    const url = this.withCommonParams('/movie/now_playing', page)
    const { data } = await this.client.get<TmdbResponse>(url)
    return data
  }

  async fetchDiscoverMovies(extraParams = '', page = 1): Promise<TmdbResponse> {
    const apiKey = this.getApiKeyOrThrow()
    const url = `/discover/movie?api_key=${apiKey}&language=${this.language}&page=${page}${extraParams}`
    const { data } = await this.client.get<TmdbResponse>(url)
    return data
  }

  async searchMovies(query: string, page = 1): Promise<TmdbResponse> {
    const apiKey = this.getApiKeyOrThrow()
    const url = `/search/movie?api_key=${apiKey}&language=${this.language}&page=${page}&query=${encodeURIComponent(
      query,
    )}`
    const { data } = await this.client.get<TmdbResponse>(url)
    return data
  }

  async fetchGenres(): Promise<TmdbGenre[]> {
    const apiKey = this.getApiKeyOrThrow()
    const url = `/genre/movie/list?api_key=${apiKey}&language=${this.language}`
    const { data } = await this.client.get<{ genres: TmdbGenre[] }>(url)
    return data.genres
  }
}

const tmdbService = new TmdbService()

export const fetchPopularMovies = (page = 1) => tmdbService.fetchPopularMovies(page)
export const fetchNowPlayingMovies = (page = 1) => tmdbService.fetchNowPlayingMovies(page)
export const fetchDiscoverMovies = (extraParams = '', page = 1) =>
  tmdbService.fetchDiscoverMovies(extraParams, page)
export const searchMovies = (query: string, page = 1) => tmdbService.searchMovies(query, page)
export const fetchGenres = () => tmdbService.fetchGenres()
