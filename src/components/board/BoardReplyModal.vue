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
    <div class="absolute inset-0 bg-ink/40" @click="$emit('close')" />

    <div class="relative w-full max-w-lg bg-white border-2 border-ink rounded-t-3xl md:rounded-2xl shadow-[6px_6px_0_#1c1712] z-10 max-h-[80vh] flex flex-col overflow-hidden">
      <div class="h-1.5 bg-[#f4b8c8]" />
      <!-- 헤더 -->
      <div class="flex items-center justify-between px-5 pt-4 pb-3 border-b-2 border-dashed border-[#e8e0d4] shrink-0">
        <p class="font-sketch font-bold text-base text-ink flex items-center gap-2">
          <ChatBubbleOvalLeftIcon class="w-5 h-5" />
          답글
        </p>
        <button @click="$emit('close')" class="p-1.5 rounded-xl border-2 border-[#c8bca8] hover:border-ink transition-all cursor-pointer">
          <XMarkIcon class="w-4 h-4 text-[#8c7e6e]" />
        </button>
      </div>

      <!-- 원본 댓글 -->
      <div class="px-5 py-4 bg-[#fffef5] border-b-2 border-dashed border-[#e8e0d4] shrink-0">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-xs font-bold text-[#2d5a48] bg-[#96d4b4]/30 px-2 py-0.5 rounded-full">익명</span>
          <span class="text-xs text-[#8c7e6e]">{{ comment.createdAt }}</span>
        </div>
        <p class="text-sm text-ink leading-relaxed">{{ comment.content }}</p>
      </div>

      <!-- 대댓글 목록 -->
      <ul class="flex-1 overflow-y-auto px-5 py-3 flex flex-col divide-y-2 divide-dashed divide-[#e8e0d4]">
        <li v-if="!comment.replies?.length" class="py-8 text-center text-sm text-[#8c7e6e]">
          첫 번째 답글을 남겨보세요
        </li>
        <li v-for="reply in comment.replies" :key="reply.id" class="py-3">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold text-[#2d5a48] bg-[#96d4b4]/30 px-2 py-0.5 rounded-full">익명</span>
            <span class="text-xs text-[#8c7e6e]">{{ reply.createdAt }}</span>
          </div>
          <p class="text-sm text-ink leading-relaxed">{{ reply.content }}</p>
        </li>
      </ul>

      <!-- 대댓글 입력 -->
      <div class="flex gap-2 px-5 py-4 border-t-2 border-dashed border-[#e8e0d4] shrink-0">
        <input
          v-model="newReply"
          @keyup.enter="submitReply"
          type="text"
          placeholder="답글을 입력하세요"
          class="flex-1 px-4 py-2.5 border-2 border-[#c8bca8] focus:border-ink rounded-xl text-sm text-ink outline-none transition-colors placeholder:text-[#8c7e6e]"
        />
        <button
          @click="submitReply"
          class="bg-[#ffe066] border-2 border-ink text-ink text-sm font-bold px-4 py-2.5 rounded-xl shadow-[3px_3px_0_#1c1712] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1c1712] transition-all shrink-0 cursor-pointer"
        >
          등록
        </button>
      </div>
    </div>
  </div>
</template>
