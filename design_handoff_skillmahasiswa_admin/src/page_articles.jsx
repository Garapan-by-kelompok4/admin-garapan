function ArticlesPage() {
  const [editing, setEditing] = useState(false);
  const [filter, setFilter] = useState("Semua");

  if (editing) return <ArticleEditor onBack={() => setEditing(false)}/>;

  const filtered = ARTIKEL.filter(a => filter === "Semua" || a.status === filter);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="crumbs"><span>Beranda</span><span className="sep"><Icon.ChevronRight size={12}/></span><span>Artikel & Blog</span></div>
          <div className="page-title">Artikel & Blog</div>
          <div className="page-sub">Kelola konten edukasi dan tips untuk mahasiswa freelancer & klien.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary"><Icon.Folder size={16}/> Kategori</button>
          <button className="btn btn-primary" onClick={() => setEditing(true)}><Icon.Plus size={16}/> Buat Artikel Baru</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
        <div className="card card-pad">
          <div className="text-sm muted">Total Artikel</div>
          <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 26, marginTop: 4, letterSpacing: "-.02em" }}>47</div>
          <div className="text-xs muted" style={{ marginTop: 4 }}>34 Published · 13 Draft</div>
        </div>
        <div className="card card-pad">
          <div className="text-sm muted">Total Pembaca (30 hari)</div>
          <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 26, marginTop: 4, letterSpacing: "-.02em" }}>28.4K</div>
          <div className="text-xs muted" style={{ color: "var(--success-700)", marginTop: 4 }}>↑ 18% vs bulan lalu</div>
        </div>
        <div className="card card-pad">
          <div className="text-sm muted">Artikel Terpopuler</div>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginTop: 4, lineHeight: 1.3 }}>Cara Menentukan Harga Jasa Freelance saat Masih Kuliah</div>
          <div className="text-xs muted" style={{ marginTop: 4 }}>5.892 views · 08 Apr 2026</div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: "14px 22px 12px", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4, background: "var(--surface-3)", padding: 3, borderRadius: 8 }}>
            {["Semua","Published","Draft"].map(f => (
              <button key={f} onClick={() => setFilter(f)} className="btn btn-xs"
                style={filter === f ? { background: "#fff", color: "var(--ink-900)", boxShadow: "0 1px 2px rgba(15,23,41,.08)" } : { background: "transparent", color: "var(--ink-500)" }}>
                {f}
              </button>
            ))}
          </div>
          <div className="tb-search" style={{ maxWidth: 280, background: "#fff", marginLeft: 8 }}>
            <Icon.Search size={16}/>
            <input placeholder="Cari judul artikel…"/>
          </div>
          <select className="select" style={{ width: 160 }}>
            <option>Semua kategori</option>
            <option>Karier</option><option>Keuangan</option><option>Panduan</option><option>Tips</option>
          </select>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Artikel</th><th>Kategori</th><th>Status</th><th>Tgl. Publikasi</th><th>Views</th><th style={{ width: 100 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 56, height: 42, borderRadius: 6, background: "linear-gradient(135deg, var(--brand-100), var(--brand-50))", display: "grid", placeItems: "center", color: "var(--brand-500)", flexShrink: 0 }}>
                      <Icon.FileText size={16}/>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.3 }}>{a.judul}</div>
                      <div className="mono text-xs" style={{ color: "var(--brand-600)", marginTop: 2 }}>{a.id}</div>
                    </div>
                  </div>
                </td>
                <td><span className="pill pill-info no-dot">{a.kategori}</span></td>
                <td><StatusPill status={a.status}/></td>
                <td className="text-sm muted">{a.tanggal}</td>
                <td className="mono">{a.views > 0 ? a.views.toLocaleString("id-ID") : "—"}</td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="icon-btn" onClick={() => setEditing(true)} title="Edit"><Icon.Edit3 size={14}/></button>
                    <button className="icon-btn" title="Pratinjau"><Icon.Eye size={14}/></button>
                    <button className="icon-btn" title="Opsi"><Icon.More size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={1} total={filtered.length} per={10} onPage={() => {}}/>
      </div>
    </>
  );
}

