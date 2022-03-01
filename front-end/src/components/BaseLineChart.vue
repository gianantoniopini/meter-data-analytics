<script setup lang="ts">
export interface Dataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
}

import { computed, ref } from 'vue';
import { LineChart } from 'vue-chart-3';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';

Chart.register(...registerables);

interface Properties {
  labels: string[];
  datasets: Dataset[];
  title?: string;
}

const props = defineProps<Properties>();

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
  }
});
const chartData = computed<ChartData<'line'>>(() => ({
  labels: props.labels,
  datasets: props.datasets
}));
</script>

<template>
  <div>
    <LineChart :chart-data="chartData" :options="options" />
  </div>
</template>
