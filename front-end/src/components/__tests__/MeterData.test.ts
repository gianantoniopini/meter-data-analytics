import { render, screen, queryAllByRole } from '@testing-library/vue';
import { mocked } from 'ts-jest/utils';
import MeterDataSerice from '../../services/MeterDataService';
import {
  mockMeterDataSericeGetMeasurementsRequest,
  waitForLoadingMessageToAppear,
  waitForLoadingMessageToDisappear
} from './helpers/MeterData.helper';
import MeterData from '../MeterData.vue';

jest.mock('../../services/MeterDataService');
const mockedMeterDataSerice = mocked(MeterDataSerice);

it('renders sidebar menu', () => {
  mockMeterDataSericeGetMeasurementsRequest(mockedMeterDataSerice, []);

  render(MeterData);

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
  mockMeterDataSericeGetMeasurementsRequest(mockedMeterDataSerice, []);

  render(MeterData);

  const loadingMessage = await waitForLoadingMessageToAppear();
  expect(loadingMessage).toBeInTheDocument();
});

it('sets default value for Smart Meter Id filter', () => {
  mockMeterDataSericeGetMeasurementsRequest(mockedMeterDataSerice, []);
  const expectedValue = process.env.VUE_APP_DEFAULT_SMART_METER_ID;

  render(MeterData);

  const smartMeterIdFilter = screen.queryByRole('textbox', {
    name: 'Smart Meter Id:'
  });
  expect(smartMeterIdFilter).toBeInTheDocument();
  expect(smartMeterIdFilter).toHaveDisplayValue(expectedValue);
});

afterEach(async () => {
  await waitForLoadingMessageToDisappear();
});
