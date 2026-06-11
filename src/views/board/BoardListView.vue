<script setup>
import { ref, computed, onMounted } from 'vue'
import { MagnifyingGlassIcon, PencilSquareIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import BoardPostCard from '@/components/board/BoardPostCard.vue'
import { boardApi } from '@/api/boardApi'

const posts = ref([])
const currentPage = ref(0)
const totalPages = ref(0)

const keyword = ref('')
const searchInput = ref('')
const searchType = ref('title')

const activeTab = ref('hot')
const popularPosts = ref([])
const mostViewedPosts = ref([])
const rankingLoading = ref(true)

async function fetchPosts(page = 0) {
  const pageData = await boardApi.getPosts(page, 10, keyword.value || null, searchType.value)
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
    <div class="board-hero px-6 py-10">
      <div class="max-w-6xl mx-auto">
        <span class="inline-block rotate-[-1.2deg] mb-4 px-3 py-0.5 font-sketch text-sm text-[#d4f5e4] border-2 border-[#d4f5e4] rounded-md opacity-80">✦ 익명 커뮤니티</span>
        <h1 class="font-sketch font-bold text-4xl text-white leading-tight mb-2">
          낙서장 <span class="text-[#ffe066]">게시판</span>
        </h1>
        <p class="text-[#d4f5e4] text-sm mt-2">자유롭게 이야기를 나눠보세요 ✌️</p>
      </div>
    </div>

    <!-- 메인 레이아웃: 본문 + 사이드바 -->
    <div class="max-w-6xl mx-auto px-6 py-8 flex gap-6 items-start">

      <!-- 본문 -->
      <div class="flex-1 min-w-0">
        <!-- 검색 + 글쓰기 -->
        <div class="flex items-center gap-2 mb-4">
          <div class="flex border-2 border-ink rounded-xl overflow-hidden text-sm shrink-0 shadow-[2px_2px_0_#1c1712]">
            <button
              @click="searchType = 'title'"
              class="px-3 py-2 transition-colors cursor-pointer font-bold"
              :class="searchType === 'title' ? 'bg-[#ffe066] text-ink' : 'bg-white text-[#8c7e6e] hover:text-ink'"
            >
              제목
            </button>
            <div class="w-px bg-ink" />
            <button
              @click="searchType = 'all'"
              class="px-3 py-2 transition-colors cursor-pointer font-bold"
              :class="searchType === 'all' ? 'bg-[#ffe066] text-ink' : 'bg-white text-[#8c7e6e] hover:text-ink'"
            >
              제목+내용
            </button>
          </div>
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
              class="px-3 py-2 text-[#8c7e6e] hover:text-ink transition-colors cursor-pointer border-l-2 border-ink"
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
            {{ keyword ? '검색 결과가 없습니다.' : '아직 게시글이 없어요. 첫 글을 남겨보세요 ✏️' }}
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

      <!-- 사이드바 (sticky) -->
      <div class="w-72 shrink-0 sticky top-8">
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
                🔥 Hot
              </button>
              <button
                @click="activeTab = 'mostViewed'"
                class="flex-1 py-1.5 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer"
                :class="activeTab === 'mostViewed'
                  ? 'bg-[#96d4b4] border-ink text-ink shadow-[2px_2px_0_#1c1712]'
                  : 'bg-white border-[#c8bca8] text-[#8c7e6e] hover:border-ink hover:text-ink'"
              >
                👁 Most Viewed
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
</style>
