import api from './axios'

export const userProfileApi = {
  getMyProfile() {
    return api.get('/users/me/profile')
  },

  updateMyProfile(body) {
    return api.put('/users/me/profile', body)
  },
}
