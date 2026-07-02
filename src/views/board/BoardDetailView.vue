<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TrashIcon, PencilSquareIcon, ArrowLeftIcon, HandThumbUpIcon, FlagIcon, EyeIcon } from '@heroicons/vue/24/outline'
import { HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/vue/24/solid'
import BoardCommentSection from '@/components/board/BoardCommentSection.vue'
import ImageViewerModal from '@/components/common/ImageViewerModal.vue'
import BoardReportModal from '@/components/board/BoardReportModal.vue'
import AuthRequiredModal from '@/components/common/AuthRequiredModal.vue'
import { boardApi } from '@/api/boardApi'
import { useApiRequest } from '@/composables/useApiRequest'
import { useAuthRequiredModal } from '@/composables/useAuthRequiredModal'
import { useToastStore } from '@/stores/toast'
import { formatDate } from '@/utils/formatDate'

const route = useRoute()
const router = useRouter()
const {
  authRequiredModalOpen,
  authRequiredModalMode,
  confirmAuthRequired,
  requireVerified,
} = useAuthRequiredModal()

const postId = Number(route.params.id)
const post = ref(null)
const loading = ref(true)

const postLiked = ref(false)
const postLikeCount = ref(0)
const isLiking = ref(false)

const { isLoading: isDeleting, error: deleteError, request } = useApiRequest()
const toast = useToastStore()

const showPostReportModal = ref(false)
const postReportModalRef = ref(null)
const isReporting = ref(false)

const showImageViewer = ref(false)
const selectedImageIndex = ref(0)

const openImageViewer = (index) => {
  selectedImageIndex.value = index
  showImageViewer.value = true
}

const submitPostReport = async (reason) => {
  if (!requireVerified()) return
  if (isReporting.value) return
  isReporting.value = true
  try {
    await boardApi.reportPost(postId, reason)
    showPostReportModal.value = false
    toast.show('신고가 접수되었습니다.')
  } catch (e) {
    if (e.response?.status === 409) {
      postReportModalRef.value?.setError('이미 신고한 게시글입니다.')
    } else {
      postReportModalRef.value?.setError('신고 접수에 실패했습니다. 다시 시도해주세요.')
    }
  } finally {
    isReporting.value = false
  }
}

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
  if (!requireVerified()) return
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
  <div class="bg-paper-dots min-h-screen">
    <div class="max-w-4xl mx-auto px-6 py-8">
      <button
        @click="router.push(route.query.from === 'mypage' ? '/mypage' : route.query.from ? `/board?mode=${route.query.from}` : '/board')"
        class="flex items-center gap-1.5 text-sm text-[#8c7e6e] hover:text-ink mb-6 transition-colors cursor-pointer font-medium group"
      >
        <ArrowLeftIcon class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        목록으로
      </button>

      <div v-if="loading" class="text-center py-20 text-sm text-[#8c7e6e]">불러오는 중...</div>

      <template v-else-if="post">
        <!-- 게시글 카드 -->
        <div class="bg-white border-2 border-ink rounded-2xl shadow-[4px_4px_0_#1c1712] overflow-hidden mb-6">
          <div class="h-1.5 bg-[#ffe066]" />
          <div class="p-6">
            <div class="flex items-start justify-between gap-4 mb-4">
              <h1 class="font-sans font-bold text-2xl text-ink leading-snug">{{ post.title }}</h1>
              <div v-if="post.isOwner" class="flex items-center gap-2 shrink-0">
                <RouterLink
                  :to="`/board/${post.id}/edit`"
                  class="flex items-center gap-1 text-xs text-[#8c7e6e] hover:text-ink border-2 border-[#c8bca8] hover:border-ink px-2.5 py-1.5 rounded-lg transition-all font-bold"
                >
                  <PencilSquareIcon class="w-3.5 h-3.5" />
                  수정
                </RouterLink>
                <button
                  @click="deletePost"
                  :disabled="isDeleting"
                  class="flex items-center gap-1 text-xs text-red-500 hover:text-white hover:bg-red-400 border-2 border-red-300 hover:border-red-400 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50 font-bold"
                >
                  <TrashIcon class="w-3.5 h-3.5" />
                  {{ isDeleting ? '삭제 중' : '삭제' }}
                </button>
              </div>
            </div>
            <p v-if="deleteError" class="text-sm text-red-400 mb-3">{{ deleteError }}</p>
            <div class="flex items-center gap-3 text-xs text-[#8c7e6e] mb-6 flex-wrap">
              <span
                v-if="post.category"
                class="font-bold text-xs px-2 py-0.5 rounded-full border"
                :class="{
                  'text-[#2d5a48] bg-[#96d4b4]/30 border-[#96d4b4]/50': post.category === '자유게시판',
                  'text-orange-600 bg-orange-50 border-orange-200': post.category === '공지',
                  'text-blue-600 bg-blue-50 border-blue-200': post.category === '전공',
                  'text-purple-600 bg-purple-50 border-purple-200': post.category === '비전공',
                  'text-red-600 bg-red-50 border-red-200': post.category === '취업',
                }"
              >{{ post.category }}</span>
              <span class="font-bold text-[#2d5a48] bg-[#96d4b4]/30 px-2 py-0.5 rounded-full">{{ post.displayName }}</span>
                <span>{{ formatDate(post.createdAt) }}</span>
                <span class="inline-flex items-center gap-1">
                  <EyeIcon class="w-3.5 h-3.5 shrink-0" />
                  <span>{{ post.viewCount }}</span>
                </span>
            </div>
            <p class="text-base text-ink leading-relaxed whitespace-pre-line">{{ post.content }}</p>

            <div
              v-if="post.images?.length > 0"
              class="mt-5 grid gap-2"
              :class="post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'"
            >
              <button
                v-for="(img, index) in post.images"
                :key="img.id"
                type="button"
                class="group overflow-hidden rounded-xl border-2 border-[#c8bca8] bg-white aspect-[4/3] cursor-zoom-in"
                aria-label="이미지 크게 보기"
                @click="openImageViewer(index)"
              >
                <img
                  :src="img.imageUrl"
                  class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  draggable="false"
                />
              </button>
            </div>

            <div class="flex items-center justify-between mt-6 pt-4 border-t-2 border-dashed border-[#e8e0d4]">
              <button
                @click="togglePostLike"
                :disabled="isLiking"
                class="flex items-center gap-1.5 text-sm font-bold transition-all cursor-pointer disabled:opacity-50 px-4 py-2 rounded-xl border-2"
                :class="postLiked
                  ? 'text-[#2d5a48] border-[#96d4b4] bg-[#96d4b4]/25 hover:bg-[#96d4b4]/35'
                  : 'text-[#8c7e6e] border-[#c8bca8] hover:border-[#96d4b4] hover:text-[#2d5a48] hover:bg-[#96d4b4]/15'"
              >
                <component :is="postLiked ? HandThumbUpSolidIcon : HandThumbUpIcon" class="w-5 h-5" />
                <span>{{ postLikeCount }}</span>
              </button>
              <button
                v-if="!post.isOwner"
                @click="openPostReport"
                class="flex items-center gap-1 text-xs text-[#8c7e6e] hover:text-red-400 border border-[#e8e0d4] hover:border-red-200 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-medium"
              >
                <FlagIcon class="w-3.5 h-3.5" />
                신고
              </button>
            </div>
          </div>
        </div>

        <!-- 댓글 섹션 -->
        <BoardCommentSection :post-id="postId" />
      </template>
    </div>
  </div>

  <BoardReportModal
    v-if="showPostReportModal"
    ref="postReportModalRef"
    target="post"
    @submit="submitPostReport"
    @close="showPostReportModal = false"
  />
  <ImageViewerModal
    v-if="showImageViewer"
    :images="post?.images ?? []"
    :initial-index="selectedImageIndex"
    @close="showImageViewer = false"
  />
</template>
