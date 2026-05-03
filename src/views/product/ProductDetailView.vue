<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '@/components/product/ProductCard.vue'
import {
  HeartIcon,
  ShareIcon,
  EyeIcon,
  ClockIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  PhoneIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'

const route = useRoute()
const liked = ref(false)
const currentIndex = ref(0)

const product = {
  id: route.params.id,
  title: '맥북 프로 M1 2020년형 판매',
  category: '노트북',
  price: 1200000,
  condition: '중고',
  tradeMethod: '직거래, 택배거래',
  location: '서울 강남구',
  status: '판매중',
  views: 234,
  likes: 12,
  timeAgo: '2시간 전',
  description: `2020년형 맥북 프로 M1 칩셋 모델입니다.

- 스펙: M1 칩, 8GB RAM, 256GB SSD
- 상태: 외관 깨끗, 배터리 사이클 50회 미만
- 구성품: 본체, 충전기, 박스

학교 근처 직거래 선호하며, 택배 거래도 가능합니다. 실사용 1년 정도이고 관리 잘 해서 상태 좋습니다.`,
  images: [
    'https://picsum.photos/id/119/600/450',
    'https://picsum.photos/id/180/600/450',
    'https://picsum.photos/id/201/600/450',
    'https://picsum.photos/id/250/600/450',
  ],
}

const prev = () => { currentIndex.value = (currentIndex.value - 1 + product.images.length) % product.images.length }
const next = () => { currentIndex.value = (currentIndex.value + 1) % product.images.length }

const seller = {
  name: '김철수',
  initial: '김',
  trustScore: 98,
  sales: 12,
  purchases: 8,
  reviews: 28,
}

const sellerProducts = [
  { id: 2, title: '로지텍 무선 마우스', price: 45000, status: '판매중', image: 'https://picsum.photos/id/10/300/300', likes: 6, comments: 2, views: 98 },
  { id: 3, title: '소니 헤드폰 WH-1000XM4', price: 180000, status: '거래중', image: 'https://picsum.photos/id/20/300/300', likes: 9, comments: 3, views: 145 },
  { id: 4, title: '삼성 노트북 2021년형', price: 800000, status: '판매중', image: 'https://picsum.photos/id/30/300/300', likes: 14, comments: 5, views: 203 },
  { id: 5, title: '아이패드 프로 11인치', price: 650000, status: '판매중', image: 'https://picsum.photos/id/40/300/300', likes: 21, comments: 7, views: 317 },
]

const sellerLikedIds = ref(new Set())
const toggleSellerLike = (id) => {
  if (sellerLikedIds.value.has(id)) {
    sellerLikedIds.value.delete(id)
  } else {
    sellerLikedIds.value.add(id)
  }
  sellerLikedIds.value = new Set(sellerLikedIds.value)
}

const recentlyViewed = ref([])

onMounted(() => {
  if (!localStorage.getItem('recentlyViewed')) {
    const seed = [
      { id: '3', title: 'LG 모니터 27인치 4K', price: 180000, image: 'https://picsum.photos/id/30/300/300' },
      { id: '6', title: '로지텍 기계식 키보드', price: 79000, image: 'https://picsum.photos/id/60/300/300' },
    ]
    localStorage.setItem('recentlyViewed', JSON.stringify(seed))
  }
  const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
  const current = { id: product.id, title: product.title, price: product.price, image: product.images[0] }
  const updated = [current, ...stored.filter((p) => p.id !== product.id)].slice(0, 5)
  localStorage.setItem('recentlyViewed', JSON.stringify(updated))
  recentlyViewed.value = updated.filter((p) => p.id !== product.id).slice(0, 2)
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">

    <!-- 이미지 + 판매자 카드 (데스크탑: 좌우 / 모바일: 이미지만) -->
    <div class="lg:flex lg:gap-6 mb-6">

      <!-- 이미지 갤러리 -->
      <div class="flex-1 min-w-0">
        <div class="relative rounded-2xl overflow-hidden bg-gray-100">
          <img :src="product.images[currentIndex]" :alt="product.title" class="w-full h-72 lg:h-96 object-cover" />
          <span class="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
            {{ currentIndex + 1 }} / {{ product.images.length }}
          </span>
          <button
            @click="prev"
            class="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow hover:bg-white transition"
          >
            <ChevronLeftIcon class="w-5 h-5 text-text-main" />
          </button>
          <button
            @click="next"
            class="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow hover:bg-white transition"
          >
            <ChevronRightIcon class="w-5 h-5 text-text-main" />
          </button>
        </div>
        <div class="flex gap-2 mt-6 overflow-x-auto no-scrollbar justify-center">
          <button
            v-for="(img, i) in product.images"
            :key="i"
            @click="currentIndex = i"
            :class="currentIndex === i ? 'ring-2 ring-primary' : 'opacity-60'"
            class="w-16 h-16 rounded-xl overflow-hidden shrink-0 transition"
          >
            <img :src="img" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- 판매자 카드 (데스크탑만) -->
      <div class="hidden lg:flex lg:w-60 shrink-0 self-start sticky top-20">
        <div class="w-full border border-border rounded-2xl p-5 flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
              {{ seller.initial }}
            </div>
            <div>
              <p class="font-bold text-text-main">{{ seller.name }}</p>
              <p class="text-xs text-green-500 font-medium flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                신뢰도 {{ seller.trustScore }}%
              </p>
            </div>
          </div>
          <div class="grid grid-cols-3 text-center border border-border rounded-xl py-3">
            <div>
              <p class="text-sm font-bold text-text-main">{{ seller.sales }}</p>
              <p class="text-xs text-text-sub">판매</p>
            </div>
            <div class="border-x border-border">
              <p class="text-sm font-bold text-text-main">{{ seller.purchases }}</p>
              <p class="text-xs text-text-sub">구매</p>
            </div>
            <div>
              <p class="text-sm font-bold text-text-main">{{ seller.reviews }}</p>
              <p class="text-xs text-text-sub">후기</p>
            </div>
          </div>
          <button class="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl text-sm hover:bg-primary/90 transition">
            <ChatBubbleOvalLeftEllipsisIcon class="w-5 h-5" />
            채팅하기
          </button>
          <button class="flex items-center justify-center gap-2 border border-border text-text-main font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition">
            <PhoneIcon class="w-5 h-5" />
            전화번호 보기
          </button>
          <!-- 최근 본 상품 -->
          <div v-if="recentlyViewed.length > 0" class="border-t border-border pt-4">
            <p class="text-sm font-bold text-text-main mb-2">📌 최근 본 상품</p>
            <div class="flex flex-col gap-1">
              <RouterLink
                v-for="item in recentlyViewed"
                :key="item.id"
                :to="`/products/${item.id}`"
                class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition"
              >
                <img :src="item.image" class="w-10 h-10 rounded-lg object-cover shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-text-main line-clamp-2 leading-snug">{{ item.title }}</p>
                  <p class="text-xs font-semibold text-text-main mt-0.5">{{ item.price.toLocaleString() }}원</p>
                </div>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 상품 정보 -->
    <div class="border border-border rounded-2xl p-6 mb-6">
      <div class="flex items-start justify-between mb-3">
        <span class="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{{ product.category }}</span>
        <div class="flex gap-3">
          <button @click="liked = !liked">
            <HeartSolidIcon v-if="liked" class="w-6 h-6 text-red-500" />
            <HeartIcon v-else class="w-6 h-6 text-text-sub" />
          </button>
          <button>
            <ShareIcon class="w-6 h-6 text-text-sub" />
          </button>
        </div>
      </div>
      <h1 class="text-xl font-bold text-text-main mb-2">{{ product.title }}</h1>
      <p class="text-2xl font-extrabold text-primary mb-4">{{ product.price.toLocaleString() }}원</p>
      <div class="flex items-center gap-4 text-text-sub text-sm mb-6">
        <span class="flex items-center gap-1"><EyeIcon class="w-4 h-4" /> 조회 {{ product.views }}</span>
        <span class="flex items-center gap-1"><HeartIcon class="w-4 h-4" /> {{ product.likes }}</span>
        <span class="flex items-center gap-1"><ClockIcon class="w-4 h-4" /> {{ product.timeAgo }}</span>
      </div>
      <table class="w-full text-sm mb-6">
        <tbody class="divide-y divide-border">
          <tr>
            <td class="py-3 text-text-sub w-24">상태</td>
            <td class="py-3 text-text-main font-medium">{{ product.condition }}</td>
          </tr>
          <tr>
            <td class="py-3 text-text-sub">거래방법</td>
            <td class="py-3 text-text-main font-medium">{{ product.tradeMethod }}</td>
          </tr>
          <tr>
            <td class="py-3 text-text-sub">위치</td>
            <td class="py-3 text-text-main font-medium flex items-center gap-1">
              <MapPinIcon class="w-4 h-4 text-text-sub" />{{ product.location }}
            </td>
          </tr>
        </tbody>
      </table>
      <p class="text-sm font-bold text-text-main mb-3">상품 설명</p>
      <p class="text-sm text-text-main whitespace-pre-line leading-relaxed">{{ product.description }}</p>
    </div>

    <!-- 판매자 카드 (모바일만) -->
    <div class="lg:hidden border border-border rounded-2xl p-5 flex flex-col gap-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
          {{ seller.initial }}
        </div>
        <div>
          <p class="font-bold text-text-main">{{ seller.name }}</p>
          <p class="text-xs text-green-500 font-medium flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
            신뢰도 {{ seller.trustScore }}%
          </p>
        </div>
      </div>
      <div class="grid grid-cols-3 text-center border border-border rounded-xl py-3">
        <div>
          <p class="text-sm font-bold text-text-main">{{ seller.sales }}</p>
          <p class="text-xs text-text-sub">판매</p>
        </div>
        <div class="border-x border-border">
          <p class="text-sm font-bold text-text-main">{{ seller.purchases }}</p>
          <p class="text-xs text-text-sub">구매</p>
        </div>
        <div>
          <p class="text-sm font-bold text-text-main">{{ seller.reviews }}</p>
          <p class="text-xs text-text-sub">후기</p>
        </div>
      </div>
      <button class="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl text-sm hover:bg-primary/90 transition">
        <ChatBubbleOvalLeftEllipsisIcon class="w-5 h-5" />
        채팅하기
      </button>
      <button class="flex items-center justify-center gap-2 border border-border text-text-main font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition">
        <PhoneIcon class="w-5 h-5" />
        전화번호 보기
      </button>
    </div>

    <!-- 판매자의 다른 상품 -->
    <div>
      <p class="text-base font-bold text-text-main mb-4">판매자의 다른 상품</p>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ProductCard
          v-for="item in sellerProducts"
          :key="item.id"
          :product="item"
          :liked="sellerLikedIds.has(item.id)"
          @toggle-like="toggleSellerLike"
        />
      </div>
    </div>

  </div>
</template>
