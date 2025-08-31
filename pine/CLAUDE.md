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

## Common Development Tasks

### Adding New Activity Categories
1. Update `cost_per_hour_json.json` with new category and activities
2. Ensure ActivityService.ts processes new categories correctly
3. Update UI components to handle additional value tiers

### Modifying Notification Behavior
1. Update NotificationService.ts for timing/content changes
2. Modify notification response handlers in App.tsx
3. Test notification permissions and background behavior

### Database Schema Changes
1. Update Supabase tables via SQL migrations
2. Modify TypeScript interfaces in src/types/index.ts
3. Update SupabaseService.ts for new data operations
4. Handle data migration for existing users

### UI/Component Development  
1. Follow existing patterns in src/components/ and src/screens/
2. Use design system defined in src/styles/designSystem.ts
3. Ensure accessibility support for screen readers
4. Test across iOS, Android, and web platforms

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