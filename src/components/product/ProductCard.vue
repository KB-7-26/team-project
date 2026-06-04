<script setup>
import { HeartIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'

defineProps({
  product: Object,
  liked: Boolean,
})

defineEmits(['toggle-like'])
</script>

<template>
  <div class="relative cursor-pointer group">
    <RouterLink :to="`/products/${product.id}`" class="block">
      <!-- 이미지 -->
      <div class="overflow-hidden rounded-2xl">
        <img
          :src="product.image"
          :alt="product.title"
          class="w-full h-36 md:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          @error="(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%23e5e7eb\'/%3E%3C/svg%3E' }"
        />
      </div>

      <!-- 텍스트 -->
      <div class="pt-2 pb-1 px-1 flex flex-col gap-0.5">
        <p class="text-sm md:text-base font-semibold text-text-main line-clamp-2 leading-snug">{{ product.title }}</p>
        <p :class="['text-sm md:text-base font-bold', product.isFree ? 'text-primary' : 'text-text-main']">{{ product.isFree ? '무료나눔' : `${product.price.toLocaleString()}원` }}</p>
        <p class="text-xs text-text-sub mt-0.5">
          <span
            :class="{
              'text-primary': product.status === '판매중',
              'text-[#4CAF50]': product.status === '거래중',
              'text-gray-400': product.status === '거래완료' || product.status === '판매완료',
            }"
          >{{ product.status }}</span>
          <span class="mx-1">·</span>
          <span>조회 {{ product.views }}</span>
        </p>
      </div>
    </RouterLink>

    <!-- 하트 버튼 -->
    <button
      @click="$emit('toggle-like', product.id)"
      class="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow transition-transform duration-200 hover:scale-125"
    >
      <HeartSolidIcon v-if="liked" class="w-4 h-4 text-red-500" />
      <HeartIcon v-else class="w-4 h-4 text-gray-400" />
    </button>
  </div>
</template>
