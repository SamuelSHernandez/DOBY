-- Add user_id to all data tables and enable RLS

-- Helper: add user_id column + RLS + policies for a table
-- We do each table explicitly for clarity.

-- property
ALTER TABLE property ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE property ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own property" ON property FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- mortgage
ALTER TABLE mortgage ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE mortgage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own mortgage" ON mortgage FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- appreciation
ALTER TABLE appreciation ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE appreciation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own appreciation" ON appreciation FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- insurance
ALTER TABLE insurance ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE insurance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own insurance" ON insurance FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- rooms
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own rooms" ON rooms FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- inventory_items
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own inventory" ON inventory_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- wishlist_items
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own wishlist" ON wishlist_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- systems
ALTER TABLE systems ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own systems" ON systems FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own expenses" ON expenses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- utilities
ALTER TABLE utilities ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE utilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own utilities" ON utilities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own projects" ON projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- seasonal_tasks
ALTER TABLE seasonal_tasks ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE seasonal_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own seasonal_tasks" ON seasonal_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- custom_tasks
ALTER TABLE custom_tasks ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE custom_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own custom_tasks" ON custom_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- emergency_info
ALTER TABLE emergency_info ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE emergency_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own emergency_info" ON emergency_info FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- contractors
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own contractors" ON contractors FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own documents" ON documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
