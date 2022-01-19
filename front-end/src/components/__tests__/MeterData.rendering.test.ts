import { render, screen, queryAllByRole } from '@testing-library/vue';
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

const setup = (measurements: Measurement[]): void => {
  mockMeterDataSericeGetMeasurementsRequest(
    mockedMeterDataSerice,
    measurements
  );

  render(MeterData);
};

it('renders sidebar menu', () => {
  setup([]);

  const navigation = screen.queryByRole('navigation');
  expect(navigation).toBeInTheDocument();
  const navigationLinks = queryAllByRole(navigation as HTMLElement, 'link');
  expect(navigationLinks).toHaveLength(4);
  expect(navigationLinks[0].title).toEqual('Filters');
  expect(navigationLinks[1].title).toEqual('Time Series');
  expect(navigationLinks[2].title).toEqual('Analytics');
  expect(navigationLinks[3].title).toEqual('Raw Data');
});

it('displays Loading message', async () => {
  setup([]);

  const loadingMessage = await waitForLoadingMessageToAppear();
  expect(loadingMessage).toBeInTheDocument();
});

it('disables Apply button while loading', async () => {
  setup([]);

  await waitForLoadingMessageToAppear();

  const applyButton = screen.getByRole('button', {
    name: 'Apply'
  });
  expect(applyButton).toBeDisabled();
});

it('enables Apply button after loading', async () => {
  setup([]);

  await waitForLoadingMessageToAppear();
  await waitForLoadingMessageToDisappear();

  const applyButton = screen.getByRole('button', {
    name: 'Apply'
  });
  expect(applyButton).toBeEnabled();
});

it('sets default value for Smart Meter Id filter', () => {
  setup([]);
  const expectedValue = process.env.VUE_APP_DEFAULT_SMART_METER_ID;

  const smartMeterIdFilter = screen.queryByRole('textbox', {
    name: 'Smart Meter Id:'
  });
  expect(smartMeterIdFilter).toBeInTheDocument();
  expect(smartMeterIdFilter).toHaveDisplayValue(expectedValue);
});

afterEach(async () => {
  await waitForLoadingMessageToDisappear();
});
