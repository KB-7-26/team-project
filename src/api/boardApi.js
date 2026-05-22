import api from './axios'

const BASE_URL = '/posts'

export const boardApi = {
  getPosts(page = 0, size = 10) {
    return api.get(BASE_URL, { params: { page, size } })
  },
  createPost(title, content, isAnonymous) {
    return api.post(BASE_URL, { title, content, isAnonymous })
  },
}