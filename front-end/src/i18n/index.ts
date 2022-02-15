import { createI18n, I18n } from 'vue-i18n';
import { messages, defaultLocale } from './config/index';
import { Locales } from './config/locales';

const setHtmlLang = (value: Locales): void => {
  const htmlElement = document.querySelector('html');
  if (htmlElement) {
    htmlElement.setAttribute('lang', value as string);
  }
};

const setupI18n = (): I18n => {
  type MessageSchema = typeof messages[typeof defaultLocale];

  const i18n = createI18n<[MessageSchema], Locales>({
    messages,
    locale: defaultLocale,
    fallbackLocale: defaultLocale
  });

  setHtmlLang(defaultLocale);

  return i18n;
};

export { setHtmlLang, setupI18n };
