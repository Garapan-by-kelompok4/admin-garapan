function SettingsPage() {
  const [tab, setTab] = useState("profil");
  return (
    <>
      <div className="page-head">
        <div>
          <div className="crumbs"><span>Beranda</span><span className="sep"><Icon.ChevronRight size={12}/></span><span>Profil & Settings</span></div>
          <div className="page-title">Profil & Pengaturan</div>
          <div className="page-sub">Kelola informasi akun admin, keamanan, dan preferensi notifikasi.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
        <div className="card" style={{ padding: 10, alignSelf: "flex-start" }}>
          {[
            { id: "profil",  l: "Informasi Profil", ic: "Users" },
            { id: "keamanan",l: "Keamanan & Password", ic: "Lock" },
            { id: "notifikasi", l: "Preferensi Notifikasi", ic: "Bell" },
            { id: "tim",     l: "Tim & Izin Akses", ic: "Shield" },
            { id: "log",     l: "Log Aktivitas", ic: "Clock" },
          ].map(m => {
            const Ic = Icon[m.ic];
            return (
              <button key={m.id} onClick={() => setTab(m.id)}
                className={"sb-item" + (tab === m.id ? " active" : "")} style={{ margin: 0 }}>
                <Ic className="sb-icon"/><span>{m.l}</span>
              </button>
            );
          })}
        </div>

        <div>
          {tab === "profil" && <ProfilePanel/>}
          {tab === "keamanan" && <SecurityPanel/>}
          {tab === "notifikasi" && <NotifPanel/>}
          {tab === "tim" && <TeamPanel/>}
          {tab === "log" && <LogPanel/>}
        </div>
      </div>
    </>
  );
}

function ProfilePanel() {
  return (
    <div className="card">
      <div className="card-head">
        <div><div className="card-title">Informasi Profil</div><div className="text-sm muted">Data ini ditampilkan di dalam sistem internal.</div></div>
        <button className="btn btn-primary btn-sm"><Icon.Check size={14}/> Simpan Perubahan</button>
      </div>
      <div style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, paddingBottom: 22, borderBottom: "1px solid var(--border)" }}>
          <div className="avatar avatar-xl av-0" style={{ width: 84, height: 84, fontSize: 28 }}>AR</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>Adinda Rahmawati</div>
            <div className="text-sm muted">Super Admin · admin@skillmahasiswa.id</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="btn btn-secondary btn-sm"><Icon.Upload size={13}/> Ganti Foto</button>
              <button className="btn btn-ghost btn-sm" style={{ color: "var(--danger-700)" }}>Hapus</button>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "22px 0" }}>
          <div className="field"><label className="label">Nama Lengkap</label><input className="input" defaultValue="Adinda Rahmawati"/></div>
          <div className="field"><label className="label">Email</label><input className="input" defaultValue="admin@skillmahasiswa.id" disabled style={{ background: "var(--surface-2)", color: "var(--ink-400)" }}/></div>
          <div className="field"><label className="label">Nomor Telepon</label><input className="input" defaultValue="+62 812-9900-1122"/></div>
          <div className="field"><label className="label">Role</label>
            <select className="select"><option>Super Admin</option><option>Moderator</option><option>Finance</option><option>Content</option></select>
          </div>
          <div className="field" style={{ gridColumn: "1/3" }}><label className="label">Bio Singkat</label>
            <textarea className="textarea" rows={3} defaultValue="Super admin SkillMahasiswa. Bertanggung jawab atas moderasi konten dan penyelesaian dispute."/>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityPanel() {
  return (
    <div className="stack gap-16">
      <div className="card">
        <div className="card-head"><div className="card-title">Ganti Password</div></div>
        <div style={{ padding: 22, maxWidth: 480 }}>
          <div className="field"><label className="label">Password Saat Ini</label><input className="input" type="password" defaultValue="••••••••"/></div>
          <div className="field"><label className="label">Password Baru</label><input className="input" type="password" placeholder="Minimal 10 karakter, 1 huruf besar, 1 angka"/></div>
          <div className="field"><label className="label">Konfirmasi Password Baru</label><input className="input" type="password"/></div>
          <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 8, fontSize: 12.5, color: "var(--ink-500)" }}>
            💡 Gunakan password yang kuat dan jangan pernah dibagikan. Admin lain tidak akan pernah meminta password Anda.
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16 }}><Icon.Check size={14}/> Perbarui Password</button>
        </div>
      </div>
      <div className="card">
        <div className="card-head"><div className="card-title">Verifikasi Dua Langkah (2FA)</div></div>
        <div style={{ padding: 22, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--success-50)", color: "var(--success-700)", display: "grid", placeItems: "center" }}><Icon.Shield size={20}/></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>Aplikasi Authenticator aktif</div>
            <div className="text-sm muted">Terhubung ke Google Authenticator · diatur 12 Feb 2025</div>
          </div>
          <button className="btn btn-secondary">Kelola</button>
        </div>
      </div>
    </div>
  );
}

