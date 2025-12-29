import { login, registerEmployer, registerStudent } from "@/app/actions/auth";

type AuthPageProps = {
  searchParams: { status?: string; error?: string };
};

const statusMessages: Record<string, string> = {
  "student-created": "Hesabınız oluşturuldu. Giriş yapabilirsiniz.",
  "employer-created": "Başvurunuz alındı. Admin onayı sonrası hesabınız aktif olacaktır.",
  "job-created": "İlanınız yayınlandı.",
};

export default function AuthPage({ searchParams }: AuthPageProps) {
  const status = searchParams.status ? statusMessages[searchParams.status] : null;
  const error = searchParams.error;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl">Giriş & Kayıt</h1>
        <p className="mt-2 text-sm text-ink/70">
          Öğrenci ve işveren kayıtları ayrı tutulur. Admin onayı olmadan işveren ilan
          açamaz.
        </p>
      </div>

      {(status || error) && (
        <div className="mb-6 rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm">
          {status && <p className="text-sage">{status}</p>}
          {error && <p className="text-ember">{error}</p>}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <form action={registerStudent} className="card flex flex-col gap-4">
          <h2 className="font-display text-xl">Öğrenci Kaydı</h2>
          <label className="text-sm">
            Ad Soyad
            <input name="name" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
          </label>
          <label className="text-sm">
            Şehir
            <input name="city" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
          </label>
          <label className="text-sm">
            Telefon
            <input name="phone" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
          </label>
          <label className="text-sm">
            E-posta
            <input name="email" type="email" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
          </label>
          <label className="text-sm">
            Şifre
            <input name="password" type="password" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
          </label>
          <button className="btn-primary mt-2">
            Kayıt Ol
          </button>
        </form>

        <form action={registerEmployer} className="card flex flex-col gap-4">
          <h2 className="font-display text-xl">İşveren Kaydı</h2>
          <label className="text-sm">
            Firma Adı
            <input name="companyName" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
          </label>
          <label className="text-sm">
            Yetkili Ad Soyad
            <input name="name" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
          </label>
          <label className="text-sm">
            Şehir
            <input name="city" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
          </label>
          <label className="text-sm">
            Telefon
            <input name="phone" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
          </label>
          <label className="text-sm">
            E-posta
            <input name="email" type="email" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
          </label>
          <label className="text-sm">
            Şifre
            <input name="password" type="password" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
          </label>
          <button className="btn-primary mt-2">
            Başvuru Gönder
          </button>
        </form>

        <form action={login} className="card flex flex-col gap-4">
          <h2 className="font-display text-xl">Giriş</h2>
          <label className="text-sm">
            E-posta
            <input name="email" type="email" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
          </label>
          <label className="text-sm">
            Şifre
            <input name="password" type="password" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2" />
          </label>
          <label className="text-sm">
            Kullanıcı Tipi (opsiyonel)
            <select name="role" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2">
              <option value="">Otomatik</option>
              <option value="STUDENT">Öğrenci</option>
              <option value="EMPLOYER">İşveren</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <button className="btn-primary mt-2">
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
