<script setup lang="ts">
import { computed, onMounted, reactive, ref, Ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { createToast } from 'mosha-vue-toastify';
import InstantaneousPowerMeasurement from '@/interfaces/instantaneous-power-measurement.interface';
import ChartDataset from '@/interfaces/chart-dataset.interface';
import HourAveragePower from '@shared/interfaces/hour-average-power.interface';
import WeekdayAveragePower from '@shared/interfaces/weekday-average-power.interface';
import BaseLayout from './BaseLayout.vue';
import BaseSidebar from './BaseSidebar.vue';
import BaseLineChart from './BaseLineChart.vue';
import MeterDataService from '@/services/meter-data.service';
import { parseDateInISOFormat } from '@/utils/date-utils';

interface Series<T> {
  values: T[];
}

interface Chart {
  labels: string[];
  dataSets: ChartDataset[];
}

const { t } = useI18n();

const loading = ref(false);
const smartMeterIdFilter = ref(
  process.env.VUE_APP_DEFAULT_SMART_METER_ID as string
);
const timestampFromFilter: Ref<string | undefined> = ref();
const timestampToFilter: Ref<string | undefined> = ref();
const timeSeries: Series<InstantaneousPowerMeasurement> = reactive({
  values: []
});
const averagePowerByWeekday: Series<WeekdayAveragePower> = { values: [] };
const averagePowerByHour: Series<HourAveragePower> = { values: [] };
const timeSeriesChart: Chart = reactive({ labels: [], dataSets: [] });
const averagePowerByWeekdayChart: Chart = reactive({
  labels: [],
  dataSets: []
});
const averagePowerByHourChart: Chart = reactive({ labels: [], dataSets: [] });
const validationErrors = reactive({
  smartMeterIdFilter: ''
});

watch(smartMeterIdFilter, (value: string) => {
  validateSmartMeterIdFilter(value);
});

const invalid = computed(() => validationErrors.smartMeterIdFilter.length > 0);
const applyFiltersDisabled = computed(() => loading.value || invalid.value);

const retrieveInstantaneousPowerMeasurements = async (
  smartMeterId: string,
  timestampFrom: string | undefined,
  timestampTo: string | undefined
): Promise<void> => {
  loading.value = true;
  const { close: closeToast } = createToast(t('meterData.toasts.loadingData'), {
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

    timeSeries.values = instantaneousPowerMeasurements.timeSeries;
    averagePowerByWeekday.values =
      instantaneousPowerMeasurements.analytics.averagePowerByWeekday;
    averagePowerByHour.values =
      instantaneousPowerMeasurements.analytics.averagePowerByHour;

    refreshChartsData();
  } catch (error) {
    onError(error);
  } finally {
    closeToast();
    loading.value = false;
  }
};

const refreshChartsData = () => {
  timeSeriesChart.labels = timeSeries.values.map((m) =>
    formatDate(m.timestamp)
  );
  timeSeriesChart.dataSets = [
    {
      label: t('meterData.timeSeries.chart.dataSet.label'),
      data: timeSeries.values.map((m) => m.valueInWatts),
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgb(54, 162, 235)'
    }
  ];

  averagePowerByWeekdayChart.labels = averagePowerByWeekday.values.map((apbw) =>
    getIsoWeekdayAsString(apbw.isoWeekday)
  );
  averagePowerByWeekdayChart.dataSets = [
    {
      label: t(
        'meterData.analytics.charts.averagePowerByWeekday.dataSet.label'
      ),
      data: averagePowerByWeekday.values.map((apbw) => apbw.averagePower),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgb(255, 99, 132)'
    }
  ];

  averagePowerByHourChart.labels = averagePowerByHour.values.map((apbh) =>
    apbh.hour.toString()
  );
  averagePowerByHourChart.dataSets = [
    {
      label: t('meterData.analytics.charts.averagePowerByHour.dataSet.label'),
      data: averagePowerByHour.values.map((apbh) => apbh.averagePower),
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      borderColor: 'rgb(255, 159, 64)'
    }
  ];
};

const applyFilters = async (): Promise<void> => {
  validateSmartMeterIdFilter(smartMeterIdFilter.value);
  if (invalid.value) {
    return;
  }

  let timestampFromDate: Date | undefined;
  if (timestampFromFilter.value) {
    const { year, month, date } = parseDateInISOFormat(
      timestampFromFilter.value
    );
    timestampFromDate = new Date(Date.UTC(year, month, date, 0, 0, 0));
  }

  let timestampToDate: Date | undefined;
  if (timestampToFilter.value) {
    const { year, month, date } = parseDateInISOFormat(timestampToFilter.value);
    timestampToDate = new Date(Date.UTC(year, month, date, 23, 59, 59));
  }

  await retrieveInstantaneousPowerMeasurements(
    smartMeterIdFilter.value,
    timestampFromDate ? timestampFromDate.toISOString() : undefined,
    timestampToDate ? timestampToDate.toISOString() : undefined
  );
};

const formatDate = (value: Date) => {
  return new Date(value).toUTCString();
};

const formatNumber = (value: number) => {
  return value.toFixed(2);
};

const getIsoWeekdayAsString = (isoWeekday: number): string => {
  const isoWeekdays = Array.from({ length: 7 }) as string[];
  isoWeekdays[0] = t('shared.weekdays.monday');
  isoWeekdays[1] = t('shared.weekdays.tuesday');
  isoWeekdays[2] = t('shared.weekdays.wednesday');
  isoWeekdays[3] = t('shared.weekdays.thursday');
  isoWeekdays[4] = t('shared.weekdays.friday');
  isoWeekdays[5] = t('shared.weekdays.saturday');
  isoWeekdays[6] = t('shared.weekdays.sunday');

  return isoWeekdays[isoWeekday - 1];
};

const onError = (error: unknown) => {
  createToast(t('meterData.toasts.error'), {
    position: 'top-center',
    showCloseButton: true,
    timeout: 4000,
    transition: 'slide',
    type: 'warning'
  });
  console.error(error);
};

const validateSmartMeterIdFilter = (value: string) => {
  validationErrors.smartMeterIdFilter = '';

  if (!value || !value.trim()) {
    validationErrors.smartMeterIdFilter = t(
      'meterData.filters.smartMeterId.validationErrors.required'
    );
  }
};

const onSubmit = () => {
  // Do nothing
};

onMounted(() => {
  refreshChartsData();
});
</script>

<template>
  <BaseLayout>
    <template #sidebar>
      <BaseSidebar
        :menu-items="[
          {
            href: '#filters',
            title: t('meterData.filters.title'),
            biClass: 'bi-filter'
          },
          {
            href: '#timeSeries',
            title: t('meterData.timeSeries.title'),
            biClass: 'bi-graph-up'
          },
          {
            href: '#analytics',
            title: t('meterData.analytics.title'),
            biClass: 'bi-heart'
          },
          {
            href: '#rawData',
            title: t('meterData.rawData.title'),
            biClass: 'bi-table'
          }
        ]"
      />
    </template>

    <template #default>
      <div class="row">
        <div class="col-12">
          <h4>{{ t('meterData.title') }}</h4>
          <hr />
        </div>
        <div id="filters" class="col-12">
          <h5>{{ t('meterData.filters.title') }}</h5>
          <form class="row form" @submit.prevent="onSubmit">
            <div class="form-group col-lg-4">
              <label for="smartMeterIdFilter" class="form-label"
                >{{ t('meterData.filters.smartMeterId.label') }}:</label
              >
              <input
                id="smartMeterIdFilter"
                v-model="smartMeterIdFilter"
                :placeholder="t('meterData.filters.smartMeterId.placeholder')"
                type="text"
                class="form-control"
                aria-describedby="smartMeterIdFilterInvalidFeedback"
                :class="{
                  'is-invalid': validationErrors.smartMeterIdFilter
                }"
              />
              <div
                id="smartMeterIdFilterInvalidFeedback"
                class="invalid-feedback"
                role="alert"
              >
                {{ validationErrors.smartMeterIdFilter }}
              </div>
            </div>
            <div class="form-group col-lg-4">
              <label for="timestampFromFilter" class="form-label"
                >{{ t('meterData.filters.timestampFrom.label') }}:</label
              >
              <input
                id="timestampFromFilter"
                v-model="timestampFromFilter"
                class="form-control"
                type="date"
              />
            </div>
            <div class="form-group col-lg-4">
              <label for="timestampToFilter" class="form-label"
                >{{ t('meterData.filters.timestampTo.label') }}:</label
              >
              <input
                id="timestampToFilter"
                v-model="timestampToFilter"
                class="form-control"
                type="date"
              />
            </div>
            <div class="col-12 pt-2">
              <button
                :disabled="applyFiltersDisabled"
                type="submit"
                class="btn btn-primary"
                @click="applyFilters"
              >
                {{ t('meterData.filters.apply') }}
              </button>
            </div>
          </form>
          <hr />
        </div>
        <div id="timeSeries" class="col-12">
          <h5>{{ t('meterData.timeSeries.title') }}</h5>
          <BaseLineChart
            :labels="timeSeriesChart.labels"
            :datasets="timeSeriesChart.dataSets"
            :title="t('meterData.timeSeries.chart.title')"
          />
          <hr />
        </div>
        <div id="analytics" class="col-12">
          <h5>{{ t('meterData.analytics.title') }}</h5>
          <BaseLineChart
            class="mb-3"
            :labels="averagePowerByWeekdayChart.labels"
            :datasets="averagePowerByWeekdayChart.dataSets"
            :title="t('meterData.analytics.charts.averagePowerByWeekday.title')"
          />
          <BaseLineChart
            :labels="averagePowerByHourChart.labels"
            :datasets="averagePowerByHourChart.dataSets"
            :title="t('meterData.analytics.charts.averagePowerByHour.title')"
          />
          <hr />
        </div>
        <div id="rawData" class="col-12">
          <h5>
            {{ t('meterData.rawData.title') }} - {{ timeSeries.values.length }}
            {{ t('meterData.rawData.powerMeasurements') }}
          </h5>
          <div class="row border border-dark bg-light fw-bold">
            <div class="col-lg-5 border border-dark text-lg-start">
              {{ t('meterData.rawData.smartMeterId') }}
            </div>
            <div class="col-lg-4 border border-dark text-lg-end">
              {{ t('meterData.rawData.timestamp') }}
            </div>
            <div class="col-lg-3 border border-dark text-lg-end">
              {{ t('meterData.rawData.instantaneousPower') }}
            </div>
          </div>
          <div
            v-for="(measurement, index) in timeSeries.values"
            :key="index"
            class="row border"
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
