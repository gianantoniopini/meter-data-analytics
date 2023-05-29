<script setup lang="ts">
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { useI18n } from 'vue-i18n'
import { Locales } from '@/i18n/config/locales'
import { setHtmlLang } from '@/i18n'
import BaseLayout from './BaseLayout.vue'
import BaseSidebar from './BaseSidebar.vue'

const store = useLanguageStore()
const { locale, t } = useI18n()

const selectedLanguageModel = computed({
  get() {
    return store.selectedLanguage
  },
  set(value: Locales) {
    locale.value = value as string
    store.selectedLanguage = value
    setHtmlLang(value)
  }
})

const onSubmit = () => {
  // Do nothing
}
</script>

<template>
  <BaseLayout>
    <template #sidebar>
      <BaseSidebar
        :menu-items="[
          {
            href: '#language',
            title: t('settings.language.label'),
            biClass: 'bi-translate'
          },
          {
            href: '#import',
            title: t('settings.import.title'),
            biClass: 'bi-plus'
          }
        ]"
      />
    </template>

    <template #default>
      <div class="row">
        <div class="col-12">
          <h4>{{ t('settings.title') }}</h4>
          <hr />
        </div>
        <div id="language" class="col-12">
          <form class="row form" @submit.prevent="onSubmit">
            <div class="form-group col-12 col-md-4">
              <label for="languageSelector" class="form-label"
                >{{ t('settings.language.label') }}:</label
              >
              <select
                id="languageSelector"
                v-model="selectedLanguageModel"
                class="form-select"
                :placeholder="t('settings.language.placeholder')"
              >
                <option v-for="language in Locales" :key="language" :value="language">
                  {{ t(`settings.language.options.${language}`) }}
                </option>
              </select>
            </div>
          </form>
          <hr />
        </div>
        <div id="import" class="col-12">
          <h5>{{ t('settings.import.title') }}</h5>
          <div>TODO</div>
        </div>
      </div>
    </template>
  </BaseLayout>
</template>
