"use server";

import { redirect } from "next/navigation";
import { promises as fs } from "fs";
import path from "path";
import { getSession } from "@/lib/session";
import {
  createJob as createJobRecord,
  deleteJobById,
  getJobById,
  getUserById,
  updateApplicationStatus,
  updateApplicationById,
  getApplicationById,
  updateJobById,
} from "@/lib/db";

const trim = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

async function saveImages(files: File[], redirectTo: string) {
  const validImages = files.filter((file) => file && file.size > 0);
  if (validImages.length === 0) return undefined;
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const urls: string[] = [];

  for (const image of validImages) {
    if (!allowed.includes(image.type)) {
      redirect(`${redirectTo}?error=Fotoğraf formatı JPG, PNG veya WEBP olmalı.`);
    }
    if (image.size > 5 * 1024 * 1024) {
      redirect(`${redirectTo}?error=Fotoğraf boyutu 5MB altında olmalı.`);
    }
    const buffer = Buffer.from(await image.arrayBuffer());
    const ext = image.type.split("/")[1] ?? "jpg";
    const filename = `job-${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
    await fs.writeFile(path.join(uploadDir, filename), buffer);
    urls.push(`/uploads/${filename}`);
  }

  return urls;
}

export async function createJob(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    redirect("/auth?error=İlan oluşturmak için işveren girişi gerekli.");
  }

  const employer = await getUserById(session.userId);
  if (!employer || employer.employerStatus !== "APPROVED") {
    redirect("/employer?error=Onaylı işveren hesabı gerekiyor.");
  }

  const city = trim(formData.get("city"));
  const title = trim(formData.get("title"));
  const startDate = trim(formData.get("startDate"));
  const endDate = trim(formData.get("endDate"));
  const startTime = trim(formData.get("startTime"));
  const endTime = trim(formData.get("endTime"));
  const dailyWage = Number(trim(formData.get("dailyWage")));
  const description = trim(formData.get("description"));
  const images = formData.getAll("images") as File[];

  if (
    !title ||
    !city ||
    !startDate ||
    !endDate ||
    !startTime ||
    !endTime ||
    !dailyWage ||
    !description
  ) {
    redirect("/employer?error=Eksik bilgi girdiniz.");
  }

  const imageUrls = await saveImages(images, "/employer");

  await createJobRecord({
    employerId: session.userId,
    title,
    city,
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
    startTime,
    endTime,
    dailyWage,
    description,
    imageUrls,
    isActive: true,
  });

  redirect("/employer?status=job-created");
}

export async function updateJob(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    redirect("/auth?error=İlan düzenlemek için işveren girişi gerekli.");
  }

  const jobId = trim(formData.get("jobId"));
  const city = trim(formData.get("city"));
  const title = trim(formData.get("title"));
  const startDate = trim(formData.get("startDate"));
  const endDate = trim(formData.get("endDate"));
  const startTime = trim(formData.get("startTime"));
  const endTime = trim(formData.get("endTime"));
  const dailyWage = Number(trim(formData.get("dailyWage")));
  const description = trim(formData.get("description"));
  const images = formData.getAll("images") as File[];

  if (
    !jobId ||
    !title ||
    !city ||
    !startDate ||
    !endDate ||
    !startTime ||
    !endTime ||
    !dailyWage ||
    !description
  ) {
    redirect(`/employer/edit/${jobId}?error=Eksik bilgi girdiniz.`);
  }

  const job = await getJobById(jobId);
  if (!job || job.employerId !== session.userId) {
    redirect("/employer?error=Bu ilan üzerinde yetkiniz yok.");
  }

  const imageUrls = await saveImages(images, `/employer/edit/${jobId}`);

  await updateJobById(jobId, {
    title,
    city,
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
    startTime,
    endTime,
    dailyWage,
    description,
    imageUrls: imageUrls ?? job.imageUrls,
  });

  redirect(`/employer/edit/${jobId}?status=updated`);
}

export async function deleteJob(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    redirect("/auth?error=İlan silmek için işveren girişi gerekli.");
  }

  const jobId = trim(formData.get("jobId"));
  if (!jobId) redirect("/employer");

  const job = await getJobById(jobId);
  if (!job || job.employerId !== session.userId) {
    redirect("/employer?error=Bu ilan üzerinde yetkiniz yok.");
  }

  await deleteJobById(jobId);

  redirect("/employer?status=job-deleted");
}

export async function approveApplication(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    redirect("/auth?error=Başvuru onayı için işveren girişi gerekli.");
  }

  const applicationId = trim(formData.get("applicationId"));
  const jobId = trim(formData.get("jobId"));
  if (!applicationId || !jobId) redirect("/employer");

  const job = await getJobById(jobId);
  if (!job || job.employerId !== session.userId) {
    redirect("/employer?error=Bu ilan üzerinde yetkiniz yok.");
  }

  await updateApplicationStatus(applicationId, "APPROVED");
  redirect("/employer?status=app-approved");
}

export async function rejectApplication(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    redirect("/auth?error=Başvuru reddi için işveren girişi gerekli.");
  }

  const applicationId = trim(formData.get("applicationId"));
  const jobId = trim(formData.get("jobId"));
  if (!applicationId || !jobId) redirect("/employer");

  const job = await getJobById(jobId);
  if (!job || job.employerId !== session.userId) {
    redirect("/employer?error=Bu ilan üzerinde yetkiniz yok.");
  }

  await updateApplicationStatus(applicationId, "REJECTED");
  redirect("/employer?status=app-rejected");
}

export async function completeApplicationByEmployer(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    redirect("/auth?error=İş tamamlama için işveren girişi gerekli.");
  }

  const applicationId = trim(formData.get("applicationId"));
  const ratingRaw = trim(formData.get("rating"));
  const comment = trim(formData.get("comment"));

  if (!applicationId) redirect("/employer?error=Başvuru bulunamadı.");

  const application = await getApplicationById(applicationId);
  if (!application) redirect("/employer?error=Başvuru bulunamadı.");
  if (application.status !== "APPROVED") {
    redirect("/employer?error=Bu başvuru henüz onaylı değil.");
  }

  const job = await getJobById(application.jobId);
  if (!job || job.employerId !== session.userId) {
    redirect("/employer?error=Bu ilan üzerinde yetkiniz yok.");
  }

  const rating = ratingRaw ? Number(ratingRaw) : undefined;
  if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirect("/employer?error=Geçerli bir puan giriniz (1-5).");
  }

  await updateApplicationById(applicationId, {
    employerCompleted: true,
    employerRating: rating,
    employerComment: comment || undefined,
  });

  redirect("/employer?status=app-completed");
}
