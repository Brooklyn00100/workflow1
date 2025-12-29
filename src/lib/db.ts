import fs from "fs";
import { promises as fsp } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export type Role = "ADMIN" | "EMPLOYER" | "STUDENT";

export type UserRecord = {
  id: string;
  role: Role;
  name?: string;
  companyName?: string;
  avatarUrl?: string;
  companyLogoUrl?: string;
  age?: number;
  city: string;
  phone: string;
  email: string;
  passwordHash: string;
  employerStatus?: "PENDING" | "APPROVED";
  createdAt: string;
};

export type JobRecord = {
  id: string;
  employerId: string;
  title?: string;
  city: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  dailyWage: number;
  description: string;
  imageUrl?: string;
  imageUrls?: string[];
  isActive: boolean;
  createdAt: string;
};

export type ApplicationRecord = {
  id: string;
  jobId: string;
  studentId: string;
  desiredWage?: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  employerCompleted?: boolean;
  studentCompleted?: boolean;
  employerRating?: number;
  employerComment?: string;
  studentRating?: number;
  studentComment?: string;
  createdAt: string;
};

type Database = {
  users: UserRecord[];
  jobs: JobRecord[];
  applications: ApplicationRecord[];
};

const cwd = process.cwd();
const rootDir = fs.existsSync(path.join(cwd, "package.json"))
  ? cwd
  : path.join(cwd, "workflow");
const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(rootDir, "data");
const DB_PATH = path.join(dataDir, "db.json");

async function loadDb(): Promise<Database> {
  await fsp.mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    const raw = await fsp.readFile(DB_PATH, "utf8");
    const db = JSON.parse(raw) as Database;
    db.users ||= [];
    db.jobs ||= [];
    db.applications ||= [];
    const didSeed = await seedIfEmpty(db);
    if (didSeed) {
      await saveDb(db);
    }
    return db;
  } catch {
    const empty: Database = { users: [], jobs: [], applications: [] };
    await seedIfEmpty(empty);
    await saveDb(empty);
    return empty;
  }
}

