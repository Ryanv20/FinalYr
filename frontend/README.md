# MERMS Frontend

Modern, role-based web interface for the MERMS Disease Monitoring and Control System.

## Features

### Role-Based Dashboards

**Civilian Portal**
- View local health alerts based on GPS coordinates
- Access national disease trends and statistics
- Receive public health information

**Healthcare Institution Portal**
- Submit sentinel reports with patient clusters
- Track submission status in real-time
- View facility reporting history

**Public Health Officer (PHO) Portal**
- AI-ranked alert inbox with confidence scores
- Claim and investigate alerts
- Update alert status (investigating → probable → confirmed)
- Broadcast civilian warnings

**Emergency Operations Center (EOC) Portal**
- Approve/reject facility registrations
- Appoint PHOs to geographic zones
- Override AI false-positive alerts

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (already set in `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:3001 in your browser

## Testing the Application

### 1. Register Test Users

Create accounts for each role using the registration form:

**Civilian:**
- Email: civilian@test.com
- Password: password123
- Role: Civilian

**Healthcare Institution:**
- Email: hospital@test.com
- Password: password123
- Role: Healthcare Institution
- Facility ID: hospital-404

**PHO:**
- Email: pho@test.com
- Password: password123
- Role: Public Health Officer
- Zone ID: zone-777

**EOC Admin:**
- Email: eoc@test.com
- Password: password123
- Role: Emergency Operations Center

### 2. Test Workflows

**Institution Flow:**
1. Login as institution user
2. Navigate to "Submit Report" tab
3. Fill in patient count, symptoms, severity, location
4. Submit sentinel report
5. Check "Report Feed" to see submission status

**PHO Flow:**
1. Login as PHO user
2. View AI-ranked alerts in "Alert Inbox"
3. Claim an alert for investigation
4. Navigate to "My Investigations"
5. Update alert status through the workflow

**EOC Flow:**
1. Login as EOC user
2. Approve facilities in "Facilities" tab
3. Appoint PHOs in "PHO Management" tab

**Civilian Flow:**
1. Login as civilian user
2. Enter GPS coordinates in "Local Alerts"
3. View nearby health warnings
4. Check "National Trends" for statistics

## Architecture

### State Management
- Zustand for global auth state
- Supabase client for authentication
- React hooks for component state

### Styling
- Tailwind CSS with custom color palette
- Emerald/teal theme for health focus
- Responsive design for all screen sizes

### Components
- `auth-form.tsx` - Login/registration
- `dashboard-layout.tsx` - Role-based navigation
- `institution-dashboard.tsx` - Report submission
- `pho-dashboard.tsx` - Alert management
- `eoc-dashboard.tsx` - Admin controls
- `civilian-dashboard.tsx` - Public alerts

### API Integration
- RESTful API calls to backend
- JWT token authentication
- Error handling and loading states

## Build for Production

```bash
npm run build
npm start
```

## Technology Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Zustand State Management
- Lucide React Icons
