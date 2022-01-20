import { fireEvent, render, screen } from '@testing-library/vue';
import { mocked } from 'ts-jest/utils';
import MeterDataSerice from '../../services/MeterDataService';
import {
  mockMeterDataSericeGetMeasurementsRequest,
  waitForLoadingMessageToAppear,
  waitForLoadingMessageToDisappear
} from './helpers/MeterData.helper';
import MeterData from '../MeterData.vue';
import Measurement from '@/types/Measurement';

jest.mock('../../services/MeterDataService');
const mockedMeterDataSerice = mocked(MeterDataSerice);

const setup = async (measurements: Measurement[]): Promise<HTMLElement> => {
  mockMeterDataSericeGetMeasurementsRequest(
    mockedMeterDataSerice,
    measurements
  );

  render(MeterData);
  await waitForLoadingMessageToAppear();
  await waitForLoadingMessageToDisappear();

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
});
