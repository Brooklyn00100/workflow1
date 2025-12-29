import Link from "next/link";
import {
  approveApplication,
  completeApplicationByEmployer,
  createJob,
  deleteJob,
  rejectApplication,
} from "@/app/actions/employer";
import { getSession } from "@/lib/session";
import {
  getStudentRatingMap,
  getUserById,
  listApplicationsWithStudents,
  listJobs,
} from "@/lib/db";

type EmployerPageProps = {
  searchParams: { status?: string; error?: string };
};

const statusMessages: Record<string, string> = {
  "job-created": "İlanınız aktif olarak yayınlandı.",
  "job-deleted": "İlan silindi.",
  "app-approved": "Başvuru onaylandı.",
  "app-rejected": "Başvuru reddedildi.",
  "app-completed": "İş tamamlandı olarak işaretlendi.",
};

export default async function EmployerPage({ searchParams }: EmployerPageProps) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="card">
          <p>Bu sayfaya erişmek için işveren girişi gerekli.</p>
          <Link href="/auth" className="mt-4 inline-flex rounded-full border border-ink/20 px-4 py-2 text-sm">
            Giriş / Kayıt
          </Link>
        </div>
      </div>
    );
  }

  const employer = await getUserById(session.userId);
  if (!employer) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="card">İşveren bulunamadı.</div>
      </div>
    );
  }

  const jobs = await listJobs({ employerId: employer.id });
  const jobApplications = await Promise.all(
    jobs.map(async (job) => ({
      jobId: job.id,
      apps: await listApplicationsWithStudents(job.id),
    }))
  );
  const studentIds = Array.from(
    new Set(jobApplications.flatMap((entry) => entry.apps.map(({ student }) => student?.id).filter(Boolean)))
  ) as string[];
  const studentRatings = await getStudentRatingMap(studentIds);

  const status = searchParams.status ? statusMessages[searchParams.status] : null;
  const error = searchParams.error;
  const initials = (value?: string | null) =>
    value
      ? value
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "OK";
  const starText = (rating?: number) => {
    if (!rating) return "Puan yok";
    const full = Math.round(rating);
    return `${"★".repeat(full)}${"☆".repeat(5 - full)} ${rating.toFixed(1)}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-display text-3xl">İşveren Paneli</h1>
        <p className="text-sm text-ink/70">
          Durumunuz: {employer.employerStatus === "APPROVED" ? "Onaylı" : "Onay Bekliyor"}
        </p>
      </div>

      {(status || error) && (
        <div className="mb-6 rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm">
          {status && <p className="text-sage">{status}</p>}
          {error && <p className="text-ember">{error}</p>}
        </div>
      )}

      {employer.employerStatus !== "APPROVED" ? (
        <div className="card">
          <p>Hesabınız admin onayında. Onay sonrası ilan yayınlayabilirsiniz.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <form action={createJob} className="card flex flex-col gap-4" encType="multipart/form-data">
            <h2 className="font-display text-xl">Yeni İlan Oluştur</h2>
            <label className="text-sm">
              İlan Başlığı
              <input name="title" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
            </label>
            <label className="text-sm">
              Şehir
              <input name="city" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
            </label>
            <label className="text-sm">
              Başlangıç Tarihi
              <input name="startDate" type="date" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
            </label>
            <label className="text-sm">
              Bitiş Tarihi
              <input name="endDate" type="date" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                Başlangıç Saati
                <input name="startTime" type="time" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
              </label>
              <label className="text-sm">
                Bitiş Saati
                <input name="endTime" type="time" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
              </label>
            </div>
            <label className="text-sm">
              Günlük Ücret (₺)
              <input name="dailyWage" type="number" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
            </label>
            <label className="text-sm">
              Açıklama
              <textarea name="description" rows={4} className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
            </label>
            <label className="text-sm">
              Fotoğraflar (ilk fotoğraf kapak olur)
              <input
                name="images"
                type="file"
                accept="image/*"
                multiple
                className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
              />
            </label>
            <button className="btn-primary mt-2">
              Kaydet
            </button>
          </form>

          <div className="card flex flex-col gap-4">
            <h2 className="font-display text-xl">İlanlarım</h2>
            {jobs.length === 0 ? (
              <p className="text-sm text-ink/70">Henüz ilan oluşturmadınız.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {jobs.map((job) => (
                  <div key={job.id} className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-semibold text-ink">
                        {job.title ?? "Günlük Personel İhtiyacı"}
                      </span>
                      <span>
                        {job.city} · {new Date(job.startDate).toLocaleDateString("tr-TR")} –{" "}
                        {new Date(job.endDate).toLocaleDateString("tr-TR")}
                      </span>
                      <span className="text-xs text-ink/50">₺{job.dailyWage}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink/50">
                      Saat: {job.startTime ?? "--"} – {job.endTime ?? "--"}
                    </p>
                    <p className="mt-2 text-sm text-ink/70">{job.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/employer/edit/${job.id}`} className="btn-secondary px-3 py-1 text-xs">
                        Düzenle
                      </Link>
                      <form action={deleteJob}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <button className="btn-secondary px-3 py-1 text-xs">
                          Sil
                        </button>
                      </form>
                    </div>
                    <div className="mt-4 rounded-2xl border border-ink/10 bg-white/80 px-3 py-2 text-xs text-ink/70">
                      <p className="font-semibold text-ink">Başvurular</p>
                      {jobApplications
                        .find((entry) => entry.jobId === job.id)
                        ?.apps.map(({ app, student }) => (
                          <div key={app.id} className="mt-2 border-t border-ink/10 pt-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-3">
                                {student?.avatarUrl ? (
                                  <img
                                    src={student.avatarUrl}
                                    alt="Öğrenci fotoğrafı"
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-white/80 text-xs font-semibold">
                                    {initials(student?.name)}
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-semibold text-ink">
                                    {student?.name ?? "Öğrenci"}
                                  </p>
                                  <p className="text-[11px] text-ink/60">
                                    {starText(student?.id ? studentRatings.get(student.id) : undefined)}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] uppercase tracking-widest text-ink/50">
                                {app.status === "APPROVED"
                                  ? "Onaylandı"
                                  : app.status === "REJECTED"
                                  ? "Reddedildi"
                                  : "Bekliyor"}
                              </span>
                            </div>
                            <p className="text-ink/50">{student?.phone ?? "-"}</p>
                            <p className="text-ink/50">{student?.email ?? "-"}</p>
                            <p className="text-ink/50">
                              Talep edilen ücret: ₺{app.desiredWage ?? job.dailyWage}
                            </p>
                            {app.status === "APPROVED" && (
                              <div className="mt-2 rounded-2xl border border-ink/10 bg-white/70 px-3 py-2">
                                {app.employerCompleted ? (
                                  <div className="text-ink/70">
                                    <p className="text-xs uppercase tracking-widest text-ink/50">
                                      İşveren değerlendirmesi
                                    </p>
                                    <p className="text-sm">Puan: {app.employerRating ?? "-"}</p>
                                    <p className="text-sm text-ink/60">
                                      {app.employerComment ?? "Yorum yok."}
                                    </p>
                                  </div>
                                ) : (
                                  <form action={completeApplicationByEmployer} className="flex flex-col gap-2 text-sm">
                                    <input type="hidden" name="applicationId" value={app.id} />
                                    <label className="text-xs text-ink/60">Puan</label>
                                    <div className="star-group" role="radiogroup" aria-label="Puan">
                                      {[5, 4, 3, 2, 1].map((value) => {
                                        const id = `rating-${app.id}-${value}`;
                                        return (
                                          <span key={id}>
                                            <input id={id} name="rating" type="radio" value={value} />
                                            <label htmlFor={id}>★</label>
                                          </span>
                                        );
                                      })}
                                    </div>
                                    <label className="text-xs text-ink/60">
                                      Yorum
                                      <textarea
                                        name="comment"
                                        rows={2}
                                        className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                                      />
                                    </label>
                                    <button className="btn-primary px-3 py-1 text-xs">
                                      İşi Tamamla
                                    </button>
                                  </form>
                                )}

                                {app.studentCompleted && (
                                  <div className="mt-3 text-ink/70">
                                    <p className="text-xs uppercase tracking-widest text-ink/50">
                                      Öğrenci değerlendirmesi
                                    </p>
                                    <p className="text-sm">Puan: {app.studentRating ?? "-"}</p>
                                    <p className="text-sm text-ink/60">
                                      {app.studentComment ?? "Yorum yok."}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                            {app.status === "PENDING" && (
                              <div className="mt-2 flex gap-2">
                                <form action={approveApplication}>
                                  <input type="hidden" name="applicationId" value={app.id} />
                                  <input type="hidden" name="jobId" value={job.id} />
                                  <button className="btn-primary px-3 py-1 text-xs">
                                    Onayla
                                  </button>
                                </form>
                                <form action={rejectApplication}>
                                  <input type="hidden" name="applicationId" value={app.id} />
                                  <input type="hidden" name="jobId" value={job.id} />
                                  <button className="btn-secondary px-3 py-1 text-xs">
                                    Reddet
                                  </button>
                                </form>
                              </div>
                            )}
                          </div>
                        ))}
                      {(jobApplications.find((entry) => entry.jobId === job.id)?.apps.length ?? 0) === 0 && (
                        <p className="mt-2 text-ink/50">Henüz başvuru yok.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
