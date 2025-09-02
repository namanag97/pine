# 🎨 Pine App - Component Interface Specifications

## Overview

This document defines standardized component interfaces for Pine's React Native application, ensuring consistency, type safety, and developer experience across all UI components.

## 🏗️ Component Hierarchy Architecture

```
Component Architecture
├── Foundation Layer
│   ├── Design Tokens (colors, typography, spacing)
│   ├── Theme Provider
│   └── Accessibility Utilities
├── Primitive Components
│   ├── Typography (Display, Heading, Body, Caption)
│   ├── Layout (Container, Stack, Grid, Spacer)
│   ├── Form (Input, Button, Checkbox, Radio)
│   └── Feedback (Badge, Toast, Alert, Loading)
├── Composite Components  
│   ├── Cards (StatCard, ActivityCard, TimeSlotCard)
│   ├── Lists (VirtualizedList, SearchableList)
│   ├── Modals (BottomSheet, Dialog, ActionSheet)
│   └── Navigation (TabBar, Header, Drawer)
├── Domain Components
│   ├── Activity (ActivityBadge, ActivitySelector, ActivityForm)
│   ├── TimeSlot (TimelineView, SlotEditor, SlotSummary)
│   ├── Analytics (ProjectionHeader, StatsGrid, ChartView)
│   └── Settings (NotificationSettings, ExportOptions)
└── Screen Components
    ├── Dashboard (Main landing screen)
    ├── ActivitySelection (Activity picker modal)
    ├── Stats (Analytics and reporting)
    └── Settings (Configuration screen)
```

## 📋 Base Interface Standards

### Universal Component Props

```typescript
// Base interface that all components extend
interface BaseComponentProps {
  /** Unique identifier for testing and debugging */
  testID?: string;
  
  /** Custom styling override */
  style?: ViewStyle | TextStyle;
  
  /** CSS class name for web compatibility */
  className?: string;
  
  /** Accessibility configuration */
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  
  /** Child components */
  children?: React.ReactNode;
}

// Interactive components (buttons, touchables)
interface InteractiveComponentProps extends BaseComponentProps {
  /** Disabled state */
  disabled?: boolean;
  
  /** Loading/processing state */
  loading?: boolean;
  
  /** Press handlers */
  onPress?: () => void;
  onLongPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  
  /** Haptic feedback configuration */
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'none';
  
  /** Analytics tracking */
  trackingProps?: {
    category: string;
    action: string;
    label?: string;
  };
}

// Data display components (lists, cards)
interface DataComponentProps<T = any> extends BaseComponentProps {
  /** Primary data */
  data?: T;
  
  /** Loading state */
  loading?: boolean;
  
  /** Error state */
  error?: AppError | string;
  
  /** Empty state configuration */
  emptyState?: {
    title: string;
    description?: string;
    icon?: IconName;
    action?: {
      label: string;
      onPress: () => void;
    };
  };
  
  /** Retry functionality */
  onRetry?: () => void;
  
  /** Refresh functionality */
  onRefresh?: () => void;
  refreshing?: boolean;
}

// Form components (inputs, selectors)
interface FormComponentProps<T = any> extends BaseComponentProps {
  /** Input value */
  value: T;
  
  /** Change handler */
  onChangeText?: (value: T) => void;
  onChange?: (value: T) => void;
  
  /** Label and help text */
  label?: string;
  placeholder?: string;
  helperText?: string;
  
  /** Validation state */
  error?: string;
  valid?: boolean;
  
  /** Input state */
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  
  /** Auto-focus and keyboard handling */
  autoFocus?: boolean;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
}
```

## 🎨 Typography Component Interfaces

### Text Components

