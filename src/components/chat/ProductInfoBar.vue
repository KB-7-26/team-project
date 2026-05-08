<script setup>
defineProps({
  productImage: String,
  productTitle: String,
  price: Number,
})

const emit = defineEmits(['complete-trade'])
</script>

<template>
  <div class="flex items-center gap-3 px-4 py-3 border-b border-border bg-white shrink-0">
    <img :src="productImage" class="w-12 h-12 rounded-lg object-cover" />
    <div class="flex-1">
      <div class="text-sm font-semibold text-text-main">{{ productTitle }}</div>
      <div class="text-[13px] text-text-sub mt-0.5">{{ price?.toLocaleString() }}원</div>
    </div>
    <button
      class="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold cursor-pointer transition-colors"
      @click="emit('complete-trade')"
    >
      거래완료
    </button>
  </div>
</template>
