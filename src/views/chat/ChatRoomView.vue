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
const opponentLastReadAt = ref(null)
const showTradeConfirm = ref(false)
const isCompleting = ref(false)
const tradeCompleted = ref(false)

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
  if (!chatRoomId.value) return
  try {
    const { data } = await chatApi.markAsRead(chatRoomId.value)
    opponentLastReadAt.value = data.data?.opponentLastReadAt ?? null
  } catch {}
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
  if (!chatRoomId.value) return
  try {
    const { data } = await chatApi.getMessages(chatRoomId.value)
    messages.value = data.data.map(msg => ({
      messageId: msg.messageId,
      senderId: msg.senderId,
      senderType: msg.senderId === myId.value ? 'me' : 'other',
      content: msg.content,
      createdAt: formatTime(msg.createdAt),
      rawCreatedAt: msg.createdAt,
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
      // 읽음 이벤트 구독 - 상대방이 읽으면 opponentLastReadAt 갱신
      client.subscribe(`/topic/chat/${chatRoomId.value}/read`, (frame) => {
        const { readerId, readAt } = JSON.parse(frame.body)
        if (readerId !== myId.value) {
          opponentLastReadAt.value = readAt
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
          rawCreatedAt: msg.createdAt,
        })
        chatStore.triggerListRefresh(chatRoomId.value, formatTime(msg.createdAt))
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

// 시간 표시 여부: 다음 메시지가 다른 사람이거나 다른 분이거나 마지막이면 표시
function shouldShowTime(index) {
  const current = messages.value[index]
  const next = messages.value[index + 1]
  if (!next) return true
  return current.createdAt !== next.createdAt || current.senderId !== next.senderId
}

// 프로필 표시 여부: 이전 메시지가 다른 사람이거나 첫 메시지면 표시
function shouldShowProfile(index) {
  const current = messages.value[index]
  const prev = messages.value[index - 1]
  if (!prev) return true
  return prev.senderId !== current.senderId
}

// 거래완료
async function completeTrade() {
  if (isCompleting.value) return
  isCompleting.value = true
  try {
    await chatApi.completeTrade(chatRoomId.value)
    tradeCompleted.value = true
    showTradeConfirm.value = false
  } catch (e) {
    console.error('거래완료 처리 실패', e)
  } finally {
    isCompleting.value = false
  }
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

function handleKeydown(e) {
  if (e.key !== 'Escape') return
  if (showTradeConfirm.value) { showTradeConfirm.value = false; return }
  router.push('/chats')
}

onMounted(async () => {
  await loadRoomInfo()
  await loadMessages()
  connectWebSocket()
  markAsReadAndUpdate()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  stompClient.value?.deactivate()
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 모바일 헤더 -->
    <div class="flex items-center px-4 py-3 border-b-2 border-ink bg-[#eef7f2] shrink-0 md:hidden">
      <button class="mr-3 cursor-pointer hover:opacity-70 transition-opacity" @click="router.push('/chats')">
        <ArrowLeftIcon class="w-5 h-5 text-ink" />
      </button>
      <span class="flex-1 text-center font-bold text-ink">{{ opponentName }}</span>
      <div class="w-5"></div>
    </div>

    <!-- 상품 정보 바 -->
    <ProductInfoBar
      :productImage="productInfo.productImage"
      :productTitle="productInfo.productTitle"
      :price="productInfo.price"
      :tradeCompleted="tradeCompleted"
      @complete-trade="showTradeConfirm = true"
    />

    <!-- 메시지 목록 -->
    <div class="flex-1 relative overflow-hidden">
      <div ref="messageListRef" class="h-full overflow-y-auto p-4 flex flex-col gap-3 bg-[#eef7f2]">
        <MessageBubble
          v-for="(message, index) in messages"
          :key="message.messageId"
          :senderType="message.senderType"
          :content="message.content"
          :createdAt="message.createdAt"
          :isUnread="message.senderType === 'me' && (opponentLastReadAt === null || message.rawCreatedAt > opponentLastReadAt)"
          :showTime="shouldShowTime(index)"
          :showProfile="shouldShowProfile(index)"
        />
      </div>

      <!-- 새 메시지 알림 배너 -->
      <div
        v-if="showNewMessageBanner"
        @click="scrollToBottom"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#ffe066] border-2 border-ink text-ink text-sm font-bold px-4 py-2 rounded-2xl shadow-[3px_3px_0_#1c1712] cursor-pointer hover:-translate-y-0.5 transition-all flex items-center gap-2"
      >
        <span>새 메시지가 있어요</span>
        <span>↓</span>
      </div>
    </div>

    <!-- 입력창 -->
    <MessageInput @send="handleSend" />
  </div>

  <!-- 거래완료 확인 모달 -->
  <Teleport to="body">
    <div v-if="showTradeConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40" @click.self="showTradeConfirm = false">
      <div class="bg-white border-2 border-ink rounded-2xl shadow-[6px_6px_0_#1c1712] p-6 w-80 flex flex-col gap-4">
        <p class="font-bold text-ink text-lg">거래를 완료할까요?</p>
        <p class="text-sm text-[#8c7e6e] -mt-2">상품이 판매완료 상태로 변경돼요.</p>
        <div class="flex gap-3">
          <button
            @click="showTradeConfirm = false"
            class="flex-1 py-2.5 rounded-xl border-2 border-ink font-bold text-sm text-ink hover:bg-gray-50 transition shadow-[2px_2px_0_#1c1712]"
          >취소</button>
          <button
            @click="completeTrade"
            :disabled="isCompleting"
            class="flex-1 py-2.5 rounded-xl bg-[#ffe066] border-2 border-ink font-bold text-sm text-ink hover:bg-primary/20 transition shadow-[2px_2px_0_#1c1712] disabled:opacity-50"
          >{{ isCompleting ? '처리 중...' : '거래완료' }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
