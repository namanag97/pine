# Pine App - Core User Workflows

## PRIMARY USER WORKFLOWS

### 1. Time Tracking Workflow
**Goal**: Log activities in 30-minute slots to build time value awareness

**Steps**:
1. User opens app → sees current time slot highlighted on timeline
2. App auto-scrolls to current time slot
3. User receives notification reminder (every 30 min during active hours)
4. User taps current/past empty slot → Activity Selection modal opens
5. User searches/selects activity → slot updates with activity + value
6. Data saves locally AND syncs to cloud immediately
7. Dashboard metrics update in real-time

**Critical Success Factors**:
- Timeline shows full 24-hour day (48 slots)
- Current time slot is visually prominent and auto-scrolled to
- Activity selection is fast (<2 seconds to open, search, select)
- Data persistence is 100% reliable (local + cloud)
- Metrics update immediately after selection

### 2. Daily Insight Workflow  
**Goal**: Understand daily time allocation and income potential

**Steps**:
1. User views dashboard with today's timeline
2. Sees real-time metrics: total value earned, hours logged, efficiency score
3. Views activity breakdown with color-coded value tiers
4. Sees current activity status and next recommended action
5. Can quickly edit past slots or plan future ones

**Critical Success Factors**:
- Metrics are accurate and update immediately
- Visual hierarchy clearly shows most/least valuable activities
- Easy editing of past time slots
- Projections are realistic and motivating

### 3. Historical Analysis Workflow
**Goal**: Track progress and identify patterns over time  

**Steps**:
1. User navigates to Stats screen
2. Views daily/weekly/monthly trends
3. Analyzes activity patterns and time allocation
4. Identifies highest-value time blocks and optimization opportunities
5. Can export data for external analysis

**Critical Success Factors**:
- Charts load quickly and are visually appealing
- Data spans sufficient history for trend analysis
- Export functionality works reliably
- Insights are actionable

### 4. Settings & Preferences Workflow
**Goal**: Customize app behavior and notification preferences

**Steps**:
1. User opens Settings
2. Configures notification timing (start/end times)
3. Sets notification frequency preferences
4. Manages data sync and backup
5. Views storage statistics

**Critical Success Factors**:
- Settings changes take effect immediately
- Notification scheduling works reliably
- Data backup/restore is foolproof
- Clear storage management

### 5. Data Recovery Workflow (Critical)
**Goal**: Ensure no data loss during sync failures

**Steps**:
1. User notices missing historical data
2. Opens Data Sync screen from Settings
3. Checks connection status
4. Syncs local data to cloud
5. Fetches missing data from cloud
6. Resolves any conflicts

**Critical Success Factors**:
- Clear visibility into sync status
- One-click data recovery
- Conflict resolution is automated or clearly guided
- No data loss scenarios

## SECONDARY USER WORKFLOWS

### 6. Notification Response Workflow
**Goal**: Seamless activity logging from notifications

**Steps**:
1. User receives notification
2. Taps notification → app opens to current time slot
3. Activity selection modal pre-opens
4. User selects activity → returns to background

### 7. Activity Management Workflow  
**Goal**: Customize available activities and their values

**Steps**:
1. User views activity categories
2. Can favorite frequently used activities
3. Search filters by category, value, or custom tags

### 8. Income Projection Workflow
**Goal**: Plan and visualize earning potential

**Steps**:
1. User views daily totals
2. Sees monthly projections based on current activity mix
3. Can simulate different activity allocations
4. Plans high-value time blocks

## WORKFLOW INTERDEPENDENCIES

### Critical Data Flows
1. **Activity Selection** → **Timeline Update** → **Metrics Recalculation** → **Cloud Sync**
2. **Notification Trigger** → **User Response** → **Activity Logging** → **Data Persistence**
3. **Data Sync** → **Conflict Resolution** → **Local Update** → **UI Refresh**

### Failure Points to Prevent
1. **Sync Failure**: Activity logged locally but not synced to cloud
2. **State Inconsistency**: UI shows outdated data after activity change
3. **Notification Failure**: User misses logging reminder
4. **Data Loss**: Local data corruption without cloud backup
5. **Performance**: Slow activity selection or timeline loading

## WORKFLOW VALIDATION CRITERIA

Each workflow must satisfy:
1. **Performance**: Critical path operations complete in <2 seconds
2. **Reliability**: 99.9% success rate for data operations
3. **Usability**: Maximum 3 taps to complete primary actions
4. **Consistency**: UI state always reflects actual data state
5. **Offline Capability**: Core workflows work without internet
6. **Error Recovery**: Clear paths to resolve any failure state