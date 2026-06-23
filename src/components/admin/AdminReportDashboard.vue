<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminBarChart from './AdminBarChart.vue'
import { adminApi } from '@/api/adminApi'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  cohort: {
    type: String,
    required: true,
  },
})

defineEmits(['back'])

const summary = ref(null)
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    summary.value = await adminApi.getUserReportSummary(props.user.userId)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})

const chartItems = computed(() => {
  if (!summary.value) return []
  return [
    { label: '상품', count: summary.value.product ?? 0, color: 'bg-amber-400' },
    { label: '게시글', count: summary.value.post ?? 0, color: 'bg-blue-400' },
    { label: '댓글', count: summary.value.comment ?? 0, color: 'bg-purple-400' },
    { label: '유저', count: summary.value.user ?? 0, color: 'bg-red-400' },
  ]
})

const totalCount = computed(() => chartItems.value.reduce((s, i) => s + i.count, 0))
</script>

<template>
  <div>
    <button
      @click="$emit('back')"
      class="flex items-center gap-1.5 text-sm text-[#8c7e6e] hover:text-ink mb-5 transition-colors cursor-pointer font-medium group"
    >
      ← 목록으로
    </button>

    <div class="bg-[#fff8f0] border-2 border-[#e8e0d4] rounded-2xl p-5 mb-5">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-[#cc5a3a]/10 border-2 border-[#cc5a3a]/30 flex items-center justify-center text-lg font-bold text-[#cc5a3a]">
          {{ (user.nickname ?? '?')[0] }}
        </div>
        <div>
          <p class="font-bold text-ink">{{ user.nickname }}</p>
          <p class="text-xs text-[#8c7e6e]">{{ user.email }} · {{ cohort }}</p>
        </div>
        <div class="ml-auto text-right">
          <p class="text-2xl font-extrabold text-[#cc5a3a]">{{ user.totalReportCount ?? totalCount }}</p>
          <p class="text-xs text-[#8c7e6e]">총 신고 건수</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12 text-sm text-[#8c7e6e]">불러오는 중...</div>
    <div v-else-if="error" class="text-center py-12 text-sm text-red-400">데이터를 불러오지 못했습니다.</div>
    <div v-else>
      <p class="text-xs font-bold text-[#8c7e6e] uppercase mb-4">카테고리별 신고 건수</p>
      <AdminBarChart :items="chartItems" />
    </div>
  </div>
</template>
