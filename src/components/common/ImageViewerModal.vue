<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

const MIN_SCALE = 1
const MAX_SCALE = 5
const SCALE_STEP = 0.25

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
  initialIndex: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['close'])

const viewerRef = ref(null)
const currentIndex = ref(0)
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)

const activePointers = new Map()
const dragStart = ref(null)
const pinchStart = ref(null)
let previousBodyOverflow = ''

const currentImage = computed(() => props.images[currentIndex.value])
const currentImageUrl = computed(() => currentImage.value?.imageUrl ?? currentImage.value?.url ?? '')
const hasMultipleImages = computed(() => props.images.length > 1)
const imageStyle = computed(() => ({
  transform: `translate3d(${translateX.value}px, ${translateY.value}px, 0) scale(${scale.value})`,
}))

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const resetZoom = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

const syncInitialIndex = () => {
  currentIndex.value = clamp(props.initialIndex, 0, Math.max(props.images.length - 1, 0))
  resetZoom()
}

watch(() => [props.initialIndex, props.images.length], syncInitialIndex, { immediate: true })

const zoomTo = (nextScale, originX = 0, originY = 0) => {
  const clampedScale = clamp(nextScale, MIN_SCALE, MAX_SCALE)
  const previousScale = scale.value

  if (clampedScale === previousScale) return

  if (clampedScale === MIN_SCALE) {
    resetZoom()
    return
  }

  const ratio = clampedScale / previousScale
  translateX.value = originX - (originX - translateX.value) * ratio
  translateY.value = originY - (originY - translateY.value) * ratio
  scale.value = clampedScale
}

const getViewerPoint = (event) => {
  const rect = viewerRef.value?.getBoundingClientRect()
  if (!rect) return { x: 0, y: 0 }
  return {
    x: event.clientX - rect.left - rect.width / 2,
    y: event.clientY - rect.top - rect.height / 2,
  }
}

const zoomIn = () => zoomTo(scale.value + SCALE_STEP)
const zoomOut = () => zoomTo(scale.value - SCALE_STEP)

const handleWheel = (event) => {
  const origin = getViewerPoint(event)
  const direction = event.deltaY < 0 ? 1 : -1
  zoomTo(scale.value + direction * SCALE_STEP, origin.x, origin.y)
}

const goToImage = (index) => {
  currentIndex.value = clamp(index, 0, props.images.length - 1)
  resetZoom()
}

const showPrevious = () => goToImage(currentIndex.value - 1)
const showNext = () => goToImage(currentIndex.value + 1)

const distanceBetween = ([first, second]) => Math.hypot(second.x - first.x, second.y - first.y)
const centerOf = ([first, second]) => ({
  x: (first.x + second.x) / 2,
  y: (first.y + second.y) / 2,
})

const handlePointerDown = (event) => {
  event.preventDefault()
  event.currentTarget.setPointerCapture?.(event.pointerId)
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (activePointers.size === 1 && scale.value > MIN_SCALE) {
    dragStart.value = {
      x: event.clientX,
      y: event.clientY,
      translateX: translateX.value,
      translateY: translateY.value,
    }
    return
  }

  if (activePointers.size === 2) {
    const points = Array.from(activePointers.values())
    pinchStart.value = {
      distance: distanceBetween(points),
      center: centerOf(points),
      scale: scale.value,
      translateX: translateX.value,
      translateY: translateY.value,
    }
    dragStart.value = null
  }
}

const handlePointerMove = (event) => {
  if (!activePointers.has(event.pointerId)) return
  event.preventDefault()
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (activePointers.size === 2 && pinchStart.value) {
    const points = Array.from(activePointers.values())
    const nextScale = pinchStart.value.scale * (distanceBetween(points) / pinchStart.value.distance)
    const center = centerOf(points)
    scale.value = clamp(nextScale, MIN_SCALE, MAX_SCALE)
    translateX.value = pinchStart.value.translateX + center.x - pinchStart.value.center.x
    translateY.value = pinchStart.value.translateY + center.y - pinchStart.value.center.y

    if (scale.value === MIN_SCALE) resetZoom()
    return
  }

  if (activePointers.size === 1 && dragStart.value && scale.value > MIN_SCALE) {
    translateX.value = dragStart.value.translateX + event.clientX - dragStart.value.x
    translateY.value = dragStart.value.translateY + event.clientY - dragStart.value.y
  }
}

