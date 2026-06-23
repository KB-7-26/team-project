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
    summary.value = await adminApi.getUserActivitySummary(props.user.userId ?? props.user.id)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})

const chartItems = computed(() => {
  if (!summary.value) return []
  return [
    { label: '상품 등록', count: summary.value.productCount ?? 0, color: 'bg-[#96d4b4]' },
    { label: '판매', count: summary.value.salesCount ?? 0, color: 'bg-[#2d5a48]' },
    { label: '구매', count: summary.value.purchaseCount ?? 0, color: 'bg-[#ffe066]' },
    { label: '게시글', count: summary.value.postCount ?? 0, color: 'bg-blue-400' },
    { label: '댓글', count: summary.value.commentCount ?? 0, color: 'bg-purple-400' },
  ]
})
</script>

<template>
  <div>
    <button
      @click="$emit('back')"
      class="flex items-center gap-1.5 text-sm text-[#8c7e6e] hover:text-ink mb-5 transition-colors cursor-pointer font-medium group"
    >
      ← 목록으로
    </button>

    <div class="bg-[#f0faf5] border-2 border-[#96d4b4]/50 rounded-2xl p-5 mb-5">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-[#2d5a48]/10 border-2 border-[#2d5a48]/30 flex items-center justify-center text-lg font-bold text-[#2d5a48]">
          {{ (user.nickname ?? '?')[0] }}
        </div>
        <div>
          <p class="font-bold text-ink">{{ user.nickname }}</p>
          <p class="text-xs text-[#8c7e6e]">{{ user.email }} · {{ cohort }}</p>
        </div>
        <div class="ml-auto">
          <span
            class="px-2 py-0.5 text-xs font-bold rounded-md border"
            :class="user.isSuspended ? 'bg-red-50 text-red-400 border-red-200' : 'bg-green-50 text-green-600 border-green-200'"
          >
            {{ user.isSuspended ? '정지' : '정상' }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12 text-sm text-[#8c7e6e]">불러오는 중...</div>
    <div v-else-if="error" class="text-center py-12 text-sm text-red-400">데이터를 불러오지 못했습니다.</div>
    <div v-else>
      <p class="text-xs font-bold text-[#8c7e6e] uppercase mb-4">활동 통계</p>
      <AdminBarChart :items="chartItems" />
    </div>
  </div>
</template>
