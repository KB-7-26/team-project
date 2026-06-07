<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/vue/24/outline'
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
const dropdownRef = ref(null)
const sortParamMap = {
  최신순: null,
  가격낮은순: 'price,asc',
  가격높은순: 'price,desc',
  추천순: 'favoriteCount,desc',
}

const sortOptions = ['최신순', '가격낮은순', '가격높은순', '추천순']

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
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
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
    if (searchQuery.value.trim()) params.keyword = searchQuery.value.trim()

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
  <div class="flex flex-col bg-paper-dots">
    <!-- 히어로 -->
    <div class="px-4 md:px-6 py-6 md:py-8">
      <div class="max-w-2xl mx-auto">
        <p class="font-bold text-3xl text-ink mb-4">중고 거래</p>
        <div class="flex gap-2">
          <!-- 검색바 -->
          <div
            class="flex-1 flex items-center bg-white rounded-xl border-2 border-ink px-3 gap-2 shadow-[3px_3px_0_#1c1712]"
          >
            <MagnifyingGlassIcon class="w-5 h-5 text-[#8c7e6e] shrink-0" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="검색어를 입력해주세요"
              class="flex-1 py-3 text-sm outline-none bg-transparent text-ink placeholder:text-[#8c7e6e]"
              @keyup.enter="searchSubmit"
            />
          </div>
          <!-- 정렬 필터 -->
          <div ref="dropdownRef" class="relative">
            <button
              @click="showSortDropdown = !showSortDropdown"
              class="sort-btn h-full px-4 bg-white rounded-xl border-2 border-ink font-bold text-sm flex items-center gap-1.5 shadow-[3px_3px_0_#1c1712] whitespace-nowrap transition-all"
            >
              <AdjustmentsHorizontalIcon class="w-4 h-4" />
              {{ sortBy }}
            </button>
            <div
              v-if="showSortDropdown"
              class="absolute right-0 top-full mt-1 bg-white border-2 border-ink rounded-xl shadow-[3px_3px_0_#1c1712] z-10 overflow-hidden"
            >
              <button
                v-for="option in sortOptions"
                :key="option"
                @click="selectSort(option)"
                :class="sortBy === option ? 'bg-[#ffe066] text-ink font-bold' : 'text-ink hover:bg-primary/10'"
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
        :key="category.id"
        @click="selectedCategoryId = category.id"
        :class="
          selectedCategoryId === category.id
            ? 'bg-primary text-white border-ink shadow-[2px_2px_0_#1c1712]'
            : 'bg-white text-ink border-[#c8bca8] hover:border-ink'
        "
        class="shrink-0 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border-2"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- 본문 -->
    <div class="flex w-full mx-auto items-start px-4 md:px-6 py-6 md:py-8 gap-6">
      <!-- PC 사이드바 -->
      <div
        class="hidden md:block border-2 border-ink rounded-2xl p-4 w-56 shrink-0 sticky top-20 self-start bg-white shadow-[4px_4px_0_#1c1712]"
      >
        <p class="font-bold text-lg text-ink px-4 pt-4 pb-2">카테고리</p>
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
