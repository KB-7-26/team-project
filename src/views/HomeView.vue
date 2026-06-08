<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline'
import { productApi } from '@/api/productApi'
import ProductCard from '@/components/product/ProductCard.vue'
import { mapProduct } from '@/utils/product'

const categories = [
  { icon: ShoppingBagIcon, title: '중고거래', desc: '안전한 학생 간 거래', to: '/products', tape: '#ffe066' },
  { icon: ChatBubbleLeftRightIcon, title: '익명게시판', desc: '자유로운 소통 공간', to: '/board', tape: '#96d4b4' },
  { icon: ChatBubbleOvalLeftIcon, title: '채팅목록', desc: '실시간 대화', to: '/chats', tape: '#a8c8e8' },
  { icon: UserIcon, title: '마이페이지', desc: '내 정보 관리', to: '/mypage', tape: '#f4a8b8' },
]

const popularProducts = ref([])
// ── 교육 진행 계산 ──────────────────────────────────────────
const EDUCATION_START = new Date('2026-04-07')
const TOTAL_DAYS = 120

const schedule = [
  { date: '2026-06-09', label: '모듈 평가', type: 'module' },
  { date: '2026-06-10', label: '과제 제출', type: 'assignment' },
  { date: '2026-06-17', label: '과제 제출', type: 'assignment' },
  { date: '2026-06-22', label: '교과목 평가', type: 'subject' },
  { date: '2026-06-24', label: '과제 제출', type: 'assignment' },
  { date: '2026-07-01', label: '과제 제출', type: 'assignment' },
  { date: '2026-07-06', label: '모듈 평가', type: 'module' },
  { date: '2026-07-08', label: '과제 제출', type: 'assignment' },
  { date: '2026-07-08', label: '교과목 평가', type: 'subject' },
]

const TYPE_ICON = { module: '📝', subject: '📚', assignment: '📋' }

function todayMidnight() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function diffDays(dateStr) {
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.floor((target - todayMidnight()) / 86400000)
}

function formatDday(diff) {
  if (diff === 0) return 'D-DAY'
  if (diff > 0) return `D-${diff}`
  return `D+${Math.abs(diff)}`
}

function shortDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const currentDay = computed(() => {
  const diff = Math.floor((todayMidnight() - EDUCATION_START) / 86400000) + 1
  return Math.min(Math.max(diff, 1), TOTAL_DAYS)
})

const remainingDays = computed(() => TOTAL_DAYS - currentDay.value)
const progressPct = computed(() => Math.round((currentDay.value / TOTAL_DAYS) * 100))

const upcomingEvents = computed(() =>
  schedule.filter((e) => diffDays(e.date) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date)),
)

const nearestEvent = computed(() => upcomingEvents.value[0] ?? null)
const nearestDiff = computed(() => (nearestEvent.value ? diffDays(nearestEvent.value.date) : null))
const nextEvents = computed(() => upcomingEvents.value.slice(1, 4))
// ───────────────────────────────────────────────────────────

onMounted(async () => {
  try {
    const { data } = await productApi.getProducts({ sort: 'favoriteCount,desc', size: 4, saleStatus: 'available' })
    popularProducts.value = data.content.map(mapProduct)
  } catch (e) {
    console.error('인기 상품 조회 실패', e)
  }
})
</script>

