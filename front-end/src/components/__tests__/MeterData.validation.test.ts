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

const setup = async (smartMeterIdFilterValue: string): Promise<HTMLElement> => {
  mockMeterDataSericeGetMeasurementsRequest(mockedMeterDataSerice, []);
  render(MeterData);
  await waitForLoadingMessageToDisappear();
  const smartMeterIdFilter = screen.getByRole('textbox', {
    name: 'Smart Meter Id:'
  });

  await fireEvent.update(smartMeterIdFilter, smartMeterIdFilterValue);

  return smartMeterIdFilter;
};

describe('if Smart Meter Id filter is cleared', () => {
  it('gives validation error', async () => {
    const smartMeterIdFilter = await setup('');

    expect(smartMeterIdFilter.title).toEqual('Value is required');
  });

  it('disables Apply button', async () => {
    await setup('');
    const applyButton = screen.getByRole('button', {
      name: 'Apply'
    });

    expect(applyButton).toBeDisabled();
  });
});

afterEach(async () => {
  await waitForLoadingMessageToDisappear();
});
