-- Supabase Setup SQL for Surti Khaman Shop Management System
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Daily Sales Table
CREATE TABLE daily_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shops (from where owner buys materials)
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_number TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items (materials that can be purchased)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL, -- KG, Liter, etc.
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Purchases
CREATE TABLE material_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  purchase_time TIME NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_bill DECIMAL(10, 2) NOT NULL,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  remaining_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers (shops/owners who buy in bulk)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  contact_number TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products (items sold to customers)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bulk Sales
CREATE TABLE bulk_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL, -- in KG
  price_per_kg DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  remaining_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workers
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_number TEXT,
  per_day_salary DECIMAL(10, 2) NOT NULL DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worker Attendance
CREATE TABLE worker_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_present BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(worker_id, date)
);

-- Worker Advances
CREATE TABLE worker_advances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worker Salary Payments
CREATE TABLE worker_salary_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_daily_sales_date ON daily_sales(date);
CREATE INDEX idx_material_purchases_date ON material_purchases(date);
CREATE INDEX idx_material_purchases_shop ON material_purchases(shop_id);
CREATE INDEX idx_bulk_sales_date ON bulk_sales(date);
CREATE INDEX idx_bulk_sales_customer ON bulk_sales(customer_id);
CREATE INDEX idx_worker_attendance_date ON worker_attendance(date);
CREATE INDEX idx_worker_attendance_worker ON worker_attendance(worker_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_daily_sales_updated_at BEFORE UPDATE ON daily_sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_material_purchases_updated_at BEFORE UPDATE ON material_purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bulk_sales_updated_at BEFORE UPDATE ON bulk_sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default items
INSERT INTO items (name, unit, display_order) VALUES
  ('આટો (Flour)', 'KG', 1),
  ('તેલ (Oil)', 'Liter', 2),
  ('ઘી (Ghee)', 'Liter', 3),
  ('મરચાં (Chillies)', 'KG', 4),
  ('શાકભાજી (Vegetables)', 'KG', 5);

-- Insert default products
INSERT INTO products (name, display_order) VALUES
  ('સેવ-ખમણી (Sev-khamani)', 1),
  ('ખમણ (Khaman) - વાઘારેલા (Fried)', 2),
  ('ખમણ (Khaman) - સાદા (Plain)', 3),
  ('પાતરા (Patra)', 4),
  ('સમોસા (Samosa) - તળેલા (Fried)', 5),
  ('સમોસા (Samosa) - કાચા (Plain)', 6),
  ('ચાઇનીઝ સમોસા (Chinese Samosa) - તળેલા (Fried)', 7),
  ('ચાઇનીઝ સમોસા (Chinese Samosa) - કાચા (Plain)', 8);