<template>
  <div class="bg-paper-dots min-h-screen">
    <!-- HERO -->
    <div class="relative max-w-230 mx-auto px-6 md:px-10 py-16 md:py-20">
      <div class="flex flex-col md:flex-row md:items-center gap-10 md:gap-12 lg:gap-20">
        <!-- LEFT: text content -->
        <div class="flex-1 min-w-0 relative">
          <div
            class="absolute bottom-0 -right-4 text-5xl opacity-[0.12] pointer-events-none hidden lg:block select-none"
          >
            ✦
          </div>

          <span
            class="inline-block rotate-[-1.2deg] mb-6 px-3 py-0.5 font-sketch text-sm text-[#8c7e6e] border-2 border-[#8c7e6e] rounded-md"
            >✦ 캠퍼스 중고거래 플랫폼</span
          >

          <h1 class="font-sketch font-bold leading-[1.05] mb-5 text-[clamp(3rem,7vw,5.5rem)]">
            학생들의<br />
            <span class="hl-word">낙서장</span>
          </h1>

          <p class="text-lg text-[#8c7e6e] mb-9">다 같이 믿을 수 있는 거래 환경을 만들어요 ✌️</p>

          <div
            class="flex items-center bg-white border-2 border-ink rounded-xl px-4 py-1.5 max-w-140 shadow-[4px_4px_0_#1c1712] gap-2.5"
          >
            <MagnifyingGlassIcon class="w-5 h-5 text-[#c8bca8] shrink-0" />
            <input
              type="text"
              placeholder="물품이나 게시글을 검색해보세요"
              class="flex-1 outline-none text-sm bg-transparent text-ink placeholder:text-[#c8bca8]"
            />
            <RouterLink
              to="/products"
              class="search-btn bg-[#ffe066] border-2 border-ink rounded-[10px] px-5 py-2 font-bold text-sm text-ink whitespace-nowrap"
              >검색</RouterLink
            >
          </div>

          <div class="flex flex-wrap items-center gap-2 mt-4">
            <span class="text-sm text-[#8c7e6e]">인기 검색어:</span>
            <RouterLink
              v-for="tag in ['노트북', '모니터', '키보드', '마우스', '도서']"
              :key="tag"
              to="/products"
              class="text-sm bg-white border-[1.5px] border-[#c8bca8] rounded-full px-3.5 py-1 text-[#8c7e6e] transition-all hover:border-ink hover:bg-[#ffe066] hover:text-ink"
              >{{ tag }}</RouterLink
            >
          </div>
        </div>

        <!-- RIGHT: Bulletin Board -->
        <div class="hidden md:flex flex-col items-center shrink-0 board-animate">
          <!-- hanger wire -->
          <div class="relative w-56 h-10 flex justify-center items-start">
            <div
              class="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#d4a84b] to-[#9a7220] border-2 border-[#6a4a0a] z-10 shadow-md"
            ></div>
            <div
              class="wire-left absolute top-[6px] left-[calc(50%+2px)] w-[88px] h-px bg-[#9a7830] origin-left"
              style="transform: rotate(28deg)"
            ></div>
            <div
              class="wire-right absolute top-[6px] right-[calc(50%+2px)] w-[88px] h-px bg-[#9a7830] origin-right"
              style="transform: rotate(-28deg)"
            ></div>
          </div>

          <!-- board frame -->
          <div class="bulletin-board w-64 rounded-xl p-3.5 shadow-[5px_5px_0_#1c1712]">
            <!-- mounting screws -->
            <div class="flex justify-between px-1 mb-2.5">
              <div
                class="screw w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#d4a84b] to-[#8a6418] border border-[#6a4a0a] relative shadow"
              >
                <div class="absolute inset-[3px] rounded-full border border-[#c49a3c] opacity-50"></div>
              </div>
              <div
                class="screw w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#d4a84b] to-[#8a6418] border border-[#6a4a0a] relative shadow"
              >
                <div class="absolute inset-[3px] rounded-full border border-[#c49a3c] opacity-50"></div>
              </div>
            </div>

            <!-- cork board interior -->
            <div class="board-inner rounded-lg p-4 flex flex-col gap-3">
              <!-- note 1: education progress (yellow) -->
              <div class="sticky-note yellow-note relative p-4 rounded-sm note-1">
                <div class="pushpin"></div>
                <p class="text-[11px] font-bold text-[#9a8060] mb-2 tracking-wide">📅 교육 진행 현황</p>
                <div class="flex items-baseline gap-1 mb-2">
                  <span class="font-sketch font-bold text-[32px] text-[#1c1712] leading-none">{{ currentDay }}</span>
                  <span class="text-[13px] text-[#8c7e6e] font-bold">/ {{ TOTAL_DAYS }}일차</span>
                </div>
                <div class="h-2 bg-[#1c1712] bg-opacity-10 rounded-full overflow-hidden mb-1.5">
                  <div
                    class="h-full bg-[#1c1712] rounded-full transition-all"
                    :style="{ width: progressPct + '%' }"
                  ></div>
                </div>
                <p class="text-[10px] text-[#8c7e6e]">{{ progressPct }}% 완료 · {{ remainingDays }}일 남음</p>
              </div>

              <!-- note 2 + 3 row -->
              <div class="flex gap-2.5">
                <!-- note 2: nearest D-day (pink) -->
                <div class="sticky-note pink-note relative flex-1 p-3 rounded-sm note-2">
                  <div class="pushpin"></div>
                  <template v-if="nearestEvent">
                    <p class="text-[10px] font-bold text-[#9a4060] mb-1">⚠️ 다음 일정</p>
                    <p class="text-[11px] font-bold text-[#1c1712] leading-tight mb-1">{{ nearestEvent.label }}</p>
                    <p class="font-sketch font-bold text-[22px] text-[#c02040] leading-none">
                      {{ formatDday(nearestDiff) }}
                    </p>
                    <p class="text-[10px] text-[#9a4060] mt-1">{{ shortDate(nearestEvent.date) }}</p>
                  </template>
                  <template v-else>
                    <p class="text-[10px] font-bold text-[#9a4060] mb-1">✅ 다음 일정</p>
                    <p class="text-[11px] font-bold text-[#1c1712]">모든 일정<br />완료!</p>
                  </template>
                </div>

                <!-- note 3: upcoming events list (mint) -->
                <div class="sticky-note green-note relative flex-1 p-3 rounded-sm note-3">
                  <div class="pushpin"></div>
                  <p class="text-[10px] font-bold text-[#3d6b52] mb-1.5">📋 이후 일정</p>
                  <template v-if="nextEvents.length">
                    <ul class="space-y-1">
                      <li v-for="ev in nextEvents" :key="ev.date + ev.label" class="flex items-center justify-between">
                        <span class="text-[10px] text-[#1c1712] font-bold truncate mr-1"
                          >{{ shortDate(ev.date) }} {{ TYPE_ICON[ev.type] }}</span
                        >
                        <span class="text-[10px] text-[#3d6b52] shrink-0">D-{{ diffDays(ev.date) }}</span>
                      </li>
                    </ul>
                  </template>
                  <template v-else>
                    <p class="text-[10px] text-[#3d6b52]">예정된 일정이<br />없어요</p>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dash-divider h-0.5" />

    <!-- CATEGORIES -->
    <section class="max-w-275 mx-auto px-6 md:px-10 py-13">
      <div class="flex items-baseline justify-between mb-8">
        <h2 class="sec-title font-bold text-[26px]">카테고리</h2>
        <RouterLink
          to="/products"
          class="text-sm text-[#8c7e6e] border-b border-dashed border-[#8c7e6e] pb-0.5 hover:text-ink hover:border-ink transition-colors"
          >전체보기 →</RouterLink
        >
      </div>
      <div class="cat-grid grid grid-cols-2 md:grid-cols-4 gap-4">
        <RouterLink
          v-for="item in categories"
          :key="item.title"
          :to="item.to"
          class="cat-card bg-white border-2 border-ink rounded-[18px] p-6 cursor-pointer relative overflow-hidden block"
        >
          <div class="absolute top-0 left-0 right-0 h-1.5" :style="{ background: item.tape }" />
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center mb-3 mt-1"
            :style="{ background: item.tape }"
          >
            <component :is="item.icon" class="w-5 h-5 text-ink" />
          </div>
          <p class="font-bold text-[17px] text-ink">{{ item.title }}</p>
          <p class="text-xs text-[#8c7e6e] mt-1">{{ item.desc }}</p>
        </RouterLink>
      </div>
    </section>

    <div class="dash-divider h-0.5" />

    <!-- POPULAR PRODUCTS -->
    <section class="max-w-275 mx-auto px-6 md:px-10 py-13">
      <div class="flex items-baseline justify-between mb-8">
        <h2 class="sec-title font-bold text-[26px]">인기 상품 🔥</h2>
        <RouterLink
          to="/products"
          class="text-sm text-[#8c7e6e] border-b border-dashed border-[#8c7e6e] pb-0.5 hover:text-ink hover:border-ink transition-colors"
          >전체보기 →</RouterLink
        >
      </div>
      <div class="prod-grid grid grid-cols-2 md:grid-cols-4 gap-5">
        <ProductCard v-for="product in popularProducts" :key="product.id" :product="product" :liked="false" />
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── Bulletin board ──────────────────────────────────────── */

