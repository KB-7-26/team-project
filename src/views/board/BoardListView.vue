<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import {
  FireIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/vue/24/solid'
import BoardPostCard from '@/components/board/BoardPostCard.vue'
import AuthRequiredModal from '@/components/common/AuthRequiredModal.vue'
import { boardApi } from '@/api/boardApi'
import { useAuthRequiredModal } from '@/composables/useAuthRequiredModal'
import { formatDate } from '@/utils/formatDate'

const route = useRoute()
const {
  authRequiredModalOpen,
  authRequiredModalMode,
  confirmAuthRequired,
  goToVerifiedRoute,
} = useAuthRequiredModal()

const notices = ref([])
const currentNoticeIndex = ref(0)
let noticeTimer = null

const currentNotice = computed(() => notices.value[currentNoticeIndex.value])

const posts = ref([])
const currentPage = ref(0)
const totalPages = ref(0)
const totalElements = ref(0)

const keyword = ref('')
const searchInput = ref('')
const selectedMode = ref('all') // 'all' | 'hot' | category value string

const CATEGORIES = [
  { value: '공지', label: '공지사항' },
  { value: '자유게시판', label: '자유게시판', icon: null },
  { value: '전공', label: '전공', icon: null },
  { value: '비전공', label: '비전공', icon: null },
  { value: '취업', label: '취업', icon: null },
]

const popularPosts = ref([])
const rankingLoading = ref(true)

async function fetchPosts(page = 0) {
  const categoryFilter = selectedMode.value === 'all' ? null : selectedMode.value
  const pageData = await boardApi.getPosts(page, 15, keyword.value || null, 'all', categoryFilter)
  posts.value = pageData.content.filter(p => p.category !== '공지')
  totalPages.value = pageData.totalPages
  totalElements.value = pageData.totalElements ?? 0
  currentPage.value = page
}

async function fetchNotices() {
  const pageData = await boardApi.getPosts(0, 5, null, 'title', '공지')
  notices.value = pageData.content
  if (notices.value.length > 1) {
    noticeTimer = setInterval(() => {
      currentNoticeIndex.value = (currentNoticeIndex.value + 1) % notices.value.length
    }, 4000)
  }
}

onBeforeUnmount(() => clearInterval(noticeTimer))

function selectMode(mode) {
  selectedMode.value = mode
  keyword.value = ''
  searchInput.value = ''
  if (mode !== 'hot' && mode !== '공지') fetchPosts(0)
}

function search() {
  keyword.value = searchInput.value.trim()
  searchInput.value = ''
  if (selectedMode.value === 'hot') selectedMode.value = 'all'
  fetchPosts(0)
}

function clearSearch() {
  searchInput.value = ''
  keyword.value = ''
  fetchPosts(0)
}

async function fetchRanking() {
  try {
    popularPosts.value = await boardApi.getPopularPosts(20)
  } finally {
    rankingLoading.value = false
  }
}

const visiblePages = computed(() => {
  const blockStart = Math.floor(currentPage.value / 5) * 5
  const blockEnd = Math.min(blockStart + 4, totalPages.value - 1)
  const pages = []
  for (let i = blockStart; i <= blockEnd; i++) pages.push(i)
  return pages
})

const writeUrl = computed(() => {
  if (selectedMode.value === 'all' || selectedMode.value === 'hot') return '/board/write'
  return `/board/write?category=${selectedMode.value}`
})

const currentLabel = computed(() => {
  if (selectedMode.value === 'all') return '전체글보기'
  if (selectedMode.value === 'hot') return '인기글'
  return CATEGORIES.find((c) => c.value === selectedMode.value)?.label ?? selectedMode.value
})

const currentTotalElements = computed(() => {
  if (selectedMode.value === '공지') return notices.value.length
  return totalElements.value
})

onMounted(() => {
  const modeFromQuery = route.query.mode
  const keywordFromQuery = route.query.keyword
  if (modeFromQuery) selectedMode.value = modeFromQuery
  if (keywordFromQuery) keyword.value = String(keywordFromQuery)
  if (selectedMode.value !== 'hot' && selectedMode.value !== '공지') fetchPosts(0)
  fetchNotices()
  fetchRanking()
})
</script>

<template>
  <div class="bg-paper-dots min-h-screen">
    <!-- 히어로 배너 -->
    <div class="board-hero px-6 py-4">
      <div class="max-w-6xl mx-auto flex items-center gap-3">
        <h1 class="font-bold text-2xl text-white tracking-tight">
          <span class="text-[#ffe066]">낙서판</span>
        </h1>
        <span class="text-xs font-bold text-[#d4f5e4] opacity-70 tracking-widest">✦ 익명 커뮤니티</span>
      </div>
    </div>

    <!-- 메인 레이아웃: 사이드바(왼쪽) + 본문 -->
    <div class="max-w-6xl mx-auto px-6 py-8 flex gap-6 items-start">

      <!-- 왼쪽 카테고리 사이드바 (데스크탑 전용) -->
      <div class="hidden md:block border-2 border-ink rounded-2xl p-4 w-48 shrink-0 sticky top-20 self-start bg-white shadow-[4px_4px_0_#1c1712]">
        <div class="flex items-center px-4 pt-4 pb-2">
          <p class="font-bold text-lg text-ink">게시판</p>
        </div>
        <hr class="mx-4 mb-2 border-[#c8bca8]" />
        <ul class="flex flex-col">
          <li
            @click="selectMode('all')"
            :class="selectedMode === 'all' ? 'bg-[#2d5a48] text-white border-ink shadow-[2px_2px_0_#1c1712]' : 'text-ink hover:bg-[#2d5a48]/10 border-transparent'"
            class="mx-2 my-1 px-4 py-2 cursor-pointer rounded-lg border-2 transition-all"
          >전체글보기</li>
          <li
            @click="selectMode('hot')"
            :class="selectedMode === 'hot' ? 'bg-[#2d5a48] text-white border-ink shadow-[2px_2px_0_#1c1712]' : 'text-ink hover:bg-[#2d5a48]/10 border-transparent'"
            class="mx-2 my-1 px-4 py-2 cursor-pointer rounded-lg border-2 transition-all inline-flex items-center gap-2"
          >
            <FireIcon class="w-4 h-4 shrink-0" />
            <span>인기글</span>
          </li>
          <hr class="mx-4 my-1 border-[#c8bca8]" />
          <li
            v-for="cat in CATEGORIES"
            :key="cat.value"
            @click="selectMode(cat.value)"
            :class="selectedMode === cat.value ? 'bg-[#2d5a48] text-white border-ink shadow-[2px_2px_0_#1c1712]' : 'text-ink hover:bg-[#2d5a48]/10 border-transparent'"
            class="mx-2 my-1 px-4 py-2 cursor-pointer rounded-lg border-2 transition-all"
          >{{ cat.label }}</li>
        </ul>
      </div>

      <!-- 본문 -->
      <div class="flex-1 min-w-0">

        <!-- 모바일 카테고리 칩 -->
        <div class="flex gap-2 overflow-x-auto no-scrollbar mb-4 md:hidden pb-0.5">
          <button
            @click="selectMode('all')"
            class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer whitespace-nowrap"
            :class="selectedMode === 'all' ? 'bg-ink text-white border-ink shadow-[2px_2px_0_#1c1712]' : 'bg-white border-[#c8bca8] text-[#8c7e6e]'"
          >전체</button>
          <button
            @click="selectMode('hot')"
            class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1"
            :class="selectedMode === 'hot' ? 'bg-[#2d5a48] text-white border-[#2d5a48] shadow-[2px_2px_0_#1c1712]' : 'bg-white border-[#c8bca8] text-[#8c7e6e]'"
          >
            <FireIcon class="w-3.5 h-3.5 shrink-0" />
            <span>인기글</span>
          </button>
          <button
            v-for="cat in CATEGORIES"
            :key="cat.value"
            @click="selectMode(cat.value)"
            class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer whitespace-nowrap"
            :class="selectedMode === cat.value ? 'bg-[#2d5a48] text-white border-[#2d5a48] shadow-[2px_2px_0_#1c1712]' : 'bg-white border-[#c8bca8] text-[#8c7e6e]'"
          >{{ cat.label }}</button>
        </div>

        <!-- 검색 + 글쓰기 -->
        <div class="flex items-center gap-2 mb-4">
          <div class="flex flex-1 min-w-0 items-center bg-white border-2 border-ink rounded-xl shadow-[2px_2px_0_#1c1712]">
            <input
              v-model="searchInput"
              @keyup.enter="search"
              type="text"
              placeholder="검색어를 입력하세요"
              class="flex-1 min-w-0 px-4 py-2 text-sm text-ink outline-none placeholder:text-[#8c7e6e]"
            />
            <button
              @click="searchInput ? clearSearch() : search()"
              class="pl-3 pr-4 py-2 text-[#8c7e6e] hover:text-ink transition-colors cursor-pointer"
            >
              <XMarkIcon v-if="searchInput" class="w-4 h-4" />
              <MagnifyingGlassIcon v-else class="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            @click="goToVerifiedRoute(writeUrl)"
            class="flex items-center gap-2 bg-[#ffe066] border-2 border-ink text-ink text-sm font-bold px-4 py-2.5 rounded-xl shadow-[3px_3px_0_#1c1712] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1c1712] transition-all shrink-0"
          >
            <PencilSquareIcon class="w-4 h-4" />
            글쓰기
          </button>
        </div>

        <!-- 현재 섹션 레이블 -->
        <div class="flex items-center gap-2 mb-3">
          <span class="w-1 h-4 bg-[#2d5a48] rounded-full" />
          <FireIcon v-if="selectedMode === 'hot'" class="w-4 h-4 shrink-0 text-[#e85d04]" />
          <MegaphoneIcon v-else-if="selectedMode === '공지'" class="w-4 h-4 shrink-0 text-[#2d5a48]" />
          <h2 class="text-sm font-bold text-ink">{{ currentLabel }}</h2>
          <span v-if="selectedMode !== 'hot' && !keyword" class="text-xs text-[#8c7e6e]">({{ currentTotalElements }})</span>
          <span v-if="keyword" class="text-xs text-[#8c7e6e]">
            — "<span class="font-bold text-ink">{{ keyword }}</span>" 검색 결과
          </span>
        </div>

        <!-- 공지사항 핀 (전체글보기에서만, 세로 캐러셀) -->
        <div v-if="selectedMode === 'all' && notices.length > 0 && !keyword" class="mb-4">
          <div
            class="notice-pin relative bg-[#fff9c4] border-2 border-ink rounded-xl px-4 py-3 shadow-[2px_2px_0_#1c1712]"
            style="transform: rotate(-0.4deg)"
          >
            <div class="pushpin-dot" />
            <div class="flex items-center gap-2.5 h-6">
              <span class="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-[#7a6010] bg-[#ffe066] border border-[#c8aa40] px-2 py-0.5 rounded-full">
                <MegaphoneIcon class="w-3 h-3 shrink-0" />
                <span>공지</span>
              </span>
              <div class="flex-1 min-w-0 relative h-full overflow-hidden">
                <Transition name="notice-slot" mode="out-in">
                  <RouterLink
                    :key="currentNotice?.id"
                    :to="`/board/${currentNotice?.id}?from=all`"
                    class="absolute inset-0 flex items-center text-sm font-bold text-ink hover:text-[#2d5a48] truncate transition-colors"
                  >{{ currentNotice?.title }}</RouterLink>
                </Transition>
              </div>
              <span class="text-[11px] text-[#8c7e6e] shrink-0">{{ formatDate(currentNotice?.createdAt) }}</span>
              <span v-if="notices.length > 1" class="text-[10px] text-[#8c7e6e]/60 font-bold shrink-0">
                {{ currentNoticeIndex + 1 }}/{{ notices.length }}
              </span>
            </div>
          </div>
        </div>

        <!-- 공지 탭: 번호 리스트 -->
        <div v-if="selectedMode === '공지'" class="bg-white border-2 border-ink rounded-2xl shadow-[4px_4px_0_#1c1712] overflow-hidden">
          <div class="h-1.5 bg-[#ffe066]" />
          <div class="flex items-center py-2 px-4 border-b-2 border-[#e8e0d4] bg-[#faf7f0]">
            <span class="w-10 shrink-0 text-center text-[11px] font-bold text-[#8c7e6e]">번호</span>
            <span class="flex-1 px-3 text-[11px] font-bold text-[#8c7e6e]">제목</span>
            <span class="w-20 shrink-0 text-center text-[11px] font-bold text-[#8c7e6e]">작성일</span>
          </div>
          <ul v-if="notices.length > 0" class="divide-y divide-dashed divide-[#e8e0d4]">
            <li
              v-for="(notice, index) in notices"
              :key="notice.id"
              class="flex items-center px-4 py-2.5 hover:bg-[#fffef5] transition-colors"
            >
              <span class="w-10 shrink-0 text-center text-xs font-mono tabular-nums text-[#8c7e6e]">{{ index + 1 }}</span>
              <RouterLink
                :to="`/board/${notice.id}?from=공지`"
                class="flex-1 min-w-0 px-3 flex items-center gap-1.5"
              >
                <span class="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md border text-orange-600 bg-orange-50 border-orange-200">공지</span>
                <span class="text-sm font-bold text-ink hover:text-[#2d5a48] truncate transition-colors">{{ notice.title }}</span>
              </RouterLink>
              <span class="w-20 shrink-0 text-[11px] text-center text-[#8c7e6e]">{{ formatDate(notice.createdAt) }}</span>
            </li>
          </ul>
          <p v-else class="text-center text-[#8c7e6e] py-16">등록된 공지사항이 없습니다.</p>
        </div>

        <!-- 인기글 목록 -->
        <div v-if="selectedMode === 'hot'" class="bg-white border-2 border-ink rounded-2xl shadow-[4px_4px_0_#1c1712] overflow-hidden">
          <div class="h-1.5 bg-[#ffe066]" />
          <div class="flex items-center py-2 px-4 border-b-2 border-[#e8e0d4] bg-[#faf7f0]">
            <span class="w-10 shrink-0 text-center text-[11px] font-bold text-[#8c7e6e]">순위</span>
            <span class="flex-1 px-3 text-[11px] font-bold text-[#8c7e6e]">제목</span>
            <span class="w-16 shrink-0 text-center text-[11px] font-bold text-[#8c7e6e]">작성일</span>
            <span class="hidden md:block w-12 shrink-0 text-center text-[11px] font-bold text-[#8c7e6e]">조회</span>
            <span class="w-12 shrink-0 text-center text-[11px] font-bold text-[#8c7e6e]">추천</span>
          </div>
          <div v-if="rankingLoading" class="text-center py-16 text-sm text-[#8c7e6e]">불러오는 중...</div>
          <ul v-else-if="popularPosts.length > 0" class="divide-y divide-dashed divide-[#e8e0d4]">
            <li
              v-for="(post, index) in popularPosts"
              :key="post.id"
              class="flex items-center px-4 py-2.5 hover:bg-[#faf7f0] transition-colors"
            >
              <span
                class="w-10 shrink-0 text-center text-xs font-mono tabular-nums"
                :class="index === 0 ? 'text-[#e85d04]' : index === 1 ? 'text-[#f48c06]' : index === 2 ? 'text-[#faa307]' : 'text-[#8c7e6e]'"
              >{{ index + 1 }}</span>
              <RouterLink
                :to="`/board/${post.id}?from=hot`"
                class="flex-1 min-w-0 px-3 flex items-center gap-1.5"
              >
                <span class="text-sm text-ink font-medium hover:text-[#2d5a48] truncate transition-colors">{{ post.title }}</span>
                <span v-if="post.commentCount > 0" class="shrink-0 text-[11px] font-bold text-[#2d5a48]">[{{ post.commentCount }}]</span>
              </RouterLink>
              <span class="w-16 shrink-0 text-center text-[11px] text-[#8c7e6e]">{{ formatDate(post.createdAt) }}</span>
              <span class="hidden md:block w-12 shrink-0 text-center text-xs text-[#8c7e6e] tabular-nums">{{ post.viewCount }}</span>
              <span class="w-12 shrink-0 text-xs font-bold text-[#2d5a48] inline-flex items-center justify-center gap-1">
                <HandThumbUpSolidIcon class="w-3.5 h-3.5 shrink-0" />
                <span>{{ post.likeCount ?? 0 }}</span>
              </span>
            </li>
          </ul>
          <p v-else class="text-center text-[#8c7e6e] py-16">인기글이 없습니다.</p>
        </div>

        <!-- 일반 게시글 목록 -->
        <div v-else-if="selectedMode !== '공지'" class="bg-white border-2 border-ink rounded-2xl shadow-[4px_4px_0_#1c1712] overflow-hidden">
          <div class="h-1.5 bg-[#96d4b4]" />
          <div class="flex items-center py-2 px-4 border-b-2 border-[#e8e0d4] bg-[#faf7f0]">
            <span class="w-10 shrink-0 text-center text-[11px] font-bold text-[#8c7e6e]">번호</span>
            <span class="flex-1 px-3 text-[11px] font-bold text-[#8c7e6e]">제목</span>
            <span class="w-16 shrink-0 text-center text-[11px] font-bold text-[#8c7e6e]">작성일</span>
            <span class="hidden md:block w-12 shrink-0 text-center text-[11px] font-bold text-[#8c7e6e]">조회</span>
            <span class="hidden md:block w-12 shrink-0 text-center text-[11px] font-bold text-[#8c7e6e]">추천</span>
          </div>
          <ul v-if="posts.length > 0" class="divide-y divide-dashed divide-[#e8e0d4]">
            <li v-for="(post, i) in posts" :key="post.id">
              <BoardPostCard :post="post" :rank="totalElements - currentPage * 15 - i" :from="selectedMode !== 'all' ? selectedMode : undefined" />
            </li>
          </ul>
          <p v-else class="text-center text-[#8c7e6e] py-16">
            <template v-if="keyword">검색 결과가 없습니다.</template>
            <span v-else class="inline-flex items-center justify-center gap-1.5">
              오늘 첫 글을 작성해보세요
              <PencilSquareIcon class="w-4 h-4 shrink-0" />
            </span>
          </p>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="selectedMode !== 'hot' && selectedMode !== '공지' && totalPages > 1" class="flex justify-center items-center gap-1 mt-8 mb-4">
          <button @click="fetchPosts(Math.max(0, currentPage - 5))" :disabled="currentPage <= 0" class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all">«</button>
          <button @click="fetchPosts(Math.max(0, currentPage - 1))" :disabled="currentPage <= 0" class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all">‹</button>
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="fetchPosts(page)"
            :class="currentPage === page ? 'bg-[#ffe066] border-ink shadow-[2px_2px_0_#1c1712] text-ink' : 'bg-white border-[#c8bca8] text-ink hover:border-ink hover:shadow-[2px_2px_0_#1c1712]'"
            class="min-w-8 h-8 md:min-w-9 md:h-9 px-2 rounded-xl font-bold text-sm border-2 transition-all"
          >{{ page + 1 }}</button>
          <button @click="fetchPosts(Math.min(totalPages - 1, currentPage + 1))" :disabled="currentPage >= totalPages - 1" class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all">›</button>
          <button @click="fetchPosts(Math.min(totalPages - 1, currentPage + 5))" :disabled="currentPage >= totalPages - 1" class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all">»</button>
        </div>

      </div>
    </div>
    <AuthRequiredModal
      v-model:open="authRequiredModalOpen"
      :mode="authRequiredModalMode"
      @confirm="confirmAuthRequired"
    />
  </div>
</template>

<style scoped>
.board-hero {
  background-color: #2d5a48;
  box-shadow: 0 4px 0 #1c1712;
}

.notice-slot-enter-active,
.notice-slot-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
  position: absolute;
  width: 100%;
}
.notice-slot-enter-from { transform: translateY(100%); opacity: 0; }
.notice-slot-leave-to  { transform: translateY(-100%); opacity: 0; }
.notice-slot-enter-to,
.notice-slot-leave-from { transform: translateY(0); opacity: 1; }

.pushpin-dot {
  position: absolute;
  top: -7px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  background: radial-gradient(circle at 38% 38%, #90bce8, #2860b8 60%, #1a3f80);
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.3);
  z-index: 10;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
