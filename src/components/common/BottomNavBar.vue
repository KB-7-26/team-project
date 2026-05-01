<script setup>
import { ShoppingBagIcon, ChatBubbleLeftRightIcon, ChatBubbleOvalLeftIcon, UserIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-border md:hidden">
    <div>
      <ul class="flex">
        <li class="flex-1 flex flex-col items-center py-3 gap-1 cursor-pointer">
          <ShoppingBagIcon class="w-6 h-6" />
          <span class="text-xs">중고거래</span>
        </li>
        <RouterLink to="/board" class="flex-1 flex flex-col items-center py-3 gap-1 cursor-pointer">
          <ChatBubbleLeftRightIcon class="w-6 h-6 text-black" />
          <span class="text-xs">게시판</span>
        </RouterLink>
        <li class="flex-1 flex flex-col items-center py-3 gap-1 cursor-pointer">
          <ChatBubbleOvalLeftIcon class="w-6 h-6" />
          <span class="text-xs">채팅</span>
        </li>
        <li class="flex-1 flex flex-col items-center py-3 gap-1 cursor-pointer">
          <UserIcon class="w-6 h-6" />
          <span class="text-xs">마이페이지</span>
        </li>
      </ul>
    </div>
  </nav>
</template>
