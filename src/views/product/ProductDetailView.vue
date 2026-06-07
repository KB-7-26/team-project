<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productApi } from '@/api/productApi'
import { chatApi } from '@/api/chatApi'
import { useAuthStore } from '@/stores/auth'
import { saleStatusMap } from '@/utils/product'
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
  TrashIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import UserProfileAvatar from '@/components/user/UserProfileAvatar.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const product = ref(null)
const liked = ref(false)
const currentIndex = ref(0)
const isLoading = ref(true)
const recentlyViewed = ref([])
const showSoldConfirm = ref(false)
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)
const pcProfileRef = ref(null)
const mobileProfileRef = ref(null)

async function deleteProduct() {
  if (isDeleting.value) return
  isDeleting.value = true
  try {
    await productApi.deleteProduct(product.value.id)
    router.replace('/products')
  } catch (e) {
    console.error('상품 삭제 실패', e)
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
  }
}

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

async function toggleStatus(status) {
  try {
    await productApi.updateStatus(product.value.id, status)
    product.value.saleStatus = status
  } catch (e) {
    console.error('거래 상태 변경 실패', e)
  }
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
    await productApi.toggleFavorite(product.value.id)
  } catch {
    liked.value = prev
  }
}

async function loadProduct() {
  try {
    const { data } = await productApi.getProduct(route.params.id)
    data.imageUrls = (data.images || []).map((img) => img.imageUrl)
    if (data.imageUrls.length === 0) {
      data.imageUrls = [`https://picsum.photos/seed/${data.id}/600/450`]
    }
    product.value = data
    startAutoSlide()

    if (authStore.isLoggedIn) {
      const { data: favorites } = await productApi.getMyFavorites()
      liked.value = favorites.some((p) => p.id === data.id)
    }

    const TWELVE_HOURS = 12 * 60 * 60 * 1000
    const current = {
      id: data.id,
      title: data.title,
      price: data.price,
      isFree: data.isFree,
      image: data.imageUrls[0],
      status: data.saleStatus === 'sold' ? '판매완료' : '판매중',
      views: data.viewCount ?? 0,
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

function handleKeydown(e) {
  if (e.key !== 'Escape') return
  if (showDeleteConfirm.value) { showDeleteConfirm.value = false; return }
  if (showSoldConfirm.value) { showSoldConfirm.value = false; return }
}

onMounted(() => {
  loadProduct()
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  clearInterval(autoSlideTimer)
  window.removeEventListener('keydown', handleKeydown)
})
watch(() => route.params.id, () => {
  clearInterval(autoSlideTimer)
  currentIndex.value = 0
  isLoading.value = true
  product.value = null
  loadProduct()
})
</script>

<template>
  <div class="bg-paper-dots min-h-screen">
    <div class="max-w-4xl mx-auto px-4 pt-4 pb-12">

      <!-- 상단 네비게이션 -->
      <div class="flex items-center justify-between mb-5">
        <button
          @click="router.back()"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-ink rounded-xl text-sm text-ink shadow-[2px_2px_0_#1c1712] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          <ChevronLeftIcon class="w-4 h-4" />
          뒤로
        </button>
        <div v-if="product && authStore.user?.id === product.sellerId" class="flex bg-white border-2 border-ink rounded-xl overflow-hidden shadow-[2px_2px_0_#1c1712] text-sm font-bold">
          <button
            @click="toggleStatus('available')"
            :class="product.saleStatus === 'available' ? 'bg-[#ffe066] text-ink' : 'text-[#8c7e6e] hover:bg-primary/10'"
            class="px-3 py-1.5 transition"
          >판매중</button>
          <button
            @click="showSoldConfirm = true"
            :class="product.saleStatus === 'sold' ? 'bg-[#ffe066] text-ink' : 'text-[#8c7e6e] hover:bg-primary/10'"
            class="px-3 py-1.5 border-l-2 border-ink transition"
          >판매완료</button>
        </div>
      </div>

      <p v-if="isLoading" class="text-center text-[#8c7e6e] py-20">불러오는 중...</p>
      <p v-else-if="!product" class="text-center text-[#8c7e6e] py-20">상품을 찾을 수 없습니다.</p>

      <template v-else>
        <!-- 이미지 + 판매자 카드 -->
        <div class="lg:flex lg:gap-6 mb-6">

          <!-- 이미지 갤러리 -->
          <div class="flex-1 min-w-0">
            <div class="relative border-2 border-ink rounded-2xl overflow-hidden bg-gray-100 shadow-[4px_4px_0_#1c1712]">
              <Transition name="fade" mode="out-in">
                <img :key="currentIndex" :src="product.imageUrls[currentIndex]" :alt="product.title" class="w-full h-72 lg:h-96 object-cover" />
              </Transition>
              <span class="absolute bottom-3 right-3 bg-ink text-white text-xs px-2.5 py-1 rounded-full">
                {{ currentIndex + 1 }} / {{ product.imageUrls.length }}
              </span>
              <button @click="prev" class="slide-btn absolute left-3 top-1/2 -translate-y-1/2 bg-white border-2 border-ink rounded-full p-1.5 shadow-[2px_2px_0_#1c1712] transition-all">
                <ChevronLeftIcon class="w-5 h-5 text-ink" />
              </button>
              <button @click="next" class="slide-btn absolute right-3 top-1/2 -translate-y-1/2 bg-white border-2 border-ink rounded-full p-1.5 shadow-[2px_2px_0_#1c1712] transition-all">
                <ChevronRightIcon class="w-5 h-5 text-ink" />
              </button>
            </div>
            <div class="flex gap-2 mt-3 overflow-x-auto no-scrollbar justify-center">
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

          <!-- 판매자 카드 (PC) -->
          <div class="hidden lg:flex lg:w-60 shrink-0 self-start sticky top-20 flex-col gap-4">
            <!-- 판매자 정보 -->
            <div class="w-full bg-white border-2 border-ink rounded-2xl p-5 shadow-[4px_4px_0_#1c1712] flex flex-col gap-4">
              <div class="flex items-center gap-3">
                <UserProfileAvatar
                  ref="pcProfileRef"
                  :userId="product.sellerId"
                  :nickname="product.sellerNickname"
                  :imageUrl="product.sellerProfileImageUrl"
                />
                <p class="font-bold text-ink">{{ product.sellerNickname }}</p>
              </div>
              <template v-if="authStore.user?.id === product.sellerId">
                <button
                  @click="router.replace(`/product/edit/${product.id}`)"
                  class="action-btn flex items-center justify-center gap-2 bg-primary border-2 border-ink text-white font-bold py-3 rounded-xl text-sm shadow-[3px_3px_0_#1c1712] transition-all"
                >
                  <PencilSquareIcon class="w-5 h-5" />
                  상품 수정
                </button>
                <button
                  @click="showDeleteConfirm = true"
                  class="action-btn flex items-center justify-center gap-2 bg-white border-2 border-red-400 text-red-500 font-bold py-3 rounded-xl text-sm shadow-[3px_3px_0_rgba(239,68,68,0.35)] transition-all"
                >
                  <TrashIcon class="w-5 h-5" />
                  상품 삭제
                </button>
              </template>
              <template v-else>
                <button
                  @click="pcProfileRef.openProfile()"
                  class="action-btn flex items-center justify-center gap-2 bg-white border-2 border-ink text-ink font-bold py-3 rounded-xl text-sm shadow-[3px_3px_0_#1c1712] transition-all"
                >
                  <UserIcon class="w-5 h-5" />
                  프로필 보기
                </button>
                <button
                  @click="startChat"
                  class="action-btn flex items-center justify-center gap-2 bg-[#ffe066] border-2 border-ink text-ink font-bold py-3 rounded-xl text-sm shadow-[3px_3px_0_#1c1712] transition-all"
                >
                  <ChatBubbleOvalLeftEllipsisIcon class="w-5 h-5" />
                  채팅하기
                </button>
              </template>
            </div>
            <!-- 최근 본 상품 -->
            <div class="w-full bg-white border-2 border-ink rounded-2xl p-5 shadow-[4px_4px_0_#1c1712]">
              <p class="font-bold text-ink text-sm mb-2">📌 최근 본 상품</p>
              <p v-if="recentlyViewed.length === 0" class="text-xs text-[#8c7e6e] text-center py-2">아직 본 상품이 없어요</p>
              <div v-else class="flex flex-col gap-1">
                <RouterLink
                  v-for="item in recentlyViewed"
                  :key="item.id"
                  :to="`/products/${item.id}`"
                  class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-primary/10 transition"
                >
                  <img :src="item.image" class="w-10 h-10 rounded-lg object-cover shrink-0 border border-ink" />
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-ink line-clamp-2 leading-snug">{{ item.title }}</p>
                    <span :class="['font-bold text-xs mt-0.5 inline-block px-1.5 py-0.5 rounded', item.isFree ? 'bg-[#96d4b4]' : 'bg-[#ffe066]']">
                      {{ item.isFree ? '무료나눔' : `${item.price.toLocaleString()}원` }}
                    </span>
                  </div>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- 상품 정보 카드 -->
        <div class="bg-white border-2 border-ink rounded-2xl p-6 mb-4 shadow-[4px_4px_0_#1c1712]">
          <div class="flex items-start justify-between mb-3">
            <span class="font-bold text-xs bg-[#ffe066] text-ink border border-ink px-3 py-1 rounded-full">{{ product.categoryName }}</span>
            <div class="flex gap-2">
              <button
                @click="toggleLike"
                class="p-1.5 bg-white border-2 border-ink rounded-full shadow-[2px_2px_0_#1c1712] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <HeartSolidIcon v-if="liked" class="w-5 h-5 text-red-500" />
                <HeartIcon v-else class="w-5 h-5 text-[#8c7e6e]" />
              </button>
              <button class="p-1.5 bg-white border-2 border-ink rounded-full shadow-[2px_2px_0_#1c1712] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                <ShareIcon class="w-5 h-5 text-[#8c7e6e]" />
              </button>
            </div>
          </div>

          <h1 class="font-bold text-2xl text-ink mb-3 leading-snug">{{ product.title }}</h1>

          <p class="mb-4">
            <span :class="['font-bold text-3xl inline-block px-3 py-1 rounded rotate-[-0.5deg]', product.isFree ? 'bg-[#96d4b4]/50' : 'bg-[#ffe066]/50']">
              {{ product.isFree ? '무료나눔' : `${product.price.toLocaleString()}원` }}
            </span>
          </p>

          <div class="flex items-center gap-4 text-sm text-[#8c7e6e]">
            <span class="flex items-center gap-1"><EyeIcon class="w-4 h-4" /> {{ product.viewCount }}</span>
            <span class="flex items-center gap-1"><HeartIcon class="w-4 h-4" /> {{ product.favoriteCount }}</span>
            <span class="flex items-center gap-1"><ClockIcon class="w-4 h-4" /> {{ timeAgo(product.createdAt) }}</span>
          </div>
        </div>

        <!-- 상품 설명 카드 -->
        <div class="bg-white border-2 border-ink rounded-2xl p-6 mb-4 shadow-[4px_4px_0_#1c1712]">
          <table class="w-full text-sm mb-6">
            <tbody>
              <tr class="border-t-2 border-[#c8bca8]">
                <td class="py-3 text-[#8c7e6e] w-24">상태</td>
                <td class="py-3 font-bold text-ink">{{ conditionMap[product.productCondition] ?? product.productCondition }}</td>
              </tr>
              <tr class="border-t border-[#c8bca8]">
                <td class="py-3 text-[#8c7e6e]">거래상태</td>
                <td class="py-3 font-bold text-ink">{{ saleStatusMap[product.saleStatus] ?? product.saleStatus }}</td>
              </tr>
              <tr class="border-t border-[#c8bca8]">
                <td class="py-3 text-[#8c7e6e]">위치</td>
                <td class="py-3 font-bold text-ink">
                  <span class="flex items-center gap-1"><MapPinIcon class="w-4 h-4 text-[#8c7e6e]" />{{ product.location || '미입력' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="font-bold text-ink mb-3">상품 설명</p>
          <p class="text-sm text-ink whitespace-pre-line leading-relaxed">{{ product.description }}</p>
        </div>

        <!-- 판매자 카드 (모바일) -->
        <div class="lg:hidden bg-white border-2 border-ink rounded-2xl p-5 shadow-[4px_4px_0_#1c1712] flex flex-col gap-4 mb-6">
          <div class="flex items-center gap-3">
            <UserProfileAvatar
              ref="mobileProfileRef"
              :userId="product.sellerId"
              :nickname="product.sellerNickname"
              :imageUrl="product.sellerProfileImageUrl"
            />
            <p class="font-bold text-ink">{{ product.sellerNickname }}</p>
          </div>
          <template v-if="authStore.user?.id === product.sellerId">
            <button
              @click="router.replace(`/product/edit/${product.id}`)"
              class="action-btn flex items-center justify-center gap-2 bg-primary border-2 border-ink text-white font-bold py-3 rounded-xl text-sm shadow-[3px_3px_0_#1c1712] transition-all"
            >
              <PencilSquareIcon class="w-5 h-5" />
              상품 수정
            </button>
            <button
              @click="showDeleteConfirm = true"
              class="action-btn flex items-center justify-center gap-2 bg-white border-2 border-red-400 text-red-500 font-bold py-3 rounded-xl text-sm shadow-[3px_3px_0_rgba(239,68,68,0.35)] transition-all"
            >
              <TrashIcon class="w-5 h-5" />
              상품 삭제
            </button>
          </template>
          <template v-else>
            <button
              @click="mobileProfileRef.openProfile()"
              class="action-btn flex items-center justify-center gap-2 bg-white border-2 border-ink text-ink font-bold py-3 rounded-xl text-sm shadow-[3px_3px_0_#1c1712] transition-all"
            >
              <UserIcon class="w-5 h-5" />
              프로필 보기
            </button>
            <button
              @click="startChat"
              class="action-btn flex items-center justify-center gap-2 bg-[#ffe066] border-2 border-ink text-ink font-bold py-3 rounded-xl text-sm shadow-[3px_3px_0_#1c1712] transition-all"
            >
              <ChatBubbleOvalLeftEllipsisIcon class="w-5 h-5" />
              채팅하기
            </button>
          </template>
        </div>

        <!-- 최근 본 상품 (모바일) -->
        <div class="lg:hidden bg-white border-2 border-ink rounded-2xl p-5 shadow-[4px_4px_0_#1c1712]">
          <p class="font-bold text-ink text-sm mb-2">📌 최근 본 상품</p>
          <p v-if="recentlyViewed.length === 0" class="text-xs text-[#8c7e6e] text-center py-2">아직 본 상품이 없어요</p>
          <div v-else class="flex flex-col gap-1">
            <RouterLink
              v-for="item in recentlyViewed"
              :key="item.id"
              :to="`/products/${item.id}`"
              class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-primary/10 transition"
            >
              <img :src="item.image" class="w-10 h-10 rounded-lg object-cover shrink-0 border border-ink" />
              <div class="flex-1 min-w-0">
                <p class="text-xs text-ink line-clamp-2 leading-snug">{{ item.title }}</p>
                <span :class="['font-bold text-xs mt-0.5 inline-block px-1.5 py-0.5 rounded', item.isFree ? 'bg-[#96d4b4]' : 'bg-[#ffe066]']">
                  {{ item.isFree ? '무료나눔' : `${item.price.toLocaleString()}원` }}
                </span>
              </div>
            </RouterLink>
          </div>
        </div>

      </template>
    </div>

    <!-- 상품 삭제 확인 모달 -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40" @click.self="showDeleteConfirm = false">
        <div class="bg-white border-2 border-ink rounded-2xl shadow-[6px_6px_0_#1c1712] p-6 w-80 flex flex-col gap-4">
          <p class="font-bold text-ink text-lg">상품을 삭제할까요?</p>
          <p class="text-sm text-[#8c7e6e] -mt-2">삭제한 상품은 복구할 수 없어요.</p>
          <div class="flex gap-3">
            <button
              @click="showDeleteConfirm = false"
              class="flex-1 py-2.5 rounded-xl border-2 border-ink font-bold text-sm text-ink hover:bg-gray-50 transition shadow-[2px_2px_0_#1c1712]"
            >취소</button>
            <button
              @click="deleteProduct"
              :disabled="isDeleting"
              class="flex-1 py-2.5 rounded-xl bg-red-500 border-2 border-red-700 font-bold text-sm text-white hover:bg-red-600 transition shadow-[2px_2px_0_rgba(185,28,28,0.5)] disabled:opacity-50"
            >{{ isDeleting ? '삭제 중...' : '삭제' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 판매완료 확인 모달 -->
    <Teleport to="body">
      <div v-if="showSoldConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40" @click.self="showSoldConfirm = false">
        <div class="bg-white border-2 border-ink rounded-2xl shadow-[6px_6px_0_#1c1712] p-6 w-80 flex flex-col gap-4">
          <p class="font-bold text-ink text-lg">판매완료로 변경할까요?</p>
          <p class="text-sm text-[#8c7e6e] -mt-2">변경 후에도 다시 판매중으로 되돌릴 수 있어요.</p>
          <div class="flex gap-3">
            <button
              @click="showSoldConfirm = false"
              class="flex-1 py-2.5 rounded-xl border-2 border-ink font-bold text-sm text-ink hover:bg-gray-50 transition shadow-[2px_2px_0_#1c1712]"
            >취소</button>
            <button
              @click="() => { toggleStatus('sold'); showSoldConfirm = false }"
              class="flex-1 py-2.5 rounded-xl bg-[#ffe066] border-2 border-ink font-bold text-sm text-ink hover:bg-primary/20 transition shadow-[2px_2px_0_#1c1712]"
            >확인</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.action-btn:hover { transform: translate(2px, 2px); box-shadow: none !important; }
.action-btn:active { transform: translate(3px, 3px); }

.slide-btn:active { transform: translateY(-50%) translate(2px, 2px); box-shadow: none; }
</style>
