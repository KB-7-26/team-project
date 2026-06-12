import api from './axios'

const BASE_URL = '/posts'

const unwrapData = (response) => response.data.data

export const boardApi = {
  async getPosts(page = 0, size = 10, keyword = null, searchType = 'title') {
    const params = { page, size }
    if (keyword) { params.keyword = keyword; params.searchType = searchType }
    const response = await api.get(BASE_URL, { params })
    return unwrapData(response)
  },
  async getPostById(id) {
    const response = await api.get(`${BASE_URL}/${id}`)
    return unwrapData(response)
  },
  async createPost(title, content) {
    const response = await api.post(BASE_URL, { title, content })
    return unwrapData(response)
  },
  async updatePost(id, title, content) {
    const response = await api.put(`${BASE_URL}/${id}`, { title, content })
    return unwrapData(response)
  },
  async deletePost(id) {
    const response = await api.delete(`${BASE_URL}/${id}`)
    return unwrapData(response)
  },
  async getComments(postId) {
    const response = await api.get(`${BASE_URL}/${postId}/comments`)
    return unwrapData(response)
  },
  async createComment(postId, content, parentCommentId = null) {
    const response = await api.post(`${BASE_URL}/${postId}/comments`, { content, parentCommentId })
    return unwrapData(response)
  },
  async updateComment(postId, commentId, content) {
    const response = await api.put(`${BASE_URL}/${postId}/comments/${commentId}`, { content })
    return unwrapData(response)
  },
  async deleteComment(postId, commentId) {
    const response = await api.delete(`${BASE_URL}/${postId}/comments/${commentId}`)
    return unwrapData(response)
  },
  async togglePostLike(postId) {
    const response = await api.post(`${BASE_URL}/${postId}/likes`)
    return unwrapData(response)
  },
  async toggleCommentLike(postId, commentId) {
    const response = await api.post(`${BASE_URL}/${postId}/comments/${commentId}/likes`)
    return unwrapData(response)
  },
  async getPopularPosts(limit = 5) {
    const response = await api.get(`${BASE_URL}/popular`, { params: { limit } })
    return unwrapData(response)
  },
  async getMostViewedPosts(limit = 5) {
    const response = await api.get(`${BASE_URL}/most-viewed`, { params: { limit } })
    return unwrapData(response)
  },
  async reportPost(postId, reason) {
    await api.post(`${BASE_URL}/${postId}/reports`, { reason })
  },
  async reportComment(postId, commentId, reason) {
    await api.post(`${BASE_URL}/${postId}/comments/${commentId}/reports`, { reason })
  },
}
