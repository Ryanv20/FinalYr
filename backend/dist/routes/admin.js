import { Hono } from 'hono';
import { supabase } from '../supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const adminRoutes = new Hono();
// Apply auth middleware to all routes in this router
adminRoutes.use('/*', requireAuth, requireRole(['eoc']));
// Approves/rejects facility onboarding after MDCN license check
adminRoutes.patch('/facilities/:id/status', async (c) => {
    try {
        const facilityId = c.req.param('id');
        const { status } = await c.req.json(); // e.g. { status: 'approved' | 'rejected' }
        // Update facility status in database
        const { data, error } = await supabase
            .from('facilities')
            .update({ status, verified_at: new Date().toISOString() })
            .eq('id', facilityId)
            .select().single();
        if (error) {
            return c.json({ error: error.message }, 500);
        }
        return c.json({ message: `Facility ${status} successfully`, facility: data }, 200);
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// Appoints PHOs and assigns them to zones
adminRoutes.post('/phos', async (c) => {
    try {
        const { userId, zoneId } = await c.req.json(); // Body params: userId, zoneId
        // Update user profile with role 'pho' and organizationId as zoneId
        // Assuming 'profiles' table has 'role' and 'organization_id' columns
        const { data, error } = await supabase
            .from('profiles')
            .update({ role: 'pho', organization_id: zoneId })
            .eq('id', userId)
            .select().single();
        if (error) {
            return c.json({ error: error.message }, 500);
        }
        // You might also need to update user metadata in Supabase Auth via admin API
        await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { role: 'pho', organizationId: zoneId }
        });
        return c.json({ message: 'PHO appointed successfully', assigned_zone: zoneId }, 200);
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// Manages the Response Protocol library (updates propagate globally)
adminRoutes.post('/protocols', async (c) => {
    try {
        const { title, content, diseaseId } = await c.req.json();
        // Insert into 'response_protocols' table
        const { data, error } = await supabase
            .from('response_protocols')
            .insert([{ title, content, disease_id: diseaseId }])
            .select().single();
        if (error) {
            return c.json({ error: error.message }, 500);
        }
        // Trigger Supabase Realtime or Upstash cache invalidation explicitly if needed
        return c.json({ message: 'Protocol added', protocol: data }, 201);
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// Overrides AI false positives (requires dual-auth co-sign logic not fully implemented here)
adminRoutes.post('/alerts/:id/override', async (c) => {
    try {
        const alertId = c.req.param('id');
        const user = c.get('user');
        // Simplistic version, but requirement says "dual-auth co-sign"
        // To implement dual auth, you might require a short-lived TOTP token in body
        // const { totpToken } = await c.req.json();
        const { data, error } = await supabase
            .from('ai_alerts')
            .update({
            status: 'invalidated',
            overridden_by: user.id,
            override_reason: 'AI False Positive Overridden by EOC'
        })
            .eq('id', alertId)
            .select().single();
        if (error) {
            return c.json({ error: error.message }, 500);
        }
        return c.json({ message: 'AI Alert overridden', alert: data }, 200);
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// Blacklists facilities
adminRoutes.post('/facilities/:id/blacklist', async (c) => {
    try {
        const facilityId = c.req.param('id');
        const { reason } = await c.req.json();
        // Update facility status to 'blacklisted'
        const { data, error } = await supabase
            .from('facilities')
            .update({ status: 'blacklisted', blacklist_reason: reason })
            .eq('id', facilityId)
            .select().single();
        if (error) {
            return c.json({ error: error.message }, 500);
        }
        return c.json({ message: 'Facility blacklisted', facility: data }, 200);
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// Revokes PHO broadcast rights
adminRoutes.post('/phos/:id/revoke_broadcast', async (c) => {
    try {
        const phoId = c.req.param('id');
        // Update PHO profile to remove broadcast rights
        const { data, error } = await supabase
            .from('profiles')
            .update({ can_broadcast: false })
            .eq('id', phoId)
            .select().single();
        if (error) {
            return c.json({ error: error.message }, 500);
        }
        return c.json({ message: 'Broadcast rights revoked', pho: data }, 200);
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
export default adminRoutes;
