<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendEmailVerification } from 'firebase/auth'
import {
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
} from '@heroicons/vue/24/outline'
import { auth } from '@/firebase'
import { useAuthStore } from '@/stores/auth'

defineOptions({
  name: 'VerifyEmailView',
})

const router = useRouter()
const authStore = useAuthStore()
const isChecking = ref(false)
const isResending = ref(false)
const statusMessage = ref('')
const isError = ref(false)
const resendCooldown = ref(0)

let cooldownTimer = null

const email = computed(() => authStore.user?.email || authStore.firebaseUser?.email || '')
const defaultMessage = computed(() =>
  email.value
    ? `${email.value} 주소로 보낸 인증 메일을 확인해주세요.`
    : '가입한 이메일 주소로 보낸 인증 메일을 확인해주세요.',
)
const message = computed(() => statusMessage.value || defaultMessage.value)
const canResend = computed(() => !isResending.value && resendCooldown.value === 0)

const firebaseErrorMessages = {
  'auth/too-many-requests': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
}

const setMessage = (messageText, error = false) => {
  statusMessage.value = messageText
  isError.value = error
}

const startResendCooldown = () => {
  resendCooldown.value = 60
  clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    resendCooldown.value -= 1
    if (resendCooldown.value <= 0) {
      resendCooldown.value = 0
      clearInterval(cooldownTimer)
    }
  }, 1000)
}

const resendVerificationEmail = async () => {
  if (!canResend.value) return

  const user = auth.currentUser
  if (!user) {
    router.replace('/login')
    return
  }

  isResending.value = true
  try {
    await sendEmailVerification(user)
    setMessage('인증 메일을 다시 보냈습니다.')
    startResendCooldown()
  } catch (error) {
    setMessage(firebaseErrorMessages[error.code] || '인증 메일을 다시 보내지 못했습니다.', true)
  } finally {
    isResending.value = false
  }
}

const checkVerification = async () => {
  if (isChecking.value) return

  const user = auth.currentUser
  if (!user) {
    router.replace('/login')
    return
  }

  isChecking.value = true
  try {
    await user.reload()
    const refreshedUser = auth.currentUser

    if (!refreshedUser?.emailVerified) {
      setMessage('아직 이메일 인증이 완료되지 않았습니다.', true)
      return
    }

    await refreshedUser.getIdToken(true)
    await authStore.verifyEmail()
    await authStore.refreshMe()
    router.replace('/')
  } catch (error) {
    setMessage(error.response?.data?.message || '이메일 인증 상태를 확인하지 못했습니다.', true)
  } finally {
    isChecking.value = false
  }
}

const logout = async () => {
  await authStore.logout()
  router.replace('/login')
}

onMounted(() => {
  if (!auth.currentUser) {
    router.replace('/login')
    return
  }

  if (authStore.isVerified) {
    router.replace('/')
  }
})

onBeforeUnmount(() => {
  clearInterval(cooldownTimer)
})
</script>

<template>
  <main class="wall min-h-screen flex items-center justify-center px-6 py-16">
    <svg style="position:absolute;width:0;height:0;overflow:hidden;" aria-hidden="true">
      <defs>
        <filter id="torn-verify-email" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="0.043" numOctaves="4" seed="43" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
    </svg>

    <section class="note-wrapper relative w-full max-w-sm">
      <div
        class="tape absolute z-20"
        style="
          top: -17px;
          left: 50%;
          width: 112px;
          height: 30px;
          background: rgba(242, 182, 178, 0.83);
          border-radius: 3px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.09);
          transform: translateX(-50%) rotate(-1.2deg);
        "
      ></div>

      <div
        class="absolute inset-0"
        style="background:#bdd8f2; filter:url(#torn-verify-email); border-radius:4px; z-index:0;"
      ></div>

      <div
        class="absolute inset-0"
        style="
          box-shadow:4px 10px 28px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07);
          border-radius:4px;
          z-index:0;
        "
      ></div>

      <div class="relative z-10 px-9 pt-12 pb-9">
        <div class="mb-7">
          <div class="mb-2 flex items-center gap-1.5 text-[11px] font-black text-ink/45">
            <EnvelopeIcon class="h-4 w-4" />
            <span>EMAIL VERIFY</span>
          </div>
          <h1 class="font-sketch text-5xl font-black text-ink leading-none">이메일 인증</h1>
          <div class="w-32 h-2.5 bg-[#ffe066]/85 mt-1 mb-2.5 rounded-sm"></div>
          <p class="text-[11px] font-bold text-ink/50">메일함에서 인증 링크를 확인해주세요</p>
        </div>

        <div
          class="mb-5 rounded-xl px-3 py-2 text-xs font-bold"
          :class="isError ? 'text-red-700' : 'text-ink/58'"
          :style="
            isError
              ? 'background:rgba(255,255,255,0.55); border:1px solid rgba(239,68,68,0.35);'
              : 'background:rgba(255,255,255,0.45); border:1px solid rgba(255,255,255,0.34);'
          "
          aria-live="polite"
        >
          <span v-if="isError">⚠️ </span>{{ message }}
        </div>

        <div class="flex flex-col gap-3">
          <button
            type="button"
            class="verify-btn primary-btn"
            :disabled="isChecking"
            @click="checkVerification"
          >
            <CheckBadgeIcon class="h-5 w-5" />
            <span>{{ isChecking ? '확인 중' : '인증 완료했어요' }}</span>
          </button>

          <button
            type="button"
            class="verify-btn secondary-btn"
            :disabled="!canResend"
            @click="resendVerificationEmail"
          >
            <ArrowPathIcon class="h-5 w-5" />
            <span>
              <template v-if="isResending">재발송 중</template>
              <template v-else-if="resendCooldown > 0">{{ resendCooldown }}초 후 재발송</template>
              <template v-else>인증 메일 다시 보내기</template>
            </span>
          </button>

          <button
            type="button"
            class="logout-link mt-1"
            @click="logout"
          >
            <ArrowRightOnRectangleIcon class="h-5 w-5" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.wall {
  background-color: #f0ece4;
}

@keyframes note-stick {
  0%   { opacity: 0; transform: rotate(-10deg) translateY(-44px) scale(0.9); }
  52%  { opacity: 1; transform: rotate(1.5deg) translateY(6px) scale(1.01); }
  70%  { transform: rotate(-0.8deg) translateY(-2px) scale(1); }
  85%  { transform: rotate(0.4deg) translateY(0.5px); }
  100% { transform: rotate(0deg) translateY(0); }
}

.note-wrapper {
  animation: note-stick 0.72s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}

.verify-btn {
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px solid #1c1712;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 800;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}

.primary-btn {
  background: #ffe066;
  color: #1c1712;
  box-shadow: 2px 3px 0 rgba(28, 23, 18, 0.45);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.55);
  border-color: rgba(28, 23, 18, 0.18);
  color: #1c1712;
  box-shadow: none;
}

.logout-link {
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0;
  color: rgba(28, 23, 18, 0.48);
  font-size: 12px;
  font-weight: 800;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}

.verify-btn:not(:disabled):hover,
.logout-link:hover {
  transform: translate(-1px, -1px);
}

.primary-btn:not(:disabled):hover {
  box-shadow: 3px 4px 0 rgba(28, 23, 18, 0.45);
}

.verify-btn:not(:disabled):active,
.logout-link:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.verify-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
