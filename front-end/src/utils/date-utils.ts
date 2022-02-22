export const parseDateInISOFormat = (
  dateInISOFormat: string
): { year: number; month: number; date: number } => {
  return {
    year: Number.parseInt(dateInISOFormat.slice(0, 4), 10),
    month: Number.parseInt(dateInISOFormat.slice(5, 7), 10) - 1,
    date: Number.parseInt(dateInISOFormat.slice(8, 10), 10)
  };
};
