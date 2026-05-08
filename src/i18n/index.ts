import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import pl from './locales/pl.json';

const languageCode = Localization.getLocales()[0]?.languageCode ?? 'en';

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
