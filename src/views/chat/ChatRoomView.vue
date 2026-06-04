<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Client } from '@stomp/stompjs'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import ProductInfoBar from '@/components/chat/ProductInfoBar.vue'
import MessageBubble from '@/components/chat/MessageBubble.vue'
import MessageInput from '@/components/chat/MessageInput.vue'
import { chatApi } from '@/api/chatApi'
import { useAuthStore } from '@/stores/auth'
import { auth } from '@/firebase'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const messages = ref([])
const opponentName = ref('')
const productInfo = ref({})
const stompClient = ref(null)
const messageListRef = ref(null)
const showNewMessageBanner = ref(false)  // 새 메시지 알림 배너

// 스크롤이 맨 아래에 있는지 확인
function isAtBottom() {
  if (!messageListRef.value) return true
  const el = messageListRef.value
  // 맨 아래에서 50px 이내면 "맨 아래"로 간주
  return el.scrollHeight - el.scrollTop - el.clientHeight < 50
}

// 맨 아래로 스크롤
async function scrollToBottom() {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    showNewMessageBanner.value = false
  }
}

// 메시지 목록 바뀔 때
watch(messages, () => {
  if (isAtBottom()) {
    // 이미 맨 아래에 있으면 자동 스크롤
    scrollToBottom()
  } else {
    // 위로 스크롤 중이면 배너 표시
    showNewMessageBanner.value = true
  }
}, { deep: true })

const chatRoomId = computed(() => Number(route.params.chatRoomId))
const myId = computed(() => authStore.user?.id)

// 시간 포맷
function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours < 12 ? '오전' : '오후'
  return `${ampm} ${hours % 12 || 12}:${minutes}`
}

// 이전 메시지 불러오기
async function loadMessages() {
  try {
    const { data } = await chatApi.getMessages(chatRoomId.value)
    messages.value = data.data.map(msg => ({
      messageId: msg.messageId,
      senderId: msg.senderId,
      senderType: msg.senderId === myId.value ? 'me' : 'other',
      content: msg.content,
      createdAt: formatTime(msg.createdAt),
    }))
  } catch (e) {
    console.error('메시지 불러오기 실패', e)
  }
}

// 채팅방 정보 불러오기 (상대방 이름, 상품 정보)
async function loadRoomInfo() {
  try {
    const { data } = await chatApi.getChatRooms()
    const room = data.data.find(r => r.chatRoomId === chatRoomId.value)
    if (room) {
      opponentName.value = room.opponentNickname
      productInfo.value = { productTitle: room.productTitle }
    }
  } catch (e) {
    console.error('채팅방 정보 불러오기 실패', e)
  }
}

// WebSocket 연결
async function connectWebSocket() {
  // Firebase 토큰 가져오기
  const token = await auth.currentUser?.getIdToken()

  const client = new Client({
    brokerURL: 'ws://localhost:8080/ws',
    reconnectDelay: 5000,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    onStompError: (frame) => {
      console.error('❌ STOMP 에러:', frame)
    },
    onConnect: () => {
      console.log('✅ WebSocket 연결 성공!')
      // 채팅방 구독 - 새 메시지 실시간 수신
      client.subscribe(`/topic/chat/${chatRoomId.value}`, (frame) => {
        console.log('📨 메시지 수신:', frame.body)
        const msg = JSON.parse(frame.body)
        messages.value.push({
          messageId: msg.messageId,
          senderId: msg.senderId,
          senderType: msg.senderId === myId.value ? 'me' : 'other',
          content: msg.content,
          createdAt: formatTime(msg.createdAt),
        })
      })
    },
  })

  client.activate()
  stompClient.value = client
}

// 메시지 전송
function handleSend(content) {
  console.log('전송 시도, connected:', stompClient.value?.connected)
  if (!stompClient.value?.connected) return
  stompClient.value.publish({
    destination: `/app/chat/${chatRoomId.value}/send`,
    body: JSON.stringify({ content }),
  })
}

// 채팅방 바뀔 때 재연결
watch(chatRoomId, async () => {
  if (stompClient.value) {
    stompClient.value.deactivate()
  }
  await loadRoomInfo()
  await loadMessages()
  connectWebSocket()
})

onMounted(async () => {
  await loadRoomInfo()
  await loadMessages()
  connectWebSocket()
})

onUnmounted(() => {
  stompClient.value?.deactivate()
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 모바일 헤더 -->
    <div class="flex items-center px-4 py-3 border-b border-border bg-white shrink-0 md:hidden">
      <button class="mr-3 cursor-pointer" @click="router.push('/chats')">
        <ArrowLeftIcon class="w-5 h-5 text-text-main" />
      </button>
      <span class="flex-1 text-center font-semibold text-text-main">{{ opponentName }}</span>
      <div class="w-5"></div>
    </div>

    <!-- 상품 정보 바 -->
    <ProductInfoBar
      :productImage="productInfo.productImage"
      :productTitle="productInfo.productTitle"
      :price="productInfo.price"
    />

    <!-- 메시지 목록 -->
    <div class="flex-1 relative overflow-hidden">
      <div ref="messageListRef" class="h-full overflow-y-auto p-4 flex flex-col gap-3">
        <MessageBubble
          v-for="message in messages"
          :key="message.messageId"
          :senderType="message.senderType"
          :content="message.content"
          :createdAt="message.createdAt"
        />
      </div>

      <!-- 새 메시지 알림 배너 -->
      <div
        v-if="showNewMessageBanner"
        @click="scrollToBottom"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition flex items-center gap-2"
      >
        <span>새 메시지가 있어요</span>
        <span>↓</span>
      </div>
    </div>

    <!-- 입력창 -->
    <MessageInput @send="handleSend" />
  </div>
</template>
