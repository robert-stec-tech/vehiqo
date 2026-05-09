import { TouchableOpacity, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
}

const variants = {
  primary: 'bg-blue-500 active:bg-blue-600',
  secondary: 'bg-gray-200 dark:bg-gray-700 active:bg-gray-300',
  danger: 'bg-red-500 active:bg-red-600',
} as const;

const textVariants = {
  primary: 'text-white',
  secondary: 'text-gray-900 dark:text-white',
  danger: 'text-white',
} as const;

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={`rounded-xl py-4 px-6 items-center justify-center min-h-[48px] ${variants[variant]} ${disabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      <Text
        className={`font-semibold text-base text-center ${textVariants[variant]}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
