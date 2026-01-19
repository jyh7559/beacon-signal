# Beacon Signal Web - Supabase Backend Implementation

This repository contains the frontend for the Beacon Signal Web application with a newly implemented Supabase backend.

## Features Implemented

- ✅ Complete Supabase backend with PostgreSQL database
- ✅ OTP (One-Time Password) authentication system
- ✅ User management and profile storage
- ✅ Subscription management system
- ✅ Six dataset tables for business intelligence:
  - M&A (Mergers & Acquisitions)
  - Fundraising
  - Layoffs
  - Data Security Breaches
  - CXO Changes
  - Business Expansion
- ✅ Row-Level Security (RLS) for data protection
- ✅ Stored procedures for common operations
- ✅ Comprehensive API service layer
- ✅ Complete documentation

## Files Added

1. `supabase_schema.sql` - Complete database schema with tables, functions, and RLS policies
2. `src/lib/supabase-service.ts` - Complete Supabase service layer with all API methods
3. `SUPABASE_BACKEND_DOCUMENTATION.md` - Comprehensive documentation for setup and deployment

## Quick Setup

### Prerequisites
- Node.js 16+
- Supabase account (https://supabase.io)

### Steps

1. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Set Up Environment Variables**
   Create a `.env` file in your project root:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Apply Database Schema**
   Run the `supabase_schema.sql` script in your Supabase SQL editor

4. **Update API Calls**
   The `src/lib/supabase-service.ts` file contains all the necessary API methods to replace your existing API calls

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Architecture Overview

The Supabase backend implements:

- **Authentication**: OTP-based system with automatic profile creation
- **Authorization**: Row-level security ensuring users only access their own data
- **Subscriptions**: Flexible plan system with access control based on active subscriptions
- **Data Storage**: Specialized tables for each dataset type with JSONB fields for flexibility
- **Security**: Multiple layers of protection including RLS, validated inputs, and secure functions

## API Integration

The service layer in `src/lib/supabase-service.ts` provides drop-in replacements for your existing API calls:

- `authService` - Handles all authentication needs
- `datasetService` - Provides access to all six dataset types
- `plansService` - Manages subscriptions and plan information
- `preferencesService` - Handles user preferences

## Next Steps

1. Configure your Supabase project with the provided schema
2. Update your frontend to use the new Supabase service methods
3. Test all authentication and data access flows
4. Deploy to your preferred hosting platform

For detailed setup instructions and troubleshooting, refer to `SUPABASE_BACKEND_DOCUMENTATION.md`.