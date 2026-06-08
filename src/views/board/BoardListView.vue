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

// 현재 페이지가 속한 블록 (블록 크기 5)
const currentBlock = computed(() => Math.floor(currentPage.value / 5))

// 현재 블록에 해당하는 페이지 번호 목록
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
  <div>
    <div class="bg-primary/10 px-6 py-12">
      <p class="text-4xl font-extrabold text-text-main pb-3">익명 게시판</p>
      <p class="text-base text-text-sub pt-3">자유롭게 이야기를 나눠보세요</p>
    </div>

    <div class="max-w-4xl mx-auto px-6 py-8">
      <!-- 랭킹 탭 섹션 -->
      <div class="border border-border rounded-2xl p-5 mb-8">
        <div class="flex gap-1 mb-4">
          <button
            @click="activeTab = 'hot'"
            class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            :class="activeTab === 'hot' ? 'bg-primary text-white' : 'text-text-sub hover:text-text-main'"
          >
            Hot
          </button>
          <button
            @click="activeTab = 'mostViewed'"
            class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            :class="activeTab === 'mostViewed' ? 'bg-primary text-white' : 'text-text-sub hover:text-text-main'"
          >
            Most Viewed
          </button>
        </div>

        <div v-if="rankingLoading" class="text-center py-6 text-sm text-text-sub">불러오는 중...</div>
        <template v-else>
          <ul v-if="activeTab === 'hot'">
            <li v-if="popularPosts.length === 0" class="text-center py-6 text-sm text-text-sub">
              인기글이 없습니다.
            </li>
            <li
              v-for="(post, index) in popularPosts"
              :key="post.id"
              class="flex items-center gap-3 py-2.5 border-b border-border last:border-b-0"
            >
              <span class="w-5 text-center text-sm font-bold" :class="index < 3 ? 'text-primary' : 'text-text-sub'">
                {{ index + 1 }}
              </span>
              <RouterLink
                :to="`/board/${post.id}`"
                class="flex-1 text-sm text-text-main hover:text-primary truncate transition-colors"
              >
                {{ post.title }}
              </RouterLink>
              <span class="text-xs text-text-sub shrink-0">♥ {{ post.likeCount ?? 0 }}</span>
            </li>
          </ul>
          <ul v-else>
            <li v-if="mostViewedPosts.length === 0" class="text-center py-6 text-sm text-text-sub">
              게시글이 없습니다.
            </li>
            <li
              v-for="(post, index) in mostViewedPosts"
              :key="post.id"
              class="flex items-center gap-3 py-2.5 border-b border-border last:border-b-0"
            >
              <span class="w-5 text-center text-sm font-bold" :class="index < 3 ? 'text-primary' : 'text-text-sub'">
                {{ index + 1 }}
              </span>
              <RouterLink
                :to="`/board/${post.id}`"
                class="flex-1 text-sm text-text-main hover:text-primary truncate transition-colors"
              >
                {{ post.title }}
              </RouterLink>
              <span class="text-xs text-text-sub shrink-0">👁 {{ post.viewCount }}</span>
            </li>
          </ul>
        </template>
      </div>

      <!-- 검색 + 글쓰기 -->
      <div class="flex items-center gap-2 mb-4">
        <div class="flex border border-border rounded-xl overflow-hidden text-sm shrink-0">
          <button
            @click="searchType = 'title'"
            class="px-3 py-2 transition-colors cursor-pointer"
            :class="searchType === 'title' ? 'bg-primary text-white font-semibold' : 'text-text-sub hover:text-text-main'"
          >
            제목
          </button>
          <button
            @click="searchType = 'all'"
            class="px-3 py-2 transition-colors cursor-pointer"
            :class="searchType === 'all' ? 'bg-primary text-white font-semibold' : 'text-text-sub hover:text-text-main'"
          >
            제목+내용
          </button>
        </div>
        <div class="flex flex-1 items-center border border-border rounded-xl overflow-hidden">
          <input
            v-model="searchInput"
            @keyup.enter="search"
            type="text"
            placeholder="검색어를 입력하세요"
            class="flex-1 px-4 py-2 text-sm text-text-main outline-none"
          />
          <button
            v-if="searchInput"
            @click="clearSearch"
            class="px-3 text-text-sub hover:text-text-main text-sm cursor-pointer"
          >
            ✕
          </button>
          <button
            @click="search"
            class="px-3 py-2 text-text-sub hover:text-primary transition-colors cursor-pointer"
          >
            <MagnifyingGlassIcon class="w-4 h-4" />
          </button>
        </div>
        <RouterLink
          to="/board/write"
          class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors duration-200 shrink-0"
        >
          <PencilSquareIcon class="w-4 h-4" />
          글쓰기
        </RouterLink>
      </div>

      <!-- 검색 중 안내 -->
      <p v-if="keyword" class="text-xs text-text-sub mb-3">
        "<span class="font-semibold text-text-main">{{ keyword }}</span>" 검색 결과
      </p>

      <ul v-if="posts.length > 0" class="flex flex-col divide-y divide-border">
        <li v-for="post in posts" :key="post.id">
          <BoardPostCard :post="post" />
        </li>
      </ul>

      <p v-else class="text-center text-text-sub py-16">
        {{ keyword ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.' }}
      </p>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-1.5 mt-8 mb-4">
        <button
          v-if="hasPrevBlock"
          @click="goToPrevBlock"
          class="w-9 h-9 flex items-center justify-center border border-border rounded-xl text-text-sub hover:text-text-main hover:bg-primary/10 transition-colors cursor-pointer"
        >
          <ChevronLeftIcon class="w-4 h-4" />
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="fetchPosts(page)"
          :class="currentPage === page ? 'bg-primary text-white' : 'border border-border text-text-main hover:bg-primary/10'"
          class="w-9 h-9 rounded-xl font-semibold text-sm transition-colors duration-200 cursor-pointer"
        >
          {{ page + 1 }}
        </button>
        <button
          v-if="hasNextBlock"
          @click="goToNextBlock"
          class="w-9 h-9 flex items-center justify-center border border-border rounded-xl text-text-sub hover:text-text-main hover:bg-primary/10 transition-colors cursor-pointer"
        >
          <ChevronRightIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
