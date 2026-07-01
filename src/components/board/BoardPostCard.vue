<script setup>
import { PhotoIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { formatDate } from '@/utils/formatDate'

const props = defineProps({
  post: Object,
  rank: Number,
  from: String,
})

function hasPostImage(post) {
  return Boolean(post?.hasImage || post?.imageCount > 0 || post?.images?.length > 0)
}
</script>

<template>
  <RouterLink
    :to="props.from ? `/board/${post.id}?from=${props.from}` : `/board/${post.id}`"
    class="flex items-center py-2.5 px-4 hover:bg-[#fffef5] transition-colors duration-150 cursor-pointer group"
  >
    <!-- 번호 -->
    <span class="w-10 shrink-0 text-center text-xs text-[#8c7e6e] font-mono tabular-nums">{{ rank }}</span>

    <!-- 제목 -->
    <div class="flex-1 min-w-0 flex items-center gap-1.5 px-3">
      <span
        v-if="post.category && post.category !== '자유게시판'"
        class="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md border"
        :class="{
          'text-orange-600 bg-orange-50 border-orange-200': post.category === '공지',
          'text-blue-600 bg-blue-50 border-blue-200': post.category === '전공',
          'text-purple-600 bg-purple-50 border-purple-200': post.category === '비전공',
          'text-red-600 bg-red-50 border-red-200': post.category === '취업',
        }"
      >{{ post.category }}</span>
      <p class="text-sm font-bold text-ink line-clamp-1 group-hover:text-[#2d5a48] transition-colors">{{ post.title }}</p>
      <span v-if="hasPostImage(post)" class="shrink-0 inline-flex items-center" title="이미지 포함">
        <PhotoIcon class="w-3.5 h-3.5 text-[#8c7e6e]" />
      </span>
      <span v-if="post.commentCount > 0" class="shrink-0 text-[11px] font-bold text-[#2d5a48]">[{{ post.commentCount }}]</span>
    </div>

    <!-- 작성일 -->
    <span class="w-16 shrink-0 text-[11px] text-center text-[#8c7e6e]">{{ formatDate(post.createdAt) }}</span>

    <!-- 조회 -->
    <span class="hidden md:block w-12 shrink-0 text-xs text-center text-[#8c7e6e] tabular-nums">{{ post.viewCount }}</span>

    <!-- 추천 -->
    <span class="hidden md:inline-flex w-12 shrink-0 items-center justify-center gap-1 text-xs font-bold text-[#e85d04] tabular-nums">
      <HeartSolidIcon class="w-3.5 h-3.5 shrink-0" />
      <span>{{ post.likeCount ?? 0 }}</span>
    </span>
  </RouterLink>
</template>
