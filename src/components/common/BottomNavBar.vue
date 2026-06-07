<script setup>
import { HomeIcon, ShoppingBagIcon, ChatBubbleLeftRightIcon, ChatBubbleOvalLeftIcon, UserIcon } from '@heroicons/vue/24/outline'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'

const route = useRoute()
const chatStore = useChatStore()

const items = [
  { to: '/', icon: HomeIcon, label: '홈', match: (p) => p === '/' },
  { to: '/products', icon: ShoppingBagIcon, label: '중고거래', match: (p) => p.startsWith('/products') },
  { to: '/board', icon: ChatBubbleLeftRightIcon, label: '게시판', match: (p) => p.startsWith('/board') },
  { to: '/chats', icon: ChatBubbleOvalLeftIcon, label: '채팅', match: (p) => p.startsWith('/chats') },
  { to: '/mypage', icon: UserIcon, label: '마이페이지', match: (p) => p.startsWith('/mypage') },
]
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-[#fef9ec] border-t-2 border-ink md:hidden z-50">
    <ul class="flex px-2 py-2 gap-1">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="nav-item flex-1 flex flex-col items-center py-1.5 px-1 gap-0.5 rounded-xl transition-all"
        :class="
          item.match(route.path)
            ? 'bg-[#ffe066] border-2 border-ink shadow-[2px_2px_0_#1c1712] text-ink'
            : 'text-[#8c7e6e] border-2 border-transparent hover:text-ink'
        "
      >
        <div class="relative">
          <component :is="item.icon" class="w-5 h-5" />
          <span
            v-if="item.to === '/chats' && chatStore.unreadCount > 0"
            class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"
          />
        </div>
        <span class="text-[10px] font-bold leading-none">{{ item.label }}</span>
      </RouterLink>
    </ul>
  </nav>
</template>

<style scoped>
.nav-item:active {
  transform: translate(1px, 1px);
  box-shadow: none !important;
}
</style>
