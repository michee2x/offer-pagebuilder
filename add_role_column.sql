-- The public users table should never store passwords (Supabase Auth handles that).
-- Make the column nullable so admin user creation doesn't crash.
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Optionally set a default so existing queries don't break
ALTER TABLE users ALTER COLUMN password SET DEFAULT NULL;

-- Also add role column if you haven't run the previous migration yet
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';
UPDATE users SET role = 'admin' WHERE is_admin = true;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
