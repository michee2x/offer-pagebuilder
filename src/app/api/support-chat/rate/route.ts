import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  try {
    const { logId, rating } = await req.json();

    if (!rating || (rating !== 'helpful' && rating !== 'unhelpful')) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (logId) {
      await supabase
        .from('support_chat_logs')
        .update({ rating })
        .eq('id', logId);
    } else {
      // If no logId, update the latest row created recently
      const { data: latest } = await supabase
        .from('support_chat_logs')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latest) {
        await supabase
          .from('support_chat_logs')
          .update({ rating })
          .eq('id', latest.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[support-chat rate] error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

