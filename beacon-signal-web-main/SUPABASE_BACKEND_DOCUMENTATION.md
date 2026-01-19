# Supabase Backend for Beacon Signal Web Application

This document outlines the setup and configuration of the Supabase backend for the beacon-signal-web application, including database schema, authentication, and API integration.

## Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Authentication System](#authentication-system)
4. [API Integration](#api-integration)
5. [Setup Instructions](#setup-instructions)
6. [Environment Variables](#environment-variables)
7. [Deployment](#deployment)

## Overview

The Supabase backend provides a complete backend solution for the beacon-signal-web application, including:
- User authentication with OTP (One-Time Password)
- Subscription management
- Multiple dataset tables for business intelligence
- Row-Level Security (RLS) for data protection
- Stored procedures for common operations

## Database Schema

### Custom Types
- `plan_type`: ENUM ('Trial', 'Essential', 'Business', 'Business-Custom')
- `subscription_frequency`: ENUM ('monthly', 'quarterly', 'halfYearly', 'annual')
- `dataset_type`: ENUM ('mna', 'fundraising', 'layoff', 'data_security_breach', 'cxo_changes', 'business_expansion')
- `user_role`: ENUM ('consulting', 'vc_pe', 'research', 'corporate', 'other')

### Core Tables

#### Profiles Table
Stores extended user profile information:
```sql
id UUID REFERENCES auth.users(id) PRIMARY KEY,
email TEXT UNIQUE NOT NULL,
name TEXT,
company TEXT,
phone TEXT,
role user_role DEFAULT 'other',
industries TEXT[],
signal_types TEXT[],
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

#### Plans Table
Defines available subscription plans:
```sql
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
name TEXT UNIQUE NOT NULL,
type TEXT,
datasets TEXT[],
pricing JSONB,
features TEXT[],
download_allowed BOOLEAN DEFAULT FALSE,
max_team_members INTEGER DEFAULT 1,
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

#### Subscriptions Table
Tracks user subscriptions:
```sql
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
resource TEXT,
subscribed_on TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
expires_on TIMESTAMP WITH TIME ZONE NOT NULL,
is_active BOOLEAN DEFAULT TRUE,
config JSONB,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

#### Dataset Tables
Each dataset type has its own table with appropriate fields:

**M&A Data Table:**
```sql
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
announced_date DATE,
acquiring_company JSONB,
acquired_company JSONB,
deal_amount NUMERIC,
currency TEXT,
transaction_status TEXT,
transaction_type TEXT,
employees_impacted INTEGER,
source_urls TEXT[],
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Fundraising Data Table:**
```sql
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
funding_date DATE,
company JSONB,
round_type TEXT,
amount_raised NUMERIC,
valuation NUMERIC,
currency TEXT,
investors TEXT[],
lead_investors TEXT[],
funding_stage TEXT,
source_urls TEXT[],
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Layoff Data Table:**
```sql
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
layoff_date DATE,
company JSONB,
layoff_count INTEGER,
layoff_percentage NUMERIC,
layoff_type TEXT,
reason TEXT,
department TEXT,
source_urls TEXT[],
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Data Security Breach Data Table:**
```sql
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
breach_date DATE,
notice_date DATE,
company JSONB,
incident_type TEXT,
people_impacted INTEGER,
severity_level TEXT,
data_type TEXT[],
third_party_company JSONB,
source_urls TEXT[],
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**CXO Changes Data Table:**
```sql
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
change_date DATE,
executive_name TEXT,
company JSONB,
new_title TEXT,
previous_title TEXT,
change_type TEXT,
title_category TEXT,
source_urls TEXT[],
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Business Expansion Data Table:**
```sql
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
expansion_date DATE,
company JSONB,
expansion_type TEXT,
location TEXT,
investment NUMERIC,
jobs_created INTEGER,
market_entry TEXT[],
source_urls TEXT[],
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

#### Support Tables
- `saved_searches`: Stores user's saved search queries
- `bookmarks`: Stores user's bookmarked signals
- `bookmark_folders`: Organizes bookmarks into folders
- `alerts`: Manages user alerts
- `user_preferences`: Stores user preferences
- `otp_codes`: Temporary storage for OTP codes

## Authentication System

The application uses an OTP (One-Time Password) based authentication system:

1. **Request Code**: User provides email, system generates a 6-digit OTP
2. **Validate Code**: User enters OTP, system validates and creates session
3. **Session Management**: JWT tokens are handled automatically by Supabase

### Key Functions

**generate_otp(email)**: Generates and stores a 6-digit OTP code valid for 10 minutes
**validate_otp(email, code)**: Validates the OTP code and marks it as used
**handle_new_user()**: Trigger function that creates profile and preferences when a new user signs up

## API Integration

The frontend integrates with Supabase through the `supabase-service.ts` file which provides:

### Authentication Service (`authService`)
- `requestCode(email, name?, company?)`: Requests OTP for email verification
- `validateCode(email, code)`: Validates OTP and returns auth token
- `register(data)`: Registers new user
- `signOut()`: Signs out current user
- `getCurrentUser()`: Gets current user profile

### Dataset Service (`datasetService`)
- `checkAccess(planType)`: Checks if user has access to plan type
- `getMnAData(planType, filters?)`: Gets M&A data
- `getFundraisingData(planType, filters?)`: Gets fundraising data
- `getLayoffData(planType, filters?)`: Gets layoff data
- `getSecurityBreachData(planType, filters?)`: Gets security breach data
- `getCxoChangesData(planType, filters?)`: Gets CXO changes data
- `getBusinessExpansionData(planType, filters?)`: Gets business expansion data

### Plans Service (`plansService`)
- `getMySubscriptions()`: Gets user's current subscriptions
- `getAvailablePlans()`: Gets all available plans
- `subscribe(request)`: Subscribes user to a plan

### Preferences Service (`preferencesService`)
- `getPreferences()`: Gets user preferences
- `savePreferences(data)`: Saves user preferences

## Setup Instructions

### Prerequisites
- Node.js 16+ installed
- Supabase account (https://supabase.io)
- Access to Supabase project credentials

### Steps

1. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Set Up Environment Variables**
   Create a `.env` file in your project root with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run Database Migration**
   Execute the `supabase_schema.sql` script in your Supabase SQL editor or through the CLI:
   ```bash
   supabase db reset
   # Then run the schema script
   ```

4. **Update API Client**
   Modify your existing API client to use the Supabase service instead of external API calls:
   ```typescript
   // In your API config file
   import { authService, datasetService, plansService, preferencesService } from '@/lib/supabase-service';
   
   // Replace existing API calls with Supabase service calls
   ```

5. **Configure Authentication**
   The authentication system is already configured in `supabase-service.ts` with OTP functionality.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Deployment

### Frontend Deployment
1. Ensure environment variables are set in your hosting platform (Vercel, Netlify, etc.)
2. Build your application: `npm run build`
3. Deploy the build output

### Supabase Project Setup
1. Create a new Supabase project at https://app.supabase.io
2. Copy the project URL and anon key to your environment variables
3. Run the schema migration in the SQL editor
4. Configure authentication settings:
   - Enable Email/Password signups
   - Configure email templates if needed
   - Set up redirect URLs for OAuth if required

### Security Considerations
- RLS (Row Level Security) is enabled on all tables
- Users can only access their own data
- Dataset access is restricted based on subscription status
- OTP codes expire after 10 minutes

## Testing

To test the Supabase integration:

1. **Unit Tests**: Create tests for each service function
2. **Integration Tests**: Test the complete flow from UI to database
3. **Authentication Flow**: Test the complete OTP flow
4. **Subscription Flow**: Test plan selection and access control

Example test for authentication:
```typescript
import { authService } from '@/lib/supabase-service';

// Test OTP request
const result = await authService.requestCode('test@example.com');
expect(result.success).toBe(true);

// Test OTP validation (with a valid code)
const authResult = await authService.validateCode('test@example.com', '123456');
expect(authResult.token).toBeDefined();
```

## Troubleshooting

### Common Issues
1. **Authentication fails**: Check that Supabase URL and ANON key are correct
2. **Access denied**: Verify user has active subscription for requested dataset
3. **Database errors**: Ensure schema has been applied correctly
4. **RLS errors**: Check that policies are properly configured

### Debugging Tips
- Enable Supabase logging to see detailed query information
- Use the Supabase Studio to inspect data and test queries
- Check browser console for client-side errors
- Monitor network requests to verify API calls

## Maintenance

### Regular Tasks
- Monitor OTP code usage and clean up expired codes
- Review and update subscription plans as needed
- Clean up inactive user accounts periodically
- Backup important data regularly

### Updates
- Keep Supabase client library updated
- Review and update RLS policies as requirements change
- Monitor performance and add indexes as needed
- Update stored procedures when business logic changes