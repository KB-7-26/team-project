<script setup>
defineProps({
  productImage: String,
  productTitle: String,
  price: Number,
})

const emit = defineEmits(['complete-trade'])
</script>

<template>
  <div class="flex items-center gap-3 px-4 py-3 border-b-2 border-ink bg-white shrink-0 shadow-[0_2px_0_#1c1712]">
    <!-- 상품 이미지 -->
    <div class="w-12 h-12 rounded-xl overflow-hidden border-2 border-ink shrink-0 shadow-[2px_2px_0_#1c1712]">
      <img v-if="productImage" :src="productImage" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full bg-[#c8bca8] flex items-center justify-center">
        <span class="text-lg opacity-60">📦</span>
      </div>
    </div>
    <!-- 정보 -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-bold text-ink truncate">{{ productTitle ?? '상품 정보 없음' }}</p>
      <p v-if="price" class="text-xs text-[#8c7e6e] mt-0.5">{{ price.toLocaleString() }}원</p>
    </div>
    <!-- 거래완료 버튼 -->
    <button
      class="trade-btn px-4 py-1.5 bg-[#96d4b4] border-2 border-ink text-ink text-xs font-bold rounded-lg shadow-[2px_2px_0_#1c1712] transition-all shrink-0"
      @click="emit('complete-trade')"
    >
      거래완료
    </button>
  </div>
</template>

<style scoped>
.trade-btn:hover { transform: translate(-1px, -1px); box-shadow: 3px 3px 0 #1c1712; }
.trade-btn:active { transform: translate(1px, 1px); box-shadow: none; }
</style>
