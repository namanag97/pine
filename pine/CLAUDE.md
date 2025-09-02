# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pine is a React Native/Expo app that tracks activities in 30-minute time slots and calculates their value based on cost-per-hour metrics. The app helps users optimize their time by providing income projections, activity logging, and behavioral insights through a comprehensive time value assessment framework.

## Development Commands

### Core Development
- `npm start` or `expo start` - Start the Expo development server
- `npm run android` or `expo start --android` - Run on Android device/emulator  
- `npm run ios` or `expo start --ios` - Run on iOS device/simulator
- `npm run web` or `expo start --web` - Run in web browser

### Development Environment Setup
The project uses Expo Go for development testing and supports Android, iOS, and web platforms. No additional build tools required for development.

## Technical Stack

### Core Framework
- **React Native** 0.79.6 with **Expo SDK ~53.0.22**
- **TypeScript** with strict mode enabled
- **React** 19.0.0 with New Architecture enabled

### Key Dependencies
- **Navigation**: `@react-navigation/native`, `@react-navigation/native-stack` 
- **Database**: `@supabase/supabase-js` for backend services
- **Storage**: `@react-native-async-storage/async-storage` for local persistence
- **Notifications**: `expo-notifications` for activity reminders
- **Date Handling**: `date-fns` for time manipulation
- **Data Export**: `react-native-csv`, `react-native-share`
- **UI/Styling**: `expo-linear-gradient`, `react-native-safe-area-context`

## Architecture Overview

### Directory Structure
```
src/
├── components/          # Reusable UI components
├── navigation/          # Navigation configuration  
├── screens/             # Main app screens
├── services/            # Business logic and external integrations
├── types/              # TypeScript type definitions
├── styles/             # Design system and styling
└── utils/              # Utility functions
```

### Core Services Layer
- **ActivityService**: Manages activity definitions and categorization
- **TimeSlotService**: Handles 30-minute time slot calculations and management
- **NotificationService**: Manages push notifications for activity logging reminders
- **SupabaseService**: Database integration for cloud sync and persistence
- **StorageService**: Local data persistence and caching

### Data Architecture
The app uses a hybrid local/cloud storage approach:
- **Local**: AsyncStorage for offline capability and caching
- **Cloud**: Supabase PostgreSQL for sync across devices
- **Core Entity**: TimeSlot (30-minute blocks) with Activity assignments
- **Value Calculation**: Activities have hourly rates, converted to 30-minute block values

## Key Configuration Files

### Activity Value Framework
- `cost_per_hour_json.json` - Defines the 7-tier activity value system from ₹-2,000 (costly) to ₹2,000,000 (CEO-level)
- Categories: Costly (-₹2,000), Free (₹0), Low-Value (₹100), Basic (₹200), Professional (₹2,000), High-Value (₹20,000), Executive (₹200,000), CEO-Level (₹2,000,000)

### App Configuration
- `app.json` - Expo configuration with portrait orientation, New Architecture enabled
- `tsconfig.json` - Extends expo/tsconfig.base with strict mode
- No custom babel or build configuration needed

## Core Business Logic

### Time Value Assessment System
- Activities are categorized into 7 value tiers based on economic impact
- Each activity has an hourly value and calculated 30-minute block value
- Users log activities in 30-minute increments throughout the day
- Daily and monthly income projections calculated from logged activities

### Notification System
- Smart notifications every 30 minutes during configured hours
- Notifications skip if current time slot already has activity logged
- Handles notification responses to navigate directly to activity selection

### Data Flow
1. **Activity Logging**: User selects activity for time slot → Value calculated → Stored locally and synced to cloud
2. **Projections**: Daily totals → Monthly summaries → Annual projections
3. **Real-time Updates**: Activity changes trigger recalculation of all dependent totals

## Navigation Structure

Single stack navigator with modal presentations:
- **Main** (DashboardScreen) - Primary landing with metrics and quick actions
- **ActivitySelection** - Modal for selecting/searching activities for time slots
- **Settings** - App configuration and notification preferences  
- **Stats** - Historical data and analytics
- **ActivityLog** - History of logged activities

## Type System

### Core Types (`src/types/index.ts`)
- **Activity**: Individual activity with value, category, and search tags
- **TimeSlot**: 30-minute block with optional activity assignment
- **DailyLog**: Collection of time slots for a specific date with calculated totals
- **NotificationSettings**: User preferences for notification timing and behavior

### Database Integration
- **Supabase Types**: Separate interfaces for cloud storage format
- **Storage Types**: Local persistence format with device-specific fields
- **Result Types**: Type-safe error handling with success/failure patterns