```typescript
// Typography variant system
type TypographyVariant = 
  | 'displayLarge'    // 36px - Hero sections
  | 'displayMedium'   // 32px - Page titles  
  | 'heading1'        // 28px - Major sections
  | 'heading2'        // 24px - Subsections
  | 'heading3'        // 20px - Component headers
  | 'bodyLarge'       // 18px - Emphasized body text
  | 'bodyRegular'     // 16px - Default body text
  | 'bodySmall'       // 14px - Secondary text
  | 'caption'         // 12px - Metadata, helpers
  | 'overline'        // 10px - Category labels
  | 'numericalLarge'  // 32px monospace - Large numbers
  | 'numericalMedium' // 24px monospace - Medium numbers  
  | 'numericalSmall'; // 16px monospace - Small numbers

interface TypographyProps extends BaseComponentProps {
  /** Typography variant */
  variant: TypographyVariant;
  
  /** Text color from semantic color system */
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'warning' | 'success' | 'inverse';
  
  /** Text alignment */
  align?: 'left' | 'center' | 'right' | 'justify';
  
  /** Text transformation */
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  
  /** Weight override */
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  
  /** Line height override */
  lineHeight?: number;
  
  /** Letter spacing override */
  letterSpacing?: number;
  
  /** Text decoration */
  decoration?: 'none' | 'underline' | 'line-through';
  
  /** Maximum number of lines */
  numberOfLines?: number;
  
  /** Text selection */
  selectable?: boolean;
}

// Specialized text components
interface DisplayProps extends Omit<TypographyProps, 'variant'> {
  /** Display size */
  size?: 'large' | 'medium' | 'small';
}

interface HeadingProps extends Omit<TypographyProps, 'variant'> {
  /** Heading level (1-6) */
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

interface BodyTextProps extends Omit<TypographyProps, 'variant'> {
  /** Body text size */
  size?: 'large' | 'regular' | 'small';
  
  /** Emphasized text */
  emphasis?: boolean;
}

interface CurrencyTextProps extends Omit<TypographyProps, 'variant' | 'children'> {
  /** Currency value */
  value: number;
  
  /** Currency symbol */
  currency?: string;
  
  /** Show sign for positive/negative values */
  showSign?: boolean;
  
  /** Number formatting locale */
  locale?: string;
  
  /** Color based on positive/negative value */
  colorByValue?: boolean;
}
```

## 🏗️ Layout Component Interfaces

### Layout Primitives

```typescript
// Container component for consistent max-width and padding
interface ContainerProps extends BaseComponentProps {
  /** Maximum width */
  maxWidth?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /** Padding size */
  padding?: SpacingSize | 'none';
  
  /** Horizontal alignment */
  align?: 'left' | 'center' | 'right';
  
  /** Background color */
  backgroundColor?: SemanticColor;
  
  /** Safe area handling */
  safeArea?: boolean | 'top' | 'bottom' | 'horizontal' | 'vertical';
}

// Stack component for vertical/horizontal layouts
interface StackProps extends BaseComponentProps {
  /** Stack direction */
  direction?: 'vertical' | 'horizontal';
  
  /** Spacing between children */
  spacing?: SpacingSize;
  
  /** Alignment of children */
  align?: 'start' | 'center' | 'end' | 'stretch';
  
  /** Distribution of children */
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  
  /** Wrap children to new lines */
  wrap?: boolean;
  
  /** Divider between children */
  divider?: boolean | React.ReactElement;
}

// Grid component for responsive layouts  
interface GridProps extends BaseComponentProps {
  /** Number of columns */
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  
  /** Spacing between grid items */
  spacing?: SpacingSize;
  
  /** Alignment of grid items */
  align?: 'start' | 'center' | 'end' | 'stretch';
  
  /** Auto-fit columns */
  autoFit?: boolean;
  
  /** Minimum column width for auto-fit */
  minColumnWidth?: number;
}

// Spacer component for flexible spacing
interface SpacerProps extends BaseComponentProps {
  /** Size of spacer */
  size?: SpacingSize | number;
  
  /** Direction of spacer */
  direction?: 'horizontal' | 'vertical' | 'both';
  
  /** Flexible spacer (takes remaining space) */
  flex?: boolean;
}

// Safe area container
interface SafeAreaContainerProps extends BaseComponentProps {
  /** Which edges to apply safe area */
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  
  /** Background color */
  backgroundColor?: SemanticColor;
  
  /** Padding inside safe area */
  padding?: SpacingSize;
}
```

## 🎛️ Form Component Interfaces

### Input Components

