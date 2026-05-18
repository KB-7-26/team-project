<script setup>
import { RouterLink } from 'vue-router'
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
      <div class="flex items-center md:gap-12">
        <ul class="hidden md:flex gap-8 list-none">
          <!-- 각자 본인이 만든 주소만 채워주세요 -->
          <li class="text-base text-text-main hover:text-primary cursor-pointer">
            <RouterLink to="/products">중고거래</RouterLink>
          </li>
          <li class="text-base text-text-main hover:text-primary cursor-pointer">
            <RouterLink to="/board">게시판</RouterLink>
          </li>
          <li class="text-base text-text-main hover:text-primary cursor-pointer">
            <RouterLink to="/chats">채팅</RouterLink>
          </li>
          <li class="text-base text-text-main hover:text-primary cursor-pointer">
            <RouterLink to="/mypage">마이페이지</RouterLink>
          </li>
        </ul>
        <RouterLink
          to="/product/create"
          class="border border-primary text-primary hover:bg-primary/10 px-5 py-2 rounded-lg text-base cursor-pointer"
        >
          상품등록
        </RouterLink>
        <RouterLink
          to="/login"
          class="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-base cursor-pointer"
        >
          로그인
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<style scoped></style>
