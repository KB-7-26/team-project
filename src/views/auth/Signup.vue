<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { auth } from '@/firebase'
import { useAuthStore } from '@/stores/auth'

defineOptions({
  name: 'SignupView',
})

const router = useRouter()
const authStore = useAuthStore()
const defaultFormMessage = '회원 정보를 입력해주세요'
const formErrorMessage = ref('')
const isSubmitting = ref(false)
const signupForm = ref({
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',
  nickname: '',
  gender: '',
  cohort: '',
})
const invalidFields = ref({
  email: false,
  password: false,
  passwordConfirm: false,
  name: false,
  nickname: false,
  gender: false,
  cohort: false,
})

const requiredFields = ['email', 'password', 'passwordConfirm', 'name', 'nickname', 'gender', 'cohort']
const emptyMessages = {
  email: '이메일을 입력해주세요',
  password: '비밀번호를 입력해주세요',
  passwordConfirm: '비밀번호 확인을 입력해주세요',
  name: '이름을 입력해주세요',
  nickname: '닉네임을 입력해주세요',
  gender: '성별을 선택해주세요',
  cohort: '회차를 선택해주세요',
}

const firebaseErrorMessages = {
  'auth/email-already-in-use': '이미 가입된 이메일입니다',
  'auth/invalid-email': '올바른 이메일 형식이 아닙니다',
  'auth/weak-password': '비밀번호는 6자 이상 입력해주세요',
  'auth/network-request-failed': '네트워크 연결을 확인해주세요',
}

const formMessage = computed(() => formErrorMessage.value || defaultFormMessage)
const isFormError = computed(() => Boolean(formErrorMessage.value))
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const cohortOptions = [
  '21회차 전공',
  '22회차 전공',
  '23회차 전공',
  '24회차 비전공',
  '25회차 전공',
  '26회차 전공',
  '27회차 전공',
  '28회차 비전공',
  '29회차 전공',
  '30회차 비전공',
]

const clearError = (field) => {
  invalidFields.value[field] = false
  if (Object.values(invalidFields.value).every((isInvalid) => !isInvalid)) {
    formErrorMessage.value = ''
  }
}

