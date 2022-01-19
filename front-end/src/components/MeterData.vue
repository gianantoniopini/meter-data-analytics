<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-auto bg-light sticky-top">
        <!-- sidebar -->
        <Sidebar
          :menuItems="[
            { href: '#filters', title: 'Filters', biClass: 'bi-filter' },
            {
              href: '#timeSeries',
              title: 'Time Series',
              biClass: 'bi-graph-up'
            },
            {
              href: '#analytics',
              title: 'Analytics',
              biClass: 'bi-heart'
            },
            {
              href: '#rawData',
              title: 'Raw Data',
              biClass: 'bi-table'
            }
          ]"
        />
      </div>
      <div class="col-sm p-3 min-vh-100">
        <!-- content -->
        <div>
          <div class="row pb-3" id="filters">
            <div class="col-md-12">
              <h4>Filters</h4>
              <form @submit.prevent="onSubmit" class="row form">
                <div class="form-group col-md-4">
                  <label for="smartMeterIdFilter" class="form-label"
                    >Smart Meter Id:</label
                  >
                  <input
                    id="smartMeterIdFilter"
                    v-model="smartMeterIdFilter"
                    placeholder="Enter Smart Meter Id"
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid': this.validationErrors.smartMeterIdFilter
                    }"
                    data-toggle="tooltip"
                    :title="this.validationErrors.smartMeterIdFilter"
                  />
                </div>
                <div class="form-group col-md-3">
                  <label for="timestampFromFilter" class="form-label"
                    >Timestamp From:</label
                  >
                  <input
                    id="timestampFromFilter"
                    class="form-control"
                    type="date"
                    v-model="timestampFromFilter"
                  />
                </div>
                <div class="form-group col-md-3">
                  <label for="timestampToFilter" class="form-label"
                    >Timestamp To:</label
                  >
                  <input
                    id="timestampToFilter"
                    class="form-control"
                    type="date"
                    v-model="timestampToFilter"
                  />
                </div>
                <div class="col-md-2 align-self-end">
                  <button
                    :disabled="applyFiltersDisabled"
                    v-on:click="applyFilters"
                    type="button"
                    class="btn btn-primary"
                  >
                    Apply
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div class="row pb-3" id="timeSeries">
            <div class="col-md-12">
              <h4>Time Series</h4>
              <div class="row">
                <div class="col-md-12">
                  <BasicLineChart
                    :labels="timeSeriesChartLabels"
                    :datasets="timeSeriesChartDataSets"
                    title="Instantaneous Power"
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
                  <BasicLineChart
                    :labels="averagePowerByWeekdayChartLabels"
                    :datasets="averagePowerByWeekdayChartDataSets"
                    title="Power by Day of the Week"
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-md-12">
                  <BasicLineChart
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
              <h4>Raw Data - {{ measurements.length }} Measurements</h4>
              <div class="row bg-light fw-bold">
                <div class="col-md-3 border border-dark text-start">
                  Smart Meter Id
                </div>
                <div class="col-md-2 border border-dark text-end">
                  Timestamp
                </div>
                <div class="col-md-1 border border-dark text-start">Meas.</div>
                <div class="col-md-2 border border-dark text-end">
                  0100010700FF
                </div>
                <div class="col-md-2 border border-dark text-end">
                  0100020700FF
                </div>
                <div class="col-md-2 border border-dark text-end">
                  0100100700FF
                </div>
              </div>
              <div
                class="row"
                v-for="(measurement, index) in measurements"
                :key="index"
              >
                <div class="col-md-3 border text-start">
                  {{ measurement.tags.muid }}
                </div>
                <div class="col-md-2 border text-end">
                  {{ formatDate(measurement.timestamp) }}
                </div>
                <div class="col-md-1 border text-start">
                  {{ measurement.measurement }}
                </div>
                <div class="col-md-2 border text-end">
                  {{ formatNumber(measurement['0100010700FF']) }}
                </div>
                <div class="col-md-2 border text-end">
                  {{ formatNumber(measurement['0100020700FF']) }}
                </div>
                <div class="col-md-2 border text-end">
                  {{ formatNumber(measurement['0100100700FF']) }}
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
import { defineComponent } from 'vue';
import { createToast } from 'mosha-vue-toastify';
import MeterDataService from '@/services/MeterDataService';
import MeasurementAnalyticsService from '@/services/MeasurementAnalyticsService';
import Measurement from '@/types/Measurement';
import Sidebar from './Sidebar.vue';
import BasicLineChart, { Dataset } from './BasicLineChart.vue';

