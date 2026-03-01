import { AlertsRepository } from './alerts.repository.js';
import { z } from 'zod';

export const statusSchema = z.object({
    status: z.enum(['probable', 'confirmed', 'invalidated'])
});

export class AlertsService {
    constructor(private alertsRepository: AlertsRepository) { }

    async getInbox(user: any) {
        const { data, error } = await this.alertsRepository.getPhoInbox(user.organizationId);
        if (error) throw new Error(`Database Error: ${error.message}`);
        return data;
    }

    async claimAlert(alertId: string, user: any) {
        const { data, error } = await this.alertsRepository.claimAlert(alertId, user.id);
        if (error || !data) throw new Error(`Database Error: ${error?.message || 'Failed to claim alert'}`);
        return data;
    }

    async updateStatus(alertId: string, user: any, body: any) {
        const result = statusSchema.safeParse(body);
        if (!result.success) {
            throw new Error(`Validation failed: ${JSON.stringify(result.error.format())}`);
        }

        const { data, error } = await this.alertsRepository.updateAlertStatus(alertId, user.id, result.data.status);
        if (error || !data) throw new Error(`Database Error: ${error?.message || 'Failed to update alert or unauthorized'}`);
        return { status: result.data.status, data };
    }

    async broadcastAlert(user: any) {
        // Validation and trigger would go here
        return { message: 'Broadcast initiated successfully' };
    }

    async escalateAlert(alertId: string) {
        return { message: 'Alert escalated to EOC for rapid response', escaltionId: 'esc-123' };
    }

    async getLocalAlerts(lat: string, lng: string) {
        if (!lat || !lng) {
            throw new Error('Validation failed: Missing coordinates');
        }
        // Spatial query simulation
        return [];
    }

    async getNationalTrends() {
        return {
            totalCases: 1543,
            hotspots: ['Zone A', 'Zone D'],
            articles: []
        };
    }
}
