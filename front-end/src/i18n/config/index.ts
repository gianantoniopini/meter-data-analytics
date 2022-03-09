import { Locales } from './locales';

import enGbMessages from '../locales/en-gb.json';
import itMessages from '../locales/it.json';
import enGbDatetimeFormat from '../locales/datetime-formats/en-gb';
import itDatetimeFormat from '../locales/datetime-formats/it';

export const messages = {
  [Locales.enGb]: enGbMessages,
  [Locales.it]: itMessages
};

export const datetimeFormats = {
  [Locales.enGb]: enGbDatetimeFormat,
  [Locales.it]: itDatetimeFormat
};

export const defaultLocale = Locales.enGb;
