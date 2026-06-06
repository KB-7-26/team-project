<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  AcademicCapIcon,
  ArchiveBoxIcon,
  CalendarDaysIcon,
  CameraIcon,
  ChatBubbleOvalLeftIcon,
  Cog6ToothIcon,
  CubeIcon,
  EnvelopeIcon,
  HeartIcon,
  IdentificationIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  TrashIcon,
  UserCircleIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import ProductCard from '@/components/product/ProductCard.vue'
import BoardPostCard from '@/components/board/BoardPostCard.vue'
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
const selectedSaleStatus = ref('all')
const likedIds = ref(new Set())
const isProfileEditModalOpen = ref(false)
const serverProfile = ref(null)
const isProfileLoading = ref(false)
const isProfileSaving = ref(false)
const profileEditError = ref('')
const profileEditSuccess = ref('')
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
const isFavoritesLoading = ref(false)
const favoritesError = ref('')
const profileImageInput = ref(null)
const profileEditImagePreview = ref('')
const profileEditObjectUrl = ref('')
const profileEditForm = ref({
  nickname: '',
  cohort: '',
  gender: '',
})

const currentUser = computed(() => authStore.user)
const firebaseUser = computed(() => authStore.firebaseUser)

const fallbackProfile = {
  name: '김민수',
  nickname: '스왑러 민수',
  email: 'minsu.swap@example.com',
  cohort: 'KB IT 5기',
  gender: 'M',
  trustScore: 86,
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
  { label: '신뢰도', value: `${profileData.value.trustScore}%`, icon: ShieldCheckIcon },
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
    title: '낙서장',
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

const boardActivityMenuIds = ['myPosts', 'commentedPosts']
const boardActivityDescriptions = {
  myPosts: '내가 작성한 낙서장 글을 모아봅니다',
  commentedPosts: '내가 댓글을 남긴 낙서장 글을 모아봅니다',
}
const boardActivityEmptyMessages = {
  myPosts: '아직 작성한 글이 없습니다',
  commentedPosts: '아직 댓글을 남긴 글이 없습니다',
}
const menuItems = computed(() => menuSections.flatMap((section) => section.items))
const activeMenu = computed(() => menuItems.value.find((item) => item.id === selectedMenu.value) || menuItems.value[0])
const isBoardActivityMenu = computed(() => boardActivityMenuIds.includes(selectedMenu.value))
const boardActivityDescription = computed(() => boardActivityDescriptions[selectedMenu.value] || '')
const boardActivityEmptyMessage = computed(() => boardActivityEmptyMessages[selectedMenu.value] || '표시할 글이 없습니다')
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
        : await userBoardActivityApi.getMyCommentedPosts(page, 10)

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
      size: 10,
      saleStatus: selectedSaleStatus.value,
    })

    mySaleProducts.value = data.content.map(mapProductListItem)
    saleTotalPages.value = data.totalPages
    saleCurrentPage.value = page
  } catch (error) {
    if (await redirectIfProfileRequired(error)) return

    mySaleProducts.value = []
    saleTotalPages.value = 0
    salesError.value =
      error.response?.data?.message || '판매 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
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
      size: 10,
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
    syncLikedIdsFromProducts(products)
  } catch (error) {
    if (await redirectIfProfileRequired(error)) return

    myFavoriteProducts.value = []
    favoritesError.value =
      error.response?.data?.message || '찜 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isFavoritesLoading.value = false
  }
}

const openProfileEditModal = () => {
  profileEditForm.value = {
    nickname: profileData.value.nickname,
    cohort: profileData.value.cohort,
    gender: profileData.value.gender,
  }
  profileEditError.value = ''
  profileEditSuccess.value = ''
  resetProfileEditObjectUrl()
  profileEditImagePreview.value = profileData.value.profileImageUrl
  isProfileEditModalOpen.value = true
}

