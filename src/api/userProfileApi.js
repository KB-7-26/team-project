import api from './axios'
import { auth } from '@/firebase'

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

  async withdraw(idToken) {
    const resolvedIdToken = idToken || (await auth.currentUser?.getIdToken(true))
    if (!resolvedIdToken) {
      throw new Error('로그인 토큰을 확인할 수 없습니다. 다시 로그인해주세요.')
    }

    return api.post(
      '/users/me/withdraw',
      { idToken: resolvedIdToken },
      {
        headers: {
          'X-Firebase-Id-Token': resolvedIdToken,
        },
      },
    )
  },
}
