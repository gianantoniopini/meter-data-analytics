import { Locales } from './locales';

import enGb from '../locales/en-gb.json';
import it from '../locales/it.json';

export const messages = {
  [Locales.enGb]: enGb,
  [Locales.it]: it
};

export const defaultLocale =
  process.env.VUE_APP_I18N_DEFAULT_LOCALE in Locales
    ? (process.env.VUE_APP_I18N_DEFAULT_LOCALE as Locales)
    : Locales.enGb;
