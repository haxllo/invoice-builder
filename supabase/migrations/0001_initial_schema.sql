-- supabase/migrations/0001_initial_schema.sql

-- CLEANUP: Drop existing tables and objects to ensure a fresh start with snake_case columns
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS invoice_payments CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS currencies CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Settings table
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  language TEXT NOT NULL DEFAULT 'en',
  amount_format TEXT NOT NULL DEFAULT 'en-US',
  date_format TEXT NOT NULL DEFAULT 'MM/dd/yyyy',
  is_dark_mode INTEGER NOT NULL DEFAULT 1 CHECK (is_dark_mode IN (0,1)),
  invoice_prefix TEXT,
  invoice_suffix TEXT,
  should_include_year INTEGER NOT NULL DEFAULT 1 CHECK (should_include_year IN (0,1)),
  should_include_month INTEGER NOT NULL DEFAULT 1 CHECK (should_include_month IN (0,1)),
  should_include_business_name INTEGER NOT NULL DEFAULT 1 CHECK (should_include_business_name IN (0,1)),
  quotes_on INTEGER NOT NULL DEFAULT 1 CHECK (quotes_on IN (0,1)),
  reports_on INTEGER NOT NULL DEFAULT 1 CHECK (reports_on IN (0,1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT (now())
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view and modify their own settings"
ON settings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to create initial settings for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.settings (user_id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create settings when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Businesses table
CREATE TABLE businesses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL CHECK (length(short_name) <= 2),
  address TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  additional TEXT,
  payment_information TEXT,
  logo TEXT,
  file_size INTEGER,
  file_type TEXT,
  file_name TEXT,
  description TEXT,
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0,1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT (now())
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view and modify their own businesses"
ON businesses
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Clients table
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL CHECK (length(short_name) <= 2),
  address TEXT,
  email TEXT,
  phone TEXT,
  code TEXT,
  additional TEXT,
  description TEXT,
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0,1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT (now())
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view and modify their own clients"
ON clients
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- Units table (public)
CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0,1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT (now())
);

-- Categories table (public)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0,1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT (now())
);

-- Currencies table (public)
CREATE TABLE currencies (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  symbol TEXT NOT NULL,
  text TEXT NOT NULL,
  format TEXT NOT NULL,
  subunit INTEGER NOT NULL DEFAULT 100,
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0,1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT (now())
);

-- Items table
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  amount TEXT NOT NULL DEFAULT '0',
  unit_id INTEGER REFERENCES units(id),
  category_id INTEGER REFERENCES categories(id),
  description TEXT,
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0,1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT (now())
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view and modify their own items"
ON items
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Invoices table
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  invoice_type TEXT NOT NULL CHECK(invoice_type IN ('quotation','invoice')),
  converted_from_quotation_id INTEGER NULL REFERENCES invoices(id),
  business_id INTEGER REFERENCES businesses(id),
  client_id INTEGER REFERENCES clients(id),
  currency_id INTEGER REFERENCES currencies(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT (now()),
  issued_at TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ,
  invoice_number TEXT NOT NULL,
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0,1)),
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','open','closed','partially','paid')),
  customer_notes TEXT,
  thanks_notes TEXT,
  terms_condition_notes TEXT,
  discount_name TEXT,
  business_name_snapshot TEXT NOT NULL,
  business_short_name_snapshot TEXT NOT NULL CHECK (length(business_short_name_snapshot) <= 2),
  business_address_snapshot TEXT,
  business_role_snapshot TEXT,
  business_email_snapshot TEXT,
  business_phone_snapshot TEXT,
  business_additional_snapshot TEXT,
  business_payment_information_snapshot TEXT,
  business_logo_snapshot TEXT,
  business_file_size_snapshot INTEGER,
  business_file_type_snapshot TEXT,
  business_file_name_snapshot TEXT,
  client_name_snapshot TEXT NOT NULL,
  client_address_snapshot TEXT,
  client_email_snapshot TEXT,
  client_phone_snapshot TEXT,
  client_code_snapshot TEXT,
  client_additional_snapshot TEXT,
  currency_code_snapshot TEXT NOT NULL,
  currency_symbol_snapshot TEXT NOT NULL,
  currency_subunit_snapshot INTEGER NOT NULL,
  discount_type TEXT CHECK(discount_type IN ('fixed','percentage') OR discount_type IS NULL),
  discount_amount_cents INTEGER NOT NULL DEFAULT 0,
  discount_percent REAL NOT NULL DEFAULT 0,
  shipping_fee_cents INTEGER NOT NULL DEFAULT 0,
  invoice_prefix_snapshot TEXT,
  invoice_suffix_snapshot TEXT,
  customization_color TEXT NOT NULL DEFAULT '#006400',
  customization_logo_size TEXT NOT NULL DEFAULT 'medium',
  customization_font_size_size TEXT NOT NULL DEFAULT 'medium',
  customization_layout TEXT NOT NULL DEFAULT 'classic',
  customization_table_header_style TEXT NOT NULL DEFAULT 'light',
  customization_table_row_style TEXT NOT NULL DEFAULT 'classic',
  customization_page_format TEXT NOT NULL DEFAULT 'A4',
  customization_label_upper_case INTEGER NOT NULL DEFAULT 0 CHECK (customization_label_upper_case IN (0,1)),
  customization_watermark_file_name TEXT,
  customization_watermark_file_type TEXT,            
  customization_watermark_file_size INTEGER,        
  customization_watermark_file_data TEXT,         
  customization_paid_watermark_file_name TEXT,
  customization_paid_watermark_file_type TEXT,            
  customization_paid_watermark_file_size INTEGER,        
  customization_paid_watermark_file_data TEXT,      
  tax_name TEXT,              
  tax_rate REAL NOT NULL DEFAULT 0,           
  tax_type TEXT CHECK(tax_type IN ('exclusive','inclusive','deducted') OR tax_type IS NULL),
  UNIQUE (business_id, invoice_number),
  CHECK (due_date IS NULL OR due_date >= issued_at),
  CHECK (converted_from_quotation_id IS NULL OR converted_from_quotation_id != id)
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view and modify their own invoices"
ON invoices
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Invoice items table
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    parent_invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id),
    item_name_snapshot TEXT NOT NULL,
    unit_price_cents_snapshot INTEGER NOT NULL DEFAULT (0), 
    unit_name_snapshot TEXT,
    quantity REAL NOT NULL DEFAULT 0,
    tax_rate REAL NOT NULL DEFAULT 0,
    tax_type TEXT CHECK(tax_type IN ('exclusive','inclusive') OR tax_type IS NULL),
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (now())
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage invoice items if they own the invoice"
ON invoice_items
FOR ALL
USING (auth.uid() = (SELECT user_id FROM invoices WHERE id = parent_invoice_id));


