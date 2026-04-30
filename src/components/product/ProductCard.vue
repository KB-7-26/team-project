<script setup>
import { HeartIcon, ChatBubbleOvalLeftIcon, ClockIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'

defineProps({
  product: Object,
  liked: Boolean,
})

defineEmits(['toggle-like'])
</script>

<template>
  <RouterLink :to="`/products/${product.id}`">
    <div
      class="max-w-xl my-2 rounded-2xl border border-border overflow-hidden shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
    >
      <div class="relative overflow-hidden">
        <img
          :src="product.image"
          :alt="product.title"
          class="w-full h-48 object-cover bg-amber-500 transition-transform duration-300 group-hover:scale-105"
        />
        <span
          :class="{
            'bg-primary': product.status === '판매중',
            'bg-[#4CAF50]': product.status === '거래중',
            'bg-gray-400': product.status === '거래완료',
          }"
          class="absolute top-3 left-3 h-9 flex items-center text-white text-xs font-semibold rounded-full px-3 py-1.5"
        >
          {{ product.status }}
        </span>
        <button
          @click.stop="$emit('toggle-like', product.id)"
          class="absolute top-3 right-3 px-1.5 py-1.5 bg-white rounded-full flex items-center justify-center shadow transition-transform duration-200 hover:scale-125"
        >
          <HeartSolidIcon v-if="liked" class="w-5 h-5 text-red-500" />
          <HeartIcon v-else class="w-5 h-5 text-red-500" />
        </button>
      </div>

      <div class="p-4 flex flex-col gap-2">
        <p class="text-lg font-bold text-text-main truncate">{{ product.title }}</p>
        <p class="text-xl font-extrabold text-text-main">{{ product.price.toLocaleString() }}원</p>
        <div class="flex items-center gap-4 text-text-sub text-sm">
          <span class="flex items-center gap-1"><HeartIcon class="w-4 h-4" /> {{ product.likes }}</span>
          <span class="flex items-center gap-1"><ChatBubbleOvalLeftIcon class="w-4 h-4" /> {{ product.comments }}</span>
          <span class="flex items-center gap-1"><ClockIcon class="w-4 h-4" /> {{ product.views }}</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
