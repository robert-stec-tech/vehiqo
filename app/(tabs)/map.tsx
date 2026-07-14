import { useTranslation } from 'react-i18next';

import { ScreenContainer, Text } from '@/components';

export default function MapScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer className="items-center justify-center">
      <Text variant="heading">{t('tabs.map')}</Text>
    </ScreenContainer>
  );
}
