# Activity-Based Income Predictor - Complete Development Specification

## 🎯 **App Overview**
An income prediction app that helps users make value-conscious decisions by logging activities in 30-minute chunks, calculating annual income projections, and providing behavioral insights. Users receive smart notifications and can manually select time slots in a day-view calendar interface with cloud-inspired design and behavioral nudging.

---

## 🏗️ **System Architecture (4-Layer Model)**

```
┌─────────────────────────────────────────────────┐
│                PRESENTATION LAYER                │
│  React Native Screens, Components, Navigation   │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│                INFRASTRUCTURE LAYER             │
│     Services, Utils, Notifications, Storage     │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│                    API LAYER                    │
│        Supabase Client, Authentication          │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│                 DATABASE LAYER                  │
│            PostgreSQL via Supabase             │
└─────────────────────────────────────────────────┘
```

---

## 📱 **Core User Workflows**

### **Workflow 1: Notification-Driven Logging**
1. User receives push notification every 30 minutes (9 AM - 10 PM)
2. Taps notification → Opens Activity Selection screen
3. Searches/selects activity for the last 30-minute slot
4. App calculates value and updates daily total
5. Returns to Dashboard

### **Workflow 2: Manual Time Slot Selection**
1. User opens app → Dashboard
2. Taps "View Calendar" → Day View screen
3. Sees 30-minute time slots for current day
4. Taps empty/filled time slot → Activity Selection
5. Selects new activity or edits existing one
6. Value recalculated, daily total updated

### **Workflow 3: Data Export**
1. User navigates to Profile/Settings
2. Taps "Export Data" 
3. Selects date range (if applicable)
4. Downloads CSV file with all activity logs

### **Workflow 4: Historical Review**
1. User opens Day View
2. Swipes between dates or uses date picker
3. Views past activity logs and daily totals
4. Can edit any historical entry
5. Monthly totals auto-update when changes made

---

## 📺 **Screen Specifications**

### **1. Authentication Screens**
- **Login Screen**: Email/password, sign up link
- **Register Screen**: Email, password, confirm password
- **Forgot Password**: Email input, reset instructions

### **2. Main App Screens**

#### **Dashboard Screen (Home)**
**Purpose**: Primary landing screen showing key metrics
**Components**:
- Header with date, settings icon
- Today's Value card (large, prominent)
- Monthly Total card
- Last Activity card (if any)
- Quick Actions: "Log Activity Now", "View Calendar"
- Notification status indicator

#### **Day View Screen (Calendar)**
**Purpose**: 30-minute time slot interface for the selected day
**Components**:
- Date picker/navigation (prev/next day)
- Daily total at top
- Scrollable list of 30-minute time slots (9:00 AM - 10:00 PM)
- Each slot shows: time, activity name (if logged), value
- Empty slots show "Tap to add activity"
- Color coding: Positive value (green), negative (red), zero (gray)

#### **Activity Selection Screen**
**Purpose**: Search and select activities for time slots
**Components**:
- Search bar with real-time filtering
- Activity list grouped by value categories
- Each activity shows: name, hourly value, 30-min value
- Selection confirmation with time slot context
- "Save" and "Cancel" buttons

#### **Profile/Settings Screen**
**Purpose**: User preferences and data management
**Components**:
- User info section
- Notification settings (on/off, hours configuration)
- Export data button
- Logout option
- App version info

### **3. Modal/Overlay Screens**
- **Edit Activity Modal**: Modify existing time slot entries
- **Date Picker Modal**: Navigate to specific dates
- **Export Confirmation Modal**: Date range selection for export

---

## 🧩 **Component Architecture**

### **Reusable Components**

#### **TimeSlot Component**
- Displays 30-minute time blocks
- Shows activity name, value, time
- Handles tap interactions
- Visual states: empty, filled, selected

#### **ActivityCard Component**
- Individual activity display in lists
- Shows name, category, hourly value, 30-min value
- Selection state management

#### **ValueDisplay Component**
- Consistent value formatting (currency, colors)
- Used for daily totals, monthly totals, individual activities

#### **SearchBar Component**
- Real-time search with debouncing
- Clear button, search suggestions

#### **DateNavigator Component**
- Previous/next day navigation
- Date picker integration
- Current date highlighting

---

## 🛠️ **Technology Stack**

### **Frontend Framework**
- **React Native** with **Expo SDK 49+**
- **TypeScript** for type safety
- **React Navigation 6** for screen navigation

### **State Management**
- **React Context API** + **useReducer** for global state
- **AsyncStorage** for local data persistence
- **React Query** for server state management

