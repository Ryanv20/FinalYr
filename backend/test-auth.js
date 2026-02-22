import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test_direct@example.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { role: 'civilian' }
  });
  console.log(data, error);
}
test();
