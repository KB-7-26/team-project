import api from './axios'

const unwrapData = (response) => response.data.data

export const userBoardActivityApi = {
  async getMyPosts(page = 0, size = 10) {
    const response = await api.get('/users/me/board-posts', { params: { page, size } })
    return unwrapData(response)
  },

  async getMyCommentedPosts(page = 0, size = 10) {
    const response = await api.get('/users/me/commented-board-posts', { params: { page, size } })
    return unwrapData(response)
  },
}
