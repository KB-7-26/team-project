<script setup>
import { ref, onMounted } from 'vue'
import {
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline'
import { productApi } from '@/api/productApi'
import ProductCard from '@/components/product/ProductCard.vue'

const saleStatusMap = { available: '판매중', reserved: '거래중', sold: '거래완료' }

const categories = [
  { icon: ShoppingBagIcon, title: '중고거래', desc: '안전한 학생 간 거래', to: '/products', tape: '#ffe066' },
  { icon: ChatBubbleLeftRightIcon, title: '익명게시판', desc: '자유로운 소통 공간', to: '/board', tape: '#96d4b4' },
  { icon: ChatBubbleOvalLeftIcon, title: '채팅목록', desc: '실시간 대화', to: '/chats', tape: '#a8c8e8' },
  { icon: UserIcon, title: '마이페이지', desc: '내 정보 관리', to: '/mypage', tape: '#f4a8b8' },
]

const popularProducts = ref([])

onMounted(async () => {
  try {
    const { data } = await productApi.getProducts({ sort: 'favoriteCount,desc', size: 4, saleStatus: 'available' })
    popularProducts.value = data.content.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      isFree: p.isFree,
      image: p.thumbnailUrl || `https://picsum.photos/seed/${p.id}/400/300`,
      status: saleStatusMap[p.saleStatus] ?? p.saleStatus,
      views: p.viewCount ?? 0,
    }))
  } catch (e) {
    console.error('인기 상품 조회 실패', e)
  }
})
</script>

<template>
  <div class="bg-paper-dots min-h-screen">
    <!-- HERO -->
    <div class="relative max-w-230 mx-auto px-6 md:px-10 py-16 md:py-20 overflow-hidden">
      <div
        class="doodle-ring absolute top-12.5 right-5 w-40 h-40 border-[3px] border-dashed border-[#c8bca8] rounded-full opacity-50 pointer-events-none hidden md:block"
      />
      <div class="absolute bottom-15 right-30 text-5xl opacity-[0.15] pointer-events-none hidden md:block select-none">
        ✦
      </div>

      <span
        class="inline-block rotate-[-1.2deg] mb-6 px-3 py-0.5 font-sketch text-sm text-[#8c7e6e] border-2 border-[#8c7e6e] rounded-md"
        >✦ 캠퍼스 중고거래 플랫폼</span
      >

      <h1 class="font-sketch font-bold leading-[1.05] mb-5 text-[clamp(3rem,7vw,5.5rem)]">
        학생들의<br />
        <span class="hl-word">낙서장</span>
      </h1>

      <p class="text-lg text-[#8c7e6e] mb-9">학생 인증으로 더 믿을 수 있는 거래 환경을 만들어요 ✌️</p>

      <div
        class="flex items-center bg-white border-2 border-ink rounded-xl px-4 py-1.5 max-w-140 shadow-[4px_4px_0_#1c1712] gap-2.5"
      >
        <MagnifyingGlassIcon class="w-5 h-5 text-[#c8bca8] shrink-0" />
        <input
          type="text"
          placeholder="물품이나 게시글을 검색해보세요"
          class="flex-1 outline-none text-sm bg-transparent text-ink placeholder:text-[#c8bca8]"
        />
        <RouterLink
          to="/products"
          class="search-btn bg-[#ffe066] border-2 border-ink rounded-[10px] px-5 py-2 font-bold text-sm text-ink whitespace-nowrap"
          >검색</RouterLink
        >
      </div>

      <div class="flex flex-wrap items-center gap-2 mt-4">
        <span class="text-sm text-[#8c7e6e]">인기 검색어:</span>
        <RouterLink
          v-for="tag in ['노트북', '모니터', '키보드', '마우스', '도서']"
          :key="tag"
          to="/products"
          class="text-sm bg-white border-[1.5px] border-[#c8bca8] rounded-full px-3.5 py-1 text-[#8c7e6e] transition-all hover:border-ink hover:bg-[#ffe066] hover:text-ink"
          >{{ tag }}</RouterLink
        >
      </div>
    </div>

    <div class="dash-divider h-0.5" />

    <!-- CATEGORIES -->
    <section class="max-w-275 mx-auto px-6 md:px-10 py-13">
      <div class="flex items-baseline justify-between mb-8">
        <h2 class="sec-title font-bold text-[26px]">카테고리</h2>
        <RouterLink
          to="/products"
          class="text-sm text-[#8c7e6e] border-b border-dashed border-[#8c7e6e] pb-0.5 hover:text-ink hover:border-ink transition-colors"
          >전체보기 →</RouterLink
        >
      </div>
      <div class="cat-grid grid grid-cols-2 md:grid-cols-4 gap-4">
        <RouterLink
          v-for="item in categories"
          :key="item.title"
          :to="item.to"
          class="cat-card bg-white border-2 border-ink rounded-[18px] p-6 cursor-pointer relative overflow-hidden block"
        >
          <div class="absolute top-0 left-0 right-0 h-1.5" :style="{ background: item.tape }" />
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center mb-3 mt-1"
            :style="{ background: item.tape }"
          >
            <component :is="item.icon" class="w-5 h-5 text-ink" />
          </div>
          <p class="font-bold text-[17px] text-ink">{{ item.title }}</p>
          <p class="text-xs text-[#8c7e6e] mt-1">{{ item.desc }}</p>
        </RouterLink>
      </div>
    </section>

    <div class="dash-divider h-0.5" />

    <!-- POPULAR PRODUCTS -->
    <section class="max-w-275 mx-auto px-6 md:px-10 py-13">
      <div class="flex items-baseline justify-between mb-8">
        <h2 class="sec-title font-bold text-[26px]">인기 상품 🔥</h2>
        <RouterLink
          to="/products"
          class="text-sm text-[#8c7e6e] border-b border-dashed border-[#8c7e6e] pb-0.5 hover:text-ink hover:border-ink transition-colors"
          >전체보기 →</RouterLink
        >
      </div>
      <div class="prod-grid grid grid-cols-2 md:grid-cols-4 gap-5">
        <ProductCard v-for="product in popularProducts" :key="product.id" :product="product" :liked="false" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.doodle-ring {
  animation: spin-slow 35s linear infinite;
}
@keyframes spin-slow {
  to {
    transform: rotate(360deg);
  }
}

