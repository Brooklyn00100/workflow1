"use server";

import { redirect } from "next/navigation";
import { promises as fs } from "fs";
import path from "path";
import { getSession } from "@/lib/session";
import { updateUser } from "@/lib/db";

const trim = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/auth?error=Profil için giriş gerekli.");
  }

  const name = trim(formData.get("name"));
  const companyName = trim(formData.get("companyName"));
  const city = trim(formData.get("city"));
  const phone = trim(formData.get("phone"));
  const ageRaw = trim(formData.get("age"));
  const avatar = formData.get("avatar") as File | null;
  const logo = formData.get("companyLogo") as File | null;

  if (!city || !phone || (!name && !companyName)) {
    redirect("/profile?error=Eksik bilgi girdiniz.");
  }

  const age = ageRaw ? Number(ageRaw) : undefined;
  if (ageRaw && (!Number.isInteger(age) || age < 16 || age > 80)) {
    redirect("/profile?error=Yaş 16-80 arası olmalı.");
  }

  async function saveImage(file: File | null, prefix: string) {
    if (!file || file.size === 0) return undefined;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      redirect("/profile?error=Fotoğraf formatı JPG, PNG veya WEBP olmalı.");
    }
    if (file.size > 5 * 1024 * 1024) {
      redirect("/profile?error=Fotoğraf boyutu 5MB altında olmalı.");
    }
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type.split("/")[1] ?? "jpg";
    const filename = `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
    await fs.writeFile(path.join(uploadDir, filename), buffer);
    return `/uploads/${filename}`;
  }

  const avatarUrl = await saveImage(avatar, "avatar");
  const companyLogoUrl = await saveImage(logo, "logo");

  await updateUser(session.userId, {
    name: name || undefined,
    companyName: companyName || undefined,
    city,
    phone,
    age: age ?? undefined,
    avatarUrl: avatarUrl ?? undefined,
    companyLogoUrl: companyLogoUrl ?? undefined,
  });

  redirect("/profile?status=updated");
}
