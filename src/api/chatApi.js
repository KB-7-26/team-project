import api from './axios'

const BASE_URL = '/chat/rooms'

export const chatApi = {
  createChatRoom(productId) {
    return api.post(BASE_URL, { productId })
  },

  getChatRooms() {
    return api.get(BASE_URL)
  },

  getChatRoom(chatRoomId) {
    return api.get(`${BASE_URL}/${chatRoomId}`)
  },

  getMessages(chatRoomId) {
    return api.get(`${BASE_URL}/${chatRoomId}/messages`)
  },

  sendMessage(chatRoomId, content) {
    return api.post(`${BASE_URL}/${chatRoomId}/messages`, { content })
  },

  completeTrade(chatRoomId) {
    return api.patch(`${BASE_URL}/${chatRoomId}/complete`)
  },

  markAsRead(chatRoomId) {
    return api.patch(`${BASE_URL}/${chatRoomId}/read`)
  },

  leaveChatRoom(chatRoomId) {
    return api.patch(`${BASE_URL}/${chatRoomId}/leave`)
  },

  getUnreadCount() {
    return api.get(`${BASE_URL}/unread-count`)
  },

  // 거래완료 처리 → transactionId 반환
  createTransaction(chatRoomId) {
    return api.post('/transactions', { chatRoomId })
  },

  // 채팅방의 거래 정보 조회
  getTransaction(chatRoomId) {
    return api.get(`/transactions/by-room/${chatRoomId}`)
  },

  // 별점 리뷰 작성
  createReview(transactionId, rating, content = '') {
    return api.post('/reviews', { transactionId, rating, content })
  },
}
