import Link from "next/link";
import { completeApplicationByStudent } from "@/app/actions/applications";
import { getSession } from "@/lib/session";
import { getEmployerRatingMap, listApplicationsForStudent } from "@/lib/db";

type ApplicationsPageProps = {
  searchParams: { status?: string; error?: string };
};

export default async function ApplicationsPage({ searchParams }: ApplicationsPageProps) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="card">
          <p>Başvurularınızı görmek için öğrenci girişi gerekli.</p>
          <Link href="/auth" className="mt-4 inline-flex rounded-full border border-ink/20 px-4 py-2 text-sm">
            Giriş / Kayıt
          </Link>
        </div>
      </div>
    );
  }

  const applications = await listApplicationsForStudent(session.userId);
  const employerIds = Array.from(
    new Set(applications.map(({ employer }) => employer?.id).filter(Boolean))
  ) as string[];
  const employerRatings = await getEmployerRatingMap(employerIds);
  const starText = (rating?: number) => {
    if (!rating) return "Puan yok";
    const full = Math.round(rating);
    return `${"★".repeat(full)}${"☆".repeat(5 - full)} ${rating.toFixed(1)}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl">Başvurularım</h1>
        <p className="text-sm text-ink/70">Bekleyen, onaylanan ve reddedilen başvurular burada görünür.</p>
      </div>

      {(searchParams.status || searchParams.error) && (
        <div className="mb-6 rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm">
          {searchParams.status === "completed" && <p className="text-sage">Değerlendirmeniz kaydedildi.</p>}
          {searchParams.error && <p className="text-ember">{searchParams.error}</p>}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {applications.length === 0 && (
          <div className="card md:col-span-2">
            <p>Henüz başvuru yapmadınız.</p>
          </div>
        )}
        {applications.map(({ app, job, employer }) => (
          <div key={app.id} className="card flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {employer?.companyLogoUrl ? (
                <img
                  src={employer.companyLogoUrl}
                  alt="İşletme logosu"
                  className="h-12 w-12 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-ink/10 bg-white/80 text-xs font-semibold">
                  {employer?.companyName?.slice(0, 2).toUpperCase() ?? "İŞ"}
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-widest text-ink/60">
                  {employer?.companyName ?? "İşveren"}
                </p>
                <p className="text-[11px] text-ink/60">
                  {starText(employer?.id ? employerRatings.get(employer.id) : undefined)}
                </p>
                <h3 className="font-display text-xl">{job?.title ?? "İlan"}</h3>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-ink/70">
              <span>Şehir: {job?.city ?? "-"}</span>
              <span>Günlük Ücret: ₺{job?.dailyWage ?? "-"}</span>
              <span>Talebim: ₺{app.desiredWage ?? job?.dailyWage ?? "-"}</span>
            </div>
            <div className="text-xs uppercase tracking-widest text-ink/50">
              Durum:{" "}
              {app.status === "APPROVED"
                ? "Onaylandı"
                : app.status === "REJECTED"
                ? "Reddedildi"
                : "Bekliyor"}
            </div>

            {app.status === "PENDING" && (
              <div className="rounded-2xl border border-ink/10 bg-white/80 px-3 py-2 text-sm text-ink/60">
                Başvurunuz değerlendiriliyor.
              </div>
            )}

            {app.status === "REJECTED" && (
              <div className="rounded-2xl border border-ink/10 bg-white/80 px-3 py-2 text-sm text-ink/60">
                Başvurunuz reddedildi.
              </div>
            )}

            {app.status === "APPROVED" && (
              <div className="rounded-2xl border border-ink/10 bg-white/80 px-3 py-2 text-sm text-ink/70">
                {app.employerCompleted ? (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-ink/50">
                      İşveren değerlendirmesi
                    </p>
                    <p className="text-sm">Puan: {app.employerRating ?? "-"}</p>
                    <p className="text-sm text-ink/60">{app.employerComment ?? "Yorum yok."}</p>
                  </div>
                ) : (
                  <p>İşveren henüz işi tamamlamadı.</p>
                )}
              </div>
            )}

            {app.status === "APPROVED" && !app.studentCompleted && (
              <form action={completeApplicationByStudent} className="flex flex-col gap-2 text-sm">
                <input type="hidden" name="applicationId" value={app.id} />
                <label className="text-xs text-ink/60">Puan</label>
                <div className="star-group" role="radiogroup" aria-label="Puan">
                  {[5, 4, 3, 2, 1].map((value) => {
                    const id = `student-rating-${app.id}-${value}`;
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
                <button className="btn-primary px-3 py-2 text-xs">İşi Tamamladım</button>
              </form>
            )}

            {app.studentCompleted && (
              <div className="rounded-2xl border border-ink/10 bg-white/80 px-3 py-2 text-sm text-ink/70">
                <p className="text-xs uppercase tracking-widest text-ink/50">Değerlendirmen</p>
                <p className="text-sm">Puan: {app.studentRating ?? "-"}</p>
                <p className="text-sm text-ink/60">{app.studentComment ?? "Yorum yok."}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
