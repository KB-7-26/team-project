import axios from 'axios'

const BASE_URL = '/api/chats'

export const chatApi = {
  getChatRooms() {
    return axios.get(BASE_URL)
  },

  getChatRoom(chatRoomId) {
    return axios.get(`${BASE_URL}/${chatRoomId}`)
  },

  sendMessage(chatRoomId, content) {
    return axios.post(`${BASE_URL}/${chatRoomId}/messages`, { content })
  },

  completeTrade(chatRoomId) {
    return axios.patch(`${BASE_URL}/${chatRoomId}/complete`)
  },
}
