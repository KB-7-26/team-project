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
import { WS_BASE_URL } from '@/config/env'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()

const messages = ref([])
const opponentName = ref('')
const productInfo = ref({})
let stompClient = null
let subscriptions = []
const messageListRef = ref(null)
const showNewMessageBanner = ref(false)
const opponentLastReadAt = ref(null)
const showTradeConfirm = ref(false)
const isCompleting = ref(false)
const tradeCompleted = ref(false)
const currentTransactionId = ref(null)
const isSeller = ref(false)

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

// 읽음 처리 + 네비바 뱃지 갱신 (탭이 보이는 상태일 때만)
async function markAsReadAndUpdate() {
  if (!chatRoomId.value || document.visibilityState !== 'visible') return
  try {
    const { data } = await chatApi.markAsRead(chatRoomId.value)
    opponentLastReadAt.value = data.data?.opponentLastReadAt ?? null
  } catch {
    // 읽음 처리는 실패해도 채팅 화면 사용을 막지 않습니다.
  }
  chatStore.fetchUnreadCount()
}

// 탭 전환 시 다시 보이면 읽음 처리
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') markAsReadAndUpdate()
}

// 채팅방 안에 있을 때 pendingReview 감지 → 즉시 말풍선 표시
watch(
  () => chatStore.pendingReview,
  (val) => {
    if (!val) return
    currentTransactionId.value = val.transactionId
    tradeCompleted.value = true
    chatStore.clearPendingReview()
    addReviewMessage()
  },
)

// 메시지 개수 변화를 watch (deep 대신 length 감지로 정확하게)
watch(
  () => messages.value.length,
  (newLen, oldLen) => {
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
  },
)

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
    messages.value = data.data.map((msg) => ({
      messageId: msg.messageId,
      senderId: msg.senderId,
      senderNickname: msg.senderNickname,
      senderImageUrl: msg.senderProfileImageUrl ?? '',
      senderType: msg.senderId === myId.value ? 'me' : 'other',
      content: msg.content,
      createdAt: formatTime(msg.createdAt),
      rawCreatedAt: msg.createdAt,
    }))

    // 이 방에 대기 중인 별점 있으면 메시지 추가
    const pendingTxId = chatStore.pendingReviewByRoom[chatRoomId.value]
    if (pendingTxId) {
      currentTransactionId.value = pendingTxId
      addReviewMessage()
    }
  } catch (e) {
    console.error('메시지 불러오기 실패', e)
  }
}

// 채팅방 정보 불러오기 (상대방 이름, 상품 정보)
async function loadRoomInfo() {
  try {
    const { data } = await chatApi.getChatRooms()
    const room = data.data.find((r) => r.chatRoomId === chatRoomId.value)
    if (room) {
      opponentName.value = room.opponentNickname
      productInfo.value = {
        productId: room.productId,
        productTitle: room.productTitle,
        productImage: room.productImageUrl,
        price: room.productPrice,
      }
      opponentLastReadAt.value = room.opponentLastReadAt ?? null
      isSeller.value = room.sellerId === myId.value
    }

    // 거래완료 여부 확인
    const txRes = await chatApi.getTransaction(chatRoomId.value).catch(() => null)
    if (txRes?.data?.data?.status === 'completed') {
      tradeCompleted.value = true
    }
  } catch (e) {
    console.error('채팅방 정보 불러오기 실패', e)
  }
}

// WebSocket 연결
async function connectWebSocket() {
  // 기존 구독 먼저 해제
  subscriptions.forEach((sub) => sub.unsubscribe())
  subscriptions = []

  // 기존 연결 끊기
  if (stompClient) {
    stompClient.deactivate()
    stompClient = null
  }

  const token = await auth.currentUser?.getIdToken()

  const client = new Client({
    brokerURL: WS_BASE_URL,
    reconnectDelay: 5000,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
      },
      onStompError: (frame) => {
        console.error('STOMP 에러:', frame)
      },
    onConnect: () => {
      // 재연결 시 중복 구독 방지: 이 클라이언트가 여전히 활성 클라이언트인지 확인
      if (stompClient !== client) return
      // 재연결 시 이전 구독 해제 후 재구독
      subscriptions.forEach((sub) => sub.unsubscribe())
      subscriptions = []

      const readSub = client.subscribe(`/topic/chat/${chatRoomId.value}/read`, (frame) => {
        const { readerId, readAt } = JSON.parse(frame.body)
        if (readerId !== myId.value) {
          opponentLastReadAt.value = readAt
        }
      })

      const msgSub = client.subscribe(`/topic/chat/${chatRoomId.value}`, (frame) => {
        const msg = JSON.parse(frame.body)
        const isMyMessage = msg.senderId === myId.value
        const realMsg = {
          messageId: msg.messageId,
          senderId: msg.senderId,
          senderNickname: msg.senderNickname,
          senderImageUrl: msg.senderProfileImageUrl ?? '',
          senderType: isMyMessage ? 'me' : 'other',
          content: msg.content,
          createdAt: formatTime(msg.createdAt),
          rawCreatedAt: msg.createdAt,
        }
        if (isMyMessage) {
          const tempIndex = messages.value.findLastIndex(
            (m) => typeof m.messageId === 'string' && m.messageId.startsWith('temp-') && m.content === msg.content,
          )
          if (tempIndex !== -1) {
            messages.value.splice(tempIndex, 1, realMsg)
            chatStore.triggerListRefresh(chatRoomId.value, formatTime(msg.createdAt), msg.content)
            return
          }
        }
        messages.value.push(realMsg)
        chatStore.triggerListRefresh(chatRoomId.value, formatTime(msg.createdAt), msg.content)
        if (!isMyMessage && isAtBottom()) {
          markAsReadAndUpdate()
        }
      })

      subscriptions = [readSub, msgSub]
    },
  })

  stompClient = client
  client.activate()
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

