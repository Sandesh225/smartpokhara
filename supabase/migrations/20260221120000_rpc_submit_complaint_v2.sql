-- ============================================================================
-- FIX: CREATE RPC SUBMIT COMPLAINT V2
-- Run this in your Supabase SQL Editor to resolve the missing function error.
-- ============================================================================

-- Function to handle citizen complaint submission
CREATE OR REPLACE FUNCTION public.rpc_submit_complaint_v2(
    p_title text,
    p_description text,
    p_category_id uuid,
    p_subcategory_id uuid,
    p_ward_id uuid,
    p_location_point jsonb,
    p_address_text text,
    p_landmark text,
    p_priority text,
    p_is_anonymous boolean,
    p_phone text,
    p_source text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_complaint_id uuid;
    v_tracking_code text;
    v_citizen_id uuid;
    v_citizen_name text;
    v_citizen_email text;
    v_geom geography(POINT, 4326);
    v_inserted record;
BEGIN
    -- 1. Identify User
    v_citizen_id := fn_current_user_id();
    IF v_citizen_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- 2. Extract Citizen Info
    SELECT email INTO v_citizen_email FROM auth.users WHERE id = v_citizen_id;
    SELECT full_name INTO v_citizen_name 
    FROM public.user_profiles 
    WHERE user_id = v_citizen_id;

    -- 3. Parse Geometry from JSONB if provided
    IF p_location_point IS NOT NULL AND p_location_point ? 'lat' AND p_location_point ? 'lng' THEN
        v_geom := ST_SetSRID(ST_MakePoint((p_location_point->>'lng')::numeric, (p_location_point->>'lat')::numeric), 4326);
    END IF;

    -- 4. Generate Tracking Code
    v_tracking_code := 'CMP-' || to_char(now_utc(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 4));

    -- 5. Insert Complaint
    INSERT INTO public.complaints (
        tracking_code,
        citizen_id,
        citizen_full_name,
        citizen_phone,
        citizen_email,
        title,
        description,
        category_id,
        subcategory_id,
        ward_id,
        location_point,
        address_text,
        landmark,
        priority,
        is_anonymous,
        source,
        status,
        submitted_at
    ) VALUES (
        v_tracking_code,
        v_citizen_id,
        v_citizen_name,
        COALESCE(p_phone, (SELECT phone FROM public.users WHERE id = v_citizen_id)),
        v_citizen_email,
        p_title,
        p_description,
        p_category_id,
        p_subcategory_id,
        p_ward_id,
        v_geom,
        p_address_text,
        p_landmark,
        COALESCE(p_priority, 'medium')::complaint_priority,
        COALESCE(p_is_anonymous, false),
        COALESCE(p_source, 'web')::complaint_source,
        'received',
        now_utc()
    ) RETURNING id INTO v_complaint_id;

    -- 6. Return standard JSON object
    RETURN json_build_object(
        'success', true,
        'id', v_complaint_id,
        'tracking_code', v_tracking_code
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

-- Explicitly notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
