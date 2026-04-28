<script setup>
import { RouterView } from 'vue-router'
import TopNavBar from './components/common/TopNavBar.vue'
import BottomNavBar from './components/common/BottomNavBar.vue'
</script>

<template>
  <TopNavBar />
  <div class="pt-16 pb-4 md:pb-0">
    <!-- 하단 네비 간격 유지 -->
    <RouterView />
  </div>
  <BottomNavBar />
</template>
