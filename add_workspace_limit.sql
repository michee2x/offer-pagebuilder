-- Migration: add workspace_limit column to users table
-- Run this in Supabase SQL Editor
-- This lets admins override the workspace limit for free-plan users

ALTER TABLE users ADD COLUMN IF NOT EXISTS workspace_limit integer DEFAULT NULL;

-- NULL means "derive from plan" (1 for starter, 3 for growth, 30 for agency)
-- A set integer value means "admin override" (used for free plan users)
