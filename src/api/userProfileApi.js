import api from './axios'

export const userProfileApi = {
  getMyProfile() {
    return api.get('/users/me/profile')
  },

  getUserProfile(userId) {
    return api.get(`/users/${userId}/profile`)
  },

  updateMyProfile(body) {
    return api.put('/users/me/profile', body)
  },

  uploadProfileImage(formData) {
    return api.post('/users/me/profile-image', formData)
  },

  deleteProfileImage() {
    return api.delete('/users/me/profile-image')
  },
}
