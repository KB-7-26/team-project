<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ChatListView from './ChatListView.vue'

const route = useRoute()
const hasChatRoom = computed(() => !!route.params.chatRoomId)
</script>

<template>
  <div class="flex h-[calc(100vh-60px)] border-t-2 border-[#c8bca8]">
    <!-- 채팅 목록 패널 -->
    <div
      :class="[
        'w-full md:w-85 md:shrink-0 border-r-2 border-[#c8bca8] overflow-y-auto bg-paper',
        hasChatRoom ? 'hidden md:block' : 'block',
      ]"
    >
      <ChatListView />
    </div>
    <!-- 채팅방 패널 -->
    <div
      :class="[
        'flex-1 overflow-hidden bg-paper-dots',
        hasChatRoom ? 'flex flex-col' : 'hidden md:flex md:flex-col',
      ]"
    >
      <!-- 데스크탑: 채팅방 미선택 상태 -->
      <div v-if="!hasChatRoom" class="hidden md:flex flex-col items-center justify-center h-full gap-3 text-[#8c7e6e]">
        <span class="text-5xl opacity-30">✉️</span>
        <p class="font-bold text-base">채팅방을 선택해주세요</p>
      </div>
      <RouterView v-else />
    </div>
  </div>
</template>
