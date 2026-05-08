<script setup>
defineProps({
  productImage: String,
  opponentName: String,
  lastMessageTime: String,
  productTitle: String,
  lastMessage: String,
  unreadCount: Number,
})
</script>

<template>
  <div class="flex items-center gap-3 px-2 py-4 border-b border-border cursor-pointer hover:bg-primary/5">
    <img v-if="productImage" :src="productImage" class="w-14 h-14 rounded-lg object-cover shrink-0" />
    <div v-else class="w-14 h-14 rounded-lg bg-border shrink-0"></div>

    <div class="flex-1 min-w-0">
      <div class="flex justify-between items-center mb-1">
        <span class="text-[15px] font-semibold text-text-main">{{ opponentName }}</span>
        <span class="text-xs text-text-sub shrink-0">{{ lastMessageTime }}</span>
      </div>
      <div class="text-xs text-primary font-medium mb-1">{{ productTitle }}</div>
      <div class="flex justify-between items-center">
        <span class="text-[13px] text-text-sub truncate">{{ lastMessage }}</span>
        <span
          v-if="unreadCount > 0"
          class="bg-primary text-white text-[11px] font-bold min-w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2"
        >
          {{ unreadCount }}
        </span>
      </div>
    </div>
  </div>
</template>
