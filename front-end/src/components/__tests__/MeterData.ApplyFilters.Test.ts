import { fireEvent, screen } from '@testing-library/vue';
import AxiosMockAdapter from 'axios-mock-adapter';
import axiosInstance from '@/utils/http-utils';
import Measurement from '@shared/interfaces/measurement.interface';
import {
  createMeasurements,
  mockGetInstantaneousPowerMeasurementsRequest,
  renderComponent,
  waitForLoadingMessageToAppear,
  waitForLoadingMessageToDisappear
} from './helpers/MeterData.Helper';
import {
  datetimeFormats,
  numberFormats,
  defaultLocale
} from '@/i18n/config/index';

const axiosMockAdapter = new AxiosMockAdapter(axiosInstance, {
  delayResponse: 500
});

const parseDateInISOFormat = (
  dateInISOFormat: string
): { year: number; month: number; date: number } => {
  return {
    year: Number.parseInt(dateInISOFormat.slice(0, 4), 10),
    month: Number.parseInt(dateInISOFormat.slice(5, 7), 10) - 1,
    date: Number.parseInt(dateInISOFormat.slice(8, 10), 10)
  };
};

const setup = async (
  smartMeterId: string,
  timestampFrom: string | undefined,
  timestampTo: string | undefined,
  measurementsCount: number,
  apiRequestNetworkError?: boolean
): Promise<{ measurements: Measurement[]; applyButton: HTMLElement }> => {
  renderComponent();

  const smartMeterIdFilter = screen.getByRole('textbox', {
    name: 'Smart Meter Id:'
  });
  fireEvent.update(smartMeterIdFilter, smartMeterId);

  let timestampFromDate: Date | undefined;
  if (timestampFrom) {
    const timestampFromFilter = screen.getByLabelText('Timestamp From:');
    fireEvent.update(timestampFromFilter, timestampFrom);

    const { year, month, date } = parseDateInISOFormat(timestampFrom);
    timestampFromDate = new Date(Date.UTC(year, month, date, 0, 0, 0));
  }

  let timestampToDate: Date | undefined;
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
    timestampFromDate ? timestampFromDate.toISOString() : undefined,
    timestampToDate ? timestampToDate.toISOString() : undefined,
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
      undefined,
      undefined,
      measurementsCount
    );

    await fireEvent.click(applyButton);

    const loadingMessage = await waitForLoadingMessageToAppear();
    expect(loadingMessage).toBeInTheDocument();
  });

  it('disables button while loading', async () => {
    const { applyButton } = await setup(
      smartMeterId,
      undefined,
      undefined,
      measurementsCount
    );

    await fireEvent.click(applyButton);
    await waitForLoadingMessageToAppear();

    expect(applyButton).toBeDisabled();
  });

  it('enables button after loading', async () => {
    const { applyButton } = await setup(
      smartMeterId,
      undefined,
      undefined,
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
      apiRequestUrlAsString.slice(apiRequestUrlAsString.indexOf('?'))
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
      undefined,
      undefined,
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
      const expectedTimestampText = measurement.timestamp.toLocaleString(
        defaultLocale,
        datetimeFormats[defaultLocale].long
      );
      const timestampTableCell = await screen.findByText(expectedTimestampText);
      expect(timestampTableCell).toBeInTheDocument();

      const expectedInstantaneousPowerText = measurement[
        '0100100700FF'
      ].toLocaleString(defaultLocale, numberFormats[defaultLocale].decimal);
      const instantaneousPowerTableCell = await screen.findByText(
        expectedInstantaneousPowerText
      );
      expect(instantaneousPowerTableCell).toBeInTheDocument();
    }
  });

  it('renders Error message if api request fails', async () => {
    const { applyButton } = await setup(
      smartMeterId,
      undefined,
      undefined,
      0,
      true
    );
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
