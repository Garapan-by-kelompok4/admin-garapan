function StatCard({ icon, label, value, delta, trend, accent, spark }) {
  const Ic = Icon[icon];
  const up = delta >= 0;
  return (
    <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 138 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 38, height: 38, borderRadius: 9,
          background: accent + "18", color: accent,
          display: "grid", placeItems: "center",
        }}><Ic size={20}/></div>
        <button className="icon-btn" style={{ border: "none", background: "transparent", width: 22, height: 22 }}><Icon.More size={16}/></button>
      </div>
      <div>
        <div style={{ fontSize: 12.5, color: "var(--ink-400)", fontWeight: 500 }}>{label}</div>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 28, fontWeight: 800, letterSpacing: "-.02em", marginTop: 4 }}>{value}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 12, fontWeight: 600,
          color: up ? "var(--success-700)" : "var(--danger-700)",
          background: up ? "var(--success-50)" : "var(--danger-50)",
          padding: "3px 8px", borderRadius: 999,
        }}>
          {up ? <Icon.ArrowUp size={12}/> : <Icon.ArrowDown size={12}/>} {Math.abs(delta)}%
        </span>
        <span className="muted text-xs">vs bulan lalu</span>
      </div>
      {spark && <Sparkline data={spark} color={accent} w={220} h={32} />}
    </div>
  );
}

