"use client";

import { useMemo, useState } from "react";
import { applyToJob } from "@/app/actions/jobs";

type JobCard = {
  id: string;
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
  employerName: string;
};

type JobsClientProps = {
  jobs: JobCard[];
  isStudent: boolean;
};

export default function JobsClient({ jobs, isStudent }: JobsClientProps) {
  const [activeJob, setActiveJob] = useState<JobCard | null>(null);
  const [acceptOffered, setAcceptOffered] = useState(true);
  const [desiredWage, setDesiredWage] = useState<number>(0);

  const hasJobs = jobs.length > 0;

  const computedDesired = useMemo(() => {
    if (!activeJob) return 0;
    return acceptOffered ? activeJob.dailyWage : desiredWage;
  }, [acceptOffered, activeJob, desiredWage]);

  function openModal(job: JobCard) {
    setActiveJob(job);
    setAcceptOffered(true);
    setDesiredWage(job.dailyWage);
  }

  function closeModal() {
    setActiveJob(null);
  }

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        {!hasJobs && (
          <div className="card md:col-span-2">
            <p>Henüz bu şehirde aktif ilan yok.</p>
          </div>
        )}
        {jobs.map((job) => (
          <div key={job.id} className="card flex flex-col gap-4">
            {job.imageUrls?.[0] || job.imageUrl ? (
              <div className="overflow-hidden rounded-2xl border border-ink/10">
                <img
                  src={job.imageUrls?.[0] ?? job.imageUrl}
                  alt="İlan fotoğrafı"
                  className="h-44 w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-ink/20 bg-white/60 text-xs text-ink/40">
                Fotoğraf yok
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/60">{job.employerName}</p>
              <h3 className="font-display text-xl">{job.title ?? "Günlük Personel İhtiyacı"}</h3>
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
            <p className="text-sm text-ink/70">{job.description}</p>
            <button
              onClick={() => openModal(job)}
              className="btn-primary w-full px-4 py-2 text-xs uppercase tracking-widest"
            >
              İncele
            </button>
          </div>
        ))}
      </div>

      {activeJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-ink/60">
                  {activeJob.employerName}
                </p>
                <h2 className="font-display text-2xl">
                  {activeJob.title ?? "Günlük Personel İhtiyacı"}
                </h2>
                <p className="mt-1 text-sm text-ink/60">Konum: {activeJob.city}</p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full border border-ink/20 px-3 py-1 text-xs"
              >
                Kapat
              </button>
            </div>

            {(activeJob.imageUrls?.length || activeJob.imageUrl) && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10">
                <img
                  src={activeJob.imageUrls?.[0] ?? activeJob.imageUrl}
                  alt="İlan kapak fotoğrafı"
                  className="h-48 w-full object-cover"
                />
              </div>
            )}

            {(activeJob.imageUrls?.length ?? 0) > 1 && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {activeJob.imageUrls?.slice(1).map((url) => (
                  <img key={url} src={url} alt="İlan görseli" className="h-28 w-full rounded-xl object-cover" />
                ))}
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-sm text-ink/70">
              <div className="flex flex-wrap gap-3">
                <span>Şehir: {activeJob.city}</span>
                <span>
                  Tarih: {new Date(activeJob.startDate).toLocaleDateString("tr-TR")} –{" "}
                  {new Date(activeJob.endDate).toLocaleDateString("tr-TR")}
                </span>
                <span>Saat: {activeJob.startTime ?? "--"} – {activeJob.endTime ?? "--"}</span>
                <span>Günlük ücret: ₺{activeJob.dailyWage}</span>
              </div>
            </div>

            <div className="mt-4 text-sm text-ink/70 whitespace-pre-wrap">
              {activeJob.description}
            </div>

            {isStudent ? (
              <form action={applyToJob} className="mt-6 flex flex-col gap-4">
                <input type="hidden" name="jobId" value={activeJob.id} />
                <input type="hidden" name="desiredWage" value={computedDesired} />

                <label className="flex items-center gap-2 text-sm text-ink/70">
                  <input
                    type="checkbox"
                    checked={acceptOffered}
                    onChange={(event) => {
                      const next = event.target.checked;
                      setAcceptOffered(next);
                      if (next) {
                        setDesiredWage(activeJob.dailyWage);
                      }
                    }}
                  />
                  Gösterilen ücreti kabul ediyorum
                </label>

                {!acceptOffered && (
                  <label className="text-sm text-ink/70">
                    İstediğin günlük ücret
                    <input
                      type="number"
                      min={1}
                      value={desiredWage}
                      onChange={(event) => setDesiredWage(Number(event.target.value))}
                      className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
                    />
                  </label>
                )}

                <button className="btn-primary">Başvuruyu Gönder</button>
              </form>
            ) : (
              <div className="mt-6 rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm text-ink/70">
                Başvuru yapmak için öğrenci girişi gerekli.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
