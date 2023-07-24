import { describe, it, expect, afterEach } from 'vitest'
import type { DOMWrapper } from '@vue/test-utils'
import AxiosMockAdapter from 'axios-mock-adapter'
import axiosInstance from '@/utils/http-utils'
import {
  createMeasurements,
  mockGetInstantaneousPowerMeasurementsRequest,
  mountComponent,
  waitForRawDataTableHeaderToBeRendered
} from './helpers/MeterData.Helper'
import { datetimeFormats, numberFormats, defaultLocale } from '@/i18n/config/index'

const axiosMockAdapter = new AxiosMockAdapter(axiosInstance, {
  delayResponse: 500
})

const parseDateInISOFormat = (
  dateInISOFormat: string
): { year: number; month: number; date: number } => {
  return {
    year: Number.parseInt(dateInISOFormat.slice(0, 4), 10),
    month: Number.parseInt(dateInISOFormat.slice(5, 7), 10) - 1,
    date: Number.parseInt(dateInISOFormat.slice(8, 10), 10)
  }
}

const setup = async (
  smartMeterId: string,
  timestampFrom: string | undefined,
  timestampTo: string | undefined,
  measurementsCount: number,
  apiRequestNetworkError?: boolean
) => {
  const wrapper = mountComponent()

  const smartMeterIdFilter = wrapper.get('input#smartMeterIdFilter')
  await smartMeterIdFilter.setValue(smartMeterId)

  let timestampFromDate: Date | undefined
  if (timestampFrom) {
    const timestampFromFilter = wrapper.get('#dp-input-timestampFromFilter')
    await timestampFromFilter.setValue(timestampFrom)

    const { year, month, date } = parseDateInISOFormat(timestampFrom)
    timestampFromDate = new Date(Date.UTC(year, month, date, 0, 0, 0))
  }

  let timestampToDate: Date | undefined
  if (timestampTo) {
    const timestampToFilter = wrapper.get('#dp-input-timestampToFilter')
    await timestampToFilter.setValue(timestampTo)

    const { year, month, date } = parseDateInISOFormat(timestampTo)
    timestampToDate = new Date(Date.UTC(year, month, date, 23, 59, 59))
  }

  const measurements =
    measurementsCount > 0
      ? createMeasurements(
          smartMeterId,
          timestampFromDate ?? new Date('2021-05-01T00:00:00Z'),
          measurementsCount
        )
      : []

  mockGetInstantaneousPowerMeasurementsRequest(
    axiosMockAdapter,
    smartMeterId,
    timestampFromDate ? timestampFromDate.toISOString() : undefined,
    timestampToDate ? timestampToDate.toISOString() : undefined,
    measurements,
    apiRequestNetworkError
  )

  const applyButton = wrapper.findAll('button').find((node) => node.text() === 'Apply') as DOMWrapper<HTMLButtonElement>

  return {
    wrapper,
    measurements,
    applyButton
  }
}

describe('MeterData', () => {
  describe('clicking the filters Apply button', () => {
    const smartMeterId = 'abcd-1234'
    const measurementsCount = 100

    /*
    it('displays Loading message', async () => {
      const { wrapper, applyButton } = await setup(
        smartMeterId,
        undefined,
        undefined,
        measurementsCount
      )

      await applyButton.trigger('click')

      const loadingMessage = await waitForLoadingMessageToAppear(wrapper)
      //expect(loadingMessage).toBeInTheDocument()
    })
    */

    it('disables button while loading', async () => {
      const { applyButton } = await setup(smartMeterId, undefined, undefined, measurementsCount)

      await applyButton.trigger('click')

      expect(applyButton.attributes()).toHaveProperty('disabled')
    })

    it('enables button after loading', async () => {
      const { wrapper, applyButton } = await setup(
        smartMeterId,
        undefined,
        undefined,
        measurementsCount
      )

      await applyButton.trigger('click')
      await waitForRawDataTableHeaderToBeRendered(wrapper, measurementsCount)

      expect(applyButton.attributes()).not.toHaveProperty('disabled')
    })

    it('makes api request with expected parameters', async () => {
      //const timestampFrom = '2022-02-10'
      const timestampFrom = undefined
      //const timestampTo = '2022-05-10'
      const timestampTo = undefined
      const { wrapper, applyButton } = await setup(
        smartMeterId,
        timestampFrom,
        timestampTo,
        measurementsCount
      )

      await applyButton.trigger('click')
      await waitForRawDataTableHeaderToBeRendered(wrapper, measurementsCount)

      expect(axiosMockAdapter.history.get).toHaveLength(1)
      const apiRequestUrl = axiosMockAdapter.history.get[0].url
      expect(apiRequestUrl).toBeDefined()
      const apiRequestUrlAsString = apiRequestUrl as string
      const apiRequestParameters = new URLSearchParams(
        apiRequestUrlAsString.slice(apiRequestUrlAsString.indexOf('?'))
      )
      expect(apiRequestParameters.get('muid')).toEqual(smartMeterId)
      //expect(apiRequestParameters.get('start')).toEqual(`${timestampFrom}T00:00:00.000Z`)
      //expect(apiRequestParameters.get('stop')).toEqual(`${timestampTo}T23:59:59.000Z`)
    })

    it('renders Raw Data table', async () => {
      const { wrapper, measurements, applyButton } = await setup(
        smartMeterId,
        undefined,
        undefined,
        measurementsCount
      )

      await applyButton.trigger('click')

      await waitForRawDataTableHeaderToBeRendered(wrapper, measurementsCount)

      expect(measurements).toHaveLength(measurementsCount)
      for (const measurement of measurements) {
        const expectedTimestampText = measurement.timestamp.toLocaleString(
          defaultLocale,
          datetimeFormats[defaultLocale].long
        )
        expect(
          wrapper.findAll('*').filter((node) => node.text() === expectedTimestampText)
        ).toHaveLength(1)

        const expectedInstantaneousPowerText = measurement['0100100700FF'].toLocaleString(
          defaultLocale,
          numberFormats[defaultLocale].decimal
        )
        expect(
          wrapper.findAll('*').filter((node) => node.text() === expectedInstantaneousPowerText)
        ).toHaveLength(1)
      }
    })

    /*
    it('renders Error message if api request fails', async () => {
      const { wrapper, applyButton } = await setup(
        smartMeterId,
        undefined,
        undefined,
        0,
        true
      )
      //jest.spyOn(console, 'error').mockImplementationOnce(() => {})

      await applyButton.trigger('click')
      //await waitForLoadingMessageToAppear()

      const errorMessage = 'An unexpected error occurred. Please try again.'
      expect(wrapper.findAll('*').filter((node) => node.text() === errorMessage)).toHaveLength(1)
    })
    */
  })
})

afterEach(async () => {
  axiosMockAdapter.reset()
})
