"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { deleteJobById, deleteUserById, updateUser } from "@/lib/db";

const trim = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/auth?error=Admin girişi gerekli.");
  }
  return session;
}

export async function approveEmployer(formData: FormData) {
  await requireAdmin();
  const employerId = trim(formData.get("employerId"));
  if (!employerId) redirect("/admin");

  await updateUser(employerId, { employerStatus: "APPROVED" });

  redirect("/admin?status=employer-approved");
}

export async function rejectEmployer(formData: FormData) {
  await requireAdmin();
  const employerId = trim(formData.get("employerId"));
  if (!employerId) redirect("/admin");

  await deleteUserById(employerId);

  redirect("/admin?status=employer-rejected");
}

export async function deleteJobByAdmin(formData: FormData) {
  await requireAdmin();
  const jobId = trim(formData.get("jobId"));
  if (!jobId) redirect("/admin");

  await deleteJobById(jobId);
  redirect("/admin?status=job-deleted");
}

export async function deleteUser(formData: FormData) {
  await requireAdmin();
  const userId = trim(formData.get("userId"));
  if (!userId) redirect("/admin");

  await deleteUserById(userId);
  redirect("/admin?status=user-deleted");
}
