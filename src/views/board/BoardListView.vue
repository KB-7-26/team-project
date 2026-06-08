<script setup>
import { ref, onMounted } from 'vue'
import { PencilSquareIcon } from '@heroicons/vue/24/outline'
import BoardPostCard from '@/components/board/BoardPostCard.vue'
import { boardApi } from '@/api/boardApi'

const posts = ref([])
const currentPage = ref(0)
const totalPages = ref(0)

const activeTab = ref('hot')
const popularPosts = ref([])
const mostViewedPosts = ref([])
const rankingLoading = ref(true)

async function fetchPosts(page = 0) {
  const pageData = await boardApi.getPosts(page, 10)
  posts.value = pageData.content
  totalPages.value = pageData.totalPages
  currentPage.value = page
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

      <div class="flex justify-end mb-4">
        <RouterLink
          to="/board/write"
          class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors duration-200"
        >
          <PencilSquareIcon class="w-4 h-4" />
          글쓰기
        </RouterLink>
      </div>

      <ul v-if="posts.length > 0" class="flex flex-col divide-y divide-border">
        <li v-for="post in posts" :key="post.id">
          <BoardPostCard :post="post" />
        </li>
      </ul>

      <p v-else class="text-center text-text-sub py-16">아직 게시글이 없습니다.</p>

      <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8 mb-4">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="fetchPosts(page - 1)"
          :class="
            currentPage === page - 1
              ? 'bg-primary text-white'
              : 'border border-border text-text-main hover:bg-primary/10'
          "
          class="w-10 h-10 rounded-xl font-semibold text-sm transition-colors duration-200"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>