```typescript
// Text input component
interface InputProps extends FormComponentProps<string> {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'numeric' | 'phone' | 'url';
  
  /** Input size */
  size?: 'small' | 'medium' | 'large';
  
  /** Input variant */
  variant?: 'outlined' | 'filled' | 'underlined';
  
  /** Prefix/suffix elements */
  prefix?: React.ReactElement | string;
  suffix?: React.ReactElement | string;
  
  /** Character limits */
  minLength?: number;
  maxLength?: number;
  
  /** Show character counter */
  showCounter?: boolean;
  
  /** Multi-line input */
  multiline?: boolean;
  numberOfLines?: number;
  
  /** Auto-complete configuration */
  autoComplete?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  
  /** Clear button */
  clearable?: boolean;
  onClear?: () => void;
  
  /** Validation */
  validators?: Array<(value: string) => string | undefined>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// Search input with enhanced functionality
interface SearchInputProps extends Omit<InputProps, 'type'> {
  /** Search suggestions */
  suggestions?: string[];
  
  /** Search results */
  results?: SearchResult[];
  
  /** Search handlers */
  onSearch?: (query: string) => void;
  onSuggestionPress?: (suggestion: string) => void;
  onResultPress?: (result: SearchResult) => void;
  
  /** Debounce delay for search */
  debounceMs?: number;
  
  /** Show recent searches */
  showRecentSearches?: boolean;
  recentSearches?: string[];
  
  /** Search configuration */
  minSearchLength?: number;
  maxSuggestions?: number;
  
  /** Loading state for async search */
  searching?: boolean;
}

// Select/Picker component
interface SelectProps<T = any> extends FormComponentProps<T> {
  /** Options to choose from */
  options: SelectOption<T>[];
  
  /** Multiple selection */
  multiple?: boolean;
  
  /** Select variant */
  variant?: 'dropdown' | 'modal' | 'actionSheet';
  
  /** Search within options */
  searchable?: boolean;
  searchPlaceholder?: string;
  
  /** Option rendering */
  renderOption?: (option: SelectOption<T>) => React.ReactElement;
  renderValue?: (value: T) => React.ReactElement;
  
  /** Custom option filtering */
  filterOptions?: (options: SelectOption<T>[], query: string) => SelectOption<T>[];
  
  /** Loading state */
  loading?: boolean;
  
  /** Max height for dropdown */
  maxHeight?: number;
}

interface SelectOption<T = any> {
  label: string;
  value: T;
  description?: string;
  icon?: IconName;
  disabled?: boolean;
  group?: string;
}
```

### Button Components

```typescript
// Button component with comprehensive variants
interface ButtonProps extends InteractiveComponentProps {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  
  /** Button width */
  width?: 'auto' | 'full' | number;
  
  /** Icon configuration */
  icon?: IconName;
  iconPosition?: 'left' | 'right' | 'only';
  iconSize?: number;
  
  /** Loading state */
  loading?: boolean;
  loadingText?: string;
  
  /** Badge/counter on button */
  badge?: number | string;
  badgeColor?: SemanticColor;
  
  /** Button shape */
  shape?: 'rectangle' | 'rounded' | 'pill' | 'circle';
  
  /** Elevation/shadow */
  elevation?: 'none' | 'small' | 'medium' | 'large';
}

// Floating Action Button
interface FABProps extends Omit<ButtonProps, 'variant' | 'width'> {
  /** FAB position */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  
  /** Extended FAB with label */
  extended?: boolean;
  label?: string;
  
  /** Mini FAB */
  mini?: boolean;
}

// Icon Button
interface IconButtonProps extends InteractiveComponentProps {
  /** Icon name */
  icon: IconName;
  
  /** Icon size */
  size?: 'small' | 'medium' | 'large' | number;
  
  /** Button variant */
  variant?: 'solid' | 'outline' | 'ghost';
  
  /** Button shape */
  shape?: 'rectangle' | 'rounded' | 'circle';
  
  /** Icon color */
  iconColor?: SemanticColor;
  
  /** Background color */
  backgroundColor?: SemanticColor;
}
```

## 📊 Data Display Component Interfaces

### Card Components

