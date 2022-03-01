<template>
  <BaseLayout>
    <template #sidebar>
      <BaseSidebar
        :menu-items="[
          {
            href: '#language',
            title: $t('settings.language.label'),
            biClass: 'bi-translate'
          },
          {
            href: '#import',
            title: 'Import',
            biClass: 'bi-plus'
          }
        ]"
      />
    </template>

    <template #default>
      <div class="row">
        <div class="col-12">
          <h4>Settings</h4>
          <hr />
        </div>
        <div id="language" class="col-12">
          <form class="row form" @submit.prevent="onSubmit">
            <div class="form-group col-12 col-md-4">
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
          <hr />
        </div>
        <div id="import" class="col-12">
          <h5>Import</h5>
          <div>TODO</div>
        </div>
      </div>
    </template>
  </BaseLayout>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { Locales } from '@/i18n/config/locales';
import { setHtmlLang } from '@/i18n';
import BaseLayout from './BaseLayout.vue';
import BaseSidebar from './BaseSidebar.vue';

export default defineComponent({
  name: 'TheSettings',

  components: { BaseLayout, BaseSidebar },

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
