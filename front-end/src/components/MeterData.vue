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
          <div class="row border rounded p-2 mb-2" id="filters">
            <div class="col-12">
              <h4>Filters</h4>
              <form @submit.prevent="onSubmit" class="row form">
                <div class="form-group col-lg-4">
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
                <div class="form-group col-lg-3">
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
                <div class="form-group col-lg-3">
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
                <div class="col-lg-2 align-self-end">
                  <button
                    :disabled="applyFiltersDisabled"
                    v-on:click="applyFilters"
                    type="submit"
                    class="btn btn-primary"
                  >
                    Apply
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div class="row border rounded p-2 mb-2" id="timeSeries">
            <div class="col-12">
              <h4>Time Series</h4>
              <BasicLineChart
                :labels="timeSeriesChartLabels"
                :datasets="timeSeriesChartDataSets"
                title="Instantaneous Power"
              />
            </div>
          </div>
          <div class="row border rounded p-2 mb-2" id="analytics">
            <div class="col-12">
              <h4>Analytics</h4>
              <BasicLineChart
                class="mb-3"
                :labels="averagePowerByWeekdayChartLabels"
                :datasets="averagePowerByWeekdayChartDataSets"
                title="Power by Day of the Week"
              />
              <BasicLineChart
                :labels="averagePowerByHourChartLabels"
                :datasets="averagePowerByHourChartDataSets"
                title="Power by Hour of the Day"
              />
            </div>
          </div>
          <div class="row border rounded p-2" id="rawData">
            <div class="col-12">
              <h4>
                Raw Data -
                {{ timeSeries.length }} Power Measurements
              </h4>
              <div class="row border border-dark bg-light fw-bold">
                <div class="col-lg-5 border border-dark text-lg-start">
                  Smart Meter Id
                </div>
                <div class="col-lg-4 border border-dark text-lg-end">
                  Timestamp
                </div>
                <div class="col-lg-3 border border-dark text-lg-end">
                  Instantaneous Power (W)
                </div>
              </div>
              <div
                class="row border"
                v-for="(measurement, index) in timeSeries"
                :key="index"
              >
                <div class="col-lg-5 border text-lg-start">
                  {{ measurement.muid }}
                </div>
                <div class="col-lg-4 border text-lg-end">
                  {{ formatDate(measurement.timestamp) }}
                </div>
                <div class="col-lg-3 border text-lg-end">
                  {{ formatNumber(measurement.valueInWatts) }}
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
import InstantaneousPowerMeasurement from '@/types/InstantaneousPowerMeasurement';
import HourAveragePower from '@shared/interfaces/hour-average-power.interface';
import WeekdayAveragePower from '@shared/interfaces/weekday-average-power.interface';
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
      timeSeries: [] as InstantaneousPowerMeasurement[],
      averagePowerByWeekday: [] as WeekdayAveragePower[],
      averagePowerByHour: [] as HourAveragePower[],
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
    async retrieveInstantaneousPowerMeasurements(
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
        const instantaneousPowerMeasurements =
          await MeterDataService.getInstantaneousPowerMeasurements(
            smartMeterId,
            timestampFrom,
            timestampTo
          );

        this.timeSeries = instantaneousPowerMeasurements.timeSeries;
        this.averagePowerByWeekday =
          instantaneousPowerMeasurements.analytics.averagePowerByWeekday;
        this.averagePowerByHour =
          instantaneousPowerMeasurements.analytics.averagePowerByHour;

        this.refreshChartsData();
      } catch (error) {
        console.log(error);
      } finally {
        closeToast();
        this.loading = false;
      }
    },

    refreshChartsData() {
      this.timeSeriesChartLabels = this.timeSeries.map((m) =>
        this.formatDate(m.timestamp)
      );
      this.timeSeriesChartDataSets = [
        {
          label: 'Instantaneous Power (W)',
          data: this.timeSeries.map((m) => m.valueInWatts),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)'
        }
      ];

      this.averagePowerByWeekdayChartLabels = this.averagePowerByWeekday.map(
        (apbw) => this.getIsoWeekdayAsString(apbw.isoWeekday)
      );
      this.averagePowerByWeekdayChartDataSets = [
        {
          label: 'Average Power Value (W)',
          data: this.averagePowerByWeekday.map((apbw) => apbw.averagePower),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)'
        }
      ];

      this.averagePowerByHourChartLabels = this.averagePowerByHour.map((apbh) =>
        apbh.hour.toString()
      );
      this.averagePowerByHourChartDataSets = [
        {
          label: 'Average Power Value (W)',
          data: this.averagePowerByHour.map((apbh) => apbh.averagePower),
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

      await this.retrieveInstantaneousPowerMeasurements(
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

  mounted() {
    this.refreshChartsData();
  }
});
</script>
