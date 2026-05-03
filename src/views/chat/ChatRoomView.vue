<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

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

const newMessage = ref('')

function sendMessage() {
  if (!newMessage.value.trim()) return
  messages.value.push({
    messageId: Date.now(),
    senderType: 'me',
    content: newMessage.value,
    createdAt: '방금',
  })
  newMessage.value = ''
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
    <div class="flex items-center gap-3 px-4 py-3 border-b border-border bg-white shrink-0">
      <img :src="productInfo.productImage" class="w-12 h-12 rounded-lg object-cover" />
      <div class="flex-1">
        <div class="text-sm font-semibold text-text-main">{{ productInfo.productTitle }}</div>
        <div class="text-[13px] text-text-sub mt-0.5">{{ productInfo.price?.toLocaleString() }}원</div>
      </div>
      <button
        class="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold cursor-pointer transition-colors"
      >
        거래완료
      </button>
    </div>

    <!-- 메시지 목록 -->
    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      <div
        v-for="message in messages"
        :key="message.messageId"
        :class="['flex items-end gap-2', message.senderType === 'me' ? 'justify-end' : 'justify-start']"
      >
        <div v-if="message.senderType === 'other'" class="w-8 h-8 rounded-full bg-border shrink-0 overflow-hidden">
          <img src="https://picsum.photos/seed/user/32/32" class="w-full h-full object-cover" />
        </div>

        <div :class="['max-w-[60%] flex flex-col', message.senderType === 'me' ? 'items-end' : 'items-start']">
          <p
            :class="[
              'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed m-0',
              message.senderType === 'me'
                ? 'bg-primary text-white rounded-br-[4px]'
                : 'bg-white text-text-main border border-border rounded-bl-[4px]',
            ]"
          >
            {{ message.content }}
          </p>
          <span class="text-[11px] text-text-sub mt-1">{{ message.createdAt }}</span>
        </div>
      </div>
    </div>

    <!-- 입력창 -->
    <div class="flex gap-2 px-4 py-3 border-t border-border bg-white shrink-0">
      <input
        v-model="newMessage"
        type="text"
        placeholder="메시지를 입력하세요"
        class="flex-1 px-3.5 py-2.5 border border-border rounded-3xl text-sm outline-none focus:border-primary"
        @keyup.enter="sendMessage"
      />
      <button
        class="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-3xl text-sm font-semibold cursor-pointer transition-colors"
        @click="sendMessage"
      >
        전송
      </button>
    </div>
  </div>
</template>
