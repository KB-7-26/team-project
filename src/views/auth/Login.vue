<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/firebase'
import { useAuthStore } from '@/stores/auth'

defineOptions({ name: 'LoginView' })

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const authMode = ref('login')
const formErrorMessage = ref('')
const formSuccessMessage = ref('')
const invalidFields = ref({ email: false, password: false })
const isSubmitting = ref(false)
const isGoogleSubmitting = ref(false)
const isResetSending = ref(false)

const isResetMode = computed(() => authMode.value === 'reset')
const pageSubtitle = computed(() =>
  isResetMode.value ? '비밀번호 재설정 메일을 보내드릴게요' : '캠퍼스 중고거래 플랫폼',
)
const defaultFormMessage = computed(() =>
  isResetMode.value ? '가입한 이메일 주소를 입력해주세요' : '로그인하여 계속하세요',
)
const formMessage = computed(() => formErrorMessage.value || formSuccessMessage.value || defaultFormMessage.value)
const isFormError = computed(() => Boolean(formErrorMessage.value))
const isFormSuccess = computed(() => !formErrorMessage.value && Boolean(formSuccessMessage.value))
const hasFormMessage = computed(() => isFormError.value || isFormSuccess.value)
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const firebaseErrorMessages = {
  'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다',
  'auth/invalid-email': '올바른 이메일 형식이 아닙니다',
  'auth/missing-email': '이메일을 입력해주세요',
  'auth/user-disabled': '비활성화된 계정입니다',
  'auth/user-not-found': '가입된 이메일을 찾을 수 없습니다',
  'auth/popup-closed-by-user': 'Google 로그인이 취소되었습니다',
  'auth/network-request-failed': '네트워크 연결을 확인해주세요',
}

const clearError = (field) => {
  invalidFields.value[field] = false
  if (!invalidFields.value.email && !invalidFields.value.password) formErrorMessage.value = ''
  formSuccessMessage.value = ''
}

const switchToResetMode = () => {
  authMode.value = 'reset'
  password.value = ''
  invalidFields.value = { email: false, password: false }
  formErrorMessage.value = ''
  formSuccessMessage.value = ''
}

const switchToLoginMode = () => {
  authMode.value = 'login'
  invalidFields.value = { email: false, password: false }
  formErrorMessage.value = ''
  formSuccessMessage.value = ''
}

const routeAfterLogin = () => {
  if (authStore.needsProfile) {
    router.push('/signup/profile')
    return
  }

  if (authStore.needsVerification) {
    router.push('/verify-email')
    return
  }

  router.push('/')
}

const loginHandler = async () => {
  if (isSubmitting.value || isGoogleSubmitting.value || isResetSending.value) return
  formSuccessMessage.value = ''
  const isEmailEmpty = !email.value.trim()
  const isPasswordEmpty = !password.value.trim()
  invalidFields.value = { email: isEmailEmpty, password: isPasswordEmpty }
  if (isEmailEmpty && isPasswordEmpty) {
    formErrorMessage.value = '이메일과 비밀번호를 입력해주세요'
    return
  }
  if (isEmailEmpty) {
    formErrorMessage.value = '이메일을 입력해주세요'
    return
  }
  if (isPasswordEmpty) {
    formErrorMessage.value = '비밀번호를 입력해주세요'
    return
  }
  if (!emailPattern.test(email.value.trim())) {
    invalidFields.value.email = true
    formErrorMessage.value = '올바른 이메일 형식이 아닙니다'
    return
  }
  formErrorMessage.value = ''
  isSubmitting.value = true
  try {
    const credential = await signInWithEmailAndPassword(auth, email.value.trim(), password.value)
    await credential.user.getIdToken(true)
    await authStore.refreshMe()
    routeAfterLogin()
  } catch (error) {
    formErrorMessage.value = firebaseErrorMessages[error.code] || '로그인에 실패했습니다'
  } finally {
    isSubmitting.value = false
  }
}

const googleLoginHandler = async () => {
  if (isSubmitting.value || isGoogleSubmitting.value || isResetSending.value) return
  formErrorMessage.value = ''
  formSuccessMessage.value = ''
  isGoogleSubmitting.value = true
  try {
    const credential = await signInWithPopup(auth, googleProvider)
    await credential.user.getIdToken(true)
    await authStore.refreshMe()
    routeAfterLogin()
  } catch (error) {
    console.error('Google login error:', error.code, error.message)
    formErrorMessage.value = firebaseErrorMessages[error.code] || 'Google 로그인에 실패했습니다'
  } finally {
    isGoogleSubmitting.value = false
  }
}

