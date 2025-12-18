import { supabase } from "@/lib/supabase/client";

export type SupervisorLevel = "ward" | "department" | "combined" | "senior";

export interface Jurisdiction {
  assigned_wards: string[];
  assigned_departments: string[];
  is_senior: boolean;
  supervisor_level: SupervisorLevel;
}

// For dropdown filters / simple checks
export type JurisdictionFilter = Pick<
  Jurisdiction,
  "assigned_wards" | "assigned_departments" | "is_senior"
>;

type SupervisorProfileRow = {
  supervisor_level: SupervisorLevel;
  assigned_wards: string[] | null;
  assigned_departments: string[] | null;
  can_assign_staff?: boolean | null;
  can_escalate?: boolean | null;
  can_close_complaints?: boolean | null;
  can_create_tasks?: boolean | null;
  can_approve_leave?: boolean | null;
  can_generate_reports?: boolean | null;
};

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user?.id) {
    throw new Error("User not authenticated");
  }

  return data.user.id;
}

function mapProfileToJurisdiction(
  profile: SupervisorProfileRow | null
): Jurisdiction {
  if (!profile) {
    return {
      assigned_wards: [],
      assigned_departments: [],
      is_senior: false,
      supervisor_level: "ward",
    };
  }

  return {
    assigned_wards: profile.assigned_wards ?? [],
    assigned_departments: profile.assigned_departments ?? [],
    supervisor_level: profile.supervisor_level,
    is_senior: profile.supervisor_level === "senior",
  };
}

async function fetchSupervisorProfile(
  userId: string
): Promise<SupervisorProfileRow | null> {
  const { data, error } = await supabase
    .from("supervisor_profiles")
    .select(
      [
        "supervisor_level",
        "assigned_wards",
        "assigned_departments",
        "can_assign_staff",
        "can_escalate",
        "can_close_complaints",
        "can_create_tasks",
        "can_approve_leave",
        "can_generate_reports",
      ].join(", ")
    )
    .eq("user_id", userId)
    .single();

  if (error) {
    // PGRST116 = no rows returned
    if ((error as any).code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data as SupervisorProfileRow;
}

/**
 * Retrieves the jurisdiction for a specific supervisor (by userId).
 * Useful on server-side where userId is known.
 */
export async function getSupervisorJurisdiction(
  userId: string
): Promise<Jurisdiction> {
  const profile = await fetchSupervisorProfile(userId);
  return mapProfileToJurisdiction(profile);
}

/**
 * Retrieves the current logged-in supervisor's jurisdiction.
 */
export async function getJurisdiction(): Promise<Jurisdiction> {
  const userId = await getCurrentUserId();
  const profile = await fetchSupervisorProfile(userId);
  return mapProfileToJurisdiction(profile);
}

/**
 * Alias that matches your earlier naming – used to populate filter dropdowns.
 */
export async function getJurisdictionFilter(): Promise<Jurisdiction> {
  return getJurisdiction();
}

/**
 * Checks if an entity (complaint or staff) falls within the current supervisor's jurisdiction.
 */
export async function isInJurisdiction(
  entityType: "complaint" | "staff",
  entityId: string
): Promise<boolean> {
  const jurisdiction = await getJurisdiction();

  // Senior supervisors can see everything
  if (jurisdiction.is_senior) return true;

  if (entityType === "complaint") {
    const { data: complaint, error } = await supabase
      .from("complaints")
      .select("ward_id, assigned_department_id")
      .eq("id", entityId)
      .single();

    if (error || !complaint) return false;

    const matchesWard = jurisdiction.assigned_wards.includes(complaint.ward_id);
    const matchesDept = jurisdiction.assigned_departments.includes(
      complaint.assigned_department_id
    );

    // OR logic: ward OR department
    return matchesWard || matchesDept;
  } else {
    const { data: staff, error } = await supabase
      .from("staff_profiles")
      .select("ward_id, department_id")
      .eq("user_id", entityId)
      .single();

    if (error || !staff) return false;

    const matchesWard = jurisdiction.assigned_wards.includes(staff.ward_id);
    const matchesDept = jurisdiction.assigned_departments.includes(
      staff.department_id
    );

    return matchesWard || matchesDept;
  }
}

/**
 * Ward options limited to current supervisor's assigned wards.
 */
export async function getWardList(): Promise<Array<{ id: string; name: string }>> {
  const jurisdiction = await getJurisdiction();

  if (!jurisdiction.assigned_wards.length) return [];

  const { data, error } = await supabase
    .from("wards")
    .select("id, name")
    .in("id", jurisdiction.assigned_wards);

  if (error) throw error;
  return data ?? [];
}

/**
 * Department options limited to current supervisor's assigned departments.
 */
export async function getDepartmentList(): Promise<
  Array<{ id: string; name: string }>
> {
  const jurisdiction = await getJurisdiction();

  if (!jurisdiction.assigned_departments.length) return [];

  const { data, error } = await supabase
    .from("departments")
    .select("id, name")
    .in("id", jurisdiction.assigned_departments);

  if (error) throw error;
  return data ?? [];
}

/**
 * High-level permission check, combining feature flags + jurisdiction.
 *
 * `resource` is typically "complaint" or "staff".
 * `action` should be one of:
 *   - "assign_complaint"
 *   - "escalate"
 *   - "close_complaint"
 *   - "create_task"
 *   - "approve_leave"
 *   - "generate_report"
 *
 * If `entityId` is provided, we also check jurisdiction on that entity.
 */
export async function canAccess(
  resource: "complaint" | "staff",
  action:
    | "assign_complaint"
    | "escalate"
    | "close_complaint"
    | "create_task"
    | "approve_leave"
    | "generate_report",
  entityId?: string
): Promise<boolean> {
  const userId = await getCurrentUserId();
  const profile = await fetchSupervisorProfile(userId);

  if (!profile) return false;

  const permissions = {
    assign_complaint: profile.can_assign_staff ?? false,
    escalate: profile.can_escalate ?? false,
    close_complaint: profile.can_close_complaints ?? false,
    create_task: profile.can_create_tasks ?? false,
    approve_leave: profile.can_approve_leave ?? false,
    generate_report: profile.can_generate_reports ?? false,
  } as const;

  // Basic feature-flag style permission
  if (!permissions[action]) {
    return false;
  }

  // If an entity is provided, enforce jurisdiction
  if (entityId) {
    return isInJurisdiction(resource, entityId);
  }

  return true;
}
