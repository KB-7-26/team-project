<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const productId = route.params.id
</script>

<template>
  <div>{{ productId }}번 상세 페이지</div>
</template>
