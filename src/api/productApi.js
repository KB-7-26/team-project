import api from './axios'

export const categoryApi = {
  getCategories() {
    return api.get('/categories')
  },
}

export const productApi = {
  getProducts(params) {
    return api.get('/products', { params })
  },

  getProduct(id) {
    return api.get(`/products/${id}`)
  },

  createProduct(body) {
    return api.post('/products', body)
  },

  updateProduct(id, body) {
    return api.put(`/products/${id}`, body)
  },

  deleteProduct(id) {
    return api.delete(`/products/${id}`)
  },

  searchProducts(params) {
    return api.get('/products/search', { params })
  },

  updateStatus(id, status) {
    return api.patch(`/products/${id}/status`, { status })
  },

  getFavorites(userId) {
    return api.get(`/users/${userId}/favorites`)
  },

  addFavorite(id) {
    return api.post(`/products/${id}/favorites`)
  },

  removeFavorite(id) {
    return api.delete(`/products/${id}/favorites`)
  },

  uploadImages(id, formData) {
    return api.post(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deleteImage(productId, imageId) {
    return api.delete(`/products/${productId}/images/${imageId}`)
  },
}
