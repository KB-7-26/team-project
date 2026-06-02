<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productApi } from '@/api/productApi'
import { chatApi } from '@/api/chatApi'
import { useAuthStore } from '@/stores/auth'
import {
  HeartIcon,
  ShareIcon,
  EyeIcon,
  ClockIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const product = ref(null)
const liked = ref(false)
const currentIndex = ref(0)
const isLoading = ref(true)
const recentlyViewed = ref([])

const saleStatusMap = { available: '판매중', reserved: '거래중', sold: '거래완료' }
const conditionMap = { NEW: '새상품', USED: '중고' }

function timeAgo(dateString) {
  if (!dateString) return ''
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

let autoSlideTimer = null

function startAutoSlide() {
  clearInterval(autoSlideTimer)
  if (product.value?.imageUrls.length > 1) {
    autoSlideTimer = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % product.value.imageUrls.length
    }, 8000)
  }
}

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + product.value.imageUrls.length) % product.value.imageUrls.length
  startAutoSlide()
}
const next = () => {
  currentIndex.value = (currentIndex.value + 1) % product.value.imageUrls.length
  startAutoSlide()
}

async function startChat() {
  const { data } = await chatApi.createChatRoom(product.value.id)
  router.push(`/chats/${data.chatRoomId}`)
}

const toggleLike = async () => {
  if (!authStore.isLoggedIn) return
  const prev = liked.value
  liked.value = !liked.value
  try {
    prev ? await productApi.removeFavorite(product.value.id) : await productApi.addFavorite(product.value.id)
  } catch {
    liked.value = prev
  }
}

