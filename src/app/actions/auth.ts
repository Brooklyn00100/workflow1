"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { clearSession, setSession } from "@/lib/session";
import { createUser, findUserByEmail } from "@/lib/db";

const trim = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

export async function registerStudent(formData: FormData) {
  const name = trim(formData.get("name"));
  const city = trim(formData.get("city"));
  const phone = trim(formData.get("phone"));
  const email = trim(formData.get("email")).toLowerCase();
  const password = trim(formData.get("password"));

  if (!name || !city || !phone || !email || !password) {
    redirect("/auth?error=Eksik bilgi girdiniz.");
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    redirect("/auth?error=Bu e-posta zaten kayıtlı.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await createUser({
    role: "STUDENT",
    name,
    city,
    phone,
    email,
    passwordHash,
  });

  redirect("/auth?status=student-created");
}

export async function registerEmployer(formData: FormData) {
  const companyName = trim(formData.get("companyName"));
  const name = trim(formData.get("name"));
  const city = trim(formData.get("city"));
  const phone = trim(formData.get("phone"));
  const email = trim(formData.get("email")).toLowerCase();
  const password = trim(formData.get("password"));

  if (!companyName || !name || !city || !phone || !email || !password) {
    redirect("/auth?error=Eksik bilgi girdiniz.");
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    redirect("/auth?error=Bu e-posta zaten kayıtlı.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await createUser({
    role: "EMPLOYER",
    name,
    companyName,
    city,
    phone,
    email,
    passwordHash,
    employerStatus: "PENDING",
  });

  redirect("/auth?status=employer-created");
}

export async function login(formData: FormData) {
  const email = trim(formData.get("email")).toLowerCase();
  const password = trim(formData.get("password"));
  const role = trim(formData.get("role")) as "STUDENT" | "EMPLOYER" | "ADMIN" | "";

  if (!email || !password) {
    redirect("/auth?error=E-posta ve şifre zorunlu.");
  }

  const user = await findUserByEmail(email);
  if (!user) {
    redirect("/auth?error=Kullanıcı bulunamadı.");
  }

  if (role && user.role !== role) {
    redirect("/auth?error=Kullanıcı tipi eşleşmedi.");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    redirect("/auth?error=Şifre hatalı.");
  }

  await setSession({ userId: user.id, role: user.role });

  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "EMPLOYER") redirect("/employer");
  redirect("/jobs");
}

export async function logout() {
  await clearSession();
  redirect("/");
}
