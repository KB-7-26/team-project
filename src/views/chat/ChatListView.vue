<script setup>
import { ref } from 'vue'

const searchQuery = ref('')

const chatRooms = ref([
  {
    chatRoomId: 1,
    productTitle: '맥북 프로 M1',
    productImage: '',
    opponentName: '김철수',
    lastMessage: '네, 내일 2시에 만나요!',
    lastMessageTime: '오전 11:30',
    unreadCount: 2,
  },
  {
    chatRoomId: 2,
    productTitle: '아이패드 Air',
    productImage: '',
    opponentName: '이영희',
    lastMessage: '가격 조정 가능한가요?',
    lastMessageTime: '어제',
    unreadCount: 0,
  },
])
</script>

<template>
  <div class="chat-list">
    <h1>채팅</h1>

    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input v-model="searchQuery" type="text" placeholder="채팅 검색" />
    </div>

    <div
      v-for="room in chatRooms"
      :key="room.chatRoomId"
      class="chat-card"
      @click="$router.push(`/chats/${room.chatRoomId}`)"
    >
      <img v-if="room.productImage" :src="room.productImage" class="product-img" />
      <div v-else class="product-img-empty"></div>

      <div class="chat-info">
        <div class="top-row">
          <span class="opponent-name">{{ room.opponentName }}</span>
          <span class="time">{{ room.lastMessageTime }}</span>
        </div>
        <div class="product-title">{{ room.productTitle }}</div>
        <div class="bottom-row">
          <span class="last-message">{{ room.lastMessage }}</span>
          <span v-if="room.unreadCount > 0" class="unread">{{ room.unreadCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-list {
  padding: 20px 16px;
}

h1 {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 16px;
}

.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #1a1a1a;
  width: 100%;
}

.chat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 8px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
}

.chat-card:hover {
  background: rgb(255 184 0 / 5%);
}

.product-img {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.product-img-empty {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: #e0e0e0;
  flex-shrink: 0;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.opponent-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.time {
  font-size: 12px;
  color: #999999;
  flex-shrink: 0;
}

.product-title {
  font-size: 12px;
  color: #ffb800;
  font-weight: 500;
  margin-bottom: 4px;
}

.bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-message {
  font-size: 13px;
  color: #999999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread {
  background: #ffb800;
  color: white;
  font-size: 11px;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
