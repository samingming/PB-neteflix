<template>
  <div class="auth-page">
    <!-- 움직이는 별 배경 -->
    <div class="starfield">
  <span
    v-for="n in 100"
    :key="n"
    class="star"
    :class="[
      n % 3 === 0 ? 'star--near' : n % 2 === 0 ? 'star--mid' : 'star--far'
    ]"
    :style="{
      top: Math.random() * 100 + 'vh',
      left: Math.random() * 100 + 'vw',
      animationDelay: Math.random() * 5 + 's'
    }"
  ></span>
</div>


    <div class="auth-card">
      <!-- 상단 탭/타이틀 영역 -->
      <div class="auth-header-row">
        <button
          type="button"
          class="mode-chip mode-chip--login"
          :class="{ active: mode === 'login' }"
          @click="mode = 'login'"
        >
          LOGIN
        </button>

        <div class="auth-title">
          {{ mode === 'login' ? '로그인' : '회원가입' }}
        </div>

        <button
          type="button"
          class="mode-chip mode-chip--signup"
          :class="{ active: mode === 'register' }"
          @click="mode = 'register'"
        >
          회원가입
        </button>
      </div>

      <!-- 폼 전환 애니메이션 -->
      <transition name="slide-fade" mode="out-in">
        <form
          v-if="mode === 'login'"
          key="login"
          class="auth-form"
          @submit.prevent="handleLogin"
        >
          <div class="field">
            <label for="login-email">아이디</label>
            <input
              id="login-email"
              v-model="loginEmail"
              type="email"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>
          <div class="field">
            <label for="login-password">비밀번호 (TMDB API Key)</label>
            <input
              id="login-password"
              v-model="loginPassword"
              type="password"
              placeholder="TMDB API 키를 입력하세요"
              required
            />
          </div>

          <div class="form-row">
            <label class="remember-toggle">
              <input v-model="rememberMe" type="checkbox" />
              <span>자동 로그인</span>
            </label>
          </div>

          <button type="submit" class="cta-button">로그인</button>
        </form>

        <form
          v-else
          key="register"
          class="auth-form"
          @submit.prevent="handleRegister"
        >
          <div class="field">
            <label for="register-email">아이디 (이메일)</label>
            <input
              id="register-email"
              v-model="registerEmail"
              type="email"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>
          <div class="field">
            <label for="register-password">비밀번호 (TMDB API Key)</label>
            <input
              id="register-password"
              v-model="registerPassword"
              type="password"
              placeholder="TMDB API 키를 입력하세요"
              required
            />
          </div>
          <div class="field">
            <label for="register-password-confirm">비밀번호 확인</label>
            <input
              id="register-password-confirm"
              v-model="registerPasswordConfirm"
              type="password"
              placeholder="다시 한 번 입력하세요"
              required
            />
          </div>

          <label class="terms">
            <input v-model="agreeTerms" type="checkbox" />
            <span>이용 약관 및 개인정보 제공에 동의합니다.</span>
          </label>

          <button type="submit" class="cta-button cta-button--signup">
            회원가입
          </button>
        </form>
      </transition>

      <p v-if="message" class="auth-message">{{ message }}</p>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getRememberedEmail,
  isKeepLoginEnabled,
  tryLogin,
  tryRegister,
} from '@/services/auth'

const router = useRouter()

const mode = ref<'login' | 'register'>('login')

