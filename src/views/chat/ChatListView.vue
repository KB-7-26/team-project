<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ChatBubbleLeftRightIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import ChatRoomCard from '@/components/chat/ChatRoomCard.vue'
import { chatApi } from '@/api/chatApi'
import { useChatStore } from '@/stores/chat'

const route = useRoute()
const chatStore = useChatStore()

const activeChatRoomId = computed(() => Number(route.params.chatRoomId) || null)
const searchQuery = ref('')
const chatRooms = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

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

const filteredRooms = computed(() => {
  if (!searchQuery.value) return chatRooms.value
  return chatRooms.value.filter(
    (room) => room.opponentName.includes(searchQuery.value) || room.productTitle.includes(searchQuery.value),
  )
})

async function loadChatRooms() {
  if (chatRooms.value.length === 0) isLoading.value = true
  try {
    const { data } = await chatApi.getChatRooms()
    chatRooms.value = data.data.map((room) => ({
      chatRoomId: room.chatRoomId,
      productTitle: room.productTitle,
      productImage: room.productImageUrl,
      opponentName: room.opponentNickname,
      lastMessage: room.lastMessage ?? '',
      lastMessageTime: formatTime(room.lastMessageAt ?? room.createdAt),
      unreadCount: room.unreadCount ?? 0,
    }))
  } catch (e) {
    errorMessage.value = '채팅방 목록을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

watch(() => chatStore.unreadCount, loadChatRooms)
watch(
  () => chatStore.lastMessageEvent,
  (event) => {
    if (!event) return
    const idx = chatRooms.value.findIndex((r) => r.chatRoomId === event.chatRoomId)
    if (idx === -1) return
    const [room] = chatRooms.value.splice(idx, 1)
    room.lastMessageTime = event.time
    chatRooms.value.unshift(room)
  },
  { deep: true },
)
onMounted(loadChatRooms)
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 헤더 -->
    <div class="px-5 pt-6 pb-4 border-b-2 border-[#c8bca8]">
      <h1 class="font-bold text-xl text-ink mb-4">채팅 목록</h1>
      <!-- 검색바 -->
      <div
        class="flex items-center gap-2 bg-paper/60 border-2 border-[#c8bca8] rounded-xl px-3.5 py-2.5 focus-within:border-ink transition-colors"
      >
        <MagnifyingGlassIcon class="w-4 h-4 text-[#8c7e6e] shrink-0" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="이름이나 상품으로 검색"
          class="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-[#c8bca8]"
        />
      </div>
    </div>

    <!-- 채팅방 목록 -->
    <div class="flex-1 overflow-y-auto">
      <!-- 로딩 -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 gap-2 text-[#8c7e6e]">
        <ChatBubbleLeftRightIcon class="w-8 h-8 animate-pulse" />
        <p class="text-sm">불러오는 중...</p>
      </div>

      <!-- 에러 -->
      <div v-else-if="errorMessage" class="text-center text-red-400 text-sm py-16 px-4">
        {{ errorMessage }}
      </div>

      <!-- 비어있을 때 -->
      <div
        v-else-if="filteredRooms.length === 0"
        class="flex flex-col items-center justify-center py-16 gap-2 text-[#8c7e6e]"
      >
        <span class="text-4xl opacity-40">✉️</span>
        <p class="text-sm font-bold">채팅방이 없습니다</p>
        <p class="text-xs">거래 상품 페이지에서 채팅을 시작해보세요</p>
      </div>

      <!-- 목록 -->
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
        :isActive="room.chatRoomId === activeChatRoomId"
        :hasPendingReview="Boolean(chatStore.pendingReviewByRoom[room.chatRoomId])"
        @click="$router.push(`/chats/${room.chatRoomId}`)"
      />
    </div>
  </div>
</template>
