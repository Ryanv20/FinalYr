import { supabase } from '../../supabase.js';

export class AlertsRepository {
    async getPhoInbox(zoneId: string) {
        return await supabase
            .from('ai_alerts')
            .select('*, sentinel_reports(patient_count, symptom_matrix)')
            .eq('zone_id', zoneId)
            .order('cbs_score', { ascending: false });
    }

    async claimAlert(alertId: string, userId: string) {
        return await supabase
            .from('ai_alerts')
            .update({
                status: 'investigating',
                investigated_by: userId,
                investigated_at: new Date().toISOString()
            })
            .eq('id', alertId)
            .select().single();
    }

    async updateAlertStatus(alertId: string, userId: string, status: string) {
        return await supabase
            .from('ai_alerts')
            .update({ status })
            .eq('id', alertId)
            .eq('investigated_by', userId)
            .select().single();
    }
}
