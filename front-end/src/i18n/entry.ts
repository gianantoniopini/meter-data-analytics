import { createI18n } from 'vue-i18n';
import { messages, defaultLocale } from './config/index';
import { Locales } from './config/locales';

type MessageSchema = typeof messages[typeof defaultLocale];

const i18n = createI18n<[MessageSchema], Locales>({
  messages,
  locale: defaultLocale,
  fallbackLocale: defaultLocale
});

export default i18n;
