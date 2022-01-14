import { render, screen } from '@testing-library/vue';
import { mocked } from 'ts-jest/utils';
import MeterData from '../MeterData.vue';
import MeterDataSerice from '../../services/MeterDataService';
import Measurement from '../../types/Measurement';

jest.mock('../../services/MeterDataService');
const mockedMeterDataSerice = mocked(MeterDataSerice);

const mockMeterDataSericeGetMeasurementsRequest = (
  measurements: Measurement[]
): void => {
  mockedMeterDataSerice.getMeasurements = jest
    .fn()
    .mockResolvedValue(measurements);
};

it('renders sidebar menu', () => {
  mockMeterDataSericeGetMeasurementsRequest([]);

  render(MeterData);

  expect(screen.queryByRole('navigation')).toBeInTheDocument();
  // TODO: more assertions
});
