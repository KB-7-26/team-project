import api from './axios'

const BASE_URL = '/posts'

const unwrapData = (response) => response.data.data

export const boardApi = {
  async getPosts(page = 0, size = 10) {
    const response = await api.get(BASE_URL, { params: { page, size } })
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
}
