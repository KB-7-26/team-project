import api from './axios'

export const categoryApi = {
  getCategories() {
    return api.get('/categories')
  },
}