function NotifPanel() {
  const items = [
    { cat: "Laporan & Dispute", opts: [
      { l: "Laporan baru masuk", email: true, push: true, sms: false },
      { l: "Laporan prioritas tinggi", email: true, push: true, sms: true },
      { l: "SLA hampir terlewat", email: true, push: true, sms: false },
    ]},
    { cat: "Transaksi", opts: [
      { l: "Transaksi nominal besar (>Rp 10 jt)", email: true, push: true, sms: false },
      { l: "Permintaan refund", email: true, push: false, sms: false },
      { l: "Escrow tertahan > 7 hari", email: false, push: true, sms: false },
    ]},
    { cat: "Komunikasi", opts: [
      { l: "Chat support baru", email: false, push: true, sms: false },
      { l: "Mention di komentar internal", email: true, push: true, sms: false },
    ]},
  ];
  return (
    <div className="card">
      <div className="card-head"><div className="card-title">Preferensi Notifikasi</div><button className="btn btn-primary btn-sm"><Icon.Check size={14}/> Simpan</button></div>
      <div style={{ padding: "10px 22px 22px" }}>
        <table className="table">
          <thead>
            <tr><th>Peristiwa</th><th style={{ width: 80, textAlign: "center" }}>Email</th><th style={{ width: 80, textAlign: "center" }}>Push</th><th style={{ width: 80, textAlign: "center" }}>SMS</th></tr>
          </thead>
          <tbody>
            {items.map((g,gi) => (
              <React.Fragment key={gi}>
                <tr><td colSpan={4} style={{ background: "var(--surface-2)", padding: "8px 18px", fontSize: 11.5, fontWeight: 700, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: ".05em" }}>{g.cat}</td></tr>
                {g.opts.map((o,i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 13.5 }}>{o.l}</td>
                    {["email","push","sms"].map(k => (
                      <td key={k} style={{ textAlign: "center" }}>
                        <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                          <input type="checkbox" defaultChecked={o[k]} style={{ accentColor: "var(--brand-500)", width: 16, height: 16 }}/>
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamPanel() {
  const team = [
    { nama: "Adinda Rahmawati", email: "admin@skillmahasiswa.id",     role: "Super Admin", status: "Aktif",     last: "baru saja" },
    { nama: "Farhan Mahendra",  email: "farhan@skillmahasiswa.id",    role: "Moderator",   status: "Aktif",     last: "10 menit lalu" },
    { nama: "Putri Nurhaliza",  email: "putri@skillmahasiswa.id",     role: "Finance",     status: "Aktif",     last: "2 jam lalu" },
    { nama: "Reza Fadhlan",     email: "reza@skillmahasiswa.id",      role: "Content",     status: "Aktif",     last: "Kemarin" },
    { nama: "Indira Nabila",    email: "indira@skillmahasiswa.id",    role: "Moderator",   status: "Nonaktif",  last: "3 hari lalu" },
  ];
  return (
    <div className="card">
      <div className="card-head"><div className="card-title">Tim & Izin Akses</div><button className="btn btn-primary btn-sm"><Icon.Plus size={14}/> Undang Admin</button></div>
      <table className="table">
        <thead><tr><th>Nama</th><th>Role</th><th>Status</th><th>Terakhir Aktif</th><th style={{ width: 60 }}></th></tr></thead>
        <tbody>
          {team.map((a,i) => (
            <tr key={i}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className={"avatar avatar-sm " + avatarClass(a.nama)}>{initials(a.nama)}</div>
                  <div><div style={{ fontWeight: 600, fontSize: 13 }}>{a.nama}</div><div className="text-xs muted">{a.email}</div></div>
                </div>
              </td>
              <td><span className="pill pill-info no-dot">{a.role}</span></td>
              <td><StatusPill status={a.status === "Aktif" ? "Aktif" : "Ditolak"}/></td>
              <td className="text-sm muted">{a.last}</td>
              <td><button className="icon-btn"><Icon.More size={14}/></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LogPanel() {
  const logs = [
    { t: "Hari ini, 10:42", a: "Adinda R.", act: "Menyetujui pencairan dana escrow TRX-84199" },
    { t: "Hari ini, 09:15", a: "Adinda R.", act: "Login dari Chrome · Jakarta, Indonesia" },
    { t: "Kemarin, 17:02",  a: "Farhan M.", act: "Menandai konten JS-1914 sebagai aman" },
    { t: "Kemarin, 14:37",  a: "Putri N.",  act: "Memproses refund TRX-84190 sebesar Rp 1.500.000" },
    { t: "Kemarin, 11:08",  a: "Adinda R.", act: "Mengaktifkan kembali akun MH-2044 (Kirana Ayu L.)" },
    { t: "2 hari lalu",     a: "Sistem",    act: "Backup database otomatis · 2,4 GB" },
  ];
  return (
    <div className="card">
      <div className="card-head"><div className="card-title">Log Aktivitas (30 hari terakhir)</div><button className="btn btn-secondary btn-sm"><Icon.Download size={14}/> Ekspor</button></div>
      <div style={{ padding: 6 }}>
        {logs.map((l,i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: i < logs.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center" }}>
            <div className={"avatar avatar-sm " + avatarClass(l.a)}>{initials(l.a)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}><b>{l.a}</b> {l.act}</div>
              <div className="text-xs muted">{l.t}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.SettingsPage = SettingsPage;
