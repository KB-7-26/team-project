<script setup>
import { HeartIcon, ChatBubbleOvalLeftIcon, ClockIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { ref } from 'vue'

const likedIds = ref(new Set())

const toggleLike = (id) => {
  if (likedIds.value.has(id)) {
    likedIds.value.delete(id)
  } else {
    likedIds.value.add(id)
  }
  likedIds.value = new Set(likedIds.value)
}

const products = [
  { id: 1, title: '로지텍 무선 마우스', price: 45000, status: '판매중', image: '', likes: 6, comments: 2, views: 98 },
  {
    id: 2,
    title: '삼성 노트북 2020년형',
    price: 1300000,
    status: '판매중',
    image: '',
    likes: 12,
    comments: 5,
    views: 234,
  },
  {
    id: 3,
    title: 'LG 모니터 27인치 4K',
    price: 180000,
    status: '거래중',
    image: '',
    likes: 8,
    comments: 3,
    views: 187,
  },
  {
    id: 4,
    title: '애플 에어팟 프로 2세대',
    price: 45000,
    status: '판매중',
    image: '',
    likes: 23,
    comments: 7,
    views: 412,
  },
  {
    id: 5,
    title: '아이폰 14 프로 256GB',
    price: 18000,
    status: '거래완료',
    image: '',
    likes: 31,
    comments: 10,
    views: 560,
  },
  {
    id: 6,
    title: '로지텍 기계식 키보드',
    price: 79000,
    status: '판매중',
    image: '',
    likes: 15,
    comments: 4,
    views: 203,
  },
  {
    id: 7,
    title: '소니 노이즈캔슬링 헤드폰',
    price: 220000,
    status: '판매중',
    image: '',
    likes: 9,
    comments: 2,
    views: 145,
  },
  {
    id: 8,
    title: '애플 워치 SE 2세대',
    price: 120000,
    status: '거래중',
    image: '',
    likes: 17,
    comments: 6,
    views: 298,
  },
  {
    id: 9,
    title: 'MacBook Pro 2023 16인치',
    price: 680000,
    status: '판매중',
    image: '',
    likes: 42,
    comments: 13,
    views: 731,
  },
  {
    id: 10,
    title: '아이폰 15 Pro Max 256GB',
    price: 800000,
    status: '판매중',
    image: '',
    likes: 56,
    comments: 18,
    views: 924,
  },
]
</script>

<template>
  <div>
    <div class="bg-primary/10 px-6 py-12">
      <div>
        <p class="text-4xl font-extrabold text-text-main pb-3">중고 거래</p>
        <p class="text-base text-text-sub pt-3">학생들 간의 거래</p>
      </div>
    </div>
  </div>
  <div class="flex mx-auto items-start">
    <div class="side border border-red-400 w-64 shrink-0">
      <ul>
        <li>전체</li>
        <li>가구/인테리어</li>
        <li>생활/주방</li>
        <li>도서</li>
        <li>여성 의류</li>
        <li>남성 의류</li>
        <li>뷰티</li>
        <li>취미</li>
        <li>E-쿠폰</li>
        <li>가공식품</li>
        <li>식물</li>
        <li>기타 중고물품</li>
      </ul>
    </div>
    <div class="list flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
      <div
        v-for="product in products"
        :key="product.id"
        class="max-w-xl my-2 rounded-2xl border border-border overflow-hidden shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
      >
        <div class="relative overflow-hidden">
          <img
            alt="상품명"
            class="w-full h-48 object-cover bg-amber-500 transition-transform duration-300 group-hover:scale-105"
          />
          <span
            :class="{
              'bg-primary': product.status === '판매중',
              'bg-[#4CAF50]': product.status === '거래중',
              'bg-gray-400': product.status === '거래완료',
            }"
            class="absolute top-3 left-3 h-9 flex items-center text-white text-xs font-semibold rounded-full px-3 py-1.5"
            >{{ product.status }}
          </span>
          <button
            @click.stop="toggleLike(product.id)"
            class="absolute top-3 right-3 px-1.5 py-1.5 bg-white rounded-full flex items-center justify-center shadow transition-transform duration-200 hover:scale-125"
          >
            <HeartSolidIcon v-if="likedIds.has(product.id)" class="w-5 h-5 text-red-500" />
            <HeartIcon v-else class="w-5 h-5 text-red-500" />
          </button>
        </div>

        <div class="p-4 flex flex-col gap-2">
          <p class="text-lg font-bold text-text-main truncate">{{ product.title }}</p>
          <p class="text-xl font-extrabold text-text-main">{{ product.price.toLocaleString() }}</p>
          <div class="flex items-center gap-4 text-text-sub text-sm">
            <span class="flex items-center gap-1"> <HeartIcon class="w-4 h-4" /> {{ product.likes }} </span>
            <span class="flex items-center gap-1">
              <ChatBubbleOvalLeftIcon class="w-4 h-4" /> {{ product.comments }}
            </span>
            <span class="flex items-center gap-1"> <ClockIcon class="w-4 h-4" /> {{ product.views }} </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
