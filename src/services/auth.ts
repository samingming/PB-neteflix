// src/services/auth.ts
import type { User } from '@/types/user'

const USERS_KEY = 'users'
const CURRENT_USER_KEY = 'currentUser'
const KEEP_LOGIN_KEY = 'keepLogin'
const TMDB_KEY_STORAGE = 'TMDb-Key'

function getUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY)
  return raw ? (JSON.parse(raw) as User[]) : []
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function tryRegister(
  email: string,
  password: string,
  success: (user: User) => void,
  fail: (msg: string) => void,
) {
  const users = getUsers()

  const userExists = users.some((u) => u.id === email)
  if (userExists) {
    fail('이미 등록된 이메일입니다.')
    return
  }

  const newUser: User = { id: email, password }
  users.push(newUser)
  saveUsers(users)
  localStorage.setItem(TMDB_KEY_STORAGE, password)

  success(newUser)
}

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

  localStorage.setItem(TMDB_KEY_STORAGE, user.password)
  localStorage.setItem(CURRENT_USER_KEY, user.id)

  if (saveToken) {
    localStorage.setItem(KEEP_LOGIN_KEY, 'true')
  } else {
    localStorage.removeItem(KEEP_LOGIN_KEY)
  }

  success(user)
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY)
  // TMDB 키는 사용자가 다시 로그인할 때까지 유지
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY)
}

export function getStoredTmdbKey(): string | null {
  return localStorage.getItem(TMDB_KEY_STORAGE)
}
