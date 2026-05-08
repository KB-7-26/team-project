<script setup>
import { ChatBubbleOvalLeftIcon } from '@heroicons/vue/24/outline'

defineProps({
  post: Object,
})
</script>

<template>
  <RouterLink
    :to="`/board/${post.id}`"
    class="flex flex-col gap-1.5 py-5 px-2 hover:bg-primary/5 rounded-xl transition-colors duration-150 cursor-pointer"
  >
    <p class="text-base font-bold text-text-main line-clamp-1">{{ post.title }}</p>
    <p class="text-sm text-text-sub line-clamp-1">{{ post.preview }}</p>
    <div class="flex items-center gap-3 text-xs text-text-sub mt-1">
      <span class="font-medium text-primary">익명</span>
      <span>{{ post.createdAt }}</span>
      <span class="flex items-center gap-1 ml-auto">
        <ChatBubbleOvalLeftIcon class="w-3.5 h-3.5" />
        {{ post.comments }}
      </span>
    </div>
  </RouterLink>
</template>
