import { getSession } from "@/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('plan')
      .eq('id', session.user.id)
      .single();

    const isUnlimited = user?.plan === 'unlimited';

    const { data: keys } = await supabaseAdmin
      .from('user_api_keys')
      .select('anthropic_key, openai_key')
      .eq('user_id', session.user.id)
      .single();

    return Response.json({
      anthropic_key: keys?.anthropic_key || "",
      openai_key: keys?.openai_key || "",
      is_unlimited: isUnlimited
    });
  } catch (err: any) {
    return Response.json({ error: "Failed to load keys" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { anthropic_key, openai_key } = body;

    // Check plan first
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('plan')
      .eq('id', session.user.id)
      .single();

    if (user?.plan !== 'unlimited') {
      return Response.json({ error: "You must be on the Unlimited plan to save custom API keys" }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('user_api_keys')
      .upsert({
        user_id: session.user.id,
        anthropic_key,
        openai_key,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) throw error;

    return Response.json({ success: true });
  } catch (err: any) {
    console.error('Save API Keys error:', err);
    return Response.json({ error: "Failed to save keys" }, { status: 500 });
  }
}
