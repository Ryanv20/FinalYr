import { supabase } from '../../supabase.js';

export class ReportsRepository {
    async insertSentinelReport(reportData: any) {
        return await supabase.from('sentinel_reports').insert([reportData]).select().single();
    }

    async getRecentReportCount(organizationId: string, sinceDate: string) {
        return await supabase
            .from('sentinel_reports')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
            .gte('created_at', sinceDate);
    }

    async insertAiAlert(alertData: any) {
        return await supabase.from('ai_alerts').insert([alertData]);
    }

    async getReportsFeed(organizationId: string) {
        return await supabase
            .from('sentinel_reports')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });
    }
}
