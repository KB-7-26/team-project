<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TrashIcon, PencilSquareIcon, ArrowLeftIcon, HeartIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import BoardCommentSection from '@/components/board/BoardCommentSection.vue'
import { boardApi } from '@/api/boardApi'
import { useApiRequest } from '@/composables/useApiRequest'
import { useToastStore } from '@/stores/toast'
import { formatDate } from '@/utils/formatDate'

const route = useRoute()
const router = useRouter()

const postId = Number(route.params.id)
const post = ref(null)
const loading = ref(true)

const postLiked = ref(false)
const postLikeCount = ref(0)
const isLiking = ref(false)

const { isLoading: isDeleting, error: deleteError, request } = useApiRequest()
const toast = useToastStore()

onMounted(async () => {
  try {
    post.value = await boardApi.getPostById(postId)
    postLiked.value = post.value.liked ?? false
    postLikeCount.value = post.value.likeCount ?? 0
  } catch (e) {
    if (e.response?.status === 404) {
      router.replace('/board')
    }
  } finally {
    loading.value = false
  }
})

const togglePostLike = async () => {
  if (isLiking.value) return
  isLiking.value = true
  try {
    const data = await boardApi.togglePostLike(postId)
    postLiked.value = data.liked
    postLikeCount.value = data.likeCount
  } finally {
    isLiking.value = false
  }
}

const deletePost = async () => {
  if (isDeleting.value) return
  if (!confirm('게시글을 삭제하시겠습니까?')) return

  const { ok } = await request(
    () => boardApi.deletePost(postId),
    {
      errorMessage: '게시글 삭제에 실패했습니다. 다시 시도해주세요.',
      on403: () => { deleteError.value = '게시글 삭제 권한이 없습니다.' },
    },
  )
  if (ok) {
    toast.show('게시글이 삭제되었습니다.')
    router.replace('/board')
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <button
      @click="router.push('/board')"
      class="flex items-center gap-1.5 text-sm text-text-sub hover:text-text-main mb-6 transition-colors cursor-pointer"
    >
      <ArrowLeftIcon class="w-4 h-4" />
      목록으로
    </button>

    <div v-if="loading" class="text-center py-20 text-sm text-text-sub">불러오는 중...</div>

    <template v-else-if="post">
      <!-- 게시글 -->
      <div class="border border-border rounded-2xl p-6 mb-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <h1 class="text-2xl font-extrabold text-text-main leading-snug">{{ post.title }}</h1>
          <div v-if="post.isOwner" class="flex items-center gap-2 shrink-0">
            <RouterLink
              :to="`/board/${post.id}/edit`"
              class="flex items-center gap-1 text-xs text-text-sub hover:text-text-main border border-border px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <PencilSquareIcon class="w-3.5 h-3.5" />
              수정
            </RouterLink>
            <button
              @click="deletePost"
              :disabled="isDeleting"
              class="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon class="w-3.5 h-3.5" />
              {{ isDeleting ? '삭제 중' : '삭제' }}
            </button>
          </div>
        </div>
        <p v-if="deleteError" class="text-sm text-red-400 mb-3">{{ deleteError }}</p>
        <div class="flex items-center gap-3 text-xs text-text-sub mb-6">
          <span class="font-medium text-primary">{{ post.displayName }}</span>
          <span>{{ formatDate(post.createdAt) }}</span>
          <span>조회 {{ post.viewCount }}</span>
        </div>
        <p class="text-base text-text-main leading-relaxed whitespace-pre-line">{{ post.content }}</p>
        <div class="flex items-center mt-5 pt-4 border-t border-border">
          <button
            @click="togglePostLike"
            :disabled="isLiking"
            class="flex items-center gap-1.5 text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :class="postLiked ? 'text-red-400 hover:text-red-500' : 'text-text-sub hover:text-red-400'"
          >
            <component :is="postLiked ? HeartSolidIcon : HeartIcon" class="w-5 h-5" />
            <span class="font-medium">{{ postLikeCount }}</span>
          </button>
        </div>
      </div>

      <!-- 댓글 섹션 -->
      <BoardCommentSection :post-id="postId" />
    </template>
  </div>
</template>
