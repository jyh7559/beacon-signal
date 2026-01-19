-- Supabase Schema for Beacon Signal Web Application
-- This schema implements the backend for the beacon-signal-web application
-- with support for authentication, datasets, user management, and subscriptions

-- Enable Row Level Security (RLS) - Note: auth.users and auth.user_secrets are managed by Supabase
-- and don't typically need manual RLS enablement
-- ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE auth.user_secrets ENABLE ROW LEVEL SECURITY;

-- Create custom types
CREATE TYPE plan_type AS ENUM ('Trial', 'Essential', 'Business', 'Business-Custom');
CREATE TYPE subscription_frequency AS ENUM ('monthly', 'quarterly', 'halfYearly', 'annual');
CREATE TYPE dataset_type AS ENUM ('mna', 'fundraising', 'layoff', 'data_security_breach', 'cxo_changes', 'business_expansion');
CREATE TYPE user_role AS ENUM ('consulting', 'vc_pe', 'research', 'corporate', 'other');

-- Create users table with extended profile information
CREATE TABLE IF NOT EXISTS profiles (
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
);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT,
  datasets TEXT[],
  pricing JSONB, -- { monthly: number, quarterly: number, halfYearly: number, annual: number }
  features TEXT[],
  download_allowed BOOLEAN DEFAULT FALSE,
  max_team_members INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
  resource TEXT, -- e.g., 'dataset.mna'
  subscribed_on TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_on TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  config JSONB, -- Additional plan configuration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create M&A (Mergers & Acquisitions) dataset table
CREATE TABLE IF NOT EXISTS mna_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  announced_date DATE,
  acquiring_company JSONB, -- { name: string, domain: string, ... }
  acquired_company JSONB, -- { name: string, domain: string, ... }
  deal_amount NUMERIC,
  currency TEXT,
  transaction_status TEXT,
  transaction_type TEXT,
  employees_impacted INTEGER,
  source_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Fundraising dataset table
CREATE TABLE IF NOT EXISTS fundraising_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funding_date DATE,
  company JSONB, -- { name: string, domain: string, industry: string, ... }
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
);

-- Create Layoffs dataset table
CREATE TABLE IF NOT EXISTS layoff_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  layoff_date DATE,
  company JSONB, -- { name: string, domain: string, industry: string, ... }
  layoff_count INTEGER,
  layoff_percentage NUMERIC,
  layoff_type TEXT,
  reason TEXT,
  department TEXT,
  source_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Data Security Breach dataset table
CREATE TABLE IF NOT EXISTS data_security_breach_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  breach_date DATE,
  notice_date DATE,
  company JSONB, -- { name: string, domain: string, industry: string, ... }
  incident_type TEXT,
  people_impacted INTEGER,
  severity_level TEXT,
  data_type TEXT[],
  third_party_company JSONB, -- { name: string, domain: string, ... }
  source_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create CXO Changes dataset table
CREATE TABLE IF NOT EXISTS cxo_changes_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  change_date DATE,
  executive_name TEXT,
  company JSONB, -- { name: string, domain: string, industry: string, ... }
  new_title TEXT,
  previous_title TEXT,
  change_type TEXT,
  title_category TEXT,
  source_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Business Expansion dataset table
CREATE TABLE IF NOT EXISTS business_expansion_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expansion_date DATE,
  company JSONB, -- { name: string, domain: string, industry: string, ... }
  expansion_type TEXT,
  location TEXT,
  investment NUMERIC,
  jobs_created INTEGER,
  market_entry TEXT[],
  source_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  query_params JSONB, -- Search parameters object
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  signal_id TEXT NOT NULL, -- Reference to signal in dataset
  dataset_type dataset_type NOT NULL,
  notes TEXT,
  tags TEXT[],
  folder_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookmark folders table
CREATE TABLE IF NOT EXISTS bookmark_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  conditions JSONB[], -- Array of alert condition objects
  destinations JSONB[], -- Array of alert destination objects
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER DEFAULT 0
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT,
  industries TEXT[],
  signals TEXT[],
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create OTP codes table for authentication
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_on ON subscriptions(expires_on);
CREATE INDEX IF NOT EXISTS idx_mna_announced_date ON mna_data(announced_date);
CREATE INDEX IF NOT EXISTS idx_fundraising_funding_date ON fundraising_data(funding_date);
CREATE INDEX IF NOT EXISTS idx_layoff_layoff_date ON layoff_data(layoff_date);
CREATE INDEX IF NOT EXISTS idx_data_breach_breach_date ON data_security_breach_data(breach_date);
CREATE INDEX IF NOT EXISTS idx_cxo_changes_change_date ON cxo_changes_data(change_date);
CREATE INDEX IF NOT EXISTS idx_business_expansion_expansion_date ON business_expansion_data(expansion_date);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_signal_id ON bookmarks(signal_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_code ON otp_codes(code);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- RLS Policies
-- Profiles table policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Subscriptions table policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Dataset tables policies (read-only for authenticated users with valid subscription)
CREATE POLICY "Users with valid subscription can view M&A data" ON mna_data
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = auth.uid()
      AND s.resource = 'dataset.mna'
      AND s.is_active = TRUE
      AND s.expires_on > NOW()
    )
  );

