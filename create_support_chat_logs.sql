-- Create support_chat_logs table for tracking AI chatbot queries and support analytics
CREATE TABLE IF NOT EXISTS support_chat_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    escalated BOOLEAN DEFAULT FALSE,
    rating TEXT CHECK (rating IN ('helpful', 'unhelpful', null))
);

-- Enable RLS
ALTER TABLE support_chat_logs ENABLE ROW LEVEL SECURITY;

-- Service role / admin access policy
CREATE POLICY "Admins can view support_chat_logs"
    ON support_chat_logs
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Allow service role inserts
CREATE POLICY "Service role can insert support_chat_logs"
    ON support_chat_logs
    FOR INSERT
    WITH CHECK (true);

-- Index for analytics and filtering
CREATE INDEX IF NOT EXISTS idx_support_chat_logs_created_at ON support_chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_chat_logs_escalated ON support_chat_logs(escalated);

