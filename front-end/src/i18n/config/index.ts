import { Locales } from './locales';

import enGb from '../locales/en-gb.json';
import it from '../locales/it.json';

export const messages = {
  [Locales.enGb]: enGb,
  [Locales.it]: it
};

export const defaultLocale = Locales.enGb;
