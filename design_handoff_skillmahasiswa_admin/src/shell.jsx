/* App shell: Sidebar + TopBar */
const { useState, useEffect, useMemo, useRef } = React;

function Sidebar({ page, onNav, counts }) {
  const groups = [
    { label: "Umum", items: [
      { id: "dashboard",    label: "Dashboard",    icon: "Grid" },
    ]},
    { label: "Manajemen", items: [
      { id: "users",        label: "Manajemen User",  icon: "Users" },
      { id: "moderation",   label: "Moderasi Konten", icon: "Shield", badge: counts?.moderation },
      { id: "disputes",     label: "Dispute & Laporan", icon: "Flag",   badge: counts?.disputes },
      { id: "transactions", label: "Transaksi & Escrow", icon: "Wallet" },
    ]},
    { label: "Komunikasi & Konten", items: [
      { id: "chat",         label: "Live Chat", icon: "Msg", badge: counts?.chat, badgeSoft: false },
      { id: "articles",     label: "Artikel & Blog", icon: "Edit3" },
    ]},
    { label: "Sistem", items: [
      { id: "settings",     label: "Profil & Settings", icon: "Settings" },
    ]},
  ];
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-logo">Sm</div>
        <div>
          <div className="sb-brand-name">SkillMahasiswa</div>
          <div className="sb-brand-sub">Admin Console</div>
        </div>
      </div>
      <nav className="sb-nav">
        {groups.map((g, gi) => (
          <div key={gi}>
            <div className="sb-group">{g.label}</div>
            {g.items.map(item => {
              const Ic = Icon[item.icon];
              const isActive = page === item.id;
              return (
                <button key={item.id}
                  className={"sb-item" + (isActive ? " active" : "")}
                  onClick={() => onNav(item.id)}>
                  <Ic className="sb-icon" />
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className={"sb-badge" + (isActive ? " soft" : "")}>{item.badge}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="sb-footer">
        <div className="sb-avatar">AR</div>
        <div className="sb-footer-text">
          <div className="sb-footer-name">Adinda Rahmawati</div>
          <div className="sb-footer-role">Super Admin</div>
        </div>
        <button className="icon-btn" title="Logout" onClick={() => onNav("login")}><Icon.Logout /></button>
      </div>
    </aside>
  );
}

function TopBar({ title, crumbs, onSearchFocus }) {
  const [openNotif, setOpenNotif] = useState(false);
  const [openProf, setOpenProf]   = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) { setOpenNotif(false); setOpenProf(false); } };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);
  return (
    <header className="topbar" ref={ref}>
      <div style={{ minWidth: 180 }}>
        {crumbs && <div className="crumbs">{crumbs.map((c,i) => (
          <React.Fragment key={i}>{i>0 && <span className="sep"><Icon.ChevronRight size={12}/></span>}<span>{c}</span></React.Fragment>
        ))}</div>}
        <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 16, letterSpacing: "-.01em" }}>{title}</div>
      </div>

      <div className="tb-search" style={{ marginLeft: 20 }}>
        <Icon.Search size={16} />
        <input placeholder="Cari user, transaksi, laporan…" onFocus={onSearchFocus}/>
        <span className="tb-kbd">⌘K</span>
      </div>

      <div className="tb-right">
        <button className="tb-icon-btn" title="Bantuan">
          <Icon.AlertCircle />
        </button>
        <div style={{ position: "relative" }}>
          <button className="tb-icon-btn" onClick={(e)=>{e.stopPropagation(); setOpenNotif(v=>!v); setOpenProf(false);}}>
            <Icon.Bell />
            <span className="tb-dot"></span>
          </button>
          {openNotif && (
            <div style={{
              position: "absolute", right: 0, top: 46, width: 340,
              background: "#fff", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--sh-3)",
              zIndex: 60,
            }} onClick={e=>e.stopPropagation()}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Notifikasi</div>
                <button className="btn btn-ghost btn-xs">Tandai sudah dibaca</button>
              </div>
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                {NOTIF.map((n,i) => (
                  <div key={i} style={{ padding: "12px 16px", borderBottom: i < NOTIF.length-1 ? "1px solid var(--border)" : "none", display: "flex", gap: 10 }}>
                    <div className={"avatar avatar-sm " + avatarClass(n.title)} style={{ flexShrink: 0 }}>{n.title[0]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 2 }}>{n.body}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-300)", marginTop: 4 }}>{n.time} lalu</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 16px", textAlign: "center", fontSize: 12.5, fontWeight: 600, color: "var(--brand-600)", cursor: "pointer" }}>
                Lihat semua notifikasi
              </div>
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <button className="tb-profile" onClick={(e)=>{e.stopPropagation(); setOpenProf(v=>!v); setOpenNotif(false);}}>
            <div className="tb-avatar">AR</div>
            <span className="tb-profile-name">Adinda R.</span>
            <Icon.ChevronDown size={14} />
          </button>
          {openProf && (
            <div style={{
              position: "absolute", right: 0, top: 46, width: 220,
              background: "#fff", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--sh-3)",
              zIndex: 60, padding: 6,
            }} onClick={e=>e.stopPropagation()}>
              {[
                { l: "Profil Saya", ic: "Users" },
                { l: "Pengaturan", ic: "Settings" },
                { l: "Bantuan & Dukungan", ic: "AlertCircle" },
              ].map((it,i) => {
                const Ic = Icon[it.ic];
                return (
                  <button key={i} className="sb-item" style={{ margin: 0 }}><Ic className="sb-icon"/><span>{it.l}</span></button>
                );
              })}
              <div style={{ borderTop: "1px solid var(--border)", margin: "6px 4px" }}></div>
              <button className="sb-item" style={{ margin: 0, color: "var(--danger-700)" }}><Icon.Logout className="sb-icon" style={{color:"var(--danger-500)"}}/><span>Keluar</span></button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Shell({ page, onNav, counts, title, crumbs, children }) {
  return (
    <div className="app">
      <Sidebar page={page} onNav={onNav} counts={counts} />
      <main className="main">
        <TopBar title={title} crumbs={crumbs} />
        <div className="page">{children}</div>
      </main>
    </div>
  );
}

function Modal({ title, onClose, children, size, footer }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={"modal" + (size === "lg" ? " modal-lg" : "")} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
          <button className="icon-btn" onClick={onClose}><Icon.X /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

function Pagination({ page, total, per, onPage }) {
  const totalPages = Math.max(1, Math.ceil(total / per));
  const start = (page - 1) * per + 1;
  const end = Math.min(total, page * per);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 22px", borderTop: "1px solid var(--border)" }}>
      <div className="text-sm muted">Menampilkan <b style={{color:"var(--ink-700)"}}>{start}–{end}</b> dari <b style={{color:"var(--ink-700)"}}>{total}</b> data</div>
      <div style={{ display: "flex", gap: 4 }}>
        <button className="icon-btn" disabled={page <= 1} onClick={() => onPage(page-1)} style={{ opacity: page <=1 ? .5 : 1 }}><Icon.ChevronLeft size={16}/></button>
        {Array.from({length: Math.min(totalPages, 5)}, (_,i) => i+1).map(n => (
          <button key={n} className={"icon-btn"} onClick={() => onPage(n)}
            style={n === page ? { background: "var(--brand-500)", color: "#fff", borderColor: "var(--brand-500)" } : {}}>
            {n}
          </button>
        ))}
        {totalPages > 5 && <span style={{ alignSelf: "center", color: "var(--ink-400)" }}>…</span>}
        <button className="icon-btn" disabled={page >= totalPages} onClick={() => onPage(page+1)} style={{ opacity: page >= totalPages ? .5 : 1 }}><Icon.ChevronRight size={16}/></button>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    "Aktif":        "pill-success",
    "Suspended":    "pill-danger",
    "Pending":      "pill-warn",
    "Terbuka":      "pill-warn",
    "Diproses":     "pill-info",
    "Selesai":      "pill-success",
    "Ditolak":      "pill-neutral",
    "Ditinjau":     "pill-warn",
    "Aman":         "pill-success",
    "Dihapus":      "pill-danger",
    "Disembunyikan":"pill-neutral",
    "Ditahan":      "pill-warn",
    "Dicairkan":    "pill-success",
    "Refund":       "pill-danger",
    "Published":    "pill-success",
    "Draft":        "pill-neutral",
    "Tinggi":       "pill-danger",
    "Sedang":       "pill-warn",
    "Rendah":       "pill-neutral",
  };
  return <span className={"pill " + (map[status] || "pill-neutral")}>{status}</span>;
}

Object.assign(window, { Sidebar, TopBar, Shell, Modal, Pagination, StatusPill });
