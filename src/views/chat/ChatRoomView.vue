<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import ProductInfoBar from '@/components/chat/ProductInfoBar.vue'
import MessageBubble from '@/components/chat/MessageBubble.vue'
import MessageInput from '@/components/chat/MessageInput.vue'

const route = useRoute()
const router = useRouter()

const chatRoomData = {
  1: {
    opponentName: '김철수',
    productInfo: {
      productTitle: '맥북 프로 M1',
      productImage: 'https://picsum.photos/seed/mac/56/56',
      price: 1200000,
    },
    messages: [
      { messageId: 1, senderType: 'other', content: '안녕하세요! 맥북 아직 판매 중이신가요?', createdAt: '오전 10:45' },
      { messageId: 2, senderType: 'me', content: '네, 판매 중입니다!', createdAt: '오전 10:47' },
      { messageId: 3, senderType: 'other', content: '혹시 직거래 가능할까요?', createdAt: '오전 10:50' },
    ],
  },
  2: {
    opponentName: '이영희',
    productInfo: {
      productTitle: '아이패드 Air',
      productImage: 'https://picsum.photos/seed/ipad/56/56',
      price: 800000,
    },
    messages: [
      { messageId: 1, senderType: 'other', content: '가격 조정 가능한가요?', createdAt: '어제' },
      { messageId: 2, senderType: 'me', content: '조금 가능합니다!', createdAt: '어제' },
    ],
  },
}

const currentRoom = computed(() => chatRoomData[Number(route.params.chatRoomId)])
const productInfo = computed(() => currentRoom.value?.productInfo || {})
const opponentName = computed(() => currentRoom.value?.opponentName || '')
const messages = ref([])

watch(
  () => route.params.chatRoomId,
  (newId) => {
    messages.value = [...(chatRoomData[Number(newId)]?.messages || [])]
  },
  { immediate: true },
)

function handleSend(content) {
  messages.value.push({
    messageId: Date.now(),
    senderType: 'me',
    content,
    createdAt: '방금',
  })
}
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
    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      <MessageBubble
        v-for="message in messages"
        :key="message.messageId"
        :senderType="message.senderType"
        :content="message.content"
        :createdAt="message.createdAt"
      />
    </div>

    <!-- 입력창 -->
    <MessageInput @send="handleSend" />
  </div>
</template>
