<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { PlusIcon } from '@heroicons/vue/24/solid'
import ProductCard from '@/components/product/ProductCard.vue'
import { productApi } from '@/api/productApi'
import { categoryApi } from '@/api/categoryApi'
import { useAuthStore } from '@/stores/auth'
import { mapProduct } from '@/utils/product'

const likedIds = ref([])
const currentPage = ref(1)
const searchQuery = ref('')
const sortBy = ref('최신순')
const showSortDropdown = ref(false)
const selectedCategoryId = ref(null)
const totalPages = ref(1)
const products = ref([])
const categories = ref([])
const isLoading = ref(false)
const includeSold = ref(false)
const authStore = useAuthStore()
const sidebarSortRef = ref(null)
const mobileSortRef = ref(null)
const sortParamMap = {
  최신순: null,
  '낮은 가격순': 'price,asc',
  '높은 가격순': 'price,desc',
  추천순: 'favoriteCount,desc',
}

const sortOptions = ['최신순', '낮은 가격순', '높은 가격순', '추천순']

onMounted(() => {
  fetchCategories()
  fetchProducts()
  if (authStore.isLoggedIn) fetchFavorites()
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})

const handleOutsideClick = (e) => {
  const insideSidebar = sidebarSortRef.value?.contains(e.target)
  const insideMobile = mobileSortRef.value?.contains(e.target)
  if (!insideSidebar && !insideMobile) {
    showSortDropdown.value = false
  }
}

const fetchCategories = async () => {
  const { data } = await categoryApi.getCategories()
  const topLevel = data.filter((c) => c.parentId === null)
  categories.value = [{ id: null, name: '전체' }, ...topLevel]
}

const fetchProducts = async () => {
  isLoading.value = true
  try {
    const params = { page: currentPage.value - 1, size: 20 }
    if (selectedCategoryId.value !== null) {
      params.categoryId = selectedCategoryId.value
    }
    if (!includeSold.value) {
      params.saleStatus = 'available'
    }
    if (sortParamMap[sortBy.value]) params.sort = sortParamMap[sortBy.value]
    if (searchQuery.value.trim()) {
      params.keyword = searchQuery.value.trim()
      params.searchType = 'all'
    }

    const { data } = await productApi.getProducts(params)
    products.value = data.content.map((p) => ({ ...mapProduct(p), favoriteCount: p.favoriteCount }))
    totalPages.value = data.totalPages
  } catch (e) {
    console.error('상품 목록 조회 실패', e)
  } finally {
    isLoading.value = false
  }
}

const selectSort = (option) => {
  sortBy.value = option
  showSortDropdown.value = false
}

const toggleLike = async (id) => {
  if (!authStore.isLoggedIn) return
  const isLiked = likedIds.value.includes(id)
  likedIds.value = isLiked ? likedIds.value.filter((i) => i !== id) : [...likedIds.value, id]
  try {
    await productApi.toggleFavorite(id)
  } catch (e) {
    likedIds.value = isLiked ? [...likedIds.value, id] : likedIds.value.filter((i) => i !== id)
    console.error('찜 변경 실패', e)
  }
}
const fetchFavorites = async () => {
  try {
    const { data } = await productApi.getMyFavorites()
    const items = Array.isArray(data) ? data : (data.content ?? [])
    likedIds.value = items.map((p) => p.id)
  } catch (e) {
    console.error('찜 목록 조회 실패', e)
  }
}

watch(sortBy, () => {
  currentPage.value = 1
  fetchProducts()
})

watch(selectedCategoryId, () => {
  currentPage.value = 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
  fetchProducts()
})

watch(includeSold, () => {
  currentPage.value = 1
  fetchProducts()
})

function searchSubmit() {
  currentPage.value = 1
  fetchProducts()
  searchQuery.value = ''
}

watch(currentPage, fetchProducts)

const visiblePages = computed(() => {
  const blockStart = Math.floor((currentPage.value - 1) / 5) * 5 + 1
  const blockEnd = Math.min(blockStart + 4, totalPages.value)
  const pages = []
  for (let i = blockStart; i <= blockEnd; i++) pages.push(i)
  return pages
})
</script>

