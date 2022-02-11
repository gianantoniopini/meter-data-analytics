interface I18nLanguage {
  param: string;
  title: string;
}

export enum Locales {
  enGb = 'en-gb',
  it = 'it'
}

export const LayoutLanguages: Array<I18nLanguage> = [
  {
    param: Locales.enGb,
    title: 'English'
  },
  {
    param: Locales.it,
    title: 'Italiano'
  }
];
