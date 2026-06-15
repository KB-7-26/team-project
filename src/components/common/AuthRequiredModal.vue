<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'completion'].includes(value),
  },
})

const emit = defineEmits(['update:open', 'confirm'])

const content = computed(() => {
  if (props.mode === 'completion') {
    return {
      title: '가입 완료가 필요해요',
      message: '가입을 완료한 뒤 이용할 수 있어요.',
      confirmText: '가입 완료하기',
    }
  }

  return {
    title: '로그인이 필요해요',
    message: '로그인 후 이용할 수 있어요.',
    confirmText: '로그인',
  }
})

const close = () => {
  emit('update:open', false)
}

const confirm = () => {
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6"
      @click.self="close"
    >
      <div class="flex w-80 flex-col gap-4 rounded-2xl border-2 border-ink bg-white p-6 shadow-[6px_6px_0_#1c1712]">
        <p class="text-lg font-bold text-ink">{{ content.title }}</p>
        <p class="-mt-2 text-sm text-[#8c7e6e]">{{ content.message }}</p>
        <div class="flex gap-3">
          <button
            type="button"
            class="flex-1 rounded-xl border-2 border-ink py-2.5 text-sm font-bold text-ink shadow-[2px_2px_0_#1c1712] transition hover:bg-gray-50"
            @click="close"
          >
            취소
          </button>
          <button
            type="button"
            class="flex-1 rounded-xl border-2 border-ink bg-[#ffe066] py-2.5 text-sm font-bold text-ink shadow-[2px_2px_0_#1c1712] transition hover:bg-primary/20"
            @click="confirm"
          >
            {{ content.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
