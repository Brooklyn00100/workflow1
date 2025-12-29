import Link from "next/link";
import { approveEmployer, deleteJobByAdmin, deleteUser, rejectEmployer } from "@/app/actions/admin";
import { getSession } from "@/lib/session";
import { listEmployersByStatus, listJobsWithEmployer, listUsersByRole } from "@/lib/db";

type AdminPageProps = {
  searchParams: { status?: string; error?: string };
};

const statusMessages: Record<string, string> = {
  "employer-approved": "İşveren onaylandı.",
  "employer-rejected": "İşveren reddedildi ve silindi.",
  "job-deleted": "İlan silindi.",
  "user-deleted": "Kullanıcı silindi.",
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="card">
          <p>Bu sayfa sadece admin kullanıcılar içindir.</p>
          <Link href="/auth" className="mt-4 inline-flex rounded-full border border-ink/20 px-4 py-2 text-sm">
            Admin Girişi
          </Link>
        </div>
      </div>
    );
  }

  const pendingEmployers = await listEmployersByStatus("PENDING");
  const jobs = await listJobsWithEmployer();
  const users = await listUsersByRole(["STUDENT", "EMPLOYER"]);

  const status = searchParams.status ? statusMessages[searchParams.status] : null;
  const error = searchParams.error;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl">Admin Paneli</h1>
        <p className="text-sm text-ink/70">
          İşveren onayları, ilan yönetimi ve kullanıcı kontrolü.
        </p>
      </div>

      {(status || error) && (
        <div className="mb-6 rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm">
          {status && <p className="text-sage">{status}</p>}
          {error && <p className="text-ember">{error}</p>}
        </div>
      )}

      <div className="grid gap-6">
        <section className="card">
          <h2 className="font-display text-xl">İşveren Onayları</h2>
          {pendingEmployers.length === 0 ? (
            <p className="mt-3 text-sm text-ink/70">Bekleyen işveren yok.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {pendingEmployers.map((employer) => (
                <div key={employer.id} className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span>{employer.companyName}</span>
                    <span className="text-xs text-ink/50">{employer.city}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink/50">{employer.email}</p>
                  <div className="mt-3 flex gap-2">
                    <form action={approveEmployer}>
                      <input type="hidden" name="employerId" value={employer.id} />
                      <button className="btn-primary px-3 py-1 text-xs">
                        Onayla
                      </button>
                    </form>
                    <form action={rejectEmployer}>
                      <input type="hidden" name="employerId" value={employer.id} />
                      <button className="btn-secondary px-3 py-1 text-xs">
                        Reddet
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="font-display text-xl">İlan Yönetimi</h2>
          {jobs.length === 0 ? (
            <p className="mt-3 text-sm text-ink/70">Henüz ilan yok.</p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {jobs.map(({ job, employer }) => (
                <div key={job.id} className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold text-ink">
                      {job.title ?? "Günlük Personel İhtiyacı"}
                    </span>
                    <span className="text-xs text-ink/50">{job.city}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink/50">
                    {employer?.companyName ?? "İşveren"}
                  </p>
                  <p className="mt-2 text-xs text-ink/50">
                    {new Date(job.startDate).toLocaleDateString("tr-TR")} –{" "}
                    {new Date(job.endDate).toLocaleDateString("tr-TR")}
                  </p>
                  <p className="mt-1 text-xs text-ink/50">
                    Saat: {job.startTime ?? "--"} – {job.endTime ?? "--"}
                  </p>
                  <form action={deleteJobByAdmin} className="mt-3">
                    <input type="hidden" name="jobId" value={job.id} />
                    <button className="btn-secondary px-3 py-1 text-xs">
                      Sil
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="font-display text-xl">Kullanıcı Yönetimi</h2>
          {users.length === 0 ? (
            <p className="mt-3 text-sm text-ink/70">Henüz kullanıcı yok.</p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {users.map((user) => (
                <div key={user.id} className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm">
                  <p className="font-semibold">
                    {user.role === "STUDENT" ? user.name : user.companyName}
                  </p>
                  <p className="text-xs text-ink/50">{user.email}</p>
                  <form action={deleteUser} className="mt-3">
                    <input type="hidden" name="userId" value={user.id} />
                    <button className="btn-secondary px-3 py-1 text-xs">
                      Sil (Ban)
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
