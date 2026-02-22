import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'simple_test_' + Date.now() + '@example.com',
    password: 'Password123!',
    email_confirm: true
  });
  console.log('Result:', data, error);
}
test();