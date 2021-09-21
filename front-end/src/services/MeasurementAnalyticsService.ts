import Measurement from "@/types/Measurement";
import WeekdayAveragePower from "@/types/WeekdayAveragePower";

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

      const averagePower =
        filteredMeasurements.reduce(
          (sum, current) => sum + current["0100100700FF"],
          0
        ) / filteredMeasurements.length;

      results.push({
        isoWeekday: mapWeekdayToIsoWeekday(weekday),
        averagePower: averagePower,
      });
    }

    return results.sort((r1: WeekdayAveragePower, r2: WeekdayAveragePower) => {
      return r1.isoWeekday - r2.isoWeekday;
    });
  }
}

export default new MeasurementAnalyticsService();
