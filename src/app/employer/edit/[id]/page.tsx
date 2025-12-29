import Link from "next/link";
import { updateJob } from "@/app/actions/employer";
import { getSession } from "@/lib/session";
import { getJobById, getUserById } from "@/lib/db";

type EmployerEditProps = {
  params: { id: string };
  searchParams: { status?: string; error?: string };
};

export default async function EmployerEditPage({ params, searchParams }: EmployerEditProps) {
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
  const job = await getJobById(params.id);
  if (!employer || !job || job.employerId !== employer.id) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="card">
          <p>İlan bulunamadı veya yetkiniz yok.</p>
          <Link href="/employer" className="mt-4 inline-flex rounded-full border border-ink/20 px-4 py-2 text-sm">
            İşveren paneline dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">İlanı Düzenle</h1>
          <p className="text-sm text-ink/70">{job.title ?? "Günlük Personel İhtiyacı"}</p>
        </div>
        <Link href="/employer" className="btn-secondary px-4 py-2 text-sm">
          Geri Dön
        </Link>
      </div>

      {(searchParams.status || searchParams.error) && (
        <div className="mb-6 rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm">
          {searchParams.status === "updated" && <p className="text-sage">İlan güncellendi.</p>}
          {searchParams.error && <p className="text-ember">{searchParams.error}</p>}
        </div>
      )}

      <form
        action={updateJob}
        className="card flex flex-col gap-4"
        encType="multipart/form-data"
      >
        <input type="hidden" name="jobId" value={job.id} />
        <label className="text-sm">
          İlan Başlığı
          <input
            name="title"
            defaultValue={job.title ?? ""}
            className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Şehir
          <input
            name="city"
            defaultValue={job.city}
            className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Başlangıç Tarihi
          <input
            name="startDate"
            type="date"
            defaultValue={job.startDate.slice(0, 10)}
            className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Bitiş Tarihi
          <input
            name="endDate"
            type="date"
            defaultValue={job.endDate.slice(0, 10)}
            className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Başlangıç Saati
            <input
              name="startTime"
              type="time"
              defaultValue={job.startTime ?? ""}
              className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Bitiş Saati
            <input
              name="endTime"
              type="time"
              defaultValue={job.endTime ?? ""}
              className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
            />
          </label>
        </div>
        <label className="text-sm">
          Günlük Ücret (₺)
          <input
            name="dailyWage"
            type="number"
            defaultValue={job.dailyWage}
            className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Açıklama
          <textarea
            name="description"
            rows={5}
            defaultValue={job.description}
            className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Yeni Fotoğraflar (yüklenirse mevcutlar değişir)
          <input
            name="images"
            type="file"
            accept="image/*"
            multiple
            className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
          />
        </label>

        {(job.imageUrls?.length ?? 0) > 0 && (
          <div className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3">
            <p className="text-sm font-semibold text-ink">Mevcut Fotoğraflar</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {job.imageUrls?.map((url) => (
                <img key={url} src={url} alt="İlan görseli" className="h-32 w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>
        )}

        <button className="btn-primary mt-2">Güncelle</button>
      </form>
    </div>
  );
}
