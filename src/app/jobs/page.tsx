import { listJobsWithEmployer } from "@/lib/db";
import { getSession } from "@/lib/session";
import JobsClient from "@/app/jobs/jobs-client";

export const dynamic = "force-dynamic";

type JobsPageProps = {
  searchParams: { city?: string; applied?: string; error?: string };
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const session = await getSession();
  const city = searchParams.city?.trim();
  const applied = searchParams.applied === "1";
  const error = searchParams.error;
  const jobEntries = await listJobsWithEmployer();
  const approvedActive = jobEntries.filter(({ job, employer }) => {
    if (!employer || employer.employerStatus !== "APPROVED") return false;
    return job.isActive;
  });
  const jobs = approvedActive
    .filter(({ job, employer }) => {
      if (!employer || employer.employerStatus !== "APPROVED") return false;
      if (city && job.city !== city) return false;
      return true;
    })
    .map(({ job, employer }) => ({ job, employer }));

  const cities = Array.from(new Set(approvedActive.map(({ job }) => job.city))).sort();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl">İş İlanları</h1>
          <p className="mt-2 text-sm text-ink/70">
            Sadece aktif ve onaylı işveren ilanları listelenir.
          </p>
        </div>
        <form className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-ink/70">
            Şehir
            <select
              name="city"
              defaultValue={city || ""}
              className="mt-2 w-full rounded-full border border-ink/20 bg-white px-4 py-2 text-sm"
            >
              <option value="">Tümü</option>
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <button className="btn-secondary px-4 py-2 text-sm">
            Filtrele
          </button>
        </form>
      </div>
      {(applied || error) && (
        <div className="mb-6 rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm">
          {applied && <p className="text-sage">Başvurunuz iletildi.</p>}
          {error && <p className="text-ember">{error}</p>}
        </div>
      )}

      <JobsClient
        jobs={jobs.map(({ job, employer }) => ({
          id: job.id,
          title: job.title,
          city: job.city,
          startDate: job.startDate,
          endDate: job.endDate,
          startTime: job.startTime,
          endTime: job.endTime,
          dailyWage: job.dailyWage,
          description: job.description,
          imageUrl: job.imageUrl,
          imageUrls: job.imageUrls,
          employerName: employer?.companyName ?? "İşveren",
        }))}
        isStudent={session?.role === "STUDENT"}
      />
    </div>
  );
}
