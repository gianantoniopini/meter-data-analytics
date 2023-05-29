<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { useI18n } from 'vue-i18n'
import type ChartDataset from '@/interfaces/chart-dataset.interface'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface Properties {
  labels: string[]
  datasets: ChartDataset[]
  title?: string
}

const { locale } = useI18n()

const props = defineProps<Properties>()

const options = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: props.title !== undefined,
      text: props.title,
      position: 'top'
    }
  },
  locale: locale.value
}))
const chartData = computed<ChartData<'line'>>(() => ({
  labels: props.labels,
  datasets: props.datasets
}))
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <Line :data="chartData" :options="options" class="col-12" />
    </div>
  </div>
</template>
