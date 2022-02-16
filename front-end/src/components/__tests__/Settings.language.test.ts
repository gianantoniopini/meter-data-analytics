import { fireEvent, render, screen } from '@testing-library/vue';
import Settings from '../Settings.vue';

const getLanguageSelectorOption = (
  languageSelector: HTMLSelectElement,
  language: string
): HTMLOptionElement | null => {
  let languageSelectorOption: HTMLOptionElement | null = null;
  const languageSelectorOptions = languageSelector.options;

  for (
    let languageSelectorOptionIdx = 0;
    languageSelectorOptionIdx < languageSelectorOptions.length;
    languageSelectorOptionIdx++
  ) {
    if (
      languageSelectorOptions.item(languageSelectorOptionIdx)?.value ===
      language
    ) {
      languageSelectorOption = languageSelectorOptions.item(
        languageSelectorOptionIdx
      );
      break;
    }
  }

  return languageSelectorOption;
};

it('renders the language dropdown in English', () => {
  render(Settings);

  const languageSelector = screen.queryByLabelText(
    'Language:'
  ) as HTMLSelectElement;
  expect(languageSelector).toBeInTheDocument();
  expect(languageSelector).toHaveDisplayValue('English');
  const italianLanguageSelectorOption = getLanguageSelectorOption(
    languageSelector,
    'it'
  );
  expect(italianLanguageSelectorOption).not.toBeNull();
  expect(italianLanguageSelectorOption).toHaveTextContent('Italian');
});

describe('changing the language to Italian', () => {
  it('renders the language dropdown in Italian', async () => {
    render(Settings);
    const languageSelector = screen.getByLabelText('Language:');

    await fireEvent.update(languageSelector, 'it');

    const updatedLanguageSelector = screen.queryByLabelText(
      'Lingua:'
    ) as HTMLSelectElement;
    expect(updatedLanguageSelector).toBeInTheDocument();
    expect(updatedLanguageSelector).toHaveDisplayValue('Italiano');
    const englishLanguageSelectorOption = getLanguageSelectorOption(
      updatedLanguageSelector,
      'en-gb'
    );
    expect(englishLanguageSelectorOption).not.toBeNull();
    expect(englishLanguageSelectorOption).toHaveTextContent('Inglese');
  });
});
