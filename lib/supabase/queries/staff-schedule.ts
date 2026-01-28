import { SupabaseClient } from "@supabase/supabase-js";

export const staffScheduleQueries = {
  /**
   * 1. Fetch upcoming shifts for the Dashboard Widget (Limit 4)
   */
  async getUpcomingShifts(client: SupabaseClient, staffId: string) {
    const today = new Date().toISOString().split("T")[0];

    // Note: We request 'shift_type' from DB and alias it as 'type' for the frontend
    const { data, error } = await client
      .from("staff_shifts")
      .select(`
        id, 
        shift_date, 
        start_time, 
        end_time, 
        type:shift_type,
        notes,
        ward:wards(name, ward_number)
      `)
      .eq("staff_id", staffId)
      .gte("shift_date", today)
      .order("shift_date", { ascending: true })
      .limit(4);

    if (error) {
      console.error("Error fetching upcoming shifts:", error);
      return [];
    }

    return (data || []).map((shift: any) => ({
      id: shift.id,
      date: shift.shift_date,
      start: shift.start_time.slice(0, 5), // Format to HH:MM
      end: shift.end_time.slice(0, 5),     // Format to HH:MM
      type: shift.type,
      location: shift.ward
        ? `Ward ${shift.ward.ward_number} - ${shift.ward.name}`
        : "General Office",
      notes: shift.notes,
    }));
  },

  /**
   * 2. Fetch full schedule for the Calendar Page
   */
  async getFullSchedule(
    client: SupabaseClient,
    staffId: string,
    startDate: string,
    endDate: string
  ) {
    const [shiftsRes, tasksRes] = await Promise.all([
      client
        .from("staff_shifts")
        .select(`
          id, 
          shift_date, 
          start_time, 
          end_time, 
          type:shift_type, 
          notes,
          ward:wards(name, ward_number)
        `)
        .eq("staff_id", staffId)
        .gte("shift_date", startDate)
        .lte("shift_date", endDate),

      client
        .from("staff_work_assignments")
        .select(`
          id, 
          due_at, 
          priority, 
          assignment_status,
          complaint:complaints(title),
          task:supervisor_tasks(title)
        `)
        .eq("staff_id", staffId)
        .gte("due_at", startDate)
        .lte("due_at", endDate)
        .not("assignment_status", "in", '("cancelled")'),
    ]);

    if (shiftsRes.error) console.error("Error calendar shifts:", shiftsRes.error);
    if (tasksRes.error) console.error("Error calendar tasks:", tasksRes.error);

    const formattedShifts = (shiftsRes.data || []).map((s: any) => ({
      id: s.id,
      date: s.shift_date,
      type: "shift",
      title: `${(s.type || "Day").replace("_", " ")} Shift`,
      time: `${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`,
      location: s.ward ? `Ward ${s.ward.ward_number}` : "Office",
      priority: null,
    }));

    const formattedTasks = (tasksRes.data || []).map((t: any) => ({
      id: t.id,
      date: t.due_at.split("T")[0],
      type: "task",
      title: t.complaint?.title || t.task?.title || "Work Assignment",
      time: new Date(t.due_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      location: null,
      priority: t.priority,
    }));

    return {
      shifts: formattedShifts,
      tasks: formattedTasks,
    };
  },

  /**
   * 3. Get Attendance Status
   */
  async getCurrentStatus(client: SupabaseClient, staffId: string) {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await client
      .from("staff_attendance_logs")
      .select("check_in_time, check_out_time, status")
      .eq("staff_id", staffId)
      .eq("date", today)
      .maybeSingle();

    if (error) console.error("Error status:", error);

    return {
      isCheckedIn: !!data?.check_in_time && !data?.check_out_time,
      checkInTime: data?.check_in_time,
      status: data?.status || "absent",
    };
  },

  /**
   * 4. Get Upcoming Tasks
   */
  async getUpcomingTasks(client: SupabaseClient, staffId: string) {
    const today = new Date().toISOString();

    const { data, error } = await client
      .from("staff_work_assignments")
      .select(`
        id, 
        due_at, 
        priority,
        complaint:complaints(title),
        task:supervisor_tasks(title)
      `)
      .eq("staff_id", staffId)
      .gte("due_at", today)
      .order("due_at", { ascending: true })
      .limit(5);

    if (error) console.error("Error tasks:", error);

    return (data || []).map((t: any) => ({
      id: t.id,
      title: t.complaint?.title || t.task?.title || "Assignment",
      due_at: t.due_at,
      priority: t.priority,
    }));
  },
};