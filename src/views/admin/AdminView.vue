<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { boardApi } from '@/api/boardApi'
import { adminApi } from '@/api/adminApi'
import { useToastStore } from '@/stores/toast'
import { formatDate } from '@/utils/formatDate'
import AdminCohortList from '@/components/admin/AdminCohortList.vue'
import AdminUserList from '@/components/admin/AdminUserList.vue'
import AdminReportDashboard from '@/components/admin/AdminReportDashboard.vue'
import AdminActivityDashboard from '@/components/admin/AdminActivityDashboard.vue'

const router = useRouter()
const toast = useToastStore()
const activeTab = ref('notices')

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
// view: 'cohorts' | 'users' | 'dashboard'
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
// view: 'cohorts' | 'users' | 'dashboard'
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
    cohortUsers.value = (data?.content ?? []).map(u => ({
      ...u,
      userId: u.id,
    }))
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

function selectTab(tab) {
  activeTab.value = tab
  if (tab === 'notices' && notices.value.length === 0) fetchNotices()
  else if (tab === 'reports' && reportCohorts.value.length === 0) fetchReportCohorts()
  else if (tab === 'users' && userCohorts.value.length === 0) fetchUserCohorts()
}

onMounted(() => {
  fetchNotices()
})
</script>

<template>
  <div class="bg-paper-dots min-h-screen">
    <div class="max-w-5xl mx-auto px-6 py-8">
      <button
        @click="router.push('/')"
        class="flex items-center gap-1.5 text-sm text-[#8c7e6e] hover:text-ink mb-6 transition-colors cursor-pointer font-medium group"
      >
        <ArrowLeftIcon class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        홈으로
      </button>

      <div class="bg-white border-2 border-ink rounded-2xl shadow-[4px_4px_0_#1c1712] overflow-hidden">
        <div class="h-1.5 bg-[#ff7b54]" />
        <div class="p-6">
          <h1 class="font-sketch font-bold text-2xl text-ink mb-6">🛡️ 관리자 페이지</h1>

          <!-- Tabs -->
          <div class="flex gap-2 mb-6 border-b-2 border-[#e8e0d4] pb-4">
            <button
              v-for="tab in [{ key: 'notices', label: '📌 공지 관리' }, { key: 'reports', label: '🚨 신고 관리' }, { key: 'users', label: '👥 유저 관리' }]"
              :key="tab.key"
              @click="selectTab(tab.key)"
              class="px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer"
              :class="activeTab === tab.key
                ? 'bg-ink text-white border-ink shadow-[2px_2px_0_#8c7e6e]'
                : 'bg-white border-[#c8bca8] text-[#8c7e6e] hover:border-ink hover:text-ink'"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- ===== 공지 관리 ===== -->
          <div v-if="activeTab === 'notices'">
            <div v-if="noticesLoading" class="text-center py-16 text-sm text-[#8c7e6e]">불러오는 중...</div>
            <div v-else-if="notices.length === 0" class="text-center py-16 text-sm text-[#8c7e6e]">
              등록된 공지가 없습니다.
            </div>
            <div v-else class="overflow-x-auto">
              <table class="w-full text-center">
                <thead>
                  <tr>
                    <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4]">제목</th>
                    <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4] w-40">작성일</th>
                    <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4] w-20">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="notice in notices" :key="notice.id" class="hover:bg-[#96d4b4]/5 transition-colors">
                    <td class="py-3 border-b border-[#e8e0d4] text-center">
                      <RouterLink
                        :to="`/board/${notice.id}`"
                        class="text-sm font-medium text-ink hover:text-[#2d5a48] hover:underline transition-colors"
                      >
                        {{ notice.title }}
                      </RouterLink>
                    </td>
                    <td class="py-3 border-b border-[#e8e0d4] text-xs text-[#8c7e6e] text-center">
                      {{ formatDate(notice.createdAt) }}
                    </td>
                    <td class="py-3 border-b border-[#e8e0d4]">
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

          <!-- ===== 신고 관리 ===== -->
          <div v-if="activeTab === 'reports'">

            <!-- 기수 목록 -->
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

            <!-- 기수 내 신고된 유저 목록 -->
            <template v-else-if="reportView === 'users'">
              <div class="flex items-center gap-3 mb-4">
                <button
                  @click="backToReportCohorts"
                  class="text-sm text-[#8c7e6e] hover:text-ink transition-colors cursor-pointer font-medium"
                >
                  ← 기수 목록
                </button>
                <span class="text-[#c8bca8]">/</span>
                <span class="text-sm font-bold text-ink">{{ selectedReportCohort?.cohort }}</span>
              </div>
              <AdminUserList
                :users="selectedReportCohort?.users ?? []"
                stat-label="신고 건수"
                stat-key="totalReportCount"
                @select="selectReportUser"
              />
            </template>

            <!-- 유저 신고 대시보드 -->
            <template v-else-if="reportView === 'dashboard'">
              <AdminReportDashboard
                :user="selectedReportUser"
                :cohort="selectedReportCohort?.cohort ?? ''"
                @back="backToReportUsers"
              />
            </template>
          </div>

          <!-- ===== 유저 관리 ===== -->
          <div v-if="activeTab === 'users'">

            <!-- 기수 목록 -->
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

            <!-- 기수 내 유저 목록 -->
            <template v-else-if="usersView === 'users'">
              <div class="flex items-center gap-3 mb-4">
                <button
                  @click="backToUserCohorts"
                  class="text-sm text-[#8c7e6e] hover:text-ink transition-colors cursor-pointer font-medium"
                >
                  ← 기수 목록
                </button>
                <span class="text-[#c8bca8]">/</span>
                <span class="text-sm font-bold text-ink">{{ selectedUserCohort?.cohort }}</span>
              </div>
              <div v-if="cohortUsersLoading" class="text-center py-16 text-sm text-[#8c7e6e]">불러오는 중...</div>
              <AdminUserList
                v-else
                :users="cohortUsers"
                stat-label="신뢰점수"
                stat-key="trustScore"
                @select="selectUser"
              />
            </template>

            <!-- 유저 활동 대시보드 -->
            <template v-else-if="usersView === 'dashboard'">
              <AdminActivityDashboard
                :user="selectedUser"
                :cohort="selectedUserCohort?.cohort ?? ''"
                @back="backToUserList"
              />
            </template>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
