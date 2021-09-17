import Measurement from "./Measurement";

export default interface ResponseBody {
  status: string;
  data: Measurement[];
}
