'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- CREATE DEPARTMENT ---
export async function createDepartment(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const name_nepali = formData.get("name_nepali") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const head_user_id = formData.get("head_user_id") as string;
  const contact_email = formData.get("contact_email") as string;
  const contact_phone = formData.get("contact_phone") as string;

  const { error } = await supabase.from("departments").insert({
    name,
    name_nepali,
    code: code.toUpperCase(),
    description,
    head_user_id: head_user_id || null, // Handle empty selection
    contact_email,
    contact_phone,
    is_active: true,
  });

  if (error) {
    console.error("Create Dept Error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/departments");
  redirect("/admin/departments");
}

// --- UPDATE DEPARTMENT ---
export async function updateDepartment(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const name_nepali = formData.get("name_nepali") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const head_user_id = formData.get("head_user_id") as string;
  const contact_email = formData.get("contact_email") as string;
  const contact_phone = formData.get("contact_phone") as string;
  const is_active = formData.get("is_active") === "true";

  const { error } = await supabase
    .from("departments")
    .update({
      name,
      name_nepali,
      code: code.toUpperCase(),
      description,
      head_user_id: head_user_id || null,
      contact_email,
      contact_phone,
      is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Update Dept Error:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/admin/departments/${id}`);
  revalidatePath("/admin/departments");
  redirect(`/admin/departments/${id}`);
}

// --- DELETE DEPARTMENT ---
export async function deleteDepartment(id: string) {
  const supabase = await createClient();

  // Note: RLS policies in your schema must allow deletion
  const { error } = await supabase.from("departments").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/departments");
  redirect("/admin/departments");
}