import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/product/create',
      component: () => import('@/views/product/ProductCreateView.vue'),
      meta: { requiresVerified: true },
    },
    {
      path: '/product/edit/:id',
      component: () => import('@/views/product/ProductEditView.vue'),
      meta: { requiresVerified: true },
    },
    {
      path: '/chats',
      component: () => import('@/views/chat/ChatLayout.vue'),
      meta: { requiresVerified: true },
      children: [{ path: ':chatRoomId', component: () => import('@/views/chat/ChatRoomView.vue'), meta: { hideNavMobile: true } }],
    },
    {
      path: '/login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { hideNav: true },
    },
    {
      path: '/signup',
      component: () => import('@/views/auth/Signup.vue'),
      meta: { hideNav: true },
    },
    {
      path: '/signup/profile',
      component: () => import('@/views/auth/ProfileCompleteView.vue'),
      meta: { hideNav: true },
    },
    {
      path: '/verify-email',
      component: () => import('@/views/auth/VerifyEmailView.vue'),
      meta: { hideNav: true },
    },
    {
      path: '/products',
      component: () => import('@/views/product/ProductListView.vue'),
    },
    {
      path: '/products/:id',
      component: () => import('@/views/product/ProductDetailView.vue'),
    },
    {
      path: '/board',
      component: () => import('@/views/board/BoardListView.vue'),
    },
    {
      path: '/board/write',
      component: () => import('@/views/board/BoardWriteView.vue'),
      meta: { requiresVerified: true },
    },
    {
      path: '/board/:id/edit',
      component: () => import('@/views/board/BoardEditView.vue'),
      meta: { requiresVerified: true },
    },
    {
      path: '/board/:id',
      component: () => import('@/views/board/BoardDetailView.vue'),
    },
    {
      path: '/mypage',
      component: () => import('@/views/user/MyPageView.vue'),
      meta: { requiresVerified: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  await authStore.initializeAuth()

  if (authStore.needsProfile && to.path !== '/signup/profile') {
    return '/signup/profile'
  }

  if (to.path === '/signup/profile' && !authStore.needsProfile) {
    if (authStore.needsVerification) return '/verify-email'
    return authStore.isVerified ? '/' : '/login'
  }

  if (to.path === '/verify-email') {
    if (!authStore.isFirebaseAuthenticated) return '/login'
    if (authStore.needsProfile) return '/signup/profile'
    if (!authStore.needsVerification) return authStore.isVerified ? '/' : '/login'
    return undefined
  }

  if (to.meta.requiresVerified && !authStore.isVerified) {
    if (!authStore.isFirebaseAuthenticated) return '/login'
    return authStore.signupCompletionPath
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return '/login'
  }

  if ((to.path === '/login' || to.path === '/signup') && authStore.isFirebaseAuthenticated) {
    if (authStore.needsProfile) return '/signup/profile'
    if (authStore.needsVerification) return '/verify-email'
    if (authStore.isVerified) return '/'
  }
})

export default router
