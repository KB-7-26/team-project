import api from './axios'

export const reportApi = {
  createUserReport(productId, reportedUserId) {
    return api.post('/user-reports', { productId, reportedUserId })
  },
}
