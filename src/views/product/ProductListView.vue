<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/vue/24/outline'
import ProductCard from '@/components/product/ProductCard.vue'
import { productApi } from '@/api/productApi'
import { categoryApi } from '@/api/categoryApi'
import { useAuthStore } from '@/stores/auth'

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
const showAvailableOnly = ref(false)
const authStore = useAuthStore()
const dropdownRef = ref(null)
const sortParamMap = {
  최신순: null,
  가격낮은순: 'price,asc',
  가격높은순: 'price,desc',
  추천순: 'favoriteCount,desc',
}

const sortOptions = ['최신순', '가격낮은순', '가격높은순', '추천순']
const saleStatusMap = { available: '판매중', reserved: '거래중', sold: '거래완료' }

onMounted(() => {
  fetchCategories()
  fetchProducts()
  if (authStore.isLoggedIn && authStore.user?.id) fetchFavorites()
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
    const params = { page: currentPage.value - 1, size: 10 }
    if (selectedCategoryId.value !== null) {
      params.categoryId = selectedCategoryId.value
    }
    if (showAvailableOnly.value) {
      params.saleStatus = 'available'
    }
    if (sortParamMap[sortBy.value]) params.sort = sortParamMap[sortBy.value]

    const { data } = await productApi.getProducts(params)
    products.value = data.content.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      image: p.thumbnailUrl ?? 'https://placehold.co/400x300?text=No+Image',
      status: saleStatusMap[p.saleStatus] ?? p.saleStatus,
      views: p.views ?? 0,
      favoriteCount: p.favoriteCount,
    }))
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
    isLiked ? await productApi.removeFavorite(id) : await productApi.addFavorite(id)
  } catch (e) {
    likedIds.value = isLiked ? [...likedIds.value, id] : likedIds.value.filter((i) => i !== id)
    console.error('찜 변경 실패', e)
  }
}
const fetchFavorites = async () => {
  try {
    const { data } = await productApi.getFavorites(authStore.user.id)
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

watch(showAvailableOnly, () => {
  currentPage.value = 1
  fetchProducts()
})

watch(currentPage, fetchProducts)

const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) return products.value
  const q = searchQuery.value.toLowerCase()
  return products.value.filter((p) => p.title.toLowerCase().includes(q))
})
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
          <div ref="dropdownRef" class="relative">
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
                @click="selectSort(option)"
                :class="
                  sortBy === option ? 'bg-primary/10 text-primary font-semibold' : 'text-text-main hover:bg-gray-50'
                "
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
        :class="selectedCategoryId === category.id ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600'"
        class="shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition"
      >
        {{ category.name }}
      </button>
    </div>
    <!-- 본문 -->
    <div class="flex w-full mx-auto items-start px-6 py-8 gap-6">
      <!-- PC 사이드바 -->
      <div class="side hidden md:block border border-border rounded-2xl p-4 w-56 shrink-0 sticky top-20 self-start">
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
            :key="category.id"
            @click="selectedCategoryId = category.id"
            :class="
              selectedCategoryId === category.id ? 'bg-primary text-white shadow' : 'hover:bg-primary/10 text-text-main'
            "
            class="mx-2 my-2 px-4 py-2 cursor-pointer rounded-lg"
          >
            {{ category.name }}
          </li>
        </ul>
      </div>

      <!-- 상품 목록 -->
      <div class="flex-1 flex flex-col px-4">
        <!-- 검색 결과 없음 -->
        <p v-if="isLoading" class="text-center text-text-sub py-20">불러오는 중...</p>
        <p v-else-if="filteredProducts.length === 0" class="text-center text-text-sub py-20">검색 결과가 없습니다.</p>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            :liked="likedIds.includes(product.id)"
            @toggle-like="toggleLike"
          />
        </div>

        <div class="flex justify-center items-center gap-3 mt-8 mb-4">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            :class="
              currentPage === page ? 'bg-primary text-white' : 'border border-border text-text-main hover:bg-primary/10'
            "
            class="min-w-10 h-10 px-3 rounded-xl font-semibold text-sm transition-colors duration-200 flex items-center justify-center"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
