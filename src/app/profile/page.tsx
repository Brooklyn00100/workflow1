import Link from "next/link";
import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/db";
import { updateProfile } from "@/app/actions/profile";

type ProfilePageProps = {
  searchParams: { status?: string; error?: string };
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const session = await getSession();
  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="card">
          <p>Profilinizi görmek için giriş yapmanız gerekir.</p>
          <Link href="/auth" className="mt-4 inline-flex rounded-full border border-ink/20 px-4 py-2 text-sm">
            Giriş / Kayıt
          </Link>
        </div>
      </div>
    );
  }

  const user = await getUserById(session.userId);
  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="card">Kullanıcı bulunamadı.</div>
      </div>
    );
  }

  const statusMessage = searchParams.status === "updated" ? "Profil güncellendi." : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="card">
        <h1 className="font-display text-3xl">Profil</h1>
        {(statusMessage || searchParams.error) && (
          <div className="mt-4 rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm">
            {statusMessage && <p className="text-sage">{statusMessage}</p>}
            {searchParams.error && <p className="text-ember">{searchParams.error}</p>}
          </div>
        )}
        <div className="mt-6 grid gap-4 text-sm text-ink/70 md:grid-cols-2">
          <div className="md:col-span-2">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Profil fotoğrafı"
                className="h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full border border-dashed border-ink/20 bg-white/60 text-xs text-ink/40">
                Fotoğraf yok
              </div>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/50">Ad Soyad</p>
            <p className="text-ink">{user.name ?? "-"}</p>
          </div>
          {user.companyName && (
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/50">Firma</p>
              <p className="text-ink">{user.companyName}</p>
            </div>
          )}
          {user.companyLogoUrl && (
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/50">Logo</p>
              <img
                src={user.companyLogoUrl}
                alt="İşletme logosu"
                className="mt-2 h-16 w-16 rounded-xl object-cover"
              />
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/50">Şehir</p>
            <p className="text-ink">{user.city}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/50">Telefon</p>
            <p className="text-ink">{user.phone}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/50">Yaş</p>
            <p className="text-ink">{user.age ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/50">E-posta</p>
            <p className="text-ink">{user.email}</p>
          </div>
          {user.role === "EMPLOYER" && (
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/50">Durum</p>
              <p className="text-ink">
                {user.employerStatus === "APPROVED" ? "Onaylı" : "Onay Bekliyor"}
              </p>
            </div>
          )}
        </div>

        <form
          action={updateProfile}
          className="mt-8 grid gap-4 md:grid-cols-2"
          encType="multipart/form-data"
        >
          {user.role === "EMPLOYER" ? (
            <>
              <label className="text-sm">
                Firma Adı
                <input
                  name="companyName"
                  defaultValue={user.companyName ?? ""}
                  className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
                />
              </label>
              <label className="text-sm">
                Yetkili Ad Soyad
                <input
                  name="name"
                  defaultValue={user.name ?? ""}
                  className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
                />
              </label>
              <label className="text-sm">
                İşletme Logosu
                <input
                  name="companyLogo"
                  type="file"
                  accept="image/*"
                  className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
                />
              </label>
            </>
          ) : (
            <label className="text-sm">
              Ad Soyad
              <input
                name="name"
                defaultValue={user.name ?? ""}
                className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
              />
            </label>
          )}
          <label className="text-sm">
            Profil Fotoğrafı
            <input
              name="avatar"
              type="file"
              accept="image/*"
              className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Şehir
            <input
              name="city"
              defaultValue={user.city}
              className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Telefon
            <input
              name="phone"
              defaultValue={user.phone}
              className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Yaş
            <input
              name="age"
              type="number"
              min={16}
              max={80}
              defaultValue={user.age ?? ""}
              className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2"
            />
          </label>
          <div className="md:col-span-2">
            <button className="btn-primary">Bilgilerimi Güncelle</button>
          </div>
        </form>
      </div>
    </div>
  );
}
