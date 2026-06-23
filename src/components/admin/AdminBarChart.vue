<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const max = computed(() => Math.max(...props.items.map(i => i.count), 1))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-for="item in items" :key="item.label" class="flex items-center gap-3">
      <span class="text-xs font-bold text-[#8c7e6e] w-16 text-right shrink-0">{{ item.label }}</span>
      <div class="flex-1 bg-[#f0ebe3] rounded-full h-6 overflow-hidden border border-[#e8e0d4]">
        <div
          class="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
          :class="item.count > 0 ? item.color : 'bg-transparent'"
          :style="{ width: item.count > 0 ? `${Math.max(Math.round((item.count / max) * 100), 4)}%` : '0%' }"
        />
      </div>
      <span class="text-sm font-bold text-ink w-8 text-right shrink-0">{{ item.count }}</span>
    </div>
  </div>
</template>
