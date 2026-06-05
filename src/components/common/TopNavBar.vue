<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { PlusIcon } from '@heroicons/vue/24/solid'
import { onMounted, onBeforeUnmount } from 'vue'

const router = useRouter()
const authStore = useAuthStore()
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

onMounted(() => document.addEventListener('click', handleOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', handleOutsideClick))
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
            <RouterLink to="/products" class="nav-link text-base text-[#8c7e6e] hover:text-ink transition-colors">중고거래</RouterLink>
          </li>
          <li>
            <RouterLink to="/board" class="nav-link text-base text-[#8c7e6e] hover:text-ink transition-colors">게시판</RouterLink>
          </li>
          <li>
            <RouterLink to="/chats" class="nav-link text-base text-[#8c7e6e] hover:text-ink transition-colors">채팅</RouterLink>
          </li>
          <li>
            <RouterLink to="/mypage" class="nav-link text-base text-[#8c7e6e] hover:text-ink transition-colors">마이페이지</RouterLink>
          </li>
        </ul>

        <div class="hidden md:flex items-center gap-2">
          <RouterLink
            to="/product/create"
            class="nav-btn font-bold text-sm border-2 border-ink bg-[#ffe066] text-ink px-4 py-1.5 rounded-lg shadow-[2px_2px_0_#1c1712] transition-all"
          >상품등록</RouterLink>

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
          <button
            v-else
            type="button"
            class="nav-btn font-bold text-sm border-2 border-ink bg-white text-ink px-4 py-1.5 rounded-lg shadow-[2px_2px_0_#1c1712] transition-all"
            @click="logout"
          >로그아웃</button>
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
          <div v-else ref="mobileMenuRef" class="relative">
            <button
              @click.stop="showMobileMenu = !showMobileMenu"
              class="nav-btn w-10 h-10 border-2 border-ink bg-[#ffe066] text-ink rounded-full flex items-center justify-center shadow-[2px_2px_0_#1c1712] transition-all"
            >
              <PlusIcon class="w-5 h-5" />
            </button>
            <div
              v-if="showMobileMenu"
              class="absolute right-0 top-full mt-2 w-36 bg-paper border-2 border-ink rounded-xl shadow-[3px_3px_0_#1c1712] overflow-hidden z-50"
            >
              <RouterLink
                to="/product/create"
                @click="showMobileMenu = false"
                class="block px-4 py-3 font-bold text-sm text-ink hover:bg-[#ffe066] transition-colors"
              >상품등록</RouterLink>
              <button
                @click="logout"
                class="block w-full text-left px-4 py-3 font-bold text-sm text-ink hover:bg-[#ffe066] transition-colors border-t-2 border-[#c8bca8]"
              >로그아웃</button>
            </div>
          </div>
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