.bulletin-board {
  background:
    repeating-linear-gradient(
      92deg,
      transparent 0px,
      transparent 10px,
      rgba(0, 0, 0, 0.025) 10px,
      rgba(0, 0, 0, 0.025) 11px
    ),
    repeating-linear-gradient(
      92deg,
      transparent 0px,
      transparent 24px,
      rgba(255, 255, 255, 0.04) 24px,
      rgba(255, 255, 255, 0.04) 25px
    ),
    linear-gradient(162deg, #c49a3c 0%, #9a7220 18%, #c0882a 35%, #8a6018 52%, #b07828 68%, #9a7220 84%, #c49a3c 100%);
  border: 2px solid #6a4a0a;
}

.board-inner {
  background-color: #2d5a48;
  background-image:
    radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.045) 1px, transparent 0),
    radial-gradient(circle at 5px 6px, rgba(0, 0, 0, 0.07) 1px, transparent 0);
  background-size:
    5px 5px,
    9px 9px;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.35);
}

/* Sticky notes */
.sticky-note {
  box-shadow:
    2px 4px 0 rgba(0, 0, 0, 0.12),
    0 6px 14px rgba(0, 0, 0, 0.22);
}

.yellow-note {
  background: linear-gradient(172deg, #fff9c4 0%, #ffe066 100%);
}

.green-note {
  background: linear-gradient(172deg, #d4f5e4 0%, #96d4b4 100%);
}

.pink-note {
  background: linear-gradient(172deg, #ffe8ee 0%, #f4b8c8 100%);
}

/* Pushpin */
.pushpin {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 15px;
  height: 15px;
  background: radial-gradient(circle at 38% 38%, #90bce8, #2860b8 60%, #1a3f80);
  border-radius: 50%;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.45),
    inset 0 -1px 2px rgba(0, 0, 0, 0.25),
    inset 1px 1px 2px rgba(255, 255, 255, 0.3);
  z-index: 10;
}

/* Wire lines */
.wire-left,
.wire-right {
  height: 1.5px;
  background: linear-gradient(to right, #7a5c10, #b08830);
}

/* ── Note entrance animations ────────────────────────────── */

.note-1 {
  animation: note-pop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) 0.52s both;
  --rot: -1deg;
  transform: rotate(-1deg);
}
.note-2 {
  animation: note-pop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) 0.66s both;
  --rot: 1.5deg;
  transform: rotate(1.5deg);
}
.note-3 {
  animation: note-pop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) 0.76s both;
  --rot: -1.2deg;
  transform: rotate(-1.2deg);
}

@keyframes note-pop {
  0% {
    opacity: 0;
    transform: scale(0.8) rotate(var(--rot));
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(var(--rot));
  }
}

/* Board drop-in animation */
@keyframes board-enter {
  0% {
    opacity: 0;
    transform: translateY(-24px) rotate(-2deg);
  }
  65% {
    transform: translateY(6px) rotate(0.8deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
}

.board-animate {
  animation: board-enter 0.65s cubic-bezier(0.34, 1.2, 0.64, 1) 0.1s both;
}

/* ── Existing styles ─────────────────────────────────────── */

.hl-word {
  position: relative;
  display: inline-block;
  z-index: 1;
}
.hl-word::before {
  content: '';
  position: absolute;
  bottom: 2px;
  left: -6px;
  right: -6px;
  height: 22px;
  background: #ffe066;
  z-index: -1;
  transform: rotate(-0.8deg) skewX(-4deg);
  border-radius: 3px;
}

.sec-title {
  position: relative;
  display: inline-block;
}
.sec-title::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  right: 0;
  height: 3px;
  background: #ffe066;
  border-radius: 2px;
}

.dash-divider {
  background: repeating-linear-gradient(90deg, #c8bca8 0 8px, transparent 8px 16px);
}

.search-btn {
  transition:
    transform 0.12s,
    box-shadow 0.12s;
}
.search-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 2px 2px 0 #1c1712;
}
.search-btn:active {
  transform: none;
  box-shadow: none;
}

.cat-card {
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}
.cat-grid > :nth-child(odd) {
  transform: rotate(-0.6deg);
}
.cat-grid > :nth-child(even) {
  transform: rotate(0.6deg);
}
.cat-grid > *:hover {
  transform: translateY(-5px) rotate(0deg);
  box-shadow: 5px 6px 0 #1c1712;
}

.prod-grid > *:nth-child(1) {
  transform: rotate(-1deg);
}
.prod-grid > *:nth-child(2) {
  transform: rotate(0.7deg);
}
.prod-grid > *:nth-child(3) {
  transform: rotate(-0.4deg);
}
.prod-grid > *:nth-child(4) {
  transform: rotate(1.1deg);
}
</style>
