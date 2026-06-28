function UsersPage() {
  const [tab, setTab] = useState("mahasiswa");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterProdi, setFilterProdi] = useState("Semua");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);

  const data = tab === "mahasiswa" ? MAHASISWA : KLIEN;
  const filtered = data.filter(u => {
    if (filterStatus !== "Semua" && u.status !== filterStatus) return false;
    if (tab === "mahasiswa" && filterProdi !== "Semua" && u.prodi !== filterProdi) return false;
    if (q && !(u.nama.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  return (
    <>
      <div className="page-head">
        <div>
          <div className="crumbs"><span>Beranda</span><span className="sep"><Icon.ChevronRight size={12}/></span><span>Manajemen User</span></div>
          <div className="page-title">Manajemen User</div>
          <div className="page-sub">Kelola akun mahasiswa freelancer dan klien yang terdaftar di platform.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary"><Icon.Download size={16}/> Ekspor CSV</button>
          <button className="btn btn-primary"><Icon.Plus size={16}/> Tambah User</button>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: "14px 22px 0" }}>
          <div className="tabs">
            <button className={"tab" + (tab === "mahasiswa" ? " active" : "")} onClick={() => setTab("mahasiswa")}>
              Mahasiswa <span className="pill pill-neutral no-dot" style={{ marginLeft: 6 }}>{MAHASISWA.length}</span>
            </button>
            <button className={"tab" + (tab === "klien" ? " active" : "")} onClick={() => setTab("klien")}>
              Klien <span className="pill pill-neutral no-dot" style={{ marginLeft: 6 }}>{KLIEN.length}</span>
            </button>
          </div>
        </div>

        <div style={{ padding: "0 22px 16px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div className="tb-search" style={{ maxWidth: 320, background: "#fff" }}>
            <Icon.Search size={16}/>
            <input placeholder={tab === "mahasiswa" ? "Cari nama atau email kampus…" : "Cari nama atau perusahaan…"} value={q} onChange={e=>setQ(e.target.value)}/>
          </div>
          <select className="select" style={{ width: 170 }} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option>Semua</option><option>Aktif</option><option>Suspended</option><option>Pending</option>
          </select>
          {tab === "mahasiswa" && (
            <select className="select" style={{ width: 220 }} value={filterProdi} onChange={e=>setFilterProdi(e.target.value)}>
              <option>Semua</option>
              <option>Teknik Informatika</option>
              <option>Sistem Informasi</option>
              <option>Informatika</option>
              <option>Ilmu Komputer</option>
              <option>Sistem Komputer</option>
              <option>Rekayasa Perangkat Lunak</option>
            </select>
          )}
          <button className="btn btn-secondary btn-sm"><Icon.Filter size={14}/> Filter lanjutan</button>
          <div style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--ink-400)" }}>
            {filtered.length} dari {data.length} hasil
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 30 }}><input type="checkbox"/></th>
                <th>{tab === "mahasiswa" ? "Mahasiswa" : "Klien"}</th>
                <th>{tab === "mahasiswa" ? "NIM" : "Perusahaan"}</th>
                <th>{tab === "mahasiswa" ? "Program Studi" : "Email"}</th>
                <th>Status</th>
                <th>{tab === "mahasiswa" ? "Rating" : "Pesanan"}</th>
                <th>Tgl. Daftar</th>
                <th style={{ width: 60 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td><input type="checkbox"/></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className={"avatar " + avatarClass(u.nama)}>{initials(u.nama)}</div>
                      <div>
                        <button onClick={() => setDetail(u)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--ink-900)", fontWeight: 600, fontSize: 13.5 }}>{u.nama}</button>
                        <div className="text-xs muted">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="num">{tab === "mahasiswa" ? u.nim : u.perusahaan}</td>
                  <td>{tab === "mahasiswa" ? u.prodi : <span className="muted text-sm">{u.email}</span>}</td>
                  <td><StatusPill status={u.status}/></td>
                  <td>
                    {tab === "mahasiswa" ? (
                      u.rating > 0 ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Icon.Star size={14} style={{ color: "var(--warn-500)", fill: "var(--warn-500)" }}/>
                          <span style={{ fontWeight: 600 }}>{u.rating.toFixed(1)}</span>
                          <span className="muted text-xs">({u.jobs})</span>
                        </div>
                      ) : <span className="muted text-xs">—</span>
                    ) : <span className="num">{u.jobs} pesanan</span>}
                  </td>
                  <td className="text-sm muted">{u.daftar}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="icon-btn" title="Lihat detail" onClick={() => setDetail(u)}><Icon.Eye size={14}/></button>
                      <button className="icon-btn" title="Opsi lainnya"><Icon.More size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty">
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
              <div style={{ fontWeight: 600, color: "var(--ink-700)" }}>Tidak ada hasil</div>
              <div className="text-sm">Coba ubah filter atau kata kunci pencarian.</div>
            </div>
          )}
        </div>
        <Pagination page={page} total={filtered.length} per={10} onPage={setPage}/>
      </div>

      {detail && (
        <Modal size="lg" title="Detail User" onClose={() => setDetail(null)} footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDetail(null)}>Tutup</button>
            {detail.status === "Aktif" ? (
              <button className="btn btn-danger"><Icon.Ban size={14}/> Suspend Akun</button>
            ) : detail.status === "Suspended" ? (
              <button className="btn btn-success"><Icon.CheckCircle size={14}/> Aktifkan Kembali</button>
            ) : (
              <button className="btn btn-primary"><Icon.Check size={14}/> Verifikasi & Aktifkan</button>
            )}
          </>
        }>
          <div style={{ display: "flex", gap: 16, alignItems: "center", paddingBottom: 18, borderBottom: "1px solid var(--border)" }}>
            <div className={"avatar avatar-xl " + avatarClass(detail.nama)}>{initials(detail.nama)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 20, letterSpacing: "-.01em" }}>{detail.nama}</div>
              <div className="muted text-sm">{detail.email}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <StatusPill status={detail.status}/>
                <span className="pill pill-neutral no-dot">{tab === "mahasiswa" ? "Mahasiswa" : "Klien"}</span>
                <span className="pill pill-info no-dot">ID {detail.id}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, padding: "18px 0" }}>
            {tab === "mahasiswa" ? (
              <>
                <InfoRow label="NIM" value={detail.nim}/>
                <InfoRow label="Program Studi" value={detail.prodi}/>
                <InfoRow label="Rating" value={detail.rating > 0 ? `⭐ ${detail.rating.toFixed(1)} (${detail.jobs} pesanan)` : "Belum ada rating"}/>
                <InfoRow label="Tanggal Daftar" value={detail.daftar}/>
              </>
            ) : (
              <>
                <InfoRow label="Perusahaan" value={detail.perusahaan}/>
                <InfoRow label="Total Pesanan" value={detail.jobs + " pesanan"}/>
                <InfoRow label="Nomor Telepon" value="+62 812-3456-7890"/>
                <InfoRow label="Tanggal Daftar" value={detail.daftar}/>
              </>
            )}
          </div>

          <div style={{ padding: "0 0 10px", fontWeight: 700, fontSize: 13 }}>Riwayat Transaksi</div>
          <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: 10 }}>
            {TRANSAKSI.slice(0, 3).map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px", borderBottom: "1px solid var(--border)" }}>
                <span className="mono text-xs" style={{ color: "var(--brand-600)", minWidth: 90 }}>{t.id}</span>
                <span style={{ flex: 1, fontSize: 13 }} className="trunc">{t.jasa}</span>
                <span className="mono text-sm">{fmtIDR(t.nominal)}</span>
                <StatusPill status={t.status}/>
              </div>
            ))}
          </div>

          <div style={{ padding: "14px 0 6px", fontWeight: 700, fontSize: 13 }}>Riwayat Laporan</div>
          <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: 10 }}>
            {LAPORAN.slice(0, 2).map(l => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px" }}>
                <span className="mono text-xs" style={{ color: "var(--brand-600)", minWidth: 90 }}>{l.id}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{l.jenis}</span>
                <span className="text-xs muted">{l.tanggal}</span>
                <StatusPill status={l.status}/>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-xs muted" style={{ marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 500, fontSize: 13.5 }}>{value}</div>
    </div>
  );
}

window.UsersPage = UsersPage;
