<script setup>
import { ref } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  target: {
    type: String,
    required: true, // 'post' | 'comment'
  },
})

const emit = defineEmits(['submit', 'close'])

const reason = ref('')
const errorMessage = ref('')

const submit = () => {
  if (!reason.value.trim()) {
    errorMessage.value = '신고 사유를 입력해 주세요.'
    return
  }
  errorMessage.value = ''
  emit('submit', reason.value.trim())
}

const close = () => {
  reason.value = ''
  errorMessage.value = ''
  emit('close')
}

defineExpose({ setError: (msg) => { errorMessage.value = msg } })
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    @click.self="close"
  >
    <div class="bg-white border-2 border-ink rounded-2xl shadow-[4px_4px_0_#1c1712] w-full max-w-md mx-4 overflow-hidden">
      <div class="h-1.5 bg-[#ffe066]" />
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-lg text-ink">{{ target === 'post' ? '게시글' : '댓글' }} 신고하기</h2>
          <button @click="close" class="text-[#8c7e6e] hover:text-ink transition-colors cursor-pointer">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <textarea
          v-model="reason"
          placeholder="신고 사유를 입력해 주세요."
          rows="4"
          maxlength="500"
          class="w-full px-4 py-3 border-2 border-[#c8bca8] focus:border-ink rounded-xl text-sm text-ink outline-none transition-colors resize-none"
        />
        <div class="flex justify-between items-center mt-1 mb-4">
          <p v-if="errorMessage" class="text-xs text-red-400">{{ errorMessage }}</p>
          <span v-else />
          <span class="text-[10px] tabular-nums" :class="reason.length >= 480 ? 'text-red-400' : 'text-[#8c7e6e]'">
            {{ reason.length }}/500
          </span>
        </div>

        <div class="flex gap-2 justify-end">
          <button
            @click="close"
            class="text-sm font-bold text-[#8c7e6e] hover:text-ink px-4 py-2 rounded-xl border-2 border-[#c8bca8] hover:border-ink transition-all cursor-pointer"
          >
            취소
          </button>
          <button
            @click="submit"
            class="text-sm font-bold bg-[#ffe066] border-2 border-ink text-ink px-4 py-2 rounded-xl shadow-[2px_2px_0_#1c1712] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            신고
          </button>
        </div>
      </div>
    </div>
  </div>
</template>