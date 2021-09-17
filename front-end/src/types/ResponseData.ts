import Measurement from "./Measurement";

export default interface ResponseData {
  data: {
    status: string;
    data: Measurement[];
  };
}
