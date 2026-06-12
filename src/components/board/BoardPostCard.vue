<script setup>
import { formatDate } from '@/utils/formatDate'

defineProps({
  post: Object,
  rank: Number,
})
</script>

<template>
  <RouterLink
    :to="`/board/${post.id}`"
    class="flex items-center py-2.5 px-4 hover:bg-[#fffef5] transition-colors duration-150 cursor-pointer group"
  >
    <!-- 번호 -->
    <span class="w-10 shrink-0 text-center text-xs text-[#8c7e6e] font-mono tabular-nums">{{ rank }}</span>

    <!-- 제목 -->
    <div class="flex-1 min-w-0 flex items-center gap-1.5 px-3">
      <p class="text-sm font-bold text-ink line-clamp-1 group-hover:text-[#2d5a48] transition-colors">{{ post.title }}</p>
      <span v-if="post.commentCount > 0" class="shrink-0 text-[11px] font-bold text-[#2d5a48]">[{{ post.commentCount }}]</span>
    </div>

    <!-- 작성일 -->
    <span class="w-16 shrink-0 text-[11px] text-center text-[#8c7e6e]">{{ formatDate(post.createdAt) }}</span>

    <!-- 조회 -->
    <span class="hidden md:block w-12 shrink-0 text-xs text-center text-[#8c7e6e] tabular-nums">{{ post.viewCount }}</span>

    <!-- 추천 -->
    <span class="hidden md:block w-12 shrink-0 text-xs text-center text-[#8c7e6e] tabular-nums">{{ post.likeCount ?? 0 }}</span>
  </RouterLink>
</template>
