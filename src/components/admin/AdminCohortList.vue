<script setup>
import { computed } from 'vue'

const props = defineProps({
  cohorts: {
    type: Array,
    required: true,
  },
  primaryLabel: {
    type: String,
    default: '유저',
  },
  secondaryLabel: {
    type: String,
    default: null,
  },
  emptyText: {
    type: String,
    default: '데이터가 없습니다.',
  },
})

defineEmits(['select'])

const maxPrimary = computed(() => Math.max(...props.cohorts.map(c => c.primaryCount ?? 0), 1))
</script>

<template>
  <div v-if="cohorts.length === 0" class="text-center py-16 text-sm text-[#8c7e6e]">
    {{ emptyText }}
  </div>
  <div v-else class="space-y-2">
    <button
      v-for="(item, index) in cohorts"
      :key="item.cohort"
      @click="$emit('select', item)"
      class="w-full flex items-center gap-4 p-4 bg-white border-2 border-[#e8e0d4] rounded-xl hover:border-ink hover:shadow-[2px_2px_0_#1c1712] transition-all cursor-pointer group text-left"
    >
      <span class="text-xs font-extrabold text-[#c8bca8] w-5 text-right shrink-0">{{ index + 1 }}</span>
      <span class="text-sm font-extrabold text-ink w-14 shrink-0">{{ item.cohort }}</span>
      <div class="flex-1 bg-[#f0ebe4] rounded-full h-2 overflow-hidden">
        <div
          class="h-full rounded-full bg-[#96d4b4] transition-all duration-700"
          :style="{ width: `${Math.max((item.primaryCount / maxPrimary) * 100, item.primaryCount > 0 ? 3 : 0)}%` }"
        />
      </div>
      <span class="text-sm font-bold text-ink shrink-0 text-right">
        {{ item.primaryCount }}<span class="text-xs text-[#8c7e6e] font-normal ml-0.5">{{ primaryLabel }}</span>
      </span>
      <span v-if="secondaryLabel != null" class="text-xs font-bold text-[#cc5a3a] shrink-0 w-16 text-right">
        {{ item.secondaryCount }}건
      </span>
      <span class="text-[#c8bca8] group-hover:text-ink transition-colors shrink-0 text-sm">›</span>
    </button>
  </div>
</template>
