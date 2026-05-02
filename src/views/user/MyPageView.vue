<script setup>
import { computed, ref } from 'vue'
import {
  ArchiveBoxIcon,
  ChatBubbleOvalLeftIcon,
  Cog6ToothIcon,
  CubeIcon,
  HeartIcon,
  ShoppingBagIcon,
  StarIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'
import { ArrowTrendingUpIcon } from '@heroicons/vue/24/solid'
import ProductCard from '@/components/product/ProductCard.vue'

defineOptions({
  name: 'MyPageView',
})

const selectedMenu = ref('sales')
const selectedSaleStatus = ref('판매중')
const likedIds = ref(new Set([1, 3, 5]))

const profile = {
  name: '김철수',
  nickname: '철수마켓',
  cohort: '25회차 전공',
  image: 'https://picsum.photos/id/1005/240/240',
  trustScore: 98,
  stats: [
    { label: '판매', value: 6, icon: ShoppingBagIcon },
    { label: '구매', value: 12, icon: CubeIcon },
    { label: '찜', value: 34, icon: HeartIcon },
    { label: '후기', value: 28, icon: StarIcon },
  ],
}

const menuItems = [
  { id: 'profile', label: '내 프로필', icon: UserIcon },
  { id: 'sales', label: '판매목록', icon: ShoppingBagIcon },
  { id: 'purchases', label: '구매목록', icon: CubeIcon },
  { id: 'favorites', label: '찜 목록', icon: HeartIcon },
  { id: 'chats', label: '채팅목록', icon: ChatBubbleOvalLeftIcon },
  { id: 'settings', label: '환경설정', icon: Cog6ToothIcon },
]

const saleStatusTabs = ['판매중', '판매완료', '숨김']

const saleProducts = [
  {
    id: 1,
    title: '메이저급 소닉 2세대 판매합니다!',
    price: 180000,
    status: '판매중',
    image: 'https://picsum.photos/id/96/500/360',
    likes: 12,
    comments: 5,
    views: 234,
  },
  {
    id: 2,
    title: '메이저급 무선 이어폰',
    price: 250000,
    status: '판매중',
    image: 'https://picsum.photos/id/180/500/360',
    likes: 8,
    comments: 3,
    views: 156,
  },
  {
    id: 3,
    title: '님 의 블루투스 마 헤드셋',
    price: 95000,
    status: '판매중',
    image: 'https://picsum.photos/id/119/500/360',
    likes: 15,
    comments: 7,
    views: 312,
  },
  {
    id: 4,
    title: '기계식 키보드 새제품 같음',
    price: 120000,
    status: '판매완료',
    image: 'https://picsum.photos/id/60/500/360',
    likes: 23,
    comments: 12,
    views: 445,
  },
  {
    id: 5,
    title: '로지텍 무선 마우스',
    price: 45000,
    status: '판매중',
    image: 'https://picsum.photos/id/26/500/360',
    likes: 6,
    comments: 2,
    views: 98,
  },
  {
    id: 6,
    title: '노트북 거치대',
    price: 35000,
    status: '숨김',
    image: 'https://picsum.photos/id/48/500/360',
    likes: 9,
    comments: 4,
    views: 167,
  },
]

const purchaseProducts = [
  {
    id: 7,
    title: '기계식 키보드 새제품 같음',
    price: 120000,
    status: '거래완료',
    image: 'https://picsum.photos/id/60/500/360',
    likes: 23,
    comments: 12,
    views: 445,
  },
  {
    id: 8,
    title: '로지텍 무선 마우스',
    price: 45000,
    status: '거래완료',
    image: 'https://picsum.photos/id/26/500/360',
    likes: 6,
    comments: 2,
    views: 98,
  },
]

const favoriteProducts = [
  {
    id: 9,
    title: '아이패드 필기용 케이스',
    price: 28000,
    status: '판매중',
    image: 'https://picsum.photos/id/24/500/360',
    likes: 18,
    comments: 6,
    views: 209,
  },
  {
    id: 10,
    title: '전공책 일괄 판매',
    price: 52000,
    status: '판매중',
    image: 'https://picsum.photos/id/1073/500/360',
    likes: 11,
    comments: 4,
    views: 134,
  },
  {
    id: 11,
    title: '노트북 거치대',
    price: 35000,
    status: '판매중',
    image: 'https://picsum.photos/id/48/500/360',
    likes: 9,
    comments: 4,
    views: 167,
  },
]

const activeMenu = computed(() => menuItems.find((item) => item.id === selectedMenu.value))
const filteredSaleProducts = computed(() =>
  saleProducts.filter((product) => product.status === selectedSaleStatus.value),
)
const contentProducts = computed(() => {
  if (selectedMenu.value === 'purchases') {
    return purchaseProducts
  }

  if (selectedMenu.value === 'favorites') {
    return favoriteProducts
  }

  return []
})

const toggleLike = (id) => {
  if (likedIds.value.has(id)) {
    likedIds.value.delete(id)
  } else {
    likedIds.value.add(id)
  }

  likedIds.value = new Set(likedIds.value)
}
</script>

<template>
  <div class="bg-primary/10 px-6 py-12 md:py-14">
    <div class="mx-auto max-w-7xl">
      <h1 class="text-4xl font-extrabold text-text-main md:text-5xl">마이페이지</h1>
      <p class="mt-5 text-lg font-medium text-text-sub">내 정보와 거래 내역을 관리하세요</p>
    </div>
  </div>

  <main class="bg-sub-bg px-6 py-8 md:py-10">
    <div class="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row">
      <aside class="flex w-full flex-col gap-6 lg:w-80 lg:shrink-0">
        <section class="rounded-2xl border border-border bg-white p-7 shadow-sm">
          <div class="flex flex-col items-center text-center">
            <img
              :src="profile.image"
              :alt="`${profile.nickname} 프로필 이미지`"
              class="h-28 w-28 rounded-full border-4 border-primary/20 object-cover"
            />
            <h2 class="mt-5 text-2xl font-extrabold text-text-main">{{ profile.nickname }}</h2>
            <p class="mt-2 text-sm font-bold text-primary">{{ profile.cohort }}</p>
            <p class="mt-2 flex items-center gap-1 text-sm font-medium text-text-sub">
              <ArrowTrendingUpIcon class="h-4 w-4 text-primary" />
              신뢰도 {{ profile.trustScore }}%
            </p>
          </div>

          <dl class="mt-7 grid grid-cols-2 gap-3">
            <div
              v-for="stat in profile.stats"
              :key="stat.label"
              class="rounded-2xl bg-sub-bg px-4 py-4 text-center"
            >
              <component :is="stat.icon" class="mx-auto h-6 w-6 text-primary" />
              <dt class="mt-2 text-2xl font-extrabold text-text-main">{{ stat.value }}</dt>
              <dd class="mt-1 text-xs font-medium text-text-sub">{{ stat.label }}</dd>
            </div>
          </dl>

          <button
            type="button"
            class="mt-7 h-14 w-full rounded-2xl bg-primary text-base font-extrabold text-white transition hover:bg-primary-hover active:bg-primary-active"
          >
            프로필 수정
          </button>
        </section>

        <nav class="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <button
            v-for="item in menuItems"
            :key="item.id"
            type="button"
            class="flex w-full items-center gap-4 rounded-xl px-4 py-4 text-base font-bold transition"
            :class="
              selectedMenu === item.id
                ? 'bg-primary text-white'
                : 'text-text-main hover:bg-primary/10 hover:text-primary'
            "
            @click="selectedMenu = item.id"
          >
            <component :is="item.icon" class="h-6 w-6" />
            {{ item.label }}
          </button>
        </nav>
      </aside>

      <section class="min-w-0 flex-1">
        <div v-if="selectedMenu === 'sales'" class="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
          <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-2xl font-extrabold text-text-main">내 판매목록</h2>
              <p class="mt-2 text-sm font-medium text-text-sub">판매 상태별로 내 상품을 확인하세요</p>
            </div>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="status in saleStatusTabs"
                :key="status"
                type="button"
                class="h-12 rounded-full px-6 text-sm font-extrabold transition"
                :class="
                  selectedSaleStatus === status
                    ? 'bg-primary text-white shadow-[0_8px_18px_rgba(255,184,0,0.35)]'
                    : 'bg-sub-bg text-text-main hover:bg-primary/10 hover:text-primary'
                "
                @click="selectedSaleStatus = status"
              >
                {{ status }}
              </button>
            </div>
          </div>
        </div>

        <template v-if="selectedMenu === 'sales'">
          <div v-if="filteredSaleProducts.length" class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <ProductCard
              v-for="product in filteredSaleProducts"
              :key="product.id"
              :product="product"
              :liked="likedIds.has(product.id)"
              @toggle-like="toggleLike"
            />
          </div>

          <div v-else class="mt-6 rounded-2xl border border-border bg-white px-6 py-16 text-center shadow-sm">
            <ArchiveBoxIcon class="mx-auto h-12 w-12 text-text-sub" />
            <p class="mt-4 text-lg font-extrabold text-text-main">표시할 상품이 없습니다</p>
            <p class="mt-2 text-sm font-medium text-text-sub">다른 판매 상태를 선택해보세요</p>
          </div>
        </template>

        <template v-else-if="selectedMenu === 'purchases' || selectedMenu === 'favorites'">
          <div class="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
            <h2 class="text-2xl font-extrabold text-text-main">{{ activeMenu.label }}</h2>
            <p class="mt-2 text-sm font-medium text-text-sub">상품 카드 컴포넌트를 재사용한 더미 목록입니다</p>
          </div>

          <div v-if="contentProducts.length" class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <ProductCard
              v-for="product in contentProducts"
              :key="product.id"
              :product="product"
              :liked="likedIds.has(product.id)"
              @toggle-like="toggleLike"
            />
          </div>

          <div v-else class="mt-6 rounded-2xl border border-border bg-white px-6 py-16 text-center shadow-sm">
            <ArchiveBoxIcon class="mx-auto h-12 w-12 text-text-sub" />
            <p class="mt-4 text-lg font-extrabold text-text-main">표시할 상품이 없습니다</p>
            <p class="mt-2 text-sm font-medium text-text-sub">목록이 추가되면 이곳에 표시됩니다</p>
          </div>
        </template>

        <div v-else class="rounded-2xl border border-border bg-white px-6 py-16 text-center shadow-sm">
          <component :is="activeMenu.icon" class="mx-auto h-12 w-12 text-primary" />
          <h2 class="mt-5 text-2xl font-extrabold text-text-main">{{ activeMenu.label }}</h2>
          <p class="mt-3 text-sm font-medium text-text-sub">이 영역은 추후 구현 예정입니다</p>
        </div>
      </section>
    </div>
  </main>
</template>
