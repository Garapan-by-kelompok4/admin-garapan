import Image from "next/image";

export function LoginHero() {
  return (
    <div className="relative hidden flex-col overflow-hidden bg-hero-gradient px-14 py-12 text-white lg:flex">
      <div className="flex items-center gap-3">
        <div className="grid size-[42px] place-items-center rounded-xl bg-brand-mark">
          <Image
            src="/brand/logo-mark-white.png"
            alt=""
            width={28}
            height={28}
            className="size-7"
            priority
          />
        </div>
        <div>
          <div className="font-display text-lg font-extrabold">GARAPAN</div>
          <div className="text-xs opacity-70">Admin Console · v1.0</div>
        </div>
      </div>

      <div className="relative z-[2] mt-auto">
        <div className="text-[13px] font-semibold uppercase tracking-wider opacity-75">
          Panel Administrator
        </div>
        <h1 className="my-3.5 max-w-[12ch] font-display text-[38px] font-extrabold leading-[1.1] tracking-tight">
          Kelola marketplace freelancer mahasiswa IT dengan satu dashboard.
        </h1>
        <p className="max-w-[460px] text-[15px] leading-relaxed opacity-80">
          Verifikasi akun, moderasi jasa, pantau transaksi escrow, dan
          selesaikan dispute — semuanya dari satu tempat.
        </p>

        <div className="mt-10 flex gap-8">
          {[
            { value: "Internal", label: "Akses terbatas" },
            { value: "9 Modul", label: "Operasional utama" },
            { value: "Aman", label: "Sesi terlindungi" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-display text-2xl font-extrabold tracking-tight">
                {stat.value}
              </div>
              <div className="mt-0.5 text-[12.5px] opacity-70">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <svg
        className="pointer-events-none absolute -right-20 -top-20 opacity-[0.14]"
        width="520"
        height="520"
        viewBox="0 0 520 520"
        aria-hidden
      >
        <circle cx="260" cy="260" r="258" fill="none" stroke="#fff" />
        <circle cx="260" cy="260" r="200" fill="none" stroke="#fff" />
        <circle cx="260" cy="260" r="140" fill="none" stroke="#fff" />
        <circle cx="260" cy="260" r="80" fill="none" stroke="#fff" />
      </svg>

      <div className="absolute bottom-8 left-14 text-xs opacity-55">
        © 2026 GARAPAN. Hanya untuk akses internal.
      </div>
    </div>
  );
}
