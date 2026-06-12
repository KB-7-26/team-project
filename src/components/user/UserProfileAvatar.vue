<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  CubeIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { userProfileApi } from '@/api/userProfileApi'
import { reportApi } from '@/api/reportApi'
import TrustStars from '@/components/user/TrustStars.vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  userId: {
    type: [Number, String],
    default: null,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  nickname: {
    type: String,
    default: '',
  },
  reportProductId: {
    type: [Number, String],
    default: null,
  },
})

const authStore = useAuthStore()
const isOpen = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const profile = ref(null)
const reportStatus = ref('idle')
const reportErrorMessage = ref('')
const isReporting = ref(false)

const normalizeImageUrl = (value) => (typeof value === 'string' ? value.trim() : '')

const propImageUrl = computed(() => normalizeImageUrl(props.imageUrl))
const resolvedImageUrl = computed(() => normalizeImageUrl(profile.value?.profileImageUrl) || propImageUrl.value)
const displayNickname = computed(() => profile.value?.nickname || props.nickname || '사용자')
const reportButtonText = computed(() => {
  if (isReporting.value) return '접수 중'
  if (reportStatus.value === 'confirm') return '신고하기'
  if (reportStatus.value === 'done') return '신고완료'
  return ''
})
const reportButtonAriaLabel = computed(() => {
  if (reportStatus.value === 'confirm') return `${displayNickname.value} 신고하기`
  if (reportStatus.value === 'done') return `${displayNickname.value} 신고 완료`
  return `${displayNickname.value} 신고 확인 열기`
})
const reportButtonClass = computed(() => [
  'absolute left-4 top-4 z-10 flex h-9 items-center justify-center rounded-xl border-2 border-ink bg-white text-sm font-extrabold shadow-[2px_2px_0_#1c1712] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:cursor-default disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[2px_2px_0_#1c1712]',
  reportStatus.value === 'idle' ? 'w-9 text-red-500' : 'px-3',
  reportStatus.value === 'done' ? 'text-primary' : 'text-red-500',
])
const canReport = computed(() => (
  Boolean(props.userId && props.reportProductId) &&
  Number(props.userId) !== authStore.user?.id
))

const profileStats = computed(() => [
  { label: '판매중', value: String(profile.value?.stats?.activeProductCount ?? 0), icon: ShoppingBagIcon },
  { label: '판매 완료', value: String(profile.value?.stats?.soldProductCount ?? 0), icon: CubeIcon },
])

const closeProfile = () => {
  if (isReporting.value) return

  isOpen.value = false
  reportStatus.value = 'idle'
  reportErrorMessage.value = ''
}

const handleKeydown = (e) => { if (e.key === 'Escape' && isOpen.value) closeProfile() }
onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))

const handleReportClick = async () => {
  if (!canReport.value || isReporting.value) return

  if (reportStatus.value === 'idle') {
    reportStatus.value = 'confirm'
    reportErrorMessage.value = ''
    return
  }

  if (reportStatus.value === 'confirm') {
    isReporting.value = true
    reportErrorMessage.value = ''
    try {
      await reportApi.createUserReport(props.reportProductId, props.userId)
      reportStatus.value = 'done'
    } catch (error) {
      reportErrorMessage.value =
        error.response?.data?.message || '신고를 접수하지 못했습니다. 잠시 후 다시 시도해주세요.'
    } finally {
      isReporting.value = false
    }
  }
}

const openProfile = async () => {
  if (!props.userId) return

  reportStatus.value = 'idle'
  reportErrorMessage.value = ''
  isOpen.value = true

  if (profile.value || isLoading.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data } = await userProfileApi.getUserProfile(props.userId)
    profile.value = data.data
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || '프로필을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isLoading.value = false
  }
}

defineExpose({ openProfile })
</script>

<template>
  <button
    type="button"
    class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ink bg-[#ffe066] text-ink transition hover:shadow-[2px_2px_0_#1c1712] disabled:cursor-default"
    :aria-label="`${displayNickname} 프로필 보기`"
    :disabled="!userId"
    @click.stop="openProfile"
  >
    <img v-if="resolvedImageUrl" :src="resolvedImageUrl" :alt="`${displayNickname} 프로필 이미지`" class="h-full w-full object-cover" />
    <UserCircleIcon v-else class="h-8 w-8" />
  </button>

  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8"
      @click.self="closeProfile"
    >
      <section class="relative max-h-full w-full max-w-md overflow-y-auto rounded-2xl border-2 border-ink bg-white shadow-[6px_6px_0_#1c1712]">
        <button
          v-if="canReport"
          type="button"
          :class="reportButtonClass"
          :aria-label="reportButtonAriaLabel"
          :disabled="reportStatus === 'done' || isReporting"
          @click="handleReportClick"
        >
          <ExclamationTriangleIcon v-if="reportStatus === 'idle'" class="h-5 w-5" />
          <span v-else>{{ reportButtonText }}</span>
        </button>

        <button
          type="button"
          class="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-white text-ink shadow-[2px_2px_0_#1c1712] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          @click="closeProfile"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>

        <div class="px-5 pb-6 pt-5">
          <p v-if="isLoading" class="py-12 text-center text-sm font-bold text-[#8c7e6e]">
            프로필을 불러오는 중입니다
          </p>

          <p v-else-if="errorMessage" class="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {{ errorMessage }}
          </p>

          <template v-else>
            <div class="flex flex-col items-center text-center">
              <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-ink bg-[#ffe066] text-ink">
                <img
                  v-if="resolvedImageUrl"
                  :src="resolvedImageUrl"
                  :alt="`${displayNickname} 프로필 이미지`"
                  class="h-full w-full object-cover"
                />
                <UserCircleIcon v-else class="h-16 w-16" />
              </div>

              <h3 class="mt-4 text-2xl font-extrabold text-ink">{{ displayNickname }}</h3>
              <p class="mt-2 rounded-full border border-ink bg-[#ffe066]/60 px-3 py-1 text-xs font-bold text-ink">
                {{ profile?.cohort || '-' }}
              </p>
            </div>

            <div class="mt-6 flex flex-col gap-2">
              <div class="grid grid-cols-2 gap-2">
                <div
                  v-for="stat in profileStats"
                  :key="stat.label"
                  class="flex min-h-14 items-center justify-between gap-2 rounded-xl border border-[#c8bca8] bg-sub-bg px-3 py-2"
                >
                  <div class="flex min-w-0 items-center gap-1.5">
                    <component :is="stat.icon" class="h-4 w-4 shrink-0 text-primary" />
                    <span class="truncate text-xs font-bold text-[#8c7e6e]">{{ stat.label }}</span>
                  </div>
                  <span class="shrink-0 text-base font-extrabold text-ink">{{ stat.value }}</span>
                </div>
              </div>

              <div class="flex flex-col items-center gap-2 rounded-xl border border-[#c8bca8] bg-sub-bg px-4 py-3">
                <div class="flex items-center gap-1.5">
                  <ShieldCheckIcon class="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span class="text-xs font-bold text-[#8c7e6e]">신뢰도</span>
                </div>
                <TrustStars :score="profile?.trustScore ?? 0" size="lg" />
              </div>

              <p
                v-if="reportErrorMessage"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
              >
                {{ reportErrorMessage }}
              </p>
            </div>
          </template>
        </div>
      </section>
    </div>
  </Teleport>
</template>
