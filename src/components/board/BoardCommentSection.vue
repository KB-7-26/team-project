<script setup>
import { ref, computed, onMounted } from 'vue'
import { ChatBubbleLeftRightIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'
import BoardCommentItem from '@/components/board/BoardCommentItem.vue'
import BoardReportModal from '@/components/board/BoardReportModal.vue'
import AuthRequiredModal from '@/components/common/AuthRequiredModal.vue'
import { boardApi } from '@/api/boardApi'
import { useApiRequest } from '@/composables/useApiRequest'
import { useAuthRequiredModal } from '@/composables/useAuthRequiredModal'
import { useToastStore } from '@/stores/toast'

const props = defineProps({
  postId: {
    type: Number,
    required: true,
  },
})

const comments = ref([])
const totalCommentCount = computed(() =>
  comments.value.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0),
)
const newComment = ref('')
const replyingToId = ref(null)
const newReply = ref('')

const { isLoading: isSubmitting, error: submitError, request } = useApiRequest()
const { isLoading: isSubmittingReply, request: requestReply } = useApiRequest()
const toast = useToastStore()
const {
  authRequiredModalOpen,
  authRequiredModalMode,
  confirmAuthRequired,
  requireVerified,
} = useAuthRequiredModal()

const commentLikes = ref({})

const initCommentLikes = (list) => {
  list.forEach((c) => {
    commentLikes.value[c.id] = { liked: c.liked ?? false, likeCount: c.likeCount ?? 0 }
    c.replies?.forEach((r) => {
      commentLikes.value[r.id] = { liked: r.liked ?? false, likeCount: r.likeCount ?? 0 }
    })
  })
}

onMounted(async () => {
  const { ok, data } = await request(
    () => boardApi.getComments(props.postId),
    { errorMessage: '댓글을 불러오지 못했습니다.' },
  )
  if (ok) {
    comments.value = data
    initCommentLikes(data)
  }
})

const submitComment = async () => {
  if (!requireVerified()) return
  if (!newComment.value.trim() || isSubmitting.value) return
  const { ok, data } = await request(
    () => boardApi.createComment(props.postId, newComment.value.trim()),
    { errorMessage: '댓글 등록에 실패했습니다. 다시 시도해주세요.' },
  )
  if (ok) {
    comments.value.push({ ...data, replies: [] })
    newComment.value = ''
    toast.show('댓글이 등록되었습니다.')
  }
}

const toggleReplyInput = (comment) => {
  if (!requireVerified()) return
  if (replyingToId.value === comment.id) {
    replyingToId.value = null
    newReply.value = ''
  } else {
    replyingToId.value = comment.id
    newReply.value = ''
  }
}

const submitReply = async (parentCommentId) => {
  if (!requireVerified()) return
  if (!newReply.value.trim() || isSubmittingReply.value) return
  const { ok, data } = await requestReply(
    () => boardApi.createComment(props.postId, newReply.value.trim(), parentCommentId),
    { errorMessage: '답글 등록에 실패했습니다. 다시 시도해주세요.' },
  )
  if (ok) {
    const parent = comments.value.find((c) => c.id === parentCommentId)
    if (parent) parent.replies.push(data)
    newReply.value = ''
    replyingToId.value = null
    toast.show('답글이 등록되었습니다.')
  }
}

const updateComment = async (commentId, content) => {
  if (!requireVerified()) return
  const { ok, data } = await request(
    () => boardApi.updateComment(props.postId, commentId, content),
    {
      errorMessage: '댓글 수정에 실패했습니다. 다시 시도해주세요.',
      on403: () => { submitError.value = '댓글 수정 권한이 없습니다.' },
    },
  )
  if (!ok) return
  toast.show('댓글이 수정되었습니다.')
  const comment = comments.value.find((c) => c.id === commentId)
  if (comment) {
    comment.content = data.content
    return
  }
  for (const c of comments.value) {
    const reply = c.replies?.find((r) => r.id === commentId)
    if (reply) {
      reply.content = data.content
      return
    }
  }
}

const toggleCommentLike = async (commentId) => {
  if (!requireVerified()) return
  try {
    const data = await boardApi.toggleCommentLike(props.postId, commentId)
    commentLikes.value[commentId] = { liked: data.liked, likeCount: data.likeCount }
  } catch {
    // 401은 axios 인터셉터가 /login으로 리다이렉트 처리
  }
}

const reportingCommentId = ref(null)
const commentReportModalRef = ref(null)
const isReportingComment = ref(false)

const openCommentReport = (commentId) => {
  if (!requireVerified()) return
  reportingCommentId.value = commentId
}

const submitCommentReport = async (reason) => {
  if (!requireVerified()) return
  if (isReportingComment.value) return
  isReportingComment.value = true
  try {
    await boardApi.reportComment(props.postId, reportingCommentId.value, reason)
    reportingCommentId.value = null
    toast.show('신고가 접수되었습니다.')
  } catch (e) {
    if (e.response?.status === 409) {
      commentReportModalRef.value?.setError('이미 신고한 댓글입니다.')
    } else {
      commentReportModalRef.value?.setError('신고 접수에 실패했습니다. 다시 시도해주세요.')
    }
  } finally {
    isReportingComment.value = false
  }
}

