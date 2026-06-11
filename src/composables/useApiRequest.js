import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/firebase'

export function useApiRequest() {
  const router = useRouter()
  const isLoading = ref(false)
  const error = ref('')

  const request = async (apiFn, { errorMessage, on403 } = {}) => {
    error.value = ''
    isLoading.value = true
    try {
      const data = await apiFn()
      return { ok: true, data }
    } catch (e) {
      if (e.response?.status === 401) {
        if (!auth.currentUser) {
          router.push('/login')
        } else {
          error.value = errorMessage ?? '오류가 발생했습니다. 다시 시도해주세요.'
        }
      } else if (e.response?.status === 403) {
        if (on403) on403()
        else error.value = '권한이 없습니다.'
      } else {
        error.value = errorMessage ?? '오류가 발생했습니다. 다시 시도해주세요.'
      }
      return { ok: false, data: null }
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, error, request }
}