"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getApplicationById, updateApplicationById } from "@/lib/db";

const trim = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

export async function completeApplicationByStudent(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/auth?error=Bu işlem için öğrenci girişi gerekli.");
  }

  const applicationId = trim(formData.get("applicationId"));
  const ratingRaw = trim(formData.get("rating"));
  const comment = trim(formData.get("comment"));

  if (!applicationId) redirect("/applications?error=Başvuru bulunamadı.");

  const application = await getApplicationById(applicationId);
  if (!application || application.studentId !== session.userId) {
    redirect("/applications?error=Bu başvuru üzerinde yetkiniz yok.");
  }
  if (application.status !== "APPROVED") {
    redirect("/applications?error=Bu başvuru henüz onaylı değil.");
  }

  const rating = ratingRaw ? Number(ratingRaw) : undefined;
  if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirect("/applications?error=Geçerli bir puan giriniz (1-5).");
  }

  await updateApplicationById(applicationId, {
    studentCompleted: true,
    studentRating: rating,
    studentComment: comment || undefined,
  });

  redirect("/applications?status=completed");
}
