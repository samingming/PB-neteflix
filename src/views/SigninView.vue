<!-- src/views/SigninView.vue -->
<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-tabs">
        <button
          :class="['tab-btn', mode === 'login' ? 'active' : '']"
          @click="mode = 'login'"
        >
          로그인
        </button>
        <button
          :class="['tab-btn', mode === 'register' ? 'active' : '']"
          @click="mode = 'register'"
        >
          회원가입
        </button>
      </div>

      <transition name="slide-fade" mode="out-in">
        <form
          v-if="mode === 'login'"
          key="login"
          class="auth-form"
          @submit.prevent="handleLogin"
        >
          <label>
            이메일
            <input v-model="loginEmail" type="email" required />
          </label>
          <label>
            비밀번호 (TMDB API Key)
            <input v-model="loginPassword" type="password" required />
          </label>
          <label class="remember-me">
            <input v-model="rememberMe" type="checkbox" />
            Remember me
          </label>
          <button type="submit">로그인</button>
        </form>

        <form
          v-else
          key="register"
          class="auth-form"
          @submit.prevent="handleRegister"
        >
          <label>
            이메일
            <input v-model="registerEmail" type="email" required />
          </label>
          <label>
            비밀번호 (TMDB API Key)
            <input v-model="registerPassword" type="password" required />
          </label>
          <label>
            비밀번호 확인
            <input v-model="registerPasswordConfirm" type="password" required />
          </label>
          <label class="terms">
            <input v-model="agreeTerms" type="checkbox" />
            필수 약관에 동의합니다.
          </label>
          <button type="submit">회원가입</button>
        </form>
      </transition>

      <p v-if="message" class="auth-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { tryLogin, tryRegister } from '@/services/auth'

const router = useRouter()

const mode = ref<'login' | 'register'>('login')

const loginEmail = ref('')
const loginPassword = ref('')
const rememberMe = ref(true)

const registerEmail = ref('')
const registerPassword = ref('')
const registerPasswordConfirm = ref('')
const agreeTerms = ref(false)

const message = ref('')

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function handleLogin() {
  if (!isValidEmail(loginEmail.value)) {
    message.value = '이메일 형식이 올바르지 않습니다.'
    return
  }
  tryLogin(
    loginEmail.value,
    loginPassword.value,
    () => {
      message.value = '로그인 성공!'
      router.push('/')
    },
    (err: string) => {
      message.value = err
    },
    rememberMe.value,
  )
}

function handleRegister() {
  if (!isValidEmail(registerEmail.value)) {
    message.value = '이메일 형식이 올바르지 않습니다.'
    return
  }
  if (registerPassword.value !== registerPasswordConfirm.value) {
    message.value = '비밀번호가 일치하지 않습니다.'
    return
  }
  if (!agreeTerms.value) {
    message.value = '필수 약관에 동의해야 합니다.'
    return
  }

  tryRegister(
    registerEmail.value,
    registerPassword.value,
    () => {
      message.value = '회원가입 성공! 로그인 탭으로 이동합니다.'
      mode.value = 'login'
    },
    (err: string) => {
      message.value = err
    },
  )
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  color: #fff;
}
.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: rgba(20, 20, 20, 0.9);
  border-radius: 12px;
}
.auth-tabs {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.tab-btn {
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  border: none;
  color: #bbb;
  cursor: pointer;
}
.tab-btn.active {
  color: #fff;
  border-bottom: 2px solid #e50914;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.auth-form label {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  gap: 0.25rem;
}
.auth-form input {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: none;
}
.auth-form button {
  margin-top: 0.75rem;
  padding: 0.7rem;
  border-radius: 999px;
  border: none;
  background: #e50914;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.auth-form button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(229, 9, 20, 0.5);
}
.remember-me,
.terms {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}
.auth-message {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #f5c518;
}

/* 로그인/회원가입 전환 애니메이션 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
