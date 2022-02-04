import { fireEvent, render, screen } from '@testing-library/vue';
import AxiosMockAdapter from 'axios-mock-adapter';
import axiosInstance from '@/http-common';
import Measurement from '@shared/interfaces/measurement.interface';
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
  measurementsCount: number
): Promise<{ measurements: Measurement[]; applyButton: HTMLElement }> => {
  render(MeterData);

  const smartMeterIdFilter = screen.getByRole('textbox', {
    name: 'Smart Meter Id:'
  }) as HTMLInputElement;
  const smartMeterId = smartMeterIdFilter.value;

  const timestamp = new Date('2021-05-01T00:00:00Z');
  const measurements =
    measurementsCount > 0
      ? createMeasurements(smartMeterId, timestamp, measurementsCount)
      : [];

  mockGetInstantaneousPowerMeasurementsRequest(
    axiosMockAdapter,
    smartMeterId,
    null,
    null,
    measurements
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
  const measurementsCount = 100;

  it('displays Loading message', async () => {
    const { applyButton } = await setup(measurementsCount);

    await fireEvent.click(applyButton);

    const loadingMessage = await waitForLoadingMessageToAppear();
    expect(loadingMessage).toBeInTheDocument();
  });

  it('disables button while loading', async () => {
    const { applyButton } = await setup(measurementsCount);

    await fireEvent.click(applyButton);
    await waitForLoadingMessageToAppear();

    expect(applyButton).toBeDisabled();
  });

  it('enables button after loading', async () => {
    const { applyButton } = await setup(measurementsCount);

    await fireEvent.click(applyButton);
    await waitForLoadingMessageToAppear();
    await waitForLoadingMessageToDisappear();

    expect(applyButton).toBeEnabled();
  });

  it('renders Raw Data table', async () => {
    const { measurements, applyButton } = await setup(measurementsCount);

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
});

afterEach(async () => {
  await waitForLoadingMessageToDisappear();
  axiosMockAdapter.reset();
});
