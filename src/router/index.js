import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/HomeView.vue'),
    },
    { path: '/product/create', component: () => import('@/views/product/ProductCreateView.vue') },
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
    },
    {
      path: '/board/:id',
      component: () => import('@/views/board/BoardDetailView.vue'),
    },
    {
      path: '/mypage',
      component: () => import('@/views/user/MyPageView.vue'),
    },
  ],
})
export default router
