import { ReportsService } from '../reports.service.js';
import { ReportsRepository } from '../reports.repository.js';
import { describe, it, beforeEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ReportsService', () => {
    let service: ReportsService;
    let mockRepo: any;
    let insertedAlerts: any[] = [];

    beforeEach(() => {
        insertedAlerts = [];
        mockRepo = {
            insertSentinelReport: async () => ({}),
            getRecentReportCount: async () => ({ count: 0, error: null }),
            insertAiAlert: async (data: any) => { insertedAlerts.push(data); },
            getReportsFeed: async () => ({})
        };
        service = new ReportsService(mockRepo as unknown as ReportsRepository);
    });

    it('should calculate alert for critical hemorrhage', async () => {
        mockRepo.insertSentinelReport = async () => ({
            data: { id: 'report-1' },
            error: null
        });

        await service.submitReport({ id: 'user-1', organizationId: 'org-1' }, {
            patientCount: 5,
            originLocation: { lat: 10, lng: 20 },
            symptomMatrix: ['fever', 'hemorrhage'],
            severity: 9
        });

        assert.equal(insertedAlerts.length, 1);
        assert.equal(insertedAlerts[0].cbs_score, 1.0);
        assert.equal(insertedAlerts[0].severity_index, 10);
        assert.equal(insertedAlerts[0].bypass_reason, 'CRITICAL_HEMORRHAGIC');
    });

    it('should throw validation error on invalid patient count', async () => {
        await assert.rejects(
            async () => {
                await service.submitReport({ id: 'user-1' }, {
                    patientCount: -5, // invalid
                    originLocation: { lat: 10, lng: 20 },
                    symptomMatrix: ['fever'],
                    severity: 9
                });
            },
            /Validation failed/
        );
    });

    it('should get feed data', async () => {
        mockRepo.getReportsFeed = async () => ({
            data: [{ id: '123' }],
            error: null
        });

        const result = await service.getFeed({ organizationId: 'org-1' });
        assert.deepEqual(result, [{ id: '123' }]);
    });
});
