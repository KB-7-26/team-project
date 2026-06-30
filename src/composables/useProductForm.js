import { ref, computed } from 'vue'
import imageCompression from 'browser-image-compression'
import { useToastStore } from '@/stores/toast'

export const conditions = [
  { label: '새상품', value: 'NEW' },
  { label: '중고', value: 'USED' },
]

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
}
const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_IMAGES = 10

export function useProductForm(productForm) {
  const images = ref([])
  const deletedImageIds = ref([])
  const fileInput = ref(null)
  const toast = useToastStore()

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

  async function handleFileChange(event) {
    const files = Array.from(event.target.files)
    event.target.value = ''

    for (let i = 0; i < files.length; i++) {
      if (images.value.length >= MAX_IMAGES) break
      const file = files[i]

      if (file.size > MAX_FILE_SIZE) {
        toast.show(`${i + 1}번째 사진이 용량이 커서 업로드 실패`, 'error')
        continue
      }

      images.value.push({ loading: true })
      const placeholderIndex = images.value.length - 1

      try {
        const compressed = await imageCompression(file, COMPRESSION_OPTIONS)
        images.value.splice(placeholderIndex, 1, {
          file: compressed,
          url: URL.createObjectURL(compressed),
        })
      } catch {
        images.value.splice(placeholderIndex, 1)
        toast.show(`${i + 1}번째 사진 처리 중 오류가 발생했습니다`, 'error')
      }
    }
  }

  function removeImage(index) {
    const img = images.value[index]
    if (img.loading) return
    if (img.isExisting) {
      deletedImageIds.value.push(img.id)
    } else {
      URL.revokeObjectURL(img.url)
    }
    images.value.splice(index, 1)
  }

  return { images, deletedImageIds, fileInput, priceDisplay, toggleFree, addPrice, handleFileChange, removeImage }
}
