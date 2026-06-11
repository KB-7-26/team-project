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
    class="flex flex-col gap-1.5 py-4 px-5 hover:bg-[#fffef5] transition-colors duration-150 cursor-pointer group"
  >
    <p class="text-[15px] font-bold text-ink line-clamp-1 group-hover:text-[#2d5a48] transition-colors">{{ post.title }}</p>
    <div class="flex items-center gap-3 text-xs text-[#8c7e6e] mt-0.5">
      <span class="font-bold text-[#2d5a48] bg-[#96d4b4]/30 px-2 py-0.5 rounded-full">{{ post.displayName }}</span>
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