async function saveDb(db: Database) {
  await fsp.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

async function seedIfEmpty(db: Database) {
  if (db.users.length > 0) return false;
  const now = new Date().toISOString();
  const adminPassword = await bcrypt.hash("admin123", 10);
  const employerPassword = await bcrypt.hash("123456", 10);
  const studentPassword = await bcrypt.hash("123456", 10);

  const adminId = randomUUID();
  const employerId = randomUUID();
  const studentId = randomUUID();
  const jobId = randomUUID();

  db.users.push(
    {
      id: adminId,
      role: "ADMIN",
      name: "Sistem Admin",
      city: "İstanbul",
      phone: "0000 000 00 00",
      email: "admin@workflow.local",
      passwordHash: adminPassword,
      createdAt: now,
    },
    {
      id: employerId,
      role: "EMPLOYER",
      name: "Ayşe Kaya",
      companyName: "Kampüs Kafe",
      city: "Ankara",
      phone: "0500 000 00 00",
      email: "deneme@isveren.com",
      passwordHash: employerPassword,
      employerStatus: "APPROVED",
      companyLogoUrl: "",
      avatarUrl: "",
      createdAt: now,
    },
    {
      id: studentId,
      role: "STUDENT",
      name: "Ece Demir",
      city: "Ankara",
      phone: "0500 111 11 11",
      email: "deneme@ogrenci.com",
      passwordHash: studentPassword,
      age: 21,
      avatarUrl: "",
      createdAt: now,
    }
  );

  db.jobs.push({
    id: jobId,
    employerId,
    title: "Günlük Personel İhtiyacı",
    city: "Ankara",
    startDate: now,
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: "10:00",
    endTime: "18:00",
    dailyWage: 700,
    description: "Kafe içi servis ve kasa desteği. Öğrenci vardiyası.",
    isActive: true,
    createdAt: now,
  });

  db.applications.push({
    id: randomUUID(),
    jobId,
    studentId,
    status: "PENDING",
    employerCompleted: false,
    studentCompleted: false,
    createdAt: now,
  });

  return true;
}

export async function findUserByEmail(email: string) {
  const db = await loadDb();
  return db.users.find((user) => user.email === email) ?? null;
}

export async function getUserById(id: string) {
  const db = await loadDb();
  return db.users.find((user) => user.id === id) ?? null;
}

export async function createUser(user: Omit<UserRecord, "id" | "createdAt">) {
  const db = await loadDb();
  const created = { ...user, id: randomUUID(), createdAt: new Date().toISOString() };
  db.users.push(created);
  await saveDb(db);
  return created;
}

export async function updateUser(id: string, updates: Partial<UserRecord>) {
  const db = await loadDb();
  const index = db.users.findIndex((user) => user.id === id);
  if (index === -1) return null;
  db.users[index] = { ...db.users[index], ...updates };
  await saveDb(db);
  return db.users[index];
}

export async function deleteUserById(id: string) {
  const db = await loadDb();
  db.users = db.users.filter((user) => user.id !== id);
  db.jobs = db.jobs.filter((job) => job.employerId !== id);
  db.applications = db.applications.filter((app) => app.studentId !== id);
  await saveDb(db);
}

export async function listUsersByRole(roles: Role[]) {
  const db = await loadDb();
  return db.users
    .filter((user) => roles.includes(user.role))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createJob(job: Omit<JobRecord, "id" | "createdAt">) {
  const db = await loadDb();
  const created: JobRecord = {
    ...job,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  db.jobs.push(created);
  await saveDb(db);
  return created;
}

export async function deleteJobById(jobId: string) {
  const db = await loadDb();
  db.jobs = db.jobs.filter((job) => job.id !== jobId);
  db.applications = db.applications.filter((app) => app.jobId !== jobId);
  await saveDb(db);
}

export async function updateJobById(jobId: string, updates: Partial<JobRecord>) {
  const db = await loadDb();
  const index = db.jobs.findIndex((job) => job.id === jobId);
  if (index === -1) return null;
  db.jobs[index] = { ...db.jobs[index], ...updates };
  await saveDb(db);
  return db.jobs[index];
}

export async function listJobs(filter?: {
  city?: string;
  employerId?: string;
  activeOnly?: boolean;
  approvedOnly?: boolean;
}) {
  const db = await loadDb();
  let jobs = db.jobs.slice();
  if (filter?.city) jobs = jobs.filter((job) => job.city === filter.city);
  if (filter?.employerId) jobs = jobs.filter((job) => job.employerId === filter.employerId);
  if (filter?.activeOnly) jobs = jobs.filter((job) => job.isActive);
  if (filter?.approvedOnly) {
    const approvedEmployers = new Set(
      db.users.filter((user) => user.employerStatus === "APPROVED").map((user) => user.id)
    );
    jobs = jobs.filter((job) => approvedEmployers.has(job.employerId));
  }
  jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return jobs;
}

export async function getJobById(jobId?: string | null) {
  const db = await loadDb();
  if (!jobId) return null;
  const normalized = jobId.trim();
  const exact = db.jobs.find((job) => job.id === normalized);
  if (exact) return exact;
  const normalizedCompact = normalized.replace(/-/g, "");
  const candidates = db.jobs.filter((job) => !!job.id);
  const compactMatch = candidates.find(
    (job) => job.id.replace(/-/g, "") === normalizedCompact
  );
  if (compactMatch) return compactMatch;
  const endsWithMatch = candidates.find(
    (job) => job.id.replace(/-/g, "").endsWith(normalizedCompact)
  );
  if (endsWithMatch) return endsWithMatch;
  const includesMatch = candidates.find(
    (job) => job.id.replace(/-/g, "").includes(normalizedCompact)
  );
  return includesMatch ?? null;
}

export async function createApplication(
  jobId: string,
  studentId: string,
  desiredWage?: number
) {
  const db = await loadDb();
  const existing = db.applications.find(
    (app) => app.jobId === jobId && app.studentId === studentId
  );
  if (existing) return existing;
  const created: ApplicationRecord = {
    id: randomUUID(),
    jobId,
    studentId,
    desiredWage,
    status: "PENDING",
    employerCompleted: false,
    studentCompleted: false,
    createdAt: new Date().toISOString(),
  };
  db.applications.push(created);
  await saveDb(db);
  return created;
}

export async function listApplicationsForJob(jobId: string) {
  const db = await loadDb();
  return db.applications.filter((app) => app.jobId === jobId);
}

export async function listApplicationsWithStudents(jobId: string) {
  const db = await loadDb();
  return db.applications
    .filter((app) => app.jobId === jobId)
    .map((app) => ({
      app,
      student: db.users.find((user) => user.id === app.studentId) ?? null,
    }))
    .sort((a, b) => b.app.createdAt.localeCompare(a.app.createdAt));
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "PENDING" | "APPROVED" | "REJECTED"
) {
  const db = await loadDb();
  const index = db.applications.findIndex((app) => app.id === applicationId);
  if (index === -1) return null;
  db.applications[index] = { ...db.applications[index], status };
  await saveDb(db);
  return db.applications[index];
}

export async function updateApplicationById(
  applicationId: string,
  updates: Partial<ApplicationRecord>
) {
  const db = await loadDb();
  const index = db.applications.findIndex((app) => app.id === applicationId);
  if (index === -1) return null;
  db.applications[index] = { ...db.applications[index], ...updates };
  await saveDb(db);
  return db.applications[index];
}

export async function getApplicationById(applicationId: string) {
  const db = await loadDb();
  return db.applications.find((app) => app.id === applicationId) ?? null;
}

export async function listApplicationsForStudent(studentId: string) {
  const db = await loadDb();
  return db.applications
    .filter((app) => app.studentId === studentId)
    .map((app) => {
      const job = db.jobs.find((item) => item.id === app.jobId) ?? null;
      const employer = job
        ? db.users.find((user) => user.id === job.employerId) ?? null
        : null;
      return { app, job, employer };
    })
    .sort((a, b) => b.app.createdAt.localeCompare(a.app.createdAt));
}

export async function getStudentRatingMap(studentIds: string[]) {
  const db = await loadDb();
  const set = new Set(studentIds);
  const sums = new Map<string, number>();
  const counts = new Map<string, number>();

  for (const app of db.applications) {
    if (!set.has(app.studentId)) continue;
    if (!app.employerRating) continue;
    sums.set(app.studentId, (sums.get(app.studentId) ?? 0) + app.employerRating);
    counts.set(app.studentId, (counts.get(app.studentId) ?? 0) + 1);
  }

  const result = new Map<string, number>();
  for (const id of set) {
    const count = counts.get(id) ?? 0;
    if (count === 0) continue;
    const avg = (sums.get(id) ?? 0) / count;
    result.set(id, Number(avg.toFixed(1)));
  }

  return result;
}

export async function getEmployerRatingMap(employerIds: string[]) {
  const db = await loadDb();
  const set = new Set(employerIds);
  const sums = new Map<string, number>();
  const counts = new Map<string, number>();

  for (const app of db.applications) {
    if (!app.studentRating) continue;
    const job = db.jobs.find((item) => item.id === app.jobId);
    if (!job || !set.has(job.employerId)) continue;
    sums.set(job.employerId, (sums.get(job.employerId) ?? 0) + app.studentRating);
    counts.set(job.employerId, (counts.get(job.employerId) ?? 0) + 1);
  }

  const result = new Map<string, number>();
  for (const id of set) {
    const count = counts.get(id) ?? 0;
    if (count === 0) continue;
    const avg = (sums.get(id) ?? 0) / count;
    result.set(id, Number(avg.toFixed(1)));
  }

  return result;
}

export async function listEmployersByStatus(status: "PENDING" | "APPROVED") {
  const db = await loadDb();
  return db.users
    .filter((user) => user.role === "EMPLOYER" && user.employerStatus === status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listJobsWithEmployer() {
  const db = await loadDb();
  return db.jobs
    .map((job) => ({
      job,
      employer: db.users.find((user) => user.id === job.employerId) ?? null,
    }))
    .sort((a, b) => b.job.createdAt.localeCompare(a.job.createdAt));
}
