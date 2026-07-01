<script setup>
import { CubeIcon, StarIcon } from '@heroicons/vue/24/outline'

defineProps({
  productImage: String,
  opponentName: String,
  lastMessageTime: String,
  productTitle: String,
  lastMessage: String,
  unreadCount: Number,
  isActive: Boolean,
  hasPendingReview: Boolean,
})
</script>

<template>
  <div
    :class="[
      'room-card flex items-center gap-3 py-4 border-b-2 border-[#c8bca8] cursor-pointer transition-colors relative',
      isActive
        ? 'bg-[#ffe066]/30 pl-4 pr-5'
        : 'hover:bg-[#ffe066]/10 px-5',
    ]"
  >
    <!-- 활성 표시 바 -->
    <div v-if="isActive" class="absolute left-0 top-2 bottom-2 w-1 bg-ink rounded-r-full" />
    <!-- 상품 이미지 -->
    <div class="shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 border-ink shadow-[2px_2px_0_#1c1712]">
      <img v-if="productImage" :src="productImage" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full bg-[#c8bca8] flex items-center justify-center">
        <CubeIcon class="w-6 h-6 text-ink/45" />
      </div>
    </div>

    <!-- 내용 -->
    <div class="flex-1 min-w-0">
      <div class="flex justify-between items-center mb-0.5">
        <span class="font-bold text-[15px] text-ink">{{ opponentName }}</span>
        <span class="text-xs text-[#8c7e6e] shrink-0">{{ lastMessageTime }}</span>
      </div>
      <div class="text-xs font-bold text-primary mb-1 truncate">{{ productTitle }}</div>
      <div class="flex justify-between items-center gap-2">
        <span class="text-[13px] text-[#8c7e6e] truncate">{{ lastMessage }}</span>
        <span
          v-if="hasPendingReview"
          class="shrink-0 text-[#c9a227] inline-flex items-center"
          title="별점을 남겨주세요!"
        >
          <StarIcon class="w-5 h-5" />
        </span>
        <span
          v-else-if="unreadCount > 0"
          class="bg-[#ffe066] border-2 border-ink text-ink text-[11px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center shrink-0 shadow-[1px_1px_0_#1c1712]"
        >
          {{ unreadCount }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.room-card:active {
  background-color: rgba(255, 224, 102, 0.2);
}
</style>
