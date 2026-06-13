import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/firebase'
import { authApi } from '@/api/authApi'

export const useAuthStore = defineStore('auth', () => {
  const firebaseUser = ref(null)
  const user = ref(null)
  const pendingUser = ref(null)
  const isReady = ref(false)
  const profileRequired = ref(false)

  let authReadyPromise = null

  const isLoggedIn = computed(() => Boolean(firebaseUser.value && user.value))
  const needsProfile = computed(() => Boolean(firebaseUser.value && profileRequired.value))

  function applyMeResponse(response) {
    profileRequired.value = response.profileRequired
    user.value = response.user
    pendingUser.value = response.pendingUser
  }

  function clearAppUser() {
    user.value = null
    pendingUser.value = null
    profileRequired.value = false
  }

  async function refreshMe() {
    if (!auth.currentUser) {
      clearAppUser()
      return null
    }

    firebaseUser.value = auth.currentUser
    const { data } = await authApi.me()
    applyMeResponse(data)
    return data
  }

  function initializeAuth() {
    if (authReadyPromise) {
      return authReadyPromise
    }

    authReadyPromise = new Promise((resolve) => {
      onAuthStateChanged(auth, async (nextFirebaseUser) => {
        firebaseUser.value = nextFirebaseUser

        if (!nextFirebaseUser) {
          clearAppUser()
          isReady.value = true
          resolve()
          return
        }

        try {
          await refreshMe()
        } catch {
          clearAppUser()
        } finally {
          isReady.value = true
          resolve()
        }
      })
    })

    return authReadyPromise
  }

  async function completeProfile(profile) {
    const { data } = await authApi.createProfile(profile)
    applyMeResponse(data)
    return data.user
  }

  async function logout() {
    await signOut(auth)
    clearAppUser()
  }

  return {
    firebaseUser,
    user,
    pendingUser,
    isReady,
    profileRequired,
    isLoggedIn,
    needsProfile,
    initializeAuth,
    refreshMe,
    completeProfile,
    logout,
  }
})
