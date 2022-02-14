export default interface Measurement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _id: any;
  measurement: string;
  timestamp: Date;
  tags: { muid: string };
  '0100010700FF': number;
  '0100020700FF': number;
  '0100100700FF': number;
}