-- Invoice payments table
CREATE TABLE invoice_payments (
    id SERIAL PRIMARY KEY,
    parent_invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT (now()),
    payment_method TEXT NOT NULL,           
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (now())
);

ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage invoice payments if they own the invoice"
ON invoice_payments
FOR ALL
USING (auth.uid() = (SELECT user_id FROM invoices WHERE id = parent_invoice_id));


-- Attachments table
CREATE TABLE attachments (
  id SERIAL PRIMARY KEY,
  parent_invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,            
  file_size INTEGER NOT NULL,        
  data TEXT NOT NULL,              
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT (now())
);

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage attachments if they own the invoice"
ON attachments
FOR ALL
USING (auth.uid() = (SELECT user_id FROM invoices WHERE id = parent_invoice_id));

-- Seed data
INSERT INTO currencies (code, symbol, text, format, subunit)
VALUES
  ('USD', '$', 'United States Dollar', '{symbol}{amount}', 100),
  ('EUR', '€', 'Euro', '{symbol}{amount}', 100),
  ('SEK', 'kr', 'Swedish Krona', '{symbol} {amount}', 100),
  ('GBP', '£', 'British Pound', '{symbol}{amount}', 100),
  ('JPY', '¥', 'Japanese Yen', '{symbol}{amount}', 1),
  ('AUD', 'A$', 'Australian Dollar', '{symbol}{amount}', 100),
  ('CAD', 'CA$', 'Canadian Dollar', '{symbol}{amount}', 100),
  ('CHF', 'CHF', 'Swiss Franc', '{symbol} {amount}', 100),
  ('CNY', '¥', 'Chinese Yuan', '{symbol}{amount}', 100),
  ('INR', '₹', 'Indian Rupee', '{symbol}{amount}', 100);

INSERT INTO units (name)
VALUES
  ('pcs'),
  ('kgs'),
  ('gs'),
  ('lbs'),
  ('ozs'),
  ('ls'),
  ('mls'),
  ('ms'),
  ('cms'),
  ('fts'),
  ('hrs'),
  ('mins'),
  ('secs');

INSERT INTO categories (name)
VALUES
  ('Goods'),
  ('Services');
