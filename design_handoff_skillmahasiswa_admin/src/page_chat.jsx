function ChatPage() {
  const [activeId, setActiveId] = useState("S-01");
  const [filter, setFilter] = useState("Semua");
  const [draft, setDraft] = useState("");
  const sessions = CHAT_SESSIONS.filter(s => filter === "Semua" || (filter === "Belum dibaca" && s.unread > 0) || filter === s.role);
  const active = CHAT_SESSIONS.find(s => s.id === activeId);
  const messages = CHAT_MESSAGES[activeId] || CHAT_MESSAGES["S-01"];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="crumbs"><span>Beranda</span><span className="sep"><Icon.ChevronRight size={12}/></span><span>Live Chat</span></div>
          <div className="page-title">Live Chat Support</div>
          <div className="page-sub">Bantu pengguna secara langsung. 5 sesi aktif menunggu balasan.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary"><Icon.FileText size={16}/> Lihat template balasan</button>
        </div>
      </div>

      <div className="card" style={{ display: "grid", gridTemplateColumns: "320px 1fr 280px", height: "calc(100vh - 210px)", minHeight: 540, overflow: "hidden" }}>
        {/* Left: session list */}
        <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
            <div className="tb-search" style={{ background: "var(--surface-2)" }}>
              <Icon.Search size={16}/>
              <input placeholder="Cari percakapan…"/>
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
              {["Semua","Belum dibaca","Klien","Mahasiswa"].map(f => (
                <button key={f} onClick={() => setFilter(f)} className="btn btn-xs"
                  style={filter === f ? { background: "var(--brand-50)", color: "var(--brand-600)" } : { background: "transparent", color: "var(--ink-500)" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {sessions.map(s => (
              <button key={s.id} onClick={() => setActiveId(s.id)} style={{
                width: "100%", display: "flex", gap: 10, padding: "12px 14px",
                border: "none", background: activeId === s.id ? "var(--brand-50)" : "transparent",
                borderLeft: activeId === s.id ? "3px solid var(--brand-500)" : "3px solid transparent",
                cursor: "pointer", textAlign: "left",
              }}>
                <div style={{ position: "relative" }}>
                  <div className={"avatar " + ("av-" + s.avIdx)}>{initials(s.nama)}</div>
                  {s.online && <span style={{ position: "absolute", right: -1, bottom: -1, width: 10, height: 10, borderRadius: 50, background: "var(--success-500)", border: "2px solid #fff" }}/>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5, flex: 1 }} className="trunc">{s.nama}</span>
                    <span className="text-xs muted">{s.time}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <span style={{ flex: 1, fontSize: 12.5, color: s.unread > 0 ? "var(--ink-900)" : "var(--ink-400)", fontWeight: s.unread > 0 ? 500 : 400 }} className="trunc">{s.last}</span>
                    {s.unread > 0 && <span style={{ background: "var(--brand-500)", color: "#fff", fontSize: 10.5, fontWeight: 700, padding: "1px 6px", borderRadius: 999, minWidth: 18, textAlign: "center" }}>{s.unread}</span>}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <span className="pill pill-neutral no-dot" style={{ fontSize: 10 }}>{s.role}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: chat */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "var(--surface-2)" }}>
          {/* top panel */}
          <div style={{ padding: "12px 18px", background: "#fff", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
            <div className={"avatar " + ("av-" + active.avIdx)}>{initials(active.nama)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{active.nama}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--ink-400)" }}>
                <span style={{ width: 7, height: 7, borderRadius: 50, background: active.online ? "var(--success-500)" : "var(--ink-300)" }}/>
                {active.online ? "Online sekarang" : "Terakhir aktif 2 jam lalu"} · {active.role}
              </div>
            </div>
            <button className="icon-btn" title="Info"><Icon.AlertCircle size={14}/></button>
            <button className="icon-btn" title="Opsi"><Icon.More size={14}/></button>
            <button className="btn btn-sm btn-danger"><Icon.X size={14}/> Tutup Sesi</button>
          </div>

          {/* messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ alignSelf: "center", fontSize: 11, color: "var(--ink-400)", padding: "4px 10px", background: "#fff", border: "1px solid var(--border)", borderRadius: 999 }}>
              Hari ini, 20 April 2026
            </div>
            {messages.map((m,i) => (
              <div key={i} style={{ alignSelf: m.from === "me" ? "flex-end" : "flex-start", maxWidth: "72%" }}>
                <div style={{
                  padding: "10px 14px",
                  background: m.from === "me" ? "var(--brand-500)" : "#fff",
                  color: m.from === "me" ? "#fff" : "var(--ink-900)",
                  borderRadius: m.from === "me" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  boxShadow: m.from === "me" ? "none" : "var(--sh-1)",
                  border: m.from === "me" ? "none" : "1px solid var(--border)",
                }}>
                  {m.text}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--ink-400)", marginTop: 4, textAlign: m.from === "me" ? "right" : "left", padding: "0 6px" }}>
                  {m.time}{m.from === "me" && " · Terkirim ✓"}
                </div>
              </div>
            ))}
          </div>

          {/* input */}
          <div style={{ background: "#fff", borderTop: "1px solid var(--border)", padding: 14 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <button className="btn btn-xs btn-secondary">💡 Saran balasan</button>
              <button className="btn btn-xs btn-secondary">📎 Lampiran</button>
              <button className="btn btn-xs btn-secondary">📋 Kebijakan refund</button>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, border: "1px solid var(--border-strong)", borderRadius: 10, padding: 8, background: "#fff" }}>
              <button className="icon-btn" style={{ border: "none" }}><Icon.Paperclip size={16}/></button>
              <button className="icon-btn" style={{ border: "none" }}><Icon.Smile size={16}/></button>
              <textarea className="textarea" rows={1} style={{ border: "none", flex: 1, minHeight: 28, padding: "4px 6px", boxShadow: "none" }} placeholder="Ketik balasan..." value={draft} onChange={e=>setDraft(e.target.value)}/>
              <button className="btn btn-primary btn-sm"><Icon.Send size={14}/> Kirim</button>
            </div>
          </div>
        </div>

        {/* Right: user info */}
        <div style={{ borderLeft: "1px solid var(--border)", padding: 20, overflowY: "auto" }}>
          <div style={{ textAlign: "center" }}>
            <div className={"avatar avatar-xl " + ("av-" + active.avIdx)} style={{ margin: "0 auto" }}>{initials(active.nama)}</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginTop: 10 }}>{active.nama}</div>
            <div className="text-xs muted">{active.role} · {active.role === "Klien" ? "CL-0918" : "MH-2041"}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
              <button className="btn btn-xs btn-secondary"><Icon.Eye size={12}/> Profil</button>
              <button className="btn btn-xs btn-secondary"><Icon.Flag size={12}/> Blokir</button>
            </div>
          </div>

          <div style={{ marginTop: 20, padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10 }}>
            <div className="text-xs muted" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Info Kontak</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5 }}>
              <div><Icon.Mail size={12} style={{ color: "var(--ink-400)", verticalAlign: "middle", marginRight: 6 }}/>andika@kopipintar.id</div>
              <div>📞 +62 812-3456-7890</div>
              <div>📅 Bergabung 08 Jan 2025</div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div className="text-xs muted" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Transaksi Terkait</div>
            {[
              { id: "ORD-2406", label: "Jasa Website Company Profile", status: "Ditahan" },
              { id: "ORD-2380", label: "Landing Page + SEO", status: "Refund" },
            ].map((o,i) => (
              <div key={i} style={{ padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="mono text-xs" style={{ color: "var(--brand-600)", fontWeight: 600 }}>{o.id}</span>
                  <StatusPill status={o.status}/>
                </div>
                <div style={{ fontSize: 12.5, marginTop: 3 }}>{o.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <div className="text-xs muted" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Catatan Admin</div>
            <textarea className="textarea" rows={3} placeholder="Tambahkan catatan (hanya admin yang bisa melihat)..." defaultValue="User sudah 2x komplain terkait pelayanan mahasiswa. Dipantau."/>
          </div>
        </div>
      </div>
    </>
  );
}

window.ChatPage = ChatPage;
