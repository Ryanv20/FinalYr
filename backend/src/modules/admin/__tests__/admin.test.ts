import { AdminService } from '../admin.service.js';
import { AdminRepository } from '../admin.repository.js';
import { describe, it, beforeEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('AdminService', () => {
    let service: AdminService;
    let mockRepo: any;
    let calledUpdates: any[] = [];

    beforeEach(() => {
        calledUpdates = [];
        mockRepo = {
            updateFacilityStatus: async () => ({}),
            updateProfile: async (id: string, data: any) => {
                calledUpdates.push({ id, data, type: 'profile' });
                return { data: {}, error: null };
            },
            updateUserAuthMetadata: async (id: string, data: any) => {
                calledUpdates.push({ id, data, type: 'auth' });
                return { error: null };
            },
            addProtocol: async () => ({}),
            overrideAlert: async () => ({})
        };
        service = new AdminService(mockRepo as unknown as AdminRepository);
    });

    it('should appoint PHO successfully', async () => {
        const result = await service.appointPho({ userId: 'user-1', zoneId: 'zone-1' });
        assert.equal(result.assigned_zone, 'zone-1');

        const profileUpdate = calledUpdates.find(u => u.type === 'profile');
        assert.equal(profileUpdate.id, 'user-1');
        assert.equal(profileUpdate.data.role, 'pho');

        const authUpdate = calledUpdates.find(u => u.type === 'auth');
        assert.equal(authUpdate.id, 'user-1');
    });

    it('should throw validation failure on blacklist when reason missing', async () => {
        await assert.rejects(
            async () => {
                await service.blacklistFacility('fac-1', {});
            },
            /Validation failed/
        );
    });

    it('should override alert', async () => {
        mockRepo.overrideAlert = async () => ({
            data: { id: 'alert-1', status: 'invalidated' },
            error: null
        });

        const result = await service.overrideAlert('alert-1', { id: 'admin-1' });
        assert.equal(result.status, 'invalidated');
    });
});
