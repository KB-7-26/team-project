import api from './axios'

export const authApi = {
  me() {
    return api.get('/auth/me')
  },

  createProfile(body) {
    return api.post('/auth/profile', body)
  },

  verifyEmail() {
    return api.post('/auth/verify-email')
  },
}
