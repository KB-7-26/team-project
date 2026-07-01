<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
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
  if (isSubmitting.value) return

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
    router.push(authStore.needsVerification ? '/verify-email' : '/')
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
  <main class="wall min-h-screen flex items-center justify-center px-6 py-16">
    <!-- SVG 필터: 찢긴 종이 가장자리 -->
    <svg style="position:absolute;width:0;height:0;overflow:hidden;" aria-hidden="true">
      <defs>
        <filter id="torn-profile" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.048" numOctaves="4" seed="31" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
    </svg>

    <!-- 포스트잇 래퍼 -->
    <div class="note-wrapper relative w-full max-w-sm">

      <!-- 민트 테이프 -->
      <div class="tape absolute z-20"
           style="top:-17px; left:50%; width:115px; height:30px;
                  background:rgba(150,212,180,0.82);
                  border-radius:3px;
                  box-shadow:0 2px 6px rgba(0,0,0,0.09);
                  transform:translateX(-50%) rotate(1.1deg);">
      </div>

      <!-- 포스트잇 배경 (초록) -->
      <div class="absolute inset-0"
           style="background:#c8e6cc; filter:url(#torn-profile); border-radius:4px; z-index:0;">
      </div>

      <!-- 그림자 -->
      <div class="absolute inset-0"
           style="box-shadow:4px 10px 28px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07);
                  border-radius:4px;
                  z-index:0;">
      </div>

      <!-- 콘텐츠 -->
      <div class="relative z-10 px-9 pt-10 pb-8">

        <!-- Google 배지 + 타이틀 -->
        <div class="mb-5">
          <span class="inline-block text-[10px] font-bold text-[#4caf82] border border-[#96d4b4] rounded-full px-2.5 py-0.5 mb-3"
                style="background:rgba(150,212,180,0.15);">
            ✓ Google 계정 연결됨
          </span>
          <h1 class="font-sketch text-5xl font-black text-ink leading-none">프로필</h1>
          <div class="w-38 h-2.5 bg-[#ffe066]/85 mt-1 mb-2.5 rounded-sm"></div>
          <p class="text-[11px] font-bold text-ink/50">닉네임과 회차를 입력하면 가입이 완료돼요</p>
        </div>

        <!-- 에러 메시지 -->
        <div
          v-if="isFormError"
          class="mb-4 px-3 py-2 text-xs font-bold text-red-700 rounded-xl"
          style="background:rgba(255,255,255,0.55); border:1px solid rgba(239,68,68,0.35);"
          aria-live="polite"
          id="profile-form-message"
        >
          ⚠️ {{ formMessage }}
        </div>

        <form class="flex flex-col gap-3" @submit.prevent="submitProfile">

          <!-- 이메일 (비활성) -->
          <label class="block">
            <span class="block text-[11px] font-bold text-ink/60 mb-1.5">
              이메일 <span class="normal-case text-[9px] opacity-60 ml-0.5">(로그인 계정)</span>
            </span>
            <input
              :value="pendingEmail"
              type="email"
              disabled
              class="note-input note-input-disabled w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </label>

          <!-- 이름 + 닉네임 (2열) -->
          <div class="grid grid-cols-2 gap-3">
            <label class="block">
              <span class="block text-[11px] font-bold text-ink/60 mb-1.5">이름</span>
              <input
                v-model="profileForm.name"
                type="text"
                autocomplete="name"
                placeholder="이름"
                :aria-invalid="invalidFields.name"
                aria-describedby="profile-form-message"
                class="note-input w-full rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none transition-all"
                :class="invalidFields.name ? 'input-error' : ''"
                @input="clearError('name')"
              />
            </label>
            <label class="block">
              <span class="block text-[11px] font-bold text-ink/60 mb-1.5">닉네임</span>
              <input
                v-model="profileForm.nickname"
                type="text"
                autocomplete="nickname"
                placeholder="닉네임"
                :aria-invalid="invalidFields.nickname"
                aria-describedby="profile-form-message"
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
                  v-for="opt in [{ value: 'M', label: '남성' }, { value: 'F', label: '여성' }]"
                  :key="opt.value"
                  class="flex-1 cursor-pointer"
                  @change="clearError('gender')"
                >
                  <input type="radio" :value="opt.value" v-model="profileForm.gender" class="sr-only" />
                  <div
                    class="h-full flex items-center justify-center rounded-xl text-xs font-bold border-2 transition-all"
                    :class="profileForm.gender === opt.value
                      ? 'bg-[#ffe066] border-ink text-ink shadow-[2px_2px_0_#1c1712]'
                      : 'note-input border-transparent text-ink/50'"
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
                v-model="profileForm.cohort"
                :aria-invalid="invalidFields.cohort"
                aria-describedby="profile-form-message"
                class="note-input w-full h-10.5 rounded-xl px-3 text-sm outline-none transition-all appearance-none cursor-pointer"
                :class="[invalidFields.cohort ? 'input-error' : '', !profileForm.cohort ? 'text-ink/30' : 'text-ink']"
                @change="clearError('cohort')"
              >
                <option value="" disabled>선택</option>
                <option v-for="cohort in cohortOptions" :key="cohort" :value="cohort" class="text-ink">
                  {{ cohort }}
                </option>
              </select>
            </label>
          </div>

          <!-- 제출 버튼 -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="submit-btn mt-2 py-3 rounded-xl border-2 border-ink bg-[#ffe066] text-ink font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style="box-shadow:2px 3px 0 rgba(28,23,18,0.45);"
          >
            {{ isSubmitting ? '저장 중...' : '가입 완료 ✓' }}
          </button>
        </form>

        <!-- 다른 계정으로 로그인 -->
        <p class="mt-5 text-center text-xs text-ink/50">
          <button
            type="button"
            class="font-bold text-ink/40 hover:text-ink/70 transition-colors"
            @click="logout"
          >
            다른 계정으로 로그인 →
          </button>
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
  0%   { opacity: 0; transform: translateY(-32px) scale(0.95); }
  60%  { opacity: 1; transform: translateY(5px) scale(1.01); }
  80%  { transform: translateY(-2px); }
  100% { transform: translateY(0); }
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
.note-input-disabled {
  color: rgba(28, 23, 18, 0.38);
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 4px 0 rgba(28, 23, 18, 0.5) !important;
}
.submit-btn:not(:disabled):active {
  transform: translate(1px, 1px);
  box-shadow: none !important;
}
</style>
