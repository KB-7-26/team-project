<script setup>
import { ref, computed, onMounted } from 'vue'
import ChatRoomCard from '@/components/chat/ChatRoomCard.vue'
import { chatApi } from '@/api/chatApi'

const searchQuery = ref('')
const chatRooms = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

// 시간 포맷 함수: "2026-05-31T10:30:00" → "오전 10:30" or "어제" 등
function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const ampm = hours < 12 ? '오전' : '오후'
    const h = hours % 12 || 12
    return `${ampm} ${h}:${minutes}`
  } else if (diffDays === 1) {
    return '어제'
  } else if (diffDays < 7) {
    return `${diffDays}일 전`
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
}

// 검색어로 필터링
const filteredRooms = computed(() => {
  if (!searchQuery.value) return chatRooms.value
  return chatRooms.value.filter(room =>
    room.opponentName.includes(searchQuery.value) ||
    room.productTitle.includes(searchQuery.value)
  )
})

// 컴포넌트가 화면에 그려질 때 API 호출
onMounted(async () => {
  isLoading.value = true
  try {
    const { data } = await chatApi.getChatRooms()
    chatRooms.value = data.data.map(room => ({
      chatRoomId: room.chatRoomId,
      productTitle: room.productTitle,
      productImage: null,
      opponentName: room.opponentNickname,
      lastMessage: '',
      lastMessageTime: formatTime(room.lastMessageAt ?? room.createdAt),
      unreadCount: 0,
    }))
  } catch (e) {
    errorMessage.value = '채팅방 목록을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
})
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

    <!-- 로딩 중 -->
    <div v-if="isLoading" class="text-center text-text-sub text-sm py-10">
      불러오는 중...
    </div>

    <!-- 에러 -->
    <div v-else-if="errorMessage" class="text-center text-red-400 text-sm py-10">
      {{ errorMessage }}
    </div>

    <!-- 채팅방 없을 때 -->
    <div v-else-if="filteredRooms.length === 0" class="text-center text-text-sub text-sm py-10">
      채팅방이 없습니다.
    </div>

    <!-- 채팅방 목록 -->
    <ChatRoomCard
      v-else
      v-for="room in filteredRooms"
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
