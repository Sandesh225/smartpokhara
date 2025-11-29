// app/api/staff/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      email,
      password,
      full_name,
      phone,
      role_type,
      department_id,
      ward_id,
      employee_id,
    } = body;

    // Validate required fields
    if (!email || !password || !full_name || !role_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          phone,
          user_type: "staff",
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Wait for auth trigger
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get role ID
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("role_type", role_type)
      .eq("is_active", true)
      .single();

    if (roleError || !roleData) {
      return NextResponse.json(
        { error: "Invalid role type" },
        { status: 400 }
      );
    }

    // Assign role
    const { error: assignError } = await supabase
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        role_id: roleData.id,
        assigned_by: authData.user.id,
      });

    if (assignError) {
      return NextResponse.json(
        { error: assignError.message },
        { status: 500 }
      );
    }

    // Update profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        full_name,
        phone,
      })
      .eq("user_id", authData.user.id);

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Department assignment
    if (["dept_staff", "dept_head"].includes(role_type) && department_id) {
      const { error: deptError } = await supabase
        .from("department_staff")
        .insert({
          user_id: authData.user.id,
          department_id,
        });

      if (deptError) {
        return NextResponse.json(
          { error: deptError.message },
          { status: 500 }
        );
      }
    }

    // Ward assignment
    if (role_type === "ward_staff" && ward_id) {
      const { error: wardError } = await supabase
        .from("user_profiles")
        .update({ ward_id })
        .eq("user_id", authData.user.id);

      if (wardError) {
        return NextResponse.json(
          { error: wardError.message },
          { status: 500 }
        );
      }
    }

    // Employee ID
    if (employee_id) {
      const { error: metadataError } = await supabase
        .from("users")
        .update({ 
          phone,
          metadata: { employee_id }
        })
        .eq("id", authData.user.id);

      if (metadataError) {
        return NextResponse.json(
          { error: metadataError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Staff account created successfully",
      user_id: authData.user.id,
    });

  } catch (error: any) {
    console.error("Staff registration API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}