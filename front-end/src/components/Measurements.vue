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
              <a href="#timeSeries" class="nav-link py-3 px-2">
                <i>Time Series</i>
              </a>
            </li>
            <li>
              <a href="#analytics" class="nav-link py-3 px-2">
                <i>Analytics</i>
              </a>
            </li>
            <li>
              <a href="#rawData" class="nav-link py-3 px-2">
                <i>Raw Data</i>
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
          <div class="row pb-3" id="timeSeries">
            <div class="col-md-12">
              <h4>Time Series</h4>
              <div class="row">
                <div class="col-md-12">
                  <TimeSeriesChart
                    :labels="timeSeriesChartLabels"
                    :datasets="timeSeriesChartDataSets"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="row pb-3" id="analytics">
            <div class="col-md-12">
              <h4>Analytics</h4>
              <div class="row pb-4">
                <div class="col-md-12">
                  <TimeSeriesChart
                    :labels="averagePowerByWeekdayChartLabels"
                    :datasets="averagePowerByWeekdayChartDataSets"
                    title="Power by Day of the Week"
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-md-12">
                  <TimeSeriesChart
                    :labels="averagePowerByHourChartLabels"
                    :datasets="averagePowerByHourChartDataSets"
                    title="Power by Hour of the Day"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="row" id="rawData">
            <div class="col-md-12">
              <h4>Raw Data - {{ filteredMeasurements.length }} Items</h4>
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
import MeasurementAnalyticsService from "@/services/MeasurementAnalyticsService";
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
      timeSeriesChartLabels: [] as string[],
      timeSeriesChartDataSets: [] as { label: string; data: number[] }[],
      averagePowerByWeekdayChartLabels: [] as string[],
      averagePowerByWeekdayChartDataSets: [] as {
        label: string;
        data: number[];
      }[],
      averagePowerByHourChartLabels: [] as string[],
      averagePowerByHourChartDataSets: [] as {
        label: string;
        data: number[];
      }[],
    };
  },

  methods: {
    retrieveMeasurements() {
      this.loading = true;
      MeasurementDataService.getAll()
        .then((measurements: Measurement[]) => {
          this.measurements = measurements;
          this.filteredMeasurements = measurements;
          this.refreshChartsData();
        })
        .catch((e: Error) => {
          console.log(e);
        })
        .finally(() => (this.loading = false));
    },

    refreshChartsData() {
      this.timeSeriesChartLabels = this.filteredMeasurements.map((m) =>
        this.formatDate(m.timestamp)
      );
      this.timeSeriesChartDataSets = [
        {
          label: "Instantaneous Power Value (W)",
          data: this.filteredMeasurements.map((m) => m["0100100700FF"]),
        },
      ];

      const averagePowerByWeekday =
        MeasurementAnalyticsService.calculateAveragePowerByWeekday(
          this.filteredMeasurements
        );
      this.averagePowerByWeekdayChartLabels = averagePowerByWeekday.map(
        (apbw) => this.getIsoWeekdayAsString(apbw.isoWeekday)
      );
      this.averagePowerByWeekdayChartDataSets = [
        {
          label: "Average Power Value (W)",
          data: averagePowerByWeekday.map((apbw) => apbw.averagePower),
        },
      ];

      const averagePowerByHour =
        MeasurementAnalyticsService.calculateAveragePowerByHour(
          this.filteredMeasurements
        );
      this.averagePowerByHourChartLabels = averagePowerByHour.map((apbh) =>
        apbh.hour.toString()
      );
      this.averagePowerByHourChartDataSets = [
        {
          label: "Average Power Value (W)",
          data: averagePowerByHour.map((apbh) => apbh.averagePower),
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
      this.refreshChartsData();
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

    getIsoWeekdayAsString(isoWeekday: number): string {
      const isoWeekdays = new Array(7);
      isoWeekdays[0] = "Monday";
      isoWeekdays[1] = "Tuesday";
      isoWeekdays[2] = "Wednesday";
      isoWeekdays[3] = "Thursday";
      isoWeekdays[4] = "Friday";
      isoWeekdays[5] = "Saturday";
      isoWeekdays[6] = "Sunday";

      return isoWeekdays[isoWeekday - 1];
    },
  },

  mounted() {
    this.retrieveMeasurements();
  },
});
</script>
