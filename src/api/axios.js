import axios from 'axios'
import { auth } from '@/firebase'
import router from '@/router'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser
  if (currentUser) {
    const token = await currentUser.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !auth.currentUser) {
      const path = router.currentRoute.value.path
      if (!path.startsWith('/login') && !path.startsWith('/signup')) {
        router.push('/login')
      }
    }
    return Promise.reject(error)
  },
)

export default api
