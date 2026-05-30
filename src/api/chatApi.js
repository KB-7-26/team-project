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

  sendMessage(chatRoomId, content) {
    return api.post(`${BASE_URL}/${chatRoomId}/messages`, { content })
  },

  completeTrade(chatRoomId) {
    return api.patch(`${BASE_URL}/${chatRoomId}/complete`)
  },
}
