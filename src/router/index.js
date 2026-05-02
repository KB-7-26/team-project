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
      path: '/chats',
      component: () => import('@/views/chat/ChatLayout.vue'),
      children: [
        { path: ':chatRoomId', component: () => import('@/views/chat/ChatRoomView.vue') },
      ],
    },
    {
      path: '/login',
      component: () => import('@/views/auth/Login.vue'),
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
  ],
})
export default router
