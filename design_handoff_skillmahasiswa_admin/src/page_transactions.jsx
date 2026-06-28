function TransactionsPage() {
  const [status, setStatus] = useState("Semua");
  const [detail, setDetail] = useState(null);
  const filtered = TRANSAKSI.filter(t => status === "Semua" || t.status === status);
  const total = TRANSAKSI.reduce((a,c) => a + c.nominal, 0);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="crumbs"><span>Beranda</span><span className="sep"><Icon.ChevronRight size={12}/></span><span>Transaksi & Escrow</span></div>
          <div className="page-title">Monitoring Transaksi & Escrow</div>
          <div className="page-sub">Pantau semua transaksi yang berjalan di platform dan status dana escrow.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary"><Icon.Download size={16}/> Ekspor laporan keuangan</button>
          <button className="btn btn-primary"><Icon.Wallet size={16}/> Lihat ringkasan bulanan</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { l: "Total Nilai Escrow",  n: fmtIDR(428500000), d: "142 transaksi aktif", tone: "info" },
          { l: "Ditahan",  n: fmtIDR(184200000), d: "23 transaksi · rata-rata 4 hari", tone: "warn" },
          { l: "Dicairkan Bulan Ini",  n: fmtIDR(3240000000), d: "519 transaksi · ↑12%", tone: "success" },
          { l: "Refund",   n: fmtIDR(12800000),  d: "7 transaksi · 0.4% total", tone: "danger" },
        ].map((s,i) => {
          const bg = s.tone === "warn" ? "var(--warn-50)" : s.tone === "info" ? "var(--brand-50)" : s.tone === "success" ? "var(--success-50)" : "var(--danger-50)";
          const fg = s.tone === "warn" ? "var(--warn-700)" : s.tone === "info" ? "var(--brand-600)" : s.tone === "success" ? "var(--success-700)" : "var(--danger-700)";
          return (
            <div key={i} className="card card-pad">
              <div style={{ fontSize: 12.5, color: "var(--ink-400)", fontWeight: 500 }}>{s.l}</div>
              <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 22, letterSpacing: "-.02em", marginTop: 6, color: fg }}>{s.n}</div>
              <div className="text-xs muted" style={{ marginTop: 4 }}>{s.d}</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div style={{ padding: "14px 22px 12px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 4, background: "var(--surface-3)", padding: 3, borderRadius: 8 }}>
            {["Semua","Ditahan","Dicairkan","Refund"].map(f => (
              <button key={f} onClick={() => setStatus(f)} className="btn btn-xs"
                style={status === f ? { background: "#fff", color: "var(--ink-900)", boxShadow: "0 1px 2px rgba(15,23,41,.08)" } : { background: "transparent", color: "var(--ink-500)" }}>
                {f}
              </button>
            ))}
          </div>
          <div className="tb-search" style={{ maxWidth: 260, background: "#fff", marginLeft: 8 }}>
            <Icon.Search size={16}/>
            <input placeholder="Cari ID transaksi, klien, mahasiswa…"/>
          </div>
          <select className="select" style={{ width: 180 }}>
            <option>Rentang nominal</option><option>&lt; Rp 1 juta</option><option>Rp 1–5 juta</option><option>Rp 5–10 juta</option><option>&gt; Rp 10 juta</option>
          </select>
          <button className="btn btn-secondary btn-sm"><Icon.Calendar size={14}/> 30 hari terakhir</button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>ID Transaksi</th><th>Klien</th><th>Mahasiswa</th><th>Jasa</th><th>Nominal</th><th>Status Escrow</th><th>Tanggal</th><th style={{ width: 80 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id}>
                <td><span className="mono text-sm" style={{ color: "var(--brand-600)", fontWeight: 600 }}>{t.id}</span></td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className={"avatar avatar-sm " + avatarClass(t.klien)}>{initials(t.klien)}</div>
                    <span style={{ fontSize: 13 }}>{t.klien}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className={"avatar avatar-sm " + avatarClass(t.mhs)}>{initials(t.mhs)}</div>
                    <span style={{ fontSize: 13 }}>{t.mhs}</span>
                  </div>
                </td>
                <td style={{ fontSize: 13, maxWidth: 220 }} className="trunc">{t.jasa}</td>
                <td><span className="mono" style={{ fontWeight: 600, color: "var(--ink-900)" }}>{fmtIDR(t.nominal)}</span></td>
                <td><StatusPill status={t.status}/></td>
                <td className="text-sm muted">{t.tanggal}</td>
                <td><button className="icon-btn" onClick={() => setDetail(t)}><Icon.Eye size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={1} total={filtered.length} per={10} onPage={() => {}}/>
      </div>

      {detail && (
        <Modal size="lg" title={`Detail Transaksi — ${detail.id}`} onClose={() => setDetail(null)} footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDetail(null)}>Tutup</button>
            {detail.status === "Ditahan" && <>
              <button className="btn btn-danger"><Icon.Ban size={14}/> Proses Refund</button>
              <button className="btn btn-success"><Icon.Check size={14}/> Cairkan Dana</button>
            </>}
          </>
        }>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 0 18px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--brand-50)", color: "var(--brand-600)", display: "grid", placeItems: "center" }}><Icon.Wallet size={22}/></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 24, letterSpacing: "-.02em" }}>{fmtIDR(detail.nominal)}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <StatusPill status={detail.status}/>
                <span className="text-xs muted">Dibuat {detail.tanggal}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "18px 0" }}>
            <div style={{ padding: 14, background: "var(--surface-2)", borderRadius: 10 }}>
              <div className="text-xs muted" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Klien</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className={"avatar " + avatarClass(detail.klien)}>{initials(detail.klien)}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{detail.klien}</div>
                  <div className="text-xs muted">CL-0918</div>
                </div>
              </div>
            </div>
            <div style={{ padding: 14, background: "var(--surface-2)", borderRadius: 10 }}>
              <div className="text-xs muted" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Mahasiswa (Freelancer)</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className={"avatar " + avatarClass(detail.mhs)}>{initials(detail.mhs)}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{detail.mhs}</div>
                  <div className="text-xs muted">MH-2041 · ⭐ 4.9</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Jasa</div>
            <div style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13.5 }}>
              <div style={{ fontWeight: 600 }}>{detail.jasa}</div>
              <div className="text-xs muted" style={{ marginTop: 4 }}>Paket Standar · Deadline 14 hari kerja · Termasuk 2x revisi</div>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Timeline Escrow</div>
            {[
              { t: "Pembayaran diterima",     time: detail.tanggal + ", 10:24", done: true,  note: "Via BCA VA · " + fmtIDR(detail.nominal) },
              { t: "Dana masuk escrow",       time: detail.tanggal + ", 10:26", done: true,  note: "Dana ditahan menunggu konfirmasi pengerjaan" },
              { t: "Pengerjaan dimulai",      time: "+2 jam",                    done: true,  note: "Mahasiswa mengkonfirmasi mulai mengerjakan" },
              { t: "Submit hasil akhir",      time: "14 hari",                   done: detail.status !== "Ditahan", note: "Mahasiswa mengirimkan deliverable final" },
              { t: "Dana dicairkan ke mahasiswa", time: "2 hari setelah approval", done: detail.status === "Dicairkan", note: "Komisi platform 8% ditahan" },
            ].map((step, i, arr) => (
              <div key={i} style={{ display: "flex", gap: 14, position: "relative" }}>
                {i < arr.length - 1 && <div style={{ position: "absolute", left: 11, top: 22, bottom: -8, width: 2, background: step.done ? "var(--success-500)" : "var(--border)" }}/>}
                <div style={{ width: 24, height: 24, borderRadius: 50, background: step.done ? "var(--success-500)" : "#fff", border: step.done ? "none" : "2px solid var(--border-strong)", display: "grid", placeItems: "center", flexShrink: 0, zIndex: 1 }}>
                  {step.done && <Icon.Check size={14} style={{ color: "#fff" }}/>}
                </div>
                <div style={{ flex: 1, paddingBottom: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: step.done ? "var(--ink-900)" : "var(--ink-400)" }}>{step.t}</div>
                  <div className="text-xs muted">{step.time}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-500)", marginTop: 2 }}>{step.note}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 6, padding: 14, background: "var(--surface-2)", borderRadius: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Bukti Pembayaran</div>
            <div style={{ display: "flex", gap: 10 }}>
              {[1,2].map(i => (
                <div key={i} style={{ width: 140, aspectRatio: "3/4", background: "repeating-linear-gradient(45deg, var(--surface-3), var(--surface-3) 6px, #fff 6px, #fff 12px)", borderRadius: 8, border: "1px solid var(--border)", display: "grid", placeItems: "center", color: "var(--ink-400)" }}>
                  <Icon.FileText size={22}/>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

window.TransactionsPage = TransactionsPage;
