import axiosInstance from '@/utils/http-utils';
import Measurement from '@shared/interfaces/measurement.interface';
import HourAveragePower from '@shared/interfaces/hour-average-power.interface';
import InstantaneousPowerMeasurement from '@/interfaces/instantaneous-power-measurement.interface';
import WeekdayAveragePower from '@shared/interfaces/weekday-average-power.interface';

const mapToInstantaneousPowerMeasurement = (
  backEndMeasurement: Measurement
): InstantaneousPowerMeasurement => {
  const measurement: InstantaneousPowerMeasurement = {
    muid: backEndMeasurement.tags.muid,
    timestamp: backEndMeasurement.timestamp,
    valueInWatts: backEndMeasurement['0100100700FF']
  };

  return measurement;
};

class MeterDataService {
  async getInstantaneousPowerMeasurements(
    smartMeterId: string,
    timestampFrom: string | undefined,
    timestampTo: string | undefined
  ): Promise<{
    timeSeries: InstantaneousPowerMeasurement[];
    analytics: {
      averagePowerByWeekday: WeekdayAveragePower[];
      averagePowerByHour: HourAveragePower[];
    };
  }> {
    const muidQueryString = `muid=${smartMeterId}`;
    const startQueryString = timestampFrom ? `&start=${timestampFrom}` : '';
    const stopQueryString = timestampTo ? `&stop=${timestampTo}` : '';
    const limitQueryString = '&limit=100000';

    const url = `/meterdata/measurement/instantaneouspower?${muidQueryString}${startQueryString}${stopQueryString}${limitQueryString}`;

    const { data: responseBody } = await axiosInstance.get<{
      status: string;
      data: {
        timeSeries: Measurement[];
        analytics: {
          averagePowerByWeekday: WeekdayAveragePower[];
          averagePowerByHour: HourAveragePower[];
        };
      };
    }>(url);

    const instantaneousPowerMeasurements = responseBody.data.timeSeries.map(
      (m) => mapToInstantaneousPowerMeasurement(m)
    );

    const instantaneousPowerMeasurementsSorted =
      instantaneousPowerMeasurements.sort(
        (
          m1: InstantaneousPowerMeasurement,
          m2: InstantaneousPowerMeasurement
        ) => {
          return (
            new Date(m1.timestamp).getTime() - new Date(m2.timestamp).getTime()
          );
        }
      );

    return {
      timeSeries: instantaneousPowerMeasurementsSorted,
      analytics: responseBody.data.analytics
    };
  }
}

export default new MeterDataService();
