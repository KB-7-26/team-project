<script setup>
import { ref } from 'vue'
import { XMarkIcon, ChatBubbleOvalLeftIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  comment: Object,
})

const emit = defineEmits(['close', 'submit-reply'])

const newReply = ref('')

const submitReply = () => {
  if (!newReply.value.trim()) return
  emit('submit-reply', { commentId: props.comment.id, content: newReply.value.trim() })
  newReply.value = ''
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-end md:items-center justify-center"
    @click.self="$emit('close')"
  >
    <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />

    <div class="relative w-full max-w-lg bg-white rounded-t-3xl md:rounded-2xl shadow-2xl z-10 max-h-[80vh] flex flex-col">
      <!-- 헤더 -->
      <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
        <p class="text-base font-bold text-text-main flex items-center gap-2">
          <ChatBubbleOvalLeftIcon class="w-5 h-5" />
          답글
        </p>
        <button @click="$emit('close')" class="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
          <XMarkIcon class="w-5 h-5 text-text-sub" />
        </button>
      </div>

      <!-- 원본 댓글 -->
      <div class="px-5 py-4 bg-gray-50 border-b border-border shrink-0">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-xs font-medium text-primary">익명</span>
          <span class="text-xs text-text-sub">{{ comment.createdAt }}</span>
        </div>
        <p class="text-sm text-text-main leading-relaxed">{{ comment.content }}</p>
      </div>

      <!-- 대댓글 목록 -->
      <ul class="flex-1 overflow-y-auto px-5 py-3 flex flex-col divide-y divide-border">
        <li v-if="!comment.replies?.length" class="py-8 text-center text-sm text-text-sub">
          첫 번째 답글을 남겨보세요
        </li>
        <li v-for="reply in comment.replies" :key="reply.id" class="py-3">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-medium text-primary">익명</span>
            <span class="text-xs text-text-sub">{{ reply.createdAt }}</span>
          </div>
          <p class="text-sm text-text-main leading-relaxed">{{ reply.content }}</p>
        </li>
      </ul>

      <!-- 대댓글 입력 -->
      <div class="flex gap-2 px-5 py-4 border-t border-border shrink-0">
        <input
          v-model="newReply"
          @keyup.enter="submitReply"
          type="text"
          placeholder="답글을 입력하세요"
          class="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-text-main outline-none focus:border-primary transition-colors"
        />
        <button
          @click="submitReply"
          class="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0 cursor-pointer"
        >
          등록
        </button>
      </div>
    </div>
  </div>
</template>
