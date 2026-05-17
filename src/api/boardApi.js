import axios from 'axios'

const BASE_URL = '/api/posts'

export const boardApi = {
  createPost(title, content, isAnonymous) {
    return axios.post(BASE_URL, { title, content, isAnonymous })
  },
}