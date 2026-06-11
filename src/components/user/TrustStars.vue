<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'TrustStars',
})

const props = defineProps({
  score: {
    type: Number,
    default: 0,
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
})

const normalizedScore = computed(() => Math.min(100, Math.max(0, props.score || 0)))
const filledStars = computed(() => Math.round((normalizedScore.value / 100) * 5))
const ariaLabel = computed(() => `신뢰도 별점 ${filledStars.value}점`)

const sizeClasses = {
  sm: {
    root: 'gap-0.5',
    star: 'text-sm',
    filled: 'drop-shadow-[1px_1px_0_#a07c0a]',
  },
  md: {
    root: 'gap-1',
    star: 'text-xl',
    filled: 'drop-shadow-[1px_1px_0_#a07c0a]',
  },
  lg: {
    root: 'gap-3',
    star: 'text-3xl transition-transform duration-150 hover:scale-110',
    filled: 'drop-shadow-[1px_2px_0_#a07c0a]',
  },
}

const currentSizeClasses = computed(() => sizeClasses[props.size])
</script>

<template>
  <span
    class="inline-flex items-center justify-center"
    :class="currentSizeClasses.root"
    :aria-label="ariaLabel"
    role="img"
  >
    <span
      v-for="i in 5"
      :key="i"
      class="inline-block leading-none"
      :class="[
        currentSizeClasses.star,
        i <= filledStars
          ? ['text-[#c9a227]', currentSizeClasses.filled]
          : 'text-[#d4c9b5]'
      ]"
    >★</span>
  </span>
</template>
