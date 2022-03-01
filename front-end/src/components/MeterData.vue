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
      const { close: closeToast } = createToast(
        this.$t('meterData.toasts.loadingData'),
        {
          position: 'top-center',
          showCloseButton: false,
          timeout: -1,
          transition: 'slide',
          type: 'info'
        }
      );

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
          label: this.$t('meterData.timeSeries.chart.dataSet.label'),
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
          label: this.$t(
            'meterData.analytics.charts.averagePowerByWeekday.dataSet.label'
          ),
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
          label: this.$t(
            'meterData.analytics.charts.averagePowerByHour.dataSet.label'
          ),
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
      isoWeekdays[0] = this.$t('shared.weekdays.monday');
      isoWeekdays[1] = this.$t('shared.weekdays.tuesday');
      isoWeekdays[2] = this.$t('shared.weekdays.wednesday');
      isoWeekdays[3] = this.$t('shared.weekdays.thursday');
      isoWeekdays[4] = this.$t('shared.weekdays.friday');
      isoWeekdays[5] = this.$t('shared.weekdays.saturday');
      isoWeekdays[6] = this.$t('shared.weekdays.sunday');

      return isoWeekdays[isoWeekday - 1];
    },

    onError(error: unknown) {
      createToast(this.$t('meterData.toasts.error'), {
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
        this.validationErrors.smartMeterIdFilter = this.$t(
          'meterData.filters.smartMeterId.validationErrors.required'
        );
      }
    }
  },

  mounted() {
    this.refreshChartsData();
  }
});
</script>

<template>
  <BaseLayout>
    <template #sidebar>
      <BaseSidebar
        :menuItems="[
          {
            href: '#filters',
            title: $t('meterData.filters.title'),
            biClass: 'bi-filter'
          },
          {
            href: '#timeSeries',
            title: $t('meterData.timeSeries.title'),
            biClass: 'bi-graph-up'
          },
          {
            href: '#analytics',
            title: $t('meterData.analytics.title'),
            biClass: 'bi-heart'
          },
          {
            href: '#rawData',
            title: $t('meterData.rawData.title'),
            biClass: 'bi-table'
          }
        ]"
      />
    </template>

    <template #default>
      <div class="row">
        <div class="col-12">
          <h4>{{ $t('meterData.title') }}</h4>
          <hr />
        </div>
        <div class="col-12" id="filters">
          <h5>{{ $t('meterData.filters.title') }}</h5>
          <form @submit.prevent="onSubmit" class="row form">
            <div class="form-group col-lg-4">
              <label for="smartMeterIdFilter" class="form-label"
                >{{ $t('meterData.filters.smartMeterId.label') }}:</label
              >
              <input
                id="smartMeterIdFilter"
                v-model="smartMeterIdFilter"
                :placeholder="$t('meterData.filters.smartMeterId.placeholder')"
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
                >{{ $t('meterData.filters.timestampFrom.label') }}:</label
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
                >{{ $t('meterData.filters.timestampTo.label') }}:</label
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
                {{ $t('meterData.filters.apply') }}
              </button>
            </div>
          </form>
          <hr />
        </div>
        <div class="col-12" id="timeSeries">
          <h5>{{ $t('meterData.timeSeries.title') }}</h5>
          <BaseLineChart
            :labels="timeSeriesChartLabels"
            :datasets="timeSeriesChartDataSets"
            :title="$t('meterData.timeSeries.chart.title')"
          />
          <hr />
        </div>
        <div class="col-12" id="analytics">
          <h5>{{ $t('meterData.analytics.title') }}</h5>
          <BaseLineChart
            class="mb-3"
            :labels="averagePowerByWeekdayChartLabels"
            :datasets="averagePowerByWeekdayChartDataSets"
            :title="
              $t('meterData.analytics.charts.averagePowerByWeekday.title')
            "
          />
          <BaseLineChart
            :labels="averagePowerByHourChartLabels"
            :datasets="averagePowerByHourChartDataSets"
            :title="$t('meterData.analytics.charts.averagePowerByHour.title')"
          />
          <hr />
        </div>
        <div class="col-12" id="rawData">
          <h5>
            {{ $t('meterData.rawData.title') }} - {{ timeSeries.length }}
            {{ $t('meterData.rawData.powerMeasurements') }}
          </h5>
          <div class="row border border-dark bg-light fw-bold">
            <div class="col-lg-5 border border-dark text-lg-start">
              {{ $t('meterData.rawData.smartMeterId') }}
            </div>
            <div class="col-lg-4 border border-dark text-lg-end">
              {{ $t('meterData.rawData.timestamp') }}
            </div>
            <div class="col-lg-3 border border-dark text-lg-end">
              {{ $t('meterData.rawData.instantaneousPower') }}
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
    </template>
  </BaseLayout>
</template>
