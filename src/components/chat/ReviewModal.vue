<script setup>
import { ref } from 'vue'
import { PencilSquareIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  show: Boolean,
  opponentName: String,
})

const emit = defineEmits(['submit', 'skip', 'close'])

const rating = ref(0)
const hoverRating = ref(0)
const isSubmitting = ref(false)

// 별 채우기 상태 계산 (full / half / empty)
function getStarState(starIndex, current) {
  const val = current // 0 ~ 5 (0.5 단위)
  if (val >= starIndex) return 'full'
  if (val >= starIndex - 0.5) return 'half'
  return 'empty'
}

// 마우스/터치 위치에 따라 0.5 단위 계산
function calcRating(clientX, rect, starIndex) {
  const x = clientX - rect.left
  return x < rect.width / 2 ? starIndex - 0.5 : starIndex
}

function onMouseMove(event, starIndex) {
  const rect = event.currentTarget.getBoundingClientRect()
  hoverRating.value = calcRating(event.clientX, rect, starIndex)
}

function onMouseLeave() {
  hoverRating.value = 0
}

function onClick(event, starIndex) {
  const rect = event.currentTarget.getBoundingClientRect()
  rating.value = calcRating(event.clientX, rect, starIndex)
}

// 모바일 터치 지원
function onTouchStart(event, starIndex) {
  const touch = event.touches[0]
  const rect = event.currentTarget.getBoundingClientRect()
  rating.value = calcRating(touch.clientX, rect, starIndex)
}

async function handleSubmit() {
  if (rating.value === 0 || isSubmitting.value) return
  isSubmitting.value = true
  emit('submit', rating.value)
  isSubmitting.value = false
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40"
      @click.self="emit('close')"
    >
      <div class="bg-paper border-2 border-ink rounded-2xl shadow-[6px_6px_0_#1c1712] p-6 w-84 flex flex-col gap-5">

        <!-- 헤더 -->
        <div class="flex flex-col items-center gap-1">
          <p class="font-sketch font-bold text-xl text-ink inline-flex items-center gap-1.5">
            <span>거래 어떠셨나요?</span>
            <PencilSquareIcon class="w-5 h-5 shrink-0" />
          </p>
          <p class="text-sm text-[#8c7e6e]">
            <span class="font-bold text-ink">{{ opponentName }}</span>님과의 거래가 만족스러우셨나요?
          </p>
        </div>

        <!-- 별점 -->
        <div class="flex flex-col items-center gap-3">
          <div class="flex gap-1">
            <div
              v-for="i in 5"
              :key="i"
              class="cursor-pointer select-none"
              @mousemove="onMouseMove($event, i)"
              @mouseleave="onMouseLeave"
              @click="onClick($event, i)"
              @touchstart.prevent="onTouchStart($event, i)"
            >
              <!-- SVG 별 - 낙서장 컨셉 -->
              <svg width="44" height="44" viewBox="0 0 44 44" class="star-svg">
                <defs>
                  <!-- 반쪽 채우기용 clipPath -->
                  <clipPath :id="`half-${i}`">
                    <rect x="0" y="0" width="22" height="44" />
                  </clipPath>
                </defs>

                <!-- 빈 별 (테두리) -->
                <polygon
                  points="22,3 27.5,16.5 42,17.5 31.5,27 35,41 22,33 9,41 12.5,27 2,17.5 16.5,16.5"
                  fill="#f5f0e8"
                  stroke="#1c1712"
                  stroke-width="2.2"
                  stroke-linejoin="round"
                  class="sketch-star"
                />

                <!-- 채워진 별 (full) -->
                <polygon
                  v-if="getStarState(i, hoverRating || rating) === 'full'"
                  points="22,3 27.5,16.5 42,17.5 31.5,27 35,41 22,33 9,41 12.5,27 2,17.5 16.5,16.5"
                  fill="#ffe066"
                  stroke="#1c1712"
                  stroke-width="2.2"
                  stroke-linejoin="round"
                  class="sketch-star"
                />

                <!-- 반쪽 채워진 별 (half) -->
                <polygon
                  v-if="getStarState(i, hoverRating || rating) === 'half'"
                  points="22,3 27.5,16.5 42,17.5 31.5,27 35,41 22,33 9,41 12.5,27 2,17.5 16.5,16.5"
                  fill="#ffe066"
                  stroke="#1c1712"
                  stroke-width="2.2"
                  stroke-linejoin="round"
                  :clip-path="`url(#half-${i})`"
                  class="sketch-star"
                />
              </svg>
            </div>
          </div>

          <!-- 별점 텍스트 -->
          <p class="text-sm font-bold text-ink min-h-5">
            <template v-if="(hoverRating || rating) === 0">별을 선택해주세요</template>
            <template v-else-if="(hoverRating || rating) <= 1">별로였어요</template>
            <template v-else-if="(hoverRating || rating) <= 2">아쉬웠어요</template>
            <template v-else-if="(hoverRating || rating) <= 3">보통이에요</template>
            <template v-else-if="(hoverRating || rating) <= 4">좋았어요</template>
            <template v-else>최고였어요!</template>
          </p>
        </div>

        <!-- 버튼 -->
        <div class="flex gap-3">
          <button
            @click="emit('skip')"
            class="flex-1 py-2.5 rounded-xl border-2 border-ink font-bold text-sm text-ink hover:bg-gray-50 transition shadow-[2px_2px_0_#1c1712]"
          >
            다음에
          </button>
          <button
            @click="handleSubmit"
            :disabled="rating === 0 || isSubmitting"
            class="flex-1 py-2.5 rounded-xl bg-[#ffe066] border-2 border-ink font-bold text-sm text-ink transition shadow-[2px_2px_0_#1c1712] disabled:opacity-40 disabled:cursor-not-allowed"
            :class="rating > 0 ? 'hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#1c1712]' : ''"
          >
            {{ isSubmitting ? '제출 중...' : '리뷰 남기기' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sketch-star {
  filter: url(#sketch);
}

/* 별 약간 기울어진 낙서 느낌 */
.star-svg {
  transform: rotate(-1deg);
  transition: transform 0.1s;
}
.star-svg:hover {
  transform: rotate(1deg) scale(1.1);
}
</style>
