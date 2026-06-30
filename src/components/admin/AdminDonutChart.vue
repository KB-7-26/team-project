<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Tooltip)

const props = defineProps({
  labels: { type: Array, required: true },
  values: { type: Array, required: true },
  colors: { type: Array, required: true },
  total: { type: Number, default: 0 },
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [{
    data: props.values,
    backgroundColor: props.colors,
    borderWidth: 2,
    borderColor: '#ffffff',
    hoverBorderWidth: 2,
  }],
}))

const options = {
  responsive: true,
  maintainAspectRatio: true,
  cutout: '68%',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.label}: ${ctx.raw}건`,
      },
    },
  },
}

const pct = (v) => props.total > 0 ? Math.round((v / props.total) * 100) : 0
</script>

<template>
  <div class="flex items-center gap-8">
    <div class="relative w-36 h-36 shrink-0">
      <Doughnut :data="chartData" :options="options" />
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-[10px] text-[#8c7e6e] font-medium">총 신고 수</span>
        <span class="text-2xl font-extrabold text-ink leading-tight">{{ total }}</span>
      </div>
    </div>

    <div class="space-y-3 flex-1">
      <div
        v-for="(label, i) in labels"
        :key="label"
        class="flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: colors[i] }" />
          <span class="text-sm text-[#8c7e6e]">{{ label }}</span>
        </div>
        <div class="text-right">
          <span class="text-sm font-bold text-ink">{{ values[i] }}</span>
          <span class="text-xs text-[#8c7e6e] ml-1">({{ pct(values[i]) }}%)</span>
        </div>
      </div>
    </div>
  </div>
</template>
