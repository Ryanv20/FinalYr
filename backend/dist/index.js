import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import reportsRoutes from './routes/reports.js';
import alertsRoutes from './routes/alerts.js';
import adminRoutes from './routes/admin.js';
dotenv.config();
const app = new Hono();
app.use('*', logger());
app.use('*', cors());
// Basic health check route
app.get('/', (c) => c.json({ status: 'ok', message: 'MERMS API is running' }));
// Mount routes
app.route('/auth', authRoutes);
app.route('/reports', reportsRoutes);
app.route('/alerts', alertsRoutes);
app.route('/admin', adminRoutes);
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
console.log(`Server is running on port ${port}`);
serve({
    fetch: app.fetch,
    port
});