export default defineComponent({
  name: 'MeterData',

  components: { BasicLineChart, Sidebar },

  data() {
    return {
      loading: false,
      smartMeterIdFilter: process.env.VUE_APP_DEFAULT_SMART_METER_ID as string,
      timestampFromFilter: null,
      timestampToFilter: null,
      measurements: [] as Measurement[],
      timeSeriesChartLabels: [] as string[],
      timeSeriesChartDataSets: [] as Dataset[],
      averagePowerByWeekdayChartLabels: [] as string[],
      averagePowerByWeekdayChartDataSets: [] as Dataset[],
      averagePowerByHourChartLabels: [] as string[],
      averagePowerByHourChartDataSets: [] as Dataset[],
      validationErrors: {
        smartMeterIdFilter: ''
      }
    };
  },

  watch: {
    smartMeterIdFilter() {
      this.validateSmartMeterIdFilter();
    }
  },

  computed: {
    invalid(): boolean {
      return this.validationErrors.smartMeterIdFilter.length > 0;
    },

    applyFiltersDisabled(): boolean {
      return this.loading || this.invalid;
    }
  },

  methods: {
    async retrieveMeasurements(
      smartMeterId: string,
      timestampFrom: string | null,
      timestampTo: string | null
    ) {
      this.loading = true;
      const { close: closeToast } = createToast('Loading...', {
        position: 'top-center',
        showCloseButton: false,
        timeout: -1,
        transition: 'slide',
        type: 'info'
      });

      try {
        this.measurements = await MeterDataService.getMeasurements(
          smartMeterId,
          timestampFrom,
          timestampTo
        );

        this.refreshChartsData();
      } catch (error) {
        console.log(error);
      } finally {
        closeToast();
        this.loading = false;
      }
    },

    refreshChartsData() {
      this.timeSeriesChartLabels = this.measurements.map((m) =>
        this.formatDate(m.timestamp)
      );
      this.timeSeriesChartDataSets = [
        {
          label: '0100010700FF (W)',
          data: this.measurements.map((m) => m['0100010700FF']),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)'
        },
        {
          label: '0100020700FF (W)',
          data: this.measurements.map((m) => m['0100020700FF']),
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderColor: 'rgb(255, 159, 64)'
        },
        {
          label: '0100100700FF (W)',
          data: this.measurements.map((m) => m['0100100700FF']),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)'
        }
      ];

      const averagePowerByWeekday =
        MeasurementAnalyticsService.calculateAveragePowerByWeekday(
          this.measurements
        );
      this.averagePowerByWeekdayChartLabels = averagePowerByWeekday.map(
        (apbw) => this.getIsoWeekdayAsString(apbw.isoWeekday)
      );
      this.averagePowerByWeekdayChartDataSets = [
        {
          label: 'Average Power Value (W)',
          data: averagePowerByWeekday.map((apbw) => apbw.averagePower),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)'
        }
      ];

      const averagePowerByHour =
        MeasurementAnalyticsService.calculateAveragePowerByHour(
          this.measurements
        );
      this.averagePowerByHourChartLabels = averagePowerByHour.map((apbh) =>
        apbh.hour.toString()
      );
      this.averagePowerByHourChartDataSets = [
        {
          label: 'Average Power Value (W)',
          data: averagePowerByHour.map((apbh) => apbh.averagePower),
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderColor: 'rgb(255, 159, 64)'
        }
      ];
    },

    async applyFilters() {
      this.validateSmartMeterIdFilter();
      if (this.invalid) {
        return;
      }

      const timestampFromFilter = this.timestampFromFilter as string | null;
      let timestampFromDate: Date | null = null;
      const timestampToFilter = this.timestampToFilter as string | null;
      let timestampToDate: Date | null = null;

      if (timestampFromFilter) {
        // timestampFromFilter will be in format YYYY-MM-DD
        timestampFromDate = new Date(
          Date.UTC(
            parseInt(timestampFromFilter.substr(0, 4), 10),
            parseInt(timestampFromFilter.substr(5, 2), 10) - 1,
            parseInt(timestampFromFilter.substr(8, 2), 10),
            0,
            0,
            0
          )
        );
      }

      if (timestampToFilter) {
        // timestampToFilter will be in format YYYY-MM-DD
        timestampToDate = new Date(
          Date.UTC(
            parseInt(timestampToFilter.substr(0, 4), 10),
            parseInt(timestampToFilter.substr(5, 2), 10) - 1,
            parseInt(timestampToFilter.substr(8, 2), 10),
            23,
            59,
            59
          )
        );
      }

      await this.retrieveMeasurements(
        this.smartMeterIdFilter,
        timestampFromDate ? timestampFromDate.toISOString() : null,
        timestampToDate ? timestampToDate.toISOString() : null
      );
    },

    formatDate(value: string) {
      return new Date(value).toUTCString();
    },

    formatNumber(value: number) {
      return value.toFixed(2);
    },

    getIsoWeekdayAsString(isoWeekday: number): string {
      const isoWeekdays = new Array(7);
      isoWeekdays[0] = 'Monday';
      isoWeekdays[1] = 'Tuesday';
      isoWeekdays[2] = 'Wednesday';
      isoWeekdays[3] = 'Thursday';
      isoWeekdays[4] = 'Friday';
      isoWeekdays[5] = 'Saturday';
      isoWeekdays[6] = 'Sunday';

      return isoWeekdays[isoWeekday - 1];
    },

    validateSmartMeterIdFilter() {
      this.validationErrors.smartMeterIdFilter = '';

      if (!this.smartMeterIdFilter || !this.smartMeterIdFilter.trim()) {
        this.validationErrors.smartMeterIdFilter = 'Value is required';
      }
    }
  },

  async mounted() {
    await this.applyFilters();
  }
});
</script>
