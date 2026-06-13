<script setup>
import { onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'

const route = useRoute()
const authStore = useAuthStore()
const chatStore = useChatStore()

watch(() => route.path, () => {
  if (authStore.isLoggedIn) chatStore.fetchUnreadCount()
})

onMounted(() => {
  if (authStore.isLoggedIn) chatStore.fetchUnreadCount()
})
</script>

<template>
  <div>
    <nav class="fixed top-0 left-0 right-0 z-50 flex justify-between items-center h-15 px-4 md:px-10 border-b-2 border-ink bg-paper/95 backdrop-blur-[10px]">

      <!-- 로고 -->
      <RouterLink to="/">
        <span class="logo font-sketch font-bold text-2xl md:text-[26px] text-ink leading-none">낙서장 ✏️</span>
      </RouterLink>

      <!-- PC 네비 -->
      <div class="flex items-center gap-6 md:gap-10">
        <ul class="hidden md:flex gap-7 list-none">
          <li>
            <RouterLink to="/products" class="nav-link text-base text-[#8c7e6e] hover:text-ink transition-colors">낙서장터</RouterLink>
          </li>
          <li>
            <RouterLink to="/board" class="nav-link text-base text-[#8c7e6e] hover:text-ink transition-colors">낙서판</RouterLink>
          </li>
          <li>
            <RouterLink to="/chats" class="nav-link relative inline-flex items-center text-base text-[#8c7e6e] hover:text-ink transition-colors">
              채팅
              <span
                v-if="chatStore.unreadCount > 0 || chatStore.pendingReview"
                class="absolute -top-1.5 -right-3 w-2 h-2 bg-red-500 rounded-full"
              ></span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/mypage" class="nav-link text-base text-[#8c7e6e] hover:text-ink transition-colors">마이페이지</RouterLink>
          </li>
        </ul>

        <div class="hidden md:flex items-center gap-2">
          <RouterLink
            v-if="!authStore.isLoggedIn && !authStore.needsProfile"
            to="/login"
            class="nav-btn font-bold text-sm border-2 border-ink bg-primary text-white px-4 py-1.5 rounded-lg shadow-[2px_2px_0_#1c1712] transition-all"
          >로그인</RouterLink>
          <RouterLink
            v-else-if="authStore.needsProfile"
            to="/signup/profile"
            class="nav-btn font-bold text-sm border-2 border-ink bg-primary text-white px-4 py-1.5 rounded-lg shadow-[2px_2px_0_#1c1712] transition-all"
          >프로필 입력</RouterLink>
        </div>

        <!-- 모바일 -->
        <div class="flex md:hidden">
          <RouterLink
            v-if="!authStore.isLoggedIn && !authStore.needsProfile"
            to="/login"
            class="nav-btn font-bold text-sm border-2 border-ink bg-primary text-white px-3 py-1.5 rounded-lg shadow-[2px_2px_0_#1c1712]"
          >로그인</RouterLink>
          <RouterLink
            v-else-if="authStore.needsProfile"
            to="/signup/profile"
            class="nav-btn font-bold text-sm border-2 border-ink bg-primary text-white px-3 py-1.5 rounded-lg shadow-[2px_2px_0_#1c1712]"
          >프로필</RouterLink>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.logo {
  text-decoration: underline wavy #ffe066;
  text-underline-offset: 5px;
}

.nav-link.router-link-active {
  color: #1c1712;
  font-weight: 700;
}

.nav-btn:hover { transform: translate(-1px, -1px); box-shadow: 3px 3px 0 #1c1712; }
.nav-btn:active { transform: translate(2px, 2px); box-shadow: none; }
</style>
