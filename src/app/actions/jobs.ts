"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createApplication, getJobById } from "@/lib/db";

const trim = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

export async function applyToJob(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/auth?error=Başvuru için öğrenci girişi gerekli.");
  }

  const jobId = trim(formData.get("jobId"));
  const desiredWageRaw = trim(formData.get("desiredWage"));
  const desiredWage = desiredWageRaw ? Number(desiredWageRaw) : undefined;
  if (!jobId) {
    redirect("/jobs");
  }

  const job = await getJobById(jobId);
  if (!job) {
    redirect("/jobs");
  }

  if (desiredWageRaw && (!Number.isFinite(desiredWage) || desiredWage! <= 0)) {
    redirect("/jobs?error=Geçerli bir ücret giriniz.");
  }

  await createApplication(jobId, session.userId, desiredWage);

  redirect("/jobs?applied=1");
}
