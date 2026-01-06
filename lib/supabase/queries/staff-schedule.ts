import { SupabaseClient } from "@supabase/supabase-js";

export const staffScheduleQueries = {
  // 1. Fetch upcoming shifts for the Dashboard Widget (Limit 4)
  async getUpcomingShifts(client: SupabaseClient, staffId: string) {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await client
      .from("staff_shifts")
      .select(
        `
        id, shift_date, start_time, end_time, type, notes,
        ward:wards(name, ward_number)
      `
      )
      .eq("staff_id", staffId)
      .gte("shift_date", today)
      .order("shift_date", { ascending: true })
      .limit(4);

    if (error) {
      console.error("Error fetching shifts:", error);
      return [];
    }

    return (data || []).map((shift) => ({
      id: shift.id,
      date: shift.shift_date,
      start: shift.start_time.slice(0, 5), // HH:MM
      end: shift.end_time.slice(0, 5), // HH:MM
      type: shift.type,
      location: shift.ward
        ? `Ward ${shift.ward.ward_number} - ${shift.ward.name}`
        : "General Office",
      notes: shift.notes,
    }));
  },

  // 2. Fetch full schedule for the Calendar Page (Month/Week View)
  async getFullSchedule(
    client: SupabaseClient,
    staffId: string,
    startDate: string,
    endDate: string
  ) {
    // Fetch Shifts
    const { data: shifts, error: shiftsError } = await client
      .from("staff_shifts")
      .select(
        `
        id, shift_date, start_time, end_time, type, notes,
        ward:wards(name, ward_number)
      `
      )
      .eq("staff_id", staffId)
      .gte("shift_date", startDate)
      .lte("shift_date", endDate);

    if (shiftsError) console.error("Error fetching shifts:", shiftsError);

    // Fetch Tasks
    const { data: tasks, error: tasksError } = await client
      .from("staff_work_assignments")
      .select(
        `
        id, due_at, priority, assignment_status,
        complaint:complaints(title),
        task:supervisor_tasks(title)
      `
      )
      .eq("staff_id", staffId)
      .gte("due_at", startDate)
      .lte("due_at", endDate)
      .not("assignment_status", "in", '("cancelled")');

    if (tasksError) console.error("Error fetching tasks:", tasksError);

    const formattedShifts = (shifts || []).map((s) => ({
      id: s.id,
      date: s.shift_date,
      type: "shift",
      title: `${s.type.replace("_", " ")} Shift`,
      time: `${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`,
      location: s.ward ? `Ward ${s.ward.ward_number}` : "Office",
      priority: null,
    }));

    const formattedTasks = (tasks || []).map((t) => ({
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

  // 3. Get Attendance Status for Dashboard Header
  async getCurrentStatus(client: SupabaseClient, staffId: string) {
    const today = new Date().toISOString().split("T")[0];

    // Check attendance log for today
    const { data } = await client
      .from("staff_attendance_logs")
      .select("check_in_time, check_out_time, status")
      .eq("staff_id", staffId)
      .eq("date", today)
      .maybeSingle();

    return {
      isCheckedIn: !!data?.check_in_time && !data?.check_out_time,
      checkInTime: data?.check_in_time,
      status: data?.status || "absent",
    };
  },

  // 4. Get Upcoming Tasks for Calendar Sidebar
  async getUpcomingTasks(client: SupabaseClient, staffId: string) {
    const today = new Date().toISOString();

    const { data } = await client
      .from("staff_work_assignments")
      .select(
        `
        id, due_at, priority,
        complaint:complaints(title),
        task:supervisor_tasks(title)
      `
      )
      .eq("staff_id", staffId)
      .gte("due_at", today)
      .order("due_at", { ascending: true })
      .limit(5);

    return (data || []).map((t) => ({
      id: t.id,
      title: t.complaint?.title || t.task?.title || "Assignment",
      due_at: t.due_at,
      priority: t.priority,
    }));
  },
};
