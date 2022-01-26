import axiosInstance from '@/http-common';
import Measurement from '@/types/Measurement';

class MeterDataService {
  async getMeasurements(
    smartMeterId: string,
    timestampFrom: string | null,
    timestampTo: string | null
  ): Promise<Measurement[]> {
    const muidQueryString = `muid=${smartMeterId}`;
    const startQueryString = timestampFrom ? `&start=${timestampFrom}` : '';
    const stopQueryString = timestampTo ? `&stop=${timestampTo}` : '';
    const limitQueryString = '&limit=100000';

    const url = `/meterdata/measurement?${muidQueryString}${startQueryString}${stopQueryString}${limitQueryString}`;

    const { data: responseBody } = await axiosInstance.get<{
      status: string;
      data: Measurement[];
    }>(url);

    return responseBody.data.sort((m1: Measurement, m2: Measurement) => {
      return (
        new Date(m1.timestamp).getTime() - new Date(m2.timestamp).getTime()
      );
    });
  }
}

export default new MeterDataService();