```typescript
// Base card component
interface CardProps extends BaseComponentProps {
  /** Card variant */
  variant?: 'elevated' | 'outlined' | 'filled';
  
  /** Padding inside card */
  padding?: SpacingSize | 'none';
  
  /** Card background color */
  backgroundColor?: SemanticColor;
  
  /** Border radius */
  borderRadius?: SpacingSize;
  
  /** Shadow/elevation */
  elevation?: 'none' | 'small' | 'medium' | 'large';
  
  /** Interactive card */
  pressable?: boolean;
  onPress?: () => void;
  
  /** Card header */
  header?: React.ReactElement | {
    title: string;
    subtitle?: string;
    icon?: IconName;
    action?: React.ReactElement;
  };
  
  /** Card footer */
  footer?: React.ReactElement;
}

// Stat card for displaying metrics
interface StatCardProps extends BaseComponentProps {
  /** Stat title */
  title: string;
  
  /** Stat value */
  value: string | number;
  
  /** Previous value for change calculation */
  previousValue?: string | number;
  
  /** Value prefix/suffix */
  prefix?: string;
  suffix?: string;
  
  /** Stat description */
  description?: string;
  
  /** Icon */
  icon?: IconName;
  iconColor?: SemanticColor;
  
  /** Trend indicator */
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string | number;
  
  /** Loading state */
  loading?: boolean;
  
  /** Click handler */
  onPress?: () => void;
  
  /** Card styling */
  variant?: 'default' | 'compact' | 'highlighted';
}

// Activity card for time slot display
interface ActivityCardProps extends BaseComponentProps {
  /** Activity data */
  activity: Activity;
  
  /** Time slot data */
  timeSlot: TimeSlot;
  
  /** Card variant */
  variant?: 'timeline' | 'card' | 'compact';
  
  /** Show time information */
  showTime?: boolean;
  
  /** Show value information */
  showValue?: boolean;
  
  /** Edit mode */
  editable?: boolean;
  onEdit?: (timeSlot: TimeSlot) => void;
  onDelete?: (timeSlot: TimeSlot) => void;
  
  /** Selection state */
  selected?: boolean;
  onSelect?: (timeSlot: TimeSlot) => void;
  
  /** Drag and drop */
  draggable?: boolean;
  onDragStart?: (timeSlot: TimeSlot) => void;
  onDragEnd?: (timeSlot: TimeSlot) => void;
}
```

### List Components

```typescript
// Virtualized list for performance
interface VirtualizedListProps<T> extends DataComponentProps<T[]> {
  /** Render item function */
  renderItem: (item: T, index: number) => React.ReactElement;
  
  /** Key extractor */
  keyExtractor?: (item: T, index: number) => string;
  
  /** Item height calculation */
  getItemHeight?: (item: T, index: number) => number;
  itemHeight?: number; // Fixed height for all items
  
  /** Header/Footer components */
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  
  /** Separator component */
  ItemSeparatorComponent?: React.ReactElement;
  
  /** Scroll configuration */
  horizontal?: boolean;
  numColumns?: number;
  
  /** Performance optimization */
  removeClippedSubviews?: boolean;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  
  /** Pull to refresh */
  refreshControl?: React.ReactElement;
  
  /** Load more functionality */
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  
  /** Scroll handlers */
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollBeginDrag?: () => void;
  onScrollEndDrag?: () => void;
}

// Searchable list with filtering
interface SearchableListProps<T> extends VirtualizedListProps<T> {
  /** Search configuration */
  searchable?: boolean;
  searchPlaceholder?: string;
  
  /** Search function */
  onSearch?: (query: string) => void;
  searchResults?: T[];
  
  /** Filter functions */
  filters?: ListFilter[];
  activeFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  
  /** Sort options */
  sortOptions?: SortOption[];
  activeSortOption?: string;
  onSortChange?: (sortOption: string) => void;
  
  /** Search debounce */
  searchDebounce?: number;
}

interface ListFilter {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'date';
  options?: FilterOption[];
}

interface SortOption {
  id: string;
  label: string;
  direction: 'asc' | 'desc';
}
```

## 🎯 Domain-Specific Component Interfaces

### Activity Components

