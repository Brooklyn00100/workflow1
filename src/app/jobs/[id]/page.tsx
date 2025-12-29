import Link from "next/link";
import { applyToJob } from "@/app/actions/jobs";
import { getSession } from "@/lib/session";
import { getJobById, getUserById, listJobsWithEmployer } from "@/lib/db";

export const dynamic = "force-dynamic";

type JobDetailProps = {
  params: { id: string };
  searchParams: { applied?: string };
};

export default async function JobDetailPage({ params, searchParams }: JobDetailProps) {
  const job = await getJobById(params.id);

  if (!job) {
    const recentJobs = (await listJobsWithEmployer()).slice(0, 4);
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="card">
          <p>İlan bulunamadı.</p>
          <p className="mt-2 text-xs text-ink/50">Aranan ilan: {params.id}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/jobs" className="btn-secondary px-4 py-2 text-sm">
              Tüm ilanlara dön
            </Link>
            {recentJobs.map(({ job: item }) => (
              <Link
                key={item.id}
                href={`/jobs/${item.id}`}
                className="btn-secondary px-3 py-2 text-xs"
              >
                {item.title ?? "İlan"} · {item.city}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const session = await getSession();
  const employer = job ? await getUserById(job.employerId) : null;
  const applied = searchParams.applied === "1";

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="card flex flex-col gap-4">
        {job.imageUrls?.length || job.imageUrl ? (
          <div className="overflow-hidden rounded-2xl border border-ink/10">
            <img
              src={job.imageUrls?.[0] ?? job.imageUrl}
              alt="İlan kapak fotoğrafı"
              className="h-64 w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-ink/20 bg-white/60 text-xs text-ink/40">
            Fotoğraf yok
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/60">
              {employer?.companyName ?? "İşveren"}
            </p>
            <h1 className="font-display text-3xl">
              {job.title ?? "Günlük Personel İhtiyacı"}
            </h1>
          </div>
          <span className="pill">Aktif İlan</span>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-ink/70">
          <span>Şehir: {job.city}</span>
          <span>
            Tarih: {new Date(job.startDate).toLocaleDateString("tr-TR")} –{" "}
            {new Date(job.endDate).toLocaleDateString("tr-TR")}
          </span>
          <span>Saat: {job.startTime ?? "--"} – {job.endTime ?? "--"}</span>
          <span>Günlük Ücret: ₺{job.dailyWage}</span>
        </div>
        <div className="text-sm text-ink/80 whitespace-pre-wrap">{job.description}</div>

        {(job.imageUrls?.length ?? 0) > 1 && (
          <div className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3">
            <p className="text-sm font-semibold text-ink">Diğer Fotoğraflar</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {job.imageUrls?.slice(1).map((url) => (
                <img key={url} src={url} alt="İlan görseli" className="h-40 w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm text-ink/70">
          <p className="font-semibold text-ink">İlan Detayları</p>
          <div className="mt-2 grid gap-1">
            <span>Başlık: {job.title ?? "Günlük Personel İhtiyacı"}</span>
            <span>Firma: {employer?.companyName ?? "İşveren"}</span>
            <span>Şehir: {job.city}</span>
            <span>Saat: {job.startTime ?? "--"} – {job.endTime ?? "--"}</span>
            <span>Günlük Ücret: ₺{job.dailyWage}</span>
          </div>
        </div>

        {applied && (
          <div className="rounded-2xl border border-sage/30 bg-sage/10 px-4 py-3 text-sm text-sage">
            Başvurunuz iletildi.
          </div>
        )}

        {session?.role === "STUDENT" ? (
          <form action={applyToJob} className="mt-2">
            <input type="hidden" name="jobId" value={job.id} />
            <button className="btn-primary px-6 py-3">
              Başvur
            </button>
          </form>
        ) : (
          <div className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm text-ink/70">
            Başvurmak için öğrenci girişi yapmanız gerekir.
          </div>
        )}
      </div>
    </div>
  );
}
