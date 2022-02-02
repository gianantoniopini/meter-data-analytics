import { screen, waitFor } from '@testing-library/vue';
import AxiosMockAdapter from 'axios-mock-adapter';
import { StatusCodes } from 'http-status-codes';
import BackEndMeasurement from '@/types/BackEndMeasurement';
import WeekdayAveragePower from '@/types/WeekdayAveragePower';
import HourAveragePower from '@shared/interfaces/hour-average-power.interface';

const loadingMessage = 'Loading...';

export const mockGetInstantaneousPowerMeasurementsRequest = (
  axiosMockAdapter: AxiosMockAdapter,
  smartMeterId: string,
  timestampFrom: string | null,
  timestampTo: string | null,
  measurements: BackEndMeasurement[]
): void => {
  const muidQueryString = `muid=${smartMeterId}`;
  const startQueryString = timestampFrom ? `&start=${timestampFrom}` : '';
  const stopQueryString = timestampTo ? `&stop=${timestampTo}` : '';
  const limitQueryString = '&limit=100000';

  const url = `/meterdata/measurement/instantaneouspower?${muidQueryString}${startQueryString}${stopQueryString}${limitQueryString}`;

  axiosMockAdapter.onGet(url).reply(StatusCodes.OK, {
    status: StatusCodes.OK,
    data: {
      timeSeries: measurements,
      analytics: {
        averagePowerByWeekday: [] as WeekdayAveragePower[],
        averagePowerByHour: [] as HourAveragePower[]
      }
    }
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
