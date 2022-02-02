import axiosInstance from '@/http-common';
import BackEndMeasurement from '@/types/BackEndMeasurement';
import HourAveragePower from '@shared/interfaces/hour-average-power.interface';
import InstantaneousPowerMeasurement from '@/types/InstantaneousPowerMeasurement';
import WeekdayAveragePower from '@/types/WeekdayAveragePower';

const mapToInstantaneousPowerMeasurement = (
  backEndMeasurement: BackEndMeasurement
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
    timestampFrom: string | null,
    timestampTo: string | null
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
        timeSeries: BackEndMeasurement[];
        analytics: {
          averagePowerByWeekday: WeekdayAveragePower[];
          averagePowerByHour: HourAveragePower[];
        };
      };
    }>(url);

    const instantaneousPowerMeasurements = responseBody.data.timeSeries.map(
      mapToInstantaneousPowerMeasurement
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
