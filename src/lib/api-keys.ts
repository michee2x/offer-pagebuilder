import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type ResolvedApiKeys = {
  anthropicKey: string;
  openaiKey: string;
  isBYOK: boolean;
};

export async function resolveApiKeys(userId: string | null | undefined): Promise<ResolvedApiKeys> {
  const defaultKeys = {
    anthropicKey: process.env.ANTHROPIC_API_KEY || '',
    openaiKey: process.env.OPENAI_API_KEY || '',
    isBYOK: false,
  };

  if (!userId) return defaultKeys;

  try {
    // 1. Check if user is on unlimited plan
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('plan')
      .eq('id', userId)
      .single();

    if (user?.plan === 'unlimited') {
      // 2. Fetch their custom keys
      const { data: customKeys } = await supabaseAdmin
        .from('user_api_keys')
        .select('anthropic_key, openai_key')
        .eq('user_id', userId)
        .single();

      if (customKeys) {
        return {
          anthropicKey: customKeys.anthropic_key || defaultKeys.anthropicKey,
          openaiKey: customKeys.openai_key || defaultKeys.openaiKey,
          isBYOK: true,
        };
      }
    }
  } catch (error) {
    console.error('[resolveApiKeys] Error:', error);
  }

  return defaultKeys;
}
