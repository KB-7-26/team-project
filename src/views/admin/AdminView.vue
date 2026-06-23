<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { boardApi } from '@/api/boardApi'
import { adminApi } from '@/api/adminApi'
import { useToastStore } from '@/stores/toast'
import { formatDate } from '@/utils/formatDate'

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
    if (pinnedPostId.value === id) pinnedPostId.value = null
    toast.show('게시글을 삭제했습니다.')
  } catch {
    toast.show('삭제에 실패했습니다.')
  }
}

// ---- 신고 관리 ----
const reports = ref([])
const reportsLoading = ref(false)

async function fetchReports() {
  reportsLoading.value = true
  try {
    const data = await adminApi.getReports()
    reports.value = data.content ?? (Array.isArray(data) ? data : [])
  } finally {
    reportsLoading.value = false
  }
}

async function deleteReportedContent(report) {
  const isProduct = report.type === 'PRODUCT'
  const label = isProduct ? '상품' : '게시글'
  if (!confirm(`신고된 ${label}을 삭제하시겠습니까?`)) return
  try {
    if (isProduct) {
      await adminApi.deleteProduct(report.targetId)
    } else {
      await adminApi.deletePost(report.targetId)
    }
    toast.show(`${label}을 삭제했습니다.`)
    reports.value = reports.value.filter(r => r.id !== report.id)
  } catch {
    toast.show('삭제에 실패했습니다.')
  }
}

// ---- 유저 관리 ----
const users = ref([])
const usersLoading = ref(false)
const usersPage = ref(0)
const usersTotalPages = ref(1)

async function fetchUsers(page = 0) {
  usersLoading.value = true
  try {
    const data = await adminApi.getUsers(page)
    users.value = data.content ?? []
    usersTotalPages.value = data.totalPages ?? 1
    usersPage.value = page
  } finally {
    usersLoading.value = false
  }
}

async function toggleSuspend(user) {
  try {
    await adminApi.toggleSuspend(user.id)
    toast.show(user.suspended ? '정지를 해제했습니다.' : '유저를 정지했습니다.')
    await fetchUsers(usersPage.value)
  } catch {
    toast.show('처리에 실패했습니다.')
  }
}

