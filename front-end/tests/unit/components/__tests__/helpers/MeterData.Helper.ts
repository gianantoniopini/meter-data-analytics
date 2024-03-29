import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import VueDatePicker from '@vuepic/vue-datepicker'
import AxiosMockAdapter from 'axios-mock-adapter'
import { StatusCodes } from 'http-status-codes'
import type Measurement from '@shared/interfaces/measurement.interface'
import type WeekdayAveragePower from '@shared/interfaces/weekday-average-power.interface'
import type HourAveragePower from '@shared/interfaces/hour-average-power.interface'
import MeterData from '@/components/MeterData.vue'
import { setupI18n } from '@/i18n'

const randomIntFromInterval = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const createMeasurements = (
  muid: string,
  timestampStart: Date,
  count: number
): Measurement[] => {
  const measurements: Measurement[] = []

  const indexes = [...Array.from({ length: count }).keys()].map((index) => index)
  for (const index of indexes) {
    // One measurement every 15 minutes
    const timestamp = new Date(timestampStart.getTime() + 15 * index * 60_000)

    // Random power value between 0 and 5000
    const powerValue = Math.random() * 5000

    const measurement = {
      measurement: 'power',
      timestamp: timestamp,
      tags: { muid: muid },
      '0100010700FF': powerValue,
      '0100020700FF': 0,
      '0100100700FF': powerValue
    } as Measurement

    measurements.push(measurement)
  }

  return measurements
}

const createAveragePowerByWeekdayArray = () => {
  return [...Array.from({ length: randomIntFromInterval(1, 7) }).keys()].map((index) => {
    return {
      isoWeekday: index + 1,
      averagePower: Math.random() * 5000
    } as WeekdayAveragePower
  })
}

const createAveragePowerByHourArray = () => {
  return [...Array.from({ length: randomIntFromInterval(1, 24) }).keys()].map((index) => {
    return {
      hour: index,
      averagePower: Math.random() * 5000
    } as HourAveragePower
  })
}

export const mockGetInstantaneousPowerMeasurementsRequest = (
  axiosMockAdapter: AxiosMockAdapter,
  smartMeterId: string,
  timestampFrom: string | undefined,
  timestampTo: string | undefined,
  measurements: Measurement[],
  networkError?: boolean
): void => {
  const muidQueryString = `muid=${smartMeterId}`
  const startQueryString = timestampFrom ? `&start=${timestampFrom}` : ''
  const stopQueryString = timestampTo ? `&stop=${timestampTo}` : ''
  const limitQueryString = '&limit=100000'

  const url = `/meterdata/measurement/instantaneouspower?${muidQueryString}${startQueryString}${stopQueryString}${limitQueryString}`

  if (networkError) {
    axiosMockAdapter.onGet(url).networkErrorOnce()
    return
  }

  const averagePowerByWeekday = measurements.length > 0 ? createAveragePowerByWeekdayArray() : []
  const averagePowerByHour = measurements.length > 0 ? createAveragePowerByHourArray() : []

  axiosMockAdapter.onGet(url).replyOnce(StatusCodes.OK, {
    status: StatusCodes.OK,
    data: {
      timeSeries: measurements,
      analytics: {
        averagePowerByWeekday,
        averagePowerByHour
      }
    }
  })
}

export const mountComponent = () => {
  return mount(MeterData, { global: { plugins: [setupI18n()], components: { VueDatePicker } } })
}

export const waitForRawDataTableHeaderToBeRendered = async (
  wrapper: VueWrapper,
  measurementsCount: Number
) => {
  const text = `Raw Data - ${measurementsCount} Power Measurements`
  while (wrapper.findAll('*').filter((node) => node.text() === text).length === 0) {
    await flushPromises()
  }
}
