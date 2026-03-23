-- Doby database schema
-- Single-user home management system

-- Property & finances
CREATE TABLE IF NOT EXISTS property (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT DEFAULT '',
  purchase_price NUMERIC DEFAULT 0,
  offer_date TEXT DEFAULT '',
  closing_date TEXT DEFAULT '',
  closing_costs NUMERIC DEFAULT 0,
  seller_concessions NUMERIC DEFAULT 0,
  square_feet NUMERIC DEFAULT 0,
  year_built INTEGER DEFAULT 0,
  lot_size TEXT DEFAULT '',
  hoa_monthly NUMERIC DEFAULT 0,
  home_image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mortgage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_amount NUMERIC DEFAULT 0,
  down_payment NUMERIC DEFAULT 0,
  interest_rate NUMERIC DEFAULT 0,
  term_years INTEGER DEFAULT 30,
  start_date TEXT DEFAULT '',
  property_tax_annual NUMERIC DEFAULT 0,
  home_insurance_annual NUMERIC DEFAULT 0,
  pmi NUMERIC DEFAULT 0,
  loan_program TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appreciation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annual_rate NUMERIC DEFAULT 3.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_number TEXT DEFAULT '',
  provider TEXT DEFAULT '',
  agent_name TEXT DEFAULT '',
  agent_phone TEXT DEFAULT '',
  agent_email TEXT DEFAULT '',
  coverage_amount NUMERIC DEFAULT 0,
  deductible NUMERIC DEFAULT 0,
  renewal_date TEXT DEFAULT '',
  premium_annual NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'home',
  color TEXT DEFAULT '#3083DC',
  floor TEXT DEFAULT 'Main',
  width_ft INTEGER DEFAULT 0,
  width_in INTEGER DEFAULT 0,
  height_ft INTEGER DEFAULT 0,
  height_in INTEGER DEFAULT 0,
  plan_x NUMERIC DEFAULT 0,
  plan_y NUMERIC DEFAULT 0,
  materials JSONB DEFAULT '{}',
  system_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cost NUMERIC DEFAULT 0,
  purchase_date TEXT DEFAULT '',
  condition TEXT DEFAULT 'unknown',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  url TEXT DEFAULT '',
  priority TEXT DEFAULT 'medium',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Systems
CREATE TABLE IF NOT EXISTS systems (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'settings-2',
  category TEXT DEFAULT 'hvac',
  install_date TEXT DEFAULT '',
  last_service_date TEXT DEFAULT '',
  next_service_date TEXT DEFAULT '',
  warranty_expiration TEXT DEFAULT '',
  estimated_life_years INTEGER DEFAULT 15,
  estimated_replace_cost NUMERIC DEFAULT 0,
  condition TEXT DEFAULT 'unknown',
  notes TEXT DEFAULT '',
  filter_size TEXT,
  filter_change_interval_months INTEGER,
  provider TEXT,
  monthly_payment NUMERIC,
  account_number TEXT,
  brand TEXT,
  model_number TEXT,
  serial_number TEXT,
  amperage INTEGER,
  capacity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'Other',
  amount NUMERIC DEFAULT 0,
  date TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Utilities
CREATE TABLE IF NOT EXISTS utilities (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  date TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'planned',
  budget NUMERIC DEFAULT 0,
  actual_spend NUMERIC DEFAULT 0,
  contractor_id UUID,
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  permit_number TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seasonal tasks
CREATE TABLE IF NOT EXISTS seasonal_tasks (
  key TEXT PRIMARY KEY,
  completed BOOLEAN DEFAULT FALSE
);

-- Custom tasks
CREATE TABLE IF NOT EXISTS custom_tasks (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT DEFAULT 'Whole home',
  due_date TEXT DEFAULT '',
  priority TEXT DEFAULT 'medium',
  completed BOOLEAN DEFAULT FALSE,
  completed_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency info
CREATE TABLE IF NOT EXISTS emergency_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  water_main_location TEXT DEFAULT '',
  gas_shutoff_location TEXT DEFAULT '',
  breaker_panel_location TEXT DEFAULT '',
  sewer_cleanout_location TEXT DEFAULT '',
  security_code TEXT DEFAULT '',
  wifi_password TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contractors
CREATE TABLE IF NOT EXISTS contractors (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'General',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  rating INTEGER DEFAULT 0,
  last_used_date TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Other',
  date TEXT DEFAULT '',
  location TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
