import http from "@/http-common";
import ResponseData from "@/types/ResponseData";

class MeasurementDataService {
  getAll(): Promise<ResponseData> {
    return http.get("/measurements");
  }
}

export default new MeasurementDataService();
