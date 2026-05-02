<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChatBubbleOvalLeftIcon, TrashIcon, PencilSquareIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const postId = Number(route.params.id)

const posts = [
  {
    id: 1,
    title: '강남 스터디카페 추천해주세요',
    content: '부트캠프 끝나고 개인 공부할 공간 찾고 있는데 혹시 주변에 좋은 곳 있으면 알려주세요!\n강남역 근처면 더 좋고, 24시간이면 최고입니다. 가격도 알려주시면 감사해요.',
    createdAt: '2분 전',
    isOwner: false,
    comments: [
      { id: 1, content: '토즈 강남점 괜찮아요! 자리도 넓고 쾌적합니다.', createdAt: '1분 전' },
      { id: 2, content: '스터디카페 메가 추천드려요. 월정액도 있어요.', createdAt: '방금 전' },
    ],
  },
  {
    id: 2,
    title: '오늘 실습 과제 너무 어렵지 않나요?',
    content: 'Vue 라우터 과제인데 도대체 뭘 잘못한 건지 에러가 안 잡혀요... 다들 어떻게 했어요?\n특히 동적 라우팅 부분에서 계속 막히는데 힌트라도 주시면 감사합니다.',
    createdAt: '15분 전',
    isOwner: true,
    comments: [
      { id: 1, content: 'router/index.js에서 :id 파라미터 설정 확인해보세요!', createdAt: '10분 전' },
      { id: 2, content: 'useRoute() 훅으로 params 꺼내면 돼요.', createdAt: '8분 전' },
      { id: 3, content: '저도 같은 문제였는데 import 경로가 잘못됐더라고요.', createdAt: '5분 전' },
    ],
  },
  {
    id: 3,
    title: '점심 같이 먹을 사람!',
    content: '1시쯤 강남역 근처에서 밥 먹을 분 구해요. 아무거나 다 좋아요.\n혼밥하기 싫어서요 ㅎㅎ 댓글 달아주시면 카톡 드릴게요!',
    createdAt: '32분 전',
    isOwner: false,
    comments: [
      { id: 1, content: '저요저요!', createdAt: '25분 전' },
    ],
  },
  {
    id: 4,
    title: 'MacBook 파우치 잃어버리신 분 있나요?',
    content: '3층 강의실에서 회색 파우치 발견했습니다. 관리자실에 맡겨뒀어요.\n안에 충전기도 같이 있었어요. 주인분 찾아가세요!',
    createdAt: '1시간 전',
    isOwner: false,
    comments: [],
  },
  {
    id: 5,
    title: '개발자 취업 어떻게 준비하셨나요?',
    content: '포트폴리오랑 알고리즘 중에 뭘 더 집중해야 할지 모르겠어요. 경험 공유해주세요!\n현재 부트캠프 수료 예정이고 비전공자입니다.',
    createdAt: '2시간 전',
    isOwner: false,
    comments: [
      { id: 1, content: '포트폴리오 먼저요. 알고리즘은 코딩테스트 있을 때 준비해도 돼요.', createdAt: '1시간 전' },
      { id: 2, content: '비전공자면 프로젝트 퀄리티가 제일 중요합니다.', createdAt: '50분 전' },
    ],
  },
  {
    id: 6,
    title: '스터디 구인합니다 (알고리즘)',
    content: '매주 토요일 오전에 백준 문제 같이 풀 분 구해요. 실버 이상이면 좋겠지만 상관없습니다.\n온/오프라인 모두 가능하고 카카오톡 오픈채팅으로 연락주세요.',
    createdAt: '3시간 전',
    isOwner: true,
    comments: [
      { id: 1, content: '참여하고 싶어요! 오픈채팅 링크 올려주세요.', createdAt: '2시간 전' },
    ],
  },
  {
    id: 7,
    title: '커피 한 잔 할 사람?',
    content: '오후 3시에 건물 1층 카페에서 쉬는 분 있으면 같이 커피 마셔요.\n아메리카노 한 잔 하면서 수다 떨고 싶어요 ☕',
    createdAt: '4시간 전',
    isOwner: false,
    comments: [],
  },
  {
    id: 8,
    title: 'Git 브랜치 전략 이해가 안 가요',
    content: 'main이랑 develop 나누는 이유가 뭔지 이해가 잘 안 돼요. 아시는 분 설명해 주시면 감사합니다.\n검색해봤는데 설명이 너무 어렵게 되어있어서요...',
    createdAt: '5시간 전',
    isOwner: false,
    comments: [
      { id: 1, content: 'main은 배포용, develop은 개발 통합용으로 보시면 돼요!', createdAt: '4시간 전' },
      { id: 2, content: 'feature 브랜치에서 작업하고 develop에 PR 날리는 흐름이에요.', createdAt: '3시간 전' },
    ],
  },
]

const post = computed(() => posts.find((p) => p.id === postId))

const comments = ref(post.value ? [...post.value.comments] : [])
const newComment = ref('')

const submitComment = () => {
  if (!newComment.value.trim()) return
  comments.value.push({
    id: comments.value.length + 1,
    content: newComment.value.trim(),
    createdAt: '방금 전',
  })
  newComment.value = ''
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

    <div v-if="post">
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
              class="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg transition-colors"
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
        <p class="text-base font-bold text-text-main mb-4 flex items-center gap-2">
          <ChatBubbleOvalLeftIcon class="w-5 h-5" />
          댓글 {{ comments.length }}
        </p>

        <ul class="flex flex-col divide-y divide-border mb-6">
          <li v-if="comments.length === 0" class="py-8 text-center text-sm text-text-sub">
            첫 번째 댓글을 남겨보세요
          </li>
          <li v-for="comment in comments" :key="comment.id" class="py-4">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-xs font-medium text-primary">익명</span>
              <span class="text-xs text-text-sub">{{ comment.createdAt }}</span>
            </div>
            <p class="text-sm text-text-main leading-relaxed">{{ comment.content }}</p>
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
            class="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors duration-200 shrink-0"
          >
            등록
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-24 text-text-sub">
      게시글을 찾을 수 없습니다.
    </div>
  </div>
</template>