<template>
  <div class="flex flex-col bg-paper-dots min-h-screen">
    <!-- 히어로 배너 -->
    <div class="market-hero px-6 py-4">
      <div class="max-w-6xl mx-auto flex items-center gap-3">
        <h1 class="font-bold text-2xl text-white tracking-tight">
          <span class="text-[#ffe066]">낙서장터</span>
        </h1>
        <span class="text-xs font-bold text-[#f5ddc8] opacity-70 tracking-widest">✦ 캠퍼스 중고 거래</span>
      </div>
    </div>

    <!-- 검색 -->
    <div class="px-4 md:px-6 pt-4 pb-0 md:py-6">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-2">
          <!-- 검색바 -->
          <div
            class="flex flex-1 min-w-0 items-center bg-white border-2 border-ink rounded-xl shadow-[2px_2px_0_#1c1712]"
          >
            <input
              v-model="searchQuery"
              type="text"
              placeholder="검색어를 입력해주세요"
              class="flex-1 min-w-0 px-4 py-2 text-sm text-ink outline-none placeholder:text-[#8c7e6e]"
              @keyup.enter="searchSubmit"
            />
            <button
              @click="searchQuery ? ((searchQuery = ''), searchSubmit()) : searchSubmit()"
              class="pl-3 pr-4 py-2 text-[#8c7e6e] hover:text-ink transition-colors cursor-pointer"
            >
              <XMarkIcon v-if="searchQuery" class="w-4 h-4" />
              <MagnifyingGlassIcon v-else class="w-4 h-4" />
            </button>
          </div>
          <!-- 상품등록 버튼 -->
          <RouterLink
            to="/product/create"
            class="flex items-center gap-2 bg-[#ffe066] border-2 border-ink text-ink text-sm font-bold px-4 py-2 rounded-xl shadow-[3px_3px_0_#1c1712] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1c1712] transition-all whitespace-nowrap shrink-0"
          >
            <PlusIcon class="w-4 h-4" />
            상품등록
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- 모바일 카테고리 칩 + 정렬 -->
    <div class="flex items-center gap-2 px-4 py-3 md:hidden">
      <!-- 정렬 버튼 (모바일) -->
      <div ref="mobileSortRef" class="relative shrink-0">
        <button
          @click="showSortDropdown = !showSortDropdown"
          :class="sortBy !== '최신순' ? 'bg-[#ffe066] border-ink' : 'bg-white border-[#c8bca8] hover:border-ink'"
          class="p-2 rounded-xl border-2 transition-all cursor-pointer"
          :title="sortBy"
        >
          <AdjustmentsHorizontalIcon class="w-4 h-4 text-ink" />
        </button>
        <div
          v-if="showSortDropdown"
          class="absolute left-0 top-full mt-1 bg-white border-2 border-ink rounded-xl shadow-[3px_3px_0_#1c1712] z-20 overflow-hidden"
        >
          <button
            v-for="option in sortOptions"
            :key="option"
            @click="selectSort(option)"
            :class="sortBy === option ? 'bg-[#ffe066] font-bold' : 'hover:bg-[#ffe066]/60'"
            class="block w-full text-left px-5 py-2.5 text-sm text-ink whitespace-nowrap cursor-pointer border-b border-[#c8bca8] last:border-b-0"
          >
            {{ option }}
          </button>
        </div>
      </div>
      <!-- 카테고리 칩 -->
      <div class="flex gap-2 overflow-x-auto no-scrollbar flex-1 pb-0.5">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectedCategoryId = category.id"
          :class="
            selectedCategoryId === category.id
              ? 'bg-primary text-white border-ink shadow-[2px_2px_0_#1c1712]'
              : 'bg-white text-[#8c7e6e] border-[#c8bca8]'
          "
          class="shrink-0 px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all border-2"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- 본문 -->
    <div class="flex w-full mx-auto items-start px-4 md:px-6 pt-0 pb-6 md:pb-8 gap-6">
      <!-- PC 사이드바 -->
      <div
        class="hidden md:block border-2 border-ink rounded-2xl p-4 w-56 shrink-0 sticky top-20 self-start bg-white shadow-[4px_4px_0_#1c1712]"
      >
        <div class="flex items-center justify-between px-4 pt-4 pb-2">
          <p class="font-bold text-lg text-ink">카테고리</p>
          <!-- 정렬 버튼 (데스크탑) -->
          <div ref="sidebarSortRef" class="relative">
            <button
              @click="showSortDropdown = !showSortDropdown"
              :class="
                sortBy !== '최신순'
                  ? 'bg-[#ffe066] border-ink'
                  : 'border-[#c8bca8] hover:border-ink text-[#8c7e6e] hover:text-ink'
              "
              class="p-1.5 rounded-lg border-2 transition-all cursor-pointer"
              :title="sortBy"
            >
              <AdjustmentsHorizontalIcon class="w-4 h-4 text-ink" />
            </button>
            <div
              v-if="showSortDropdown"
              class="absolute right-0 top-full mt-1 bg-white border-2 border-ink rounded-xl shadow-[3px_3px_0_#1c1712] z-20 overflow-hidden"
            >
              <button
                v-for="option in sortOptions"
                :key="option"
                @click="selectSort(option)"
                :class="sortBy === option ? 'bg-[#ffe066] font-bold' : 'hover:bg-[#ffe066]/60'"
                class="block w-full text-left px-5 py-2.5 text-sm text-ink whitespace-nowrap cursor-pointer border-b border-[#c8bca8] last:border-b-0"
              >
                {{ option }}
              </button>
            </div>
          </div>
        </div>
        <!-- 판매완료 포함 토글 -->
        <div class="flex items-center justify-between px-4 py-2">
          <span class="text-sm font-bold text-ink">판매완료 포함</span>
          <button
            @click="includeSold = !includeSold"
            :class="includeSold ? 'bg-primary' : 'bg-[#c8bca8]'"
            class="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 border-2 border-ink"
          >
            <span
              :class="includeSold ? 'translate-x-5' : 'translate-x-0'"
              class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
            ></span>
          </button>
        </div>
        <hr class="mx-4 mb-2 border-[#c8bca8]" />
        <ul class="flex flex-col">
          <li
            v-for="category in categories"
            :key="category.id"
            @click="selectedCategoryId = category.id"
            :class="
              selectedCategoryId === category.id
                ? 'bg-primary text-white border-ink shadow-[2px_2px_0_#1c1712]'
                : 'text-ink hover:bg-primary/10 border-transparent'
            "
            class="mx-2 my-1 px-4 py-2 cursor-pointer rounded-lg border-2 transition-all"
          >
            {{ category.name }}
          </li>
        </ul>
      </div>

      <!-- 상품 목록 -->
      <div class="flex-1 flex flex-col min-w-0">
        <p v-if="isLoading" class="text-center text-[#8c7e6e] py-20">불러오는 중...</p>
        <p v-else-if="products.length === 0" class="text-center text-[#8c7e6e] py-20">검색 결과가 없습니다.</p>

        <div v-else class="product-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            :liked="likedIds.includes(product.id)"
            @toggle-like="toggleLike"
          />
        </div>

        <!-- 페이지네이션 -->
        <div class="flex justify-center items-center gap-1 mt-8 mb-4">
          <button
            @click="currentPage = Math.max(1, currentPage - 5)"
            :disabled="currentPage <= 1"
            class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all"
          >
            «
          </button>
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage <= 1"
            class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all"
          >
            ‹
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            :class="
              currentPage === page
                ? 'bg-[#ffe066] border-ink shadow-[2px_2px_0_#1c1712] text-ink'
                : 'bg-white border-[#c8bca8] text-ink hover:border-ink hover:shadow-[2px_2px_0_#1c1712]'
            "
            class="min-w-8 h-8 md:min-w-9 md:h-9 px-2 rounded-xl font-bold text-sm border-2 transition-all"
          >
            {{ page }}
          </button>
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all"
          >
            ›
          </button>
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 5)"
            :disabled="currentPage >= totalPages"
            class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all"
          >
            »
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.market-hero {
  background-color: #7c3d1a;
  box-shadow: 0 4px 0 #1c1712;
}

.sort-btn:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.product-grid > *:nth-child(4n + 1) {
  transform: rotate(-0.8deg);
}
.product-grid > *:nth-child(4n + 2) {
  transform: rotate(0.6deg);
}
.product-grid > *:nth-child(4n + 3) {
  transform: rotate(-0.4deg);
}
.product-grid > *:nth-child(4n + 4) {
  transform: rotate(1deg);
}
.product-grid > *:hover {
  transform: translateY(-6px) rotate(0deg);
}
</style>
