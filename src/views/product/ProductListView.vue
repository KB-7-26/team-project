<script setup>
import { ref } from 'vue'
import ProductCard from '@/components/product/ProductCard.vue'

const likedIds = ref(new Set())
const selectedCategory = ref('전체')
const currentPage = ref(1)
const totalPages = 5

const toggleLike = (id) => {
  if (likedIds.value.has(id)) {
    likedIds.value.delete(id)
  } else {
    likedIds.value.add(id)
  }
  likedIds.value = new Set(likedIds.value)
}

const categories = [
  '전체',
  '전자기기',
  '의류',
  '도서',
  '가구/생활',
  '뷰티',
  '취미',
  '기타',
]

const products = [
  {
    id: 1,
    title: '로지텍 무선 마우스',
    category: '기타전자제품',
    price: 45000,
    status: '판매중',
    image: 'https://picsum.photos/id/10/400/300',
    likes: 6,
    comments: 2,
    views: 98,
  },
  {
    id: 2,
    title: '삼성 노트북 2020년형',
    category: '노트북',
    price: 1300000,
    status: '판매중',
    image: 'https://picsum.photos/id/20/400/300',
    likes: 12,
    comments: 5,
    views: 234,
  },
  {
    id: 3,
    title: 'LG 모니터 27인치 4K',
    category: '기타전자제품',
    price: 180000,
    status: '거래중',
    image: 'https://picsum.photos/id/30/400/300',
    likes: 8,
    comments: 3,
    views: 187,
  },
  {
    id: 4,
    title: '애플 에어팟 프로 2세대',
    category: '기타전자제품',
    price: 45000,
    status: '판매중',
    image: 'https://picsum.photos/id/40/400/300',
    likes: 23,
    comments: 7,
    views: 412,
  },
  {
    id: 5,
    title: '아이폰 14 프로 256GB',
    category: '기타전자제품',
    price: 18000,
    status: '거래완료',
    image: 'https://picsum.photos/id/50/400/300',
    likes: 31,
    comments: 10,
    views: 560,
  },
  {
    id: 6,
    title: '로지텍 기계식 키보드',
    category: '기타전자제품',
    price: 79000,
    status: '판매중',
    image: 'https://picsum.photos/id/60/400/300',
    likes: 15,
    comments: 4,
    views: 203,
  },
  {
    id: 7,
    title: '소니 노이즈캔슬링 헤드폰',
    category: '기타전자제품',
    price: 220000,
    status: '판매중',
    image: 'https://picsum.photos/id/70/400/300',
    likes: 9,
    comments: 2,
    views: 145,
  },
  {
    id: 8,
    title: '애플 워치 SE 2세대',
    category: '기타전자제품',
    price: 120000,
    status: '거래중',
    image: 'https://picsum.photos/id/80/400/300',
    likes: 17,
    comments: 6,
    views: 298,
  },
  {
    id: 9,
    title: 'MacBook Pro 2023 16인치',
    category: '노트북',
    price: 680000,
    status: '판매중',
    image: 'https://picsum.photos/id/90/400/300',
    likes: 42,
    comments: 13,
    views: 731,
  },
  {
    id: 10,
    title: '아이폰 15 Pro Max 256GB',
    category: '기타전자제품',
    price: 800000,
    status: '판매중',
    image: 'https://picsum.photos/id/100/400/300',
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
  <div class="flex mx-auto items-start px-6 py-8 gap-6">
    <div class="side border border-border rounded-2xl p-4 w-54 shrink-0 sticky top-20 self-start">
      <p class="text-lg font-bold text-text-main px-4 py-4">카테고리</p>
      <ul class="flex flex-col">
        <li
          v-for="category in categories"
          :key="category"
          @click="selectedCategory = category"
          :class="selectedCategory === category ? 'bg-primary text-white' : 'hover:bg-primary/20 text-text-main'"
          class="mx-2 my-2 px-4 py-2 cursor-pointer rounded-lg text-text-main"
        >
          {{ category }}
        </li>
      </ul>
    </div>
    <div class="flex-1 flex flex-col px-4">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          :liked="likedIds.has(product.id)"
          @toggle-like="toggleLike"
        />
      </div>
      <div class="flex justify-center items-center gap-2 mt-8 mb-4">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="currentPage = page"
          :class="currentPage === page ? 'bg-primary text-white' : 'border border-border text-text-main hover:bg-primary/10'"
          class="w-10 h-10 rounded-xl font-semibold text-sm transition-colors duration-200"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>
