import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeUsersAdmin() {
  console.log('Fetching users...');
  const { data: users, error: fetchError } = await supabase.from('users').select('*');
  
  if (fetchError) {
    console.error('Error fetching users:', fetchError);
    process.exit(1);
  }
  
  if (!users || users.length === 0) {
    console.log('No users found in the users table.');
    return;
  }
  
  console.log(`Found ${users.length} users. Setting role to 'admin'...`);
  
  for (const user of users) {
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id);
      
    if (updateError) {
      console.error(`Failed to update user ${user.id}:`, updateError);
    } else {
      console.log(`Successfully made user ${user.id} an admin.`);
    }
  }
}

makeUsersAdmin();