const loginEmail = ref(getRememberedEmail() ?? '')
const loginPassword = ref('')
const rememberMe = ref(isKeepLoginEnabled())

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
    message.value = '올바른 이메일 주소를 입력해 주세요.'
    return
  }
  tryLogin(
    loginEmail.value,
    loginPassword.value,
    () => {
      message.value = '로그인 완료! 홈으로 이동합니다.'
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
    message.value = '올바른 이메일 주소를 입력해 주세요.'
    return
  }
  if (registerPassword.value !== registerPasswordConfirm.value) {
    message.value = '비밀번호가 일치하지 않습니다.'
    return
  }
  if (!agreeTerms.value) {
    message.value = '약관과 개인정보 제공에 동의해 주세요.'
    return
  }

  tryRegister(
    registerEmail.value,
    registerPassword.value,
    () => {
      message.value = '회원가입이 완료되었습니다. 로그인해 주세요.'
      mode.value = 'login'
      loginEmail.value = registerEmail.value
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
  padding: 2rem 0;
  background: #000;
  color: #fff;
  overflow: hidden;
  position: relative;
}

/* === 강력한 우주 스타필드 === */
.starfield {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #000;
  z-index: 0;
  pointer-events: none;
}

/* 공통 별 스타일 */
.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  opacity: 0.8;
  animation-name: drift;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

/* 먼 별: 작고 아주 느리게 */
.star--far {
  width: 1px;
  height: 1px;
  opacity: 0.4;
  animation-duration: 90s; /* 느리게 */
}

/* 중간 별 */
.star--mid {
  width: 2px;
  height: 2px;
  opacity: 0.7;
  animation-duration: 50s;
}

/* 가까운 별: 약간 더 빠르지만 여전히 느리게 */
.star--near {
  width: 3px;
  height: 3px;
  opacity: 0.9;
  animation-duration: 30s;
}

/* 👉 살짝 왼쪽으로만 이동하는 애니메이션 */
@keyframes drift {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(-40vw, 0, 0); /* 화면 너비의 40% 정도만 왼쪽으로 */
  }
}


/* === 카드 === */
.auth-card {
  position: relative;
  width: min(420px, 100% - 2.5rem);
  padding: 2.2rem 1.8rem 2.4rem;
  background: radial-gradient(circle at top left, #070f25 0, #02040c 55%, #02030a 100%);
  border-radius: 1.8rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.9),
    0 0 0 1px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(18px);
  z-index: 1;
}

/* === 상단 LOGIN / 제목 / 회원가입 === */
.auth-header-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  column-gap: 0.75rem;
  margin-bottom: 2rem;
}

.auth-title {
  text-align: center;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.mode-chip {
  position: relative;
  border-radius: 999px;
  padding: 0.35rem 0.95rem;
  border: none;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  font-weight: 700;
  cursor: pointer;
  background: transparent;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
  box-shadow: inset 0 0 0 1px rgba(229, 9, 20, 0.35);
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease,
    color 0.2s ease;
}

/* LOGIN 쪽은 동그란 느낌 */
.mode-chip--login {
  padding-inline: 0.9rem;
}

/* 회원가입 버튼은 약간 더 길게 */
.mode-chip--signup {
  padding-inline: 1.05rem;
}

.mode-chip.active {
  background: radial-gradient(circle at 20% 0%, #ff646c, #e50914 55%, #a0030b 95%);
  color: #fff;
  box-shadow:
    0 0 14px rgba(229, 9, 20, 0.65),
    0 12px 20px rgba(72, 5, 7, 0.85);
  transform: translateY(-1px);
}

/* === 폼 === */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field label {
  font-size: 0.86rem;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.02em;
}

.field input {
  border-radius: 0.95rem;
  border: 1px solid rgba(110, 148, 210, 0.6);
  background: radial-gradient(circle at top left, #05091a, #030511);
  color: #fff;
  padding: 0.8rem 1rem;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.field input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.field input:focus {
  border-color: #e50914;
  box-shadow:
    0 0 0 1px rgba(229, 9, 20, 0.45),
    0 0 22px rgba(229, 9, 20, 0.35);
  background: radial-gradient(circle at top left, #060c24, #050817);
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
  margin-top: 0.25rem;
}

.remember-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.78);
}

.remember-toggle input {
  accent-color: #e50914;
}

.terms {
  display: flex;
  gap: 0.5rem;
  font-size: 0.8rem;
  align-items: center;
  color: rgba(255, 255, 255, 0.78);
}

.terms input {
  accent-color: #e50914;
}

/* === 메인 CTA 버튼 === */
.cta-button {
  margin-top: 0.75rem;
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 0.9rem 1.2rem;
  font-weight: 700;
  font-size: 0.98rem;
  letter-spacing: 0.16em;
  text-align: center;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, #a0040c, #e50914, #7b0308);
  box-shadow:
    0 18px 38px rgba(78, 5, 8, 0.85),
    0 0 0 1px rgba(229, 9, 20, 0.4);
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}

.cta-button--signup {
  background: linear-gradient(135deg, #a0040c, #e50914, #7b0308);
}

.cta-button:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
  box-shadow:
    0 22px 40px rgba(86, 6, 10, 0.9),
    0 0 0 1px rgba(229, 9, 20, 0.6);
}

/* 메시지 */
.auth-message {
  margin-top: 1.2rem;
  text-align: center;
  font-size: 0.86rem;
  color: #f5c518;
}

/* 폼 전환 애니메이션 그대로 유지 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.35s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(18px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-18px);
}

/* 모바일 튜닝 */
@media (max-width: 520px) {
  .auth-card {
    width: calc(100% - 1.5rem);
    padding: 1.9rem 1.4rem 2.1rem;
  }

  .auth-header-row {
    column-gap: 0.5rem;
  }

  .auth-title {
    font-size: 1.05rem;
  }

  .form-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }
}

</style>
