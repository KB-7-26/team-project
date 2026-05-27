import axios from 'axios'
import { auth } from '@/firebase'

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
    if (error.response?.status === 401) {
      const pathname = window.location.pathname
      if (!pathname.startsWith('/login') && !pathname.startsWith('/signup')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
