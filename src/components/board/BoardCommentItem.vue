<script setup>
import { ChatBubbleOvalLeftIcon } from '@heroicons/vue/24/outline'

defineProps({
  comment: Object,
})

defineEmits(['open-reply'])
</script>

<template>
  <div
    class="py-4 cursor-pointer hover:bg-primary/5 rounded-xl px-2 transition-colors duration-150"
    @click="$emit('open-reply', comment)"
  >
    <div class="flex items-center gap-2 mb-1.5">
      <span class="text-xs font-medium text-primary">익명</span>
      <span class="text-xs text-text-sub">{{ comment.createdAt }}</span>
    </div>
    <div class="flex items-center justify-between gap-4">
      <p class="text-sm text-text-main leading-relaxed flex-1">{{ comment.content }}</p>
      <button
        @click.stop="$emit('open-reply', comment)"
        class="flex items-center gap-1 text-xs text-text-sub hover:text-primary transition-colors shrink-0"
      >
        <ChatBubbleOvalLeftIcon class="w-4 h-4" />
        {{ comment.replies?.length ?? 0 }}
      </button>
    </div>
  </div>
</template>
