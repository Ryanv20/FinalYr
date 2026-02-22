import { Hono } from 'hono';
import { z } from 'zod';
import { supabase } from '../supabase.js';

const authRoutes = new Hono();

// Schemas for validation
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['eoc', 'pho', 'institution', 'civilian']).default('civilian'),
    // Optional depending on role
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    organizationId: z.string().optional()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

authRoutes.post('/register', async (c) => {
    try {
        const body = await c.req.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return c.json({ error: 'Validation failed', details: result.error.format() }, 400);
        }

        const { email, password, role, firstName, lastName, organizationId } = result.data;

        // Supabase auth user creation
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                role,
                firstName,
                lastName,
                organizationId
            }
        });

        if (authError) {
            return c.json({ error: authError.message }, 400);
        }

        // Usually you would also insert into a "users" profile table
        const { error: dbError } = await supabase.from('profiles').insert([
            {
                id: authData.user.id,
                email,
                role,
                first_name: firstName,
                last_name: lastName,
                organization_id: organizationId
            }
        ]);

        // Handle case where profile table doesn't exist yet, we will log it but continue
        if (dbError) {
            console.error('Error inserting profile (maybe table does not exist yet):', dbError.message);
            // Not failing the request, as auth user was created.
        }

        return c.json({
            message: 'User registered successfully',
            user: {
                id: authData.user.id,
                email: authData.user.email,
                role
            }
        }, 201);
    } catch (error: any) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

authRoutes.post('/login', async (c) => {
    try {
        const body = await c.req.json();
        const result = loginSchema.safeParse(body);

        if (!result.success) {
            return c.json({ error: 'Validation failed', details: result.error.format() }, 400);
        }

        const { email, password } = result.data;

        // Login using Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return c.json({ error: error.message }, 401);
        }

        return c.json({
            message: 'Logged in successfully',
            session: data.session,
            user: data.user
        }, 200);

    } catch (error: any) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

export default authRoutes;
