import Link from "next/link";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-ember/20 blur-3xl" />
      <div className="absolute top-56 left-[-120px] h-80 w-80 rounded-full bg-sky/60 blur-3xl" />
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pb-16 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pt-24">
        <div className="flex flex-col gap-6">
          <span className="pill">Kısa Süreli İşler</span>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Kısa süreli işler, hızlı çözüm.
          </h1>
          <p className="max-w-xl text-base text-ink/70 md:text-lg">
            WorkFlow ile işletmeler hızlıca ilan açar, üniversite öğrencileri şehirlerine
            uygun günlük işleri bulur. Resmi işe giriş değil, hızlı eşleşme ve iletişim
            sağlar.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth"
              className="btn-primary px-6 py-3"
            >
              Öğrenci Olarak Kayıt Ol
            </Link>
            <Link
              href="/auth"
              className="btn-secondary px-6 py-3"
            >
              İşveren Olarak Kayıt Ol
            </Link>
            <Link
              href="/auth"
              className="btn-secondary px-6 py-3"
            >
              Giriş Yap
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-ink/70 md:grid-cols-3">
            <div className="card">
              <p className="text-lg font-semibold text-ink">1 gün – 1 hafta</p>
              <p>Kısa süreli işler</p>
            </div>
            <div className="card">
              <p className="text-lg font-semibold text-ink">Şehir bazlı</p>
              <p>Hızlı filtreleme</p>
            </div>
            <div className="card">
              <p className="text-lg font-semibold text-ink">Admin onaylı</p>
              <p>Güvenli işverenler</p>
            </div>
          </div>
        </div>
        <div className="card flex flex-col gap-6 bg-gradient-to-br from-white via-white/80 to-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Bugünün öne çıkan ilanı</p>
            <span className="pill">Yeni</span>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white p-5">
            <h3 className="font-display text-2xl">Günlük Personel İhtiyacı</h3>
            <p className="mt-2 text-sm text-ink/70">
              Şehir: Ankara · Tarih: 12 – 15 Şubat · Günlük Ücret: ₺700
            </p>
            <p className="mt-4 text-sm text-ink/80">
              Kafe içi servis ve kasa desteği. Hızlı iletişim, net saat aralığı.
            </p>
            <Link
              href="/jobs"
              className="btn-primary mt-5 inline-flex px-4 py-2 text-xs uppercase tracking-widest"
            >
              Tüm İlanları Gör
            </Link>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/80 px-4 py-3">
              <span>İşveren kayıt olur</span>
              <span className="text-ink/50">01</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/80 px-4 py-3">
              <span>Admin onaylar</span>
              <span className="text-ink/50">02</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/80 px-4 py-3">
              <span>Öğrenciler başvurur</span>
              <span className="text-ink/50">03</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-16 md:grid-cols-3">
        <div className="card">
          <h3 className="font-display text-xl">Öğrenci</h3>
          <p className="mt-2 text-sm text-ink/70">
            Kendi şehrindeki aktif ilanları gör, başvurunu gönder, hızlı iletişime geç.
          </p>
        </div>
        <div className="card">
          <h3 className="font-display text-xl">İşveren</h3>
          <p className="mt-2 text-sm text-ink/70">
            Kısa süreli personel ihtiyacını ilan açarak hemen duyur.
          </p>
        </div>
        <div className="card">
          <h3 className="font-display text-xl">Admin</h3>
          <p className="mt-2 text-sm text-ink/70">
            İşveren onaylarını yönet, ilanları ve kullanıcıları kontrol et.
          </p>
        </div>
      </section>
    </div>
  );
}
