<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const chatRoomData = {
  1: {
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

const productInfo = computed(() => chatRoomData[Number(route.params.chatRoomId)]?.productInfo || {})
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
  <div class="chat-room">
    <div class="product-bar">
      <img :src="productInfo.productImage" class="product-img" />
      <div class="product-info">
        <div class="product-title">{{ productInfo.productTitle }}</div>
        <div class="product-price">{{ productInfo.price.toLocaleString() }}원</div>
      </div>
      <button class="complete-btn">거래완료</button>
    </div>

    <div class="message-list">
      <div
        v-for="message in messages"
        :key="message.messageId"
        :class="['message-row', message.senderType === 'me' ? 'me' : 'other']"
      >
        <div class="bubble">
          <p>{{ message.content }}</p>
          <span class="time">{{ message.createdAt }}</span>
        </div>
      </div>
    </div>

    <div class="input-area">
      <input v-model="newMessage" type="text" placeholder="메시지를 입력하세요" @keyup.enter="sendMessage" />
      <button class="send-btn" @click="sendMessage">전송</button>
    </div>
  </div>
</template>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #ffffff;
  flex-shrink: 0;
}

.product-img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.product-info {
  flex: 1;
}

.product-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.product-price {
  font-size: 13px;
  color: #999999;
  margin-top: 2px;
}

.complete-btn {
  padding: 8px 16px;
  background: #ffb800;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.complete-btn:hover {
  background: #e5a600;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-row {
  display: flex;
}

.message-row.me {
  justify-content: flex-end;
}

.message-row.other {
  justify-content: flex-start;
}

.bubble {
  max-width: 60%;
  display: flex;
  flex-direction: column;
}

.message-row.me .bubble {
  align-items: flex-end;
}

.message-row.other .bubble {
  align-items: flex-start;
}

.bubble p {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.message-row.me .bubble p {
  background: #ffb800;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-row.other .bubble p {
  background: #ffffff;
  color: #1a1a1a;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
}

.time {
  font-size: 11px;
  color: #999999;
  margin-top: 4px;
}

.input-area {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  background: #ffffff;
  flex-shrink: 0;
}

.input-area input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
}

.input-area input:focus {
  border-color: #ffb800;
}

.send-btn {
  padding: 10px 20px;
  background: #ffb800;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.send-btn:hover {
  background: #e5a600;
}
</style>
