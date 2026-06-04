<script setup>
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import TopNavBar from './components/common/TopNavBar.vue'
import BottomNavBar from './components/common/BottomNavBar.vue'

const route = useRoute()
const showTopNavBar = computed(() => !route.meta.hideNav)
</script>

<template>
  <TopNavBar v-if="showTopNavBar" />
  <div :class="showTopNavBar ? 'pt-16 pb-16 md:pb-0' : ''">
    <RouterView />
  </div>
  <BottomNavBar v-if="showTopNavBar" />
</template>
