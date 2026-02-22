import { Hono } from 'hono';
import { z } from 'zod';
import { supabase } from '../supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const alertsRoutes = new Hono();

// All routes require authentication
alertsRoutes.use('/*', requireAuth);

// ----------------- PHO Level 2 Features -----------------

// Receives an AI-ranked alert inbox sorted by Confidence-Based Score
alertsRoutes.get('/inbox', requireRole(['pho']), async (c) => {
    try {
        const user = c.get('user');

        // Fetch pending alerts sorted by CBS descending (assigned to current PHO's zone)
        // Assume alerts are stored in a table like `ai_alerts`
        const { data: alerts, error } = await supabase
            .from('ai_alerts')
            .select('*, sentinel_reports(patient_count, symptom_matrix)')
            .eq('zone_id', user.organizationId) // Assuming orgId acts as zoneId for PHO
            .order('cbs_score', { ascending: false });

        if (error) {
            return c.json({ error: error.message }, 500);
        }

        return c.json({ inbox: alerts }, 200);

    } catch (error: any) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// Claims alerts for investigation
alertsRoutes.post('/:id/claim', requireRole(['pho']), async (c) => {
    try {
        const alertId = c.req.param('id');
        const user = c.get('user');

        // Update alert status and assign to current PHO
        const { data, error } = await supabase
            .from('ai_alerts')
            .update({
                status: 'investigating',
                investigated_by: user.id,
                investigated_at: new Date().toISOString()
            })
            .eq('id', alertId)
            .select().single();

        if (error) {
            return c.json({ error: error.message }, 500);
        }

        return c.json({ message: 'Alert claimed', alert: data }, 200);

    } catch (error: any) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// Promotes status (Probable -> Confirmed)
const statusSchema = z.object({
    status: z.enum(['probable', 'confirmed', 'invalidated'])
});

alertsRoutes.patch('/:id/status', requireRole(['pho']), async (c) => {
    try {
        const alertId = c.req.param('id');
        const user = c.get('user');
        const body = await c.req.json();
        const result = statusSchema.safeParse(body);

        if (!result.success) {
            return c.json({ error: 'Validation failed', details: result.error.format() }, 400);
        }

        // Update alert status
        const { data, error } = await supabase
            .from('ai_alerts')
            .update({
                status: result.data.status,
            })
            .eq('id', alertId)
            // Only the PHO who claimed it should probably be able to update it, or any PHO in the zone
            .eq('investigated_by', user.id)
            .select().single();

        if (error) {
            return c.json({ error: error.message }, 500);
        }

        return c.json({ message: `Alert status updated to ${result.data.status}`, alert: data }, 200);

    } catch (error: any) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// Broadcasts civilian alerts using pre-approved EOC templates
alertsRoutes.post('/broadcast', requireRole(['pho']), async (c) => {
    try {
        const user = c.get('user');
        // Validation would happen here
        // Verify template is EOC approved, and then trigger push/SMS via Upstash+Twilio

        return c.json({ message: 'Broadcast initiated successfully' }, 202);

    } catch (error: any) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// Escalate to EOC and dispatch rapid response
alertsRoutes.post('/:id/escalate', requireRole(['pho']), async (c) => {
    const alertId = c.req.param('id');
    // Trigger EOC escalation
    return c.json({ message: 'Alert escalated to EOC for rapid response', escaltionId: 'esc-123' }, 200);
});

// ----------------- Civilian Level 0 Features -----------------

// Gets hyper-local zone alerts (Residents)
alertsRoutes.get('/local', requireRole(['civilian']), async (c) => {
    try {
        const user = c.get('user');
        // Here we'd need the civilian's GPS coordinates or pre-registered zone (found in their profile)
        // For now we'll pretend they pass lat/lng in query params

        const lat = c.req.query('lat');
        const lng = c.req.query('lng');

        if (!lat || !lng) {
            return c.json({ error: 'Missing coordinates for local alerts' }, 400);
        }

        // PostGIS spatial query using Supabase RPC to find nearby alerts
        // const { data, error } = await supabase.rpc('get_nearby_alerts', { user_lat: lat, user_lon: lng, radius_km: 10 });

        // Mock response
        return c.json({ alerts: [] }, 200);

    } catch (error: any) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// Gets National trends (Guests + Residents) - Guest might not have auth so we may need to lift requireAuth off this
alertsRoutes.get('/national', async (c) => {
    // Publicly aggregatable data
    return c.json({
        trends: {
            totalCases: 1543,
            hotspots: ['Zone A', 'Zone D'],
            articles: []
        }
    }, 200);
});

export default alertsRoutes;
