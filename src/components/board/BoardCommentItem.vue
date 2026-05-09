<script setup>
import { ChatBubbleOvalLeftIcon } from '@heroicons/vue/24/outline'

defineProps({
  comment: Object,
  isReply: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['reply-click'])
</script>

<template>
  <div
    class="py-4 px-2"
    :class="[
      isReply ? 'ml-6 pl-4 border-l-2 border-border' : 'hover:bg-primary/5 rounded-xl cursor-pointer',
    ]"
    @click="!isReply && $emit('reply-click', comment)"
  >
    <div class="flex items-center gap-2 mb-1.5">
      <span v-if="isReply" class="text-xs text-text-sub">↳</span>
      <span class="text-xs font-medium text-primary">익명</span>
      <span class="text-xs text-text-sub">{{ comment.createdAt }}</span>
    </div>
    <div class="flex items-center justify-between gap-4">
      <p class="text-sm text-text-main leading-relaxed flex-1">{{ comment.content }}</p>
      <button
        v-if="!isReply"
        @click.stop="$emit('reply-click', comment)"
        class="flex items-center gap-1 text-xs text-text-sub hover:text-primary transition-colors shrink-0 cursor-pointer"
      >
        <ChatBubbleOvalLeftIcon class="w-4 h-4" />
        {{ comment.replies?.length ?? 0 }}
      </button>
    </div>
  </div>
</template>