const signupHandler = async () => {
  if (isSubmitting.value) return

  const nextInvalidFields = requiredFields.reduce((result, field) => {
    result[field] = !String(signupForm.value[field]).trim()
    return result
  }, {})
  const emptyFields = requiredFields.filter((field) => nextInvalidFields[field])
  invalidFields.value = nextInvalidFields

  if (emptyFields.length > 1) {
    formErrorMessage.value = '필수 정보를 모두 입력해주세요'
    return
  }
  if (emptyFields.length === 1) {
    formErrorMessage.value = emptyMessages[emptyFields[0]]
    return
  }
  if (!emailPattern.test(signupForm.value.email.trim())) {
    invalidFields.value = { ...nextInvalidFields, email: true }
    formErrorMessage.value = '올바른 이메일 형식이 아닙니다'
    return
  }
  if (signupForm.value.password.length < 8) {
    invalidFields.value = { ...nextInvalidFields, password: true }
    formErrorMessage.value = '비밀번호는 8자 이상 입력해주세요'
    return
  }
  if (signupForm.value.password !== signupForm.value.passwordConfirm) {
    invalidFields.value = { ...nextInvalidFields, password: true, passwordConfirm: true }
    formErrorMessage.value = '비밀번호가 일치하지 않습니다'
    return
  }

  formErrorMessage.value = ''
  isSubmitting.value = true

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      signupForm.value.email.trim(),
      signupForm.value.password,
    )
    await credential.user.getIdToken(true)
    await authStore.completeProfile({
      name: signupForm.value.name.trim(),
      nickname: signupForm.value.nickname.trim(),
      gender: signupForm.value.gender,
      cohort: signupForm.value.cohort,
    })
    try {
      await sendEmailVerification(credential.user)
    } catch {
      // 인증 안내 페이지에서 재발송할 수 있으므로 가입 흐름은 유지한다.
    }
    router.push('/verify-email')
  } catch (error) {
    formErrorMessage.value =
      firebaseErrorMessages[error.code] || error.response?.data?.message || '회원가입에 실패했습니다'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="wall min-h-screen flex items-center justify-center px-6 py-16">
    <!-- SVG 필터: 찢긴 종이 가장자리 -->
    <svg style="position: absolute; width: 0; height: 0; overflow: hidden" aria-hidden="true">
      <defs>
        <filter id="torn-edge-signup" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.048" numOctaves="4" seed="19" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>

    <!-- 포스트잇 래퍼 (max-w-md로 확대) -->
    <div class="note-wrapper relative w-full max-w-md">
      <!-- 민트 테이프 -->
      <div
        class="tape absolute z-20"
        style="
          top: -17px;
          left: 50%;
          width: 115px;
          height: 30px;
          background: rgba(150, 212, 180, 0.82);
          border-radius: 3px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.09);
          transform: translateX(-50%) rotate(1.1deg);
        "
      ></div>

      <!-- 포스트잇 배경 (초록) -->
      <div
        class="absolute inset-0"
        style="background: #c8e6cc; filter: url(#torn-edge-signup); border-radius: 4px; z-index: 0"
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

      <!-- 콘텐츠 -->
      <div class="relative z-10 px-9 pt-10 pb-8">
        <!-- 타이틀 -->
        <div class="mb-5">
          <h1 class="font-sketch text-5xl font-black text-ink leading-none">회원가입</h1>
          <div class="w-38 h-2.5 bg-[#ffe066]/85 mt-1 mb-2.5 rounded-sm"></div>
          <p class="text-[11px] font-bold text-ink/50">낙서장에 오신 걸 환영해요</p>
        </div>

        <!-- 에러 메시지 -->
        <div
          v-if="isFormError"
          class="mb-4 px-3 py-2 text-xs font-bold text-red-700 rounded-xl"
          style="background: rgba(255, 255, 255, 0.55); border: 1px solid rgba(239, 68, 68, 0.35)"
          aria-live="polite"
          id="signup-form-message"
        >
          <span class="inline-flex items-center gap-1.5">
            <ExclamationTriangleIcon class="w-4 h-4" />
            {{ formMessage }}
          </span>
        </div>

        <!-- 폼 -->
        <form class="flex flex-col gap-3" @submit.prevent="signupHandler">
          <!-- 이메일 -->
          <label class="block">
            <span class="block text-[11px] font-bold text-ink/60 mb-1.5">이메일</span>
            <input
              v-model="signupForm.email"
              type="email"
              autocomplete="email"
              placeholder="이메일을 입력하세요"
              :aria-invalid="invalidFields.email"
              aria-describedby="signup-form-message"
              class="note-input w-full rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none transition-all"
              :class="invalidFields.email ? 'input-error' : ''"
              @input="clearError('email')"
            />
          </label>

          <!-- 비밀번호 + 비밀번호 확인 (2열) -->
          <div class="grid grid-cols-2 gap-3">
            <label class="block">
              <span class="block text-[11px] font-bold text-ink/60 mb-1.5">비밀번호</span>
              <input
                v-model="signupForm.password"
                type="password"
                autocomplete="new-password"
                placeholder="8자 이상"
                :aria-invalid="invalidFields.password"
                aria-describedby="signup-form-message"
                class="note-input w-full rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none transition-all"
                :class="invalidFields.password ? 'input-error' : ''"
                @input="clearError('password')"
              />
            </label>
            <label class="block">
              <span class="block text-[11px] font-bold text-ink/60 mb-1.5">비밀번호 확인</span>
              <input
                v-model="signupForm.passwordConfirm"
                type="password"
                autocomplete="new-password"
                placeholder="다시 입력"
                :aria-invalid="invalidFields.passwordConfirm"
                aria-describedby="signup-form-message"
                class="note-input w-full rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none transition-all"
                :class="invalidFields.passwordConfirm ? 'input-error' : ''"
                @input="clearError('passwordConfirm')"
              />
            </label>
          </div>

          <!-- 이름 + 닉네임 (2열) -->
          <div class="grid grid-cols-2 gap-3">
            <label class="block">
              <span class="block text-[11px] font-bold text-ink/60 mb-1.5">이름</span>
              <input
                v-model="signupForm.name"
                type="text"
                autocomplete="name"
                placeholder="이름"
                :aria-invalid="invalidFields.name"
                aria-describedby="signup-form-message"
                class="note-input w-full rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none transition-all"
                :class="invalidFields.name ? 'input-error' : ''"
                @input="clearError('name')"
              />
            </label>
            <label class="block">
              <span class="block text-[11px] font-bold text-ink/60 mb-1.5">닉네임</span>
              <input
                v-model="signupForm.nickname"
                type="text"
                autocomplete="nickname"
                placeholder="닉네임"
                :aria-invalid="invalidFields.nickname"
                aria-describedby="signup-form-message"
                class="note-input w-full rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none transition-all"
                :class="invalidFields.nickname ? 'input-error' : ''"
                @input="clearError('nickname')"
              />
            </label>
          </div>

          <!-- 성별 + 회차 (2열) -->
          <div class="grid grid-cols-2 gap-3">
            <!-- 성별 -->
            <div>
              <span class="block text-[11px] font-bold text-ink/60 mb-1.5">성별</span>
              <div class="flex gap-2 h-10.5">
                <label
                  v-for="opt in [
                    { value: 'M', label: '남성' },
                    { value: 'F', label: '여성' },
                  ]"
                  :key="opt.value"
                  class="flex-1 cursor-pointer"
                  @change="clearError('gender')"
                >
                  <input type="radio" :value="opt.value" v-model="signupForm.gender" class="sr-only" />
                  <div
                    class="h-full flex items-center justify-center rounded-xl text-xs font-bold border-2 transition-all"
                    :class="
                      signupForm.gender === opt.value
                        ? 'bg-[#ffe066] border-ink text-ink shadow-[2px_2px_0_#1c1712]'
                        : 'note-input border-transparent text-ink/50'
                    "
                  >
                    {{ opt.label }}
                  </div>
                </label>
              </div>
              <p v-if="invalidFields.gender" class="text-[10px] text-red-600 mt-1 font-bold">선택 필요</p>
            </div>

            <!-- 회차 -->
            <label class="block">
              <span class="block text-[11px] font-bold text-ink/60 mb-1.5">회차</span>
              <select
                v-model="signupForm.cohort"
                :aria-invalid="invalidFields.cohort"
                aria-describedby="signup-form-message"
                class="note-input w-full h-10.5 rounded-xl px-3 text-sm outline-none transition-all appearance-none cursor-pointer"
                :class="[invalidFields.cohort ? 'input-error' : '', !signupForm.cohort ? 'text-ink/30' : 'text-ink']"
                @change="clearError('cohort')"
              >
                <option value="" disabled>선택</option>
                <option v-for="cohort in cohortOptions" :key="cohort" :value="cohort" class="text-ink">
                  {{ cohort }}
                </option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="signup-btn mt-2 py-3 rounded-xl border-2 border-ink bg-[#ffe066] text-ink font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style="box-shadow: 2px 3px 0 rgba(28, 23, 18, 0.45)"
          >
            {{ isSubmitting ? '가입 중...' : '가입하기 ✓' }}
          </button>
        </form>

        <!-- 로그인 링크 -->
        <p class="mt-5 text-center text-xs text-ink/50">
          이미 계정이 있으신가요?
          <RouterLink
            to="/login"
            class="ml-1 font-bold text-ink underline decoration-[#ffe066] decoration-2 underline-offset-2"
          >
            로그인
          </RouterLink>
        </p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.wall {
  background-color: #f0ece4;
}

@keyframes note-stick {
  0% {
    opacity: 0;
    transform: translateY(-32px) scale(0.95);
  }
  60% {
    opacity: 1;
    transform: translateY(5px) scale(1.01);
  }
  80% {
    transform: translateY(-2px);
  }
  100% {
    transform: translateY(0);
  }
}
.note-wrapper {
  animation: note-stick 0.55s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}

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

.signup-btn:not(:disabled):hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 4px 0 rgba(28, 23, 18, 0.5) !important;
}
.signup-btn:not(:disabled):active {
  transform: translate(1px, 1px);
  box-shadow: none !important;
}
</style>
