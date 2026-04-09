<script setup lang="ts">
import { computed } from 'vue'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type ScriptableContext,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface TripMetricChartPoint {
  label: string
  value: number
}

const props = defineProps<{
  points: TripMetricChartPoint[]
  color: string
  areaColor: string
  suffix?: string
}>()

const getPointRadius = (): number => {
  if (props.points.length > 180) {
    return 0
  }

  if (props.points.length > 80) {
    return 1.5
  }

  return 2.5
}

const chartData = computed<ChartData<'line'>>(() => ({
  labels: props.points.map((point) => point.label),
  datasets: [
    {
      data: props.points.map((point) => point.value),
      borderColor: props.color,
      backgroundColor: (context: ScriptableContext<'line'>) => {
        const chart = context.chart
        const { ctx, chartArea } = chart

        if (!chartArea) {
          return props.areaColor
        }

        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, props.areaColor)
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0.02)')

        return gradient
      },
      fill: true,
      tension: 0.28,
      cubicInterpolationMode: 'monotone',
      pointRadius: getPointRadius(),
      pointHoverRadius: 4,
      pointBorderWidth: 1.5,
      pointBackgroundColor: props.color,
      pointBorderColor: '#111827',
      pointHitRadius: 12,
      borderWidth: 2.75,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 250,
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      displayColors: false,
      backgroundColor: 'rgba(8, 17, 32, 0.92)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1,
      titleColor: '#f8fafc',
      bodyColor: '#dbe7ff',
      padding: 12,
      cornerRadius: 12,
      callbacks: {
        title: (items) => items[0]?.label ?? '',
        label: (context) => `${context.parsed.y}${props.suffix ?? ''}`,
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.04)',
        drawBorder: false,
        drawTicks: false,
      },
      ticks: {
        color: '#94a3b8',
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8,
      },
      border: {
        display: false,
      },
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false,
        drawTicks: false,
      },
      ticks: {
        color: '#94a3b8',
        maxTicksLimit: 6,
        callback: (value) => `${value}${props.suffix ?? ''}`,
      },
      border: {
        display: false,
      },
    },
  },
}))
</script>

<template>
  <div class="trip-chart-canvas">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
