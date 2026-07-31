import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: ws } = await supabase.from('workspaces').select('id, name').order('created_at', { ascending: false }).limit(2);
  for (const w of ws) {
    console.log('Workspace:', w.name, w.id);
    const { data: members } = await supabase.from('workspace_members').select('*, users(email)').eq('workspace_id', w.id);
    console.log('Members:', JSON.stringify(members, null, 2));
  }
}
run();
