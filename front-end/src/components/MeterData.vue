<template>
  <BaseLayout>
    <template #sidebar>
      <BaseSidebar
        :menuItems="[
          { href: '#filters', title: 'Filters', biClass: 'bi-filter' },
          { href: '#timeSeries', title: 'Time Series', biClass: 'bi-graph-up' },
          { href: '#analytics', title: 'Analytics', biClass: 'bi-heart' },
          { href: '#rawData', title: 'Raw Data', biClass: 'bi-table' }
        ]"
      />
    </template>

    <template #default>
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
                  aria-describedby="smartMeterIdFilterInvalidFeedback"
                  :class="{
                    'is-invalid': this.validationErrors.smartMeterIdFilter
                  }"
                />
                <div
                  id="smartMeterIdFilterInvalidFeedback"
                  class="invalid-feedback"
                  role="alert"
                >
                  {{ this.validationErrors.smartMeterIdFilter }}
                </div>
              </div>
              <div class="form-group col-lg-4">
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
              <div class="form-group col-lg-4">
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
              <div class="col-12 pt-2">
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
            <BaseLineChart
              :labels="timeSeriesChartLabels"
              :datasets="timeSeriesChartDataSets"
              title="Instantaneous Power"
            />
          </div>
        </div>
        <div class="row border rounded p-2 mb-2" id="analytics">
          <div class="col-12">
            <h4>Analytics</h4>
            <BaseLineChart
              class="mb-3"
              :labels="averagePowerByWeekdayChartLabels"
              :datasets="averagePowerByWeekdayChartDataSets"
              title="Power by Day of the Week"
            />
            <BaseLineChart
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
    </template>
  </BaseLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { createToast } from 'mosha-vue-toastify';
import MeterDataService from '@/services/meter-data.service';
import InstantaneousPowerMeasurement from '@/interfaces/instantaneous-power-measurement.interface';
import HourAveragePower from '@shared/interfaces/hour-average-power.interface';
import WeekdayAveragePower from '@shared/interfaces/weekday-average-power.interface';
import BaseLayout from './BaseLayout.vue';
import BaseSidebar from './BaseSidebar.vue';
import BaseLineChart, { Dataset } from './BaseLineChart.vue';
import { parseDateInISOFormat } from '@/utils/date-utils';

export default defineComponent({
  name: 'MeterData',

  components: { BaseLayout, BaseLineChart, BaseSidebar },

  data() {
    return {
      loading: false,
      smartMeterIdFilter: process.env.VUE_APP_DEFAULT_SMART_METER_ID as string,
      timestampFromFilter: undefined,
      timestampToFilter: undefined,
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
      timestampFrom: string | undefined,
      timestampTo: string | undefined
    ) {
      this.loading = true;
      const { close: closeToast } = createToast('Loading data...', {
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
        this.onError(error);
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

      const timestampFromFilter = this.timestampFromFilter as
        | string
        | undefined;
      let timestampFromDate: Date | undefined;
      const timestampToFilter = this.timestampToFilter as string | undefined;
      let timestampToDate: Date | undefined;

      if (timestampFromFilter) {
        const { year, month, date } = parseDateInISOFormat(timestampFromFilter);
        timestampFromDate = new Date(Date.UTC(year, month, date, 0, 0, 0));
      }

      if (timestampToFilter) {
        const { year, month, date } = parseDateInISOFormat(timestampToFilter);
        timestampToDate = new Date(Date.UTC(year, month, date, 23, 59, 59));
      }

      await this.retrieveInstantaneousPowerMeasurements(
        this.smartMeterIdFilter,
        timestampFromDate ? timestampFromDate.toISOString() : undefined,
        timestampToDate ? timestampToDate.toISOString() : undefined
      );
    },

    formatDate(value: Date) {
      return new Date(value).toUTCString();
    },

    formatNumber(value: number) {
      return value.toFixed(2);
    },

    getIsoWeekdayAsString(isoWeekday: number): string {
      const isoWeekdays = Array.from({ length: 7 }) as string[];
      isoWeekdays[0] = 'Monday';
      isoWeekdays[1] = 'Tuesday';
      isoWeekdays[2] = 'Wednesday';
      isoWeekdays[3] = 'Thursday';
      isoWeekdays[4] = 'Friday';
      isoWeekdays[5] = 'Saturday';
      isoWeekdays[6] = 'Sunday';

      return isoWeekdays[isoWeekday - 1];
    },

    onError(error: unknown) {
      createToast('An unexpected error occurred. Please try again.', {
        position: 'top-center',
        showCloseButton: true,
        timeout: 4000,
        transition: 'slide',
        type: 'warning'
      });
      console.error(error);
    },

    validateSmartMeterIdFilter() {
      this.validationErrors.smartMeterIdFilter = '';

      if (!this.smartMeterIdFilter || !this.smartMeterIdFilter.trim()) {
        this.validationErrors.smartMeterIdFilter =
          "'Smart Meter Id' filter is required";
      }
    }
  },

  mounted() {
    this.refreshChartsData();
  }
});
</script>
