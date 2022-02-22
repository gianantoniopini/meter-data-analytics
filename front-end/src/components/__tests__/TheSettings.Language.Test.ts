import { fireEvent, render, screen } from '@testing-library/vue';
import TheSettings from '../TheSettings.vue';
import store from '@/store';
import { setupI18n } from '@/i18n';
import { Locales } from '@/i18n/config/locales';

const setup = () => {
  render(TheSettings, {
    global: {
      plugins: [store, setupI18n()]
    }
  });
};

const getLanguageSelectorOption = (
  languageSelector: HTMLSelectElement,
  language: Locales
): HTMLOptionElement | undefined => {
  let languageSelectorOption: HTMLOptionElement | undefined;
  const languageSelectorOptions = languageSelector.options;

  for (
    let languageSelectorOptionIndex = 0;
    languageSelectorOptionIndex < languageSelectorOptions.length;
    languageSelectorOptionIndex++
  ) {
    if (
      languageSelectorOptions.item(languageSelectorOptionIndex)?.value ===
      language
    ) {
      languageSelectorOption =
        languageSelectorOptions.item(languageSelectorOptionIndex) ?? undefined;
      break;
    }
  }

  return languageSelectorOption;
};

it('renders the language dropdown in English', () => {
  setup();

  const languageSelector = screen.queryByLabelText(
    'Language:'
  ) as HTMLSelectElement;
  expect(languageSelector).toBeInTheDocument();
  expect(languageSelector).toHaveDisplayValue('English');
  const italianLanguageSelectorOption = getLanguageSelectorOption(
    languageSelector,
    Locales.it
  );
  expect(italianLanguageSelectorOption).not.toBeNull();
  expect(italianLanguageSelectorOption).toHaveTextContent('Italian');
});

describe('changing the language to Italian', () => {
  it('renders the language dropdown in Italian', async () => {
    setup();
    const languageSelector = screen.getByLabelText('Language:');

    await fireEvent.update(languageSelector, Locales.it);

    const updatedLanguageSelector = screen.queryByLabelText(
      'Lingua:'
    ) as HTMLSelectElement;
    expect(updatedLanguageSelector).toBeInTheDocument();
    expect(updatedLanguageSelector).toHaveDisplayValue('Italiano');
    const englishLanguageSelectorOption = getLanguageSelectorOption(
      updatedLanguageSelector,
      Locales.enGb
    );
    expect(englishLanguageSelectorOption).not.toBeNull();
    expect(englishLanguageSelectorOption).toHaveTextContent('Inglese');
  });

  it('sets the html lang to Italian', async () => {
    setup();
    const languageSelector = screen.getByLabelText('Language:');

    await fireEvent.update(languageSelector, Locales.it);

    const htmlElement = document.querySelector('html');
    expect(htmlElement).toBeInTheDocument();
    const htmlLangAttribute = htmlElement?.getAttribute('lang');
    expect(htmlLangAttribute).toEqual(Locales.it);
  });

  afterEach(async () => {
    // Switch back to English language, if the language was changed to Italian
    const languageSelector = screen.queryByLabelText('Lingua:');
    if (languageSelector) {
      await fireEvent.update(languageSelector, Locales.enGb);
    }
  });
});
