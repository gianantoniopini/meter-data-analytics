export const getWeekdayName = (locale: string, isoWeekday: number): string => {
  const format = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format
  return format(new Date(Date.UTC(2021, 10, isoWeekday)))
}
