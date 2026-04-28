<script setup>
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import TopNavBar from './components/common/TopNavBar.vue'

const route = useRoute()
const showTopNavBar = computed(() => !route.meta.hideNav)
</script>

<template>
  <TopNavBar v-if="showTopNavBar" />
  <RouterView />
</template>
