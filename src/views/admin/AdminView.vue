<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  MegaphoneIcon,
  Squares2X2Icon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline'
import { boardApi } from '@/api/boardApi'
import { adminApi } from '@/api/adminApi'
import { useToastStore } from '@/stores/toast'
import { formatDate } from '@/utils/formatDate'
import AdminCohortList from '@/components/admin/AdminCohortList.vue'
import AdminUserList from '@/components/admin/AdminUserList.vue'
import AdminReportDashboard from '@/components/admin/AdminReportDashboard.vue'
import AdminActivityDashboard from '@/components/admin/AdminActivityDashboard.vue'
import AdminDonutChart from '@/components/admin/AdminDonutChart.vue'
import AdminLineChart from '@/components/admin/AdminLineChart.vue'

const router = useRouter()
const toast = useToastStore()

// ---- 사이드바 네비게이션 ----
const activePage = ref('dashboard')

const NAV_ITEMS = [
  { key: 'dashboard', icon: Squares2X2Icon, label: '대시보드' },
  { key: 'notices',   icon: MegaphoneIcon, label: '공지 관리' },
  { key: 'reports',   icon: ExclamationTriangleIcon, label: '신고 관리' },
  { key: 'users',     icon: UsersIcon, label: '유저 관리' },
]

function selectPage(key) {
  activePage.value = key
  if (key === 'notices' && notices.value.length === 0) fetchNotices()
  if (key === 'reports' && reportCohorts.value.length === 0) fetchReportCohorts()
  if (key === 'users' && userCohorts.value.length === 0) fetchUserCohorts()
}

// ---- 공지 관리 ----
const notices = ref([])
const noticesLoading = ref(false)

async function fetchNotices() {
  noticesLoading.value = true
  try {
    const data = await boardApi.getPosts(0, 50, null, 'all', '공지')
    notices.value = data?.content ?? []
  } finally {
    noticesLoading.value = false
  }
}

async function deleteNotice(id) {
  if (!confirm('이 공지글을 삭제하시겠습니까?')) return
  try {
    await adminApi.deletePost(id)
    notices.value = notices.value.filter(n => n.id !== id)
    toast.show('게시글을 삭제했습니다.')
  } catch {
    toast.show('삭제에 실패했습니다.')
  }
}

// ---- 신고 관리 ----
const reportView = ref('cohorts')
const reportCohorts = ref([])
const reportCohortsLoading = ref(false)
const selectedReportCohort = ref(null)
const selectedReportUser = ref(null)

async function fetchReportCohorts() {
  reportCohortsLoading.value = true
  try {
    const data = await adminApi.getReportsByCohort()
    reportCohorts.value = (data ?? []).map(c => ({
      ...c,
      primaryCount: c.reportedUserCount,
      secondaryCount: c.totalReportCount,
    }))
  } finally {
    reportCohortsLoading.value = false
  }
}

function selectReportCohort(cohort) {
  selectedReportCohort.value = cohort
  reportView.value = 'users'
}

function selectReportUser(user) {
  selectedReportUser.value = user
  reportView.value = 'dashboard'
}

function backToReportCohorts() {
  selectedReportCohort.value = null
  selectedReportUser.value = null
  reportView.value = 'cohorts'
}

function backToReportUsers() {
  selectedReportUser.value = null
  reportView.value = 'users'
}

// ---- 유저 관리 ----
const usersView = ref('cohorts')
const userCohorts = ref([])
const userCohortsLoading = ref(false)
const selectedUserCohort = ref(null)
const cohortUsers = ref([])
const cohortUsersLoading = ref(false)
const selectedUser = ref(null)

async function fetchUserCohorts() {
  userCohortsLoading.value = true
  try {
    const data = await adminApi.getUserCohortSummary()
    userCohorts.value = (data ?? []).map(c => ({
      ...c,
      primaryCount: c.userCount,
    }))
  } finally {
    userCohortsLoading.value = false
  }
}

async function selectUserCohort(cohort) {
  selectedUserCohort.value = cohort
  usersView.value = 'users'
  cohortUsersLoading.value = true
  try {
    const data = await adminApi.getUsersByCohort(cohort.cohort)
    cohortUsers.value = (data?.content ?? []).map(u => ({ ...u, userId: u.id }))
  } finally {
    cohortUsersLoading.value = false
  }
}

