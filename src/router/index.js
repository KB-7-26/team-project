import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/HomeView.vue'),
      meta: { hideNav: true },
    },
    {
      path: '/product/create',
      component: () => import('@/views/product/ProductCreateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/product/edit/:id',
      component: () => import('@/views/product/ProductEditView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/chats',
      component: () => import('@/views/chat/ChatLayout.vue'),
      meta: { requiresAuth: true },
      children: [{ path: ':chatRoomId', component: () => import('@/views/chat/ChatRoomView.vue') }],
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
      path: '/products',
      component: () => import('@/views/product/ProductListView.vue'),
    },
    {
      path: '/products/:id',
      component: () => import('@/views/product/ProductDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/board',
      component: () => import('@/views/board/BoardListView.vue'),
    },
    {
      path: '/board/write',
      component: () => import('@/views/board/BoardWriteView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/board/:id/edit',
      component: () => import('@/views/board/BoardEditView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/board/:id',
      component: () => import('@/views/board/BoardDetailView.vue'),
    },
    {
      path: '/mypage',
      component: () => import('@/views/user/MyPageView.vue'),
      meta: { requiresAuth: true },
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
    return authStore.isLoggedIn ? '/' : '/login'
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return '/login'
  }

  if ((to.path === '/login' || to.path === '/signup') && authStore.isLoggedIn) {
    return '/'
  }
})

export default router
