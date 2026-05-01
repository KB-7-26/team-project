import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/HomeView.vue'),
    },
    { path: '/product/create', component: () => import('@/views/product/ProductCreateView.vue') },
  ],
})

export default router
