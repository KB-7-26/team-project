import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { hideNav: true },
    },
  ],
})

export default router
