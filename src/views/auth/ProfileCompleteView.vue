<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckBadgeIcon, UserCircleIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

defineOptions({
  name: 'ProfileCompleteView',
})

const router = useRouter()
const authStore = useAuthStore()
const defaultFormMessage = '서비스 이용에 필요한 정보를 입력해주세요'
const formErrorMessage = ref('')
const isSubmitting = ref(false)
const profileForm = ref({
  name: authStore.pendingUser?.name || '',
  nickname: '',
  gender: '',
  cohort: '',
})
const invalidFields = ref({
  name: false,
  nickname: false,
  gender: false,
  cohort: false,
})

const requiredFields = ['name', 'nickname', 'gender', 'cohort']
const emptyMessages = {
  name: '이름을 입력해주세요',
  nickname: '닉네임을 입력해주세요',
  gender: '성별을 선택해주세요',
  cohort: '회차를 선택해주세요',
}
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
const formMessage = computed(() => formErrorMessage.value || defaultFormMessage)
const isFormError = computed(() => Boolean(formErrorMessage.value))
const pendingEmail = computed(() => authStore.pendingUser?.email || '')

const clearError = (field) => {
  invalidFields.value[field] = false

  if (Object.values(invalidFields.value).every((isInvalid) => !isInvalid)) {
    formErrorMessage.value = ''
  }
}

const submitProfile = async () => {
  if (isSubmitting.value) {
    return
  }

  const nextInvalidFields = requiredFields.reduce((result, field) => {
    result[field] = !String(profileForm.value[field]).trim()
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

  formErrorMessage.value = ''
  isSubmitting.value = true

  try {
    await authStore.completeProfile({
      name: profileForm.value.name.trim(),
      nickname: profileForm.value.nickname.trim(),
      gender: profileForm.value.gender,
      cohort: profileForm.value.cohort,
      profileImageUrl: authStore.pendingUser?.profileImageUrl || '',
    })
    router.push('/')
  } catch (error) {
    formErrorMessage.value = error.response?.data?.message || '프로필 저장에 실패했습니다'
  } finally {
    isSubmitting.value = false
  }
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <main class="min-h-screen bg-sub-bg lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <section class="bg-hero-gradient px-6 py-14 sm:px-10 lg:flex lg:min-h-screen lg:items-center lg:px-16 xl:px-24">
      <div class="mx-auto w-full max-w-2xl">
        <div class="max-w-xl">
          <h1 class="text-4xl font-extrabold leading-tight text-text-main sm:text-5xl lg:text-6xl">
            프로필을<br />
            완성하세요
          </h1>
          <p class="mt-8 text-xl font-medium text-text-hover sm:text-2xl">회차 정보가 있어야 거래와 커뮤니티를 이용할 수 있어요</p>
        </div>

        <ul class="mt-16 flex flex-col gap-8 sm:mt-20">
          <li class="flex items-center gap-6">
            <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/90 sm:h-18 sm:w-18">
              <UserCircleIcon class="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 class="text-xl font-extrabold text-text-main sm:text-2xl">가입 정보 연결</h2>
              <p class="mt-2 text-base font-medium text-text-hover sm:text-lg">{{ pendingEmail }}</p>
            </div>
          </li>
          <li class="flex items-center gap-6">
            <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/90 sm:h-18 sm:w-18">
              <CheckBadgeIcon class="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 class="text-xl font-extrabold text-text-main sm:text-2xl">추가정보 확인</h2>
              <p class="mt-2 text-base font-medium text-text-hover sm:text-lg">닉네임과 회차를 입력하면 가입이 완료돼요</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section class="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
      <div
        class="w-full max-w-xl rounded-[28px] bg-white px-7 py-10 shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:px-12 sm:py-14"
      >
        <div class="inline-flex items-center gap-4">
          <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-2xl font-extrabold text-white">
            K
          </div>
          <strong class="text-3xl font-extrabold text-text-main">KB Swap</strong>
        </div>

        <p
          id="profile-form-message"
          class="mt-9 text-lg font-medium"
          :class="isFormError ? 'text-red-500' : 'text-text-sub'"
          aria-live="polite"
        >
          {{ formMessage }}
        </p>

        <form class="mt-9 flex flex-col gap-5" @submit.prevent="submitProfile">
          <label class="block">
            <span class="text-base font-extrabold text-text-main">이메일</span>
            <input
              :value="pendingEmail"
              type="email"
              disabled
              class="mt-3 h-14 w-full rounded-2xl border border-border bg-gray-50 px-5 text-base font-medium text-text-sub outline-none"
            />
          </label>

          <label class="block">
            <span class="text-base font-extrabold text-text-main">이름</span>
            <input
              v-model="profileForm.name"
              type="text"
              autocomplete="name"
              placeholder="이름을 입력하세요"
              :aria-invalid="invalidFields.name"
              aria-describedby="profile-form-message"
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
              v-model="profileForm.nickname"
              type="text"
              autocomplete="nickname"
              placeholder="닉네임을 입력하세요"
              :aria-invalid="invalidFields.nickname"
              aria-describedby="profile-form-message"
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
              v-model="profileForm.gender"
              :aria-invalid="invalidFields.gender"
              aria-describedby="profile-form-message"
              class="mt-3 h-14 w-full rounded-2xl border bg-white px-5 text-base font-medium outline-none transition focus:ring-4"
              :class="
                invalidFields.gender
                  ? 'border-red-500 text-red-500 focus:border-red-500 focus:ring-red-500/15'
                  : profileForm.gender
                    ? 'border-border text-text-main focus:border-primary focus:ring-primary/15'
                    : 'border-border text-text-sub focus:border-primary focus:ring-primary/15'
              "
              @change="clearError('gender')"
            >
              <option value="" disabled>성별을 선택하세요</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>
          </label>

          <label class="block">
            <span class="text-base font-extrabold text-text-main">회차</span>
            <select
              v-model="profileForm.cohort"
              :aria-invalid="invalidFields.cohort"
              aria-describedby="profile-form-message"
              class="mt-3 h-14 w-full rounded-2xl border bg-white px-5 text-base font-medium outline-none transition focus:ring-4"
              :class="
                invalidFields.cohort
                  ? 'border-red-500 text-red-500 focus:border-red-500 focus:ring-red-500/15'
                  : profileForm.cohort
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
            :disabled="isSubmitting"
            class="mt-5 h-16 rounded-2xl bg-primary text-xl font-extrabold text-white transition hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary/60"
          >
            {{ isSubmitting ? '저장 중...' : '가입 완료' }}
          </button>
        </form>

        <button
          type="button"
          class="mt-6 w-full text-center text-base font-extrabold text-text-sub hover:text-text-main"
          @click="logout"
        >
          다른 계정으로 로그인
        </button>
      </div>
    </section>
  </main>
</template>
