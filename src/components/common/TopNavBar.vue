<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { PlusIcon } from '@heroicons/vue/24/solid'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const chatStore = useChatStore()
const showMobileMenu = ref(false)
const mobileMenuRef = ref(null)

const logout = async () => {
  showMobileMenu.value = false
  await authStore.logout()
  router.push('/login')
}

const handleOutsideClick = (e) => {
  if (mobileMenuRef.value && !mobileMenuRef.value.contains(e.target)) {
    showMobileMenu.value = false
  }
}

// 라우트 변경마다 갱신
watch(() => route.path, () => {
  if (authStore.isLoggedIn) chatStore.fetchUnreadCount()
})

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  if (authStore.isLoggedIn) chatStore.fetchUnreadCount()
})
onBeforeUnmount(() => document.removeEventListener('click', handleOutsideClick))
</script>

<template>
  <div>
    <nav
      class="fixed top-0 left-0 right-0 z-50 flex justify-between items-center h-16 px-4 md:px-10 border-b border-border bg-white"
    >
      <RouterLink to="/">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-base">
            K
          </div>
          <span class="font-bold text-lg text-text-main">KB Swap</span>
        </div>
      </RouterLink>
      <div class="flex items-center gap-8 md:gap-12">
        <ul class="hidden md:flex gap-8 list-none">
          <!-- 각자 본인이 만든 주소만 채워주세요 -->
          <li class="text-base text-text-main hover:text-primary cursor-pointer">
            <RouterLink to="/products">중고거래</RouterLink>
          </li>
          <li class="text-base text-text-main hover:text-primary cursor-pointer">
            <RouterLink to="/board">게시판</RouterLink>
          </li>
          <li class="text-base text-text-main hover:text-primary cursor-pointer">
            <RouterLink to="/chats" class="relative inline-flex items-center">
              채팅
              <span
                v-if="chatStore.unreadCount > 0"
                class="absolute -top-1.5 -right-3 w-2 h-2 bg-red-500 rounded-full"
              ></span>
            </RouterLink>
          </li>
          <li class="text-base text-text-main hover:text-primary cursor-pointer">
            <RouterLink to="/mypage">마이페이지</RouterLink>
          </li>
        </ul>
        <div class="hidden md:flex items-center gap-3">
          <RouterLink
            to="/product/create"
            class="border border-primary text-primary hover:bg-primary/10 px-5 py-2 rounded-lg text-base cursor-pointer"
          >
            상품등록
          </RouterLink>
          <RouterLink
            v-if="!authStore.isLoggedIn && !authStore.needsProfile"
            to="/login"
            class="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-base cursor-pointer"
          >
            로그인
          </RouterLink>
          <RouterLink
            v-else-if="authStore.needsProfile"
            to="/signup/profile"
            class="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-base cursor-pointer"
          >
            프로필 입력
          </RouterLink>
          <button
            v-else
            type="button"
            class="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-base cursor-pointer"
            @click="logout"
          >
            로그아웃
          </button>
        </div>
        <!-- 모바일: 비로그인 -->
        <div class="flex md:hidden">
          <RouterLink
            v-if="!authStore.isLoggedIn && !authStore.needsProfile"
            to="/login"
            class="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
          >
            로그인
          </RouterLink>
          <RouterLink
            v-else-if="authStore.needsProfile"
            to="/signup/profile"
            class="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
          >
            프로필 입력
          </RouterLink>
          <!-- 모바일: 로그인 상태 → + 버튼 + 드롭다운 -->
          <div v-else ref="mobileMenuRef" class="relative">
            <button
              @click.stop="showMobileMenu = !showMobileMenu"
              class="w-10 h-10 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center transition-transform active:scale-95"
            >
              <PlusIcon class="w-5 h-5" />
            </button>
            <div
              v-if="showMobileMenu"
              class="absolute right-0 top-full mt-2 w-36 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-50"
            >
              <RouterLink
                to="/product/create"
                @click="showMobileMenu = false"
                class="block px-4 py-3 text-sm text-text-main hover:bg-gray-50 font-medium"
              >
                상품등록
              </RouterLink>
              <button
                @click="logout"
                class="block w-full text-left px-4 py-3 text-sm text-text-main hover:bg-gray-50 font-medium border-t border-border"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped></style>
