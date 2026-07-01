<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  AcademicCapIcon,
  ArchiveBoxIcon,
  CalendarDaysIcon,
  CameraIcon,
  ChatBubbleOvalLeftIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  CubeIcon,
  EnvelopeIcon,
  HeartIcon,
  IdentificationIcon,
  PencilSquareIcon,
  ShoppingBagIcon,
  TrashIcon,
  UserCircleIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import ProductCard from '@/components/product/ProductCard.vue'
import BoardPostCard from '@/components/board/BoardPostCard.vue'
import ReauthModal from '@/components/user/ReauthModal.vue'
import TrustBadge from '@/components/user/TrustBadge.vue'
import { productApi } from '@/api/productApi'
import { useAuthStore } from '@/stores/auth'
import { userBoardActivityApi } from '@/api/userBoardActivityApi'
import { userProfileApi } from '@/api/userProfileApi'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'MyPageView',
})

const authStore = useAuthStore()
const router = useRouter()
const selectedMenu = ref('profile')
const isMobileMenuOpen = ref(false)
const selectedSaleStatus = ref('all')
const likedIds = ref(new Set())
const isProfileEditModalOpen = ref(false)
const serverProfile = ref(null)
const isProfileLoading = ref(false)
const isProfileSaving = ref(false)
const profileEditError = ref('')
const profileEditSuccess = ref('')
const isPasswordChangeModalOpen = ref(false)
const passwordChangeSuccess = ref('')
const boardActivityPosts = ref([])
const boardActivityCurrentPage = ref(0)
const boardActivityTotalPages = ref(0)
const isBoardActivityLoading = ref(false)
const boardActivityError = ref('')
const mySaleProducts = ref([])
const saleCurrentPage = ref(0)
const saleTotalPages = ref(0)
const isSalesLoading = ref(false)
const salesError = ref('')
const myPurchaseProducts = ref([])
const purchaseCurrentPage = ref(0)
const purchaseTotalPages = ref(0)
const isPurchasesLoading = ref(false)
const purchasesError = ref('')
const myFavoriteProducts = ref([])
const favCurrentPage = ref(0)
const isFavoritesLoading = ref(false)
const favoritesError = ref('')

const FAV_PAGE_SIZE = 6
const favTotalPages = computed(() => Math.ceil(myFavoriteProducts.value.length / FAV_PAGE_SIZE))
const paginatedFavoriteProducts = computed(() => {
  const start = favCurrentPage.value * FAV_PAGE_SIZE
  return myFavoriteProducts.value.slice(start, start + FAV_PAGE_SIZE)
})

const makeVisiblePages = (currentPage, totalPages) => {
  const blockStart = Math.floor(currentPage / 5) * 5 + 1
  const blockEnd = Math.min(blockStart + 4, totalPages)
  const pages = []
  for (let i = blockStart; i <= blockEnd; i++) pages.push(i)
  return pages
}
const saleVisiblePages = computed(() => makeVisiblePages(saleCurrentPage.value, saleTotalPages.value))
const purchaseVisiblePages = computed(() => makeVisiblePages(purchaseCurrentPage.value, purchaseTotalPages.value))
const favVisiblePages = computed(() => makeVisiblePages(favCurrentPage.value, favTotalPages.value))
const profileImageInput = ref(null)
const profileEditImageFile = ref(null)
const isProfileImageRemoved = ref(false)
const profileEditImagePreview = ref('')
const profileEditObjectUrl = ref('')
const profileEditForm = ref({
  nickname: '',
})

const currentUser = computed(() => authStore.user)
const firebaseUser = computed(() => authStore.firebaseUser)
const firebaseProviderIds = computed(
  () => firebaseUser.value?.providerData?.map((provider) => provider.providerId) ?? [],
)
const isEmailPasswordAccount = computed(() => firebaseProviderIds.value.includes('password'))
const isGoogleAccount = computed(() => firebaseProviderIds.value.includes('google.com'))
const passwordActionLabel = computed(() => {
  if (isEmailPasswordAccount.value) return '변경하기'
  if (isGoogleAccount.value) return '구글로 가입한 계정'
  return '비밀번호 변경 불가'
})

const fallbackProfile = {
  name: '김민수',
  nickname: '스왑러 민수',
  email: 'minsu.swap@example.com',
  cohort: 'KB IT 5기',
  gender: 'M',
  trustScore: 50,
  isVerified: true,
  createdAt: '2026-03-18T10:30:00',
}

const normalizeProfileImageUrl = (value) => (typeof value === 'string' ? value.trim() : '')

const formatDate = (value) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

const genderLabel = (value) => {
  if (value === 'M') return '남성'
  if (value === 'F') return '여성'
  return value || '-'
}

const profileData = computed(() => {
  const user = serverProfile.value || currentUser.value || {}

  return {
    name: user.name || fallbackProfile.name,
    nickname: user.nickname || fallbackProfile.nickname,
    email: user.email || firebaseUser.value?.email || fallbackProfile.email,
    profileImageUrl: normalizeProfileImageUrl(user.profileImageUrl),
    cohort: user.cohort || fallbackProfile.cohort,
    gender: user.gender || fallbackProfile.gender,
    trustScore: user.trustScore ?? fallbackProfile.trustScore,
    isVerified: user.isVerified ?? fallbackProfile.isVerified,
    createdAt: user.createdAt || fallbackProfile.createdAt,
    stats: user.stats,
  }
})

const profileImageUrl = computed(() => profileData.value.profileImageUrl)
const profile = computed(() => ({
  name: profileData.value.name,
  nickname: profileData.value.nickname,
  cohort: profileData.value.cohort,
  trustScore: profileData.value.trustScore,
}))

const profileStats = computed(() => [
  { label: '판매중', value: String(profileData.value.stats?.activeProductCount ?? 3), icon: ShoppingBagIcon },
  { label: '판매 완료', value: String(profileData.value.stats?.soldProductCount ?? 12), icon: CubeIcon },
  { label: '찜', value: String(profileData.value.stats?.favoriteCount ?? 24), icon: HeartIcon },
  { label: '게시글', value: String(profileData.value.stats?.postCount ?? 0), icon: PencilSquareIcon },
  { label: '댓글', value: String(profileData.value.stats?.commentCount ?? 0), icon: ChatBubbleOvalLeftIcon },
])

