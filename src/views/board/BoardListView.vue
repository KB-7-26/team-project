<script setup>
import { ref, onMounted } from 'vue'
import { PencilSquareIcon } from '@heroicons/vue/24/outline'
import BoardPostCard from '@/components/board/BoardPostCard.vue'
import { boardApi } from '@/api/boardApi'

const posts = ref([])
const currentPage = ref(0)
const totalPages = ref(0)

async function fetchPosts(page = 0) {
  const res = await boardApi.getPosts(page, 10)
  posts.value = res.data.content
  totalPages.value = res.data.totalPages
  currentPage.value = page
}

onMounted(() => fetchPosts(0))
</script>

<template>
  <div>
    <div class="bg-primary/10 px-6 py-12">
      <p class="text-4xl font-extrabold text-text-main pb-3">익명 게시판</p>
      <p class="text-base text-text-sub pt-3">자유롭게 이야기를 나눠보세요</p>
    </div>

    <div class="max-w-4xl mx-auto px-6 py-8">
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