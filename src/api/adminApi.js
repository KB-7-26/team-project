import api from './axios'

const unwrapData = (response) => response.data.data

export const adminApi = {
  async getReports(page = 0, size = 20) {
    const response = await api.get('/admin/reports', { params: { page, size } })
    return unwrapData(response)
  },
  async deletePost(postId) {
    await api.delete(`/admin/posts/${postId}`)
  },
  async deleteProduct(productId) {
    await api.delete(`/admin/products/${productId}`)
  },
  async getUsers(page = 0, size = 20) {
    const response = await api.get('/admin/users', { params: { page, size } })
    return unwrapData(response)
  },
  async toggleSuspend(userId) {
    await api.patch(`/admin/users/${userId}/suspend`)
  },
  async deleteUser(userId) {
    await api.delete(`/admin/users/${userId}`)
  },
}