const accountRows = computed(() => [
  { label: '이름', value: profileData.value.name, icon: IdentificationIcon },
  { label: '닉네임', value: profileData.value.nickname, icon: UserIcon },
  { label: '이메일', value: profileData.value.email, icon: EnvelopeIcon },
  { label: '회차', value: profileData.value.cohort, icon: AcademicCapIcon },
  { label: '성별', value: genderLabel(profileData.value.gender), icon: IdentificationIcon },
  { label: '가입일', value: formatDate(profileData.value.createdAt), icon: CalendarDaysIcon },
])

const menuSections = [
  {
    id: 'profile',
    items: [{ id: 'profile', label: '내 프로필', icon: UserIcon }],
  },
  {
    id: 'board',
    title: '낙서판',
    items: [
      { id: 'myPosts', label: '내가 쓴 글', icon: PencilSquareIcon },
      { id: 'commentedPosts', label: '댓글 단 글', icon: ChatBubbleOvalLeftIcon },
      { id: 'likedPosts', label: '좋아요 한 글', icon: HeartIcon },
    ],
  },
  {
    id: 'market',
    title: '낙서장터',
    items: [
      { id: 'sales', label: '판매 목록', icon: ShoppingBagIcon },
      { id: 'purchases', label: '구매 목록', icon: CubeIcon },
      { id: 'favorites', label: '찜 목록', icon: HeartIcon },
    ],
  },
  {
    id: 'settings',
    items: [{ id: 'settings', label: '환경설정', icon: Cog6ToothIcon }],
  },
]

const saleStatusTabs = [
  { label: '전체', value: 'all' },
  { label: '판매중', value: 'available' },
  { label: '판매완료', value: 'sold' },
]

const saleStatusMap = {
  available: '판매중',
  reserved: '거래중',
  sold: '판매완료',
  hidden: '숨김',
}

const boardActivityMenuIds = ['myPosts', 'commentedPosts', 'likedPosts']
const boardActivityDescriptions = {
  myPosts: '내가 작성한 낙서장 글을 모아봅니다',
  commentedPosts: '내가 댓글을 남긴 낙서장 글을 모아봅니다',
  likedPosts: '내가 좋아요한 낙서장 글을 모아봅니다',
}
const boardActivityEmptyMessages = {
  myPosts: '아직 작성한 글이 없습니다',
  commentedPosts: '아직 댓글을 남긴 글이 없습니다',
  likedPosts: '아직 좋아요한 글이 없습니다',
}
const menuItems = computed(() => menuSections.flatMap((section) => section.items))
const activeMenu = computed(() => menuItems.value.find((item) => item.id === selectedMenu.value) || menuItems.value[0])
const isBoardActivityMenu = computed(() => boardActivityMenuIds.includes(selectedMenu.value))
const boardActivityDescription = computed(() => boardActivityDescriptions[selectedMenu.value] || '')
const boardActivityEmptyMessage = computed(
  () => boardActivityEmptyMessages[selectedMenu.value] || '표시할 글이 없습니다',
)
const selectMenu = (menuId) => {
  selectedMenu.value = menuId
  isMobileMenuOpen.value = false
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

const openPasswordChangeModal = () => {
  if (!isEmailPasswordAccount.value) return

  passwordChangeSuccess.value = ''
  isPasswordChangeModalOpen.value = true
}

const closePasswordChangeModal = () => {
  isPasswordChangeModalOpen.value = false
}

const handlePasswordChanged = () => {
  passwordChangeSuccess.value = '비밀번호가 변경되었습니다.'
  closePasswordChangeModal()
}

const navigateFromStat = (index) => {
  if (index === 0) {
    selectedSaleStatus.value = 'available'
    selectMenu('sales')
  } else if (index === 1) {
    selectedSaleStatus.value = 'sold'
    selectMenu('sales')
  } else if (index === 2) {
    selectMenu('favorites')
  } else if (index === 3) {
    selectMenu('myPosts')
  } else if (index === 4) {
    selectMenu('commentedPosts')
  }
}
const mapProductListItem = (product) => ({
  id: product.id,
  title: product.title,
  price: product.price ?? 0,
  isFree: product.isFree,
  image: product.thumbnailUrl || `https://picsum.photos/seed/${product.id}/400/300`,
  status: saleStatusMap[product.saleStatus] ?? product.saleStatus,
  views: product.viewCount ?? 0,
  favoriteCount: product.favoriteCount ?? 0,
})

const syncLikedIdsFromProducts = (products) => {
  likedIds.value = new Set(products.map((product) => product.id))
}

const toggleLike = async (id) => {
  if (!authStore.isLoggedIn) return

  const previousLikedIds = new Set(likedIds.value)
  const nextLikedIds = new Set(likedIds.value)
  const wasLiked = nextLikedIds.has(id)

  if (wasLiked) {
    nextLikedIds.delete(id)
  } else {
    nextLikedIds.add(id)
  }

  likedIds.value = nextLikedIds

  try {
    await productApi.toggleFavorite(id)

    if (selectedMenu.value === 'favorites' && wasLiked) {
      myFavoriteProducts.value = myFavoriteProducts.value.filter((product) => product.id !== id)
    }
  } catch (error) {
    likedIds.value = previousLikedIds

    if (selectedMenu.value === 'favorites') {
      favoritesError.value =
        error.response?.data?.message || '찜 상태를 변경하지 못했습니다. 잠시 후 다시 시도해주세요.'
    }
  }
}

const applyProfileResponse = (profileResponse) => {
  if (!profileResponse) return

  serverProfile.value = profileResponse

  if (authStore.user) {
    authStore.user = {
      ...authStore.user,
      id: profileResponse.id,
      name: profileResponse.name,
      nickname: profileResponse.nickname,
      email: profileResponse.email,
      profileImageUrl: profileResponse.profileImageUrl,
      cohort: profileResponse.cohort,
      gender: profileResponse.gender,
      trustScore: profileResponse.trustScore,
      isVerified: profileResponse.isVerified,
      createdAt: profileResponse.createdAt,
    }
  }
}

const redirectIfProfileRequired = async (error) => {
  if (error.response?.status !== 403) return false

  try {
    await authStore.refreshMe()
  } catch {
    return false
  }

  if (authStore.needsProfile) {
    await router.push('/signup/profile')
    return true
  }

  return false
}

const fetchMyProfile = async () => {
  if (!authStore.isLoggedIn) return

  isProfileLoading.value = true
  try {
    const { data } = await userProfileApi.getMyProfile()
    applyProfileResponse(data.data)
  } catch (error) {
    await redirectIfProfileRequired(error)
  } finally {
    isProfileLoading.value = false
  }
}

const fetchBoardActivityPosts = async (page = 0) => {
  if (!isBoardActivityMenu.value || !authStore.isLoggedIn) return

  isBoardActivityLoading.value = true
  boardActivityError.value = ''

  try {
    const pageData =
      selectedMenu.value === 'myPosts'
        ? await userBoardActivityApi.getMyPosts(page, 10)
        : selectedMenu.value === 'commentedPosts'
          ? await userBoardActivityApi.getMyCommentedPosts(page, 10)
          : await userBoardActivityApi.getMyLikedPosts(page, 10)

    boardActivityPosts.value = pageData.content
    boardActivityTotalPages.value = pageData.totalPages
    boardActivityCurrentPage.value = page
  } catch (error) {
    if (await redirectIfProfileRequired(error)) return

    boardActivityPosts.value = []
    boardActivityTotalPages.value = 0
    boardActivityError.value =
      error.response?.data?.message || '게시판 활동 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isBoardActivityLoading.value = false
  }
}

const fetchMySaleProducts = async (page = 0) => {
  if (!authStore.isLoggedIn) return

  isSalesLoading.value = true
  salesError.value = ''

  try {
    const { data } = await productApi.getMyProducts({
      page,
      size: 6,
      saleStatus: selectedSaleStatus.value,
    })

    mySaleProducts.value = data.content.map(mapProductListItem)
    saleTotalPages.value = data.totalPages
    saleCurrentPage.value = page
  } catch (error) {
    if (await redirectIfProfileRequired(error)) return

    mySaleProducts.value = []
    saleTotalPages.value = 0
    salesError.value = error.response?.data?.message || '판매 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isSalesLoading.value = false
  }
}

const fetchMyPurchaseProducts = async (page = 0) => {
  if (!authStore.isLoggedIn) return

  isPurchasesLoading.value = true
  purchasesError.value = ''

  try {
    const { data } = await productApi.getMyPurchases({
      page,
      size: 6,
    })

    myPurchaseProducts.value = data.content.map(mapProductListItem)
    purchaseTotalPages.value = data.totalPages
    purchaseCurrentPage.value = page
  } catch (error) {
    if (await redirectIfProfileRequired(error)) return

    myPurchaseProducts.value = []
    purchaseTotalPages.value = 0
    purchasesError.value =
      error.response?.data?.message || '구매 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isPurchasesLoading.value = false
  }
}

const fetchMyFavoriteProducts = async () => {
  if (!authStore.isLoggedIn) return

  isFavoritesLoading.value = true
  favoritesError.value = ''

  try {
    const { data } = await productApi.getMyFavorites()
    const products = Array.isArray(data) ? data : (data.content ?? [])

    myFavoriteProducts.value = products.map(mapProductListItem)
    favCurrentPage.value = 0
    syncLikedIdsFromProducts(products)
  } catch (error) {
    if (await redirectIfProfileRequired(error)) return

    myFavoriteProducts.value = []
    favoritesError.value = error.response?.data?.message || '찜 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isFavoritesLoading.value = false
  }
}

const openProfileEditModal = () => {
  profileEditForm.value = {
    nickname: profileData.value.nickname,
  }
  profileEditError.value = ''
  profileEditSuccess.value = ''
  profileEditImageFile.value = null
  isProfileImageRemoved.value = false
  resetProfileEditObjectUrl()
  profileEditImagePreview.value = profileData.value.profileImageUrl
  isProfileEditModalOpen.value = true
}

const closeProfileEditModal = () => {
  if (isProfileSaving.value) return

  resetProfileEditObjectUrl()
  profileEditImageFile.value = null
  isProfileImageRemoved.value = false
  isProfileEditModalOpen.value = false
}

const resetProfileEditObjectUrl = () => {
  if (profileEditObjectUrl.value) {
    URL.revokeObjectURL(profileEditObjectUrl.value)
    profileEditObjectUrl.value = ''
  }
}

const openProfileImagePicker = () => {
  profileImageInput.value?.click()
}

const handleProfileImageChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  resetProfileEditObjectUrl()
  profileEditImageFile.value = file
  isProfileImageRemoved.value = false
  profileEditObjectUrl.value = URL.createObjectURL(file)
  profileEditImagePreview.value = profileEditObjectUrl.value
}

