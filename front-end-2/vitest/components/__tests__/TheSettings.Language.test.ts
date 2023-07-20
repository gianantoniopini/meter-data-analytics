import { describe, it, expect, afterEach } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import TheSettings from '@/components/TheSettings.vue'
import { createPinia } from 'pinia'
import { setupI18n } from '@/i18n'
import { Locales } from '@/i18n/config/locales'

const setup = () => {
  return mount(TheSettings, {
    global: { plugins: [createPinia(), setupI18n()] }
  })
}

const getLanguageSelectOption = (
  languageSelect: HTMLSelectElement,
  language: Locales
): HTMLOptionElement | undefined => {
  let languageSelectOption: HTMLOptionElement | undefined
  const languageSelectOptions = languageSelect.options

  for (
    let languageSelectOptionIndex = 0;
    languageSelectOptionIndex < languageSelectOptions.length;
    languageSelectOptionIndex++
  ) {
    if (languageSelectOptions.item(languageSelectOptionIndex)?.value === language) {
      languageSelectOption = languageSelectOptions.item(languageSelectOptionIndex) ?? undefined
      break
    }
  }

  return languageSelectOption
}

describe('TheSettings', () => {
  const languageLabelSelector = 'label[for="languageSelector"]'
  const languageSelectElementSelector = 'select#languageSelector'

  it('renders the language dropdown in English', () => {
    const wrapper = setup()

    const languageElementLabel = wrapper.get(languageLabelSelector)
    expect(languageElementLabel.element.textContent).toBe('Language:')
    const languageSelectElement = wrapper.get(languageSelectElementSelector)
      .element as HTMLSelectElement
    expect(languageSelectElement.selectedOptions[0].textContent).toBe('English')
    const italianLanguageOption = getLanguageSelectOption(languageSelectElement, Locales.it)
    expect(italianLanguageOption).toBeDefined()
    expect(italianLanguageOption?.textContent).toBe('Italian')
  })

  describe('changing the language to Italian', () => {
    let wrapper: VueWrapper | undefined

    it('renders the language dropdown in Italian', async () => {
      wrapper = setup()
      const languageElement = wrapper.get(languageSelectElementSelector)

      await languageElement.setValue(Locales.it)

      const languageLabel = wrapper.get(languageLabelSelector)
      expect(languageLabel.element.textContent).toBe('Lingua:')
      const languageSelectElement = languageElement.element as HTMLSelectElement
      expect(languageSelectElement.selectedOptions[0].textContent).toBe('Italiano')
      const englishLanguageOption = getLanguageSelectOption(languageSelectElement, Locales.enGb)
      expect(englishLanguageOption).toBeDefined()
      expect(englishLanguageOption?.textContent).toBe('Inglese')
    })

    it('sets the html lang to Italian', async () => {
      wrapper = setup()
      const languageElement = wrapper.get(languageSelectElementSelector)

      await languageElement.setValue(Locales.it)

      const htmlElement = document.querySelector('html')
      expect(htmlElement).not.toBeNull()
      const htmlLangAttribute = htmlElement?.getAttribute('lang')
      expect(htmlLangAttribute).toBe(Locales.it)
    })

    afterEach(async () => {
      if (!wrapper) {
        return
      }

      // Switch back to English language, if the language was changed
      const languageElement = wrapper.get(languageSelectElementSelector)
      if (languageElement.element.value !== Locales.enGb) {
        await languageElement.setValue(Locales.enGb)
      }
    })
  })
})
