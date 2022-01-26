import { screen, waitFor } from '@testing-library/vue';
import AxiosMockAdapter from 'axios-mock-adapter';
import { StatusCodes } from 'http-status-codes';
import Measurement from '../../../types/Measurement';

const loadingMessage = 'Loading...';

export const mockAxiosGetMeasurementsRequest = (
  axiosMockAdapter: AxiosMockAdapter,
  smartMeterId: string,
  timestampFrom: string | null,
  timestampTo: string | null,
  measurements: Measurement[]
): void => {
  const muidQueryString = `muid=${smartMeterId}`;
  const startQueryString = timestampFrom ? `&start=${timestampFrom}` : '';
  const stopQueryString = timestampTo ? `&stop=${timestampTo}` : '';
  const limitQueryString = '&limit=100000';

  const url = `/meterdata/measurement?${muidQueryString}${startQueryString}${stopQueryString}${limitQueryString}`;

  axiosMockAdapter.onGet(url).reply(StatusCodes.OK, {
    status: StatusCodes.OK,
    data: measurements
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
