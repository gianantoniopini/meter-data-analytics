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
import { LayoutLanguages } from '@/i18n/config/locales';

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
        set(value: string) {
          locale.value = value;
          store.dispatch('selectNewDefaultLanguage', value);

          const htmlElement = document.querySelector('html');
          if (htmlElement) {
            htmlElement.setAttribute('lang', value);
          }
        }
      }),
      LayoutLanguages
    };
  }
});
</script>
