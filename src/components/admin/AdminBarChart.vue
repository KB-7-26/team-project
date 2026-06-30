<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const max = computed(() => Math.max(...props.items.map(i => i.count), 1))

function barWidth(count) {
  if (count === 0) return '0%'
  return `${Math.max(Math.round((count / max.value) * 100), 4)}%`
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div v-for="item in items" :key="item.label" class="flex items-center gap-3">
      <span class="text-xs font-bold text-[#8c7e6e] w-16 text-right shrink-0">{{ item.label }}</span>
      <div class="flex-1 bg-[#f0ebe3] rounded-lg h-8 overflow-hidden border border-[#e8e0d4] relative">
        <div
          class="h-full rounded-lg transition-all duration-700 flex items-center justify-end px-3"
          :class="item.count > 0 ? item.color : 'bg-transparent'"
          :style="{ width: barWidth(item.count) }"
        >
          <span v-if="item.count > 0" class="text-xs font-extrabold text-white/90 drop-shadow">
            {{ item.count }}
          </span>
        </div>
        <span v-if="item.count === 0" class="absolute inset-0 flex items-center px-3 text-xs text-[#c8bca8] font-medium">
          0
        </span>
      </div>
    </div>
  </div>
</template>
