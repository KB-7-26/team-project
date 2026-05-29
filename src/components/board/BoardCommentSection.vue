<script setup>
import { ref, onMounted } from 'vue'
import BoardCommentItem from '@/components/board/BoardCommentItem.vue'
import { boardApi } from '@/api/boardApi'

const props = defineProps({
  postId: {
    type: Number,
    required: true,
  },
})

const comments = ref([])
const newComment = ref('')
const replyingToId = ref(null)
const newReply = ref('')

onMounted(async () => {
  comments.value = await boardApi.getComments(props.postId)
})

const submitComment = async () => {
  if (!newComment.value.trim()) return
  const created = await boardApi.createComment(props.postId, newComment.value.trim())
  comments.value.push({ ...created, replies: [] })
  newComment.value = ''
}

const toggleReplyInput = (comment) => {
  if (replyingToId.value === comment.id) {
    replyingToId.value = null
    newReply.value = ''
  } else {
    replyingToId.value = comment.id
    newReply.value = ''
  }
}

const submitReply = async (parentCommentId) => {
  if (!newReply.value.trim()) return
  const created = await boardApi.createComment(props.postId, newReply.value.trim(), parentCommentId)
  const parent = comments.value.find((c) => c.id === parentCommentId)
  if (parent) parent.replies.push(created)
  newReply.value = ''
  replyingToId.value = null
}

const updateComment = async (commentId, content) => {
  const updated = await boardApi.updateComment(props.postId, commentId, content)
  const comment = comments.value.find((c) => c.id === commentId)
  if (comment) {
    comment.content = updated.content
    return
  }
  for (const c of comments.value) {
    const reply = c.replies?.find((r) => r.id === commentId)
    if (reply) {
      reply.content = updated.content
      return
    }
  }
}

const deleteComment = async (commentId) => {
  if (!confirm('댓글을 삭제하시겠습니까?')) return
  await boardApi.deleteComment(props.postId, commentId)
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
  <div class="border border-border rounded-2xl p-6">
    <p class="text-base font-bold text-text-main mb-4">댓글 {{ comments.length }}</p>

    <ul class="flex flex-col divide-y divide-border mb-6">
      <li v-if="comments.length === 0" class="py-8 text-center text-sm text-text-sub">
        첫 번째 댓글을 남겨보세요
      </li>
      <li v-for="comment in comments" :key="comment.id">
        <BoardCommentItem
          :comment="comment"
          @reply-click="toggleReplyInput"
          @update="updateComment"
          @delete="deleteComment"
        />

        <ul v-if="comment.replies?.length > 0">
          <li v-for="reply in comment.replies" :key="reply.id">
            <BoardCommentItem
              :comment="reply"
              :is-reply="true"
              @update="updateComment"
              @delete="deleteComment"
            />
          </li>
        </ul>

        <div v-if="replyingToId === comment.id" class="ml-6 pl-4 border-l-2 border-primary/30 py-3">
          <div class="flex gap-2">
            <input
              v-model="newReply"
              @keyup.enter="submitReply(comment.id)"
              type="text"
              placeholder="답글을 입력하세요"
              class="flex-1 px-4 py-2 border border-border rounded-xl text-sm text-text-main outline-none focus:border-primary transition-colors"
              autofocus
            />
            <button
              @click="submitReply(comment.id)"
              class="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              등록
            </button>
            <button
              @click="toggleReplyInput(comment)"
              class="text-sm text-text-sub hover:text-text-main px-3 py-2 rounded-xl border border-border transition-colors cursor-pointer"
            >
              취소
            </button>
          </div>
        </div>
      </li>
    </ul>

    <div class="flex gap-2">
      <input
        v-model="newComment"
        @keyup.enter="submitComment"
        type="text"
        placeholder="댓글을 입력하세요"
        class="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-text-main outline-none focus:border-primary transition-colors"
      />
      <button
        @click="submitComment"
        class="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors duration-200 shrink-0 cursor-pointer"
      >
        등록
      </button>
    </div>
  </div>
</template>
