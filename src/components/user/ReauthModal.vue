<script setup>
import { computed, ref, watch } from 'vue'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { auth } from '@/firebase'

defineOptions({
  name: 'ReauthModal',
})

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'changed'])

const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const canSubmit = computed(
  () => currentPassword.value && newPassword.value && newPasswordConfirm.value && !isSubmitting.value,
)

const firebaseErrorMessages = {
  'auth/invalid-credential': '현재 비밀번호가 올바르지 않습니다.',
  'auth/wrong-password': '현재 비밀번호가 올바르지 않습니다.',
  'auth/weak-password': '새 비밀번호는 8자 이상 입력해주세요.',
  'auth/requires-recent-login': '계정 인증이 만료되었습니다. 다시 시도해주세요.',
  'auth/too-many-requests': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
}

const resetForm = () => {
  currentPassword.value = ''
  newPassword.value = ''
  newPasswordConfirm.value = ''
  errorMessage.value = ''
}

const closeModal = () => {
  if (isSubmitting.value) return
  emit('close')
}

const validateForm = () => {
  if (!currentPassword.value) return '현재 비밀번호를 입력해주세요.'
  if (!newPassword.value) return '새 비밀번호를 입력해주세요.'
  if (newPassword.value.length < 8) return '새 비밀번호는 8자 이상 입력해주세요.'
  if (newPassword.value !== newPasswordConfirm.value) return '새 비밀번호가 일치하지 않습니다.'
  if (currentPassword.value === newPassword.value) return '현재 비밀번호와 다른 새 비밀번호를 입력해주세요.'
  return ''
}

const changePassword = async () => {
  const validationMessage = validateForm()
  errorMessage.value = validationMessage

  if (validationMessage) return

  const user = auth.currentUser
  if (!user?.email) {
    errorMessage.value = '로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.'
    return
  }

  isSubmitting.value = true
  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword.value)
    await reauthenticateWithCredential(user, credential)
    await updatePassword(user, newPassword.value)
    emit('changed')
    resetForm()
  } catch (error) {
    errorMessage.value = firebaseErrorMessages[error.code] || '비밀번호 변경에 실패했습니다.'
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) resetForm()
  },
)
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8"
    @click.self="closeModal"
  >
    <section class="w-full max-w-lg overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-[6px_6px_0_#1c1712]">
      <div class="relative flex items-center justify-between gap-4 border-b-2 border-ink px-6 py-5">
        <div class="absolute left-1/2 -top-3 h-5 w-20 -translate-x-1/2 rounded-sm border border-ink/20 bg-[#b3d4ff]/80"></div>
        <div>
          <h2 class="text-xl font-extrabold text-ink">비밀번호 변경</h2>
          <p class="mt-1 text-sm text-[#8c7e6e]">계정 확인 후 새 비밀번호를 저장합니다</p>
        </div>
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-ink bg-white text-ink shadow-[2px_2px_0_#1c1712] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting"
          @click="closeModal"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <form class="px-6 py-6" @submit.prevent="changePassword">
        <div class="flex flex-col gap-4">
          <label class="block">
            <span class="text-sm font-extrabold text-ink">현재 비밀번호</span>
            <input
              v-model="currentPassword"
              type="password"
              autocomplete="current-password"
              class="mt-2 h-12 w-full rounded-xl border-2 border-ink px-4 text-sm font-bold text-ink outline-none transition focus:border-[#ffe066] focus:shadow-[0_0_0_3px_rgba(255,224,102,0.25)]"
            />
          </label>

          <label class="block">
            <span class="text-sm font-extrabold text-ink">새 비밀번호</span>
            <input
              v-model="newPassword"
              type="password"
              autocomplete="new-password"
              class="mt-2 h-12 w-full rounded-xl border-2 border-ink px-4 text-sm font-bold text-ink outline-none transition focus:border-[#ffe066] focus:shadow-[0_0_0_3px_rgba(255,224,102,0.25)]"
            />
          </label>

          <label class="block">
            <span class="text-sm font-extrabold text-ink">새 비밀번호 확인</span>
            <input
              v-model="newPasswordConfirm"
              type="password"
              autocomplete="new-password"
              class="mt-2 h-12 w-full rounded-xl border-2 border-ink px-4 text-sm font-bold text-ink outline-none transition focus:border-[#ffe066] focus:shadow-[0_0_0_3px_rgba(255,224,102,0.25)]"
            />
          </label>

          <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {{ errorMessage }}
          </p>
        </div>

        <div class="mt-6 flex justify-end gap-3 border-t-2 border-dashed border-ink/20 pt-5">
          <button
            type="button"
            class="h-10 rounded-xl border-2 border-ink bg-white px-5 text-sm font-extrabold text-ink shadow-[2px_2px_0_#1c1712] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#1c1712] hover:bg-[#f0ebe0] disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSubmitting"
            @click="closeModal"
          >
            취소
          </button>
          <button
            type="submit"
            class="h-10 rounded-xl border-2 border-ink bg-[#ffe066] px-5 text-sm font-extrabold text-ink shadow-[2px_2px_0_#1c1712] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#1c1712] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canSubmit"
          >
            {{ isSubmitting ? '변경 중...' : '변경하기' }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>
