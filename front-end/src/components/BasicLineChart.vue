<template>
  <div>
    <LineChart ref="lineChartRef" :chartData="chartData" :options="options" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, PropType } from "vue";
import { LineChart, ExtractComponentData } from "vue-chart-3";
import { Chart, ChartData, ChartOptions, registerables } from "chart.js";

Chart.register(...registerables);

export interface Dataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
}

export default defineComponent({
  name: "BasicLineChart",

  components: { LineChart },

  props: {
    labels: {
      type: Object as PropType<string[]>,
      required: true,
    },

    datasets: {
      type: Object as PropType<Dataset[]>,
      required: true,
    },

    title: {
      type: String,
      required: false,
    },
  },

  data(props) {
    return {
      lineChartRef: ref<ExtractComponentData<typeof LineChart>>(),

      options: ref<ChartOptions<"line">>({
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: props.title !== undefined,
            text: props.title,
            position: "top",
          },
        },
      }),

      chartData: computed<ChartData<"line">>(() => ({
        labels: props.labels,
        datasets: props.datasets,
      })),
    };
  },
});
</script>