const closeProfileEditModal = () => {
  if (isProfileSaving.value) return

  resetProfileEditObjectUrl()
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
  profileEditObjectUrl.value = URL.createObjectURL(file)
  profileEditImagePreview.value = profileEditObjectUrl.value
}

const removeProfileImagePreview = () => {
  resetProfileEditObjectUrl()
  profileEditImagePreview.value = ''

  if (profileImageInput.value) {
    profileImageInput.value.value = ''
  }
}

const validateProfileEditForm = () => {
  if (!profileEditForm.value.nickname.trim()) {
    return '닉네임을 입력해주세요.'
  }

  if (!profileEditForm.value.cohort.trim()) {
    return '회차를 입력해주세요.'
  }

  if (!['M', 'F'].includes(profileEditForm.value.gender)) {
    return '성별을 선택해주세요.'
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
    const { data } = await userProfileApi.updateMyProfile({
      nickname: profileEditForm.value.nickname.trim(),
      cohort: profileEditForm.value.cohort.trim(),
      gender: profileEditForm.value.gender,
    })

    applyProfileResponse(data.data)
    profileEditSuccess.value = data.message || '프로필이 수정되었습니다.'
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
  <div class="bg-primary/10 px-6 py-12 md:py-14">
    <div class="mx-auto max-w-7xl">
      <h1 class="text-4xl font-extrabold text-text-main md:text-5xl">마이페이지</h1>
      <p class="mt-5 text-lg font-medium text-text-sub">내 정보와 거래 내역을 관리하세요</p>
    </div>
  </div>

  <main class="bg-sub-bg px-6 py-8 md:py-10">
    <div class="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row">
      <aside class="flex w-full flex-col gap-6 lg:w-80 lg:shrink-0">
        <nav class="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div
            v-for="(section, sectionIndex) in menuSections"
            :key="section.id"
            class="border-border pt-4 first:pt-0"
            :class="sectionIndex === 0 ? '' : 'mt-4 border-t'"
          >
            <p v-if="section.title" class="px-4 pb-2 text-sm font-extrabold text-text-main">
              {{ section.title }}
            </p>
            <button
              v-for="item in section.items"
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
          </div>
        </nav>
      </aside>

      <section class="min-w-0 flex-1">
        <div v-if="selectedMenu === 'profile'" class="flex flex-col gap-6">
          <section class="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div class="px-6 py-7 md:px-8">
              <div>
                <h2 class="text-3xl font-extrabold text-text-main">내 프로필</h2>
                <p class="mt-3 max-w-2xl text-sm font-medium leading-6 text-text-sub">
                  계정과 거래 프로필에 표시될 정보를 확인합니다.
                </p>
              </div>

              <div class="mt-8 flex flex-col gap-6 rounded-2xl bg-sub-bg p-5 sm:flex-row sm:items-center">
                <img
                  v-if="profileImageUrl"
                  :src="profileImageUrl"
                  :alt="`${profile.nickname} 프로필 이미지`"
                  class="h-24 w-24 rounded-full border-4 border-white object-cover shadow-sm"
                />
                <div
                  v-else
                  class="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-primary/10 shadow-sm"
                >
                  <UserCircleIcon class="h-14 w-14 text-primary" />
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex flex-col gap-4">
                    <div class="flex shrink-0 flex-wrap items-center gap-2">
                      <h3 class="text-2xl font-extrabold text-text-main">{{ profile.nickname }}</h3>
                      <span class="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-primary">
                        {{ profile.cohort }}
                      </span>
                    </div>

                    <div class="grid w-full grid-cols-2 gap-2 lg:grid-cols-4">
                      <div
                        v-for="stat in profileStats"
                        :key="stat.label"
                        class="flex min-h-14 items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"
                      >
                        <div class="flex min-w-0 items-center gap-1.5">
                          <component :is="stat.icon" class="h-4 w-4 shrink-0 text-primary" />
                          <p class="truncate text-xs font-bold text-text-sub">{{ stat.label }}</p>
                        </div>
                        <p class="shrink-0 text-lg font-extrabold leading-none text-text-main">{{ stat.value }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 class="text-xl font-extrabold text-text-main">기본 정보</h3>
                <p class="mt-2 text-sm font-medium text-text-sub">프로필 화면에 항상 노출되는 정보입니다</p>
              </div>
              <button
                type="button"
                class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-text-main px-5 text-sm font-extrabold text-white transition hover:bg-text-hover"
                @click="openProfileEditModal"
              >
                <PencilSquareIcon class="h-5 w-5" />
                수정하기
              </button>
            </div>

            <dl class="mt-6 flex flex-col gap-3">
              <div
                v-for="row in accountRows"
                :key="row.label"
                class="flex flex-col gap-2 rounded-2xl bg-sub-bg px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <dt class="flex items-center gap-2 text-sm font-bold text-text-sub">
                  <component :is="row.icon" class="h-4 w-4" />
                  {{ row.label }}
                </dt>
                <dd class="break-words text-base font-extrabold text-text-main sm:text-right">
                  {{ row.value || '-' }}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <template v-else-if="isBoardActivityMenu">
          <div class="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
            <h2 class="text-2xl font-extrabold text-text-main">{{ activeMenu.label }}</h2>
            <p class="mt-2 text-sm font-medium text-text-sub">{{ boardActivityDescription }}</p>
          </div>

          <div class="mt-6 rounded-2xl border border-border bg-white p-4 shadow-sm md:p-6">
            <p v-if="isBoardActivityLoading" class="py-12 text-center text-sm font-bold text-text-sub">
              목록을 불러오는 중입니다
            </p>
            <p
              v-else-if="boardActivityError"
              class="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
            >
              {{ boardActivityError }}
            </p>
            <ul v-else-if="boardActivityPosts.length" class="flex flex-col divide-y divide-border">
              <li v-for="post in boardActivityPosts" :key="post.id">
                <BoardPostCard :post="post" />
              </li>
            </ul>
            <div v-else class="px-6 py-12 text-center">
              <ArchiveBoxIcon class="mx-auto h-12 w-12 text-text-sub" />
              <p class="mt-4 text-lg font-extrabold text-text-main">{{ boardActivityEmptyMessage }}</p>
              <p class="mt-2 text-sm font-medium text-text-sub">활동이 생기면 이곳에 표시됩니다</p>
            </div>

            <div v-if="boardActivityTotalPages > 1" class="mt-6 flex justify-center gap-2">
              <button
                v-for="page in boardActivityTotalPages"
                :key="page"
                type="button"
                class="h-10 w-10 rounded-xl text-sm font-extrabold transition"
                :class="
                  boardActivityCurrentPage === page - 1
                    ? 'bg-primary text-white'
                    : 'border border-border text-text-main hover:bg-primary/10 hover:text-primary'
                "
                @click="fetchBoardActivityPosts(page - 1)"
              >
                {{ page }}
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="selectedMenu === 'sales'">
          <div class="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
            <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 class="text-2xl font-extrabold text-text-main">내 판매목록</h2>
                <p class="mt-2 text-sm font-medium text-text-sub">판매 상태별로 내 상품을 확인하세요</p>
              </div>
              <div class="flex flex-wrap gap-3">
                <button
                  v-for="status in saleStatusTabs"
                  :key="status.value"
                  type="button"
                  class="h-12 rounded-full px-6 text-sm font-extrabold transition"
                  :class="
                    selectedSaleStatus === status.value
                      ? 'bg-primary text-white shadow-[0_8px_18px_rgba(255,184,0,0.35)]'
                      : 'bg-sub-bg text-text-main hover:bg-primary/10 hover:text-primary'
                  "
                  @click="selectedSaleStatus = status.value"
                >
                  {{ status.label }}
                </button>
              </div>
            </div>
          </div>

          <p v-if="isSalesLoading" class="mt-6 rounded-2xl border border-border bg-white py-12 text-center text-sm font-bold text-text-sub shadow-sm">
            판매 목록을 불러오는 중입니다
          </p>
          <p
            v-else-if="salesError"
            class="mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-600 shadow-sm"
          >
            {{ salesError }}
          </p>
          <div v-else-if="mySaleProducts.length" class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <ProductCard
              v-for="product in mySaleProducts"
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

          <div v-if="!isSalesLoading && !salesError && saleTotalPages > 1" class="mt-6 flex justify-center gap-2">
            <button
              v-for="page in saleTotalPages"
              :key="page"
              type="button"
              class="h-10 w-10 rounded-xl text-sm font-extrabold transition"
              :class="
                saleCurrentPage === page - 1
                  ? 'bg-primary text-white'
                  : 'border border-border bg-white text-text-main hover:bg-primary/10 hover:text-primary'
              "
              @click="fetchMySaleProducts(page - 1)"
            >
              {{ page }}
            </button>
          </div>
        </template>

        <template v-else-if="selectedMenu === 'favorites'">
          <div class="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
            <h2 class="text-2xl font-extrabold text-text-main">찜 목록</h2>
            <p class="mt-2 text-sm font-medium text-text-sub">내가 찜한 낙서장터 상품을 확인하세요</p>
          </div>

          <p
            v-if="isFavoritesLoading"
            class="mt-6 rounded-2xl border border-border bg-white py-12 text-center text-sm font-bold text-text-sub shadow-sm"
          >
            찜 목록을 불러오는 중입니다
          </p>
          <p
            v-else-if="favoritesError"
            class="mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-600 shadow-sm"
          >
            {{ favoritesError }}
          </p>
          <div v-else-if="myFavoriteProducts.length" class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <ProductCard
              v-for="product in myFavoriteProducts"
              :key="product.id"
              :product="product"
              :liked="likedIds.has(product.id)"
              @toggle-like="toggleLike"
            />
          </div>

          <div v-else class="mt-6 rounded-2xl border border-border bg-white px-6 py-16 text-center shadow-sm">
            <ArchiveBoxIcon class="mx-auto h-12 w-12 text-text-sub" />
            <p class="mt-4 text-lg font-extrabold text-text-main">찜한 상품이 없습니다</p>
            <p class="mt-2 text-sm font-medium text-text-sub">관심 있는 상품을 찜하면 이곳에 표시됩니다</p>
          </div>
        </template>

        <template v-else-if="selectedMenu === 'purchases'">
          <div class="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
            <h2 class="text-2xl font-extrabold text-text-main">구매 목록</h2>
            <p class="mt-2 text-sm font-medium text-text-sub">거래 완료된 구매 상품을 확인하세요</p>
          </div>

          <p
            v-if="isPurchasesLoading"
            class="mt-6 rounded-2xl border border-border bg-white py-12 text-center text-sm font-bold text-text-sub shadow-sm"
          >
            구매 목록을 불러오는 중입니다
          </p>
          <p
            v-else-if="purchasesError"
            class="mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-600 shadow-sm"
          >
            {{ purchasesError }}
          </p>
          <div v-else-if="myPurchaseProducts.length" class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <ProductCard
              v-for="product in myPurchaseProducts"
              :key="product.id"
              :product="product"
              :liked="likedIds.has(product.id)"
              @toggle-like="toggleLike"
            />
          </div>

          <div v-else class="mt-6 rounded-2xl border border-border bg-white px-6 py-16 text-center shadow-sm">
            <ArchiveBoxIcon class="mx-auto h-12 w-12 text-text-sub" />
            <p class="mt-4 text-lg font-extrabold text-text-main">구매 완료된 상품이 없습니다</p>
            <p class="mt-2 text-sm font-medium text-text-sub">거래 완료 내역이 생기면 이곳에 표시됩니다</p>
          </div>

          <div
            v-if="!isPurchasesLoading && !purchasesError && purchaseTotalPages > 1"
            class="mt-6 flex justify-center gap-2"
          >
            <button
              v-for="page in purchaseTotalPages"
              :key="page"
              type="button"
              class="h-10 w-10 rounded-xl text-sm font-extrabold transition"
              :class="
                purchaseCurrentPage === page - 1
                  ? 'bg-primary text-white'
                  : 'border border-border bg-white text-text-main hover:bg-primary/10 hover:text-primary'
              "
              @click="fetchMyPurchaseProducts(page - 1)"
            >
              {{ page }}
            </button>
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

  <div
    v-if="isProfileEditModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
    @click.self="closeProfileEditModal"
  >
    <section class="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <div class="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h2 class="text-xl font-extrabold text-text-main">프로필 수정</h2>
          <p class="mt-1 text-sm font-medium text-text-sub">프로필 사진을 제외한 기본 정보를 수정합니다</p>
        </div>
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl text-text-sub transition hover:bg-sub-bg hover:text-text-main"
          @click="closeProfileEditModal"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <div class="px-6 py-6">
        <div class="flex flex-col items-center border-b border-border pb-6">
          <div class="relative">
            <img
              v-if="profileEditImagePreview"
              :src="profileEditImagePreview"
              :alt="`${profile.nickname} 프로필 이미지 미리보기`"
              class="h-32 w-32 rounded-full border-4 border-white object-cover shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            />
            <div
              v-else
              class="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-primary/10 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            >
              <UserCircleIcon class="h-20 w-20 text-primary" />
            </div>
            <button
              type="button"
              class="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-primary shadow-md transition hover:bg-primary hover:text-white"
              @click="openProfileImagePicker"
            >
              <CameraIcon class="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            class="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-extrabold text-text-sub transition hover:bg-sub-bg hover:text-text-main"
            @click="removeProfileImagePreview"
          >
            <TrashIcon class="h-4 w-4" />
            사진 삭제
          </button>
          <p class="mt-3 text-xs font-medium text-text-sub">
            프로필 사진 변경은 이미지 업로드 기능이 연결된 뒤 저장됩니다.
          </p>
          <input
            ref="profileImageInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleProfileImageChange"
          />
        </div>

        <div class="mt-6 flex flex-col gap-4">
          <label class="block">
            <span class="text-sm font-bold text-text-sub">닉네임</span>
            <input
              v-model="profileEditForm.nickname"
              type="text"
              class="mt-2 h-12 w-full rounded-xl border border-border px-4 text-sm font-bold text-text-main outline-none focus:border-primary"
            />
          </label>
          <label class="block">
            <span class="text-sm font-bold text-text-sub">회차</span>
            <input
              v-model="profileEditForm.cohort"
              type="text"
              class="mt-2 h-12 w-full rounded-xl border border-border px-4 text-sm font-bold text-text-main outline-none focus:border-primary"
            />
          </label>
          <label class="block">
            <span class="text-sm font-bold text-text-sub">성별</span>
            <select
              v-model="profileEditForm.gender"
              class="mt-2 h-12 w-full rounded-xl border border-border bg-white px-4 text-sm font-bold text-text-main outline-none focus:border-primary"
            >
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>
          </label>

          <p
            v-if="profileEditError"
            class="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
          >
            {{ profileEditError }}
          </p>
          <p
            v-else-if="profileEditSuccess"
            class="rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-600"
          >
            {{ profileEditSuccess }}
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-3 border-t border-border px-6 py-5">
        <button
          type="button"
          class="h-11 rounded-xl border border-border px-5 text-sm font-extrabold text-text-main transition hover:bg-sub-bg disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isProfileSaving"
          @click="closeProfileEditModal"
        >
          취소
        </button>
        <button
          type="button"
          class="h-11 rounded-xl bg-primary px-5 text-sm font-extrabold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
          :disabled="isProfileSaving"
          @click="saveProfileEdit"
        >
          {{ isProfileSaving ? '저장 중' : '저장하기' }}
        </button>
      </div>
    </section>
  </div>
</template>