async function loadProduct() {
  try {
    const { data } = await productApi.getProduct(route.params.id)
    if (!data.imageUrls || data.imageUrls.length === 0) {
      data.imageUrls = ['https://placehold.co/600x450?text=No+Image']
    }
    product.value = data
    startAutoSlide()

    const TWELVE_HOURS = 12 * 60 * 60 * 1000
    const current = {
      id: data.id,
      title: data.title,
      price: data.price,
      image: data.imageUrls[0],
      viewedAt: Date.now(),
    }
    const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    const fresh = stored.filter((p) => Date.now() - (p.viewedAt ?? 0) < TWELVE_HOURS)
    const updated = [current, ...fresh.filter((p) => String(p.id) !== String(data.id))].slice(0, 5)
    localStorage.setItem('recentlyViewed', JSON.stringify(updated))
    recentlyViewed.value = updated.filter((p) => String(p.id) !== String(data.id)).slice(0, 2)
  } catch (e) {
    console.error('상품 상세 조회 실패', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadProduct)
onBeforeUnmount(() => clearInterval(autoSlideTimer))
watch(() => route.params.id, () => {
  clearInterval(autoSlideTimer)
  currentIndex.value = 0
  isLoading.value = true
  product.value = null
  loadProduct()
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 pt-4 pb-8">

    <!-- 뒤로가기 -->
    <button @click="router.back()" class="mb-4 p-1 -ml-1 rounded-lg hover:bg-gray-100 transition cursor-pointer">
      <ChevronLeftIcon class="w-6 h-6 text-text-main" />
    </button>

    <p v-if="isLoading" class="text-center text-text-sub py-20">불러오는 중...</p>
    <p v-else-if="!product" class="text-center text-text-sub py-20">상품을 찾을 수 없습니다.</p>

    <template v-else>
      <!-- 이미지 + 판매자 카드 (데스크탑: 좌우 / 모바일: 이미지만) -->
      <div class="lg:flex lg:gap-6 mb-6">

        <!-- 이미지 갤러리 -->
        <div class="flex-1 min-w-0">
          <div class="relative rounded-2xl overflow-hidden bg-gray-100">
            <Transition name="fade" mode="out-in">
              <img :key="currentIndex" :src="product.imageUrls[currentIndex]" :alt="product.title" class="w-full h-72 lg:h-96 object-cover" />
            </Transition>
            <span class="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
              {{ currentIndex + 1 }} / {{ product.imageUrls.length }}
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
              v-for="(img, i) in product.imageUrls"
              :key="i"
              @click="currentIndex = i"
              :class="currentIndex === i ? 'ring-2 ring-primary opacity-100' : 'opacity-50 hover:opacity-100 hover:ring-2 hover:ring-gray-300 cursor-pointer'"
              class="w-16 h-16 rounded-xl overflow-hidden shrink-0 transition-all duration-150"
            >
              <img :src="img" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- 판매자 카드 (데스크탑만) -->
        <div class="hidden lg:flex lg:w-60 shrink-0 self-start sticky top-20">
          <div class="w-full border border-border rounded-2xl p-5 flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <img
                v-if="product.sellerProfileImageUrl"
                :src="product.sellerProfileImageUrl"
                class="w-11 h-11 rounded-full object-cover shrink-0"
              />
              <div v-else class="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
                {{ product.sellerNickname?.[0] }}
              </div>
              <div>
                <p class="font-bold text-text-main">{{ product.sellerNickname }}</p>
              </div>
            </div>
            <button
              v-if="authStore.user?.id === product.sellerId"
              @click="router.push(`/product/edit/${product.id}`)"
              class="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl text-sm hover:bg-primary/90 active:scale-95 transition-all duration-150 cursor-pointer shadow-md hover:shadow-lg"
            >
              <PencilSquareIcon class="w-5 h-5" />
              상품 수정
            </button>
            <button
              v-else
              @click="startChat"
              class="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl text-sm hover:bg-primary/90 active:scale-95 transition-all duration-150 cursor-pointer shadow-md hover:shadow-lg"
            >
              <ChatBubbleOvalLeftEllipsisIcon class="w-5 h-5" />
              채팅하기
            </button>
            <!-- 최근 본 상품 -->
            <div class="border-t border-border pt-4">
              <p class="text-sm font-bold text-text-main mb-2">📌 최근 본 상품</p>
              <p v-if="recentlyViewed.length === 0" class="text-xs text-text-sub text-center py-2">아직 본 상품이 없어요</p>
              <div v-else class="flex flex-col gap-1">
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
          <span class="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{{ product.categoryName }}</span>
          <div class="flex gap-3">
            <button @click="toggleLike">
              <HeartSolidIcon v-if="liked" class="w-6 h-6 text-red-500" />
              <HeartIcon v-else class="w-6 h-6 text-text-sub" />
            </button>
            <button>
              <ShareIcon class="w-6 h-6 text-text-sub" />
            </button>
          </div>
        </div>
        <h1 class="text-xl font-bold text-text-main mb-2">{{ product.title }}</h1>
        <p class="text-2xl font-extrabold text-primary mb-4">
          {{ product.isFree ? '무료나눔' : `${product.price.toLocaleString()}원` }}
        </p>
        <div class="flex items-center gap-4 text-text-sub text-sm mb-6">
          <span class="flex items-center gap-1"><EyeIcon class="w-4 h-4" /> 조회 {{ product.viewCount }}</span>
          <span class="flex items-center gap-1"><HeartIcon class="w-4 h-4" /> {{ product.favoriteCount }}</span>
          <span class="flex items-center gap-1"><ClockIcon class="w-4 h-4" /> {{ timeAgo(product.createdAt) }}</span>
        </div>
        <table class="w-full text-sm mb-6">
          <tbody class="divide-y divide-border">
            <tr>
              <td class="py-3 text-text-sub w-24">상태</td>
              <td class="py-3 text-text-main font-medium">{{ conditionMap[product.productCondition] ?? product.productCondition }}</td>
            </tr>
            <tr>
              <td class="py-3 text-text-sub">거래상태</td>
              <td class="py-3 text-text-main font-medium">{{ saleStatusMap[product.saleStatus] ?? product.saleStatus }}</td>
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
          <img
            v-if="product.sellerProfileImageUrl"
            :src="product.sellerProfileImageUrl"
            class="w-11 h-11 rounded-full object-cover shrink-0"
          />
          <div v-else class="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
            {{ product.sellerNickname?.[0] }}
          </div>
          <div>
            <p class="font-bold text-text-main">{{ product.sellerNickname }}</p>
          </div>
        </div>
        <button
          v-if="authStore.user?.id === product.sellerId"
          @click="router.push(`/product/edit/${product.id}`)"
          class="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl text-sm hover:bg-primary/90 active:scale-95 transition-all duration-150 cursor-pointer shadow-md hover:shadow-lg"
        >
          <PencilSquareIcon class="w-5 h-5" />
          상품 수정
        </button>
        <button
          v-else
          @click="startChat"
          class="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl text-sm hover:bg-primary/90 active:scale-95 transition-all duration-150 cursor-pointer shadow-md hover:shadow-lg"
        >
          <ChatBubbleOvalLeftEllipsisIcon class="w-5 h-5" />
          채팅하기
        </button>
      </div>
    </template>

  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
