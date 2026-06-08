<script setup>
import { EyeIcon, ChatBubbleLeftIcon, HeartIcon } from '@heroicons/vue/24/outline'
import { formatDate } from '@/utils/formatDate'

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
    <div class="flex items-center gap-3 text-xs text-text-sub mt-1">
      <span class="font-medium text-primary">{{ post.displayName }}</span>
      <span>{{ formatDate(post.createdAt) }}</span>
      <div class="flex items-center gap-3 ml-auto">
        <span class="flex items-center gap-1">
          <ChatBubbleLeftIcon class="w-3.5 h-3.5" />
          {{ post.commentCount ?? 0 }}
        </span>
        <span class="flex items-center gap-1">
          <HeartIcon class="w-3.5 h-3.5" />
          {{ post.likeCount ?? 0 }}
        </span>
        <span class="flex items-center gap-1">
          <EyeIcon class="w-3.5 h-3.5" />
          {{ post.viewCount }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>