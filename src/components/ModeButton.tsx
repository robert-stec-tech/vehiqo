import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { Text, TouchableOpacity } from 'react-native';

import { MODE_COLORS } from '@/constants/modeColors';
import type { WorkMode } from '@/db/types';

interface ModeButtonProps {
  mode: WorkMode;
  label: string;
  selected: boolean;
  onPress: () => void;
}

// styled() lets the icon take its color from a NativeWind class, so no color is
// hardcoded outside global.css.
const Icon = styled(MaterialCommunityIcons);

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Idle buttons stay a neutral dark surface so the filled selected button stands
// out by contrast; only the icon and label carry the mode color when idle.
const idleSurface =
  'bg-gray-100 dark:bg-night-elevated border-gray-300 dark:border-night-border';

const modeIcon: Record<WorkMode, IconName> = {
  driving: 'truck-outline',
  other_work: 'wrench',
  standby: 'eye-outline',
  break: 'coffee',
  rest: 'bed',
};

export function ModeButton({
  mode,
  label,
  selected,
  onPress,
}: ModeButtonProps) {
  const colors = MODE_COLORS[mode];
  // Selected surfaces are filled with the mode color, so the label/icon switch
  // to a fixed dark text for contrast instead of the mode's own text color.
  const color = selected ? 'text-night' : colors.text;
  const surface = selected ? `${colors.bg} ${colors.border}` : idleSurface;
  return (
    <TouchableOpacity
      className={`h-16 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border-2 px-2 ${surface}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Icon name={modeIcon[mode]} size={20} className={color} />
      <Text className={`text-base font-extrabold uppercase ${color}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
