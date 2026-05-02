<script setup>
import ChatListView from './ChatListView.vue'
</script>

<template>
  <div class="chat-layout">
    <div class="chat-sidebar">
      <ChatListView />
    </div>
    <div class="chat-main">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.chat-layout {
  display: flex;
  height: calc(100vh - 64px);
  border-top: 1px solid #e0e0e0;
}

.chat-sidebar {
  width: 360px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  flex-shrink: 0;
}

.chat-main {
  flex: 1;
  overflow-y: auto;
  background: #fafafa;
}
</style>
