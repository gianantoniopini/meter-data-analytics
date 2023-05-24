<script setup lang="ts">
import { computed, ref } from 'vue'
import { Line } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { useI18n } from 'vue-i18n'
import type ChartDataset from '@/interfaces/chart-dataset.interface'

interface Properties {
  labels: string[];
  datasets: ChartDataset[];
  title?: string;
}

const { locale } = useI18n()

const props = defineProps<Properties>()

const options = ref<ChartOptions<'line'>>({
  responsive: true,
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
})
const chartData = computed<ChartData<'line'>>(() => ({
  labels: props.labels,
  datasets: props.datasets
}))
</script>

<template>
  <div>
    <Line :data="chartData" :options="options" />
  </div>
</template>