const handlePointerEnd = (event) => {
  activePointers.delete(event.pointerId)
  event.currentTarget.releasePointerCapture?.(event.pointerId)
  pinchStart.value = null

  if (activePointers.size === 0) {
    dragStart.value = null
    return
  }

  const [remainingPointer] = activePointers.values()
  dragStart.value = scale.value > MIN_SCALE
    ? {
        x: remainingPointer.x,
        y: remainingPointer.y,
        translateX: translateX.value,
        translateY: translateY.value,
      }
    : null
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') emit('close')
  if (event.key === 'ArrowLeft' && hasMultipleImages.value) showPrevious()
  if (event.key === 'ArrowRight' && hasMultipleImages.value) showNext()
  if (event.key === '+' || event.key === '=') zoomIn()
  if (event.key === '-') zoomOut()
  if (event.key === '0') resetZoom()
}

onMounted(() => {
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    class="fixed inset-0 z-[1000] flex bg-black/90 text-white"
    role="dialog"
    aria-modal="true"
    @click.self="emit('close')"
  >
    <div class="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-black/45 px-3 py-1 text-xs font-bold sm:text-sm">
      {{ currentIndex + 1 }} / {{ images.length }}
    </div>

    <div class="absolute right-3 top-3 z-10 flex items-center gap-2 sm:right-4 sm:top-4">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white ring-1 ring-white/25 transition hover:bg-white/20 disabled:opacity-40"
        :disabled="scale <= MIN_SCALE"
        aria-label="이미지 축소"
        @click="zoomOut"
      >
        <MinusIcon class="h-5 w-5" />
      </button>
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white ring-1 ring-white/25 transition hover:bg-white/20 disabled:opacity-40"
        :disabled="scale >= MAX_SCALE"
        aria-label="이미지 확대"
        @click="zoomIn"
      >
        <PlusIcon class="h-5 w-5" />
      </button>
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white ring-1 ring-white/25 transition hover:bg-white/20"
        aria-label="확대 초기화"
        @click="resetZoom"
      >
        <ArrowPathIcon class="h-5 w-5" />
      </button>
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink transition hover:bg-[#ffe066]"
        aria-label="이미지 닫기"
        @click="emit('close')"
      >
        <XMarkIcon class="h-6 w-6" />
      </button>
    </div>

    <button
      v-if="hasMultipleImages"
      type="button"
      class="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white ring-1 ring-white/25 transition hover:bg-white/20 disabled:opacity-30 sm:left-4"
      :disabled="currentIndex === 0"
      aria-label="이전 이미지"
      @click="showPrevious"
    >
      <ChevronLeftIcon class="h-7 w-7" />
    </button>

    <div
      ref="viewerRef"
      class="flex flex-1 touch-none select-none items-center justify-center overflow-hidden p-4 sm:p-12"
      @wheel.prevent="handleWheel"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerEnd"
      @pointercancel="handlePointerEnd"
    >
      <img
        v-if="currentImageUrl"
        :src="currentImageUrl"
        :alt="`게시글 이미지 ${currentIndex + 1}`"
        :style="imageStyle"
        :class="scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'"
        class="max-h-full max-w-full select-none rounded-xl object-contain shadow-2xl transition-transform duration-75"
        draggable="false"
      />
    </div>

    <button
      v-if="hasMultipleImages"
      type="button"
      class="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white ring-1 ring-white/25 transition hover:bg-white/20 disabled:opacity-30 sm:right-4"
      :disabled="currentIndex === images.length - 1"
      aria-label="다음 이미지"
      @click="showNext"
    >
      <ChevronRightIcon class="h-7 w-7" />
    </button>
  </div>
</template>