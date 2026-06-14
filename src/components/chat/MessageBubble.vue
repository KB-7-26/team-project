<script setup>
import { ref } from 'vue'
import UserProfileAvatar from '@/components/user/UserProfileAvatar.vue'

defineProps({
  senderType: String,
  content: String,
  createdAt: String,
  isUnread: Boolean,
  showTime: { type: Boolean, default: true },
  showProfile: { type: Boolean, default: true },
  senderId: { type: Number, default: null },
  senderNickname: { type: String, default: '' },
  senderImageUrl: { type: String, default: '' },
  reportProductId: { type: [Number, String], default: null },
  // 별점 전용
  type: { type: String, default: 'message' }, // 'message' | 'review'
  opponentName: { type: String, default: '' },
})

const emit = defineEmits(['review-submit'])

const reviewRating = ref(0)
const reviewHover = ref(0)

function calcStar(event, starIndex) {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  return x < rect.width / 2 ? starIndex - 0.5 : starIndex
}

function getStarState(i, val) {
  if (val >= i) return 'full'
  if (val >= i - 0.5) return 'half'
  return 'empty'
}

function onTouchStar(event, i) {
  const touch = event.touches[0]
  reviewRating.value = calcStar({ clientX: touch.clientX, currentTarget: event.currentTarget }, i)
}
</script>

<template>
  <!-- 별점 말풍선 - 내 메시지처럼 오른쪽 정렬 -->
  <div v-if="type === 'review'" class="flex justify-end">
    <div class="w-[85%] max-w-xs bg-white border-2 border-ink rounded-2xl rounded-br-sm shadow-[2px_2px_0_#1c1712] p-4 flex flex-col gap-3">
      <p class="font-bold text-center text-sm text-ink">거래 어떠셨나요? ✏️</p>
      <p class="text-xs text-center text-[#8c7e6e]">
        <span class="font-bold text-ink">{{ opponentName }}</span>님과의 거래가 만족스러우셨나요?
      </p>

      <!-- 별점 -->
      <div class="flex justify-center gap-1">
        <div
          v-for="i in 5" :key="i"
          class="cursor-pointer select-none"
          @mousemove="reviewHover = calcStar($event, i)"
          @mouseleave="reviewHover = 0"
          @click="reviewRating = calcStar($event, i)"
          @touchstart.prevent="onTouchStar($event, i)"
        >
          <svg width="34" height="34" viewBox="0 0 44 44" class="transition-transform hover:scale-110">
            <defs>
              <clipPath :id="`mb-half-${i}`">
                <rect x="0" y="0" width="22" height="44" />
              </clipPath>
            </defs>
            <polygon points="22,3 27.5,16.5 42,17.5 31.5,27 35,41 22,33 9,41 12.5,27 2,17.5 16.5,16.5"
              fill="#f5f0e8" stroke="#1c1712" stroke-width="2.2" stroke-linejoin="round" />
            <polygon v-if="getStarState(i, reviewHover || reviewRating) === 'full'"
              points="22,3 27.5,16.5 42,17.5 31.5,27 35,41 22,33 9,41 12.5,27 2,17.5 16.5,16.5"
              fill="#ffe066" stroke="#1c1712" stroke-width="2.2" stroke-linejoin="round" />
            <polygon v-if="getStarState(i, reviewHover || reviewRating) === 'half'"
              points="22,3 27.5,16.5 42,17.5 31.5,27 35,41 22,33 9,41 12.5,27 2,17.5 16.5,16.5"
              fill="#ffe066" stroke="#1c1712" stroke-width="2.2" stroke-linejoin="round"
              :clip-path="`url(#mb-half-${i})`" />
          </svg>
        </div>
      </div>

      <!-- 별점 텍스트 -->
      <p class="text-xs font-bold text-center text-ink min-h-4">
        <template v-if="(reviewHover || reviewRating) === 0">별을 선택해주세요</template>
        <template v-else-if="(reviewHover || reviewRating) <= 1">😢 별로였어요</template>
        <template v-else-if="(reviewHover || reviewRating) <= 2">😕 아쉬웠어요</template>
        <template v-else-if="(reviewHover || reviewRating) <= 3">😐 보통이에요</template>
        <template v-else-if="(reviewHover || reviewRating) <= 4">😊 좋았어요</template>
        <template v-else>🤩 최고였어요!</template>
      </p>

      <!-- 버튼 -->
      <div class="flex">
        <button
          @click="emit('review-submit', reviewRating)"
          :disabled="reviewRating === 0"
          class="w-full py-2 rounded-xl bg-[#ffe066] border-2 border-ink text-xs font-bold text-ink transition shadow-[2px_2px_0_#1c1712] disabled:opacity-40"
          :class="reviewRating > 0 ? 'hover:-translate-y-0.5' : ''"
        >별점 남기기</button>
      </div>
    </div>
  </div>

  <!-- 일반 말풍선 -->
  <div v-else :class="['flex items-end gap-2', senderType === 'me' ? 'justify-end' : 'justify-start']">
    <div v-if="senderType === 'other'" class="w-11 shrink-0">
      <UserProfileAvatar
        v-if="showProfile"
        :userId="senderId"
        :nickname="senderNickname"
        :imageUrl="senderImageUrl"
        :reportProductId="reportProductId"
      />
      <div v-else class="w-11 h-11" />
    </div>

    <template v-if="senderType === 'me'">
      <div v-if="showTime || isUnread" class="flex flex-col items-end justify-end shrink-0">
        <span v-if="isUnread" class="text-[10px] text-[#8c7e6e]">1</span>
        <span v-if="showTime" class="text-[11px] text-[#8c7e6e]">{{ createdAt }}</span>
      </div>
      <p class="max-w-[62%] px-3.5 py-2.5 text-sm leading-relaxed border-2 border-ink bg-[#ffe066] text-ink rounded-2xl rounded-br-sm shadow-[2px_2px_0_#1c1712]">
        {{ content }}
      </p>
    </template>

    <template v-else>
      <p class="max-w-[62%] px-3.5 py-2.5 text-sm leading-relaxed border-2 border-ink bg-[#a8c8e8] text-ink rounded-2xl rounded-bl-sm shadow-[2px_2px_0_#1c1712]">
        {{ content }}
      </p>
      <div v-if="showTime" class="flex flex-col justify-end shrink-0">
        <span class="text-[11px] text-[#8c7e6e]">{{ createdAt }}</span>
      </div>
    </template>
  </div>
</template>
