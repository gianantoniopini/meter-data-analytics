import { fireEvent, render, screen } from '@testing-library/vue';
import AxiosMockAdapter from 'axios-mock-adapter';
import axiosInstance from '@/http-common';
import Measurement from '@shared/interfaces/measurement.interface';
import { parseDateInISOFormat } from '@/utils/date-utils';
import {
  createMeasurements,
  mockGetInstantaneousPowerMeasurementsRequest,
  waitForLoadingMessageToAppear,
  waitForLoadingMessageToDisappear
} from './helpers/MeterData.helper';
import MeterData from '../MeterData.vue';

const axiosMockAdapter = new AxiosMockAdapter(axiosInstance, {
  delayResponse: 500
});

const setup = async (
  smartMeterId: string,
  timestampFrom: string | null,
  timestampTo: string | null,
  measurementsCount: number,
  apiRequestNetworkError?: boolean
): Promise<{ measurements: Measurement[]; applyButton: HTMLElement }> => {
  render(MeterData);

  const smartMeterIdFilter = screen.getByRole('textbox', {
    name: 'Smart Meter Id:'
  });
  fireEvent.update(smartMeterIdFilter, smartMeterId);

  let timestampFromDate: Date | null = null;
  if (timestampFrom) {
    const timestampFromFilter = screen.getByLabelText('Timestamp From:');
    fireEvent.update(timestampFromFilter, timestampFrom);

    const { year, month, date } = parseDateInISOFormat(timestampFrom);
    timestampFromDate = new Date(Date.UTC(year, month, date, 0, 0, 0));
  }

  let timestampToDate: Date | null = null;
  if (timestampTo) {
    const timestampToFilter = screen.getByLabelText('Timestamp To:');
    fireEvent.update(timestampToFilter, timestampTo);

    const { year, month, date } = parseDateInISOFormat(timestampTo);
    timestampToDate = new Date(Date.UTC(year, month, date, 23, 59, 59));
  }

  const measurements =
    measurementsCount > 0
      ? createMeasurements(
          smartMeterId,
          timestampFromDate ?? new Date('2021-05-01T00:00:00Z'),
          measurementsCount
        )
      : [];

  mockGetInstantaneousPowerMeasurementsRequest(
    axiosMockAdapter,
    smartMeterId,
    timestampFromDate ? timestampFromDate.toISOString() : null,
    timestampToDate ? timestampToDate.toISOString() : null,
    measurements,
    apiRequestNetworkError
  );

  const applyButton = screen.getByRole('button', {
    name: 'Apply'
  });

  return {
    measurements,
    applyButton
  };
};

describe('clicking the filters Apply button', () => {
  const smartMeterId = 'abcd-1234';
  const measurementsCount = 100;

  it('displays Loading message', async () => {
    const { applyButton } = await setup(
      smartMeterId,
      null,
      null,
      measurementsCount
    );

    await fireEvent.click(applyButton);

    const loadingMessage = await waitForLoadingMessageToAppear();
    expect(loadingMessage).toBeInTheDocument();
  });

  it('disables button while loading', async () => {
    const { applyButton } = await setup(
      smartMeterId,
      null,
      null,
      measurementsCount
    );

    await fireEvent.click(applyButton);
    await waitForLoadingMessageToAppear();

    expect(applyButton).toBeDisabled();
  });

  it('enables button after loading', async () => {
    const { applyButton } = await setup(
      smartMeterId,
      null,
      null,
      measurementsCount
    );

    await fireEvent.click(applyButton);
    await waitForLoadingMessageToAppear();
    await waitForLoadingMessageToDisappear();

    expect(applyButton).toBeEnabled();
  });

  it('makes api request with expected parameters', async () => {
    const timestampFrom = '2022-02-10';
    const timestampTo = '2022-05-10';
    const { applyButton } = await setup(
      smartMeterId,
      timestampFrom,
      timestampTo,
      measurementsCount
    );

    await fireEvent.click(applyButton);
    await waitForLoadingMessageToAppear();
    await waitForLoadingMessageToDisappear();

    expect(axiosMockAdapter.history.get).toHaveLength(1);
    const apiRequestUrl = axiosMockAdapter.history.get[0].url;
    expect(apiRequestUrl).toBeDefined();
    const apiRequestUrlAsString = apiRequestUrl as string;
    const apiRequestParameters = new URLSearchParams(
      apiRequestUrlAsString.substring(apiRequestUrlAsString.indexOf('?'))
    );
    expect(apiRequestParameters.get('muid')).toEqual(smartMeterId);
    expect(apiRequestParameters.get('start')).toEqual(
      `${timestampFrom}T00:00:00.000Z`
    );
    expect(apiRequestParameters.get('stop')).toEqual(
      `${timestampTo}T23:59:59.000Z`
    );
  });

  it('renders Raw Data table', async () => {
    const { measurements, applyButton } = await setup(
      smartMeterId,
      null,
      null,
      measurementsCount
    );

    await fireEvent.click(applyButton);
    await waitForLoadingMessageToAppear();
    await waitForLoadingMessageToDisappear();

    const rawDataTableHeader = await screen.findByRole('heading', {
      name: `Raw Data - ${measurementsCount} Power Measurements`
    });
    expect(rawDataTableHeader).toBeInTheDocument();

    expect(measurements).toHaveLength(measurementsCount);
    for (const measurement of measurements) {
      const expectedTimestampText = measurement.timestamp.toUTCString();
      const timestampTableCell = await screen.findByText(expectedTimestampText);
      expect(timestampTableCell).toBeInTheDocument();

      const expectedInstantaneousPowerText =
        measurement['0100100700FF'].toFixed(2);
      const instantaneousPowerTableCell = await screen.findByText(
        expectedInstantaneousPowerText
      );
      expect(instantaneousPowerTableCell).toBeInTheDocument();
    }
  });

  it('renders Error message if api request fails', async () => {
    const { applyButton } = await setup(smartMeterId, null, null, 0, true);
    jest.spyOn(console, 'error').mockImplementationOnce(() => {
      // do nothing
    });

    await fireEvent.click(applyButton);
    await waitForLoadingMessageToAppear();

    const errorMessage = await screen.findByText(
      'An unexpected error occurred. Please try again.'
    );
    expect(errorMessage).toBeInTheDocument();
  });
});

afterEach(async () => {
  await waitForLoadingMessageToDisappear();

  axiosMockAdapter.reset();
  jest.restoreAllMocks();
});