```typescript
// Activity badge with value-based styling
interface ActivityBadgeProps extends BaseComponentProps {
  /** Activity data */
  activity: Activity;
  
  /** Badge size */
  size?: 'small' | 'medium' | 'large';
  
  /** Show icon based on activity value */
  showIcon?: boolean;
  
  /** Show value text */
  showValue?: boolean;
  
  /** Badge variant */
  variant?: 'filled' | 'outlined' | 'minimal';
  
  /** Interactive badge */
  onPress?: (activity: Activity) => void;
  
  /** Badge position relative to parent */
  position?: 'inline' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// Activity selector component
interface ActivitySelectorProps extends BaseComponentProps {
  /** Available activities */
  activities: Activity[];
  
  /** Selected activity */
  selectedActivity?: Activity;
  
  /** Selection handler */
  onSelect: (activity: Activity) => void;
  
  /** Search functionality */
  searchable?: boolean;
  searchPlaceholder?: string;
  
  /** Category filtering */
  showCategories?: boolean;
  categoryFilter?: string;
  onCategoryChange?: (category: string) => void;
  
  /** Recent activities */
  showRecent?: boolean;
  recentActivities?: Activity[];
  
  /** Favorites */
  showFavorites?: boolean;
  favoriteActivities?: Activity[];
  onToggleFavorite?: (activity: Activity) => void;
  
  /** Display options */
  displayMode?: 'grid' | 'list';
  showValues?: boolean;
  
  /** Loading states */
  loading?: boolean;
  loadingCategories?: boolean;
}

// Activity value indicator
interface ActivityValueIndicatorProps extends BaseComponentProps {
  /** Activity value */
  value: number;
  
  /** Display format */
  format?: 'currency' | 'abbreviated' | 'full';
  
  /** Show trend indicator */
  showTrend?: boolean;
  previousValue?: number;
  
  /** Color scheme */
  colorScheme?: 'value-based' | 'neutral' | 'custom';
  customColor?: string;
  
  /** Size */
  size?: 'small' | 'medium' | 'large';
  
  /** Animation */
  animated?: boolean;
  animationDuration?: number;
}
```

### Time Slot Components

```typescript
// Timeline view component
interface TimelineViewProps extends BaseComponentProps {
  /** Time slots data */
  timeSlots: TimeSlot[];
  
  /** Date range */
  startDate: Date;
  endDate?: Date;
  
  /** Timeline configuration */
  timeInterval?: number; // minutes
  showTimeLabels?: boolean;
  showCurrentTime?: boolean;
  
  /** Interaction handlers */
  onSlotPress?: (timeSlot: TimeSlot) => void;
  onSlotLongPress?: (timeSlot: TimeSlot) => void;
  onEmptySlotPress?: (startTime: Date, endTime: Date) => void;
  
  /** Editing capabilities */
  editable?: boolean;
  onSlotEdit?: (timeSlot: TimeSlot) => void;
  onSlotDelete?: (timeSlot: TimeSlot) => void;
  onSlotDuplicate?: (timeSlot: TimeSlot) => void;
  
  /** Display options */
  compactMode?: boolean;
  showValues?: boolean;
  showActivities?: boolean;
  
  /** Scroll configuration */
  scrollToCurrentTime?: boolean;
  scrollToTime?: Date;
  
  /** Selection */
  selectable?: boolean;
  selectedSlots?: string[];
  onSelectionChange?: (selectedSlots: string[]) => void;
  
  /** Loading state */
  loading?: boolean;
  
  /** Custom renderers */
  renderTimeSlot?: (timeSlot: TimeSlot) => React.ReactElement;
  renderEmptySlot?: (startTime: Date, endTime: Date) => React.ReactElement;
  renderTimeLabel?: (time: Date) => React.ReactElement;
}

// Time slot editor modal
interface TimeSlotEditorProps extends BaseComponentProps {
  /** Time slot to edit (null for new slot) */
  timeSlot?: TimeSlot | null;
  
  /** Available activities */
  activities: Activity[];
  
  /** Time range constraints */
  minTime?: Date;
  maxTime?: Date;
  allowedDuration?: number[]; // in minutes
  
  /** Editor configuration */
  allowActivityChange?: boolean;
  allowTimeChange?: boolean;
  allowDurationChange?: boolean;
  
  /** Handlers */
  onSave: (timeSlot: TimeSlot) => void;
  onCancel: () => void;
  onDelete?: (timeSlot: TimeSlot) => void;
  
  /** Validation */
  validate?: (timeSlot: TimeSlot) => string | undefined;
  
  /** Loading state */
  saving?: boolean;
  
  /** Modal configuration */
  visible: boolean;
  animationType?: 'slide' | 'fade' | 'none';
}
```

### Analytics Components

