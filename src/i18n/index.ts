import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import pl from './locales/pl.json';

const languageCode = Localization.getLocales()[0]?.languageCode ?? 'en';

// eslint-disable-next-line import/no-named-as-default-member -- i18n.use() is the standard i18next initialization API
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pl: { translation: pl },
  },
  lng: languageCode,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
