<script setup lang="ts">
import { computed, ref } from 'vue';
import { LineChart } from 'vue-chart-3';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import ChartDataset from '@/interfaces/chart-dataset.interface';

Chart.register(...registerables);

interface Properties {
  labels: string[];
  datasets: ChartDataset[];
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
