export const getWeekdayName = (locale: string, isoWeekday: number): string => {
  const format = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format;
  return format(new Date(Date.UTC(2021, 10, isoWeekday)));
};

export const parseDateInISOFormat = (
  dateInISOFormat: string
): { year: number; month: number; date: number } => {
  return {
    year: Number.parseInt(dateInISOFormat.slice(0, 4), 10),
    month: Number.parseInt(dateInISOFormat.slice(5, 7), 10) - 1,
    date: Number.parseInt(dateInISOFormat.slice(8, 10), 10)
  };
};
