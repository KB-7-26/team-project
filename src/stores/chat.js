import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatApi } from '@/api/chatApi'

export const useChatStore = defineStore('chat', () => {
  const unreadCount = ref(0)
  const lastMessageEvent = ref(null) // { chatRoomId, time }
  const pendingReview = ref(null)    // 구매자에게 온 별점 요청 { transactionId, chatRoomId }
  const pendingReviewByRoom = ref({}) // 방별 대기 리뷰 { [chatRoomId]: transactionId }

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

  function triggerListRefresh(chatRoomId, time, message) {
    lastMessageEvent.value = { chatRoomId, time, message }
  }

  function setPendingReview(transactionId, chatRoomId = null) {
    pendingReview.value = { transactionId, chatRoomId }
    if (chatRoomId) {
      pendingReviewByRoom.value = { ...pendingReviewByRoom.value, [chatRoomId]: transactionId }
    }
  }

  function clearPendingReview() {
    pendingReview.value = null
  }

  function clearRoomReview(chatRoomId) {
    const updated = { ...pendingReviewByRoom.value }
    delete updated[chatRoomId]
    pendingReviewByRoom.value = updated
  }

  return {
    unreadCount, lastMessageEvent, pendingReview, pendingReviewByRoom,
    fetchUnreadCount, clearUnread, triggerListRefresh,
    setPendingReview, clearPendingReview, clearRoomReview
  }
})
