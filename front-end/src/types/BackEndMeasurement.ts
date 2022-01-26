export default interface BackEndMeasurement {
  measurement: string;
  timestamp: string;
  tags: { muid: string };
  '0100010700FF': number;
  '0100020700FF': number;
  '0100100700FF': number;
}