### **UI/Styling**
- **Cloud-inspired Design System** with Anthropic minimalism
- **Expo Linear Gradient** for sky/cloud backgrounds
- **Vector Icons** for consistent iconography
- **Custom StyleSheet** with comprehensive design system

### **Notifications**
- **Expo Notifications** for push notifications
- **Background Tasks** for scheduling

### **Data Export & Utils**
- **React Native CSV** for CSV generation
- **React Native Share** for file sharing
- **Indian Number Formatting** for lakh/crore display
- **Behavioral Psychology Utils** for smart suggestions

---

## 🗄️ **Database Layer (PostgreSQL via Supabase)**

### **Core Tables**

#### **users Table**
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  notification_start_time TIME DEFAULT '06:00',
  notification_end_time TIME DEFAULT '24:00',
  timezone VARCHAR DEFAULT 'UTC'
)
```

#### **activities Table** (Master Data)
```sql
activities (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  hourly_value DECIMAL(10,2) NOT NULL,
  category VARCHAR NOT NULL,
  search_tags TEXT[], -- For enhanced search
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)
```

#### **activity_logs Table** (Transactional Data)
```sql
activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  activity_id UUID REFERENCES activities(id),
  activity_name VARCHAR NOT NULL, -- Denormalized for history
  hourly_value DECIMAL(10,2) NOT NULL, -- Denormalized for history
  block_value DECIMAL(10,2) NOT NULL, -- Calculated 30-min value
  time_slot_start TIMESTAMP NOT NULL,
  time_slot_end TIMESTAMP NOT NULL,
  logged_at TIMESTAMP DEFAULT NOW(),
  edited_at TIMESTAMP, -- For audit trail
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, time_slot_start) -- One activity per time slot
)
```

#### **daily_summaries Table** (Computed Data)
```sql
daily_summaries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  total_value DECIMAL(12,2) DEFAULT 0,
  activity_count INTEGER DEFAULT 0,
  computed_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, date)
)
```

### **Database Indexes**
```sql
-- Performance indexes
CREATE INDEX idx_activity_logs_user_time ON activity_logs(user_id, time_slot_start);
CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, date);
CREATE INDEX idx_activities_search ON activities USING GIN(search_tags);
```

### **Row Level Security (RLS)**
- Users can only access their own activity_logs and daily_summaries
- Activities table is public (read-only for users)
- Users can update their own profile settings

---

## 🔌 **API Layer (Supabase Integration)**

### **Authentication APIs**
- `supabase.auth.signUp()` - User registration
- `supabase.auth.signIn()` - User login
- `supabase.auth.signOut()` - User logout
- `supabase.auth.onAuthStateChange()` - Auth state monitoring

### **Activity Management APIs**
- `GET /activities` - Fetch all available activities
- `GET /activities?search=term` - Search activities by name/tags

### **Activity Logging APIs**
- `POST /activity_logs` - Create new activity log
- `PUT /activity_logs/:id` - Update existing activity log
- `GET /activity_logs?user_id&date_range` - Fetch user's activity logs
- `DELETE /activity_logs/:id` - Remove activity log

### **Summary APIs**
- `GET /daily_summaries?user_id&date` - Get daily summary
- `GET /daily_summaries?user_id&month` - Get monthly summaries
- Auto-computed via database functions/triggers

### **Real-time Subscriptions**
- Subscribe to `activity_logs` changes for live updates
- Subscribe to `daily_summaries` for real-time total updates

---

## ⚙️ **Infrastructure Layer**

### **Services Architecture**

#### **NotificationService**
- Schedules 30-minute interval notifications
- Respects user's start/end time preferences
- Handles notification permissions
- Smart notifications (skip if slot already filled)

#### **ActivityTrackingService**
- Manages time slot calculations
- Validates time slot constraints
- Handles value computations
- Coordinates with database

#### **DataSyncService**
- Handles online/offline synchronization
- Manages local storage fallbacks
- Conflict resolution for edited entries
- Background sync operations

#### **ExportService**
- Generates CSV files from activity logs
- Handles date range filtering
- Manages file sharing/download

#### **StorageService**
- AsyncStorage abstraction
- Data encryption for sensitive info
- Cache management
- Offline data persistence

### **Utility Functions**

#### **TimeSlotUtils**
- Calculate 30-minute time slots for any date
- Generate time slot ranges
- Handle timezone conversions
- Validate slot overlaps

#### **ValueCalculators**
- Convert hourly rates to 30-minute values
- Calculate daily totals from activity logs
- Compute monthly summaries
- Handle negative value activities

#### **SearchUtils**
- Activity search and filtering
- Fuzzy matching for activity names
- Tag-based search enhancement

---

## 📋 **Configuration Management**

### **App Configuration (config.ts)**
```typescript
export const APP_CONFIG = {
  NOTIFICATION_INTERVAL: 30, // minutes
  DEFAULT_START_TIME: '06:00',
  DEFAULT_END_TIME: '24:00',
  MAX_EDIT_DAYS_BACK: null, // unlimited
  TIME_SLOT_DURATION: 30, // minutes
  EXPORT_MAX_RECORDS: 10000,
}
```

### **Activity Configuration (activities.json)**
```json
{
  "activities": [
    {
      "name": "Client Work",
      "hourly_value": 2000,
      "category": "Professional",
      "search_tags": ["client", "work", "helping client", "client support"]
    }
  ]
}
```

This configuration file allows easy backend updates to activity search terms without code changes.

---

## 🔄 **Data Flow Architecture**

### **Activity Logging Flow**
1. **User Action** (notification tap or manual selection)
2. **Presentation Layer** (Activity Selection Screen)
3. **Infrastructure Layer** (ActivityTrackingService validates and processes)
4. **API Layer** (Supabase client saves to database)
5. **Database Layer** (PostgreSQL stores, triggers update daily_summaries)
6. **Real-time Update** (Supabase real-time notifies other components)
7. **UI Refresh** (Dashboard and Day View update automatically)

### **Data Export Flow**
1. **User Request** (Export button in Profile)
2. **ExportService** queries activity_logs for date range
3. **CSV Generation** with proper formatting
4. **File Sharing** via native share dialog

### **Time Slot Calculation**
1. **Time Input** (user selects time slot)
2. **Value Calculation** (hourly_value ÷ 2 = 30_min_value)
3. **Database Update** (activity_logs + daily_summaries)
4. **UI Refresh** (updated totals displayed)

---

## 🧪 **Key Business Logic Rules**

### **Time Slot Management**
- Each 30-minute slot can have only one activity
- Time slots are: 9:00-9:30, 9:30-10:00, etc.
- Missing slots have 0 value (not recorded in database)
- Users can edit any historical time slot

### **Value Calculations**
- Block Value = Hourly Value ÷ 2
- Daily Total = Sum of all block values for that date
- Monthly Total = Sum of all daily totals in that month
- Negative values are allowed and subtract from totals

### **Notification Logic**
- Send notification every 30 minutes within configured hours
- Skip notification if current 30-minute slot already has activity
- Handle timezone changes automatically
- Respect system Do Not Disturb settings

### **Data Consistency**
- Activity logs maintain original activity name and value (denormalized)
- Historical data remains unchanged if master activity is modified
- Edit timestamps track when changes were made
- Daily summaries recalculate when activity logs change

---

## 🎨 **UI/UX Guidelines**

### **Design System**
- **Primary Color**: Blue (#3B82F6) for positive values
- **Success Color**: Green (#10B981) for profitable activities
- **Error Color**: Red (#EF4444) for negative value activities
- **Neutral Colors**: Gray scale for empty states
- **Typography**: System fonts with clear hierarchy

### **Interaction Patterns**
- **Tap to Select**: Time slots and activities
- **Swipe Navigation**: Between dates in Day View
- **Pull to Refresh**: Update daily data
- **Long Press**: Quick action menus (future feature)

### **Accessibility**
- VoiceOver/TalkBack support for all interactive elements
- High contrast mode compatibility
- Proper font scaling for readability
- Semantic labeling for screen readers

---

## 🚀 **Development Phases**

### **Phase 1: Core Foundation (Week 1-2)**
- Database schema setup
- Authentication flow
- Basic navigation structure
- Activity selection and logging

### **Phase 2: Calendar Interface (Week 3)**
- Day View with time slots
- Time slot interaction and editing
- Daily total calculations
- Historical data viewing

### **Phase 3: Notifications & Polish (Week 4)**
- Push notification implementation
- 30-minute scheduling system
- UI polish and error handling
- Basic testing

### **Phase 4: Export & Advanced Features (Week 5)**
- CSV export functionality
- Monthly summaries
- Edit history/audit trail
- Performance optimization

---

## 📊 **Success Metrics**

### **Technical Metrics**
- App launch time < 2 seconds
- Time slot selection response < 500ms
- Notification delivery success rate > 95%
- Data export completion < 30 seconds

### **User Experience Metrics**
- Daily active usage > 80% (users log activities daily)
- Notification response rate > 60%
- Time to log activity < 30 seconds
- Data accuracy (minimal corrections needed)

---

This specification provides a complete blueprint for developers to build a production-ready activity tracking app with all required features, proper architecture, and clear implementation guidelines.