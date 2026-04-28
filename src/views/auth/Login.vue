<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ChatBubbleLeftRightIcon, CheckBadgeIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'

defineOptions({
  name: 'LoginView',
})

const userId = ref('')
const password = ref('')

// 특징 설명의 추가 및 수정은 여기서!
const features = [
  {
    icon: ShieldCheckIcon,
    title: '학생 인증 시스템',
    description: '검증된 학생들과만 안전하게 거래하세요',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: '실시간 채팅',
    description: '빠르고 편리한 소통으로 거래 완성',
  },
  {
    icon: CheckBadgeIcon,
    title: '익명 게시판',
    description: '자유로운 소통과 정보 공유 공간',
  },
]

const loginHandler = () => {
  // TODO: 추후 서버 연동 시 인증 요청 로직으로 교체합니다.
}
</script>

<template>
  <main class="min-h-screen bg-sub-bg lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <section class="bg-hero-gradient px-6 py-14 sm:px-10 lg:flex lg:min-h-screen lg:items-center lg:px-16 xl:px-24">
      <div class="mx-auto w-full max-w-2xl">
        <div class="max-w-xl">
          <h1 class="text-4xl font-extrabold leading-tight text-text-main sm:text-5xl lg:text-6xl">
            안전한 중고거래,<br />
            Swap과 함께
          </h1>
          <p class="mt-8 text-xl font-medium text-text-hover sm:text-2xl">학생 인증 기반 중고거래 플랫폼</p>
        </div>

        <ul class="mt-16 flex flex-col gap-8 sm:mt-20">
          <li v-for="feature in features" :key="feature.title" class="flex items-center gap-6">
            <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/90 sm:h-18 sm:w-18">
              <component :is="feature.icon" class="h-8 w-8 text-primary" />     <!-- 컴포넌트를 동적으로 바인딩 -->
            </div>
            <div>
              <h2 class="text-xl font-extrabold text-text-main sm:text-2xl">{{ feature.title }}</h2>
              <p class="mt-2 text-base font-medium text-text-hover sm:text-lg">{{ feature.description }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section class="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
      <div class="w-full max-w-xl rounded-[28px] bg-white px-7 py-10 shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:px-12 sm:py-14">
        <!-- 추후 아이콘 및 서비스명 확정되면 수정 필요! (로그인 페이지는 TopNavBar를 사용하지 않으므로 직접 지정할 필요가 있음) -->
        <RouterLink to="/" class="inline-flex items-center gap-4">
            <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-2xl font-extrabold text-white">
                K
            </div>
            <strong class="text-3xl font-extrabold text-text-main">KB Swap</strong>
        </RouterLink>

        <p class="mt-9 text-lg font-medium text-text-sub">로그인하여 계속하세요</p>

        <form class="mt-10 flex flex-col gap-7" @submit.prevent="loginHandler">
          <label class="block">
            <span class="text-lg font-extrabold text-text-main">아이디</span>
            <input
              v-model="userId"
              type="text"
              autocomplete="username"
              placeholder="아이디를 입력하세요"
              class="mt-4 h-17 w-full rounded-2xl border border-border bg-white px-6 text-lg font-medium text-text-main outline-none transition placeholder:text-text-sub focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </label>

          <label class="block">
            <span class="text-lg font-extrabold text-text-main">비밀번호</span>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="비밀번호를 입력하세요"
              class="mt-4 h-17 w-full rounded-2xl border border-border bg-white px-6 text-lg font-medium text-text-main outline-none transition placeholder:text-text-sub focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </label>

          <button
            type="submit"
            class="mt-6 h-17 rounded-2xl bg-primary text-xl font-extrabold text-white transition hover:bg-primary-hover active:bg-primary-active"
          >
            로그인
          </button>
        </form>

        <p class="mt-10 text-center text-base font-medium text-text-sub sm:text-lg">
          계정이 없으신가요?
          <!-- TODO: 회원가입 페이지 구현 후 라우터링크 to 설정 필요 -->
          <RouterLink to="#" class="ml-2 font-extrabold text-primary hover:text-primary-hover">회원가입</RouterLink>
        </p>

        <div class="mt-10 border-t border-border pt-9 text-center text-base font-medium text-text-sub">
          KB 인증 기반 안전 거래 서비스
        </div>
      </div>
    </section>
  </main>
</template>