const removeProfileImagePreview = () => {
  resetProfileEditObjectUrl()
  profileEditImageFile.value = null
  isProfileImageRemoved.value = Boolean(profileData.value.profileImageUrl)
  profileEditImagePreview.value = ''

  if (profileImageInput.value) {
    profileImageInput.value.value = ''
  }
}

const validateProfileEditForm = () => {
  if (!profileEditForm.value.nickname.trim()) {
    return '닉네임을 입력해주세요.'
  }

  return ''
}

const saveProfileEdit = async () => {
  const validationMessage = validateProfileEditForm()
  profileEditError.value = validationMessage
  profileEditSuccess.value = ''

  if (validationMessage) return

  isProfileSaving.value = true
  try {
    let profileResponse
    const { data } = await userProfileApi.updateMyProfile({
      nickname: profileEditForm.value.nickname.trim(),
    })
    profileResponse = data.data

    if (profileEditImageFile.value) {
      const formData = new FormData()
      formData.append('image', profileEditImageFile.value)
      const { data: imageData } = await userProfileApi.uploadProfileImage(formData)
      profileResponse = imageData.data
    } else if (isProfileImageRemoved.value) {
      const { data: imageData } = await userProfileApi.deleteProfileImage()
      profileResponse = imageData.data
    }

    applyProfileResponse(profileResponse)
    profileEditSuccess.value = data.message || '프로필이 수정되었습니다.'
    profileEditImageFile.value = null
    isProfileImageRemoved.value = false
    resetProfileEditObjectUrl()
    isProfileEditModalOpen.value = false
  } catch (error) {
    if (await redirectIfProfileRequired(error)) return

    profileEditError.value =
      error.response?.status === 403
        ? '프로필 등록이 완료된 계정만 수정할 수 있습니다. 다시 로그인하거나 프로필 등록 상태를 확인해주세요.'
        : error.response?.data?.message || '프로필 수정 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isProfileSaving.value = false
  }
}

onMounted(() => {
  fetchMyProfile()
})

watch(selectedMenu, (nextMenu) => {
  if (boardActivityMenuIds.includes(nextMenu)) {
    fetchBoardActivityPosts(0)
  }

  if (nextMenu === 'sales') {
    fetchMySaleProducts(0)
  }

  if (nextMenu === 'purchases') {
    fetchMyPurchaseProducts(0)
  }

  if (nextMenu === 'favorites') {
    fetchMyFavoriteProducts()
  }
})

