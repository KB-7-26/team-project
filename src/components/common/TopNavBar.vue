<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div>
    <nav class="flex justify-between items-center h-16 px-10 border-b border-border">
      <div class="flex items-center gap-2">
        <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-base">
          K
        </div>
        <span class="font-bold text-lg text-text-main">KB Swap</span>
      </div>
      <div class="flex items-center gap-12">
        <ul class="flex gap-8 list-none">
          <!-- 각자 본인이 만든 주소만 채워주세요 -->
          <li class="text-base text-text-main hover:text-primary cursor-pointer">
            <RouterLink to="#">중고거래</RouterLink>
          </li>
          <li class="text-base text-text-main hover:text-primary cursor-pointer">
            <RouterLink to="#"> 게시판</RouterLink>
          </li>
          <li class="text-base text-text-main hover:text-primary cursor-pointer">
            <RouterLink to="#">채팅</RouterLink>
          </li>
          <li class="text-base text-text-main hover:text-primary cursor-pointer">
            <RouterLink to="#">마이페이지</RouterLink>
          </li>
        </ul>
        <RouterLink to="/login" class="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-base cursor-pointer">
          로그인
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<style scoped></style>