async function deleteUser(userId) {
  if (!confirm('유저를 강제 탈퇴 처리하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return
  try {
    await adminApi.deleteUser(userId)
    toast.show('유저를 탈퇴 처리했습니다.')
    await fetchUsers(usersPage.value)
  } catch {
    toast.show('처리에 실패했습니다.')
  }
}

function selectTab(tab) {
  activeTab.value = tab
  if (tab === 'notices') fetchNotices()
  else if (tab === 'reports' && reports.value.length === 0) fetchReports()
  else if (tab === 'users' && users.value.length === 0) fetchUsers()
}

const REPORT_TYPE_LABEL = { POST: '게시글', COMMENT: '댓글', PRODUCT: '상품', USER: '유저' }
const REPORT_TYPE_COLOR = {
  POST: 'bg-blue-50 text-blue-600 border-blue-200',
  COMMENT: 'bg-purple-50 text-purple-600 border-purple-200',
  PRODUCT: 'bg-amber-50 text-amber-600 border-amber-200',
  USER: 'bg-red-50 text-red-500 border-red-200',
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

          <!-- 공지 관리 -->
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
                  <tr
                    v-for="notice in notices"
                    :key="notice.id"
                    class="hover:bg-[#96d4b4]/5 transition-colors"
                  >
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

          <!-- 신고 관리 -->
          <div v-if="activeTab === 'reports'">
            <div v-if="reportsLoading" class="text-center py-16 text-sm text-[#8c7e6e]">불러오는 중...</div>
            <div v-else-if="reports.length === 0" class="text-center py-16 text-sm text-[#8c7e6e]">
              처리할 신고가 없습니다.
            </div>
            <div v-else class="overflow-x-auto">
              <table class="w-full text-center">
                <thead>
                  <tr>
                    <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4] w-20">유형</th>
                    <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4]">신고 대상</th>
                    <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4] w-28">신고자</th>
                    <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4] w-32">사유</th>
                    <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4] w-36">날짜</th>
                    <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4] w-20">조치</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="report in reports"
                    :key="report.id"
                    class="hover:bg-red-50/30 transition-colors"
                  >
                    <td class="py-3 border-b border-[#e8e0d4]">
                      <span
                        class="px-2 py-0.5 text-xs font-bold rounded-md border"
                        :class="REPORT_TYPE_COLOR[report.type] ?? 'bg-gray-50 text-gray-500 border-gray-200'"
                      >
                        {{ REPORT_TYPE_LABEL[report.type] ?? report.type }}
                      </span>
                    </td>
                    <td class="py-3 border-b border-[#e8e0d4] text-sm text-ink max-w-45 truncate text-center">
                      {{ report.targetTitle ?? report.targetContent ?? `#${report.targetId}` }}
                    </td>
                    <td class="py-3 border-b border-[#e8e0d4] text-xs text-[#8c7e6e] text-center">
                      {{ report.reporterNickname ?? report.reporterName ?? '—' }}
                    </td>
                    <td class="py-3 border-b border-[#e8e0d4] text-xs text-[#8c7e6e] max-w-30 truncate text-center">
                      {{ report.reason ?? '—' }}
                    </td>
                    <td class="py-3 border-b border-[#e8e0d4] text-xs text-[#8c7e6e] text-center">
                      {{ formatDate(report.createdAt) }}
                    </td>
                    <td class="py-3 border-b border-[#e8e0d4]">
                      <button
                        v-if="report.type !== 'USER'"
                        @click="deleteReportedContent(report)"
                        class="px-2.5 py-1 text-xs font-bold rounded-lg border-2 border-red-200 text-red-400 hover:bg-red-50 hover:border-red-400 transition-all cursor-pointer"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 유저 관리 -->
          <div v-if="activeTab === 'users'">
            <div v-if="usersLoading" class="text-center py-16 text-sm text-[#8c7e6e]">불러오는 중...</div>
            <div v-else-if="users.length === 0" class="text-center py-16 text-sm text-[#8c7e6e]">
              유저가 없습니다.
            </div>
            <div v-else>
              <div class="overflow-x-auto">
                <table class="w-full text-center">
                  <thead>
                    <tr>
                      <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4]">닉네임</th>
                      <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4]">이메일</th>
                      <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4] w-20">역할</th>
                      <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4] w-20">상태</th>
                      <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4] w-36">가입일</th>
                      <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4] w-44">조치</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="user in users"
                      :key="user.id"
                      class="hover:bg-[#96d4b4]/5 transition-colors"
                      :class="{ 'opacity-50': user.suspended }"
                    >
                      <td class="py-3 border-b border-[#e8e0d4] text-sm font-medium text-ink text-center">
                        {{ user.nickname ?? user.name ?? '—' }}
                      </td>
                      <td class="py-3 border-b border-[#e8e0d4] text-xs text-[#8c7e6e] text-center">
                        {{ user.email ?? '—' }}
                      </td>
                      <td class="py-3 border-b border-[#e8e0d4] text-center">
                        <span
                          class="px-2 py-0.5 text-xs font-bold rounded-md border"
                          :class="user.role?.includes('ADMIN')
                            ? 'bg-[#ff7b54]/10 text-[#cc5a3a] border-[#ff7b54]/30'
                            : 'bg-[#e8e0d4] text-[#8c7e6e] border-[#c8bca8]'"
                        >
                          {{ user.role?.includes('ADMIN') ? '관리자' : '일반' }}
                        </span>
                      </td>
                      <td class="py-3 border-b border-[#e8e0d4] text-center">
                        <span
                          class="px-2 py-0.5 text-xs font-bold rounded-md border"
                          :class="user.suspended
                            ? 'bg-red-50 text-red-500 border-red-200'
                            : 'bg-green-50 text-green-600 border-green-200'"
                        >
                          {{ user.suspended ? '정지' : '정상' }}
                        </span>
                      </td>
                      <td class="py-3 border-b border-[#e8e0d4] text-xs text-[#8c7e6e] text-center">
                        {{ formatDate(user.createdAt) }}
                      </td>
                      <td class="py-3 border-b border-[#e8e0d4]">
                        <div class="flex gap-1.5 justify-center">
                          <button
                            @click="toggleSuspend(user)"
                            class="px-2.5 py-1 text-xs font-bold rounded-lg border-2 transition-all cursor-pointer"
                            :class="user.suspended
                              ? 'border-green-300 text-green-600 hover:bg-green-50'
                              : 'border-[#c8bca8] text-[#8c7e6e] hover:border-ink hover:text-ink'"
                          >
                            {{ user.suspended ? '해제' : '정지' }}
                          </button>
                          <button
                            @click="deleteUser(user.id)"
                            class="p-1.5 rounded-lg border-2 border-red-200 text-red-400 hover:bg-red-50 hover:border-red-400 transition-all cursor-pointer"
                          >
                            <TrashIcon class="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 페이지네이션 -->
              <div v-if="usersTotalPages > 1" class="flex justify-center gap-1.5 mt-6">
                <button
                  v-for="p in usersTotalPages"
                  :key="p"
                  @click="fetchUsers(p - 1)"
                  class="w-8 h-8 rounded-lg border-2 text-xs font-bold transition-all cursor-pointer"
                  :class="usersPage === p - 1
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white border-[#c8bca8] text-[#8c7e6e] hover:border-ink hover:text-ink'"
                >
                  {{ p }}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
