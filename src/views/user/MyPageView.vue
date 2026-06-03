<script setup>
import { computed, onMounted, ref } from 'vue'
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
  PhoneIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  TrashIcon,
  UserCircleIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import ProductCard from '@/components/product/ProductCard.vue'
import { useAuthStore } from '@/stores/auth'
import { userProfileApi } from '@/api/userProfileApi'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'MyPageView',
})

const authStore = useAuthStore()
const router = useRouter()
const selectedMenu = ref('profile')
const selectedSaleStatus = ref('판매중')
const likedIds = ref(new Set([1, 3, 5]))
const isProfileEditModalOpen = ref(false)
const serverProfile = ref(null)
const isProfileLoading = ref(false)
const isProfileSaving = ref(false)
const profileEditError = ref('')
const profileEditSuccess = ref('')
const profileImageInput = ref(null)
const profileEditImagePreview = ref('')
const profileEditObjectUrl = ref('')
const profileEditForm = ref({
  nickname: '',
  phoneNumber: '',
  cohort: '',
  gender: '',
})

const currentUser = computed(() => authStore.user)
const firebaseUser = computed(() => authStore.firebaseUser)

const fallbackProfile = {
  name: '김민수',
  nickname: '스왑러 민수',
  email: 'minsu.swap@example.com',
  phoneNumber: '01012345678',
  profileImageUrl: 'https://picsum.photos/seed/swap-profile/240/240',
  cohort: 'KB IT 5기',
  gender: 'M',
  trustScore: 86,
  isVerified: true,
  createdAt: '2026-03-18T10:30:00',
}

const formatDate = (value) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

const formatPhoneNumber = (value) => {
  if (!value) return '-'
  const digits = value.replace(/[^0-9]/g, '')

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  return value
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
    phoneNumber: user.phoneNumber || fallbackProfile.phoneNumber,
    profileImageUrl: user.profileImageUrl || firebaseUser.value?.photoURL || fallbackProfile.profileImageUrl,
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
  { label: '전화번호', value: formatPhoneNumber(profileData.value.phoneNumber), icon: PhoneIcon },
  { label: '회차', value: profileData.value.cohort, icon: AcademicCapIcon },
  { label: '성별', value: genderLabel(profileData.value.gender), icon: IdentificationIcon },
  { label: '가입일', value: formatDate(profileData.value.createdAt), icon: CalendarDaysIcon },
])

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
      phoneNumber: profileResponse.phoneNumber,
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

const openProfileEditModal = () => {
  profileEditForm.value = {
    nickname: profileData.value.nickname,
    phoneNumber: profileData.value.phoneNumber,
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

  if (!/^[0-9]{2,3}-?[0-9]{3,4}-?[0-9]{4}$/.test(profileEditForm.value.phoneNumber.trim())) {
    return '전화번호는 숫자 또는 하이픈 형식으로 입력해주세요.'
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
      phoneNumber: profileEditForm.value.phoneNumber.trim(),
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
            <span class="text-sm font-bold text-text-sub">전화번호</span>
            <input
              v-model="profileEditForm.phoneNumber"
              type="tel"
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
