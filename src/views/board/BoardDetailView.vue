<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TrashIcon, PencilSquareIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'
import BoardCommentItem from '@/components/board/BoardCommentItem.vue'

const route = useRoute()
const router = useRouter()

const post = {
  id: Number(route.params.id),
  title: '오늘 실습 과제 너무 어렵지 않나요?',
  content: 'Vue 라우터 과제인데 도대체 뭘 잘못한 건지 에러가 안 잡혀요... 다들 어떻게 했어요?\n특히 동적 라우팅 부분에서 계속 막히는데 힌트라도 주시면 감사합니다.',
  createdAt: '15분 전',
  isOwner: true,
}

const comments = ref([
  {
    id: 1,
    content: 'router/index.js에서 :id 파라미터 설정 확인해보세요!',
    createdAt: '10분 전',
    replies: [
      { id: 1, content: '저도 같은 문제였어요. 감사합니다!', createdAt: '8분 전' },
    ],
  },
  {
    id: 2,
    content: 'useRoute() 훅으로 params 꺼내면 돼요.',
    createdAt: '8분 전',
    replies: [],
  },
  {
    id: 3,
    content: '저도 같은 문제였는데 import 경로가 잘못됐더라고요.',
    createdAt: '5분 전',
    replies: [],
  },
])

const newComment = ref('')
const replyingToId = ref(null)
const newReply = ref('')

const submitComment = () => {
  if (!newComment.value.trim()) return
  comments.value.push({
    id: comments.value.length + 1,
    content: newComment.value.trim(),
    createdAt: '방금 전',
    replies: [],
  })
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

const submitReply = (commentId) => {
  if (!newReply.value.trim()) return
  const comment = comments.value.find((c) => c.id === commentId)
  if (!comment) return
  comment.replies.push({
    id: comment.replies.length + 1,
    content: newReply.value.trim(),
    createdAt: '방금 전',
  })
  newReply.value = ''
  replyingToId.value = null
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <button
      @click="router.back()"
      class="flex items-center gap-1.5 text-sm text-text-sub hover:text-text-main mb-6 transition-colors cursor-pointer"
    >
      <ArrowLeftIcon class="w-4 h-4" />
      목록으로
    </button>

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
            class="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <TrashIcon class="w-3.5 h-3.5" />
            삭제
          </button>
        </div>
      </div>
      <div class="flex items-center gap-3 text-xs text-text-sub mb-6">
        <span class="font-medium text-primary">익명</span>
        <span>{{ post.createdAt }}</span>
      </div>
      <p class="text-base text-text-main leading-relaxed whitespace-pre-line">{{ post.content }}</p>
    </div>

    <!-- 댓글 목록 -->
    <div class="border border-border rounded-2xl p-6">
      <p class="text-base font-bold text-text-main mb-4">댓글 {{ comments.length }}</p>

      <ul class="flex flex-col divide-y divide-border mb-6">
        <li v-if="comments.length === 0" class="py-8 text-center text-sm text-text-sub">
          첫 번째 댓글을 남겨보세요
        </li>
        <li v-for="comment in comments" :key="comment.id">
          <!-- 댓글 -->
          <BoardCommentItem :comment="comment" @reply-click="toggleReplyInput" />

          <!-- 대댓글 목록 -->
          <ul v-if="comment.replies.length > 0">
            <li v-for="reply in comment.replies" :key="reply.id">
              <BoardCommentItem :comment="reply" :is-reply="true" />
            </li>
          </ul>

          <!-- 인라인 대댓글 입력창 -->
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

      <!-- 댓글 입력 -->
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
  </div>
</template>
