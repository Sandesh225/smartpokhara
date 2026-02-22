-- ============================================================================
-- FIX: COMPLAINT ATTACHMENTS RLS POLICY
-- Issue: "new row violates row-level security policy for table complaint_attachments"
-- ============================================================================

-- The issue is likely that the uploaded_by field is missing or the complaint_id hasn't
-- been fully propagated in the transaction, or the citizen_id mapping is strict.

DO $$
BEGIN
    -- Drop the restrictive policy
    DROP POLICY IF EXISTS "citizens_insert_own_attachments" ON public.complaint_attachments;

    -- Create a more robust policy for citizens to upload attachments
    -- We allow insertion if the attached complaint belongs to the currently authenticated user
    CREATE POLICY "citizens_insert_own_attachments"
        ON public.complaint_attachments 
        FOR INSERT 
        TO authenticated
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.complaints 
                WHERE id = complaint_attachments.complaint_id 
                AND citizen_id = auth.uid()
            )
        );
        
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error adjusting policy: %', SQLERRM;
END $$;
