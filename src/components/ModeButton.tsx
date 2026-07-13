import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { Text, TouchableOpacity } from 'react-native';

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

// Status colors must stay identical in light and dark mode,
// so they are applied unconditionally — not via the themed Text component.
// Full literal class names are required: NativeWind cannot resolve dynamic
// class strings at build time.
const modeColor: Record<
  WorkMode,
  {
    borderSelected: string;
    bgSelected: string;
    textSelected: string;
    textIdle: string;
  }
> = {
  driving: {
    borderSelected: 'border-driving',
    bgSelected: 'bg-driving',
    textSelected: 'text-night',
    textIdle: 'text-driving',
  },
  other_work: {
    borderSelected: 'border-other-work',
    bgSelected: 'bg-other-work',
    textSelected: 'text-night',
    textIdle: 'text-other-work',
  },
  standby: {
    borderSelected: 'border-standby',
    bgSelected: 'bg-standby',
    textSelected: 'text-night',
    textIdle: 'text-standby',
  },
  break: {
    borderSelected: 'border-break',
    bgSelected: 'bg-break',
    textSelected: 'text-night',
    textIdle: 'text-break',
  },
  rest: {
    borderSelected: 'border-rest',
    bgSelected: 'bg-rest',
    textSelected: 'text-night',
    textIdle: 'text-rest',
  },
};

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
  const c = modeColor[mode];
  const color = selected ? c.textSelected : c.textIdle;
  const surface = selected ? `${c.bgSelected} ${c.borderSelected}` : idleSurface;
  return (
    <TouchableOpacity
      className={`h-16 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border-2 px-2 ${surface}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Icon name={modeIcon[mode]} size={20} className={color} />
      <Text className={`text-sm font-bold uppercase ${color}`}>{label}</Text>
    </TouchableOpacity>
  );
}
