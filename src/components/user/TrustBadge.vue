<script setup>
import { computed } from 'vue'
import trustLevel1 from '@/assets/trust/trust-level-1.png'
import trustLevel2 from '@/assets/trust/trust-level-2.png'
import trustLevel3 from '@/assets/trust/trust-level-3.png'
import trustLevel4 from '@/assets/trust/trust-level-4.png'
import trustLevel5 from '@/assets/trust/trust-level-5.png'

defineOptions({
  name: 'TrustBadge',
})

const props = defineProps({
  score: {
    type: Number,
    default: 50,
  },
  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value),
  },
})

const normalizedScore = computed(() => Math.min(100, Math.max(0, props.score ?? 50)))
const level = computed(() => {
  if (normalizedScore.value <= 37) return 1
  if (normalizedScore.value <= 44) return 2
  if (normalizedScore.value <= 50) return 3
  if (normalizedScore.value <= 64) return 4
  return 5
})

const badges = {
  1: { src: trustLevel1, label: '신뢰도 1단계' },
  2: { src: trustLevel2, label: '신뢰도 2단계' },
  3: { src: trustLevel3, label: '신뢰도 3단계' },
  4: { src: trustLevel4, label: '신뢰도 4단계' },
  5: { src: trustLevel5, label: '신뢰도 5단계' },
}

const currentBadge = computed(() => badges[level.value])

const sizeClasses = {
  xs: 'h-8 w-8',
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-28 w-28',
}
</script>

<template>
  <img
    :src="currentBadge.src"
    :alt="currentBadge.label"
    :title="currentBadge.label"
    :aria-label="currentBadge.label"
    :class="['inline-block shrink-0 object-contain align-middle', sizeClasses[size]]"
  />
</template>