<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-auto bg-light sticky-top">
        <!-- sidebar -->
        <div
          class="
            d-flex
            flex-sm-column flex-row flex-nowrap
            bg-light
            align-items-center
            sticky-top
          "
        >
          <ul
            class="
              nav nav-pills nav-flush
              flex-sm-column flex-row flex-nowrap
              mb-auto
              mx-auto
              text-center
              align-items-center
            "
          >
            <li class="nav-item">
              <a href="#filters" class="nav-link py-3 px-2">
                <i>Filters</i>
              </a>
            </li>
            <li>
              <a href="#graph" class="nav-link py-3 px-2">
                <i>Graph</i>
              </a>
            </li>
            <li>
              <a href="#table" class="nav-link py-3 px-2">
                <i>Table</i>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="col-sm p-3 min-vh-100">
        <!-- content -->
        <div v-if="loading">
          <div class="d-flex justify-content-center align-items-center">
            Loading data, please wait...
          </div>
        </div>
        <div v-else>
          <div class="row pb-3" id="filters">
            <div class="col-md-12">
              <h4>Filters</h4>
              <div class="row">
                <div class="col-md-3">
                  <label for="timestampFromFilter">Timestamp From:</label>
                  <Datepicker
                    id="timestampFromFilter"
                    v-model="timestampFromFilter"
                    :autoApply="true"
                    :format="formatTimestampFilter"
                    :enableTimePicker="false"
                    placeholder="Select Date"
                  ></Datepicker>
                </div>
                <div class="col-md-3">
                  <label for="timestampToFilter">Timestamp To:</label>
                  <Datepicker
                    id="timestampToFilter"
                    v-model="timestampToFilter"
                    :autoApply="true"
                    :format="formatTimestampFilter"
                    :enableTimePicker="false"
                    placeholder="Select Date"
                  ></Datepicker>
                </div>
                <div class="col-md-6 align-self-end">
                  <button
                    v-on:click="applyFilters"
                    type="submit"
                    class="btn btn-primary"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="row pb-3" id="graph">
            <div class="col-md-12">
              <h4>Graph</h4>
              <div class="row">
                <div class="col-md-12">
                  <TimeSeriesChart
                    :labels="chartLabels"
                    :datasets="chartDataSets"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="row" id="table">
            <div class="col-md-12">
              <h4>Table - {{ filteredMeasurements.length }} Items</h4>
              <div class="row">
                <div class="col-md-1 border border-dark">Item Number</div>
                <div class="col-md-4 border border-dark">Smart Meter Id</div>
                <div class="col-md-3 border border-dark">Timestamp</div>
                <div class="col-md-2 border border-dark">Measurement</div>
                <div class="col-md-2 border border-dark">
                  Instantaneous Value (W)
                </div>
              </div>
              <div
                class="row"
                v-for="(measurement, index) in filteredMeasurements"
                :key="index"
              >
                <div class="col-md-1 border">{{ index + 1 }}</div>
                <div class="col-md-4 border">
                  {{ measurement.tags.muid }}
                </div>
                <div class="col-md-3 border">
                  {{ formatDate(measurement.timestamp) }}
                </div>
                <div class="col-md-2 border">
                  {{ measurement.measurement }}
                </div>
                <div class="col-md-2 border">
                  {{ formatNumber(measurement["0100100700FF"]) }}
                </div>
              </div>
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
import Datepicker from "vue3-date-time-picker";

export default defineComponent({
  name: "Measurements",

  components: { Datepicker, TimeSeriesChart },

  data() {
    return {
      loading: false,
      timestampFromFilter: null,
      timestampToFilter: null,
      measurements: [] as Measurement[],
      filteredMeasurements: [] as Measurement[],
      chartLabels: [] as string[],
      chartDataSets: [] as { label: string; data: number[] }[],
    };
  },

  methods: {
    retrieveMeasurements() {
      this.loading = true;
      MeasurementDataService.getAll()
        .then((measurements: Measurement[]) => {
          this.measurements = measurements;
          this.filteredMeasurements = measurements;
          this.refreshChartData();
        })
        .catch((e: Error) => {
          console.log(e);
        })
        .finally(() => (this.loading = false));
    },

    refreshChartData() {
      this.chartLabels = this.filteredMeasurements.map((m) =>
        this.formatDate(m.timestamp)
      );
      this.chartDataSets = [
        {
          label: "Instantaneous Power Value (W)",
          data: this.filteredMeasurements.map((m) => m["0100100700FF"]),
        },
      ];
    },

    applyFilters() {
      const timestampFromFilter = this.timestampFromFilter as Date | null;
      let timestampFromDate: Date | null;
      const timestampToFilter = this.timestampToFilter as Date | null;
      let timestampToDate: Date | null;

      if (timestampFromFilter) {
        timestampFromDate = new Date(
          Date.UTC(
            timestampFromFilter.getFullYear(),
            timestampFromFilter.getMonth(),
            timestampFromFilter.getDate(),
            0,
            0,
            0
          )
        );
      }

      if (timestampToFilter) {
        timestampToDate = new Date(
          Date.UTC(
            timestampToFilter.getFullYear(),
            timestampToFilter.getMonth(),
            timestampToFilter.getDate(),
            23,
            59,
            59
          )
        );
      }

      this.filteredMeasurements = this.measurements.filter(
        (m) =>
          (!timestampFromDate || new Date(m.timestamp) >= timestampFromDate) &&
          (!timestampToDate || new Date(m.timestamp) <= timestampToDate)
      );
      this.refreshChartData();
    },

    formatDate(value: string) {
      return new Date(value).toUTCString();
    },

    formatNumber(value: number) {
      return value.toFixed(2);
    },

    formatTimestampFilter(date: Date | null) {
      if (!date) {
        return "";
      }

      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    },
  },

  mounted() {
    this.retrieveMeasurements();
  },
});
</script>
