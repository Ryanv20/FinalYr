import { Hono } from 'hono';
import { z } from 'zod';
import { supabase } from '../supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const reportsRoutes = new Hono();

// Validate request bodies
const reportSchema = z.object({
    patientCount: z.number().int().positive(),
    originLocation: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string().optional()
    }),
    symptomMatrix: z.array(z.string()).nonempty(),
    severity: z.number().min(1).max(10),
    notes: z.string().optional()
});

// Apply auth middleware to all routes in this router
reportsRoutes.use('/*', requireAuth);

// Submit a Sentinel Report (Institutions only)
reportsRoutes.post('/', requireRole(['institution']), async (c) => {
    try {
        const user = c.get('user');
        const body = await c.req.json();
        const result = reportSchema.safeParse(body);

        if (!result.success) {
            return c.json({ error: 'Validation failed', details: result.error.format() }, 400);
        }

        const { patientCount, originLocation, symptomMatrix, severity, notes } = result.data;

        // Create the sentinel report record in Supabase
        const { data, error } = await supabase.from('sentinel_reports').insert([
            {
                submitted_by: user.id,
                organization_id: user.organizationId,
                patient_count: patientCount,
                origin_lat: originLocation.lat,
                origin_lng: originLocation.lng,
                origin_address: originLocation.address,
                symptom_matrix: symptomMatrix,
                severity,
                notes,
                status: 'Pending AI', // Pending AI -> Under PHO Review -> Validated
                professional_id_hash: 'todo-generate-hash' // Placeholder, you should hash their ID
            }
        ]).select().single();

        if (error) {
            return c.json({ error: error.message }, 500);
        }

        const reportId = data.id;

        // ---------------------------------------------------------
        // Execute CBS (Confidence-Based Scoring) Auto-Trigger
        // ---------------------------------------------------------
        try {
            // STEP 1: Symptom Weight Lookup (W)
            const symptoms = symptomMatrix.map(s => s.toLowerCase());
            let W = 0.2; // Default/Other

            const hasFever = symptoms.includes('fever');
            const hasHemorrhage = symptoms.some(s => s.includes('hemorrhage') || s.includes('bleeding'));
            const hasNeurological = symptoms.some(s => s.includes('seizure') || s.includes('confusion') || s.includes('paralysis'));
            const hasRespiratory = symptoms.some(s => s.includes('cough') || s.includes('breath') || s.includes('respiratory'));
            const hasEnteric = symptoms.includes('vomiting') && symptoms.some(s => s.includes('diarrhea') || s.includes('diarrhoea'));

            if (hasFever && hasHemorrhage) {
                W = 1.0;
            } else if (hasFever && hasNeurological) {
                W = 0.9;
            } else if (hasFever && hasRespiratory) {
                W = 0.7;
            } else if (hasEnteric) {
                W = 0.6;
            } else if (hasFever) {
                W = 0.4;
            } else if (hasRespiratory) {
                W = 0.3;
            }

            // Init Variables
            let CBS = 0;
            let severity_index = 0;
            let bypass_reason: string | null = null;
            let T = 0.3;

            if (W === 1.0) {
                // Critical bypass rule
                CBS = 1.0;
                severity_index = 10;
                bypass_reason = "CRITICAL_HEMORRHAGIC";
            } else {
                // STEP 2: Temporal Velocity Check (T)
                // Reports from same facility in last 24 hours
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                const { count, error: countError } = await supabase
                    .from('sentinel_reports')
                    .select('id', { count: 'exact', head: true })
                    .eq('organization_id', user.organizationId)
                    .gte('created_at', yesterday.toISOString());

                if (!countError && count !== null) {
                    // Include the current one we just added
                    const totalCount = count;
                    if (totalCount >= 10) {
                        T = 1.0;
                    } else if (totalCount >= 5) {
                        T = 0.8;
                    }
                }

                // STEP 3: Patient Volume Score (S)
                let S = 0.4;
                if (patientCount >= 20) {
                    S = 1.0;
                } else if (patientCount >= 10) {
                    S = 0.8;
                }

                // STEP 4: Compute Final CBS
                CBS = (W * 0.40) + (T * 0.35) + (S * 0.25);
                CBS = Math.max(0, Math.min(1, CBS)); // Clamp between 0.00 and 1.00
                CBS = Math.round(CBS * 100) / 100; // Round to 2 decimal places

                severity_index = Math.ceil(CBS * 10);
            }

            // STEP 5: Write to ai_alerts table
            const { error: alertError } = await supabase.from('ai_alerts').insert([
                {
                    report_id: reportId,
                    facility_id: user.organizationId,
                    zone_id: user.organizationId, // Usually PHO zone, using facilityId temporarily or assuming it maps 1:1 for now
                    cbs_score: CBS,
                    severity_index,
                    status: 'pending_investigation', // equivalent to UNCLAIMED
                    symptom_weight: W,
                    bypass_reason,
                    created_at: new Date().toISOString()
                }
            ]);

            if (alertError) {
                console.error("Failed to generate CBS alert:", alertError);
            }

        } catch (scoringError) {
            console.error("AI Scoring Error:", scoringError);
        }

        return c.json({ message: 'Sentinel Report submitted successfully', report: data }, 201);

    } catch (error: any) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// View own facility's submission feed
reportsRoutes.get('/feed', requireRole(['institution']), async (c) => {
    try {
        const user = c.get('user');

        // Fetch reports belonging to the user's organization
        const { data, error } = await supabase
            .from('sentinel_reports')
            .select('*')
            .eq('organization_id', user.organizationId)
            .order('created_at', { ascending: false });

        if (error) {
            return c.json({ error: error.message }, 500);
        }

        return c.json({ reports: data }, 200);

    } catch (error: any) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// Medical Director specific analytics endpoint (could require an extra role check like 'medical_director')
reportsRoutes.get('/analytics', requireRole(['institution']), async (c) => {
    const user = c.get('user');

    // Aggregate data using Supabase RPC or group queries
    // Placeholder response:
    return c.json({
        message: 'Analytics coming soon for medical directors',
        organizationId: user.organizationId
    }, 200);
});

export default reportsRoutes;
