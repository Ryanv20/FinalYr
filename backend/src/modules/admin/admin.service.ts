import { AdminRepository } from './admin.repository.js';

export class AdminService {
    constructor(private adminRepository: AdminRepository) { }

    async updateFacilityStatus(facilityId: string, body: any) {
        const { status } = body;
        if (!status) throw new Error('Validation failed: Missing status');

        const { data, error } = await this.adminRepository.updateFacilityStatus(facilityId, status, {
            verified_at: new Date().toISOString()
        });

        if (error || !data) throw new Error(`Database Error: ${error?.message || 'Failed to update facility'}`);
        return { status, facility: data };
    }

    async appointPho(body: any) {
        const { userId, zoneId } = body;
        if (!userId || !zoneId) throw new Error('Validation failed: Missing userId or zoneId');

        const { data, error } = await this.adminRepository.updateProfile(userId, { role: 'pho', organization_id: zoneId });
        if (error) throw new Error(`Database Error: ${error.message}`);

        const authUpdate = await this.adminRepository.updateUserAuthMetadata(userId, { role: 'pho', organizationId: zoneId });
        if (authUpdate.error) throw new Error(`Auth Error: ${authUpdate.error.message}`);

        return { assigned_zone: zoneId };
    }

    async addProtocol(body: any) {
        const { title, content, diseaseId } = body;
        if (!title || !content || !diseaseId) throw new Error('Validation failed: Missing payload properties');

        const { data, error } = await this.adminRepository.addProtocol({ title, content, disease_id: diseaseId });
        if (error || !data) throw new Error(`Database Error: ${error?.message || 'Failed to add protocol'}`);
        return data;
    }

    async overrideAlert(alertId: string, user: any) {
        const { data, error } = await this.adminRepository.overrideAlert(alertId, user.id, 'AI False Positive Overridden by EOC');
        if (error || !data) throw new Error(`Database Error: ${error?.message || 'Failed to override alert'}`);
        return data;
    }

    async blacklistFacility(facilityId: string, body: any) {
        const { reason } = body;
        if (!reason) throw new Error('Validation failed: Missing reason');

        const { data, error } = await this.adminRepository.updateFacilityStatus(facilityId, 'blacklisted', { blacklist_reason: reason });
        if (error || !data) throw new Error(`Database Error: ${error?.message || 'Failed to blacklist facility'}`);
        return data;
    }

    async revokePhoBroadcast(phoId: string) {
        if (!phoId) throw new Error('Validation failed: Missing PHO ID');

        const { data, error } = await this.adminRepository.updateProfile(phoId, { can_broadcast: false });
        if (error || !data) throw new Error(`Database Error: ${error?.message || 'Failed to revoke broadcast'}`);
        return data;
    }
}
