import { screen, waitFor } from '@testing-library/vue';
import MeterDataSerice from '../../../services/MeterDataService';
import Measurement from '../../../types/Measurement';

const loadingMessage = 'Loading...';

export const mockMeterDataSericeGetMeasurementsRequest = (
  mockedMeterDataSerice: typeof MeterDataSerice,
  measurements: Measurement[]
): void => {
  mockedMeterDataSerice.getMeasurements = jest.fn().mockImplementation(() => {
    return new Promise<Measurement[]>((resolve) =>
      setTimeout(() => resolve(measurements), 1000)
    );
  });
};

export const waitForLoadingMessageToAppear = async (): Promise<HTMLElement> => {
  return await screen.findByText(loadingMessage);
};

export const waitForLoadingMessageToDisappear = async (): Promise<void> => {
  await waitFor(
    () => {
      return screen.queryByText(loadingMessage) === null
        ? Promise.resolve()
        : Promise.reject();
    },
    { timeout: 2000 }
  );
};
