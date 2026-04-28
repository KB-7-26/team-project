<script setup>
import { ShoppingBagIcon, ChatBubbleLeftRightIcon, ChatBubbleOvalLeftIcon, UserIcon } from '@heroicons/vue/24/outline'

const categories = [
  { icon: ShoppingBagIcon, title: '중고거래', desc: '안전한 학생 간 거래' },
  { icon: ChatBubbleLeftRightIcon, title: '익명게시판', desc: '자유로운 소통 공간' },
  { icon: ChatBubbleOvalLeftIcon, title: '채팅목록', desc: '실시간 대화' },
  { icon: UserIcon, title: '마이페이지', desc: '내 정보 관리' },
]

const products = [
  { category: '전자기기', name: 'MacBook Pro 2023', price: 1200000, emoji: '💻' },
  { category: '전자기기', name: 'LG 모니터 27인치', price: 180000, emoji: '🖥️' },
  { category: '도서', name: '자바의 정석', price: 15000, emoji: '📚' },
  { category: '전자기기', name: '기계식 키보드', price: 120000, emoji: '⌨️' },
]
</script>

<template>
  <div>
    <div class="bg-hero-gradient py-30 text-center">
      <div class="max-w-4xl mx-auto px-6 flex flex-col items-center">
        <h2 class="text-5xl font-extrabold text-text-main mb-6">안전한 캠퍼스 중고거래</h2>
        <p class="text-base font-normal text-[#555] mb-10">학생 인증으로 더 믿을 수 있는 거래 환경을 만들어요</p>
        <div class="w-full">
          <input
            type="text"
            placeholder="물품이나 게시글을 검색해보세요"
            class="w-full px-6 py-4 rounded-2xl bg-white/80 outline-none shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
          />
        </div>
        <div class="mt-6 flex items-center justify-center gap-3">
          <span class="text-sm text-text-main">인기 검색어:</span>
          <ul class="flex gap-2 list-none">
            <li class="px-4 py-2 bg-white rounded-full text-sm font-medium cursor-pointer hover:bg-white/90 shadow-sm">
              노트북
            </li>
            <li class="px-4 py-2 bg-white rounded-full text-sm font-medium cursor-pointer hover:bg-white/90 shadow-sm">
              모니터
            </li>
            <li class="px-4 py-2 bg-white rounded-full text-sm font-medium cursor-pointer hover:bg-white/90 shadow-sm">
              키보드
            </li>
            <li class="px-4 py-2 bg-white rounded-full text-sm font-medium cursor-pointer hover:bg-white/90 shadow-sm">
              마우스
            </li>
            <li class="px-4 py-2 bg-white rounded-full text-sm font-medium cursor-pointer hover:bg-white/90 shadow-sm">
              도서
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="category py-12 bg-white">
      <div class="category-container grid grid-cols-4 gap-6 max-w-5xl mx-auto px-6">
        <div
          class="category-card rounded-2xl flex p-8 flex-col gap-4 border border-border shadow-sm hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] transition-all cursor-pointer hover:-translate-y-2"
          v-for="item in categories"
          :key="item.title"
        >
          <div class="w-14 h-14 bg-[#ff9102] rounded-2xl flex items-center justify-center">
            <component :is="item.icon" class="w-7 h-7 text-white" />
          </div>
          <p class="text-xl font-bold text-text-main">{{ item.title }}</p>
          <p class="text-sm text-text-sub">{{ item.desc }}</p>
        </div>
      </div>
    </div>

    <div class="py-16 bg-white">
      <div class="max-w-5xl mx-auto px-6">
        <div class="flex items-end justify-between mb-8">
          <div>
            <h2 class="text-2xl font-extrabold text-text-main">인기 상품</h2>
            <p class="text-sm text-text-sub mt-1">지금 가장 인기있는 거래 상품을 확인하세요</p>
          </div>
          <a href="#" class="text-sm font-medium text-primary hover:text-primary-hover transition-colors">전체보기 →</a>
        </div>

        <div class="grid grid-cols-4 gap-5">
          <div
            v-for="product in products"
            :key="product.name"
            class="border border-border rounded-2xl overflow-hidden hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] transition-all cursor-pointer hover:-translate-y-2"
          >
            <div class="bg-amber-50 h-44 flex items-center justify-center text-6xl">
              {{ product.emoji }}
            </div>
            <div class="p-4 flex flex-col gap-1">
              <span class="text-xs font-medium text-primary">{{ product.category }}</span>
              <p class="text-base font-bold text-text-main">{{ product.name }}</p>
              <p class="text-lg font-extrabold text-text-main">{{ product.price.toLocaleString() }}원</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
