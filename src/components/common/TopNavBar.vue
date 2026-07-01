<script setup>
import { computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { PencilIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'

const route = useRoute()
const authStore = useAuthStore()
const chatStore = useChatStore()
const myPageTarget = computed(() =>
  authStore.needsSignupCompletion ? authStore.signupCompletionPath : '/mypage',
)

watch(() => route.path, () => {
  if (authStore.isVerified) chatStore.fetchUnreadCount()
})

onMounted(() => {
  if (authStore.isVerified) chatStore.fetchUnreadCount()
})
</script>

<template>
  <div>
    <nav class="fixed top-0 left-0 right-0 z-50 flex h-15 items-center justify-between overflow-visible border-b-2 border-ink bg-paper/95 px-4 backdrop-blur-[10px] md:px-10">

        <!-- 로고 -->
        <RouterLink to="/">
          <span class="logo font-sketch font-bold text-2xl md:text-[26px] text-ink leading-none inline-flex items-center gap-2">
            <span>낙서장</span>
            <PencilIcon class="w-6 h-6 shrink-0 text-[#ff6b57]" />
          </span>
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
            <RouterLink
              :to="myPageTarget"
              class="nav-link relative inline-flex items-center text-base text-[#8c7e6e] hover:text-ink transition-colors"
            >
              마이페이지
              <span
                v-if="authStore.needsSignupCompletion"
                class="signup-bubble absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap border-2 border-ink bg-[#ffe066] px-2 py-1 text-[11px] font-black text-ink shadow-[2px_2px_0_#1c1712]"
              >
                가입 완료하기
              </span>
            </RouterLink>
          </li>
          <li v-if="authStore.isAdmin">
            <RouterLink to="/admin" class="nav-link text-base text-[#cc5a3a] hover:text-ink font-bold transition-colors">관리자</RouterLink>
          </li>
          <li v-if="authStore.isAdmin">
            <RouterLink to="/admin" class="nav-link text-base text-[#cc5a3a] hover:text-ink font-bold transition-colors">관리자</RouterLink>
          </li>
        </ul>

        <div class="hidden md:flex items-center gap-2">
          <RouterLink
            v-if="!authStore.isFirebaseAuthenticated"
            to="/login"
            class="nav-btn font-bold text-sm border-2 border-ink bg-primary text-white px-4 py-1.5 rounded-lg shadow-[2px_2px_0_#1c1712] transition-all"
          >로그인</RouterLink>
        </div>

        <!-- 모바일 -->
        <div class="flex md:hidden">
          <RouterLink
            v-if="!authStore.isFirebaseAuthenticated"
            to="/login"
            class="nav-btn font-bold text-sm border-2 border-ink bg-primary text-white px-3 py-1.5 rounded-lg shadow-[2px_2px_0_#1c1712]"
          >로그인</RouterLink>
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

.signup-bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  top: -7px;
  width: 10px;
  height: 10px;
  background: #ffe066;
  border-left: 2px solid #1c1712;
  border-top: 2px solid #1c1712;
  transform: translateX(-50%) rotate(45deg);
}

.nav-btn:hover { transform: translate(-1px, -1px); box-shadow: 3px 3px 0 #1c1712; }
.nav-btn:active { transform: translate(2px, 2px); box-shadow: none; }
</style>
