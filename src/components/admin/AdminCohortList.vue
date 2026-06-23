<script setup>
defineProps({
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
</script>

<template>
  <div v-if="cohorts.length === 0" class="text-center py-16 text-sm text-[#8c7e6e]">
    {{ emptyText }}
  </div>
  <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    <button
      v-for="item in cohorts"
      :key="item.cohort"
      @click="$emit('select', item)"
      class="flex flex-col items-start gap-1.5 p-4 bg-white border-2 border-[#c8bca8] rounded-2xl shadow-[2px_2px_0_#1c1712] hover:border-ink hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#1c1712] transition-all cursor-pointer text-left"
    >
      <span class="text-base font-extrabold text-ink">{{ item.cohort }}</span>
      <span class="text-xs text-[#8c7e6e]">
        {{ primaryLabel }} <span class="font-bold text-ink">{{ item.primaryCount }}</span>명
      </span>
      <span v-if="secondaryLabel != null" class="text-xs text-[#8c7e6e]">
        {{ secondaryLabel }} <span class="font-bold text-[#cc5a3a]">{{ item.secondaryCount }}</span>건
      </span>
    </button>
  </div>
</template>
