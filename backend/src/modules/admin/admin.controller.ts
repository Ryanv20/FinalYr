import { Hono } from 'hono';
import { AdminService } from './admin.service.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export function createAdminController(adminService: AdminService) {
    const router = new Hono();

    router.use('/*', requireAuth, requireRole(['eoc']));

    const handleCatch = (c: any, error: any) => {
        if (error.message.includes('Validation failed')) {
            return c.json({ error: 'Validation failed', details: error.message }, 400);
        }
        return c.json({ error: 'Internal Server Error', details: error.message }, 500);
    };

    router.patch('/facilities/:id/status', async (c) => {
        try {
            const facilityId = c.req.param('id');
            const body = await c.req.json();
            const { status, facility } = await adminService.updateFacilityStatus(facilityId, body);
            return c.json({ message: `Facility ${status} successfully`, facility }, 200);
        } catch (error: any) {
            return handleCatch(c, error);
        }
    });

    router.post('/phos', async (c) => {
        try {
            const body = await c.req.json();
            const result = await adminService.appointPho(body);
            return c.json({ message: 'PHO appointed successfully', ...result }, 200);
        } catch (error: any) {
            return handleCatch(c, error);
        }
    });

    router.post('/protocols', async (c) => {
        try {
            const body = await c.req.json();
            const protocol = await adminService.addProtocol(body);
            return c.json({ message: 'Protocol added', protocol }, 201);
        } catch (error: any) {
            return handleCatch(c, error);
        }
    });

    router.post('/alerts/:id/override', async (c) => {
        try {
            const alertId = c.req.param('id');
            const user = c.get('user');
            const alert = await adminService.overrideAlert(alertId, user);
            return c.json({ message: 'AI Alert overridden', alert }, 200);
        } catch (error: any) {
            return handleCatch(c, error);
        }
    });

    router.post('/facilities/:id/blacklist', async (c) => {
        try {
            const facilityId = c.req.param('id');
            const body = await c.req.json();
            const facility = await adminService.blacklistFacility(facilityId, body);
            return c.json({ message: 'Facility blacklisted', facility }, 200);
        } catch (error: any) {
            return handleCatch(c, error);
        }
    });

    router.post('/phos/:id/revoke_broadcast', async (c) => {
        try {
            const phoId = c.req.param('id');
            const pho = await adminService.revokePhoBroadcast(phoId);
            return c.json({ message: 'Broadcast rights revoked', pho }, 200);
        } catch (error: any) {
            return handleCatch(c, error);
        }
    });

    return router;
}
