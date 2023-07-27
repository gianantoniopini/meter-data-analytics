import { ref } from 'vue'
import { defineStore } from 'pinia'
import { defaultLocale } from '@/i18n/config'

export const useLanguageStore = defineStore('language', () => {
  const selectedLanguage = ref(defaultLocale)

  return { selectedLanguage }
})
