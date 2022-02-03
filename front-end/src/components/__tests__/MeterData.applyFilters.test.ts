import { fireEvent, render, screen } from '@testing-library/vue';
import AxiosMockAdapter from 'axios-mock-adapter';
import axiosInstance from '@/http-common';
import Measurement from '@shared/interfaces/measurement.interface';
import {
  mockGetInstantaneousPowerMeasurementsRequest,
  waitForLoadingMessageToAppear,
  waitForLoadingMessageToDisappear
} from './helpers/MeterData.helper';
import MeterData from '../MeterData.vue';

const axiosMockAdapter = new AxiosMockAdapter(axiosInstance, {
  delayResponse: 1000
});

const setup = async (measurements: Measurement[]): Promise<HTMLElement> => {
  mockGetInstantaneousPowerMeasurementsRequest(
    axiosMockAdapter,
    process.env.VUE_APP_DEFAULT_SMART_METER_ID as string,
    null,
    null,
    measurements
  );

  render(MeterData);

  return screen.getByRole('button', {
    name: 'Apply'
  });
};

it('displays Loading message', async () => {
  const applyButton = await setup([]);

  await fireEvent.click(applyButton);

  const loadingMessage = await waitForLoadingMessageToAppear();
  expect(loadingMessage).toBeInTheDocument();
});

it('disables button while loading', async () => {
  const applyButton = await setup([]);

  await fireEvent.click(applyButton);
  await waitForLoadingMessageToAppear();

  expect(applyButton).toBeDisabled();
});

it('enables button after loading', async () => {
  const applyButton = await setup([]);

  await fireEvent.click(applyButton);
  await waitForLoadingMessageToAppear();
  await waitForLoadingMessageToDisappear();

  expect(applyButton).toBeEnabled();
});

afterEach(async () => {
  await waitForLoadingMessageToDisappear();
  axiosMockAdapter.reset();
});
