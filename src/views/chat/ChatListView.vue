<script setup>
import { ref } from 'vue'

const searchQuery = ref('')

const chatRooms = ref([
  {
    chatRoomId: 1,
    productTitle: '맥북 프로 M1',
    productImage: 'https://picsum.photos/seed/mac/56/56',
    opponentName: '김철수',
    lastMessage: '네, 내일 2시에 만나요!',
    lastMessageTime: '오전 11:30',
    unreadCount: 2,
  },
  {
    chatRoomId: 2,
    productTitle: '아이패드 Air',
    productImage: 'https://picsum.photos/seed/ipad/56/56',
    opponentName: '이영희',
    lastMessage: '가격 조정 가능한가요?',
    lastMessageTime: '어제',
    unreadCount: 0,
  },
])
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold text-text-main mb-4">채팅</h1>

    <div class="flex items-center gap-2 bg-gray-100 border border-border rounded-xl px-3.5 py-2.5 mb-4">
      <span class="text-base">🔍</span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="채팅 검색"
        class="flex-1 bg-transparent border-none outline-none text-sm text-text-main"
      />
    </div>

    <div
      v-for="room in chatRooms"
      :key="room.chatRoomId"
      class="flex items-center gap-3 px-2 py-4 border-b border-border cursor-pointer hover:bg-primary/5"
      @click="$router.push(`/chats/${room.chatRoomId}`)"
    >
      <img v-if="room.productImage" :src="room.productImage" class="w-14 h-14 rounded-lg object-cover shrink-0" />
      <div v-else class="w-14 h-14 rounded-lg bg-border shrink-0"></div>

      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-center mb-1">
          <span class="text-[15px] font-semibold text-text-main">{{ room.opponentName }}</span>
          <span class="text-xs text-text-sub shrink-0">{{ room.lastMessageTime }}</span>
        </div>
        <div class="text-xs text-primary font-medium mb-1">{{ room.productTitle }}</div>
        <div class="flex justify-between items-center">
          <span class="text-[13px] text-text-sub truncate">{{ room.lastMessage }}</span>
          <span
            v-if="room.unreadCount > 0"
            class="bg-primary text-white text-[11px] font-bold min-w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2"
          >
            {{ room.unreadCount }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
