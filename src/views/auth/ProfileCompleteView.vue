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

    <!-- SVG 필터 -->
    <svg style="position:absolute;width:0;height:0;overflow:hidden;" aria-hidden="true">
      <defs>
        <filter id="torn-profile" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="0.041" numOctaves="4" seed="31" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
    </svg>

    <!-- 시트 래퍼 -->
    <div class="sheet-enter relative w-full max-w-sm">

      <!-- 테이프 (민트 + 노랑) -->
      <div class="absolute z-20"
           style="top:-15px; left:20%; width:84px; height:26px;
                  background:rgba(150,212,180,0.82);
                  border-radius:3px;
                  box-shadow:0 2px 5px rgba(0,0,0,0.09);
                  transform:rotate(-1.3deg);">
      </div>
      <div class="absolute z-20"
           style="top:-13px; right:22%; width:68px; height:26px;
                  background:rgba(255,224,102,0.78);
                  border-radius:3px;
                  box-shadow:0 2px 5px rgba(0,0,0,0.09);
                  transform:rotate(1.6deg);">
      </div>

      <!-- 펀치 구멍 -->
      <div class="absolute left-0 z-20 flex flex-col justify-around pointer-events-none"
           style="top:0; bottom:0; padding:28px 0; transform:translateX(-45%);">
        <div v-for="n in 3" :key="n"
             class="w-5 h-5 rounded-full"
             style="background:#e8e3d8; border:2.5px solid #c8bca8; box-shadow:inset 1px 1px 3px rgba(0,0,0,0.12);">
        </div>
      </div>

      <!-- 노트북 배경 -->
      <div class="absolute inset-0 rounded-sm"
           style="background-color:#fffdf4;
                  background-image:repeating-linear-gradient(transparent 0px, transparent 31px, #c5d8ea 31px, #c5d8ea 32px);
                  filter:url(#torn-profile);
                  z-index:0;">
      </div>

      <!-- 그림자 -->
      <div class="absolute inset-0 rounded-sm"
           style="box-shadow:5px 12px 36px rgba(0,0,0,0.17), 0 2px 6px rgba(0,0,0,0.07);
                  z-index:0;">
      </div>

      <!-- 콘텐츠 -->
      <div class="relative z-10 pr-8 pt-10 pb-8" style="padding-left:64px;">

        <!-- 왼쪽 마진 선 -->
        <div class="absolute top-0 bottom-0 pointer-events-none"
             style="left:48px; width:1.5px; background:rgba(150,212,180,0.55);">
        </div>

        <!-- 이메일 연결 배지 -->
        <div class="mb-5">
          <div class="flex items-center gap-1.5 mb-3">
            <span class="inline-block text-[10px] font-bold text-[#4caf82] border border-[#96d4b4] rounded-full px-2.5 py-0.5"
                  style="background:rgba(150,212,180,0.15);">
              ✓ Google 계정 연결됨
            </span>
          </div>
          <h1 class="font-sketch text-4xl font-black text-ink leading-tight">
            프로필
            <span class="text-xl font-normal text-ink/40 ml-1">완성하기</span>
          </h1>
          <div class="h-2.5 bg-[#96d4b4]/75 mt-1 mb-1 rounded-sm" style="width:72px;"></div>
          <p class="text-[11px] text-ink/40 font-bold mt-1">닉네임과 회차를 입력하면 가입이 완료돼요</p>
        </div>

        <!-- 에러/안내 메시지 -->
        <div
          v-if="isFormError"
          class="mb-4 px-3 py-2 text-xs font-bold text-red-700 rounded-xl"
          style="background:rgba(255,255,255,0.55); border:1px solid rgba(239,68,68,0.35);"
          aria-live="polite"
          id="profile-form-message"
        >
          ⚠️ {{ formMessage }}
        </div>
        <p v-else class="text-[11px] text-ink/38 font-bold mb-4" id="profile-form-message" aria-live="polite">
          {{ formMessage }}
        </p>

        <form class="flex flex-col gap-4" @submit.prevent="submitProfile">

          <!-- 이메일 (비활성) -->
          <label class="block">
            <span class="field-lbl">이메일 <span class="normal-case text-[9px] opacity-60 ml-0.5">(로그인 계정)</span></span>
            <input
              :value="pendingEmail"
              type="email"
              disabled
              class="line-inp-disabled"
            />
          </label>

          <!-- 이름 + 닉네임 -->
          <div class="grid grid-cols-2 gap-4">
            <label class="block">
              <span class="field-lbl">이름</span>
              <input
                v-model="profileForm.name"
                type="text"
                autocomplete="name"
                placeholder="이름"
                :aria-invalid="invalidFields.name"
                aria-describedby="profile-form-message"
                class="line-inp"
                :class="invalidFields.name ? 'inp-err' : ''"
                @input="clearError('name')"
              />
            </label>
            <label class="block">
              <span class="field-lbl">닉네임</span>
              <input
                v-model="profileForm.nickname"
                type="text"
                autocomplete="nickname"
                placeholder="닉네임"
                :aria-invalid="invalidFields.nickname"
                aria-describedby="profile-form-message"
                class="line-inp"
                :class="invalidFields.nickname ? 'inp-err' : ''"
                @input="clearError('nickname')"
              />
            </label>
          </div>

          <!-- 성별 -->
          <div>
            <span class="field-lbl block mb-2">성별</span>
            <div class="flex gap-3">
              <label class="cursor-pointer flex items-center gap-2" @change="clearError('gender')">
                <input type="radio" value="M" v-model="profileForm.gender" class="sr-only" />
                <div class="radio-box" :class="profileForm.gender === 'M' ? 'radio-m' : ''">남</div>
                <span class="text-sm font-bold text-ink">남성</span>
              </label>
              <label class="cursor-pointer flex items-center gap-2" @change="clearError('gender')">
                <input type="radio" value="F" v-model="profileForm.gender" class="sr-only" />
                <div class="radio-box" :class="profileForm.gender === 'F' ? 'radio-f' : ''">여</div>
                <span class="text-sm font-bold text-ink">여성</span>
              </label>
            </div>
            <p v-if="invalidFields.gender" class="text-[10px] text-red-500 mt-1 font-bold">성별을 선택해주세요</p>
          </div>

          <!-- 회차 -->
          <label class="block">
            <span class="field-lbl">회차</span>
            <select
              v-model="profileForm.cohort"
              :aria-invalid="invalidFields.cohort"
              aria-describedby="profile-form-message"
              class="line-sel"
              :class="[invalidFields.cohort ? 'inp-err' : '', !profileForm.cohort ? 'text-ink/30' : 'text-ink']"
              @change="clearError('cohort')"
            >
              <option value="" disabled>회차를 선택하세요</option>
              <option v-for="cohort in cohortOptions" :key="cohort" :value="cohort">{{ cohort }}</option>
            </select>
          </label>

          <!-- 제출 버튼 -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="submit-btn mt-2 py-3 rounded-xl border-2 border-ink bg-[#96d4b4] text-ink font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style="box-shadow:2px 3px 0 rgba(28,23,18,0.45);"
          >
            {{ isSubmitting ? '저장 중...' : '가입 완료 ✓' }}
          </button>
        </form>

        <!-- 다른 계정으로 로그인 -->
        <button
          type="button"
          class="mt-5 w-full text-center text-xs text-ink/40 font-bold hover:text-ink/70 transition-colors"
          @click="logout"
        >
          다른 계정으로 로그인 →
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.wall {
  background-color: #f0ece4;
}

@keyframes sheet-drop {
  0%   { opacity: 0; transform: translateY(-30px) scale(0.96); }
  55%  { opacity: 1; transform: translateY(5px) scale(1.005); }
  75%  { transform: translateY(-2px); }
  100% { transform: translateY(0); }
}
.sheet-enter {
  animation: sheet-drop 0.58s cubic-bezier(0.34, 1.35, 0.64, 1) both;
}

.field-lbl {
  display: block;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(28, 23, 18, 0.48);
  margin-bottom: 4px;
}

.line-inp {
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1.5px solid rgba(139, 115, 85, 0.38);
  border-radius: 0;
  padding: 6px 0 5px;
  font-size: 0.875rem;
  color: #1c1712;
  outline: none;
  transition: border-color 0.15s;
}
.line-inp::placeholder { color: rgba(28, 23, 18, 0.27); }
.line-inp:focus { border-bottom-color: #1c1712; }
.line-inp.inp-err { border-bottom-color: rgb(239, 68, 68); }
.line-inp.inp-err::placeholder { color: rgba(239, 68, 68, 0.45); }

.line-inp-disabled {
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1.5px solid rgba(139, 115, 85, 0.2);
  border-radius: 0;
  padding: 6px 0 5px;
  font-size: 0.875rem;
  color: rgba(28, 23, 18, 0.38);
  outline: none;
  cursor: not-allowed;
}

.line-sel {
  display: block;
  width: 100%;
  background: transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' fill='none'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%238c7e6e' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 2px center;
  border: none;
  border-bottom: 1.5px solid rgba(139, 115, 85, 0.38);
  border-radius: 0;
  padding: 6px 20px 5px 0;
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: border-color 0.15s;
}
.line-sel:focus { border-bottom-color: #1c1712; }
.line-sel.inp-err { border-bottom-color: rgb(239, 68, 68); color: rgb(239, 68, 68) !important; }

.radio-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid rgba(200, 188, 168, 0.8);
  background: rgba(255, 255, 255, 0.38);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #1c1712;
  transition: all 0.12s;
}
.radio-m {
  background: #ffe066;
  border-color: #1c1712;
  box-shadow: 2px 2px 0 #1c1712;
}
.radio-f {
  background: #f4a8b8;
  border-color: #1c1712;
  box-shadow: 2px 2px 0 #1c1712;
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
