<script setup>
import { ref, computed, watch } from 'vue'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/vue/24/outline'
import ProductCard from '@/components/product/ProductCard.vue'

const likedIds = ref(new Set())
const selectedCategory = ref('전체')
const currentPage = ref(1)
const totalPages = 5
const searchQuery = ref('')
const sortBy = ref('최신순')
const showSortDropdown = ref(false)

const sortOptions = ['최신순', '가격낮은순', '가격높은순', '조회순']
const showAvailableOnly = ref(false)

const toggleLike = (id) => {
  if (likedIds.value.has(id)) {
    likedIds.value.delete(id)
  } else {
    likedIds.value.add(id)
  }
  likedIds.value = new Set(likedIds.value)
}

watch(selectedCategory, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

const filteredProducts = computed(() => {
  let result = selectedCategory.value === '전체'
    ? products
    : products.filter((p) => p.category === selectedCategory.value)

  if (showAvailableOnly.value) {
    result = result.filter((p) => p.status === '판매중' || p.status === '거래중')
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((p) => p.title.toLowerCase().includes(q))
  }

  if (sortBy.value === '가격낮은순') return [...result].sort((a, b) => a.price - b.price)
  if (sortBy.value === '가격높은순') return [...result].sort((a, b) => b.price - a.price)
  if (sortBy.value === '조회순') return [...result].sort((a, b) => b.views - a.views)
  return result
})

const categories = ['전체', '전자기기', '의류', '도서', '가구/생활', '뷰티', '취미', '기타']

const products = [
  {
    id: 1,
    title: '로지텍 무선 마우스',
    category: '전자기기',
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
    category: '전자기기',
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
    category: '전자기기',
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
    category: '전자기기',
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
    category: '전자기기',
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
    category: '전자기기',
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
    category: '전자기기',
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
    category: '전자기기',
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
    category: '전자기기',
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
    category: '전자기기',
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
  <div class="flex flex-col">
    <!-- 히어로 -->
    <div class="bg-primary/10 px-6 py-8">
      <div class="max-w-2xl mx-auto">
        <p class="text-3xl font-extrabold text-text-main mb-4">중고 거래</p>
        <div class="flex gap-2">
          <!-- 검색바 -->
          <div class="flex-1 flex items-center bg-white rounded-xl border border-border px-3 gap-2 shadow-sm">
            <MagnifyingGlassIcon class="w-5 h-5 text-text-sub shrink-0" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="검색어를 입력해주세요"
              class="flex-1 py-3 text-sm outline-none bg-transparent text-text-main placeholder:text-text-sub"
            />
          </div>
          <!-- 정렬 필터 -->
          <div class="relative">
            <button
              @click="showSortDropdown = !showSortDropdown"
              class="h-full px-4 bg-white rounded-xl border border-border text-sm font-semibold flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <AdjustmentsHorizontalIcon class="w-4 h-4" />
              {{ sortBy }}
            </button>
            <div
              v-if="showSortDropdown"
              class="absolute right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-10 overflow-hidden"
            >
              <button
                v-for="option in sortOptions"
                :key="option"
                @click="sortBy = option; showSortDropdown = false"
                :class="sortBy === option ? 'bg-primary/10 text-primary font-semibold' : 'text-text-main hover:bg-gray-50'"
                class="block w-full text-left px-5 py-3 text-sm whitespace-nowrap"
              >
                {{ option }}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 모바일 카테고리 칩 -->
    <div class="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar md:hidden">
      <button
        v-for="category in categories"
        :key="category"
        @click="selectedCategory = category"
        :class="selectedCategory === category ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600'"
        class="shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition"
      >
        {{ category }}
      </button>
    </div>
    <!-- 본문 -->
    <div class="flex mx-auto items-start px-6 py-8 gap-6">
      <!-- PC 사이드바 -->
      <div class="side hidden md:block border border-border rounded-2xl p-4 w-54 shrink-0 sticky top-20 self-start">
        <p class="text-lg font-bold text-text-main px-4 pt-4 pb-2">카테고리</p>
        <!-- 거래 가능만 보기 토글 -->
        <div class="flex items-center justify-between px-4 py-2">
          <span class="text-sm font-medium text-text-main">거래 가능만 보기</span>
          <button
            @click="showAvailableOnly = !showAvailableOnly"
            :class="showAvailableOnly ? 'bg-primary' : 'bg-gray-300'"
            class="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0"
          >
            <span
              :class="showAvailableOnly ? 'translate-x-5' : 'translate-x-0'"
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
            ></span>
          </button>
        </div>
        <hr class="mx-4 mb-2 border-border" />
        <ul class="flex flex-col">
          <li
            v-for="category in categories"
            :key="category"
            @click="selectedCategory = category"
            :class="selectedCategory === category ? 'bg-primary text-white shadow' : 'hover:bg-primary/10 text-text-main'"
            class="mx-2 my-2 px-4 py-2 cursor-pointer rounded-lg"
          >
            {{ category }}
          </li>
        </ul>
      </div>

      <!-- 상품 목록 -->
      <div class="flex-1 flex flex-col px-4">
        <!-- 검색 결과 없음 -->
        <p v-if="filteredProducts.length === 0" class="text-center text-text-sub py-20">
          검색 결과가 없습니다.
        </p>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            :liked="likedIds.has(product.id)"
            @toggle-like="toggleLike"
          />
        </div>

        <div class="flex justify-center items-center gap-3 mt-8 mb-4">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            :class="currentPage === page ? 'bg-primary text-white' : 'border border-border text-text-main hover:bg-primary/10'"
            class="min-w-10 h-10 px-3 rounded-xl font-semibold text-sm transition-colors duration-200 flex items-center justify-center"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
