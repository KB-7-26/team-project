<script setup>
import { ref } from 'vue'
import { ChatBubbleOvalLeftIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'

const posts = [
  {
    id: 1,
    title: '강남 스터디카페 추천해주세요',
    preview: '부트캠프 끝나고 개인 공부할 공간 찾고 있는데 혹시 주변에 좋은 곳 있으면 알려주세요!',
    comments: 8,
    createdAt: '2분 전',
  },
  {
    id: 2,
    title: '오늘 실습 과제 너무 어렵지 않나요?',
    preview: 'Vue 라우터 과제인데 도대체 뭘 잘못한 건지 에러가 안 잡혀요... 다들 어떻게 했어요?',
    comments: 14,
    createdAt: '15분 전',
  },
  {
    id: 3,
    title: '점심 같이 먹을 사람!',
    preview: '1시쯤 강남역 근처에서 밥 먹을 분 구해요. 아무거나 다 좋아요.',
    comments: 5,
    createdAt: '32분 전',
  },
  {
    id: 4,
    title: 'MacBook 파우치 잃어버리신 분 있나요?',
    preview: '3층 강의실에서 회색 파우치 발견했습니다. 관리자실에 맡겨뒀어요.',
    comments: 2,
    createdAt: '1시간 전',
  },
  {
    id: 5,
    title: '개발자 취업 어떻게 준비하셨나요?',
    preview: '포트폴리오랑 알고리즘 중에 뭘 더 집중해야 할지 모르겠어요. 경험 공유해주세요!',
    comments: 21,
    createdAt: '2시간 전',
  },
  {
    id: 6,
    title: '스터디 구인합니다 (알고리즘)',
    preview: '매주 토요일 오전에 백준 문제 같이 풀 분 구해요. 실버 이상이면 좋겠지만 상관없습니다.',
    comments: 7,
    createdAt: '3시간 전',
  },
  {
    id: 7,
    title: '커피 한 잔 할 사람?',
    preview: '오후 3시에 건물 1층 카페에서 쉬는 분 있으면 같이 커피 마셔요.',
    comments: 3,
    createdAt: '4시간 전',
  },
  {
    id: 8,
    title: 'Git 브랜치 전략 이해가 안 가요',
    preview: 'main이랑 develop 나누는 이유가 뭔지 이해가 잘 안 돼요. 아시는 분 설명해 주시면 감사합니다.',
    comments: 11,
    createdAt: '5시간 전',
  },
]

const currentPage = ref(1)
const totalPages = 3
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

      <ul class="flex flex-col divide-y divide-border">
        <li v-for="post in posts" :key="post.id">
          <RouterLink
            :to="`/board/${post.id}`"
            class="flex flex-col gap-1.5 py-5 px-2 hover:bg-primary/5 rounded-xl transition-colors duration-150 cursor-pointer"
          >
            <p class="text-base font-bold text-text-main line-clamp-1">{{ post.title }}</p>
            <p class="text-sm text-text-sub line-clamp-1">{{ post.preview }}</p>
            <div class="flex items-center gap-3 text-xs text-text-sub mt-1">
              <span class="font-medium text-primary">익명</span>
              <span>{{ post.createdAt }}</span>
              <span class="flex items-center gap-1 ml-auto">
                <ChatBubbleOvalLeftIcon class="w-3.5 h-3.5" />
                {{ post.comments }}
              </span>
            </div>
          </RouterLink>
        </li>
      </ul>

      <div class="flex justify-center items-center gap-2 mt-8 mb-4">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="currentPage = page"
          :class="
            currentPage === page
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
