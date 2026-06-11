<script setup>
import { ref, computed, onMounted } from 'vue'
import { MagnifyingGlassIcon, PencilSquareIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import BoardPostCard from '@/components/board/BoardPostCard.vue'
import { boardApi } from '@/api/boardApi'

const notices = [
  { id: 1, tag: '공지', title: '학교 축제 부스 모집합니다', date: '6/10' },
]

const posts = ref([])
const currentPage = ref(0)
const totalPages = ref(0)

const keyword = ref('')
const searchInput = ref('')

const activeTab = ref('hot')
const popularPosts = ref([])
const mostViewedPosts = ref([])
const rankingLoading = ref(true)

async function fetchPosts(page = 0) {
  const pageData = await boardApi.getPosts(page, 10, keyword.value || null, 'all')
  posts.value = pageData.content
  totalPages.value = pageData.totalPages
  currentPage.value = page
}

function search() {
  keyword.value = searchInput.value.trim()
  fetchPosts(0)
}

function clearSearch() {
  searchInput.value = ''
  keyword.value = ''
  fetchPosts(0)
}

async function fetchRanking() {
  try {
    const [popular, mostViewed] = await Promise.all([
      boardApi.getPopularPosts(5),
      boardApi.getMostViewedPosts(5),
    ])
    popularPosts.value = popular
    mostViewedPosts.value = mostViewed
  } finally {
    rankingLoading.value = false
  }
}

const currentBlock = computed(() => Math.floor(currentPage.value / 5))

const visiblePages = computed(() => {
  const start = currentBlock.value * 5
  const end = Math.min(start + 4, totalPages.value - 1)
  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const hasPrevBlock = computed(() => currentBlock.value > 0)
const hasNextBlock = computed(() => (currentBlock.value + 1) * 5 < totalPages.value)

function goToPrevBlock() {
  fetchPosts((currentBlock.value - 1) * 5)
}

function goToNextBlock() {
  fetchPosts((currentBlock.value + 1) * 5)
}

onMounted(() => {
  fetchPosts(0)
  fetchRanking()
})
</script>

<template>
  <div class="bg-paper-dots min-h-screen">
    <!-- 히어로 배너 -->
    <div class="board-hero px-6 py-4">
      <div class="max-w-6xl mx-auto flex items-center gap-3">
        <h1 class="font-bold text-2xl text-white tracking-tight">
          낙서장 <span class="text-[#ffe066]">게시판</span>
        </h1>
        <span class="text-xs font-bold text-[#d4f5e4] opacity-70 tracking-widest">✦ 익명 커뮤니티</span>
      </div>
    </div>

    <!-- 모바일 전용 인기글 -->
    <div class="block md:hidden max-w-6xl mx-auto px-6 pt-6">
      <div class="bg-white border-2 border-ink rounded-2xl shadow-[4px_4px_0_#1c1712] overflow-hidden">
        <div class="h-1.5 bg-[#ffe066]" />
        <div class="p-4">
          <div class="flex gap-2 mb-3">
            <button
              @click="activeTab = 'hot'"
              class="flex-1 py-1.5 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer"
              :class="activeTab === 'hot'
                ? 'bg-[#ffe066] border-ink text-ink shadow-[2px_2px_0_#1c1712]'
                : 'bg-white border-[#c8bca8] text-[#8c7e6e] hover:border-ink hover:text-ink'"
            >
              🔥 인기글
            </button>
            <button
              @click="activeTab = 'mostViewed'"
              class="flex-1 py-1.5 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer"
              :class="activeTab === 'mostViewed'
                ? 'bg-[#96d4b4] border-ink text-ink shadow-[2px_2px_0_#1c1712]'
                : 'bg-white border-[#c8bca8] text-[#8c7e6e] hover:border-ink hover:text-ink'"
            >
              👁 조회순
            </button>
          </div>
          <div v-if="rankingLoading" class="text-center py-4 text-sm text-[#8c7e6e]">불러오는 중...</div>
          <template v-else>
            <ul v-if="activeTab === 'hot'">
              <li v-if="popularPosts.length === 0" class="text-center py-4 text-sm text-[#8c7e6e]">인기글이 없습니다.</li>
              <li
                v-for="(post, index) in popularPosts"
                :key="post.id"
                class="flex items-center gap-3 py-2 border-b border-dashed border-[#c8bca8] last:border-b-0"
              >
                <span class="w-5 text-center text-sm font-bold font-sketch shrink-0" :class="index < 3 ? 'text-[#2d5a48]' : 'text-[#8c7e6e]'">{{ index + 1 }}</span>
                <RouterLink :to="`/board/${post.id}`" class="flex-1 text-sm text-ink font-medium hover:text-[#2d5a48] truncate transition-colors">{{ post.title }}</RouterLink>
                <span class="text-xs text-[#8c7e6e] shrink-0">♥ {{ post.likeCount ?? 0 }}</span>
              </li>
            </ul>
            <ul v-else>
              <li v-if="mostViewedPosts.length === 0" class="text-center py-4 text-sm text-[#8c7e6e]">게시글이 없습니다.</li>
              <li
                v-for="(post, index) in mostViewedPosts"
                :key="post.id"
                class="flex items-center gap-3 py-2 border-b border-dashed border-[#c8bca8] last:border-b-0"
              >
                <span class="w-5 text-center text-sm font-bold font-sketch shrink-0" :class="index < 3 ? 'text-[#2d5a48]' : 'text-[#8c7e6e]'">{{ index + 1 }}</span>
                <RouterLink :to="`/board/${post.id}`" class="flex-1 text-sm text-ink font-medium hover:text-[#2d5a48] truncate transition-colors">{{ post.title }}</RouterLink>
                <span class="text-xs text-[#8c7e6e] shrink-0">👁 {{ post.viewCount }}</span>
              </li>
            </ul>
          </template>
        </div>
      </div>
    </div>

    <!-- 메인 레이아웃: 본문 + 사이드바 -->
    <div class="max-w-6xl mx-auto px-6 py-8 flex gap-6 items-start">

      <!-- 본문 -->
      <div class="flex-1 min-w-0">
        <!-- 검색 + 글쓰기 -->
        <div class="flex items-center gap-2 mb-4">
          <div class="flex flex-1 items-center bg-white border-2 border-ink rounded-xl overflow-hidden shadow-[2px_2px_0_#1c1712]">
            <input
              v-model="searchInput"
              @keyup.enter="search"
              type="text"
              placeholder="검색어를 입력하세요"
              class="flex-1 px-4 py-2 text-sm text-ink outline-none placeholder:text-[#8c7e6e]"
            />
            <button
              v-if="searchInput"
              @click="clearSearch"
              class="px-3 text-[#8c7e6e] hover:text-ink text-sm cursor-pointer"
            >
              ✕
            </button>
            <button
              @click="search"
              class="px-3 py-2 text-[#8c7e6e] hover:text-ink transition-colors cursor-pointer"
            >
              <MagnifyingGlassIcon class="w-4 h-4" />
            </button>
          </div>
          <RouterLink
            to="/board/write"
            class="flex items-center gap-2 bg-[#ffe066] border-2 border-ink text-ink text-sm font-bold px-4 py-2.5 rounded-xl shadow-[3px_3px_0_#1c1712] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1c1712] transition-all shrink-0"
          >
            <PencilSquareIcon class="w-4 h-4" />
            글쓰기
          </RouterLink>
        </div>

        <!-- 공지사항 -->
        <div v-if="!keyword" class="mb-4 flex flex-col gap-2">
          <div
            v-for="(notice, i) in notices"
            :key="notice.id"
            class="notice-pin relative bg-[#fff9c4] border-2 border-ink rounded-xl px-4 py-3 shadow-[2px_2px_0_#1c1712]"
            :style="`transform: rotate(${i % 2 === 0 ? '-0.4deg' : '0.3deg'})`"
          >
            <div class="pushpin-dot" />
            <div class="flex items-center gap-2.5">
              <span class="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-[#7a6010] bg-[#ffe066] border border-[#c8aa40] px-2 py-0.5 rounded-full">
                📌 {{ notice.tag }}
              </span>
              <p class="text-sm font-bold text-ink flex-1">{{ notice.title }}</p>
              <span class="text-[11px] text-[#8c7e6e] shrink-0">{{ notice.date }}</span>
            </div>
          </div>
        </div>

        <!-- 검색 안내 -->
        <p v-if="keyword" class="text-xs text-[#8c7e6e] mb-3">
          "<span class="font-bold text-ink">{{ keyword }}</span>" 검색 결과
        </p>

        <!-- 글 목록 -->
        <div class="bg-white border-2 border-ink rounded-2xl shadow-[4px_4px_0_#1c1712] overflow-hidden">
          <div class="h-1.5 bg-[#96d4b4]" />
          <ul v-if="posts.length > 0" class="divide-y-2 divide-dashed divide-[#e8e0d4]">
            <li v-for="post in posts" :key="post.id">
              <BoardPostCard :post="post" />
            </li>
          </ul>
          <p v-else class="text-center text-[#8c7e6e] py-16">
            {{ keyword ? '검색 결과가 없습니다.' : '오늘 첫 글을 작성해보세요 ✏️' }}
          </p>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8 mb-4">
          <button
            v-if="hasPrevBlock"
            @click="goToPrevBlock"
            class="w-9 h-9 flex items-center justify-center border-2 border-ink rounded-xl bg-white text-ink hover:bg-[#ffe066] shadow-[2px_2px_0_#1c1712] transition-all cursor-pointer"
          >
            <ChevronLeftIcon class="w-4 h-4" />
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="fetchPosts(page)"
            :class="currentPage === page
              ? 'bg-[#ffe066] border-ink text-ink shadow-[2px_2px_0_#1c1712]'
              : 'bg-white border-[#c8bca8] text-[#8c7e6e] hover:border-ink hover:text-ink'"
            class="w-9 h-9 rounded-xl font-bold text-sm border-2 transition-all cursor-pointer"
          >
            {{ page + 1 }}
          </button>
          <button
            v-if="hasNextBlock"
            @click="goToNextBlock"
            class="w-9 h-9 flex items-center justify-center border-2 border-ink rounded-xl bg-white text-ink hover:bg-[#ffe066] shadow-[2px_2px_0_#1c1712] transition-all cursor-pointer"
          >
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- 사이드바 (sticky) - 데스크탑 전용 -->
      <div class="hidden md:block w-72 shrink-0 sticky top-8">
        <div class="bg-white border-2 border-ink rounded-2xl shadow-[4px_4px_0_#1c1712] overflow-hidden">
          <div class="h-1.5 bg-[#ffe066]" />
          <div class="p-5">
            <div class="flex gap-2 mb-4">
              <button
                @click="activeTab = 'hot'"
                class="flex-1 py-1.5 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer"
                :class="activeTab === 'hot'
                  ? 'bg-[#ffe066] border-ink text-ink shadow-[2px_2px_0_#1c1712]'
                  : 'bg-white border-[#c8bca8] text-[#8c7e6e] hover:border-ink hover:text-ink'"
              >
                🔥 인기글
              </button>
              <button
                @click="activeTab = 'mostViewed'"
                class="flex-1 py-1.5 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer"
                :class="activeTab === 'mostViewed'
                  ? 'bg-[#96d4b4] border-ink text-ink shadow-[2px_2px_0_#1c1712]'
                  : 'bg-white border-[#c8bca8] text-[#8c7e6e] hover:border-ink hover:text-ink'"
              >
                👁 조회순
              </button>
            </div>

            <div v-if="rankingLoading" class="text-center py-6 text-sm text-[#8c7e6e]">불러오는 중...</div>
            <template v-else>
              <ul v-if="activeTab === 'hot'">
                <li v-if="popularPosts.length === 0" class="text-center py-6 text-sm text-[#8c7e6e]">
                  인기글이 없습니다.
                </li>
                <li
                  v-for="(post, index) in popularPosts"
                  :key="post.id"
                  class="flex items-center gap-3 py-2.5 border-b border-dashed border-[#c8bca8] last:border-b-0"
                >
                  <span class="w-5 text-center text-sm font-bold font-sketch shrink-0" :class="index < 3 ? 'text-[#2d5a48]' : 'text-[#8c7e6e]'">
                    {{ index + 1 }}
                  </span>
                  <RouterLink
                    :to="`/board/${post.id}`"
                    class="flex-1 text-sm text-ink font-medium hover:text-[#2d5a48] truncate transition-colors"
                  >
                    {{ post.title }}
                  </RouterLink>
                  <span class="text-xs text-[#8c7e6e] shrink-0">♥ {{ post.likeCount ?? 0 }}</span>
                </li>
              </ul>
              <ul v-else>
                <li v-if="mostViewedPosts.length === 0" class="text-center py-6 text-sm text-[#8c7e6e]">
                  게시글이 없습니다.
                </li>
                <li
                  v-for="(post, index) in mostViewedPosts"
                  :key="post.id"
                  class="flex items-center gap-3 py-2.5 border-b border-dashed border-[#c8bca8] last:border-b-0"
                >
                  <span class="w-5 text-center text-sm font-bold font-sketch shrink-0" :class="index < 3 ? 'text-[#2d5a48]' : 'text-[#8c7e6e]'">
                    {{ index + 1 }}
                  </span>
                  <RouterLink
                    :to="`/board/${post.id}`"
                    class="flex-1 text-sm text-ink font-medium hover:text-[#2d5a48] truncate transition-colors"
                  >
                    {{ post.title }}
                  </RouterLink>
                  <span class="text-xs text-[#8c7e6e] shrink-0">👁 {{ post.viewCount }}</span>
                </li>
              </ul>
            </template>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.board-hero {
  background-color: #2d5a48;
  box-shadow: 0 4px 0 #1c1712;
}

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
</style>
