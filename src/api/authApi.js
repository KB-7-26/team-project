import api from './axios'

export const authApi = {
  signup(body) {
    return api.post('/auth/signup', body)
  },

  login(body) {
    return api.post('/auth/login', body)
  },

  logout() {
    return api.post('/auth/logout')
  },
}
