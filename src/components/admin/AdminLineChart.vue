<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const props = defineProps({
  labels: { type: Array, required: true },
  totalData: { type: Array, required: true },
  userReportData: { type: Array, required: true },
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: '전체 신고',
      data: props.totalData,
      borderColor: '#2d5a48',
      backgroundColor: 'rgba(45,90,72,0.08)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointBackgroundColor: '#2d5a48',
    },
    {
      label: '신고된 유저',
      data: props.userReportData,
      borderColor: '#cc5a3a',
      borderWidth: 2,
      borderDash: [5, 4],
      tension: 0.4,
      fill: false,
      pointRadius: 3,
      pointBackgroundColor: '#cc5a3a',
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: 'index', intersect: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, color: '#8c7e6e' },
    },
    y: {
      beginAtZero: true,
      grid: { color: '#f0ebe4' },
      ticks: { stepSize: 1, font: { size: 11 }, color: '#8c7e6e' },
    },
  },
}
</script>

<template>
  <div class="h-full">
    <div class="flex items-center gap-4 mb-3">
      <div class="flex items-center gap-1.5">
        <div class="w-5 h-0.5 bg-[#2d5a48]" />
        <span class="text-xs text-[#8c7e6e]">전체 신고</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-5 h-0.5 bg-[#cc5a3a] border-dashed border-t border-[#cc5a3a]" />
        <span class="text-xs text-[#8c7e6e]">신고된 유저</span>
      </div>
    </div>
    <div style="height: 170px">
      <Line :data="chartData" :options="options" />
    </div>
  </div>
</template>
