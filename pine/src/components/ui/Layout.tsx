import React from 'react';
import { View, ScrollView, Text, ViewStyle } from 'react-native';
import { 
  Layout as LayoutTokens, 
  Spacing, 
  SemanticColors 
} from '../../styles/designSystem';

// Container Component
export interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  padding?: keyof typeof Spacing | number;
  centered?: boolean;
  style?: ViewStyle;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = LayoutTokens.containerMaxWidth,
  padding = 'lg',
  centered = true,
  style,
}) => {
  const getContainerStyle = (): ViewStyle => {
    const paddingValue = typeof padding === 'number' ? padding : Spacing[padding];
    
    return {
      width: '100%',
      maxWidth,
      paddingHorizontal: paddingValue,
      alignSelf: centered ? 'center' : 'flex-start',
      ...style,
    };
  };

  return (
    <View style={getContainerStyle()}>
      {children}
    </View>
  );
};

// Stack Component (for consistent vertical/horizontal spacing)
export interface StackProps {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  spacing?: keyof typeof Spacing | number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
  style?: ViewStyle;
}

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'vertical',
  spacing = 'md',
  align = 'stretch',
  justify = 'flex-start',
  wrap = false,
  style,
}) => {
  const spacingValue = typeof spacing === 'number' ? spacing : Spacing[spacing];
  
  const getStackStyle = (): ViewStyle => {
    const isHorizontal = direction === 'horizontal';
    
    return {
      flexDirection: isHorizontal ? 'row' : 'column',
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      ...style,
    };
  };

  // Add spacing between children
  const childrenWithSpacing = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;
    
    const isLast = index === React.Children.count(children) - 1;
    if (isLast) return child;
    
    const spacingStyle: ViewStyle = direction === 'horizontal' 
      ? { marginRight: spacingValue }
      : { marginBottom: spacingValue };
    
    const existingStyle = (child.props as any)?.style;
    const combinedStyle = existingStyle
      ? [existingStyle, spacingStyle] 
      : spacingStyle;
    
    return React.cloneElement(child as any, {
      style: combinedStyle
    });
  });

  return (
    <View style={getStackStyle()}>
      {childrenWithSpacing}
    </View>
  );
};

// Grid Component (for responsive layouts)
export interface GridProps {
  children: React.ReactNode;
  columns?: number;
  spacing?: keyof typeof Spacing | number;
  style?: ViewStyle;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 2,
  spacing = 'md',
  style,
}) => {
  const spacingValue = typeof spacing === 'number' ? spacing : Spacing[spacing];
  
  const getGridStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -spacingValue / 2,
      ...style,
    };
  };

  const getItemStyle = (): ViewStyle => {
    return {
      width: `${100 / columns}%`,
      paddingHorizontal: spacingValue / 2,
      marginBottom: spacingValue,
    };
  };

  const gridItems = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;
    
    return (
      <View key={index} style={getItemStyle()}>
        {child}
      </View>
    );
  });

  return (
    <View style={getGridStyle()}>
      {gridItems}
    </View>
  );
};

// Section Component (for page sections with consistent spacing)
export interface SectionProps {
  children: React.ReactNode;
  title?: string;
  spacing?: keyof typeof Spacing | number;
  style?: ViewStyle;
}

export const Section: React.FC<SectionProps> = ({
  children,
  title,
  spacing = '4xl',
  style,
}) => {
  const spacingValue = typeof spacing === 'number' ? spacing : Spacing[spacing];
  
  const getSectionStyle = (): ViewStyle => {
    return {
      marginBottom: spacingValue,
      ...style,
    };
  };

  return (
    <View style={getSectionStyle()}>
      {title && (
        <View style={{ marginBottom: Spacing.lg }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '700',
            color: SemanticColors.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}>
            {title}
          </Text>
        </View>
      )}
      {children}
    </View>
  );
};

// Divider Component
export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: keyof typeof Spacing | number;
  color?: string;
  thickness?: number;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  spacing = 'md',
  color = SemanticColors.border.primary,
  thickness = 1,
  style,
}) => {
  const spacingValue = typeof spacing === 'number' ? spacing : Spacing[spacing];
  
  const getDividerStyle = (): ViewStyle => {
    const isHorizontal = orientation === 'horizontal';
    
    return {
      backgroundColor: color,
      marginVertical: isHorizontal ? spacingValue : 0,
      marginHorizontal: isHorizontal ? 0 : spacingValue,
      height: isHorizontal ? thickness : '100%',
      width: isHorizontal ? '100%' : thickness,
      ...style,
    };
  };

  return <View style={getDividerStyle()} />;
};

// SafeAreaContainer (for consistent safe area handling)
export interface SafeAreaContainerProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: ViewStyle;
}

export const SafeAreaContainer: React.FC<SafeAreaContainerProps> = ({
  children,
  edges = ['top', 'bottom'],
  style,
}) => {
  // Note: In a real implementation, you'd use react-native-safe-area-context
  // For now, we'll just provide the structure
  
  return (
    <View style={[{ flex: 1 }, style]}>
      {children}
    </View>
  );
};