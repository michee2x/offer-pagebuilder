-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  domain text UNIQUE,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create workspace_members table
CREATE TABLE IF NOT EXISTS workspace_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(workspace_id, user_id)
);

-- Add workspace_id to builder_pages
ALTER TABLE builder_pages
ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_builder_pages_workspace_id ON builder_pages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for workspaces
CREATE POLICY "Users can view workspaces they are members of" ON workspaces
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace owners and admins can update workspaces" ON workspaces
  FOR UPDATE USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Only owners can delete workspaces" ON workspaces
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS policies for workspace_members
CREATE POLICY "Users can view workspace members for workspaces they are in" ON workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND (
        workspaces.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = workspace_members.workspace_id
          AND wm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Workspace owners and admins can manage members" ON workspace_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND (
        workspaces.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = workspace_members.workspace_id
          AND wm.user_id = auth.uid()
          AND wm.role IN ('owner', 'admin')
        )
      )
    )
  );

-- Update existing builder_pages to have a default workspace
-- This will be handled in the application logic