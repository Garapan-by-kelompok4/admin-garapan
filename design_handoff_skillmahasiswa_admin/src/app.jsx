/* App root with client-side routing */
const safeLS = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};

function App() {
  const [page, setPage] = useState(() => safeLS.get("sm-admin-page") || "login");

  const nav = (p) => {
    setPage(p);
    safeLS.set("sm-admin-page", p);
    try { window.scrollTo(0, 0); } catch {}
  };

  const counts = { disputes: 12, moderation: 8, chat: 5 };

  if (page === "login") {
    return <LoginPage onLogin={() => nav("dashboard")}/>;
  }

  const titles = {
    dashboard: { t: "Dashboard", c: ["Beranda","Dashboard"] },
    users:        { t: "Manajemen User",     c: ["Beranda","Manajemen User"] },
    moderation:   { t: "Moderasi Konten",    c: ["Beranda","Moderasi Konten"] },
    disputes:     { t: "Dispute & Laporan",  c: ["Beranda","Dispute & Laporan"] },
    transactions: { t: "Transaksi & Escrow", c: ["Beranda","Transaksi & Escrow"] },
    chat:         { t: "Live Chat",          c: ["Beranda","Live Chat"] },
    articles:     { t: "Artikel & Blog",     c: ["Beranda","Artikel & Blog"] },
    settings:     { t: "Profil & Settings",  c: ["Beranda","Profil & Settings"] },
  };

  return (
    <Shell page={page} onNav={nav} counts={counts} title={titles[page].t} crumbs={titles[page].c}>
      {page === "dashboard"    && <DashboardPage onNav={nav}/>}
      {page === "users"        && <UsersPage/>}
      {page === "moderation"   && <ModerationPage/>}
      {page === "disputes"     && <DisputesPage/>}
      {page === "transactions" && <TransactionsPage/>}
      {page === "chat"         && <ChatPage/>}
      {page === "articles"     && <ArticlesPage/>}
      {page === "settings"     && <SettingsPage/>}
    </Shell>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