function selectUser(user) {
  selectedUser.value = user
  usersView.value = 'dashboard'
}

function backToUserCohorts() {
  selectedUserCohort.value = null
  selectedUser.value = null
  cohortUsers.value = []
  usersView.value = 'cohorts'
}

function backToUserList() {
  selectedUser.value = null
  usersView.value = 'users'
}

// ---- 대시보드 ----
const recentReports = ref([])

// KPI 집계
const totalUserCount = computed(() => userCohorts.value.reduce((s, c) => s + (c.primaryCount ?? 0), 0))
const totalReportCount = computed(() => reportCohorts.value.reduce((s, c) => s + (c.secondaryCount ?? 0), 0))
const reportedUserCount = computed(() => reportCohorts.value.reduce((s, c) => s + (c.primaryCount ?? 0), 0))

// 도넛 차트 - 카테고리 3개 (상품/유저/게시글)
// TODO: 백엔드에서 카테고리별 신고 수 API 연동 필요 (GET /admin/reports/category-summary)
const donutLabels = ['상품', '유저', '게시글']
const donutColors = ['#d4920a', '#cc5a3a', '#2d5a48']
const donutValues = computed(() => {
  const total = totalReportCount.value
  if (total === 0) return [0, 0, 0]
  // 임시: 유저 신고 수는 reportedUserCount, 나머지는 추후 API 연동
  const user = reportedUserCount.value
  const product = Math.max(total - user, 0)
  return [product, user, 0]
})

// 라인 차트 - 주별 신고 추이
// TODO: 백엔드 시계열 API 연동 필요 (GET /admin/reports/weekly-trend)
const lineLabels = computed(() => {
  const result = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    result.push(`${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`)
  }
  return result
})

const lineTotalData = computed(() => {
  const t = totalReportCount.value
  if (t === 0) return [0, 0, 0, 0, 0, 0]
  return [0, Math.round(t * 0.1), Math.round(t * 0.3), Math.round(t * 0.5), Math.round(t * 0.8), t]
})

const lineUserData = computed(() => {
  const u = reportedUserCount.value
  if (u === 0) return [0, 0, 0, 0, 0, 0]
  return [0, 0, Math.round(u * 0.2), Math.round(u * 0.4), Math.round(u * 0.7), u]
})

const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace('.', '')

