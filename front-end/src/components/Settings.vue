<template>
  <select v-model="selectedLanguageModel" placeholder="Please Select">
    <option
      v-for="item in LayoutLanguages"
      :key="item.param"
      :value="item.param"
    >
      {{ item.title }}
    </option>
  </select>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { LayoutLanguages, Locales } from '@/i18n/config/locales';
import { setHtmlLang } from '@/i18n';

export default defineComponent({
  name: 'Settings',

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
      LayoutLanguages
    };
  }
});
</script>
