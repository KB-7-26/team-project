<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { AcademicCapIcon, CheckBadgeIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'

defineOptions({
  name: 'SignupView',
})

const defaultFormMessage = '회원 정보를 입력해주세요'
const formErrorMessage = ref('')
const signupForm = ref({
  userId: '',
  password: '',
  passwordConfirm: '',
  name: '',
  nickname: '',
  gender: '',
  cohort: '',
})
const invalidFields = ref({
  userId: false,
  password: false,
  passwordConfirm: false,
  name: false,
  nickname: false,
  gender: false,
  cohort: false,
})

const requiredFields = ['userId', 'password', 'passwordConfirm', 'name', 'nickname', 'gender', 'cohort']
const emptyMessages = {
  userId: '아이디를 입력해주세요',
  password: '비밀번호를 입력해주세요',
  passwordConfirm: '비밀번호 확인을 입력해주세요',
  name: '이름을 입력해주세요',
  nickname: '닉네임을 입력해주세요',
  gender: '성별을 선택해주세요',
  cohort: '회차를 선택해주세요',
}

const formMessage = computed(() => formErrorMessage.value || defaultFormMessage)
const isFormError = computed(() => Boolean(formErrorMessage.value))

const benefits = [
  {
    icon: ShieldCheckIcon,
    title: '인증된 거래',
    description: '학생 정보 기반으로 신뢰도를 높여요',
  },
  {
    icon: AcademicCapIcon,
    title: '회차별 커뮤니티',
    description: '같은 과정의 동료들과 빠르게 연결돼요',
  },
  {
    icon: CheckBadgeIcon,
    title: '간편한 시작',
    description: '필수 정보만 입력하고 바로 이용하세요',
  },
]

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

const signupHandler = () => {
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

  if (signupForm.value.password !== signupForm.value.passwordConfirm) {
    invalidFields.value = {
      ...nextInvalidFields,
      password: true,
      passwordConfirm: true,
    }
    formErrorMessage.value = '비밀번호가 일치하지 않습니다'
    return
  }

  formErrorMessage.value = ''
  // TODO: 추후 서버 연동 시 회원가입 요청 로직 추가
}
</script>

<template>
  <main class="min-h-screen bg-sub-bg lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <section class="bg-hero-gradient px-6 py-14 sm:px-10 lg:flex lg:min-h-screen lg:items-center lg:px-16 xl:px-24">
      <div class="mx-auto w-full max-w-2xl">
        <div class="max-w-xl">
          <h1 class="text-4xl font-extrabold leading-tight text-text-main sm:text-5xl lg:text-6xl">
            KB Swap에<br />
            가입하세요
          </h1>
          <p class="mt-8 text-xl font-medium text-text-hover sm:text-2xl">인증된 학생들과 안전하게 거래를 시작하세요</p>
        </div>

        <ul class="mt-16 flex flex-col gap-8 sm:mt-20">
          <li v-for="benefit in benefits" :key="benefit.title" class="flex items-center gap-6">
            <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/90 sm:h-18 sm:w-18">
              <component :is="benefit.icon" class="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 class="text-xl font-extrabold text-text-main sm:text-2xl">{{ benefit.title }}</h2>
              <p class="mt-2 text-base font-medium text-text-hover sm:text-lg">{{ benefit.description }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section class="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
      <div
        class="w-full max-w-2xl rounded-[28px] bg-white px-7 py-10 shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:px-12 sm:py-14"
      >
        <RouterLink to="/" class="inline-flex items-center gap-4">
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-2xl font-extrabold text-white"
          >
            K
          </div>
          <strong class="text-3xl font-extrabold text-text-main">KB Swap</strong>
        </RouterLink>

        <p
          id="signup-form-message"
          class="mt-8 text-lg font-medium"
          :class="isFormError ? 'text-red-500' : 'text-text-sub'"
          aria-live="polite"
        >
          {{ formMessage }}
        </p>

        <form class="mt-9 flex flex-col gap-5" @submit.prevent="signupHandler">
          <label class="block">
            <span class="text-base font-extrabold text-text-main">아이디</span>
            <input
              v-model="signupForm.userId"
              type="text"
              autocomplete="username"
              placeholder="아이디를 입력하세요"
              :aria-invalid="invalidFields.userId"
              aria-describedby="signup-form-message"
              class="mt-3 h-14 w-full rounded-2xl border bg-white px-5 text-base font-medium text-text-main outline-none transition focus:ring-4"
              :class="
                invalidFields.userId
                  ? 'border-red-500 placeholder:text-red-500 focus:border-red-500 focus:ring-red-500/15'
                  : 'border-border placeholder:text-text-sub focus:border-primary focus:ring-primary/15'
              "
              @input="clearError('userId')"
            />
          </label>

          <label class="block">
            <span class="text-base font-extrabold text-text-main">비밀번호</span>
            <input
              v-model="signupForm.password"
              type="password"
              autocomplete="new-password"
              placeholder="비밀번호를 입력하세요"
              :aria-invalid="invalidFields.password"
              aria-describedby="signup-form-message"
              class="mt-3 h-14 w-full rounded-2xl border bg-white px-5 text-base font-medium text-text-main outline-none transition focus:ring-4"
              :class="
                invalidFields.password
                  ? 'border-red-500 placeholder:text-red-500 focus:border-red-500 focus:ring-red-500/15'
                  : 'border-border placeholder:text-text-sub focus:border-primary focus:ring-primary/15'
              "
              @input="clearError('password')"
            />
          </label>

          <label class="block">
            <span class="text-base font-extrabold text-text-main">비밀번호 확인</span>
            <input
              v-model="signupForm.passwordConfirm"
              type="password"
              autocomplete="new-password"
              placeholder="비밀번호를 한 번 더 입력하세요"
              :aria-invalid="invalidFields.passwordConfirm"
              aria-describedby="signup-form-message"
              class="mt-3 h-14 w-full rounded-2xl border bg-white px-5 text-base font-medium text-text-main outline-none transition focus:ring-4"
              :class="
                invalidFields.passwordConfirm
                  ? 'border-red-500 placeholder:text-red-500 focus:border-red-500 focus:ring-red-500/15'
                  : 'border-border placeholder:text-text-sub focus:border-primary focus:ring-primary/15'
              "
              @input="clearError('passwordConfirm')"
            />
          </label>

          <label class="block">
            <span class="text-base font-extrabold text-text-main">이름</span>
            <input
              v-model="signupForm.name"
              type="text"
              autocomplete="name"
              placeholder="이름을 입력하세요"
              :aria-invalid="invalidFields.name"
              aria-describedby="signup-form-message"
              class="mt-3 h-14 w-full rounded-2xl border bg-white px-5 text-base font-medium text-text-main outline-none transition focus:ring-4"
              :class="
                invalidFields.name
                  ? 'border-red-500 placeholder:text-red-500 focus:border-red-500 focus:ring-red-500/15'
                  : 'border-border placeholder:text-text-sub focus:border-primary focus:ring-primary/15'
              "
              @input="clearError('name')"
            />
          </label>

          <label class="block">
            <span class="text-base font-extrabold text-text-main">닉네임</span>
            <input
              v-model="signupForm.nickname"
              type="text"
              autocomplete="nickname"
              placeholder="닉네임을 입력하세요"
              :aria-invalid="invalidFields.nickname"
              aria-describedby="signup-form-message"
              class="mt-3 h-14 w-full rounded-2xl border bg-white px-5 text-base font-medium text-text-main outline-none transition focus:ring-4"
              :class="
                invalidFields.nickname
                  ? 'border-red-500 placeholder:text-red-500 focus:border-red-500 focus:ring-red-500/15'
                  : 'border-border placeholder:text-text-sub focus:border-primary focus:ring-primary/15'
              "
              @input="clearError('nickname')"
            />
          </label>

          <label class="block">
            <span class="text-base font-extrabold text-text-main">성별</span>
            <select
              v-model="signupForm.gender"
              :aria-invalid="invalidFields.gender"
              aria-describedby="signup-form-message"
              class="mt-3 h-14 w-full rounded-2xl border bg-white px-5 text-base font-medium outline-none transition focus:ring-4"
              :class="
                invalidFields.gender
                  ? 'border-red-500 text-red-500 focus:border-red-500 focus:ring-red-500/15'
                  : signupForm.gender
                    ? 'border-border text-text-main focus:border-primary focus:ring-primary/15'
                    : 'border-border text-text-sub focus:border-primary focus:ring-primary/15'
              "
              @change="clearError('gender')"
            >
              <option value="" disabled>성별을 선택하세요</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </label>

          <label class="block">
            <span class="text-base font-extrabold text-text-main">회차</span>
            <select
              v-model="signupForm.cohort"
              :aria-invalid="invalidFields.cohort"
              aria-describedby="signup-form-message"
              class="mt-3 h-14 w-full rounded-2xl border bg-white px-5 text-base font-medium outline-none transition focus:ring-4"
              :class="
                invalidFields.cohort
                  ? 'border-red-500 text-red-500 focus:border-red-500 focus:ring-red-500/15'
                  : signupForm.cohort
                    ? 'border-border text-text-main focus:border-primary focus:ring-primary/15'
                    : 'border-border text-text-sub focus:border-primary focus:ring-primary/15'
              "
              @change="clearError('cohort')"
            >
              <option value="" disabled>회차를 선택하세요</option>
              <option v-for="cohort in cohortOptions" :key="cohort" :value="cohort">
                {{ cohort }}
              </option>
            </select>
          </label>

          <button
            type="submit"
            class="mt-5 h-16 rounded-2xl bg-primary text-xl font-extrabold text-white transition hover:bg-primary-hover active:bg-primary-active"
          >
            가입
          </button>
        </form>

        <p class="mt-8 text-center text-base font-medium text-text-sub sm:text-lg">
          이미 계정이 있으신가요?
          <RouterLink to="/login" class="ml-2 font-extrabold text-primary hover:text-primary-hover">로그인</RouterLink>
        </p>

        <div class="mt-8 border-t border-border pt-8 text-center text-base font-medium text-text-sub">
          KB 인증 기반 안전 거래 서비스
        </div>
      </div>
    </section>
  </main>
</template>