const deleteComment = async (commentId) => {
  if (!requireVerified()) return
  if (!confirm('댓글을 삭제하시겠습니까?')) return
  const { ok } = await request(
    () => boardApi.deleteComment(props.postId, commentId),
    {
      errorMessage: '댓글 삭제에 실패했습니다. 다시 시도해주세요.',
      on403: () => { submitError.value = '댓글 삭제 권한이 없습니다.' },
    },
  )
  if (!ok) return
  toast.show('댓글이 삭제되었습니다.')
  const idx = comments.value.findIndex((c) => c.id === commentId)
  if (idx !== -1) {
    comments.value.splice(idx, 1)
    return
  }
  for (const c of comments.value) {
    const replyIdx = c.replies?.findIndex((r) => r.id === commentId)
    if (replyIdx !== -1) {
      c.replies.splice(replyIdx, 1)
      return
    }
  }
}
</script>

<template>
  <div class="bg-white border-2 border-ink rounded-2xl shadow-[4px_4px_0_#1c1712] overflow-hidden">
    <div class="h-1.5 bg-[#f4b8c8]" />
    <div class="p-6">
      <p class="font-sans font-bold text-lg text-ink mb-5 flex items-center gap-2">
        <ChatBubbleLeftRightIcon class="w-5 h-5 text-[#2d5a48]" />
        댓글 {{ totalCommentCount }}
      </p>

      <ul class="flex flex-col divide-y-2 divide-dashed divide-[#e8e0d4] mb-6">
        <li v-if="comments.length === 0" class="py-8 text-center text-sm text-[#8c7e6e]">
          첫 번째 댓글을 남겨보세요
          <PencilSquareIcon class="inline-block w-4 h-4 align-[-3px]" />
        </li>
        <li v-for="comment in comments" :key="comment.id">
          <BoardCommentItem
            :comment="comment"
            :liked="commentLikes[comment.id]?.liked ?? false"
            :like-count="commentLikes[comment.id]?.likeCount ?? 0"
            @reply-click="toggleReplyInput"
            @update="updateComment"
            @delete="deleteComment"
            @like="toggleCommentLike"
            @report="openCommentReport"
          />

          <ul v-if="comment.replies?.length > 0">
            <li v-for="reply in comment.replies" :key="reply.id">
              <BoardCommentItem
                :comment="reply"
                :is-reply="true"
                :liked="commentLikes[reply.id]?.liked ?? false"
                :like-count="commentLikes[reply.id]?.likeCount ?? 0"
                @update="updateComment"
                @delete="deleteComment"
                @like="toggleCommentLike"
                @report="openCommentReport"
              />
            </li>
          </ul>

          <div v-if="replyingToId === comment.id" class="ml-6 pl-4 border-l-2 border-[#96d4b4] py-3">
            <div class="flex gap-2">
              <div class="flex-1 relative">
                <input
                  v-model="newReply"
                  @keyup.enter="submitReply(comment.id)"
                  type="text"
                  placeholder="답글을 입력하세요"
                  maxlength="500"
                  :disabled="isSubmittingReply"
                  class="w-full px-4 py-2 pr-16 border-2 border-[#c8bca8] focus:border-ink rounded-xl text-sm text-ink outline-none transition-colors placeholder:text-[#8c7e6e] disabled:opacity-50"
                  autofocus
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tabular-nums"
                  :class="newReply.length >= 480 ? 'text-red-400' : 'text-[#8c7e6e]'">
                  {{ newReply.length }}/500
                </span>
              </div>
              <button
                @click="submitReply(comment.id)"
                :disabled="isSubmittingReply || !newReply.trim()"
                class="bg-[#96d4b4] border-2 border-ink text-ink text-sm font-bold px-4 py-2 rounded-xl shadow-[2px_2px_0_#1c1712] hover:-translate-y-0.5 transition-all shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {{ isSubmittingReply ? '등록 중...' : '등록' }}
              </button>
              <button
                @click="toggleReplyInput(comment)"
                class="text-sm text-[#8c7e6e] hover:text-ink px-3 py-2 rounded-xl border-2 border-[#c8bca8] hover:border-ink transition-all cursor-pointer font-bold"
              >
                취소
              </button>
            </div>
          </div>
        </li>
      </ul>

      <p v-if="submitError" class="text-sm text-red-400 mb-3">{{ submitError }}</p>

      <div class="flex gap-2 pt-4 border-t-2 border-dashed border-[#e8e0d4]">
        <div class="flex-1 relative">
          <input
            v-model="newComment"
            @keyup.enter="submitComment"
            type="text"
            placeholder="댓글을 입력하세요"
            maxlength="500"
            :disabled="isSubmitting"
            class="w-full px-4 py-2.5 pr-16 border-2 border-[#c8bca8] focus:border-ink rounded-xl text-sm text-ink outline-none transition-colors placeholder:text-[#8c7e6e] disabled:opacity-50"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tabular-nums"
            :class="newComment.length >= 480 ? 'text-red-400' : 'text-[#8c7e6e]'">
            {{ newComment.length }}/500
          </span>
        </div>
        <button
          @click="submitComment"
          :disabled="isSubmitting || !newComment.trim()"
          class="bg-[#ffe066] border-2 border-ink text-ink text-sm font-bold px-5 py-2.5 rounded-xl shadow-[3px_3px_0_#1c1712] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1c1712] transition-all shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {{ isSubmitting ? '등록 중...' : '등록' }}
        </button>
      </div>
    </div>
  </div>

  <BoardReportModal
    v-if="reportingCommentId !== null"
    ref="commentReportModalRef"
    target="comment"
    @submit="submitCommentReport"
    @close="reportingCommentId = null"
  />

  <AuthRequiredModal
    v-model:open="authRequiredModalOpen"
    :mode="authRequiredModalMode"
    @confirm="confirmAuthRequired"
  />
</template>