## Database Schema (Supabase)

### Core Tables
- **activity_logs**: Transactional data with user_id, activity details, time slots
- **daily_summaries**: Computed daily totals with activity counts
- **activities**: Master activity definitions (populated from JSON)

### Key Constraints
- One activity per time slot per user (unique constraint)
- Row Level Security (RLS) ensures users only see their own data
- Denormalized activity names/values for historical accuracy

## Development Guidelines

### State Management
- React Context + useReducer for global app state
- Local state in components for UI-specific data
- Supabase real-time subscriptions for live data updates

### Error Handling
- Result<T, E> pattern for service layer error handling
- AppError interface for consistent error structure
- Type guards for runtime validation

### Offline Capability
- AsyncStorage for local persistence
- DataSyncService manages online/offline synchronization
- Conflict resolution for edited entries during sync

## Supabase Configuration

### Environment Setup
- Supabase URL and anon key configured in SupabaseService.ts
- Real-time subscriptions for activity_logs and daily_summaries
- Row Level Security policies restrict access to user's own data

### API Patterns
- CRUD operations through Supabase client
- Real-time subscriptions for live UI updates
- Batch operations for data export functionality

## Design System

### Overview
Pine uses a comprehensive design system located in `src/styles/designSystem.ts` with reusable UI components in `src/components/ui/`. This system ensures visual consistency, improves development speed, and maintains high code quality.

### Core Design Principles
- **Consistency**: All components use the same color, typography, and spacing tokens
- **Accessibility**: WCAG AA compliance with proper contrast ratios and semantic elements  
- **Scalability**: Token-based system that supports theming and easy updates
- **Developer Experience**: Semantic naming and TypeScript support

### Color System

#### Palette Structure
```typescript
// Primary colors with 9 shades (50-900)
Colors.primary[500]  // Main brand blue #2196F3
Colors.neutral[900]  // Text primary #212121
Colors.success[600]  // Success green #43A047
Colors.warning[600]  // Warning amber #FFB300
Colors.error[600]    // Error red #E53935
```

#### Semantic Color Usage
```typescript
// Always use semantic colors instead of raw palette values
SemanticColors.text.primary      // For main text
SemanticColors.surface.elevated  // For card backgrounds
SemanticColors.border.focus      // For focused inputs
```

#### Activity Value Colors
```typescript
// Automatic color mapping based on hourly value
getActivityValueColor(2000000)  // CEO Level (gold)
getActivityValueColor(200000)   // Executive (blue)
getActivityValueColor(20000)    // High Value (green)
getActivityValueColor(2000)     // Professional (blue)
getActivityValueColor(200)      // Basic (gray)
getActivityValueColor(0)        // Free (gray)
getActivityValueColor(-100)     // Negative (red)
```

### Typography System

#### Semantic Text Components
```typescript
// Use semantic components instead of raw styles
<Display>Large display text</Display>
<Heading1>Page titles</Heading1>
<Heading3>Section headers</Heading3>
<Body>Regular body text</Body>
<Caption>Small helper text</Caption>
<CurrencyText value={1500} />  // Formatted currency
<Numerical>123,456</Numerical>  // Monospace numbers
```

#### Typography Scale
- **Display**: 36px for hero sections and large numbers
- **Heading1-6**: 32px to 16px for hierarchical headers
- **Body**: 16px (large), 14px (regular), 12px (small)
- **Caption**: 10px for metadata and helpers
- **Numerical**: Monospace font for financial values

### Component Library

#### Core Components
```typescript
// Import from centralized location
import { Button, Card, Input, Badge, AppText } from '../components/ui';

// Button variants
<Button variant="primary" size="large" onPress={handlePress}>
  Primary Action
</Button>

// Card variants with consistent styling
<Card variant="elevated" padding="large">
  <AppText>Card content</AppText>
</Card>

// Activity-specific components
<ActivityLevelBadge value={20000} showIcon />
<CurrencyText value={1500} variant="numericalLarge" />
```

#### Layout Components
```typescript
// Consistent spacing and layout
<Container maxWidth={768} padding="lg">
  <Stack spacing="xl" direction="vertical">
    <Card>First item</Card>
    <Card>Second item</Card>
  </Stack>
</Container>

// Grid layouts
<Grid columns={2} spacing="md">
  <StatCard title="Today" value="₹5K" />
  <StatCard title="Month" value="₹150K" />
</Grid>
```

### Spacing System

#### Spacing Scale
```typescript
Spacing.xs   // 4px  - Minimal spacing
Spacing.sm   // 8px  - Small gaps
Spacing.md   // 12px - Default component spacing
Spacing.lg   // 16px - Section spacing
Spacing.xl   // 20px - Large gaps
Spacing['2xl'] // 24px - Extra large spacing
Spacing['4xl'] // 40px - Major section breaks
```

