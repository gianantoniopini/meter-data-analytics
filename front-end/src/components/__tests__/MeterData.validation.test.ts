import { fireEvent, render, screen } from '@testing-library/vue';
import { mocked } from 'ts-jest/utils';
import MeterDataSerice from '../../services/MeterDataService';
import {
  mockMeterDataSericeGetMeasurementsRequest,
  waitForLoadingMessageToDisappear
} from './helpers/MeterData.helper';
import MeterData from '../MeterData.vue';

jest.mock('../../services/MeterDataService');
const mockedMeterDataSerice = mocked(MeterDataSerice);

describe('with no Smart Meter Id', () => {
  it('gives validation error', async () => {
    mockMeterDataSericeGetMeasurementsRequest(mockedMeterDataSerice, []);
    render(MeterData);
    await waitForLoadingMessageToDisappear();
    const smartMeterIdFilter = screen.getByRole('textbox', {
      name: 'Smart Meter Id:'
    });

    await fireEvent.update(smartMeterIdFilter, '');

    expect(smartMeterIdFilter.title).toEqual('Value is required');
  });
});

afterEach(async () => {
  await waitForLoadingMessageToDisappear();
});
