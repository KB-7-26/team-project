<script setup>
import { ref } from 'vue'
import { HeartIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'

defineProps({
  product: Object,
  liked: Boolean,
})

defineEmits(['toggle-like'])

const isPortrait = ref(false)

function onImageLoad(e) {
  const { naturalWidth, naturalHeight } = e.target
  isPortrait.value = naturalHeight > naturalWidth
}
</script>

<template>
  <div class="relative border-2 border-ink bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[4px_6px_0_#1c1712]">
    <RouterLink :to="`/products/${product.id}`" class="block">
      <!-- 이미지 -->
      <div class="relative" :class="isPortrait ? 'bg-black' : 'bg-gray-100'">
        <img
          :src="product.image"
          :alt="product.title"
          class="w-full h-36 md:h-48"
          :class="[
            isPortrait ? 'object-contain' : 'object-cover',
            product.status === '판매완료' ? 'filter-[grayscale(40%)]' : ''
          ]"
          @load="onImageLoad"
          @error="(e) => { e.target.style.display = 'none' }"
        />
      </div>

      <!-- 텍스트 -->
      <div class="pt-2 pb-3 px-3 flex flex-col gap-1">
        <p
          class="text-sm md:text-base font-semibold text-ink leading-snug"
          :style="{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }"
        >{{ product.title }}</p>
        <p class="mt-0.5">
          <span :class="['font-bold text-base md:text-[17px] px-2.5 py-1 rounded inline-block', product.isFree ? 'bg-[#96d4b4]/50 text-ink' : 'bg-[#ffe066]/50 text-ink']">
            {{ product.isFree ? '무료나눔' : `${product.price.toLocaleString()}원` }}
          </span>
        </p>
        <p class="text-xs text-[#8c7e6e] mt-0.5">
          <span :class="{
            'text-primary': product.status === '판매중',
            'text-[#4CAF50]': product.status === '거래중',
            'text-[#c8bca8]': product.status === '거래완료' || product.status === '판매완료',
          }">{{ product.status }}</span>
          <span class="mx-1">·</span>
          <span>조회 {{ product.views }}</span>
        </p>
      </div>
    </RouterLink>

    <!-- 판매완료 오버레이 -->
    <div v-if="product.status === '판매완료'" class="absolute inset-0 bg-white/20 pointer-events-none z-10" />

    <!-- 하트 버튼 -->
    <button
      @click.stop="$emit('toggle-like', product.id)"
      class="absolute top-2 right-2 z-20 p-1.5 bg-white/90 border border-ink/20 rounded-full shadow-sm transition-transform duration-200 hover:scale-125"
    >
      <HeartSolidIcon v-if="liked" class="w-4 h-4 text-red-500" />
      <HeartIcon v-else class="w-4 h-4 text-[#8c7e6e]" />
    </button>
  </div>
</template>

