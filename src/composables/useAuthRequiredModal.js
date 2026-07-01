import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function useAuthRequiredModal() {
  const router = useRouter()
  const authStore = useAuthStore()
  const authRequiredModalOpen = ref(false)
  const authRequiredModalMode = ref('login')

  const openAuthRequiredModal = (mode) => {
    authRequiredModalMode.value = mode
    authRequiredModalOpen.value = true
  }

  const closeAuthRequiredModal = () => {
    authRequiredModalOpen.value = false
  }

  const requireVerified = () => {
    if (!authStore.isFirebaseAuthenticated) {
      openAuthRequiredModal('login')
      return false
    }

    if (!authStore.isVerified) {
      openAuthRequiredModal('completion')
      return false
    }

    return true
  }

  const confirmAuthRequired = () => {
    const target = authRequiredModalMode.value === 'completion'
      ? authStore.signupCompletionPath
      : '/login'

    closeAuthRequiredModal()
    router.push(target)
  }

  const goToVerifiedRoute = (target) => {
    if (!requireVerified()) return
    router.push(target)
  }

  return {
    authRequiredModalOpen,
    authRequiredModalMode,
    closeAuthRequiredModal,
    confirmAuthRequired,
    goToVerifiedRoute,
    requireVerified,
  }
}