.hl-word {
  position: relative;
  display: inline-block;
  z-index: 1;
}
.hl-word::before {
  content: '';
  position: absolute;
  bottom: 2px;
  left: -6px;
  right: -6px;
  height: 22px;
  background: #ffe066;
  z-index: -1;
  transform: rotate(-0.8deg) skewX(-4deg);
  border-radius: 3px;
}

.sec-title {
  position: relative;
  display: inline-block;
}
.sec-title::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  right: 0;
  height: 3px;
  background: #ffe066;
  border-radius: 2px;
}

.dash-divider {
  background: repeating-linear-gradient(90deg, #c8bca8 0 8px, transparent 8px 16px);
}

.search-btn {
  transition:
    transform 0.12s,
    box-shadow 0.12s;
}
.search-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 2px 2px 0 #1c1712;
}
.search-btn:active {
  transform: none;
  box-shadow: none;
}

.cat-card {
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}
.cat-grid > :nth-child(odd) {
  transform: rotate(-0.6deg);
}
.cat-grid > :nth-child(even) {
  transform: rotate(0.6deg);
}
.cat-grid > *:hover {
  transform: translateY(-5px) rotate(0deg);
  box-shadow: 5px 6px 0 #1c1712;
}

.prod-grid > *:nth-child(1) {
  transform: rotate(-1deg);
}
.prod-grid > *:nth-child(2) {
  transform: rotate(0.7deg);
}
.prod-grid > *:nth-child(3) {
  transform: rotate(-0.4deg);
}
.prod-grid > *:nth-child(4) {
  transform: rotate(1.1deg);
}
</style>
