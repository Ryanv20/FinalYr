import { supabase } from '../supabase.js';
export const requireAuth = async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized: Missing or invalid Authorization header' }, 401);
    }
    const token = authHeader.split(' ')[1];
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        return c.json({ error: 'Unauthorized: Invalid token' }, 401);
    }
    // Get user profile to get role. Alternatively, role can be extracted from user_metadata
    const role = user.user_metadata?.role || 'civilian';
    const organizationId = user.user_metadata?.organizationId;
    c.set('user', {
        id: user.id,
        email: user.email,
        role: role,
        organizationId
    });
    await next();
};
export const requireRole = (allowedRoles) => {
    return async (c, next) => {
        const user = c.get('user');
        if (!user || !allowedRoles.includes(user.role)) {
            return c.json({ error: 'Forbidden: Insufficient permissions' }, 403);
        }
        await next();
    };
};
