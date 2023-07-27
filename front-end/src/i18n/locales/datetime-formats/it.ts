import type { DefineDateTimeFormat } from 'vue-i18n'

const datetimeFormat: DefineDateTimeFormat = {
  short: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  },
  long: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'UTC'
  }
}

export default datetimeFormat
