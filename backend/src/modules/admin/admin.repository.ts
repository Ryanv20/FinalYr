import { supabase } from '../../supabase.js';

export class AdminRepository {
    async updateFacilityStatus(facilityId: string, status: string, additionalProps = {}) {
        return await supabase
            .from('facilities')
            .update({ status, ...additionalProps })
            .eq('id', facilityId)
            .select().single();
    }

    async updateProfile(userId: string, data: any) {
        return await supabase
            .from('profiles')
            .update(data)
            .eq('id', userId)
            .select().single();
    }

    async updateUserAuthMetadata(userId: string, metadata: any) {
        return await supabase.auth.admin.updateUserById(userId, { user_metadata: metadata });
    }

    async addProtocol(data: any) {
        return await supabase
            .from('response_protocols')
            .insert([data])
            .select().single();
    }

    async overrideAlert(alertId: string, userId: string, overrideReason: string) {
        return await supabase
            .from('ai_alerts')
            .update({
                status: 'invalidated',
                overridden_by: userId,
                override_reason: overrideReason
            })
            .eq('id', alertId)
            .select().single();
    }
}