#### Layout Constants
```typescript
Layout.containerMaxWidth  // 768px - Max content width
Layout.containerPadding  // 16px - Default container padding
Layout.sectionSpacing    // 40px - Between major sections
```

### Best Practices

#### Component Creation
1. **Use Design Tokens**: Always reference design system tokens, never hardcode values
2. **Semantic Props**: Use semantic naming (`variant="primary"` not `color="#2196F3"`)
3. **TypeScript Support**: Export proper TypeScript interfaces for all props
4. **Accessibility**: Include testID props and proper ARIA labels

#### Screen Development
```typescript
// Good: Using design system
import { Container, Stack, Card, AppText } from '../components/ui';

const MyScreen = () => (
  <Container>
    <Stack spacing="lg">
      <Card variant="elevated">
        <AppText variant="heading3" color="primary">
          Section Title
        </AppText>
        <AppText variant="bodyRegular" color="secondary">
          Description text
        </AppText>
      </Card>
    </Stack>
  </Container>
);

// Bad: Inline styles and hardcoded values
const MyScreen = () => (
  <View style={{ padding: 16, backgroundColor: '#FFFFFF' }}>
    <Text style={{ fontSize: 24, color: '#2196F3', fontWeight: 'bold' }}>
      Section Title
    </Text>
  </View>
);
```

#### Performance Considerations
- Design system components are optimized for React Native performance
- Use `StyleSheet.create()` sparingly - prefer component-based styling
- Semantic colors and typography reduce bundle size through reuse

### Activity Value Framework Integration

#### Color Mapping
The design system automatically maps activity values to appropriate colors:
- **CEO Level (₹2M+)**: Gold (#FDD835) - Premium tier
- **Executive (₹200K-₹2M)**: Blue (#1E88E5) - High impact  
- **High Value (₹20K-₹200K)**: Green (#43A047) - Profitable
- **Professional (₹2K-₹20K)**: Light Blue (#42A5F5) - Standard
- **Basic (₹200-₹2K)**: Gray (#9E9E9E) - Routine
- **Low Value (₹0-₹200)**: Light Gray (#BDBDBD) - Minimal
- **Free Activities (₹0)**: Gray (#9E9E9E) - No value
- **Income Killers (<₹0)**: Red (#E53935) - Negative value

#### Usage Examples
```typescript
// Automatic color assignment
<ActivityLevelBadge value={50000} showIcon />  // Shows green with ✨ icon

// Manual color usage
const color = getActivityValueColor(15000);  // Returns green color
<AppText style={{ color }}>High value activity</AppText>
```

## Common Development Tasks

### UI/Component Development
1. **Always use design system components** from `src/components/ui/`
2. **Import semantic tokens** from `src/styles/designSystem.ts`
3. **Follow component patterns** established in existing screens
4. **Test accessibility** with screen readers and keyboard navigation
5. **Maintain consistent spacing** using Stack and Grid components

### Adding New Activity Categories
1. Update `cost_per_hour_json.json` with new category and activities
2. Ensure ActivityService.ts processes new categories correctly
3. Update UI components to handle additional value tiers
4. Test color mapping with `getActivityValueColor()` function

### Creating New Components
1. **Start with design system tokens** - never hardcode colors, fonts, or spacing
2. **Export TypeScript interfaces** for all props
3. **Add to component index** (`src/components/ui/index.ts`) for easy importing
4. **Include variants and states** (hover, pressed, disabled, error)
5. **Test across platforms** (iOS, Android, Web)

### Modifying Notification Behavior
1. Update NotificationService.ts for timing/content changes
2. Modify notification response handlers in App.tsx
3. Test notification permissions and background behavior

### Database Schema Changes
1. Update Supabase tables via SQL migrations
2. Modify TypeScript interfaces in src/types/index.ts
3. Update SupabaseService.ts for new data operations
4. Handle data migration for existing users

### Design System Updates
1. **Update tokens first** in `designSystem.ts`
2. **Test component changes** across multiple screens
3. **Update documentation** in CLAUDE.md
4. **Verify accessibility** still meets WCAG AA standards

## Testing Strategy

### Manual Testing
- Use Expo Go app on physical devices for notifications testing
- Test offline/online sync scenarios
- Verify time zone handling and date calculations
- Test data export functionality across platforms

### Key Test Scenarios
- Activity logging workflow (notification → selection → save)
- Time slot editing and value recalculation
- Data persistence across app restarts
- Notification scheduling and response handling