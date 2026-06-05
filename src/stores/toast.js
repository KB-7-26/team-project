import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', () => {
  const message = ref('')
  const type = ref('success')
  const visible = ref(false)
  let timer = null

  const show = (msg, toastType = 'success', duration = 3000) => {
    message.value = msg
    type.value = toastType
    visible.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { visible.value = false }, duration)
  }

  const hide = () => {
    visible.value = false
    clearTimeout(timer)
  }

  return { message, type, visible, show, hide }
})