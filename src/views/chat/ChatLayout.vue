<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ChatListView from './ChatListView.vue'

const route = useRoute()
const hasChatRoom = computed(() => !!route.params.chatRoomId)
</script>

<template>
  <div class="flex h-[calc(100vh-64px)] border-t border-border">
    <div
      :class="[
        'w-full md:w-[360px] md:shrink-0 border-r border-border overflow-y-auto',
        hasChatRoom ? 'hidden md:block' : 'block',
      ]"
    >
      <ChatListView />
    </div>
    <div
      :class="[
        'flex-1 overflow-hidden bg-sub-bg',
        hasChatRoom ? 'flex flex-col' : 'hidden md:flex md:flex-col',
      ]"
    >
      <RouterView />
    </div>
  </div>
</template>
