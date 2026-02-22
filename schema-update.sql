-- Add new columns to ai_alerts table
ALTER TABLE public.ai_alerts ADD COLUMN IF NOT EXISTS report_id UUID REFERENCES public.sentinel_reports(id);
ALTER TABLE public.ai_alerts ADD COLUMN IF NOT EXISTS facility_id TEXT;
ALTER TABLE public.ai_alerts ADD COLUMN IF NOT EXISTS severity_index INTEGER;
ALTER TABLE public.ai_alerts ADD COLUMN IF NOT EXISTS symptom_weight FLOAT;
ALTER TABLE public.ai_alerts ADD COLUMN IF NOT EXISTS bypass_reason TEXT;
