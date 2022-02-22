<template>
  <div class="container-fluid">
    <div class="row border rounded p-2 mb-2" id="language">
      <div class="col-12">
        <form @submit.prevent="onSubmit" class="row form">
          <div class="form-group col-12 col-sm-4">
            <label for="languageSelector" class="form-label"
              >{{ $t('settings.language.label') }}:</label
            >
            <select
              id="languageSelector"
              v-model="selectedLanguageModel"
              class="form-select"
              placeholder="Please Select"
            >
              <option v-for="locale in Locales" :key="locale" :value="locale">
                {{ $t(`settings.language.options.${locale}`) }}
              </option>
            </select>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { Locales } from '@/i18n/config/locales';
import { setHtmlLang } from '@/i18n';

export default defineComponent({
  name: 'TheSettings',

  setup() {
    const store = useStore();
    const { locale } = useI18n();

    return {
      selectedLanguageModel: computed({
        get() {
          return store.getters.selectedLanguage;
        },
        set(value: Locales) {
          locale.value = value as string;
          store.dispatch('selectNewDefaultLanguage', value);
          setHtmlLang(value);
        }
      }),
      Locales
    };
  }
});
</script>
