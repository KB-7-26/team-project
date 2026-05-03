<script setup>
import { HomeIcon, ShoppingBagIcon, ChatBubbleLeftRightIcon, ChatBubbleOvalLeftIcon, UserIcon } from '@heroicons/vue/24/outline'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-border md:hidden z-50">
    <ul class="flex">
      <RouterLink
        to="/"
        class="flex-1 flex flex-col items-center py-3 gap-1 cursor-pointer"
        :class="route.path === '/' ? 'text-primary' : 'text-text-sub'"
      >
        <HomeIcon class="w-6 h-6" />
        <span class="text-xs">홈</span>
      </RouterLink>
      <RouterLink
        to="/products"
        class="flex-1 flex flex-col items-center py-3 gap-1 cursor-pointer"
        :class="route.path.startsWith('/products') ? 'text-primary' : 'text-text-sub'"
      >
        <ShoppingBagIcon class="w-6 h-6" />
        <span class="text-xs">중고거래</span>
      </RouterLink>
      <RouterLink
        to="/board"
        class="flex-1 flex flex-col items-center py-3 gap-1 cursor-pointer"
        :class="route.path.startsWith('/board') ? 'text-primary' : 'text-text-sub'"
      >
        <ChatBubbleLeftRightIcon class="w-6 h-6" />
        <span class="text-xs">게시판</span>
      </RouterLink>
      <RouterLink
        to="/chats"
        class="flex-1 flex flex-col items-center py-3 gap-1 cursor-pointer"
        :class="route.path.startsWith('/chats') ? 'text-primary' : 'text-text-sub'"
      >
        <ChatBubbleOvalLeftIcon class="w-6 h-6" />
        <span class="text-xs">채팅</span>
      </RouterLink>
      <RouterLink
        to="/mypage"
        class="flex-1 flex flex-col items-center py-3 gap-1 cursor-pointer"
        :class="route.path.startsWith('/mypage') ? 'text-primary' : 'text-text-sub'"
      >
        <UserIcon class="w-6 h-6" />
        <span class="text-xs">마이페이지</span>
      </RouterLink>
    </ul>
  </nav>
</template>
