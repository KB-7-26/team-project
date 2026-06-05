<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { ChatBubbleLeftRightIcon, CheckBadgeIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'
import { auth, googleProvider } from '@/firebase'
import { useAuthStore } from '@/stores/auth'

defineOptions({
  name: 'LoginView',
})

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const defaultFormMessage = '로그인하여 계속하세요'
const formErrorMessage = ref('')
const invalidFields = ref({
  email: false,
  password: false,
})
const isSubmitting = ref(false)
const isGoogleSubmitting = ref(false)

const formMessage = computed(() => formErrorMessage.value || defaultFormMessage)
const isFormError = computed(() => Boolean(formErrorMessage.value))
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const firebaseErrorMessages = {
  'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다',
  'auth/invalid-email': '올바른 이메일 형식이 아닙니다',
  'auth/user-disabled': '비활성화된 계정입니다',
  'auth/popup-closed-by-user': 'Google 로그인이 취소되었습니다',
  'auth/network-request-failed': '네트워크 연결을 확인해주세요',
}

const features = [
  {
    icon: ShieldCheckIcon,
    title: '학생 인증 시스템',
    description: '검증된 학생들과만 안전하게 거래하세요',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: '실시간 채팅',
    description: '빠르고 편리한 소통으로 거래 완성',
  },
  {
    icon: CheckBadgeIcon,
    title: '익명 게시판',
    description: '자유로운 소통과 정보 공유 공간',
  },
]

const clearError = (field) => {
  if (field === 'email') {
    invalidFields.value.email = false
  }

  if (field === 'password') {
    invalidFields.value.password = false
  }

  if (!invalidFields.value.email && !invalidFields.value.password) {
    formErrorMessage.value = ''
  }
}

const routeAfterLogin = () => {
  if (authStore.needsProfile) {
    router.push('/signup/profile')
    return
  }
  router.push('/')
}

const loginHandler = async () => {
  if (isSubmitting.value) {
    return
  }

  const isEmailEmpty = !email.value.trim()
  const isPasswordEmpty = !password.value.trim()

  invalidFields.value = {
    email: isEmailEmpty,
    password: isPasswordEmpty,
  }

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
  if (isGoogleSubmitting.value) {
    return
  }

  formErrorMessage.value = ''
  isGoogleSubmitting.value = true

  try {
    const credential = await signInWithPopup(auth, googleProvider)
    await credential.user.getIdToken(true)
    await authStore.refreshMe()
    routeAfterLogin()
  } catch (error) {
    formErrorMessage.value = firebaseErrorMessages[error.code] || 'Google 로그인에 실패했습니다'
  } finally {
    isGoogleSubmitting.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-sub-bg lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <section class="bg-hero-gradient px-6 py-14 sm:px-10 lg:flex lg:min-h-screen lg:items-center lg:px-16 xl:px-24">
      <div class="mx-auto w-full max-w-2xl">
        <div class="max-w-xl">
          <h1 class="text-4xl font-extrabold leading-tight text-text-main sm:text-5xl lg:text-6xl">
            안전한 중고거래,<br />
            Swap과 함께
          </h1>
          <p class="mt-8 text-xl font-medium text-text-hover sm:text-2xl">학생 인증 기반 중고거래 플랫폼</p>
        </div>

        <ul class="mt-16 flex flex-col gap-8 sm:mt-20">
          <li v-for="feature in features" :key="feature.title" class="flex items-center gap-6">
            <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/90 sm:h-18 sm:w-18">
              <component :is="feature.icon" class="h-8 w-8 text-primary" />
              <!-- 컴포넌트를 동적으로 바인딩 -->
            </div>
            <div>
              <h2 class="text-xl font-extrabold text-text-main sm:text-2xl">{{ feature.title }}</h2>
              <p class="mt-2 text-base font-medium text-text-hover sm:text-lg">{{ feature.description }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section class="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
      <div
        class="w-full max-w-xl rounded-[28px] bg-white px-7 py-10 shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:px-12 sm:py-14"
      >
        <!-- 추후 아이콘 및 서비스명 확정되면 수정 필요! (로그인 페이지는 TopNavBar를 사용하지 않으므로 직접 지정할 필요가 있음) -->
        <RouterLink to="/" class="inline-flex items-center gap-4">
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-2xl font-extrabold text-white"
          >
            K
          </div>
          <strong class="text-3xl font-extrabold text-text-main">KB Swap</strong>
        </RouterLink>

        <p
          id="login-form-message"
          class="mt-9 text-lg font-medium"
          :class="isFormError ? 'text-red-500' : 'text-text-sub'"
          aria-live="polite"
        >
          {{ formMessage }}
        </p>

        <form class="mt-10 flex flex-col gap-7" @submit.prevent="loginHandler">
          <label class="block">
            <span class="text-lg font-extrabold text-text-main">이메일</span>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="이메일을 입력하세요"
              :aria-invalid="invalidFields.email"
              aria-describedby="login-form-message"
              class="mt-4 h-17 w-full rounded-2xl border bg-white px-6 text-lg font-medium text-text-main outline-none transition focus:ring-4"
              :class="
                invalidFields.email
                  ? 'border-red-500 placeholder:text-red-500 focus:border-red-500 focus:ring-red-500/15'
                  : 'border-border placeholder:text-text-sub focus:border-primary focus:ring-primary/15'
              "
              @input="clearError('email')"
            />
          </label>

          <label class="block">
            <span class="text-lg font-extrabold text-text-main">비밀번호</span>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="비밀번호를 입력하세요"
              :aria-invalid="invalidFields.password"
              aria-describedby="login-form-message"
              class="mt-4 h-17 w-full rounded-2xl border bg-white px-6 text-lg font-medium text-text-main outline-none transition focus:ring-4"
              :class="
                invalidFields.password
                  ? 'border-red-500 placeholder:text-red-500 focus:border-red-500 focus:ring-red-500/15'
                  : 'border-border placeholder:text-text-sub focus:border-primary focus:ring-primary/15'
              "
              @input="clearError('password')"
            />
          </label>

          <button
            type="submit"
            :disabled="isSubmitting || isGoogleSubmitting"
            class="mt-6 h-17 rounded-2xl bg-primary text-xl font-extrabold text-white transition hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary/60"
          >
            {{ isSubmitting ? '로그인 중...' : '이메일로 로그인' }}
          </button>
        </form>

        <button
          type="button"
          :disabled="isSubmitting || isGoogleSubmitting"
          class="mt-5 flex h-16 w-full items-center justify-center gap-3 rounded-2xl border border-border bg-white text-lg font-extrabold text-text-main transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          @click="googleLoginHandler"
        >
          <span class="text-xl font-extrabold text-primary">G</span>
          {{ isGoogleSubmitting ? 'Google 로그인 중...' : 'Google로 계속하기' }}
        </button>

        <p class="mt-10 text-center text-base font-medium text-text-sub sm:text-lg">
          계정이 없으신가요?
          <RouterLink to="/signup" class="ml-2 font-extrabold text-primary hover:text-primary-hover">이메일로 가입하기</RouterLink>
        </p>

        <div class="mt-10 border-t border-border pt-9 text-center text-base font-medium text-text-sub">
          KB 인증 기반 안전 거래 서비스
        </div>
      </div>
    </section>
  </main>
</template>
