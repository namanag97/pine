import React, { useMemo, memo } from 'react';
import { Text, TextStyle } from 'react-native';
import { Typography as TypographySystem, SemanticColors } from '../../styles/designSystem';

export type TypographyVariant = 
  | 'display' 
  | 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'heading5' | 'heading6'
  | 'bodyLarge' | 'bodyRegular' | 'bodySmall'
  | 'caption' | 'label' | 'button'
  | 'numerical' | 'numericalLarge';

export type TextColor = 
  | 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse'
  | 'link' | 'error' | 'success' | 'warning';

export interface TypographyProps {
  children: React.ReactNode;
  variant?: TypographyVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: TextStyle;
  onPress?: () => void;
  testID?: string;
}

export const AppText: React.FC<TypographyProps> = memo(({
  children,
  variant = 'bodyRegular',
  color = 'primary',
  align = 'left',
  numberOfLines,
  style,
  onPress,
  testID,
}) => {
  const textStyle = useMemo((): TextStyle => {
    const baseStyle = TypographySystem[variant];
    
    let colorStyle: TextStyle = {};
    switch (color) {
      case 'primary':
        colorStyle = { color: SemanticColors.text.primary };
        break;
      case 'secondary':
        colorStyle = { color: SemanticColors.text.secondary };
        break;
      case 'tertiary':
        colorStyle = { color: SemanticColors.text.tertiary };
        break;
      case 'disabled':
        colorStyle = { color: SemanticColors.text.disabled };
        break;
      case 'inverse':
        colorStyle = { color: SemanticColors.text.inverse };
        break;
      case 'link':
        colorStyle = { color: SemanticColors.text.link };
        break;
      case 'error':
        colorStyle = { color: SemanticColors.text.error };
        break;
      case 'success':
        colorStyle = { color: SemanticColors.text.success };
        break;
      case 'warning':
        colorStyle = { color: SemanticColors.text.warning };
        break;
    }

    const alignmentStyle: TextStyle = { textAlign: align };

    return {
      ...baseStyle,
      ...colorStyle,
      ...alignmentStyle,
      ...style,
    };
  }, [variant, color, align, style]);

  return (
    <Text
      style={textStyle}
      numberOfLines={numberOfLines}
      onPress={onPress}
      testID={testID}
    >
      {children}
    </Text>
  );
});

// Semantic Typography Components
export const Display: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <AppText variant="display" {...props} />
);

export const Heading1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <AppText variant="heading1" {...props} />
);

export const Heading2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <AppText variant="heading2" {...props} />
);

export const Heading3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <AppText variant="heading3" {...props} />
);

export const Heading4: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <AppText variant="heading4" {...props} />
);

export const Heading5: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <AppText variant="heading5" {...props} />
);

export const Heading6: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <AppText variant="heading6" {...props} />
);

export const BodyLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <AppText variant="bodyLarge" {...props} />
);

export const Body: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <AppText variant="bodyRegular" {...props} />
);

export const BodySmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <AppText variant="bodySmall" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <AppText variant="caption" {...props} />
);

export const Label: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <AppText variant="label" {...props} />
);

export const ButtonText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <AppText variant="button" {...props} />
);

export const Numerical: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <AppText variant="numerical" {...props} />
);

export const NumericalLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <AppText variant="numericalLarge" {...props} />
);

// Specialized Components
export interface CurrencyTextProps extends Omit<TypographyProps, 'children'> {
  value: number;
  currency?: string;
  showSign?: boolean;
}

export const CurrencyText: React.FC<CurrencyTextProps> = ({
  value,
  currency = '₹',
  showSign = false,
  variant = 'numerical',
  ...props
}) => {
  const formatValue = (val: number) => {
    const absValue = Math.abs(val);
    if (absValue >= 10000000) { // 1 crore
      return `${(absValue / 10000000).toFixed(1)}Cr`;
    }
    if (absValue >= 100000) { // 1 lakh
      return `${(absValue / 100000).toFixed(1)}L`;
    }
    if (absValue >= 1000) { // 1 thousand
      return `${(absValue / 1000).toFixed(1)}K`;
    }
    return absValue.toString();
  };

  const sign = value < 0 ? '-' : (showSign && value > 0 ? '+' : '');
  const formattedValue = formatValue(value);
  
  return (
    <AppText variant={variant} {...props}>
      {`${sign}${currency}${formattedValue}`}
    </AppText>
  );
};