CREATE POLICY "Users with valid subscription can view Fundraising data" ON fundraising_data
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = auth.uid()
      AND s.resource = 'dataset.fundraising'
      AND s.is_active = TRUE
      AND s.expires_on > NOW()
    )
  );

CREATE POLICY "Users with valid subscription can view Layoff data" ON layoff_data
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = auth.uid()
      AND s.resource = 'dataset.layoff'
      AND s.is_active = TRUE
      AND s.expires_on > NOW()
    )
  );

CREATE POLICY "Users with valid subscription can view Data Security Breach data" ON data_security_breach_data
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = auth.uid()
      AND s.resource = 'dataset.data_security_breach'
      AND s.is_active = TRUE
      AND s.expires_on > NOW()
    )
  );

CREATE POLICY "Users with valid subscription can view CXO Changes data" ON cxo_changes_data
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = auth.uid()
      AND s.resource = 'dataset.cxo_changes'
      AND s.is_active = TRUE
      AND s.expires_on > NOW()
    )
  );

CREATE POLICY "Users with valid subscription can view Business Expansion data" ON business_expansion_data
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = auth.uid()
      AND s.resource = 'dataset.business_expansion'
      AND s.is_active = TRUE
      AND s.expires_on > NOW()
    )
  );

-- Saved searches policies
CREATE POLICY "Users can view own saved searches" ON saved_searches
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved searches" ON saved_searches
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved searches" ON saved_searches
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved searches" ON saved_searches
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON bookmarks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks" ON bookmarks
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Bookmark folders policies
CREATE POLICY "Users can view own bookmark folders" ON bookmark_folders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmark folders" ON bookmark_folders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmark folders" ON bookmark_folders
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmark folders" ON bookmark_folders
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Alerts policies
CREATE POLICY "Users can view own alerts" ON alerts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" ON alerts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON alerts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON alerts
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Functions for authentication and data access
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW());
  
  INSERT INTO public.user_preferences (user_id, created_at)
  VALUES (NEW.id, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate and store OTP code
CREATE OR REPLACE FUNCTION public.generate_otp(p_email TEXT)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate a 6-digit numeric code
  v_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  v_expires_at := NOW() + INTERVAL '10 minutes';
  
  -- Insert or update the OTP code
  INSERT INTO otp_codes (email, code, expires_at)
  VALUES (p_email, v_code, v_expires_at)
  ON CONFLICT (email) 
  DO UPDATE SET 
    code = EXCLUDED.code,
    expires_at = EXCLUDED.expires_at,
    used = FALSE;
  
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Function to validate OTP code
CREATE OR REPLACE FUNCTION public.validate_otp(p_email TEXT, p_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_record RECORD;
BEGIN
  SELECT * INTO v_record FROM otp_codes 
  WHERE email = p_email 
    AND code = p_code 
    AND expires_at > NOW() 
    AND used = FALSE;
  
  IF FOUND THEN
    -- Mark the OTP as used
    UPDATE otp_codes 
    SET used = TRUE 
    WHERE email = p_email AND code = p_code;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check user access to a specific plan type
CREATE OR REPLACE FUNCTION public.check_access_to_plan(p_user_id UUID, p_plan_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.user_id = p_user_id
      AND p.name = p_plan_type
      AND s.is_active = TRUE
      AND s.expires_on > NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's active plan type
CREATE OR REPLACE FUNCTION public.get_user_plan_type(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_plan_name TEXT;
BEGIN
  SELECT p.name INTO v_plan_name
  FROM subscriptions s
  JOIN plans p ON s.plan_id = p.id
  WHERE s.user_id = p_user_id
    AND s.is_active = TRUE
    AND s.expires_on > NOW()
  ORDER BY s.expires_on DESC
  LIMIT 1;
  
  RETURN COALESCE(v_plan_name, 'Trial');
END;
$$ LANGUAGE plpgsql;

-- Function to get user's subscriptions
CREATE OR REPLACE FUNCTION public.get_user_subscriptions(p_user_id UUID)
RETURNS TABLE (
  resource TEXT,
  plan_name TEXT,
  subscribed_on TIMESTAMP WITH TIME ZONE,
  expires_on TIMESTAMP WITH TIME ZONE,
  allowed_start_date TIMESTAMP WITH TIME ZONE,
  config JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.resource,
    p.name AS plan_name,
    s.subscribed_on,
    s.expires_on,
    s.created_at AS allowed_start_date,
    s.config
  FROM subscriptions s
  JOIN plans p ON s.plan_id = p.id
  WHERE s.user_id = p_user_id
    AND s.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get available plans
CREATE OR REPLACE FUNCTION public.get_available_plans()
RETURNS TABLE (
  plan_id UUID,
  name TEXT,
  resources TEXT[],
  pricing JSONB,
  is_download_allowed BOOLEAN,
  max_team_members INTEGER,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS plan_id,
    p.name,
    p.datasets AS resources,
    p.pricing,
    p.download_allowed,
    p.max_team_members,
    p.is_active
  FROM plans p
  WHERE p.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to subscribe to a plan
CREATE OR REPLACE FUNCTION public.subscribe_to_plan(
  p_user_id UUID,
  p_plan_name TEXT,
  p_frequency subscription_frequency,
  p_resources TEXT[]
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  subscription_id UUID,
  plan_name TEXT,
  total_cost NUMERIC,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_plan RECORD;
  v_subscription_id UUID;
  v_total_cost NUMERIC;
  v_start_date TIMESTAMP WITH TIME ZONE;
  v_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get plan details
  SELECT * INTO v_plan FROM plans WHERE name = p_plan_name AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Plan not found', NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::TIMESTAMP WITH TIME ZONE, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Calculate cost based on frequency
  CASE p_frequency
    WHEN 'monthly' THEN v_total_cost := (v_plan.pricing->>'monthly')::NUMERIC;
    WHEN 'quarterly' THEN v_total_cost := (v_plan.pricing->>'quarterly')::NUMERIC;
    WHEN 'halfYearly' THEN v_total_cost := (v_plan.pricing->>'halfYearly')::NUMERIC;
    WHEN 'annual' THEN v_total_cost := (v_plan.pricing->>'annual')::NUMERIC;
  END CASE;
  
  -- Calculate subscription period
  v_start_date := NOW();
  CASE p_frequency
    WHEN 'monthly' THEN v_end_date := v_start_date + INTERVAL '1 month';
    WHEN 'quarterly' THEN v_end_date := v_start_date + INTERVAL '3 months';
    WHEN 'halfYearly' THEN v_end_date := v_start_date + INTERVAL '6 months';
    WHEN 'annual' THEN v_end_date := v_start_date + INTERVAL '1 year';
  END CASE;
  
  -- Create subscription record
  INSERT INTO subscriptions (user_id, plan_id, resource, subscribed_on, expires_on)
  SELECT 
    p_user_id, 
    v_plan.id, 
    unnest(COALESCE(p_resources, v_plan.datasets)), 
    v_start_date, 
    v_end_date
  RETURNING id INTO v_subscription_id;
  
  -- Return success response
  RETURN QUERY SELECT 
    TRUE AS success,
    'Subscription successful' AS message,
    v_subscription_id,
    p_plan_name AS plan_name,
    v_total_cost,
    v_start_date,
    v_end_date;
END;
$$ LANGUAGE plpgsql;

-- Insert default plans
INSERT INTO plans (name, type, datasets, pricing, features, download_allowed, max_team_members, is_active) 
VALUES 
  ('Trial', 'free', ARRAY['mna', 'fundraising', 'layoff'], 
   '{"monthly": 0, "quarterly": 0, "halfYearly": 0, "annual": 0}', 
   ARRAY['Limited access to datasets', 'Basic filters', 'Up to 100 records per request'], 
   FALSE, 1, TRUE),
  ('Essential', 'paid', ARRAY['mna', 'fundraising', 'layoff', 'data_security_breach'], 
   '{"monthly": 49, "quarterly": 147, "halfYearly": 245, "annual": 490}', 
   ARRAY['Full access to 4 datasets', 'Advanced filters', 'Unlimited records', 'Export capabilities'], 
   TRUE, 1, TRUE),
  ('Business', 'paid', ARRAY['mna', 'fundraising', 'layoff', 'data_security_breach', 'cxo_changes', 'business_expansion'], 
   '{"monthly": 99, "quarterly": 297, "halfYearly": 495, "annual": 990}', 
   ARRAY['Full access to all datasets', 'Custom alerts', 'Team collaboration', 'API access'], 
   TRUE, 5, TRUE),
  ('Business-Custom', 'paid', ARRAY['mna', 'fundraising', 'layoff', 'data_security_breach', 'cxo_changes', 'business_expansion'], 
   '{"monthly": 199, "quarterly": 597, "halfYearly": 995, "annual": 1990}', 
   ARRAY['All Business features', 'Custom data feeds', 'Priority support', 'Dedicated account manager'], 
   TRUE, 20, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Insert sample data for demonstration
-- Sample M&A data
INSERT INTO mna_data (announced_date, acquiring_company, acquired_company, deal_amount, currency, transaction_status)
VALUES 
  ('2023-06-15', '{"name": "TechCorp", "domain": "techcorp.com", "industry": "Software"}', 
   '{"name": "StartupX", "domain": "startupx.com", "industry": "AI"}', 
   150000000, 'USD', 'completed'),
  ('2023-07-22', '{"name": "Global Finance Inc", "domain": "globalfinance.com", "industry": "Financial Services"}', 
   '{"name": "Fintech Solutions", "domain": "fintechsol.com", "industry": "FinTech"}', 
   75000000, 'USD', 'announced')
ON CONFLICT DO NOTHING;

-- Sample Fundraising data
INSERT INTO fundraising_data (funding_date, company, round_type, amount_raised, valuation, currency, investors)
VALUES 
  ('2023-08-10', '{"name": "GreenEnergy Tech", "domain": "greenenergytech.com", "industry": "Clean Energy"}', 
   'series_b', 45000000, 200000000, 'USD', ARRAY['Clean Energy Ventures', 'Future Fund']),
  ('2023-09-05', '{"name": "HealthAI", "domain": "healthai.com", "industry": "Healthcare"}', 
   'series_a', 25000000, 100000000, 'USD', ARRAY['Health Innovations VC', 'MedTech Partners'])
ON CONFLICT DO NOTHING;

-- Sample Layoff data
INSERT INTO layoff_data (layoff_date, company, layoff_count, layoff_percentage, layoff_type, reason)
VALUES 
  ('2023-10-15', '{"name": "Retail Giant", "domain": "retailgiant.com", "industry": "Retail"}', 
   1200, 15.5, 'large_scale', 'Restructuring due to economic conditions'),
  ('2023-11-02', '{"name": "Media Corp", "domain": "mediacorp.com", "industry": "Media"}', 
   350, 8.2, 'department_cut', 'Shift to digital focus')
ON CONFLICT DO NOTHING;

-- Sample Security Breach data
INSERT INTO data_security_breach_data (breach_date, notice_date, company, incident_type, people_impacted, severity_level, data_type)
VALUES 
  ('2023-09-20', '2023-09-25', '{"name": "DataSecure Inc", "domain": "datasecure.com", "industry": "Cybersecurity"}', 
   'data_breach', 150000, 'high', ARRAY['personal_info', 'financial_data']),
  ('2023-10-10', '2023-10-12', '{"name": "Cloud Services Ltd", "domain": "cloudservices.com", "industry": "Cloud Computing"}', 
   'ransomware', 50000, 'medium', ARRAY['customer_records'])
ON CONFLICT DO NOTHING;

-- Sample CXO Changes data
INSERT INTO cxo_changes_data (change_date, executive_name, company, new_title, change_type, title_category)
VALUES 
  ('2023-11-01', 'Sarah Johnson', '{"name": "InnovateTech", "domain": "innovatetech.com", "industry": "Technology"}', 
   'Chief Technology Officer', 'appointment', 'technology'),
  ('2023-11-15', 'Michael Chen', '{"name": "FinanceFirst", "domain": "financefirst.com", "industry": "Financial Services"}', 
   'Chief Financial Officer', 'departure', 'finance')
ON CONFLICT DO NOTHING;

-- Sample Business Expansion data
INSERT INTO business_expansion_data (expansion_date, company, expansion_type, location, investment, jobs_created, market_entry)
VALUES 
  ('2023-12-01', '{"name": "Global Retail", "domain": "globalretail.com", "industry": "Retail"}', 
   'new_location', 'Berlin, Germany', 5000000, 200, ARRAY['europe']),
  ('2023-12-15', '{"name": "FoodChain", "domain": "foodchain.com", "industry": "Food & Beverage"}', 
   'market_entry', 'Singapore', 10000000, 500, ARRAY['asia_pacific'])
ON CONFLICT DO NOTHING;