const passwordResetHandler = async () => {
  if (isSubmitting.value || isGoogleSubmitting.value || isResetSending.value) return

  const targetEmail = email.value.trim()
  formErrorMessage.value = ''
  formSuccessMessage.value = ''

  if (!targetEmail) {
    invalidFields.value.email = true
    formErrorMessage.value = '비밀번호를 재설정할 이메일을 입력해주세요'
    return
  }

  if (!emailPattern.test(targetEmail)) {
    invalidFields.value.email = true
    formErrorMessage.value = '올바른 이메일 형식이 아닙니다'
    return
  }

  isResetSending.value = true
  try {
    await sendPasswordResetEmail(auth, targetEmail)
    formSuccessMessage.value = '비밀번호 재설정 메일을 보냈습니다.'
  } catch (error) {
    formErrorMessage.value =
      firebaseErrorMessages[error.code] || '비밀번호 재설정 메일을 보내지 못했습니다'
  } finally {
    isResetSending.value = false
  }
}

const submitHandler = () => {
  if (isResetMode.value) {
    passwordResetHandler()
    return
  }

  loginHandler()
}
</script>

<template>
  <main class="wall min-h-screen flex items-center justify-center px-6 py-16">
    <!-- SVG 필터: 찢긴 종이 가장자리 -->
    <svg style="position: absolute; width: 0; height: 0; overflow: hidden" aria-hidden="true">
      <defs>
        <filter id="torn-edge" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.048" numOctaves="4" seed="11" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>

    <!-- 포스트잇 래퍼 (전체 애니메이션 대상) -->
    <div class="note-wrapper relative w-full max-w-sm">
      <!-- 핑크 테이프 -->
      <div
        class="tape absolute z-20"
        style="
          top: -17px;
          left: 50%;
          width: 105px;
          height: 30px;
          background: rgba(242, 182, 178, 0.83);
          border-radius: 3px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.09);
          transform: translateX(-50%);
        "
      ></div>

      <!-- 파란 포스트잇 배경 (찢긴 가장자리 필터) -->
      <div
        class="absolute inset-0"
        style="background: #bdd8f2; filter: url(#torn-edge); border-radius: 4px; z-index: 0"
      ></div>

      <!-- 그림자 -->
      <div
        class="absolute inset-0"
        style="
          box-shadow:
            4px 10px 28px rgba(0, 0, 0, 0.14),
            0 2px 6px rgba(0, 0, 0, 0.07);
          border-radius: 4px;
          z-index: 0;
        "
      ></div>

      <!-- 콘텐츠 (필터 없음) -->
      <div class="relative z-10 px-9 pt-12 pb-9">
        <!-- 타이틀 -->
        <div class="mb-7">
          <h1 class="font-sketch text-5xl font-black text-ink leading-none">낙서장</h1>
          <div class="w-32 h-2.5 bg-[#ffe066]/85 mt-1 mb-2.5 rounded-sm"></div>
          <p class="text-[11px] font-bold text-ink/50">{{ pageSubtitle }}</p>
        </div>

        <!-- 에러 메시지 -->
        <div
          v-if="hasFormMessage"
          class="mb-5 px-3 py-2 text-xs font-bold rounded-xl"
          :class="isFormError ? 'text-red-700' : 'text-green-700'"
          :style="
            isFormError
              ? 'background: rgba(255, 255, 255, 0.55); border: 1px solid rgba(239, 68, 68, 0.35)'
              : 'background: rgba(255, 255, 255, 0.55); border: 1px solid rgba(22, 163, 74, 0.35)'
          "
          aria-live="polite"
          id="login-form-message"
        >
          {{ formMessage }}
        </div>

        <!-- 폼 -->
        <form class="flex flex-col gap-4" @submit.prevent="submitHandler">
          <label class="block">
            <span class="block text-[11px] font-bold text-ink/60 mb-1.5">이메일</span>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="이메일을 입력하세요"
              :aria-invalid="invalidFields.email"
              aria-describedby="login-form-message"
              class="note-input w-full rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none transition-all"
              :class="invalidFields.email ? 'input-error' : ''"
              @input="clearError('email')"
            />
          </label>

          <label v-if="!isResetMode" class="block">
            <span class="block text-[11px] font-bold text-ink/60 mb-1.5">비밀번호</span>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="비밀번호를 입력하세요"
              :aria-invalid="invalidFields.password"
              aria-describedby="login-form-message"
              class="note-input w-full rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none transition-all"
              :class="invalidFields.password ? 'input-error' : ''"
              @input="clearError('password')"
            />
          </label>

          <button
            type="submit"
            :disabled="isSubmitting || isGoogleSubmitting || isResetSending"
            class="login-btn mt-1 py-3 rounded-xl border-2 border-ink bg-[#ffe066] text-ink font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style="box-shadow: 2px 3px 0 rgba(28, 23, 18, 0.45)"
          >
            <template v-if="isResetMode">
              {{ isResetSending ? '발송 중...' : '재설정 메일 보내기' }}
            </template>
            <template v-else>
              {{ isSubmitting ? '로그인 중...' : '로그인 ✓' }}
            </template>
          </button>
        </form>

        <!-- 구분선 -->
        <div v-if="!isResetMode" class="flex items-center gap-3 my-4">
          <div class="flex-1 border-t border-ink/20"></div>
          <span class="text-[10px] font-bold text-ink/30">또는</span>
          <div class="flex-1 border-t border-ink/20"></div>
        </div>

        <!-- Google 로그인 -->
        <button
          v-if="!isResetMode"
          type="button"
          :disabled="isSubmitting || isGoogleSubmitting || isResetSending"
          class="google-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-ink transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style="background: rgba(255, 255, 255, 0.55); border: 1px solid rgba(28, 23, 18, 0.18)"
          @click="googleLoginHandler"
        >
          <span class="font-extrabold" style="color: #4285f4">G</span>
          {{ isGoogleSubmitting ? '연결 중...' : 'Google로 계속하기' }}
        </button>

        <p class="mt-5 text-center text-xs text-ink/50">
          <template v-if="isResetMode">로그인하시겠어요?</template>
          <template v-else>비밀번호를 잊으셨나요?</template>
          <button
            type="button"
            :disabled="isSubmitting || isGoogleSubmitting || isResetSending"
            class="reset-link ml-1 font-bold text-ink underline decoration-[#ffe066] decoration-2 underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="isResetMode ? switchToLoginMode() : switchToResetMode()"
          >
            {{ isResetMode ? '로그인으로 돌아가기' : '재설정 메일 받기' }}
          </button>
        </p>

        <!-- 회원가입 -->
        <p class="mt-3 text-center text-xs text-ink/50">
          계정이 없으신가요?
          <RouterLink
            to="/signup"
            class="ml-1 font-bold text-ink underline decoration-[#ffe066] decoration-2 underline-offset-2"
          >
            회원가입
          </RouterLink>
        </p>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* 크림색 벽 배경 */
