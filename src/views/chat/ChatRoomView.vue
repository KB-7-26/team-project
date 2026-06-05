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
import { useChatStore } from '@/stores/chat'
import { auth } from '@/firebase'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()

const messages = ref([])
const opponentName = ref('')
const productInfo = ref({})
const stompClient = ref(null)
const messageListRef = ref(null)
const showNewMessageBanner = ref(false)
const opponentRead = ref(false) // 상대방이 읽었는지

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

// 읽음 처리 + 네비바 뱃지 갱신
async function markAsReadAndUpdate() {
  await chatApi.markAsRead(chatRoomId.value).catch(() => {})
  chatStore.fetchUnreadCount()
}

// 메시지 개수 변화를 watch (deep 대신 length 감지로 정확하게)
watch(() => messages.value.length, (newLen, oldLen) => {
  if (newLen <= oldLen) return
  const lastMsg = messages.value[newLen - 1]

  if (lastMsg.senderType === 'me') {
    // 내가 보낸 메시지 → 항상 맨 아래로
    scrollToBottom()
  } else {
    // 상대방 메시지 → 맨 아래에 있으면 스크롤, 아니면 배너
    if (isAtBottom()) scrollToBottom()
    else showNewMessageBanner.value = true
  }
})

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
    opponentRead.value = false
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
      // 읽음 이벤트 구독 - 상대방이 읽었을 때만 opponentRead = true
      client.subscribe(`/topic/chat/${chatRoomId.value}/read`, (frame) => {
        const readerId = JSON.parse(frame.body)
        if (readerId !== myId.value) {
          opponentRead.value = true
        }
      })

      // 채팅방 구독 - 새 메시지 실시간 수신
      client.subscribe(`/topic/chat/${chatRoomId.value}`, (frame) => {
        const msg = JSON.parse(frame.body)
        const isMyMessage = msg.senderId === myId.value
        messages.value.push({
          messageId: msg.messageId,
          senderId: msg.senderId,
          senderType: isMyMessage ? 'me' : 'other',
          content: msg.content,
          createdAt: formatTime(msg.createdAt),
        })
        // 상대방 메시지이고 현재 맨 아래에서 보고 있으면 즉시 읽음 처리
        if (!isMyMessage && isAtBottom()) {
          markAsReadAndUpdate()
        }
      })
    },
  })

  client.activate()
  stompClient.value = client
}

// 메시지 전송
function handleSend(content) {
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
  markAsReadAndUpdate()
})

onMounted(async () => {
  await loadRoomInfo()
  await loadMessages()
  connectWebSocket()
  markAsReadAndUpdate()
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
          :isRead="opponentRead"
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