watch(selectedSaleStatus, () => {
  if (selectedMenu.value === 'sales') {
    fetchMySaleProducts(0)
  }
})
</script>

<template>
  <!-- 그래프 노트지 배경 -->
  <div class="notebook-bg min-h-screen">
    <!-- ── 메인 레이아웃 ── -->
    <main class="px-4 py-8 md:px-6 md:py-10">
      <div class="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <!-- ── 사이드바 ── -->
        <aside class="w-full lg:w-72 lg:shrink-0">
          <!-- 모바일 드롭다운 -->
          <div class="relative lg:hidden">
            <button
              type="button"
              class="flex h-14 w-full items-center justify-between rounded-2xl border-2 border-ink bg-[#f0ebe0] px-4 font-extrabold text-ink shadow-[3px_3px_0_#1c1712] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              @click="isMobileMenuOpen = !isMobileMenuOpen"
            >
              <span class="flex min-w-0 items-center gap-3">
                <component :is="activeMenu.icon" class="h-5 w-5 shrink-0" />
                <span class="truncate">{{ activeMenu.label }}</span>
              </span>
              <ChevronDownIcon class="h-5 w-5 shrink-0 transition" :class="isMobileMenuOpen ? 'rotate-180' : ''" />
            </button>

            <nav
              v-if="isMobileMenuOpen"
              class="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border-2 border-ink bg-[#f0ebe0] p-3 shadow-[4px_4px_0_#1c1712]"
            >
              <div
                v-for="(section, si) in menuSections"
                :key="section.id"
                :class="['pt-3 first:pt-0', si > 0 ? 'mt-3 border-t-2 border-dashed border-ink/20' : '']"
              >
                <p
                  v-if="section.title"
                  class="mb-1.5 px-2 text-xs font-extrabold uppercase tracking-widest text-[#8c7e6e]"
                >
                  {{ section.title }}
                </p>
                <button
                  v-for="item in section.items"
                  :key="item.id"
                  type="button"
                  class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition"
                  :class="
                    selectedMenu === item.id
                      ? 'bg-[#ffe066] border-2 border-ink text-ink shadow-[2px_2px_0_#1c1712]'
                      : 'text-ink hover:bg-[#ffe066]/40'
                  "
                  @click="selectMenu(item.id)"
                >
                  <component :is="item.icon" class="h-5 w-5 shrink-0" />
                  {{ item.label }}
                </button>
              </div>
            </nav>
          </div>

          <!-- 데스크탑 링 공책 스타일 사이드바 -->
          <div class="hidden lg:block">
            <div
              class="relative overflow-hidden rounded-2xl border-2 border-ink bg-[#f0ebe0] shadow-[4px_4px_0_#1c1712]"
            >
              <!-- 링 구멍 좌측 스트립 -->
              <div
                class="absolute left-0 top-0 h-full w-9 shrink-0 border-r-2 border-ink bg-[#e0d8c8] flex flex-col items-center justify-evenly py-5"
              >
                <div
                  v-for="n in 9"
                  :key="n"
                  class="h-4 w-4 rounded-full border-2 border-ink bg-white shadow-inner"
                ></div>
              </div>

              <!-- 메뉴 항목들 -->
              <div class="pl-11 pr-3 py-4">
                <div
                  v-for="(section, si) in menuSections"
                  :key="section.id"
                  :class="['pt-4 first:pt-0', si > 0 ? 'mt-3 border-t-2 border-dashed border-ink/15' : '']"
                >
                  <!-- 섹션 타이틀: 와시 테이프 스타일 -->
                  <div v-if="section.title" class="mb-2 pl-1">
                    <span
                      class="inline-block -rotate-1 rounded-sm border border-ink/30 px-2 py-0.5 text-xs font-extrabold text-ink"
                      :class="section.id === 'board' ? 'bg-[#b3d4ff]' : 'bg-[#96d4b4]'"
                    >
                      {{ section.title }}
                    </span>
                  </div>

                  <button
                    v-for="item in section.items"
                    :key="item.id"
                    type="button"
                    class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition"
                    :class="
                      selectedMenu === item.id
                        ? 'bg-[#ffe066] border-2 border-ink text-ink shadow-[2px_2px_0_#1c1712] -translate-x-0.5 -translate-y-0.5'
                        : 'text-ink hover:bg-[#ffe066]/30'
                    "
                    @click="selectMenu(item.id)"
                  >
                    <component :is="item.icon" class="h-5 w-5 shrink-0" />
                    {{ item.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- ── 콘텐츠 영역 ── -->
        <section class="min-w-0 flex-1">
          <!-- 프로필 페이지 -->
          <div v-if="selectedMenu === 'profile'" class="flex flex-col gap-6">
            <!-- 프로필 카드 -->
            <div class="relative overflow-visible rounded-2xl border-2 border-ink bg-white shadow-[4px_4px_0_#1c1712]">
              <!-- 와시 테이프 상단 장식 -->
              <div
                class="absolute left-1/2 -top-3 -translate-x-1/2 h-6 w-28 -rotate-1 rounded-sm border border-ink/20 bg-[#ffe066]/75"
              ></div>

              <div class="px-6 py-7 md:px-8">
                <!-- 헤더 -->
                <div class="flex items-start justify-between">
                  <h2 class="text-2xl font-extrabold text-ink">내 프로필</h2>
                  <button
                    type="button"
                    class="hidden sm:inline-flex items-center gap-2 h-9 px-4 rounded-xl border-2 border-ink bg-[#ffe066] text-sm font-extrabold text-ink shadow-[2px_2px_0_#1c1712] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#1c1712] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    @click="openProfileEditModal"
                  >
                    <PencilSquareIcon class="h-4 w-4" />
                    수정하기
                  </button>
                </div>

                <!-- 프로필 사진 + 이름 -->
                <div
                  class="mt-6 flex flex-col items-center gap-5 rounded-xl border-2 border-dashed border-ink/20 bg-[#f9f5ee] p-5 sm:flex-row sm:items-center"
                >
                  <!-- 폴라로이드 프레임 -->
                  <div class="shrink-0 rotate-2">
                    <div class="bg-white p-2 pb-6 border-2 border-ink shadow-[3px_3px_0_#1c1712]">
                      <img
                        v-if="profileImageUrl"
                        :src="profileImageUrl"
                        :alt="`${profile.nickname} 프로필`"
                        class="h-20 w-20 object-cover"
                      />
                      <div v-else class="flex h-20 w-20 items-center justify-center bg-[#ffe066]/20">
                        <UserCircleIcon class="h-14 w-14 text-ink/30" />
                      </div>
                    </div>
                  </div>

                  <div class="flex-1 text-center sm:text-left">
                    <h3
                      class="flex flex-wrap items-center justify-center gap-1 text-2xl font-extrabold text-ink sm:justify-start"
                    >
                      <span>{{ profile.nickname }}</span>
                      <!-- 별 위치 조절: -ml은 왼쪽으로 붙이고, -mt는 위로 올립니다. 숫자를 키우면 더 많이 이동합니다. -->
                      <TrustBadge :score="profileData.trustScore" size="sm" class="-ml-1 -mt-1" />
                    </h3>
                    <div class="mt-2 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <span
                        class="inline-block -rotate-1 rounded-sm border border-ink/40 bg-[#96d4b4]/60 px-3 py-0.5 text-xs font-bold text-ink"
                      >
                        {{ profile.cohort }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 스탯 포스트잇 5개 -->
                <div class="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                  <div
                    v-for="(stat, i) in profileStats"
                    :key="stat.label"
                    :class="[
                      'stat-note flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-ink p-2.5 shadow-[2px_2px_0_#1c1712]',
                      i === 0
                        ? 'bg-[#ffe066] -rotate-1'
                        : i === 1
                          ? 'bg-[#ffb3c6] rotate-1'
                          : i === 2
                            ? 'bg-[#b3d4ff] -rotate-1'
                            : i === 3
                              ? 'bg-[#96d4b4] rotate-1'
                              : 'bg-[#f0ebe0] -rotate-1',
                    ]"
                    @click="navigateFromStat(i)"
                  >
                    <component :is="stat.icon" class="h-4 w-4 text-ink" />
                    <span class="text-lg font-extrabold leading-none text-ink">{{ stat.value }}</span>
                    <span class="whitespace-nowrap text-[11px] font-bold text-ink/60">{{ stat.label }}</span>
                  </div>
                </div>

                <!-- 모바일 수정 버튼 -->
                <button
                  type="button"
                  class="mt-5 sm:hidden flex w-full items-center justify-center gap-2 h-11 rounded-xl border-2 border-ink bg-[#ffe066] text-sm font-extrabold text-ink shadow-[2px_2px_0_#1c1712] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  @click="openProfileEditModal"
                >
                  <PencilSquareIcon class="h-4 w-4" />
                  수정하기
                </button>
              </div>
            </div>

            <!-- 기본 정보: 노트 줄 스타일 -->
            <div class="relative overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-[4px_4px_0_#1c1712]">
              <!-- 왼쪽 분홍 마진 라인 -->
              <div class="absolute left-0 top-0 h-full w-1.5 bg-[#ffb3c6]"></div>

              <div class="px-6 py-6 md:px-8">
                <h3 class="mb-1 text-xl font-extrabold text-ink">기본 정보</h3>
                <p class="mb-5 text-sm text-[#8c7e6e]">프로필 화면에 항상 노출되는 정보입니다</p>

                <dl>
                  <div
                    v-for="row in accountRows"
                    :key="row.label"
                    class="flex flex-col gap-1.5 border-b border-dashed border-ink/15 py-3.5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <dt class="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#8c7e6e]">
                      <component :is="row.icon" class="h-3.5 w-3.5 shrink-0" />
                      {{ row.label }}
                    </dt>
                    <dd class="pl-5 text-sm font-extrabold text-ink sm:pl-0 sm:text-right">{{ row.value || '-' }}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <!-- 낙서장 활동 (내가 쓴 글 / 댓글 단 글) -->
          <template v-else-if="isBoardActivityMenu">
            <div
              class="relative overflow-hidden rounded-2xl border-2 border-ink bg-white p-6 shadow-[4px_4px_0_#1c1712] md:p-8"
            >
              <div class="absolute left-0 top-0 h-full w-1.5 bg-[#b3d4ff]"></div>
              <h2 class="text-2xl font-extrabold text-ink">{{ activeMenu.label }}</h2>
              <p class="mt-2 text-sm text-[#8c7e6e]">{{ boardActivityDescription }}</p>
            </div>

            <div class="mt-5 rounded-2xl border-2 border-ink bg-white p-4 shadow-[4px_4px_0_#1c1712] md:p-6">
              <p v-if="isBoardActivityLoading" class="py-12 text-center text-sm font-bold text-[#8c7e6e]">
                목록을 불러오는 중입니다
              </p>
              <p
                v-else-if="boardActivityError"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
              >
                {{ boardActivityError }}
              </p>
              <ul v-else-if="boardActivityPosts.length" class="flex flex-col divide-y-2 divide-dashed divide-ink/15">
                <li v-for="post in boardActivityPosts" :key="post.id">
                  <BoardPostCard :post="post" from="mypage" />
                </li>
              </ul>
              <div v-else class="px-6 py-12 text-center">
                <ArchiveBoxIcon class="mx-auto h-12 w-12 text-[#8c7e6e]" />
                <p class="mt-4 text-lg font-extrabold text-ink">{{ boardActivityEmptyMessage }}</p>
                <p class="mt-2 text-sm text-[#8c7e6e]">활동이 생기면 이곳에 표시됩니다</p>
              </div>

              <div v-if="boardActivityTotalPages > 1" class="mt-6 flex justify-center gap-2">
                <button
                  v-for="page in boardActivityTotalPages"
                  :key="page"
                  type="button"
                  class="h-10 w-10 rounded-lg border-2 border-ink text-sm font-extrabold transition shadow-[2px_2px_0_#1c1712]"
                  :class="
                    boardActivityCurrentPage === page - 1
                      ? 'bg-[#ffe066] text-ink -translate-x-0.5 -translate-y-0.5 shadow-[3px_3px_0_#1c1712]'
                      : 'bg-white text-ink hover:bg-[#ffe066]/30'
                  "
                  @click="fetchBoardActivityPosts(page - 1)"
                >
                  {{ page }}
                </button>
              </div>
            </div>
          </template>

          <!-- 판매 목록 -->
          <template v-else-if="selectedMenu === 'sales'">
            <div
              class="relative overflow-hidden rounded-2xl border-2 border-ink bg-white p-6 shadow-[4px_4px_0_#1c1712] md:p-8"
            >
              <div class="absolute left-0 top-0 h-full w-1.5 bg-[#96d4b4]"></div>
              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 class="text-2xl font-extrabold text-ink">내 판매목록</h2>
                  <p class="mt-1 text-sm text-[#8c7e6e]">판매 상태별로 내 상품을 확인하세요</p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="status in saleStatusTabs"
                    :key="status.value"
                    type="button"
                    class="h-10 rounded-lg border-2 border-ink px-5 text-sm font-extrabold transition"
                    :class="
                      selectedSaleStatus === status.value
                        ? 'bg-[#ffe066] shadow-[2px_2px_0_#1c1712] -translate-x-0.5 -translate-y-0.5'
                        : 'bg-white text-ink hover:bg-[#ffe066]/30 shadow-[2px_2px_0_#1c1712]'
                    "
                    @click="selectedSaleStatus = status.value"
                  >
                    {{ status.label }}
                  </button>
                </div>
              </div>
            </div>

            <p
              v-if="isSalesLoading"
              class="mt-5 rounded-2xl border-2 border-ink bg-white py-12 text-center text-sm font-bold text-[#8c7e6e] shadow-[4px_4px_0_#1c1712]"
            >
              판매 목록을 불러오는 중입니다
            </p>
            <p
              v-else-if="salesError"
              class="mt-5 rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600"
            >
              {{ salesError }}
            </p>
            <div v-else-if="mySaleProducts.length" class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ProductCard
                v-for="product in mySaleProducts"
                :key="product.id"
                :product="product"
                :liked="likedIds.has(product.id)"
                @toggle-like="toggleLike"
              />
            </div>
            <div
              v-else
              class="mt-5 rounded-2xl border-2 border-ink bg-white px-6 py-14 text-center shadow-[4px_4px_0_#1c1712]"
            >
              <ArchiveBoxIcon class="mx-auto h-12 w-12 text-[#8c7e6e]" />
              <p class="mt-4 text-lg font-extrabold text-ink">표시할 상품이 없습니다</p>
              <p class="mt-2 text-sm text-[#8c7e6e]">다른 판매 상태를 선택해보세요</p>
            </div>

            <div
              v-if="!isSalesLoading && !salesError && saleTotalPages > 1"
              class="flex justify-center items-center gap-1 mt-5"
            >
              <button
                @click="fetchMySaleProducts(Math.max(0, saleCurrentPage - 5))"
                :disabled="saleCurrentPage <= 0"
                class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all"
              >
                «
              </button>
              <button
                @click="fetchMySaleProducts(Math.max(0, saleCurrentPage - 1))"
                :disabled="saleCurrentPage <= 0"
                class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all"
              >
                ‹
              </button>
              <button
                v-for="page in saleVisiblePages"
                :key="page"
                @click="fetchMySaleProducts(page - 1)"
                :class="
                  saleCurrentPage === page - 1
                    ? 'bg-[#ffe066] border-ink shadow-[2px_2px_0_#1c1712] text-ink'
                    : 'bg-white border-[#c8bca8] text-ink hover:border-ink hover:shadow-[2px_2px_0_#1c1712]'
                "
                class="min-w-8 h-8 md:min-w-9 md:h-9 px-2 rounded-xl font-bold text-sm border-2 transition-all"
              >
                {{ page }}
              </button>
              <button
                @click="fetchMySaleProducts(Math.min(saleTotalPages - 1, saleCurrentPage + 1))"
                :disabled="saleCurrentPage >= saleTotalPages - 1"
                class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all"
              >
                ›
              </button>
              <button
                @click="fetchMySaleProducts(Math.min(saleTotalPages - 1, saleCurrentPage + 5))"
                :disabled="saleCurrentPage >= saleTotalPages - 1"
                class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all"
              >
                »
              </button>
            </div>
          </template>

          <!-- 찜 목록 -->
          <template v-else-if="selectedMenu === 'favorites'">
            <div
              class="relative overflow-hidden rounded-2xl border-2 border-ink bg-white p-6 shadow-[4px_4px_0_#1c1712] md:p-8"
            >
              <div class="absolute left-0 top-0 h-full w-1.5 bg-[#ffb3c6]"></div>
              <h2 class="text-2xl font-extrabold text-ink">찜 목록</h2>
              <p class="mt-1 text-sm text-[#8c7e6e]">내가 찜한 낙서장터 상품을 확인하세요</p>
            </div>

            <p
              v-if="isFavoritesLoading"
              class="mt-5 rounded-2xl border-2 border-ink bg-white py-12 text-center text-sm font-bold text-[#8c7e6e] shadow-[4px_4px_0_#1c1712]"
            >
              찜 목록을 불러오는 중입니다
            </p>
            <p
              v-else-if="favoritesError"
              class="mt-5 rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600"
            >
              {{ favoritesError }}
            </p>
            <div v-else-if="myFavoriteProducts.length" class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ProductCard
                v-for="product in paginatedFavoriteProducts"
                :key="product.id"
                :product="product"
                :liked="likedIds.has(product.id)"
                @toggle-like="toggleLike"
              />
            </div>
            <div
              v-else
              class="mt-5 rounded-2xl border-2 border-ink bg-white px-6 py-14 text-center shadow-[4px_4px_0_#1c1712]"
            >
              <ArchiveBoxIcon class="mx-auto h-12 w-12 text-[#8c7e6e]" />
              <p class="mt-4 text-lg font-extrabold text-ink">찜한 상품이 없습니다</p>
              <p class="mt-2 text-sm text-[#8c7e6e]">관심 있는 상품을 찜하면 이곳에 표시됩니다</p>
            </div>
            <div
              v-if="!isFavoritesLoading && !favoritesError && favTotalPages > 1"
              class="flex justify-center items-center gap-1 mt-5"
            >
              <button
                @click="favCurrentPage = Math.max(0, favCurrentPage - 5)"
                :disabled="favCurrentPage <= 0"
                class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all"
              >
                «
              </button>
              <button
                @click="favCurrentPage = Math.max(0, favCurrentPage - 1)"
                :disabled="favCurrentPage <= 0"
                class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all"
              >
                ‹
              </button>
              <button
                v-for="page in favVisiblePages"
                :key="page"
                @click="favCurrentPage = page - 1"
                :class="
                  favCurrentPage === page - 1
                    ? 'bg-[#ffe066] border-ink shadow-[2px_2px_0_#1c1712] text-ink'
                    : 'bg-white border-[#c8bca8] text-ink hover:border-ink hover:shadow-[2px_2px_0_#1c1712]'
                "
                class="min-w-8 h-8 md:min-w-9 md:h-9 px-2 rounded-xl font-bold text-sm border-2 transition-all"
              >
                {{ page }}
              </button>
              <button
                @click="favCurrentPage = Math.min(favTotalPages - 1, favCurrentPage + 1)"
                :disabled="favCurrentPage >= favTotalPages - 1"
                class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all"
              >
                ›
              </button>
              <button
                @click="favCurrentPage = Math.min(favTotalPages - 1, favCurrentPage + 5)"
                :disabled="favCurrentPage >= favTotalPages - 1"
                class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all"
              >
                »
              </button>
            </div>
          </template>

          <!-- 구매 목록 -->
          <template v-else-if="selectedMenu === 'purchases'">
            <div
              class="relative overflow-hidden rounded-2xl border-2 border-ink bg-white p-6 shadow-[4px_4px_0_#1c1712] md:p-8"
            >
              <div class="absolute left-0 top-0 h-full w-1.5 bg-[#ffe066]"></div>
              <h2 class="text-2xl font-extrabold text-ink">구매 목록</h2>
              <p class="mt-1 text-sm text-[#8c7e6e]">거래 완료된 구매 상품을 확인하세요</p>
            </div>

            <p
              v-if="isPurchasesLoading"
              class="mt-5 rounded-2xl border-2 border-ink bg-white py-12 text-center text-sm font-bold text-[#8c7e6e] shadow-[4px_4px_0_#1c1712]"
            >
              구매 목록을 불러오는 중입니다
            </p>
            <p
              v-else-if="purchasesError"
              class="mt-5 rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600"
            >
              {{ purchasesError }}
            </p>
            <div v-else-if="myPurchaseProducts.length" class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ProductCard
                v-for="product in myPurchaseProducts"
                :key="product.id"
                :product="product"
                :liked="likedIds.has(product.id)"
                @toggle-like="toggleLike"
              />
            </div>
            <div
              v-else
              class="mt-5 rounded-2xl border-2 border-ink bg-white px-6 py-14 text-center shadow-[4px_4px_0_#1c1712]"
            >
              <ArchiveBoxIcon class="mx-auto h-12 w-12 text-[#8c7e6e]" />
              <p class="mt-4 text-lg font-extrabold text-ink">구매 완료된 상품이 없습니다</p>
              <p class="mt-2 text-sm text-[#8c7e6e]">거래 완료 내역이 생기면 이곳에 표시됩니다</p>
            </div>

            <div
              v-if="!isPurchasesLoading && !purchasesError && purchaseTotalPages > 1"
              class="flex justify-center items-center gap-1 mt-5"
            >
              <button
                @click="fetchMyPurchaseProducts(Math.max(0, purchaseCurrentPage - 5))"
                :disabled="purchaseCurrentPage <= 0"
                class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all"
              >
                «
              </button>
              <button
                @click="fetchMyPurchaseProducts(Math.max(0, purchaseCurrentPage - 1))"
                :disabled="purchaseCurrentPage <= 0"
                class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all"
              >
                ‹
              </button>
              <button
                v-for="page in purchaseVisiblePages"
                :key="page"
                @click="fetchMyPurchaseProducts(page - 1)"
                :class="
                  purchaseCurrentPage === page - 1
                    ? 'bg-[#ffe066] border-ink shadow-[2px_2px_0_#1c1712] text-ink'
                    : 'bg-white border-[#c8bca8] text-ink hover:border-ink hover:shadow-[2px_2px_0_#1c1712]'
                "
                class="min-w-8 h-8 md:min-w-9 md:h-9 px-2 rounded-xl font-bold text-sm border-2 transition-all"
              >
                {{ page }}
              </button>
              <button
                @click="fetchMyPurchaseProducts(Math.min(purchaseTotalPages - 1, purchaseCurrentPage + 1))"
                :disabled="purchaseCurrentPage >= purchaseTotalPages - 1"
                class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all"
              >
                ›
              </button>
              <button
                @click="fetchMyPurchaseProducts(Math.min(purchaseTotalPages - 1, purchaseCurrentPage + 5))"
                :disabled="purchaseCurrentPage >= purchaseTotalPages - 1"
                class="min-w-8 h-8 md:min-w-9 md:h-9 px-1.5 rounded-xl text-sm text-ink hover:bg-white hover:border-ink hover:border-2 disabled:opacity-30 transition-all"
              >
                »
              </button>
            </div>
          </template>

          <!-- 환경설정 -->
          <template v-else-if="selectedMenu === 'settings'">
            <div
              class="relative overflow-hidden rounded-2xl border-2 border-ink bg-white p-6 shadow-[4px_4px_0_#1c1712] md:p-8"
            >
              <div class="absolute left-0 top-0 h-full w-1.5 bg-[#c8bca8]"></div>
              <h2 class="text-2xl font-extrabold text-ink">환경설정</h2>
              <p class="mt-1 text-sm text-[#8c7e6e]">계정 및 앱 설정을 관리합니다</p>
            </div>
            <div class="mt-5 rounded-2xl border-2 border-ink bg-white p-6 shadow-[4px_4px_0_#1c1712]">
              <h3 class="text-base font-extrabold text-ink mb-4">계정</h3>
              <div
                class="flex flex-col gap-3 border-b border-dashed border-ink/15 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p class="text-sm font-bold text-ink">비밀번호 변경</p>
                  <p class="text-xs text-[#8c7e6e] mt-0.5">이메일 계정의 로그인 비밀번호를 변경합니다</p>
                  <p v-if="passwordChangeSuccess" class="mt-2 text-xs font-bold text-green-600">
                    {{ passwordChangeSuccess }}
                  </p>
                </div>
                <button
                  type="button"
                  class="h-9 rounded-xl border-2 border-ink px-4 text-sm font-extrabold shadow-[2px_2px_0_#1c1712] transition"
                  :class="
                    isEmailPasswordAccount
                      ? 'bg-white text-ink hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#1c1712] hover:bg-[#ffe066]/30'
                      : 'cursor-not-allowed bg-[#f0ebe0] text-[#8c7e6e] opacity-70'
                  "
                  :disabled="!isEmailPasswordAccount"
                  @click="openPasswordChangeModal"
                >
                  {{ passwordActionLabel }}
                </button>
              </div>

              <div
                class="flex flex-col gap-3 border-b border-dashed border-ink/15 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p class="text-sm font-bold text-ink">회원 탈퇴</p>
                  <p class="text-xs text-[#8c7e6e] mt-0.5">!!!!!!!!!선행 작업 중!!!!!!!!!!!</p>
                </div>
                <button
                  type="button"
                  class="h-9 cursor-not-allowed rounded-xl border-2 border-ink bg-[#f0ebe0] px-4 text-sm font-extrabold text-[#8c7e6e] opacity-70 shadow-[2px_2px_0_#1c1712]"
                  disabled
                >
                  탈퇴하기
                </button>
              </div>

              <div
                v-if="authStore.isAdmin"
                class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p class="text-sm font-bold text-[#cc5a3a]">관리자 페이지</p>
                  <p class="text-xs text-[#8c7e6e] mt-0.5">공지·신고·유저를 관리합니다</p>
                </div>
                <RouterLink
                  to="/admin"
                  class="h-9 inline-flex items-center rounded-xl border-2 border-[#cc5a3a] bg-white px-4 text-sm font-extrabold text-[#cc5a3a] shadow-[2px_2px_0_#1c1712] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#1c1712]"
                >
                  이동하기
                </RouterLink>
              </div>

              <div class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm font-bold text-ink">로그아웃</p>
                  <p class="text-xs text-[#8c7e6e] mt-0.5">현재 기기에서 로그아웃합니다</p>
                </div>
                <button
                  type="button"
                  class="h-9 rounded-xl border-2 border-ink bg-white px-4 text-sm font-extrabold text-ink shadow-[2px_2px_0_#1c1712] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#1c1712] hover:bg-red-50 hover:border-red-400 hover:text-red-500"
                  @click="logout"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </template>

          <!-- 기타 -->
          <div
            v-else
            class="rounded-2xl border-2 border-ink bg-white px-6 py-16 text-center shadow-[4px_4px_0_#1c1712]"
          >
            <component :is="activeMenu.icon" class="mx-auto h-12 w-12 text-[#8c7e6e]" />
            <h2 class="mt-5 text-2xl font-extrabold text-ink">{{ activeMenu.label }}</h2>
            <p class="mt-3 text-sm text-[#8c7e6e]">이 영역은 추후 구현 예정입니다</p>
          </div>
        </section>
      </div>
    </main>
  </div>

  <ReauthModal
    :is-open="isPasswordChangeModalOpen"
    @close="closePasswordChangeModal"
    @changed="handlePasswordChanged"
  />

  <!-- ── 프로필 수정 모달 ── -->
  <div
    v-if="isProfileEditModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8"
    @click.self="closeProfileEditModal"
  >
    <section
      class="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-ink bg-white shadow-[6px_6px_0_#1c1712]"
    >
      <!-- 모달 헤더 -->
      <div class="relative flex items-center justify-between gap-4 border-b-2 border-ink px-6 py-5">
        <div
          class="absolute left-1/2 -top-3 -translate-x-1/2 h-5 w-20 rounded-sm border border-ink/20 bg-[#ffe066]/70"
        ></div>
        <div>
          <h2 class="text-xl font-extrabold text-ink">프로필 수정</h2>
          <p class="mt-1 text-sm text-[#8c7e6e]">프로필 사진과 닉네임을 수정합니다</p>
        </div>
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-ink bg-white text-ink shadow-[2px_2px_0_#1c1712] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          @click="closeProfileEditModal"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <div class="px-6 py-6">
        <!-- 사진 영역 -->
        <div class="flex flex-col items-center border-b-2 border-dashed border-ink/20 pb-6">
          <div class="relative">
            <!-- 폴라로이드 프레임 -->
            <div class="rotate-1 bg-white p-2 pb-7 border-2 border-ink shadow-[3px_3px_0_#1c1712]">
              <img
                v-if="profileEditImagePreview"
                :src="profileEditImagePreview"
                :alt="`${profile.nickname} 프로필 미리보기`"
                class="h-28 w-28 object-cover"
              />
              <div v-else class="flex h-28 w-28 items-center justify-center bg-[#ffe066]/10">
                <UserCircleIcon class="h-20 w-20 text-ink/20" />
              </div>
            </div>
            <!-- 카메라 버튼 -->
            <button
              type="button"
              class="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-[#ffe066] text-ink shadow-[2px_2px_0_#1c1712] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              @click="openProfileImagePicker"
            >
              <CameraIcon class="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            class="mt-6 inline-flex items-center gap-2 h-9 rounded-lg border-2 border-ink px-4 text-sm font-bold text-[#8c7e6e] transition hover:bg-red-50 hover:text-red-500 hover:border-red-300"
            @click="removeProfileImagePreview"
          >
            <TrashIcon class="h-4 w-4" />
            사진 삭제
          </button>
          <input
            ref="profileImageInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleProfileImageChange"
          />
        </div>

        <!-- 닉네임 입력 -->
        <div class="mt-6 flex flex-col gap-4">
          <label class="block">
            <span class="text-sm font-extrabold text-ink">닉네임</span>
            <input
              v-model="profileEditForm.nickname"
              type="text"
              class="mt-2 h-12 w-full rounded-xl border-2 border-ink px-4 text-sm font-bold text-ink outline-none transition focus:border-[#ffe066] focus:shadow-[0_0_0_3px_rgba(255,224,102,0.25)]"
            />
          </label>

          <p
            v-if="profileEditError"
            class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
          >
            {{ profileEditError }}
          </p>
          <p
            v-else-if="profileEditSuccess"
            class="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-600"
          >
            {{ profileEditSuccess }}
          </p>
        </div>
      </div>

      <!-- 모달 푸터 -->
      <div class="flex justify-end gap-3 border-t-2 border-ink px-6 py-5">
        <button
          type="button"
          class="h-10 rounded-xl border-2 border-ink bg-white px-5 text-sm font-extrabold text-ink shadow-[2px_2px_0_#1c1712] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#1c1712] hover:bg-[#f0ebe0] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isProfileSaving"
          @click="closeProfileEditModal"
        >
          취소
        </button>
        <button
          type="button"
          class="h-10 rounded-xl border-2 border-ink bg-[#ffe066] px-5 text-sm font-extrabold text-ink shadow-[2px_2px_0_#1c1712] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#1c1712] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isProfileSaving"
          @click="saveProfileEdit"
        >
          {{ isProfileSaving ? '저장 중...' : '저장하기' }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 그래프 노트지 배경 */
.notebook-bg {
  background-color: #f5f0e8;
}

/* 포스트잇 호버 효과 */
.stat-note {
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.stat-note:hover {
  transform: rotate(0deg) translateY(-2px) !important;
  box-shadow: 3px 3px 0 #1c1712;
}
</style>