const STATUS_LABEL = {
  PENDING: { text: '대기', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
  REVIEWED: { text: '검토중', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  RESOLVED: { text: '처리됨', cls: 'bg-green-50 text-green-600 border-green-200' },
  REJECTED: { text: '반려', cls: 'bg-paper text-[#8c7e6e] border-[#e8e0d4]' },
}

onMounted(async () => {
  await Promise.all([
    fetchNotices(),
    fetchReportCohorts(),
    fetchUserCohorts(),
  ])
  try {
    const data = await adminApi.getReports(0, 5)
    recentReports.value = data?.reports ?? []
  } catch { /* 대시보드 최근 신고 로드 실패 시 빈 상태 유지 */ }
})
</script>

<template>
  <div class="flex min-h-screen bg-paper">

    <!-- ===== 사이드바 ===== -->
    <aside class="w-52 min-h-screen bg-ink flex flex-col fixed left-0 top-0 z-20">
      <!-- 브랜드 -->
      <div class="px-5 py-5 border-b border-white/10">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">🛡️</span>
          <span class="text-white font-bold text-sm leading-tight">관리자 페이지</span>
        </div>
      </div>

      <!-- 네비게이션 -->
      <nav class="flex-1 p-3 space-y-0.5 mt-1">
        <button
          v-for="item in NAV_ITEMS"
          :key="item.key"
          @click="selectPage(item.key)"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left"
          :class="activePage === item.key
            ? 'bg-primary text-white'
            : 'text-white/55 hover:text-white hover:bg-white/8'"
        >
          <component :is="item.icon" class="w-4 h-4" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <!-- 하단 -->
      <div class="p-3 border-t border-white/10">
        <button
          @click="router.push('/')"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-white/55 hover:text-white hover:bg-white/8 transition-all cursor-pointer"
        >
          <span>←</span>
          <span>홈으로</span>
        </button>
      </div>
    </aside>

    <!-- ===== 메인 콘텐츠 ===== -->
    <main class="ml-52 flex-1 min-h-screen overflow-auto">

      <!-- ===== 대시보드 ===== -->
      <div v-if="activePage === 'dashboard'" class="p-8">
        <!-- 헤더 -->
          <div class="flex items-center justify-between mb-7">
            <h1 class="text-2xl font-bold text-ink">대시보드</h1>
            <span class="text-sm text-[#8c7e6e] inline-flex items-center gap-1.5">
              <CalendarDaysIcon class="w-4 h-4" />
              {{ today }} 기준
            </span>
          </div>

        <!-- KPI 카드 -->
        <div class="grid grid-cols-4 gap-4 mb-5">
          <div class="bg-white border-2 border-ink rounded-2xl shadow-[3px_3px_0_#1c1712] overflow-hidden flex">
            <div class="w-1.5 bg-[#2d5a48] shrink-0" />
            <div class="p-4 flex-1">
              <p class="text-[10px] font-bold uppercase tracking-widest text-[#8c7e6e] mb-1.5">총 유저</p>
              <p class="text-3xl font-extrabold text-ink leading-none">{{ totalUserCount }}</p>
              <p class="text-[10px] text-[#8c7e6e] mt-2">{{ userCohorts.length }}개 기수</p>
            </div>
          </div>
          <div class="bg-white border-2 border-ink rounded-2xl shadow-[3px_3px_0_#1c1712] overflow-hidden flex">
            <div class="w-1.5 bg-[#cc5a3a] shrink-0" />
            <div class="p-4 flex-1">
              <p class="text-[10px] font-bold uppercase tracking-widest text-[#8c7e6e] mb-1.5">총 신고</p>
              <p class="text-3xl font-extrabold text-ink leading-none">{{ totalReportCount }}</p>
              <p class="text-[10px] text-[#8c7e6e] mt-2">신고된 유저 {{ reportedUserCount }}명</p>
            </div>
          </div>
          <div class="bg-white border-2 border-ink rounded-2xl shadow-[3px_3px_0_#1c1712] overflow-hidden flex">
            <div class="w-1.5 bg-[#3d5282] shrink-0" />
            <div class="p-4 flex-1">
              <p class="text-[10px] font-bold uppercase tracking-widest text-[#8c7e6e] mb-1.5">공지글</p>
              <p class="text-3xl font-extrabold text-ink leading-none">{{ notices.length }}</p>
              <p class="text-[10px] text-[#8c7e6e] mt-2">등록된 공지</p>
            </div>
          </div>
          <div class="bg-white border-2 border-ink rounded-2xl shadow-[3px_3px_0_#1c1712] overflow-hidden flex">
            <div class="w-1.5 bg-primary shrink-0" />
            <div class="p-4 flex-1">
              <p class="text-[10px] font-bold uppercase tracking-widest text-[#8c7e6e] mb-1.5">활성 유저</p>
              <p class="text-3xl font-extrabold text-ink leading-none">—</p>
              <p class="text-[10px] text-[#8c7e6e] mt-2">이번 달 방문자</p>
            </div>
          </div>
        </div>

        <!-- 차트 행 -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <!-- 도넛 차트 -->
          <div class="bg-white border-2 border-ink rounded-2xl shadow-[3px_3px_0_#1c1712] p-5">
            <p class="text-sm font-bold text-ink mb-5">카테고리별 신고 현황</p>
            <AdminDonutChart
              :labels="donutLabels"
              :values="donutValues"
              :colors="donutColors"
              :total="totalReportCount"
            />
          </div>

          <!-- 라인 차트 -->
          <div class="bg-white border-2 border-ink rounded-2xl shadow-[3px_3px_0_#1c1712] p-5">
            <p class="text-sm font-bold text-ink mb-3">신고 추이</p>
            <AdminLineChart
              :labels="lineLabels"
              :total-data="lineTotalData"
              :user-report-data="lineUserData"
            />
          </div>
        </div>

        <!-- 최근 목록 행 -->
        <div class="grid grid-cols-2 gap-4">
          <!-- 최근 신고 -->
          <div class="bg-white border-2 border-ink rounded-2xl shadow-[3px_3px_0_#1c1712] p-5">
            <div class="flex items-center justify-between mb-4">
              <p class="text-sm font-bold text-ink">최근 신고 목록</p>
              <button
                @click="selectPage('reports')"
                class="text-xs text-[#8c7e6e] hover:text-ink transition-colors cursor-pointer"
              >
                전체 보기 →
              </button>
            </div>
            <div v-if="recentReports.length === 0" class="text-center py-8 text-xs text-[#8c7e6e]">
              신고 내역이 없습니다.
            </div>
            <div v-else class="space-y-0">
              <div
                v-for="r in recentReports"
                :key="r.id"
                class="flex items-center gap-3 py-2.5 border-b border-[#f0ebe4] last:border-0"
              >
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-ink truncate">{{ r.reportedUserNickname }}</p>
                  <p class="text-[10px] text-[#8c7e6e] truncate">신고자: {{ r.reporterNickname }}</p>
                </div>
                <span
                  class="text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0"
                  :class="STATUS_LABEL[r.status]?.cls ?? 'bg-paper text-[#8c7e6e] border-[#e8e0d4]'"
                >
                  {{ STATUS_LABEL[r.status]?.text ?? r.status }}
                </span>
                <p class="text-[10px] text-[#8c7e6e] shrink-0">{{ formatDate(r.createdAt) }}</p>
              </div>
            </div>
          </div>

          <!-- 최근 공지 -->
          <div class="bg-white border-2 border-ink rounded-2xl shadow-[3px_3px_0_#1c1712] p-5">
            <div class="flex items-center justify-between mb-4">
              <p class="text-sm font-bold text-ink">최근 공지</p>
              <button
                @click="selectPage('notices')"
                class="text-xs text-[#8c7e6e] hover:text-ink transition-colors cursor-pointer"
              >
                전체 보기 →
              </button>
            </div>
            <div v-if="notices.length === 0" class="text-center py-8 text-xs text-[#8c7e6e]">
              등록된 공지가 없습니다.
            </div>
            <div v-else class="space-y-0">
              <div
                v-for="n in notices.slice(0, 5)"
                :key="n.id"
                class="flex items-center justify-between py-2.5 border-b border-[#f0ebe4] last:border-0 gap-3"
              >
                <RouterLink
                  :to="`/board/${n.id}`"
                  class="text-xs font-medium text-ink hover:text-[#2d5a48] hover:underline transition-colors truncate flex-1"
                >
                  {{ n.title }}
                </RouterLink>
                <p class="text-[10px] text-[#8c7e6e] shrink-0">{{ formatDate(n.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 공지 관리 ===== -->
      <div v-else-if="activePage === 'notices'" class="p-8">
        <h1 class="text-2xl font-bold text-ink mb-7">공지 관리</h1>

        <div class="bg-white border-2 border-ink rounded-2xl shadow-[3px_3px_0_#1c1712] overflow-hidden">
          <div v-if="noticesLoading" class="text-center py-16 text-sm text-[#8c7e6e]">불러오는 중...</div>
          <div v-else-if="notices.length === 0" class="text-center py-16 text-sm text-[#8c7e6e]">
            등록된 공지가 없습니다.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-[#f8f5f0]">
                <tr>
                  <th class="text-left text-xs font-bold text-[#8c7e6e] px-5 py-3 border-b-2 border-[#e8e0d4]">제목</th>
                  <th class="text-center text-xs font-bold text-[#8c7e6e] px-5 py-3 border-b-2 border-[#e8e0d4] w-36">작성일</th>
                  <th class="text-center text-xs font-bold text-[#8c7e6e] px-5 py-3 border-b-2 border-[#e8e0d4] w-20">삭제</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="notice in notices" :key="notice.id" class="hover:bg-[#f8f5f0] transition-colors">
                  <td class="px-5 py-3.5 border-b border-[#f0ebe4]">
                    <RouterLink
                      :to="`/board/${notice.id}`"
                      class="text-sm font-medium text-ink hover:text-[#2d5a48] hover:underline transition-colors"
                    >
                      {{ notice.title }}
                    </RouterLink>
                  </td>
                  <td class="px-5 py-3.5 border-b border-[#f0ebe4] text-xs text-[#8c7e6e] text-center">
                    {{ formatDate(notice.createdAt) }}
                  </td>
                  <td class="px-5 py-3.5 border-b border-[#f0ebe4] text-center">
                    <button
                      @click="deleteNotice(notice.id)"
                      class="p-1.5 rounded-lg border-2 border-red-200 text-red-400 hover:bg-red-50 hover:border-red-400 transition-all cursor-pointer"
                    >
                      <TrashIcon class="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===== 신고 관리 ===== -->
      <div v-else-if="activePage === 'reports'" class="p-8">
        <div class="flex items-center gap-3 mb-7">
          <h1 class="text-2xl font-bold text-ink">신고 관리</h1>
          <template v-if="reportView !== 'cohorts'">
            <span class="text-[#c8bca8]">/</span>
            <button
              @click="backToReportCohorts"
              class="text-sm text-[#8c7e6e] hover:text-ink transition-colors cursor-pointer"
            >
              기수 목록
            </button>
            <template v-if="reportView === 'dashboard'">
              <span class="text-[#c8bca8]">/</span>
              <span class="text-sm text-[#8c7e6e]">{{ selectedReportCohort?.cohort }}</span>
              <span class="text-[#c8bca8]">/</span>
              <span class="text-sm font-bold text-ink">{{ selectedReportUser?.nickname }}</span>
            </template>
            <template v-else>
              <span class="text-[#c8bca8]">/</span>
              <span class="text-sm font-bold text-ink">{{ selectedReportCohort?.cohort }}</span>
            </template>
          </template>
        </div>

        <div class="bg-white border-2 border-ink rounded-2xl shadow-[3px_3px_0_#1c1712] p-6">
          <template v-if="reportView === 'cohorts'">
            <div v-if="reportCohortsLoading" class="text-center py-16 text-sm text-[#8c7e6e]">불러오는 중...</div>
            <AdminCohortList
              v-else
              :cohorts="reportCohorts"
              primary-label="신고된 유저"
              secondary-label="총 신고"
              empty-text="신고 내역이 없습니다."
              @select="selectReportCohort"
            />
          </template>

          <template v-else-if="reportView === 'users'">
            <AdminUserList
              :users="selectedReportCohort?.users ?? []"
              stat-label="신고 건수"
              stat-key="totalReportCount"
              @select="selectReportUser"
            />
          </template>

          <template v-else-if="reportView === 'dashboard'">
            <AdminReportDashboard
              :user="selectedReportUser"
              :cohort="selectedReportCohort?.cohort ?? ''"
              @back="backToReportUsers"
            />
          </template>
        </div>
      </div>

      <!-- ===== 유저 관리 ===== -->
      <div v-else-if="activePage === 'users'" class="p-8">
        <div class="flex items-center gap-3 mb-7">
          <h1 class="text-2xl font-bold text-ink">유저 관리</h1>
          <template v-if="usersView !== 'cohorts'">
            <span class="text-[#c8bca8]">/</span>
            <button
              @click="backToUserCohorts"
              class="text-sm text-[#8c7e6e] hover:text-ink transition-colors cursor-pointer"
            >
              기수 목록
            </button>
            <template v-if="usersView === 'dashboard'">
              <span class="text-[#c8bca8]">/</span>
              <span class="text-sm text-[#8c7e6e]">{{ selectedUserCohort?.cohort }}</span>
              <span class="text-[#c8bca8]">/</span>
              <span class="text-sm font-bold text-ink">{{ selectedUser?.nickname }}</span>
            </template>
            <template v-else>
              <span class="text-[#c8bca8]">/</span>
              <span class="text-sm font-bold text-ink">{{ selectedUserCohort?.cohort }}</span>
            </template>
          </template>
        </div>

        <div class="bg-white border-2 border-ink rounded-2xl shadow-[3px_3px_0_#1c1712] p-6">
          <template v-if="usersView === 'cohorts'">
            <div v-if="userCohortsLoading" class="text-center py-16 text-sm text-[#8c7e6e]">불러오는 중...</div>
            <AdminCohortList
              v-else
              :cohorts="userCohorts"
              primary-label="가입자"
              empty-text="유저 데이터가 없습니다."
              @select="selectUserCohort"
            />
          </template>

          <template v-else-if="usersView === 'users'">
            <div v-if="cohortUsersLoading" class="text-center py-16 text-sm text-[#8c7e6e]">불러오는 중...</div>
            <AdminUserList
              v-else
              :users="cohortUsers"
              stat-label="신뢰점수"
              stat-key="trustScore"
              @select="selectUser"
            />
          </template>

          <template v-else-if="usersView === 'dashboard'">
            <AdminActivityDashboard
              :user="selectedUser"
              :cohort="selectedUserCohort?.cohort ?? ''"
              @back="backToUserList"
            />
          </template>
        </div>
      </div>

    </main>
  </div>
</template>
