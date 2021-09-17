import http from "@/http-common";
import ResponseBody from "@/types/ResponseBody";
import Measurement from "@/types/Measurement";

class MeasurementDataService {
  async getAll(): Promise<Measurement[]> {
    const { data: responseBody } = await http.get<ResponseBody>(
      "/measurements"
    );

    const sortedMeasurements = responseBody.data.sort(
      (m1: Measurement, m2: Measurement) => {
        return (
          new Date(m1.timestamp).getTime() - new Date(m2.timestamp).getTime()
        );
      }
    );

    return sortedMeasurements;
  }
}

export default new MeasurementDataService();
