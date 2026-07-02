<script setup>
import { CubeIcon } from '@heroicons/vue/24/outline'

defineProps({
  productImage: String,
  productTitle: String,
  price: Number,
  tradeCompleted: Boolean,
  isSeller: Boolean,
})

const emit = defineEmits(['complete-trade', 'leave-room'])
</script>

<template>
  <div class="flex items-center gap-3 px-4 py-3 border-b-2 border-ink bg-white shrink-0 shadow-[0_2px_0_#1c1712]">
    <div class="w-12 h-12 rounded-xl overflow-hidden border-2 border-ink shrink-0 shadow-[2px_2px_0_#1c1712]">
      <img v-if="productImage" :src="productImage" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full bg-[#c8bca8] flex items-center justify-center">
        <CubeIcon class="w-5 h-5 text-ink/50" />
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <p class="text-sm font-bold text-ink truncate">{{ productTitle ?? '상품 정보 없음' }}</p>
      <p v-if="price" class="text-xs text-[#8c7e6e] mt-0.5">{{ price.toLocaleString() }}원</p>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <button
        v-if="isSeller && !tradeCompleted"
        class="trade-btn px-3 py-1.5 bg-[#96d4b4] border-2 border-ink text-ink text-xs font-bold rounded-lg shadow-[2px_2px_0_#1c1712] transition-all"
        @click="emit('complete-trade')"
      >
        거래완료
      </button>
      <span
        v-else-if="tradeCompleted"
        class="px-3 py-1.5 bg-white border-2 border-[#96d4b4] text-[#5aaa84] text-xs font-bold rounded-lg"
      >거래완료됨</span>
      <button
        class="leave-btn px-3 py-1.5 bg-white border-2 border-ink text-ink text-xs font-bold rounded-lg shadow-[2px_2px_0_#1c1712] transition-all"
        @click="emit('leave-room')"
      >
        나가기
      </button>
    </div>
  </div>
</template>

<style scoped>
.trade-btn:hover,
.leave-btn:hover { transform: translate(-1px, -1px); box-shadow: 3px 3px 0 #1c1712; }
.trade-btn:active,
.leave-btn:active { transform: translate(1px, 1px); box-shadow: none; }
</style>