// 별점 메시지 추가
function addReviewMessage() {
  if (messages.value.some((m) => m.type === 'review')) return
  messages.value.push({
    messageId: 'review-' + Date.now(),
    type: 'review',
    senderType: 'system',
    content: null,
    createdAt: '',
    rawCreatedAt: '',
  })
  scrollToBottom()
}

// 거래완료 → 별점 말풍선 추가
async function completeTrade() {
  if (isCompleting.value) return
  isCompleting.value = true
  try {
    const { data } = await chatApi.createTransaction(chatRoomId.value)
    currentTransactionId.value = data.data.transactionId
    tradeCompleted.value = true
    showTradeConfirm.value = false
    // 방별 리뷰 상태 저장 (나갔다 들어와도 유지)
    chatStore.pendingReviewByRoom[chatRoomId.value] = data.data.transactionId
    addReviewMessage()
  } catch (e) {
    console.error('거래완료 처리 실패', e)
  } finally {
    isCompleting.value = false
  }
}

// 별점 제출
async function handleReviewSubmit(rating) {
  try {
    await chatApi.createReview(currentTransactionId.value, rating)
  } catch (e) {
    console.error('리뷰 작성 실패', e)
  } finally {
    messages.value = messages.value.filter((m) => m.type !== 'review')
    chatStore.clearRoomReview(chatRoomId.value)
  }
}

// 메시지 전송
function handleSend(content) {
  if (!stompClient?.connected) return
  const tempId = 'temp-' + Date.now()
  messages.value.push({
    messageId: tempId,
    senderId: myId.value,
    senderNickname: authStore.user?.nickname ?? '',
    senderImageUrl: authStore.user?.profileImageUrl ?? '',
    senderType: 'me',
    content,
    createdAt: formatTime(new Date().toISOString()),
    rawCreatedAt: new Date().toISOString(),
  })
  stompClient.publish({
    destination: `/app/chat/${chatRoomId.value}/send`,
    body: JSON.stringify({ content }),
  })
}

// 채팅방 바뀔 때 재연결
watch(chatRoomId, async () => {
  currentTransactionId.value = null
  await loadRoomInfo()
  await loadMessages()
  connectWebSocket()
  markAsReadAndUpdate()
})

function handleKeydown(e) {
  if (e.key !== 'Escape') return
  if (showTradeConfirm.value) {
    showTradeConfirm.value = false
    return
  }
  router.push('/chats')
}

onMounted(async () => {
  await loadRoomInfo()
  await loadMessages()
  connectWebSocket()
  markAsReadAndUpdate()
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // 채팅방 입장 시 대기 중인 별점 요청 확인
  if (chatStore.pendingReview) {
    currentTransactionId.value = chatStore.pendingReview.transactionId
    tradeCompleted.value = true
    chatStore.clearPendingReview()
    addReviewMessage()
  }
})

onUnmounted(() => {
  subscriptions.forEach((sub) => sub.unsubscribe())
  subscriptions = []
  stompClient?.deactivate()
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
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
      :isSeller="isSeller"
      @complete-trade="showTradeConfirm = true"
    />

    <!-- 메시지 목록 -->
    <div class="flex-1 relative overflow-hidden">
      <div ref="messageListRef" class="h-full overflow-y-auto p-4 flex flex-col gap-3 bg-[#eef7f2]">
        <MessageBubble
          v-for="(message, index) in messages"
          :key="message.messageId"
          :type="message.type || 'message'"
          :senderType="message.senderType"
          :senderId="message.senderId"
          :senderNickname="message.senderNickname"
          :senderImageUrl="message.senderImageUrl"
          :content="message.content"
          :createdAt="message.createdAt"
          :reportProductId="productInfo.productId"
          :isUnread="
            message.senderType === 'me' && (opponentLastReadAt === null || message.rawCreatedAt > opponentLastReadAt)
          "
          :showTime="message.type === 'review' ? false : shouldShowTime(index)"
          :showProfile="message.type === 'review' ? false : shouldShowProfile(index)"
          :opponentName="opponentName"
          @review-submit="handleReviewSubmit"
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
    <MessageInput :chatRoomId="chatRoomId" @send="handleSend" />
  </div>

  <!-- 거래완료 확인 모달 -->
  <Teleport to="body">
    <div
      v-if="showTradeConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40"
      @click.self="showTradeConfirm = false"
    >
      <div class="bg-white border-2 border-ink rounded-2xl shadow-[6px_6px_0_#1c1712] p-6 w-80 flex flex-col gap-4">
        <p class="font-bold text-ink text-lg">거래를 완료할까요?</p>
        <p class="text-sm text-[#8c7e6e] -mt-2">상품이 판매완료 상태로 변경돼요.</p>
        <div class="flex gap-3">
          <button
            @click="showTradeConfirm = false"
            class="flex-1 py-2.5 rounded-xl border-2 border-ink font-bold text-sm text-ink hover:bg-gray-50 transition shadow-[2px_2px_0_#1c1712]"
          >
            취소
          </button>
          <button
            @click="completeTrade"
            :disabled="isCompleting"
            class="flex-1 py-2.5 rounded-xl bg-[#ffe066] border-2 border-ink font-bold text-sm text-ink hover:bg-primary/20 transition shadow-[2px_2px_0_#1c1712] disabled:opacity-50"
          >
            {{ isCompleting ? '처리 중...' : '거래완료' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
