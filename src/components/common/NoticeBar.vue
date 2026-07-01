<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { boardApi } from '@/api/boardApi'
import { useNoticeBar } from '@/composables/useNoticeBar'

const { hasNotices } = useNoticeBar()
const notices = ref([])
const currentIndex = ref(0)
let timer = null

onMounted(async () => {
  try {
    const data = await boardApi.getPosts(0, 5, null, 'title', '공지')
    notices.value = data.content || []
    hasNotices.value = notices.value.length > 0
    if (notices.value.length > 1) startRotation()
  } catch {
    hasNotices.value = false
  }
})

function startRotation() {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % notices.value.length
  }, 4000)
}

onBeforeUnmount(() => clearInterval(timer))

const current = computed(() => notices.value[currentIndex.value])
const displayNumber = computed(() => currentIndex.value + 1)
</script>

<template>
  <div v-if="hasNotices && current" class="w-full h-8 bg-[#ffe066] border-b-2 border-ink flex items-center px-4 overflow-hidden">
    <!-- 공지 뱃지 -->
    <span class="shrink-0 text-[11px] font-black text-ink mr-2.5 border border-ink rounded px-1.5 py-0.5 bg-white/50">공지</span>

    <!-- 번호 슬롯 -->
    <div class="shrink-0 w-5 h-full flex items-center overflow-hidden mr-1.5">
      <Transition name="slot-number" mode="out-in">
        <span :key="displayNumber" class="text-xs font-black text-ink">{{ displayNumber }}</span>
      </Transition>
    </div>

    <!-- 제목 슬롯 -->
    <div class="flex-1 min-w-0 h-full flex items-center overflow-hidden">
      <Transition name="slot-text" mode="out-in">
        <RouterLink
          :key="current.id"
          :to="`/board/${current.id}`"
          class="block truncate text-xs font-bold text-ink hover:underline w-full"
        >
          {{ current.title }}
        </RouterLink>
      </Transition>
    </div>

    <!-- 순번 표시 -->
    <span v-if="notices.length > 1" class="shrink-0 text-[10px] text-ink/50 font-bold ml-2.5">
      {{ displayNumber }}/{{ notices.length }}
    </span>
  </div>
</template>

<style scoped>
/* 위로 사라지고 아래서 올라오는 슬롯 효과 */
.slot-number-enter-active,
.slot-number-leave-active,
.slot-text-enter-active,
.slot-text-leave-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
  position: absolute;
}

.slot-number-enter-from,
.slot-text-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.slot-number-leave-to,
.slot-text-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
.slot-number-enter-to,
.slot-number-leave-from,
.slot-text-enter-to,
.slot-text-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