```typescript
// Income projection header
interface ProjectionHeaderProps extends BaseComponentProps {
  /** Current period data */
  currentValue: number;
  
  /** Projection data */
  dailyProjection?: number;
  monthlyProjection?: number;
  annualProjection?: number;
  
  /** Period selection */
  selectedPeriod: 'daily' | 'monthly' | 'annual';
  onPeriodChange?: (period: 'daily' | 'monthly' | 'annual') => void;
  
  /** Trend data */
  trendData?: {
    value: number;
    percentage: number;
    direction: 'up' | 'down' | 'neutral';
    period: string;
  };
  
  /** Display options */
  showTrend?: boolean;
  showComparison?: boolean;
  animated?: boolean;
  
  /** Customization */
  backgroundColor?: SemanticColor;
  textColor?: SemanticColor;
  
  /** Loading state */
  loading?: boolean;
}

// Statistics grid
interface StatsGridProps extends BaseComponentProps {
  /** Stats data */
  stats: StatItem[];
  
  /** Grid configuration */
  columns?: number | 'auto';
  spacing?: SpacingSize;
  
  /** Card styling */
  cardVariant?: 'elevated' | 'outlined' | 'minimal';
  
  /** Interactive stats */
  onStatPress?: (stat: StatItem) => void;
  
  /** Loading state */
  loading?: boolean;
  
  /** Empty state */
  emptyMessage?: string;
  
  /** Refresh functionality */
  refreshable?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

interface StatItem {
  id: string;
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: IconName;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  color?: SemanticColor;
  format?: 'currency' | 'number' | 'percentage' | 'time';
}
```

## 🔧 Modal & Overlay Interfaces

### Modal Components

```typescript
// Base modal component
interface ModalProps extends BaseComponentProps {
  /** Modal visibility */
  visible: boolean;
  
  /** Close handler */
  onClose: () => void;
  
  /** Modal variant */
  variant?: 'fullscreen' | 'centered' | 'bottom-sheet' | 'side-sheet';
  
  /** Animation configuration */
  animationType?: 'slide' | 'fade' | 'none';
  animationDuration?: number;
  
  /** Backdrop configuration */
  backdropOpacity?: number;
  backdropColor?: string;
  closeOnBackdropPress?: boolean;
  
  /** Keyboard handling */
  avoidKeyboard?: boolean;
  keyboardDismissMode?: 'none' | 'on-drag' | 'interactive';
  
  /** Safe area */
  safeArea?: boolean | Array<'top' | 'bottom' | 'left' | 'right'>;
  
  /** Modal size */
  size?: 'auto' | 'small' | 'medium' | 'large' | 'fullscreen';
  maxHeight?: number | string;
  maxWidth?: number | string;
  
  /** Header configuration */
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactElement[];
  
  /** Footer configuration */
  showFooter?: boolean;
  footerActions?: React.ReactElement[];
  
  /** Scroll behavior */
  scrollable?: boolean;
  
  /** Status bar */
  statusBarStyle?: 'light-content' | 'dark-content';
}

// Bottom sheet component
interface BottomSheetProps extends Omit<ModalProps, 'variant'> {
  /** Snap points for the sheet */
  snapPoints?: Array<number | string>;
  initialSnapPoint?: number;
  
  /** Handle configuration */
  showHandle?: boolean;
  handleColor?: string;
  
  /** Gesture configuration */
  enablePanDownToClose?: boolean;
  enableContentPanningGesture?: boolean;
  
  /** Background component */
  backgroundComponent?: React.ReactElement;
  
  /** Handle component */
  handleComponent?: React.ReactElement;
  
  /** Callbacks */
  onSnapPointChange?: (index: number) => void;
  
  /** Dynamic sizing */
  enableDynamicSizing?: boolean;
}

// Action sheet component  
interface ActionSheetProps extends BaseComponentProps {
  /** Action sheet visibility */
  visible: boolean;
  
  /** Close handler */
  onClose: () => void;
  
  /** Sheet title */
  title?: string;
  message?: string;
  
  /** Action options */
  options: ActionSheetOption[];
  
  /** Cancel option */
  cancelButtonIndex?: number;
  destructiveButtonIndex?: number;
  
  /** Styling */
  tintColor?: string;
  
  /** iPad specific */
  anchor?: { x: number; y: number };
}

interface ActionSheetOption {
  title: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  destructive?: boolean;
}
```

This component interface specification provides:

1. **🏗️ Standardized Base Interfaces** for consistent prop patterns
2. **🎨 Typography System** with comprehensive text component interfaces  
3. **📐 Layout Components** for responsive and flexible layouts
4. **📝 Form Components** with validation and accessibility
5. **🎛️ Interactive Elements** with haptic feedback and analytics
6. **📊 Data Display** components with loading and error states
7. **🎯 Domain-Specific** interfaces for Pine's unique requirements
8. **🔧 Modal System** with various presentation styles

Each interface includes comprehensive TypeScript definitions, accessibility considerations, and extensibility for future enhancements.