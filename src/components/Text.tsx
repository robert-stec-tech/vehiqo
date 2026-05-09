import { Text as RNText, TextProps } from 'react-native';

type TextVariant =
  | 'display'
  | 'heading'
  | 'label'
  | 'body'
  | 'caption'
  | 'timestamp';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  children: React.ReactNode;
}

const variantClasses: Record<TextVariant, string> = {
  display: 'text-4xl font-bold',
  heading: 'text-2xl font-bold',
  label: 'text-lg font-semibold',
  body: 'text-base',
  caption: 'text-sm text-gray-500 dark:text-gray-400',
  timestamp: 'text-xs text-gray-500 dark:text-gray-400',
};

export function Text({
  variant = 'body',
  className,
  children,
  ...props
}: AppTextProps) {
  return (
    <RNText
      className={`text-gray-900 dark:text-white ${variantClasses[variant]} ${className ?? ''}`}
      {...props}
    >
      {children}
    </RNText>
  );
}
