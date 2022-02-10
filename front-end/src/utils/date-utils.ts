export const parseDateInISOFormat = (
  dateInISOFormat: string
): { year: number; month: number; date: number } => {
  return {
    year: parseInt(dateInISOFormat.substring(0, 4), 10),
    month: parseInt(dateInISOFormat.substring(5, 7), 10) - 1,
    date: parseInt(dateInISOFormat.substring(8, 10), 10)
  };
};
