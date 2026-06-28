function DisputesPage() {
  const [status, setStatus] = useState("Semua");
  const [detail, setDetail] = useState(null);
  const filtered = LAPORAN.filter(l => status === "Semua" || l.status === status);
  return (
    <>
      <div className="page-head">
        <div>
          <div className="crumbs"><span>Beranda</span><span className="sep"><Icon.ChevronRight size={12}/></span><span>Dispute & Laporan</span></div>
          <div className="page-title">Dispute & Laporan</div>
          <div className="page-sub">Tangani laporan pengguna tentang transaksi, konten, atau pelanggaran ToS.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary"><Icon.Download size={16}/> Ekspor</button>
          <button className="btn btn-primary"><Icon.Plus size={16}/> Buat Laporan Internal</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { l: "Terbuka",  n: 12, d: "Belum ditangani", tone: "warn" },
          { l: "Diproses", n: 8,  d: "Sedang ditindaklanjuti", tone: "info" },
          { l: "Selesai",  n: 147, d: "30 hari terakhir", tone: "success" },
          { l: "SLA < 24j", n: 3, d: "Perlu perhatian segera", tone: "danger" },
        ].map((s,i) => {
          const bg = s.tone === "warn" ? "var(--warn-50)" : s.tone === "info" ? "var(--brand-50)" : s.tone === "success" ? "var(--success-50)" : "var(--danger-50)";
          const fg = s.tone === "warn" ? "var(--warn-700)" : s.tone === "info" ? "var(--brand-600)" : s.tone === "success" ? "var(--success-700)" : "var(--danger-700)";
          return (
            <div key={i} className="card card-pad">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12.5, color: "var(--ink-400)", fontWeight: 500 }}>{s.l}</div>
                <span className="pill no-dot" style={{ background: bg, color: fg, fontSize: 10.5 }}>{s.l}</span>
              </div>
              <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 28, letterSpacing: "-.02em", marginTop: 8 }}>{s.n}</div>
              <div className="text-xs muted" style={{ marginTop: 2 }}>{s.d}</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div style={{ padding: "14px 22px 12px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 4, background: "var(--surface-3)", padding: 3, borderRadius: 8 }}>
            {["Semua","Terbuka","Diproses","Selesai","Ditolak"].map(f => (
              <button key={f} onClick={() => setStatus(f)} className="btn btn-xs"
                style={status === f ? { background: "#fff", color: "var(--ink-900)", boxShadow: "0 1px 2px rgba(15,23,41,.08)" } : { background: "transparent", color: "var(--ink-500)" }}>
                {f}
              </button>
            ))}
          </div>
          <div className="tb-search" style={{ maxWidth: 260, background: "#fff", marginLeft: 8 }}>
            <Icon.Search size={16}/>
            <input placeholder="Cari ID atau nama…"/>
          </div>
          <select className="select" style={{ width: 190 }}>
            <option>Semua jenis masalah</option>
            <option>Hasil tidak sesuai brief</option>
            <option>Komunikasi tidak responsif</option>
            <option>Dugaan plagiarisme</option>
            <option>Permintaan refund</option>
            <option>Pelanggaran ToS</option>
          </select>
          <button className="btn btn-secondary btn-sm"><Icon.Calendar size={14}/> Rentang tanggal</button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Pelapor</th><th>Terlapor</th><th>Jenis Masalah</th><th>Prioritas</th><th>Status</th><th>Tanggal</th><th style={{ width: 120 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id}>
                <td><span className="mono text-sm" style={{ color: "var(--brand-600)", fontWeight: 600 }}>{l.id}</span></td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className={"avatar avatar-sm " + avatarClass(l.pelapor)}>{initials(l.pelapor)}</div>
                    <span style={{ fontSize: 13 }}>{l.pelapor}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className={"avatar avatar-sm " + avatarClass(l.terlapor)}>{initials(l.terlapor)}</div>
                    <span style={{ fontSize: 13 }}>{l.terlapor}</span>
                  </div>
                </td>
                <td style={{ fontSize: 13 }}>{l.jenis}</td>
                <td><StatusPill status={l.prioritas}/></td>
                <td><StatusPill status={l.status}/></td>
                <td className="text-sm muted">{l.tanggal}</td>
                <td>
                  <button className="btn btn-sm btn-secondary" onClick={() => setDetail(l)}><Icon.Eye size={14}/> Detail</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={1} total={filtered.length} per={10} onPage={() => {}}/>
      </div>

      {detail && <DisputeDetail dispute={detail} onClose={() => setDetail(null)}/>}
    </>
  );
}

function DisputeDetail({ dispute, onClose }) {
  const [resolusi, setResolusi] = useState("");
  return (
    <Modal size="lg" title={`Detail Laporan — ${dispute.id}`} onClose={onClose} footer={
      <>
        <button className="btn btn-secondary" onClick={onClose}>Tutup</button>
        <button className="btn btn-ghost" style={{ color: "var(--danger-700)" }}>Tolak Laporan</button>
        <button className="btn btn-primary" disabled={!resolusi}><Icon.Check size={14}/> Tutup Laporan (Selesai)</button>
      </>
    }>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        <StatusPill status={dispute.status}/>
        <StatusPill status={dispute.prioritas}/>
        <span className="pill pill-neutral no-dot"><Icon.Clock size={11}/> Dibuka {dispute.tanggal}</span>
        <span className="pill pill-neutral no-dot">Transaksi #TRX-84201</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        <div style={{ padding: 14, background: "var(--surface-2)", borderRadius: 10 }}>
          <div className="text-xs muted" style={{ marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>Pelapor</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className={"avatar avatar-lg " + avatarClass(dispute.pelapor)}>{initials(dispute.pelapor)}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{dispute.pelapor}</div>
              <div className="text-xs muted">Klien · CL-0918</div>
            </div>
          </div>
        </div>
        <div style={{ padding: 14, background: "var(--surface-2)", borderRadius: 10 }}>
          <div className="text-xs muted" style={{ marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>Terlapor</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className={"avatar avatar-lg " + avatarClass(dispute.terlapor)}>{initials(dispute.terlapor)}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{dispute.terlapor}</div>
              <div className="text-xs muted">Mahasiswa · MH-2041</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Deskripsi Masalah</div>
        <div style={{ padding: 14, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-700)" }}>
          Hasil website yang diserahkan tidak sesuai dengan brief awal. Brief meminta desain minimalis dengan palet warna corporate, tapi yang diterima justru template bootstrap standar dengan banyak animasi tidak perlu. Sudah meminta revisi 2x namun tidak ditanggapi selama 4 hari.
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Bukti Terlampir (3)</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ flex: 1, aspectRatio: "4/3", background: "repeating-linear-gradient(45deg, var(--surface-3), var(--surface-3) 6px, var(--surface-2) 6px, var(--surface-2) 12px)", borderRadius: 8, display: "grid", placeItems: "center", color: "var(--ink-300)" }}>
              <Icon.Image size={20}/>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Riwayat Komunikasi</div>
        <div style={{ position: "relative", paddingLeft: 20 }}>
          <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "var(--border)" }}/>
          {[
            { t: "19 Apr, 10:20", by: "Pelapor", text: "Mengajukan laporan dengan bukti screenshot percakapan." },
            { t: "19 Apr, 11:05", by: "Sistem",  text: "Laporan otomatis diteruskan ke tim moderasi (prioritas tinggi)." },
            { t: "19 Apr, 14:30", by: "Admin",   text: "Meminta klarifikasi kepada terlapor via email & in-app." },
            { t: "19 Apr, 16:45", by: "Terlapor", text: "Memberi tanggapan, menyatakan revisi sedang dikerjakan." },
          ].map((e,i) => (
            <div key={i} style={{ position: "relative", paddingBottom: 12 }}>
              <span style={{ position: "absolute", left: -18, top: 5, width: 10, height: 10, borderRadius: 50, background: "#fff", border: "2px solid var(--brand-500)" }}/>
              <div className="text-xs muted">{e.t} · <b style={{ color: "var(--ink-700)" }}>{e.by}</b></div>
              <div style={{ fontSize: 13 }}>{e.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Tindak Lanjut / Resolusi</div>
        <textarea className="textarea" rows={4} placeholder="Jelaskan keputusan & langkah yang diambil (contoh: refund parsial 50%, peringatan tertulis, dll)…" value={resolusi} onChange={e=>setResolusi(e.target.value)}/>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button className="btn btn-xs btn-secondary">Refund penuh</button>
          <button className="btn btn-xs btn-secondary">Refund parsial</button>
          <button className="btn btn-xs btn-secondary">Peringatan tertulis</button>
          <button className="btn btn-xs btn-secondary">Perpanjangan deadline</button>
        </div>
      </div>
    </Modal>
  );
}

window.DisputesPage = DisputesPage;
