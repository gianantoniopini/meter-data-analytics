<template>
  <div>
    <div v-if="loading">
      <div class="d-flex justify-content-center align-items-center">
        Loading data, please wait...
      </div>
    </div>
    <div v-else>
      <div class="row">
        <TimeSeriesChart :labels="chartLabels" :datasets="chartDataSets" />
      </div>
      <div class="row pb-4">
        <div class="col-md-12">
          <h4>Measurements - {{ measurements.length }} items</h4>
          <div class="row">
            <div class="col-md-2 border border-dark">Item Number</div>
            <div class="col-md-4 border border-dark">Smart Meter Id</div>
            <div class="col-md-4 border border-dark">Timestamp</div>
            <div class="col-md-2 border border-dark">Power (W)</div>
          </div>
          <div
            class="row"
            v-for="(measurement, index) in measurements"
            :key="index"
          >
            <div class="col-md-2 border">{{ index + 1 }}</div>
            <div class="col-md-4 border">
              {{ measurement.tags.muid }}
            </div>
            <div class="col-md-4 border">
              {{ formatDate(measurement.timestamp) }}
            </div>
            <div class="col-md-2 border">
              {{ formatNumber(measurement["0100100700FF"]) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MeasurementDataService from "@/services/MeasurementDataService";
import Measurement from "@/types/Measurement";
import TimeSeriesChart from "./TimeSeriesChart.vue";

export default defineComponent({
  name: "Measurements",

  components: { TimeSeriesChart },

  data() {
    return {
      loading: false,
      measurements: [] as Measurement[],
      chartLabels: [] as string[],
      chartDataSets: [] as { label: string; data: number[] }[],
    };
  },

  methods: {
    retrieveMeasurements() {
      this.loading = true;
      MeasurementDataService.getAll()
        .then((measurements: Measurement[]) => {
          //console.log(measurements);
          this.measurements = measurements;
          this.chartLabels = measurements.map((m) =>
            this.formatDate(m.timestamp)
          );
          this.chartDataSets = [
            {
              label: "Power (W)",
              data: measurements.map((m) => m["0100100700FF"]),
            },
          ];
        })
        .catch((e: Error) => {
          console.log(e);
        })
        .finally(() => (this.loading = false));
    },

    refreshList() {
      this.retrieveMeasurements();
    },

    formatDate(value: string) {
      return new Date(value).toUTCString();
    },

    formatNumber(value: number) {
      return value.toFixed(2);
    },
  },

  mounted() {
    this.retrieveMeasurements();
  },
});
</script>
