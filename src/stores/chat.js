import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatApi } from '@/api/chatApi'

export const useChatStore = defineStore('chat', () => {
  const unreadCount = ref(0)

  async function fetchUnreadCount() {
    try {
      const { data } = await chatApi.getUnreadCount()
      unreadCount.value = data.data ?? 0
    } catch {
      unreadCount.value = 0
    }
  }

  function clearUnread() {
    unreadCount.value = 0
  }

  return { unreadCount, fetchUnreadCount, clearUnread }
})