function ArticleEditor({ onBack }) {
  const [judul, setJudul] = useState("5 Tips Menyusun Portofolio Mahasiswa IT yang Dilirik Klien");
  const [content, setContent] = useState("Bagi mahasiswa IT yang baru memulai karier freelance, portofolio adalah kartu nama terpenting. Klien akan menilai kualitas kerja Anda dari karya-karya yang ditampilkan.\n\nBerikut 5 tips menyusun portofolio yang efektif:\n\n1. Fokus pada proyek terbaik. Lebih baik 3 proyek berkualitas daripada 10 proyek biasa saja.\n\n2. Tampilkan proses, bukan hanya hasil. Ceritakan tantangan, pendekatan, dan solusi yang Anda ambil.\n\n3. Sertakan testimoni dari klien atau dosen. Bukti sosial meningkatkan kredibilitas.");

  return (
    <>
      <div className="page-head">
        <div>
          <div className="crumbs">
            <span style={{ cursor: "pointer" }} onClick={onBack}>Artikel & Blog</span>
            <span className="sep"><Icon.ChevronRight size={12}/></span>
            <span>Editor Artikel</span>
          </div>
          <div className="page-title">Editor Artikel</div>
          <div className="page-sub">Tulis dan publikasikan artikel baru. Perubahan tersimpan otomatis tiap 30 detik.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={onBack}>Batal</button>
          <button className="btn btn-secondary"><Icon.Eye size={16}/> Pratinjau</button>
          <button className="btn btn-ghost" style={{ border: "1px solid var(--border-strong)" }}>Simpan Draft</button>
          <button className="btn btn-primary"><Icon.Check size={16}/> Publikasikan</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <div className="card">
          <div style={{ padding: "24px 28px" }}>
            <input value={judul} onChange={e=>setJudul(e.target.value)} placeholder="Judul artikel..." style={{
              width: "100%", border: "none", outline: "none",
              fontFamily: "var(--f-display)", fontSize: 30, fontWeight: 800, letterSpacing: "-.02em",
              padding: "4px 0", marginBottom: 8,
            }}/>
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 14, borderBottom: "1px solid var(--border)", marginBottom: 14 }}>
              <span className="pill pill-neutral no-dot">Draft</span>
              <span className="text-xs muted">oleh Adinda R. · disimpan otomatis 10 detik lalu</span>
            </div>

            {/* Upload thumbnail */}
            <div style={{
              aspectRatio: "16/7",
              border: "2px dashed var(--border-strong)", borderRadius: 10,
              background: "var(--surface-2)",
              display: "grid", placeItems: "center", color: "var(--ink-400)",
              marginBottom: 18, cursor: "pointer"
            }}>
              <div style={{ textAlign: "center" }}>
                <Icon.Upload size={22}/>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6, color: "var(--ink-700)" }}>Upload Thumbnail Artikel</div>
                <div className="text-xs muted">PNG atau JPG · min 1200×630px · max 2MB</div>
              </div>
            </div>

            {/* Toolbar */}
            <div style={{ display: "flex", gap: 2, padding: "6px 8px", background: "var(--surface-2)", borderRadius: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <select className="select" style={{ width: 120, height: 30, fontSize: 12.5 }}>
                <option>Paragraf</option><option>Heading 1</option><option>Heading 2</option><option>Heading 3</option>
              </select>
              <span style={{ width: 1, background: "var(--border)", margin: "0 4px" }}/>
              {[Icon.Bold, Icon.Italic, Icon.Link, Icon.List, Icon.Image].map((I,i) => (
                <button key={i} className="icon-btn" style={{ border: "none", width: 30, height: 30 }}><I size={14}/></button>
              ))}
              <span style={{ width: 1, background: "var(--border)", margin: "0 4px" }}/>
              <button className="btn btn-xs btn-ghost" style={{ height: 30 }}>Kutipan</button>
              <button className="btn btn-xs btn-ghost" style={{ height: 30 }}>Code block</button>
            </div>

            <textarea className="textarea" value={content} onChange={e=>setContent(e.target.value)} rows={16} style={{ minHeight: 380, fontSize: 15, lineHeight: 1.7, border: "none", padding: 0, fontFamily: "var(--f-body)" }}/>
          </div>
        </div>

        <div className="stack gap-16">
          <div className="card">
            <div className="card-head"><div className="card-title">Pengaturan Publikasi</div></div>
            <div style={{ padding: 18 }}>
              <div className="field">
                <label className="label">Kategori</label>
                <select className="select">
                  <option>Karier</option><option>Keuangan</option><option>Panduan</option><option>Tips</option><option>Inspirasi</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Tag</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 8, border: "1px solid var(--border-strong)", borderRadius: 8, minHeight: 38 }}>
                  <span className="pill pill-info no-dot" style={{ fontSize: 12 }}>portofolio <Icon.X size={11}/></span>
                  <span className="pill pill-info no-dot" style={{ fontSize: 12 }}>mahasiswa <Icon.X size={11}/></span>
                  <span className="pill pill-info no-dot" style={{ fontSize: 12 }}>karier <Icon.X size={11}/></span>
                </div>
              </div>
              <div className="field">
                <label className="label">Jadwal Publikasi</label>
                <input className="input" type="text" defaultValue="Langsung publikasikan"/>
              </div>
              <div className="field">
                <label className="label">SEO Meta Description</label>
                <textarea className="textarea" rows={3} placeholder="Ringkasan singkat (150-160 karakter) untuk Google..." defaultValue="Panduan lengkap menyusun portofolio sebagai mahasiswa IT yang ingin mulai freelance. 5 tips praktis dengan contoh nyata."/>
              </div>
            </div>
          </div>

          <div className="card card-pad" style={{ background: "var(--brand-50)", borderColor: "var(--brand-100)" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--brand-700)" }}>💡 Tips SEO</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-500)", marginTop: 6, lineHeight: 1.5 }}>
              Judul sudah mengandung kata kunci yang baik. Pertimbangkan menambahkan subheading H2 di tengah artikel.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.ArticlesPage = ArticlesPage;
