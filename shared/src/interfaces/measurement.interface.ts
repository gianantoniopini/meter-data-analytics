export default interface Measurement {
  _id: string;
  measurement: string;
  timestamp: Date;
  tags: { muid: string };
  '0100010700FF': number;
  '0100020700FF': number;
  '0100100700FF': number;
}
