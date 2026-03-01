import { AlertsService } from '../alerts.service.js';
import { AlertsRepository } from '../alerts.repository.js';
import { describe, it, beforeEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('AlertsService', () => {
    let service: AlertsService;
    let mockRepo: any;

    beforeEach(() => {
        mockRepo = {
            getPhoInbox: async () => ({}),
            claimAlert: async () => ({}),
            updateAlertStatus: async () => ({})
        };
        service = new AlertsService(mockRepo as unknown as AlertsRepository);
    });

    it('should claim alert successfully', async () => {
        mockRepo.claimAlert = async () => ({
            data: { id: 'alert-1', status: 'investigating' },
            error: null
        });

        const result = await service.claimAlert('alert-1', { id: 'user-1' });
        assert.equal(result.status, 'investigating');
    });

    it('should update status successfully on valid role permission', async () => {
        mockRepo.updateAlertStatus = async () => ({
            data: { id: 'alert-1', status: 'confirmed' },
            error: null
        });

        const result = await service.updateStatus('alert-1', { id: 'user-1' }, { status: 'confirmed' });
        assert.equal(result.data.status, 'confirmed');
    });

    it('should fail update status on invalid payload', async () => {
        await assert.rejects(
            async () => {
                await service.updateStatus('alert-1', { id: 'user-1' }, { status: 'unknown' });
            },
            /Validation failed/
        );
    });

    it('should throw error when local coordinates missing', async () => {
        await assert.rejects(
            async () => {
                await service.getLocalAlerts('', '');
            },
            /Validation failed: Missing coordinates/
        );
    });
});
