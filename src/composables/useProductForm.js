import { ref, computed } from 'vue'

export const conditions = [
  { label: '새상품', value: 'NEW' },
  { label: '중고', value: 'USED' },
]

export function useProductForm(productForm) {
  const images = ref([])
  const deletedImageIds = ref([])
  const fileInput = ref(null)

  const priceDisplay = computed({
    get() {
      if (productForm.value.isFree) return '0'
      if (!productForm.value.price) return ''
      return Number(productForm.value.price).toLocaleString('ko-KR')
    },
    set(val) {
      productForm.value.price = val.replace(/[^0-9]/g, '')
    },
  })

  function toggleFree() {
    productForm.value.isFree = !productForm.value.isFree
    if (productForm.value.isFree) productForm.value.price = '0'
  }

  function addPrice(amount) {
    if (productForm.value.isFree) return
    const current = Number(productForm.value.price) || 0
    productForm.value.price = String(current + amount)
  }

  function handleFileChange(event) {
    const files = Array.from(event.target.files)
    files.forEach((file) => {
      if (images.value.length >= 10) return
      images.value.push({ file, url: URL.createObjectURL(file) })
    })
    event.target.value = ''
  }

  function removeImage(index) {
    const img = images.value[index]
    if (img.isExisting) {
      deletedImageIds.value.push(img.id)
    } else {
      URL.revokeObjectURL(img.url)
    }
    images.value.splice(index, 1)
  }

  return { images, deletedImageIds, fileInput, priceDisplay, toggleFree, addPrice, handleFileChange, removeImage }
}
