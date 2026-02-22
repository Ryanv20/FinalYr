import { Hono } from 'hono';
import { z } from 'zod';
import { supabase } from '../supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const reportsRoutes = new Hono();

// Validate request bodies
const reportSchema = z.object({
    patientCount: z.number().int().positive(),
    originLocation: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string().optional()
    }),
    symptomMatrix: z.array(z.string()).nonempty(),
    severity: z.number().min(1).max(10),
    notes: z.string().optional()
});

// Apply auth middleware to all routes in this router
reportsRoutes.use('/*', requireAuth);

// Submit a Sentinel Report (Institutions only)
reportsRoutes.post('/', requireRole(['institution']), async (c) => {
    try {
        const user = c.get('user');
        const body = await c.req.json();
        const result = reportSchema.safeParse(body);

        if (!result.success) {
            return c.json({ error: 'Validation failed', details: result.error.format() }, 400);
        }

        const { patientCount, originLocation, symptomMatrix, severity, notes } = result.data;

        // Create the sentinel report record in Supabase
        const { data, error } = await supabase.from('sentinel_reports').insert([
            {
                submitted_by: user.id,
                organization_id: user.organizationId,
                patient_count: patientCount,
                origin_lat: originLocation.lat,
                origin_lng: originLocation.lng,
                origin_address: originLocation.address,
                symptom_matrix: symptomMatrix,
                severity,
                notes,
                status: 'Pending AI', // Pending AI -> Under PHO Review -> Validated
                professional_id_hash: 'todo-generate-hash' // Placeholder, you should hash their ID
            }
        ]).select().single();

        if (error) {
            return c.json({ error: error.message }, 500);
        }

        // Optional: Trigger AI Engine processing here manually or via database webhook/trigger

        return c.json({ message: 'Sentinel Report submitted successfully', report: data }, 201);

    } catch (error: any) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// View own facility's submission feed
reportsRoutes.get('/feed', requireRole(['institution']), async (c) => {
    try {
        const user = c.get('user');

        // Fetch reports belonging to the user's organization
        const { data, error } = await supabase
            .from('sentinel_reports')
            .select('*')
            .eq('organization_id', user.organizationId)
            .order('created_at', { ascending: false });

        if (error) {
            return c.json({ error: error.message }, 500);
        }

        return c.json({ reports: data }, 200);

    } catch (error: any) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// Medical Director specific analytics endpoint (could require an extra role check like 'medical_director')
reportsRoutes.get('/analytics', requireRole(['institution']), async (c) => {
    const user = c.get('user');

    // Aggregate data using Supabase RPC or group queries
    // Placeholder response:
    return c.json({
        message: 'Analytics coming soon for medical directors',
        organizationId: user.organizationId
    }, 200);
});

export default reportsRoutes;
