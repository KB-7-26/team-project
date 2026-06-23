import api from './axios'

const unwrapData = (response) => response.data.data

export const adminApi = {
  // 공지 관리
  async deletePost(postId) {
    await api.delete(`/admin/posts/${postId}`)
  },
  async deleteProduct(productId) {
    await api.delete(`/admin/products/${productId}`)
  },

  // 신고 관리 - 최근 신고 목록 (대시보드용)
  async getReports(page = 0, size = 5) {
    const response = await api.get('/admin/reports', { params: { page, size } })
    return unwrapData(response)
  },
  async getReportsByCohort() {
    const response = await api.get('/admin/reports/by-cohort')
    return unwrapData(response)
  },
  async getUserReportSummary(userId) {
    const response = await api.get(`/admin/users/${userId}/report-summary`)
    return unwrapData(response)
  },

  // 유저 관리
  async getUserCohortSummary() {
    const response = await api.get('/admin/users/cohort-summary')
    return unwrapData(response)
  },
  async getUsersByCohort(cohort, page = 0, size = 100) {
    const response = await api.get('/admin/users', { params: { cohort, page, size } })
    return unwrapData(response)
  },
  async getUserActivitySummary(userId) {
    const response = await api.get(`/admin/users/${userId}/activity-summary`)
    return unwrapData(response)
  },
  async toggleSuspend(userId) {
    await api.patch(`/admin/users/${userId}/suspend`)
  },
  async deleteUser(userId) {
    await api.delete(`/admin/users/${userId}`)
  },
}
