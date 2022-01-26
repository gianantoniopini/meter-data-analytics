import axiosInstance from '@/http-common';
import BackEndMeasurement from '@/types/BackEndMeasurement';
import InstantaneousPowerMeasurement from '@/types/InstantaneousPowerMeasurement';

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
  ): Promise<InstantaneousPowerMeasurement[]> {
    const muidQueryString = `muid=${smartMeterId}`;
    const startQueryString = timestampFrom ? `&start=${timestampFrom}` : '';
    const stopQueryString = timestampTo ? `&stop=${timestampTo}` : '';
    const limitQueryString = '&limit=100000';

    const url = `/meterdata/measurement?${muidQueryString}${startQueryString}${stopQueryString}${limitQueryString}`;

    const { data: responseBody } = await axiosInstance.get<{
      status: string;
      data: BackEndMeasurement[];
    }>(url);

    const instantaneousPowerMeasurements = responseBody.data
      .filter((m) => m.measurement === 'power')
      .map(mapToInstantaneousPowerMeasurement);

    return instantaneousPowerMeasurements.sort(
      (
        m1: InstantaneousPowerMeasurement,
        m2: InstantaneousPowerMeasurement
      ) => {
        return (
          new Date(m1.timestamp).getTime() - new Date(m2.timestamp).getTime()
        );
      }
    );
  }
}

export default new MeterDataService();
