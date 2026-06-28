function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("admin@skillmahasiswa.id");
  const [pwd, setPwd] = useState("••••••••••");
  const [show, setShow] = useState(false);
  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "var(--surface)",
    }}>
      {/* Left hero */}
      <div style={{
        position: "relative",
        background: "radial-gradient(120% 80% at 0% 0%, var(--brand-400) 0%, var(--brand-600) 40%, var(--brand-800) 100%)",
        color: "#fff",
        padding: "48px 56px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="sb-logo" style={{ width: 42, height: 42, fontSize: 18 }}>Sm</div>
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18 }}>SkillMahasiswa</div>
            <div style={{ fontSize: 12, opacity: .7 }}>Admin Console · v2.4</div>
          </div>
        </div>

        <div style={{ marginTop: "auto", position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: 13, fontWeight: 600, opacity: .75, letterSpacing: ".05em", textTransform: "uppercase" }}>Panel Administrator</div>
          <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.1, margin: "12px 0 14px", letterSpacing: "-.025em", color: "#fff" }}>
            Kelola marketplace freelancer mahasiswa IT dengan satu dashboard.
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.55, opacity: .78, maxWidth: 460, margin: 0 }}>
            Verifikasi akun, moderasi jasa, pantau transaksi escrow, dan selesaikan dispute — semuanya dari satu tempat.
          </p>

          <div style={{ display: "flex", gap: 32, marginTop: 40 }}>
            {[
              { n: "12.4K", l: "Mahasiswa aktif" },
              { n: "3.8K",  l: "Klien terverifikasi" },
              { n: "Rp 4.2M", l: "Transaksi / bulan" },
            ].map((s,i) => (
              <div key={i}>
                <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 24, letterSpacing: "-.02em" }}>{s.n}</div>
                <div style={{ fontSize: 12.5, opacity: .7, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* decorative */}
        <svg style={{ position: "absolute", right: -80, top: -80, opacity: .14 }} width="520" height="520" viewBox="0 0 520 520">
          <circle cx="260" cy="260" r="258" fill="none" stroke="#fff" strokeWidth="1"/>
          <circle cx="260" cy="260" r="200" fill="none" stroke="#fff" strokeWidth="1"/>
          <circle cx="260" cy="260" r="140" fill="none" stroke="#fff" strokeWidth="1"/>
          <circle cx="260" cy="260" r="80"  fill="none" stroke="#fff" strokeWidth="1"/>
        </svg>
        <div style={{ position: "absolute", left: 56, bottom: 32, fontSize: 12, opacity: .55 }}>© 2026 SkillMahasiswa. Hanya untuk akses internal.</div>
      </div>

      {/* Right form */}
      <div style={{ display: "grid", placeItems: "center", padding: 48 }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.02em" }}>Masuk ke akun Admin</h2>
          <p style={{ color: "var(--ink-400)", marginTop: 6, fontSize: 14 }}>
            Gunakan email kantor dan password yang diberikan oleh Super Admin.
          </p>

          <form style={{ marginTop: 28 }} onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div className="field">
              <label className="label">Email</label>
              <div style={{ position: "relative" }}>
                <Icon.Mail style={{ position: "absolute", left: 12, top: 10, color: "var(--ink-400)" }} size={18}/>
                <input className="input" style={{ paddingLeft: 38 }} type="email" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems: "baseline" }}>
                <label className="label">Password</label>
                <a href="#" style={{ fontSize: 12, color: "var(--brand-600)", textDecoration: "none", fontWeight: 600 }}>Lupa password?</a>
              </div>
              <div style={{ position: "relative" }}>
                <Icon.Lock style={{ position: "absolute", left: 12, top: 10, color: "var(--ink-400)" }} size={18}/>
                <input className="input" style={{ paddingLeft: 38, paddingRight: 64 }} type={show ? "text" : "password"} value={pwd} onChange={e=>setPwd(e.target.value)} />
                <button type="button" onClick={() => setShow(s=>!s)} style={{
                  position: "absolute", right: 8, top: 6, height: 26, padding: "0 8px",
                  background: "var(--surface-3)", border: "none", borderRadius: 6, fontSize: 11.5, fontWeight: 600, color: "var(--ink-500)", cursor: "pointer"
                }}>{show ? "Sembunyikan" : "Lihat"}</button>
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-500)", cursor: "pointer", margin: "6px 0 20px" }}>
              <input type="checkbox" defaultChecked style={{ accentColor: "var(--brand-500)", width: 15, height: 15 }}/>
              Ingat saya di perangkat ini selama 7 hari
            </label>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", height: 44, fontSize: 14, justifyContent: "center" }}>
              Masuk ke Dashboard <Icon.Arrow size={16}/>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }}/>
              <span style={{ fontSize: 11.5, color: "var(--ink-400)", letterSpacing: ".04em" }}>ATAU</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }}/>
            </div>

            <button type="button" className="btn btn-secondary" style={{ width: "100%", height: 44, justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.8-2 13.2-5.2l-6.1-5.2c-2 1.4-4.5 2.4-7.1 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.1 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.1 5.2c-.4.4 6.7-4.9 6.7-14.6 0-1.3-.1-2.3-.4-3.5z"/></svg>
              Masuk dengan SSO Google Workspace
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink-400)", marginTop: 28 }}>
            Akses dibatasi untuk admin terdaftar. Semua aktivitas dicatat dalam audit log.
          </p>
        </div>
      </div>
    </div>
  );
}

window.LoginPage = LoginPage;