function DashboardPage({ onNav }) {
  // 30-day transactions data
  const trxData = useMemo(() => {
    const base = [62, 58, 71, 65, 79, 84, 92, 88, 96, 103, 110, 98, 105, 112, 118, 125, 120, 132, 140, 148, 155, 162, 158, 170, 178, 185, 192, 188, 201, 215];
    return base.map((v, i) => ({ l: (i+1).toString().padStart(2,"0"), v }));
  }, []);

  const kategoriData = [
    { k: "Web Development",   v: 38, c: "#2047C9" },
    { k: "Mobile Development", v: 26, c: "#4A68E0" },
    { k: "UI/UX Design",       v: 18, c: "#7E95F0" },
    { k: "Digital Marketing",  v: 11, c: "#B6C3F9" },
    { k: "Lainnya",            v: 7,  c: "#DCE4FD" },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="crumbs"><span>Beranda</span><span className="sep"><Icon.ChevronRight size={12}/></span><span>Dashboard</span></div>
          <div className="page-title">Selamat datang kembali, Adinda 👋</div>
          <div className="page-sub">Berikut ringkasan aktivitas platform per {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary"><Icon.Calendar size={16}/> 30 hari terakhir <Icon.ChevronDown size={14}/></button>
          <button className="btn btn-secondary"><Icon.Download size={16}/> Ekspor laporan</button>
          <button className="btn btn-primary"><Icon.Plus size={16}/> Buat pengumuman</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <StatCard icon="Users"    label="Total User Aktif"         value="16.284"     delta={8.4}   accent="#2047C9" spark={[10,12,11,14,16,18,17,19,21,22,24,26,28]}/>
        <StatCard icon="Wallet"   label="Transaksi Bulan Ini"      value="1.942"      delta={12.1}  accent="#10B981" spark={[8,9,10,12,11,14,16,18,20,22,24,28,32]}/>
        <StatCard icon="TrendUp"  label="Pendapatan Platform (8%)" value="Rp 328,4 jt" delta={6.2}  accent="#F59E0B" spark={[20,22,25,24,28,30,32,35,38,40,43,46,50]}/>
        <StatCard icon="Flag"     label="Laporan Pending"          value="27"         delta={-4.3}  accent="#EF4444" spark={[42,38,40,35,32,30,28,31,29,27,30,28,27]}/>
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16, marginBottom: 20 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Transaksi 30 Hari Terakhir</div>
              <div className="text-sm muted">Jumlah pesanan selesai per hari</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["7H", "30H", "90H", "1T"].map((t,i) => (
                <button key={t} className={"btn btn-xs " + (i === 1 ? "btn-primary" : "btn-secondary")}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: "16px 22px 10px" }}>
            <div style={{ display: "flex", gap: 32, marginBottom: 6 }}>
              <div>
                <div className="text-xs muted">Total pesanan</div>
                <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 22, letterSpacing: "-.02em" }}>3.741</div>
              </div>
              <div>
                <div className="text-xs muted">Nilai transaksi</div>
                <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 22, letterSpacing: "-.02em" }}>Rp 4,1 M</div>
              </div>
              <div>
                <div className="text-xs muted">Rata-rata / hari</div>
                <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 22, letterSpacing: "-.02em" }}>124 pesanan</div>
              </div>
            </div>
            <LineChart data={trxData} height={230}/>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Kategori Jasa Populer</div>
            <button className="btn btn-ghost btn-xs">Detail <Icon.ChevronRight size={12}/></button>
          </div>
          <div style={{ padding: "16px 22px", display: "flex", gap: 20, alignItems: "center" }}>
            <DonutChart data={kategoriData.map(d => ({ v: d.v, c: d.c }))} size={170}/>
            <div style={{ flex: 1 }}>
              {kategoriData.map((d,i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: d.c }}/>
                  <span style={{ flex: 1, fontSize: 12.5 }}>{d.k}</span>
                  <span className="mono text-xs muted">{d.v}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity + Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Aktivitas Terbaru</div>
              <div className="text-sm muted">Pesanan baru, user baru, dan laporan masuk</div>
            </div>
            <button className="btn btn-ghost btn-sm">Lihat semua <Icon.ChevronRight size={12}/></button>
          </div>
          <div>
            {AKTIVITAS.map((a,i) => {
              const tone = a.type === "order" ? "var(--brand-500)" : a.type === "user" ? "var(--success-500)" : "var(--danger-500)";
              const bg   = a.type === "order" ? "var(--brand-50)"  : a.type === "user" ? "var(--success-50)"  : "var(--danger-50)";
              const Ic   = a.type === "order" ? Icon.Wallet : a.type === "user" ? Icon.Users : Icon.Flag;
              return (
                <div key={i} style={{
                  display: "flex", gap: 12, padding: "12px 22px",
                  borderBottom: i < AKTIVITAS.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems: "center"
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: bg, color: tone, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Ic size={16}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-900)" }}>{a.text}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 2 }}>{a.target}</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-400)", whiteSpace: "nowrap" }}>{a.time}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="stack gap-16">
          <div className="card">
            <div className="card-head"><div className="card-title">Perlu Perhatian</div></div>
            <div style={{ padding: 14 }}>
              {[
                { icon: "Flag", label: "Laporan Terbuka",          n: 12, tone: "danger",  nav: "disputes" },
                { icon: "Shield", label: "Konten Perlu Ditinjau",  n: 8,  tone: "warn",    nav: "moderation" },
                { icon: "Msg",    label: "Live Chat Menunggu",     n: 5,  tone: "info",    nav: "chat" },
                { icon: "Wallet", label: "Transaksi Escrow Tertahan", n: 23, tone: "neutral", nav: "transactions" },
              ].map((q,i) => {
                const Ic = Icon[q.icon];
                const bg = q.tone === "danger" ? "var(--danger-50)" : q.tone === "warn" ? "var(--warn-50)" : q.tone === "info" ? "var(--brand-50)" : "var(--surface-3)";
                const fg = q.tone === "danger" ? "var(--danger-700)" : q.tone === "warn" ? "var(--warn-700)" : q.tone === "info" ? "var(--brand-600)" : "var(--ink-500)";
                return (
                  <button key={i} onClick={() => onNav(q.nav)} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 10px",
                    background: "transparent", border: "none", borderRadius: 8, cursor: "pointer", textAlign: "left"
                  }} onMouseEnter={e=>e.currentTarget.style.background="var(--surface-2)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: bg, color: fg, display: "grid", placeItems: "center", flexShrink: 0 }}><Ic size={16}/></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{q.label}</div>
                    </div>
                    <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18, color: fg }}>{q.n}</div>
                    <Icon.ChevronRight size={14} style={{ color: "var(--ink-300)" }}/>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card" style={{
            background: "linear-gradient(135deg, #0F1729, #1F2B4D)",
            color: "#fff",
            border: "none",
          }}>
            <div style={{ padding: "20px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, opacity: .7, letterSpacing: ".04em", textTransform: "uppercase" }}>Kesehatan Sistem</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: 50, background: "var(--success-500)", boxShadow: "0 0 0 4px rgba(16,185,129,.25)" }}/>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Semua layanan beroperasi normal</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 16, fontSize: 12 }}>
                {[
                  { l: "API Gateway",    v: "99.98%", s: "ok" },
                  { l: "Payment Escrow", v: "99.91%", s: "ok" },
                  { l: "Push Notif",     v: "98.72%", s: "warn" },
                ].map((m,i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,.06)", padding: "10px 12px", borderRadius: 8 }}>
                    <div style={{ opacity: .65, fontSize: 11 }}>{m.l}</div>
                    <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 15, marginTop: 2 }}>{m.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.DashboardPage = DashboardPage;