.wall {
  background-color: #f0ece4;
}

/* 포스트잇이 벽에 붙으며 흔들리는 애니메이션 */
@keyframes note-stick {
  0% {
    opacity: 0;
    transform: rotate(-10deg) translateY(-44px) scale(0.9);
  }
  52% {
    opacity: 1;
    transform: rotate(1.5deg) translateY(6px) scale(1.01);
  }
  70% {
    transform: rotate(-0.8deg) translateY(-2px) scale(1);
  }
  85% {
    transform: rotate(0.4deg) translateY(0.5px);
  }
  100% {
    transform: rotate(0deg) translateY(0);
  }
}

.note-wrapper {
  animation: note-stick 0.72s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}

/* 반투명 흰 인풋 */
.note-input {
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(3px);
}
.note-input:focus {
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(28, 23, 18, 0.38);
}
.note-input.input-error {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(255, 240, 240, 0.65);
}

.login-btn:not(:disabled):hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 4px 0 rgba(28, 23, 18, 0.5) !important;
}
.login-btn:not(:disabled):active {
  transform: translate(1px, 1px);
  box-shadow: none !important;
}

.google-btn:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.82) !important;
  transform: translateY(-1px);
}

.reset-link:not(:disabled):hover {
  color: rgba(28, 23, 18, 0.72);
}
</style>
