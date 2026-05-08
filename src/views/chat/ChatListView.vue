<script setup>
import { ref } from 'vue'
import ChatRoomCard from '@/components/chat/ChatRoomCard.vue'

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

    <ChatRoomCard
      v-for="room in chatRooms"
      :key="room.chatRoomId"
      :productImage="room.productImage"
      :opponentName="room.opponentName"
      :lastMessageTime="room.lastMessageTime"
      :productTitle="room.productTitle"
      :lastMessage="room.lastMessage"
      :unreadCount="room.unreadCount"
      @click="$router.push(`/chats/${room.chatRoomId}`)"
    />
  </div>
</template>
