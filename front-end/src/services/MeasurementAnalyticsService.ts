import Measurement from "@/types/Measurement";
import WeekdayAveragePower from "@/types/WeekdayAveragePower";
import HourAveragePower from "@/types/HourAveragePower";

const mapWeekdayToIsoWeekday = (weekday: number): number => {
  switch (weekday) {
    case 0: {
      // Sunday
      return 7;
    }
    default: {
      return weekday;
    }
  }
};

const calculateAveragePower = (measurements: Measurement[]): number => {
  const averagePower =
    measurements.reduce((sum, current) => sum + current["0100100700FF"], 0) /
    measurements.length;

  return averagePower;
};

class MeasurementAnalyticsService {
  calculateAveragePowerByWeekday(
    measurements: Measurement[]
  ): WeekdayAveragePower[] {
    const weekdays = [...Array(7).keys()].map((i) => i);
    const results: WeekdayAveragePower[] = [];

    for (const weekday of weekdays) {
      const filteredMeasurements = measurements.filter(
        (m) => new Date(m.timestamp).getUTCDay() === weekday
      );

      if (filteredMeasurements.length === 0) {
        continue;
      }

      const averagePower = calculateAveragePower(filteredMeasurements);

      results.push({
        isoWeekday: mapWeekdayToIsoWeekday(weekday),
        averagePower: averagePower,
      });
    }

    return results.sort((r1: WeekdayAveragePower, r2: WeekdayAveragePower) => {
      return r1.isoWeekday - r2.isoWeekday;
    });
  }

  calculateAveragePowerByHour(measurements: Measurement[]): HourAveragePower[] {
    const hours = [...Array(24).keys()].map((i) => i);
    const results: HourAveragePower[] = [];

    for (const hour of hours) {
      const filteredMeasurements = measurements.filter(
        (m) => new Date(m.timestamp).getUTCHours() === hour
      );

      if (filteredMeasurements.length === 0) {
        continue;
      }

      const averagePower = calculateAveragePower(filteredMeasurements);

      results.push({
        hour: hour,
        averagePower: averagePower,
      });
    }

    return results.sort((r1: HourAveragePower, r2: HourAveragePower) => {
      return r1.hour - r2.hour;
    });
  }
}

export default new MeasurementAnalyticsService();
