// src/services/auth.ts
import type { User } from '@/types/user'

const USERS_KEY = 'users'
const TMDB_KEY = 'TMDb-Key'
const CURRENT_USER_KEY = 'currentUser'
const KEEP_LOGIN_KEY = 'keepLogin'

function getUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY)
  return raw ? (JSON.parse(raw) as User[]) : []
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

/**
 * 회원가입
 */
export function tryRegister(
  email: string,
  password: string,
  success: (user: User) => void,
  fail: (msg: string) => void,
) {
  const users = getUsers()

  const userExists = users.some((u) => u.id === email)
  if (userExists) {
    fail('이미 존재하는 이메일입니다.')
    return
  }

  const newUser: User = { id: email, password }
  users.push(newUser)
  saveUsers(users)
  // 비밀번호 = TMDB API Key 를 로컬스토리지에 저장
  localStorage.setItem(TMDB_KEY, password)

  success(newUser)
}

/**
 * 로그인
 */
export function tryLogin(
  email: string,
  password: string,
  success: (user: User) => void,
  fail: (msg: string) => void,
  saveToken: boolean,
) {
  const users = getUsers()
  const user = users.find((u) => u.id === email && u.password === password)

  if (!user) {
    fail('이메일 또는 비밀번호가 올바르지 않습니다.')
    return
  }

  // TMDb-Key 저장 (API 호출용)
  localStorage.setItem(TMDB_KEY, user.password)
  localStorage.setItem(CURRENT_USER_KEY, user.id)

  // keep login
  if (saveToken) {
    localStorage.setItem(KEEP_LOGIN_KEY, 'true')
  } else {
    localStorage.removeItem(KEEP_LOGIN_KEY)
  }

  success(user)
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY)
  // TMDb-Key는 과제 요구에 따라 유지/삭제 선택 가능 (원하면 유지)
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY)
}

export function getTmdbKey(): string | null {
  return localStorage.getItem(TMDB_KEY)
}
