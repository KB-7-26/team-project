<script setup>
import { EyeIcon } from '@heroicons/vue/24/outline'

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
      <span class="font-medium text-primary">{{ post.nickname }}</span>
      <span>{{ post.createdAt }}</span>
      <span class="flex items-center gap-1 ml-auto">
        <EyeIcon class="w-3.5 h-3.5" />
        {{ post.viewCount }}
      </span>
    </div>
  </RouterLink>
</template>