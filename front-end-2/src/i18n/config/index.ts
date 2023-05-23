import { Locales } from './locales'

import enGbMessages from '../locales/messages/en-gb.json'
import itMessages from '../locales/messages/it.json'
import enGbDatetimeFormat from '../locales/datetime-formats/en-gb'
import itDatetimeFormat from '../locales/datetime-formats/it'
import enGbNumberFormat from '../locales/number-formats/en-gb'
import itNumberFormat from '../locales/number-formats/it'

export const messages = {
  [Locales.enGb]: enGbMessages,
  [Locales.it]: itMessages
}

export const datetimeFormats = {
  [Locales.enGb]: enGbDatetimeFormat,
  [Locales.it]: itDatetimeFormat
}

export const numberFormats = {
  [Locales.enGb]: enGbNumberFormat,
  [Locales.it]: itNumberFormat
}

export const defaultLocale = Locales.enGb
