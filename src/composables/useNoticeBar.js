import { ref } from 'vue'

const hasNotices = ref(false)

export function useNoticeBar() {
  return { hasNotices }
}
