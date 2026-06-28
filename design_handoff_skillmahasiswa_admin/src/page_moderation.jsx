function ModerationPage() {
  const [filter, setFilter] = useState("Semua");
  const [detail, setDetail] = useState(null);

  const filtered = KONTEN_FLAG.filter(k => filter === "Semua" || k.status === filter);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="crumbs"><span>Beranda</span><span className="sep"><Icon.ChevronRight size={12}/></span><span>Moderasi Konten</span></div>
          <div className="page-title">Moderasi Konten</div>
          <div className="page-sub">Tinjau jasa yang dilaporkan pengguna dan ambil tindakan sesuai panduan komunitas.</div>
        </div>
        <button className="btn btn-secondary"><Icon.Download size={16}/> Ekspor laporan moderasi</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { l: "Perlu Ditinjau",   n: 8,  tone: "warn" },
          { l: "Dilaporkan Hari Ini", n: 12, tone: "info" },
          { l: "Ditandai Aman",    n: 142, tone: "success" },
          { l: "Dihapus / Disembunyikan", n: 37,  tone: "danger" },
        ].map((s,i) => {
          const bg = s.tone === "warn" ? "var(--warn-50)" : s.tone === "info" ? "var(--brand-50)" : s.tone === "success" ? "var(--success-50)" : "var(--danger-50)";
          const fg = s.tone === "warn" ? "var(--warn-700)" : s.tone === "info" ? "var(--brand-600)" : s.tone === "success" ? "var(--success-700)" : "var(--danger-700)";
          return (
            <div key={i} className="card card-pad">
              <div style={{ fontSize: 12.5, color: "var(--ink-400)", fontWeight: 500 }}>{s.l}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
                <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 26, color: fg, letterSpacing: "-.02em" }}>{s.n}</div>
                <div className="pill no-dot" style={{ background: bg, color: fg, fontSize: 10.5 }}>7 hari</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div style={{ padding: "14px 22px 12px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 4, background: "var(--surface-3)", padding: 3, borderRadius: 8 }}>
            {["Semua", "Ditinjau", "Aman", "Disembunyikan", "Dihapus"].map(f => (
              <button key={f} onClick={() => setFilter(f)} className="btn btn-xs"
                style={filter === f ? { background: "#fff", color: "var(--ink-900)", boxShadow: "0 1px 2px rgba(15,23,41,.08)" } : { background: "transparent", color: "var(--ink-500)" }}>
                {f}
              </button>
            ))}
          </div>
          <div className="tb-search" style={{ maxWidth: 280, background: "#fff", marginLeft: 8 }}>
            <Icon.Search size={16}/>
            <input placeholder="Cari judul jasa atau pemilik…"/>
          </div>
          <button className="btn btn-secondary btn-sm"><Icon.Calendar size={14}/> 7 hari terakhir</button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Jasa</th>
              <th>Pemilik</th>
              <th>Kategori</th>
              <th>Laporan</th>
              <th>Status</th>
              <th>Tanggal Posting</th>
              <th style={{ width: 140 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(k => (
              <tr key={k.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 8, background: "repeating-linear-gradient(45deg, var(--surface-3), var(--surface-3) 4px, var(--surface-2) 4px, var(--surface-2) 8px)",
                      display: "grid", placeItems: "center", color: "var(--ink-300)", flexShrink: 0,
                    }}><Icon.Image size={18}/></div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }} className="trunc">{k.judul}</div>
                      <div className="mono text-xs" style={{ color: "var(--brand-600)" }}>{k.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className={"avatar avatar-sm " + avatarClass(k.pemilik)}>{initials(k.pemilik)}</div>
                    <span style={{ fontSize: 13 }}>{k.pemilik}</span>
                  </div>
                </td>
                <td><span className="pill pill-info no-dot">{k.kategori}</span></td>
                <td>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 999, background: k.laporan >= 5 ? "var(--danger-50)" : "var(--warn-50)", color: k.laporan >= 5 ? "var(--danger-700)" : "var(--warn-700)", fontWeight: 600, fontSize: 11.5 }}>
                    <Icon.Flag size={11}/> {k.laporan} laporan
                  </span>
                </td>
                <td><StatusPill status={k.status}/></td>
                <td className="text-sm muted">{k.posting}</td>
                <td>
                  <button className="btn btn-sm btn-secondary" onClick={() => setDetail(k)}><Icon.Eye size={14}/> Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={1} total={filtered.length} per={10} onPage={() => {}}/>
      </div>

      {detail && (
        <Modal size="lg" title="Review Konten Dilaporkan" onClose={() => setDetail(null)} footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDetail(null)}>Batal</button>
            <button className="btn btn-ghost"><Icon.Eye size={14}/> Sembunyikan</button>
            <button className="btn btn-danger"><Icon.Trash size={14}/> Hapus Jasa</button>
            <button className="btn btn-success"><Icon.Check size={14}/> Tandai Aman</button>
          </>
        }>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
            <div>
              <div style={{ aspectRatio: "16/10", background: "repeating-linear-gradient(45deg, var(--surface-3), var(--surface-3) 6px, var(--surface-2) 6px, var(--surface-2) 12px)", borderRadius: 10, display: "grid", placeItems: "center", color: "var(--ink-300)", fontFamily: "var(--f-mono)", fontSize: 11 }}>
                [ Preview thumbnail jasa ]
              </div>
              <div style={{ marginTop: 14, fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{detail.judul}</div>
              <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="pill pill-info no-dot">{detail.kategori}</span>
                <span className="pill pill-neutral no-dot">{detail.id}</span>
                <span className="pill pill-neutral no-dot">Rp 2.500.000 – Rp 8.000.000</span>
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: "var(--ink-500)", lineHeight: 1.6 }}>
                Saya menyediakan jasa pembuatan website company profile profesional dengan teknologi modern (React + Next.js). Termasuk: desain custom, halaman dinamis, integrasi kontak, SEO dasar, hosting 1 tahun. Pengerjaan cepat, harga mahasiswa.
              </div>
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8 }}>
                <div className={"avatar avatar-sm " + avatarClass(detail.pemilik)}>{initials(detail.pemilik)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{detail.pemilik}</div>
                  <div className="text-xs muted">⭐ 4.8 · 31 pesanan selesai</div>
                </div>
                <button className="btn btn-xs btn-secondary">Lihat profil</button>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Alasan Laporan ({detail.laporan})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { who: "Andika Surya",   reason: "Hasil tidak sesuai deskripsi", time: "2 jam lalu", avatarIdx: 1 },
                  { who: "Laras Wulandari", reason: "Mencurigakan, deskripsi mirip jasa lain (plagiarisme)", time: "5 jam lalu", avatarIdx: 3 },
                  { who: "Hendra Gunawan", reason: "Komunikasi buruk, minta pembayaran di luar platform", time: "Kemarin", avatarIdx: 4 },
                  { who: "Yoga Adrian",    reason: "Kualitas di bawah standar untuk harga yang diminta", time: "2 hari lalu", avatarIdx: 5 },
                  { who: "Monika Permata", reason: "Hasil tidak sesuai brief", time: "3 hari lalu", avatarIdx: 6 },
                ].slice(0, detail.laporan).map((r,i) => (
                  <div key={i} style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className={"avatar avatar-sm " + avatarClass(r.who)}>{initials(r.who)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 12.5 }}>{r.who}</div>
                        <div className="text-xs muted">{r.time}</div>
                      </div>
                      <span className="pill pill-warn no-dot">{i === 0 ? "Kualitas" : i === 1 ? "Plagiarisme" : "Komunikasi"}</span>
                    </div>
                    <div style={{ fontSize: 13, marginTop: 6, color: "var(--ink-700)" }}>"{r.reason}"</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

window.ModerationPage = ModerationPage;
