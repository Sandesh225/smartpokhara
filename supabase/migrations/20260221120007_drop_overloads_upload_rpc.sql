-- ============================================================================
-- FIX: OVERLOADED RPC FOR UPLOADING COMPLAINT ATTACHMENTS
-- Issue: "Could not choose the best candidate function" due to multiple 
--        functions with similar names but different signatures.
-- ============================================================================

-- 1. Drop the ambiguous overloads explicitly by their signatures.
DROP FUNCTION IF EXISTS public.rpc_upload_complaint_attachment(uuid, character varying, character varying, bigint, text, text);
DROP FUNCTION IF EXISTS public.rpc_upload_complaint_attachment(uuid, text, text, text, bigint);

-- 2. Re-create the SINGLE correct function with the exact 5-parameter signature.
CREATE OR REPLACE FUNCTION public.rpc_upload_complaint_attachment(
    p_complaint_id uuid,
    p_file_path text,
    p_file_name text,
    p_file_type text,
    p_file_size bigint
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_valid boolean;
    v_attachment_id uuid;
BEGIN
    -- 1. Identify User
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- 2. Verify Ownership / Authorization
    -- The user must either be the citizen who created it, or a staff member
    SELECT EXISTS (
        SELECT 1 FROM public.complaints 
        WHERE id = p_complaint_id 
        AND (
            citizen_id = v_user_id 
            OR assigned_staff_id = v_user_id
            OR EXISTS (
                SELECT 1 FROM public.user_roles ur 
                JOIN public.roles r ON ur.role_id = r.id 
                WHERE ur.user_id = v_user_id 
                AND r.role_type IN ('admin', 'dept_head', 'dept_staff', 'ward_staff', 'field_staff')
            )
        )
    ) INTO v_valid;

    IF NOT v_valid THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized to attach files to this complaint');
    END IF;

    -- 3. Insert Attachment
    INSERT INTO public.complaint_attachments (
        complaint_id,
        file_path,
        file_name,
        file_type,
        file_size,
        uploaded_by
    ) VALUES (
        p_complaint_id,
        p_file_path,
        p_file_name,
        p_file_type,
        p_file_size,
        v_user_id
    ) RETURNING id INTO v_attachment_id;

    RETURN json_build_object(
        'success', true,
        'id', v_attachment_id
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
