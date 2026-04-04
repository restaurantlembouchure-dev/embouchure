import { useState, useEffect, useCallback, useRef } from "react";

const loadXLSX = () => new Promise((resolve, reject) => {
  if (window.XLSX) return resolve(window.XLSX);
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
  s.onload = () => resolve(window.XLSX);
  s.onerror = () => reject(new Error("Impossible de charger SheetJS"));
  document.head.appendChild(s);
});

class DB {
  constructor(url, key) {
    this.url = url.replace(/\/$/, "");
    this.headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" };
  }
  async _req(table, method = "GET", body, params = {}) {
    let url = `${this.url}/rest/v1/${table}`;
    const sp = new URLSearchParams(params);
    if (sp.toString()) url += `?${sp}`;
    const opts = { method, headers: { ...this.headers } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(await res.text());
    const txt = await res.text();
    return txt ? JSON.parse(txt) : [];
  }
  select(t, p = {}) { return this._req(t, "GET", null, p); }
  insert(t, rows) { return this._req(t, "POST", rows); }
  update(t, body, match) { return this._req(t, "PATCH", body, match); }
  delete(t, match) { return this._req(t, "DELETE", null, match); }
}

const C = {
  bg: "#0C0F0A", surface: "#1A1E16", surfaceAlt: "#232820",
  accent: "#D4A843", accentDark: "#B8912E", accentLight: "#E8C96A",
  text: "#F2EDE4", textMuted: "#9A958C",
  danger: "#C4453A", dangerBg: "#2A1614",
  success: "#5A9E5F", successBg: "#142016",
  border: "#2E332A", inputBg: "#14170F",
  blue: "#4A90D9", purple: "#9B59B6", orange: "#E57322", pink: "#E84393",
};
const F = { display: "'Playfair Display',Georgia,serif", body: "'DM Sans','Segoe UI',sans-serif", mono: "'JetBrains Mono',monospace" };

const injectCSS = () => {
  if (document.getElementById("lemb-css")) return;
  const l = document.createElement("link"); l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
  document.head.appendChild(l);
  const s = document.createElement("style"); s.id = "lemb-css";
  s.textContent = `*{margin:0;padding:0;box-sizing:border-box}body{background:${C.bg};color:${C.text};font-family:${F.body}}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}.fi{animation:fadeIn .35s ease both}`;
  document.head.appendChild(s);
};

const Wrap = ({ children }) => <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.bg, paddingBottom: 80 }}>{children}</div>;
const Btn = ({ children, onClick, v = "primary", disabled, icon, style = {} }) => {
  const vars = { primary: { background: C.accent, color: C.bg }, secondary: { background: C.surfaceAlt, color: C.text, border: `1px solid ${C.border}` }, danger: { background: C.danger, color: "#fff" }, success: { background: C.success, color: "#fff" }, ghost: { background: "transparent", color: C.textMuted } };
  return <button onClick={onClick} disabled={disabled} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 18px", borderRadius: 10, border: "none", fontFamily: F.body, fontWeight: 600, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .5 : 1, width: "100%", transition: "all .2s", ...vars[v], ...style }}>{icon && <span>{icon}</span>}{children}</button>;
};
const Inp = ({ label, value, onChange, type = "text", placeholder, style = {} }) => (
  <div style={{ marginBottom: 12, ...style }}>
    {label && <label style={{ display: "block", fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5 }}>{label}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "10px 12px", background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontFamily: F.body, fontSize: 14, outline: "none" }} />
  </div>
);
const Sel = ({ label, value, onChange, options, style = {} }) => (
  <div style={{ marginBottom: 12, ...style }}>
    {label && <label style={{ display: "block", fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5 }}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontFamily: F.body, fontSize: 14, outline: "none" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);
const Card = ({ children, style = {}, onClick, className="" }) => (
  <div onClick={onClick} className={className} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 8, cursor: onClick ? "pointer" : "default", transition: "border-color .2s", ...style }}>{children}</div>
);
const Badge = ({ children, color = C.accent }) => <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: color + "22", color }}>{children}</span>;
const Hdr = ({ title, sub, onBack, right }) => (
  <div style={{ padding: "14px 18px 10px", display: "flex", alignItems: "center", gap: 10 }}>
    {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: C.text, cursor: "pointer", padding: 4, fontSize: 20 }}>←</button>}
    <div style={{ flex: 1 }}><h2 style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700 }}>{title}</h2>{sub && <p style={{ fontSize: 12, color: C.textMuted, marginTop: 1 }}>{sub}</p>}</div>
    {right}
  </div>
);
const Toast = ({ msg, type = "success", onClose }) => { useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]); return <div className="fi" style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", padding: "10px 22px", borderRadius: 10, background: type === "error" ? C.danger : C.success, color: "#fff", fontWeight: 600, fontSize: 13, zIndex: 999, boxShadow: "0 8px 30px rgba(0,0,0,.4)" }}>{msg}</div>; };
const Loader = () => <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin .8s linear infinite" }} /></div>;
const Empty = ({ icon, msg }) => <div style={{ textAlign: "center", padding: "36px 20px", color: C.textMuted }}><div style={{ fontSize: 36 }}>{icon}</div><p style={{ marginTop: 10, fontSize: 13 }}>{msg}</p></div>;
const ProgressBar = ({ pct, color = C.accent }) => (<div style={{ height: 6, background: C.inputBg, borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: pct >= 100 ? C.success : color, borderRadius: 3, transition: "width .4s" }} /></div>);
const Pill = ({ label, active, onClick, color = C.accent }) => (<button onClick={onClick} style={{ padding: "6px 13px", borderRadius: 20, border: `1px solid ${active ? color : C.border}`, background: active ? color + "22" : "transparent", color: active ? color : C.textMuted, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer", fontFamily: F.body }}>{label}</button>);
const logAction = async (db, sid, uid, pid, action, detail) => { try { await db.insert("historique_actions", [{ service_id: sid, user_id: uid, poste_id: pid, action, detail }]); } catch {} };

function SetupScreen({ onConnect }) {
  const [url, setUrl] = useState(""); const [key, setKey] = useState("");
  const [testing, setTesting] = useState(false); const [error, setError] = useState("");
  const test = async () => {
    if (!url || !key) return setError("URL et clé requises");
    setTesting(true); setError("");
    try { const db = new DB(url, key); await db.select("users", { limit: 1 }); localStorage.setItem("lemb_db", JSON.stringify({ url, key })); onConnect(db); } catch (e) { setError("Connexion échouée: " + e.message); }
    setTesting(false);
  };
  return (
    <Wrap><div style={{ padding: 24, paddingTop: 80 }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}><div style={{ fontSize: 40, marginBottom: 8 }}>🍽️</div><h1 style={{ fontFamily: F.display, fontSize: 28, color: C.accent }}>L'Embouchure</h1><p style={{ color: C.textMuted, fontSize: 13, marginTop: 4 }}>Configuration initiale</p></div>
      <Card><Inp label="URL Supabase" value={url} onChange={setUrl} placeholder="https://xxx.supabase.co" /><Inp label="Clé API (anon)" value={key} onChange={setKey} placeholder="eyJhbG..." type="password" />{error && <p style={{ color: C.danger, fontSize: 12, marginBottom: 10 }}>{error}</p>}<Btn onClick={test} disabled={testing}>{testing ? "Connexion..." : "🔗 Connecter"}</Btn></Card>
      <p style={{ textAlign: "center", fontSize: 11, color: C.textMuted, marginTop: 16, lineHeight: 1.6 }}>1. Créez un projet sur supabase.com<br/>2. Exécutez le script SQL V3<br/>3. Copiez URL + clé depuis Settings → API</p>
    </div></Wrap>
  );
}

function LoginScreen({ db, onLogin }) {
  const [users, setUsers] = useState([]); const [sel, setSel] = useState(null); const [pin, setPin] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { db.select("users", { actif: "eq.true", order: "nom" }).then(u => { setUsers(u); setLoading(false); }).catch(() => setLoading(false)); }, [db]);
  const press = (d) => { if (pin.length >= 4) return; const np = pin + d; setPin(np); setError(""); if (np.length === 4 && sel) { if (sel.pin === np) onLogin(sel); else { setError("PIN incorrect"); setTimeout(() => setPin(""), 400); } } };
  if (loading) return <Wrap><Loader /></Wrap>;
  return (
    <Wrap><div style={{ padding: 24, paddingTop: 40 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}><h1 style={{ fontFamily: F.display, fontSize: 28, color: C.accent }}>L'Embouchure</h1><p style={{ color: C.textMuted, fontSize: 13, marginTop: 4 }}>Gestion de cuisine</p></div>
      {!sel ? (
        <div className="fi"><p style={{ fontSize: 12, color: C.textMuted, textAlign: "center", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Qui êtes-vous ?</p>
          {users.map(u => (<Card key={u.id} onClick={() => setSel(u)} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}><div style={{ width: 40, height: 40, borderRadius: "50%", background: C.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${C.border}`, fontSize: 18 }}>👤</div><div><div style={{ fontWeight: 600 }}>{u.nom}</div><div style={{ fontSize: 11, color: C.textMuted }}>{u.role === "manager" ? "Manager" : "Équipe"}</div></div></Card>))}
        </div>
      ) : (
        <div className="fi" style={{ textAlign: "center" }}>
          <button onClick={() => { setSel(null); setPin(""); setError(""); }} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, marginBottom: 16 }}>← Changer</button>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>{sel.nom}</h3>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 20 }}>{[0,1,2,3].map(i => <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < pin.length ? C.accent : C.border, transition: "all .15s" }} />)}</div>
          {error && <p style={{ color: C.danger, fontSize: 13, marginBottom: 10 }}>{error}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, maxWidth: 240, margin: "0 auto" }}>
            {[1,2,3,4,5,6,7,8,9,null,0,"⌫"].map((d,i) => (<button key={i} onClick={() => { if (d === "⌫") setPin(pin.slice(0,-1)); else if (d !== null) press(String(d)); }} disabled={d === null} style={{ width: 68, height: 52, borderRadius: 10, border: "none", background: d === null ? "transparent" : C.surface, color: C.text, fontSize: d === "⌫" ? 16 : 20, fontWeight: 600, fontFamily: F.body, cursor: d === null ? "default" : "pointer" }}>{d}</button>))}
          </div>
        </div>
      )}
    </div></Wrap>
  );
}

const Nav = ({ tab, setTab, isManager }) => {
  const tabs = [{ id: "home", icon: "🏠", label: "Accueil" }, { id: "service", icon: "🍳", label: "Service" }, { id: "stock", icon: "📦", label: "Stock" }, { id: "courses", icon: "🛒", label: "Courses" }];
  if (isManager) tabs.push({ id: "admin", icon: "⚙️", label: "Admin" });
  return (<div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", padding: "6px 0 env(safe-area-inset-bottom,8px)", zIndex: 100 }}>{tabs.map(t => (<button key={t.id} onClick={() => setTab(t.id)} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 1, padding: "5px 10px", cursor: "pointer", color: tab === t.id ? C.accent : C.textMuted }}><span style={{ fontSize: 18 }}>{t.icon}</span><span style={{ fontSize: 9, fontWeight: tab === t.id ? 700 : 500 }}>{t.label}</span></button>))}</div>);
};

function HomeTab({ db, user, onLogout, setTab, service }) {
  const [stats, setStats] = useState({ produits: 0, alertes: 0, courses: 0 }); const today = new Date().toISOString().split("T")[0];
  useEffect(() => { Promise.all([db.select("produits", { actif: "eq.true", select: "id,stock_actuel,stock_min" }), db.select("liste_courses", { commandee: "eq.false", select: "id" })]).then(([prods, cours]) => { setStats({ produits: prods.length, alertes: prods.filter(p => +p.stock_actuel <= +p.stock_min).length, courses: cours.length }); }); }, [db]);
  const phase = service?.phase || "aucun";
  const phaseLabels = { aucun: "Pas de service", checklist_ouverture: "Checklist ouverture", temperatures_ouverture: "Températures", controle_dlc: "Contrôle DLC", mep: "Mise en place", service_en_cours: "Service en cours", inventaire_mep: "Inventaire MEP", checklist_fermeture: "Checklist fermeture", temperatures_fermeture: "Temp. fermeture", cloture: "Clôture", termine: "Terminé" };
  const isManager = user.role === "manager";
  return (
    <div className="fi" style={{ padding: "0 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}><div><p style={{ fontSize: 12, color: C.textMuted }}>Bonjour</p><h2 style={{ fontFamily: F.display, fontSize: 22, color: C.accent }}>{user.nom}</h2></div><button onClick={onLogout} style={{ background: C.surfaceAlt, border: "none", borderRadius: 10, padding: 8, cursor: "pointer", fontSize: 16 }}>🚪</button></div>
      <Card style={{ background: service && phase !== "termine" ? C.successBg : C.surfaceAlt, borderColor: service && phase !== "termine" ? C.success + "44" : C.border }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: service && phase !== "termine" ? C.success : C.textMuted, animation: phase === "service_en_cours" ? "pulse 2s infinite" : "none" }} /><div><div style={{ fontWeight: 600, fontSize: 14 }}>{service ? `${service.type.toUpperCase()} — ${phaseLabels[phase]}` : "Aucun service actif"}</div><div style={{ fontSize: 11, color: C.textMuted }}>{today}{service ? ` · ${service.couverts_prevus} couverts` : ""}</div></div></div></Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "8px 0" }}>{[{ l: "Produits", v: stats.produits, c: C.accent }, { l: "Alertes", v: stats.alertes, c: stats.alertes > 0 ? C.danger : C.success }, { l: "Courses", v: stats.courses, c: C.blue }].map(s => <Card key={s.l} style={{ textAlign: "center", padding: 12 }}><div style={{ fontSize: 24, fontWeight: 700, fontFamily: F.display, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: C.textMuted }}>{s.l}</div></Card>)}</div>
      <p style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 12 }}>Actions rapides</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{[{ icon: "🍳", label: "Service", color: C.accent, t: "service" }, { icon: "📦", label: "Stock", color: C.success, t: "stock" }, { icon: "🛒", label: "Courses", color: C.blue, t: "courses" }, { icon: "⚙️", label: "Admin", color: C.purple, t: "admin" }].filter(a => a.t !== "admin" || isManager).map(a => (<Card key={a.label} onClick={() => setTab(a.t)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 12 }}><div style={{ width: 36, height: 36, borderRadius: 10, background: a.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{a.icon}</div><span style={{ fontSize: 12, fontWeight: 600 }}>{a.label}</span></Card>))}</div>
    </div>
  );
}

function ServiceTab({ db, user, service, setService, userPostes, toast, setToast }) {
  const [phase, setPhase] = useState(service?.phase || "checklist_ouverture"); const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [couverts, setCouverts] = useState("40"); const [typeService, setTypeService] = useState("midi"); const [prevision, setPrevision] = useState(null);
  useEffect(() => { if (service) setPhase(service.phase); }, [service]);
  useEffect(() => { const dow = new Date().getDay(); db.select("previsions_couverts", { jour_semaine: `eq.${dow}` }).then(p => { const prev = p.find(x => x.type_service === typeService); if (prev) { setPrevision(prev); setCouverts(String(Math.round(+prev.couverts_moyens))); } }); }, [db, typeService]);

  const createService = async () => {
    setLoading(true);
    try { const svc = await db.insert("services", [{ date: today, type: typeService, couverts_prevus: parseInt(couverts) || 40, statut: "ouvert", phase: "checklist_ouverture", ouvert_par: user.id }]); setService(svc[0]); await logAction(db, svc[0].id, user.id, null, "service_ouvert", `${typeService} — ${couverts} couverts`); setToast("Service créé !"); } catch (e) { setToast({ msg: e.message, type: "error" }); }
    setLoading(false);
  };
  const advancePhase = async (next) => { try { await db.update("services", { phase: next }, { id: `eq.${service.id}` }); setService({ ...service, phase: next }); setPhase(next); await logAction(db, service.id, user.id, null, "phase_change", next); } catch {} };

  if (!service) return (<div className="fi" style={{ padding: "0 18px" }}><Hdr title="Nouveau service" sub={today} /><Card style={{ padding: 18 }}><Sel label="Type de service" value={typeService} onChange={setTypeService} options={[{ value: "midi", label: "Midi" }, { value: "soir", label: "Soir" }]} /><Inp label={`Couverts prévus${prevision ? ` (moy: ${Math.round(+prevision.couverts_moyens)})` : ""}`} value={couverts} onChange={setCouverts} type="number" /><Btn onClick={createService} disabled={loading}>🍳 Ouvrir le service</Btn></Card></div>);

  const phases = ["checklist_ouverture","temperatures_ouverture","controle_dlc","mep","service_en_cours","inventaire_mep","checklist_fermeture","temperatures_fermeture","cloture"];
  const ci = phases.indexOf(phase);

  return (
    <div className="fi" style={{ padding: "0 18px" }}>
      <Hdr title={`Service ${service.type}`} sub={`${today} · ${service.couverts_prevus} couverts`} />
      <div style={{ display: "flex", gap: 4, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>{phases.map((p,i) => <div key={p} style={{ flex: "0 0 auto", height: 4, width: 32, borderRadius: 2, background: i < ci ? C.success : i === ci ? C.accent : C.border }} />)}</div>
      {phase === "checklist_ouverture" && <ChecklistPhase db={db} user={user} service={service} type="ouverture" userPostes={userPostes} onComplete={() => advancePhase("temperatures_ouverture")} setToast={setToast} />}
      {phase === "temperatures_ouverture" && <TemperaturesPhase db={db} user={user} service={service} moment="ouverture" onComplete={() => advancePhase("controle_dlc")} setToast={setToast} />}
      {phase === "controle_dlc" && <DLCPhase db={db} user={user} service={service} onComplete={() => advancePhase("mep")} setToast={setToast} />}
      {phase === "mep" && <MEPPhase db={db} user={user} service={service} userPostes={userPostes} onComplete={() => advancePhase("service_en_cours")} setToast={setToast} />}
      {phase === "service_en_cours" && <ServiceEnCoursPhase db={db} user={user} service={service} onComplete={() => advancePhase("inventaire_mep")} setToast={setToast} />}
      {phase === "inventaire_mep" && <InventaireMEPPhase db={db} user={user} service={service} onComplete={() => advancePhase("checklist_fermeture")} setToast={setToast} />}
      {phase === "checklist_fermeture" && <ChecklistPhase db={db} user={user} service={service} type="fermeture" userPostes={userPostes} onComplete={() => advancePhase("temperatures_fermeture")} setToast={setToast} />}
      {phase === "temperatures_fermeture" && <TemperaturesPhase db={db} user={user} service={service} moment="fermeture" onComplete={() => advancePhase("cloture")} setToast={setToast} />}
      {phase === "cloture" && <CloturePhase db={db} user={user} service={service} setService={setService} setToast={setToast} />}
      {phase === "termine" && <Card style={{ textAlign: "center", padding: 24 }}><div style={{ fontSize: 40 }}>✅</div><p style={{ fontWeight: 600, marginTop: 8 }}>Service clôturé</p></Card>}
    </div>
  );
}

function ChecklistPhase({ db, user, service, type, userPostes, onComplete, setToast }) {
  const [taches, setTaches] = useState([]); const [valids, setValids] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([db.select("taches_checklist", { type: `eq.${type}`, actif: "eq.true", order: "ordre" }), db.select("validations_checklist", { service_id: `eq.${service.id}` })]).then(([t, v]) => { const filtered = user.role === "manager" ? t : t.filter(tc => !tc.poste_id || userPostes.includes(tc.poste_id)); setTaches(filtered); setValids(v); setLoading(false); }); }, [db, service.id, type, user.role, userPostes]);
  const validate = async (tache) => { if (valids.some(v => v.tache_id === tache.id)) return; const v = await db.insert("validations_checklist", [{ service_id: service.id, tache_id: tache.id, valide_par: user.id }]); setValids([...valids, v[0]]); await logAction(db, service.id, user.id, tache.poste_id, `checklist_${type}`, tache.nom); };
  const allDone = taches.length > 0 && taches.every(t => valids.some(v => v.tache_id === t.id));
  if (loading) return <Loader />;
  return (<div><Card style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: 600, fontSize: 14 }}>{type === "ouverture" ? "📋" : "🔒"} Checklist {type}</span><Badge color={allDone ? C.success : C.accent}>{valids.length}/{taches.length}</Badge></Card>
    {taches.length === 0 ? <Empty icon="📋" msg="Aucune tâche configurée" /> : taches.map(t => { const done = valids.some(v => v.tache_id === t.id); return (<Card key={t.id} onClick={() => !done && validate(t)} style={{ display: "flex", alignItems: "center", gap: 12, cursor: done ? "default" : "pointer", opacity: done ? .6 : 1 }}><div style={{ width: 28, height: 28, borderRadius: 7, border: `2px solid ${done ? C.success : C.border}`, background: done ? C.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, color: "#fff" }}>{done && "✓"}</div><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13, textDecoration: done ? "line-through" : "none" }}>{t.nom}</div></div></Card>); })}
    {allDone && <Btn onClick={onComplete} v="success" style={{ marginTop: 10 }}>✅ Continuer</Btn>}
  </div>);
}

function TemperaturesPhase({ db, user, service, moment, onComplete, setToast }) {
  const [equips, setEquips] = useState([]); const [releves, setReleves] = useState([]); const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null); const [tempVal, setTempVal] = useState(""); const [corrective, setCorrective] = useState("");
  useEffect(() => { Promise.all([db.select("equipements_froid", { actif: "eq.true" }), db.select("releves_temperatures", { service_id: `eq.${service.id}`, moment: `eq.${moment}` })]).then(([e, r]) => { setEquips(e); setReleves(r); setLoading(false); }); }, [db, service.id, moment]);
  const saveTemp = async (equip) => {
    const temp = parseFloat(tempVal); if (isNaN(temp)) return;
    const conforme = temp >= +equip.seuil_min && temp <= +equip.seuil_max;
    if (!conforme && !corrective) { setToast({ msg: "Action corrective obligatoire", type: "error" }); return; }
    const r = await db.insert("releves_temperatures", [{ service_id: service.id, equipement_id: equip.id, temperature: temp, conforme, action_corrective: conforme ? null : corrective, moment, releve_par: user.id }]);
    setReleves([...releves, r[0]]); setEditId(null); setTempVal(""); setCorrective("");
    await logAction(db, service.id, user.id, null, "releve_temperature", `${equip.nom}: ${temp}°C ${conforme ? "✅" : "⚠️"}`);
  };
  const allDone = equips.length > 0 && equips.every(e => releves.some(r => r.equipement_id === e.id));
  if (loading) return <Loader />;
  return (<div><Card style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: 600, fontSize: 14 }}>🌡️ Températures ({moment})</span><Badge color={allDone ? C.success : C.accent}>{releves.length}/{equips.length}</Badge></Card>
    {equips.map(e => { const rel = releves.find(r => r.equipement_id === e.id); const isEd = editId === e.id; return (<Card key={e.id} style={{ borderColor: rel ? (rel.conforme ? C.success + "44" : C.danger + "44") : C.border }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><div><div style={{ fontWeight: 600, fontSize: 13 }}>{e.nom}</div><div style={{ fontSize: 11, color: C.textMuted }}>{e.seuil_min}°C → {e.seuil_max}°C</div></div>{rel ? <Badge color={rel.conforme ? C.success : C.danger}>{rel.temperature}°C</Badge> : !isEd && <button onClick={() => setEditId(e.id)} style={{ background: C.accent + "22", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: C.accent, fontWeight: 600 }}>Saisir</button>}</div>
      {isEd && <div style={{ marginTop: 10 }}><Inp label="Température (°C)" value={tempVal} onChange={setTempVal} type="number" placeholder="ex: 3.2" />{tempVal && (() => { const t = parseFloat(tempVal); const conf = t >= +e.seuil_min && t <= +e.seuil_max; return !conf ? <Inp label="⚠️ Action corrective" value={corrective} onChange={setCorrective} /> : null; })()}<Btn onClick={() => saveTemp(e)}>✅ Enregistrer</Btn></div>}</Card>); })}
    {allDone && <Btn onClick={onComplete} v="success" style={{ marginTop: 10 }}>✅ Continuer</Btn>}
  </div>);
}

function DLCPhase({ db, user, service, onComplete, setToast }) {
  const [checked, setChecked] = useState(false); const [alerts, setAlerts] = useState([]); const [produits, setProduits] = useState([]);
  const [selProd, setSelProd] = useState(""); const [dlcStatut, setDlcStatut] = useState("ok");
  useEffect(() => { db.select("produits", { actif: "eq.true", order: "nom" }).then(setProduits); }, [db]);
  const addAlert = async () => { if (!selProd) return; const prod = produits.find(p => p.id === parseInt(selProd)); await db.insert("controle_dlc", [{ service_id: service.id, produit_id: parseInt(selProd), statut: dlcStatut, action: dlcStatut === "depasse" ? "retrait" : null, controle_par: user.id }]); if (dlcStatut === "depasse" && prod) { await db.insert("pertes", [{ service_id: service.id, produit_id: prod.id, quantite: +prod.stock_actuel, motif: "DLC dépassée", valeur_euros: +prod.stock_actuel * +prod.prix_unitaire, declare_par: user.id }]); await db.update("produits", { stock_actuel: 0 }, { id: `eq.${prod.id}` }); } setAlerts([...alerts, { prod: prod?.nom, statut: dlcStatut }]); await logAction(db, service.id, user.id, null, "controle_dlc", `${prod?.nom} — ${dlcStatut}`); setSelProd(""); };
  return (<div><Card style={{ padding: 12 }}><span style={{ fontWeight: 600, fontSize: 14 }}>📋 Contrôle DLC</span></Card>
    <Card><Sel label="Produit avec alerte" value={selProd} onChange={setSelProd} options={[{ value: "", label: "-- Sélectionner --" }, ...produits.map(p => ({ value: String(p.id), label: p.nom }))]} /><Sel label="Statut" value={dlcStatut} onChange={setDlcStatut} options={[{ value: "ok", label: "✅ Conforme" }, { value: "jour_meme", label: "⚠️ DLC aujourd'hui" }, { value: "depasse", label: "❌ DLC dépassée" }]} /><Btn onClick={addAlert} v="secondary">➕ Signaler</Btn></Card>
    {alerts.map((a,i) => <Card key={i} style={{ borderColor: a.statut === "depasse" ? C.danger + "44" : C.accent + "44" }}><span style={{ fontSize: 13 }}>{a.statut === "depasse" ? "❌" : a.statut === "jour_meme" ? "⚠️" : "✅"} {a.prod}</span></Card>)}
    {!checked ? <Btn onClick={() => setChecked(true)} v="success" style={{ marginTop: 10 }}>✅ DLC vérifiées</Btn> : <Btn onClick={onComplete} v="success" style={{ marginTop: 10 }}>➡️ Passer à la MEP</Btn>}
  </div>);
}

function MEPPhase({ db, user, service, userPostes, onComplete, setToast }) {
  const [taches, setTaches] = useState([]); const [valids, setValids] = useState([]); const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null); const [qtyMod, setQtyMod] = useState("");
  useEffect(() => { Promise.all([db.select("taches_mep", { actif: "eq.true", order: "ordre" }), db.select("validations_mep", { service_id: `eq.${service.id}` })]).then(([t, v]) => { const filtered = user.role === "manager" ? t : t.filter(tc => !tc.poste_id || userPostes.includes(tc.poste_id)); setTaches(filtered); setValids(v); setLoading(false); }); }, [db, service.id, user.role, userPostes]);
  const calcQty = (t) => Math.max(0, Math.ceil((+t.couverts_ratio || 0) * service.couverts_prevus));
  const validate = async (tache, customQty) => { if (valids.some(v => v.tache_id === tache.id)) return; const qCalc = calcQty(tache); const qFinal = customQty !== undefined ? parseFloat(customQty) : qCalc; const v = await db.insert("validations_mep", [{ service_id: service.id, tache_id: tache.id, quantite_calculee: qCalc, quantite_modifiee: qFinal, valide_par: user.id }]); setValids([...valids, v[0]]); setEditId(null); setQtyMod(""); await logAction(db, service.id, user.id, tache.poste_id, "mep_validee", `${tache.nom}: ${qFinal} ${tache.unite}`); };
  const pct = taches.length > 0 ? Math.round((valids.length / taches.length) * 100) : 0;
  if (loading) return <Loader />;
  return (<div><Card style={{ padding: 12 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontWeight: 600, fontSize: 14 }}>🍳 Mise en Place</span><Badge color={pct >= 100 ? C.success : C.accent}>{pct}%</Badge></div><ProgressBar pct={pct} /><div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{service.couverts_prevus} couverts · {valids.length}/{taches.length}</div></Card>
    {taches.length === 0 ? <Empty icon="🍳" msg="Aucune tâche MEP configurée" /> : taches.map((t, i) => { const done = valids.some(v => v.tache_id === t.id); const qCalc = calcQty(t); const isEd = editId === t.id; return (<Card key={t.id} style={{ opacity: done ? .55 : 1, borderColor: done ? C.success + "44" : C.border }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div onClick={() => !done && !isEd && validate(t)} style={{ width: 28, height: 28, borderRadius: 7, border: `2px solid ${done ? C.success : C.border}`, background: done ? C.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, color: "#fff", cursor: "pointer" }}>{done ? "✓" : i + 1}</div><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{t.nom}</div><div style={{ fontSize: 11, color: C.textMuted }}>{qCalc > 0 ? `${qCalc} ${t.unite} recommandés` : ""}</div></div>{!done && <button onClick={() => setEditId(isEd ? null : t.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>✏️</button>}</div>{isEd && <div style={{ marginTop: 8, display: "flex", gap: 8 }}><Inp label="Qté" value={qtyMod} onChange={setQtyMod} type="number" placeholder={String(qCalc)} style={{ flex: 1, marginBottom: 0 }} /><Btn onClick={() => validate(t, qtyMod || qCalc)} style={{ width: "auto", marginTop: 18 }}>✅</Btn></div>}</Card>); })}
    {pct >= 100 && <Btn onClick={onComplete} v="success" style={{ marginTop: 10 }}>🚀 Lancer le service</Btn>}
  </div>);
}

function ServiceEnCoursPhase({ db, user, service, onComplete, setToast }) {
  const [produits, setProduits] = useState([]); const [plats, setPlats] = useState([]); const [subView, setSubView] = useState("carte");
  const [rupProd, setRupProd] = useState(""); const [rupPlat, setRupPlat] = useState("");
  const [perteProd, setPerteProd] = useState(""); const [perteQty, setPerteQty] = useState(""); const [perteMotif, setPerteMotif] = useState("casse");
  useEffect(() => { Promise.all([db.select("produits", { actif: "eq.true", order: "nom" }), db.select("plats_carte", { order: "ordre" })]).then(([p, pl]) => { setProduits(p); setPlats(pl); }); }, [db]);
  const declareRupture = async () => { if (!rupProd && !rupPlat) return; await db.insert("ruptures", [{ service_id: service.id, produit_id: rupProd ? parseInt(rupProd) : null, plat_id: rupPlat ? parseInt(rupPlat) : null, declare_par: user.id }]); await logAction(db, service.id, user.id, null, "rupture", `Produit: ${rupProd || "-"} Plat: ${rupPlat || "-"}`); setRupProd(""); setRupPlat(""); setToast("Rupture déclarée"); };
  const declarePerte = async () => { if (!perteProd || !perteQty) return; const prod = produits.find(p => p.id === parseInt(perteProd)); const val = (+perteQty * +(prod?.prix_unitaire || 0)).toFixed(2); await db.insert("pertes", [{ service_id: service.id, produit_id: parseInt(perteProd), quantite: parseFloat(perteQty), motif: perteMotif, valeur_euros: parseFloat(val), declare_par: user.id }]); if (prod) await db.update("produits", { stock_actuel: Math.max(0, +prod.stock_actuel - parseFloat(perteQty)) }, { id: `eq.${prod.id}` }); await logAction(db, service.id, user.id, null, "perte", `${prod?.nom}: ${perteQty} (${val}€)`); setPerteProd(""); setPerteQty(""); setToast("Perte enregistrée"); };
  const activeField = service.type === "midi" ? "actif_midi" : "actif_soir";
  return (<div>
    <Card style={{ padding: 12, background: C.successBg, borderColor: C.success + "44" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: C.success, animation: "pulse 2s infinite" }} /><span style={{ fontWeight: 600, fontSize: 14 }}>🔥 Service en cours</span></div></Card>
    <div style={{ display: "flex", gap: 6, margin: "8px 0" }}>{[{ id: "carte", l: "🍽️ Carte" }, { id: "rupture", l: "⚠️ Rupture" }, { id: "perte", l: "📉 Perte" }].map(t => <Pill key={t.id} label={t.l} active={subView === t.id} onClick={() => setSubView(t.id)} />)}</div>
    {subView === "carte" && (plats.filter(p => p[activeField]).length === 0 ? <Empty icon="🍽️" msg="Aucun plat actif. Ajoutez-en dans Admin → Carte" /> : plats.filter(p => p[activeField]).map(p => <Card key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><div><div style={{ fontWeight: 600, fontSize: 13 }}>{p.nom} {p.est_suggestion ? "🌟" : ""}</div><div style={{ fontSize: 11, color: C.textMuted }}>{p.categorie}</div></div><Badge color={C.success}>{p.prix}€</Badge></Card>))}
    {subView === "rupture" && <Card><Sel label="Produit" value={rupProd} onChange={setRupProd} options={[{ value: "", label: "-- Produit --" }, ...produits.map(p => ({ value: String(p.id), label: p.nom }))]} /><Sel label="Plat" value={rupPlat} onChange={setRupPlat} options={[{ value: "", label: "-- Plat --" }, ...plats.map(p => ({ value: String(p.id), label: p.nom }))]} /><Btn onClick={declareRupture} v="danger">⚠️ Déclarer</Btn></Card>}
    {subView === "perte" && <Card><Sel label="Produit" value={perteProd} onChange={setPerteProd} options={[{ value: "", label: "-- Produit --" }, ...produits.map(p => ({ value: String(p.id), label: p.nom }))]} /><Inp label="Quantité" value={perteQty} onChange={setPerteQty} type="number" /><Sel label="Motif" value={perteMotif} onChange={setPerteMotif} options={[{ value: "casse", label: "Casse" }, { value: "peremption", label: "Péremption" }, { value: "retour_client", label: "Retour client" }, { value: "erreur_preparation", label: "Erreur préparation" }]} /><Btn onClick={declarePerte} v="danger">📉 Déclarer</Btn></Card>}
    <Btn onClick={onComplete} v="secondary" style={{ marginTop: 14 }}>⏹️ Fin de service → Inventaire MEP</Btn>
  </div>);
}

function InventaireMEPPhase({ db, user, service, onComplete, setToast }) {
  const [taches, setTaches] = useState([]); const [valids, setValids] = useState([]); const [restes, setRestes] = useState({}); const [saved, setSaved] = useState(false); const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([db.select("taches_mep", { actif: "eq.true", order: "ordre" }), db.select("validations_mep", { service_id: `eq.${service.id}` })]).then(([t, v]) => { setTaches(t); setValids(v); setLoading(false); }); }, [db, service.id]);
  const mepTaches = taches.filter(t => valids.some(v => v.tache_id === t.id));
  const saveInv = async () => { const rows = mepTaches.map(t => { const v = valids.find(vl => vl.tache_id === t.id); const qPrep = +(v?.quantite_modifiee || v?.quantite_calculee || 0); const qRest = parseFloat(restes[t.id] || 0); return { service_id: service.id, tache_id: t.id, quantite_restante: qRest, ecart: qRest - qPrep, fait_par: user.id }; }); await db.insert("inventaire_mep", rows); await logAction(db, service.id, user.id, null, "inventaire_mep", `${rows.length} produits`); setSaved(true); setToast("Inventaire enregistré"); };
  if (loading) return <Loader />;
  return (<div><Card style={{ padding: 12 }}><span style={{ fontWeight: 600, fontSize: 14 }}>📊 Inventaire MEP</span></Card>
    {mepTaches.length === 0 ? <Empty icon="📊" msg="Aucune MEP" /> : mepTaches.map(t => { const v = valids.find(vl => vl.tache_id === t.id); const qPrep = +(v?.quantite_modifiee || v?.quantite_calculee || 0); return (<Card key={t.id} style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{t.nom}</div><div style={{ fontSize: 11, color: C.textMuted }}>Préparé: {qPrep} {t.unite}</div></div><input value={restes[t.id] || ""} onChange={e => setRestes({ ...restes, [t.id]: e.target.value })} type="number" placeholder="Reste" disabled={saved} style={{ width: 70, padding: "8px", background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, fontFamily: F.mono, textAlign: "center" }} /></Card>); })}
    {!saved ? <Btn onClick={saveInv} style={{ marginTop: 10 }}>💾 Enregistrer</Btn> : <Btn onClick={onComplete} v="success" style={{ marginTop: 10 }}>✅ Continuer</Btn>}
  </div>);
}

function CloturePhase({ db, user, service, setService, setToast }) {
  const [couvertsReels, setCouvertsReels] = useState(""); const [notes, setNotes] = useState(""); const [ventesData, setVentesData] = useState({}); const [plats, setPlats] = useState([]); const [step, setStep] = useState("ventes");
  useEffect(() => { db.select("plats_carte", { order: "ordre" }).then(setPlats); }, [db]);
  const saveVentes = async () => { const rows = Object.entries(ventesData).filter(([,q]) => parseInt(q) > 0).map(([pid, qty]) => ({ service_id: service.id, plat_id: parseInt(pid), quantite: parseInt(qty), saisi_par: user.id })); if (rows.length > 0) await db.insert("ventes_plats", rows); await logAction(db, service.id, user.id, null, "saisie_ventes", `${rows.length} plats`); setStep("recap"); };
  const closeService = async () => { const cr = parseInt(couvertsReels) || service.couverts_prevus; await db.update("services", { couverts_reels: cr, notes_cloture: notes, statut: "termine", phase: "termine", ferme_par: user.id }, { id: `eq.${service.id}` }); const dow = new Date().getDay(); const prevs = await db.select("previsions_couverts", { jour_semaine: `eq.${dow}`, type_service: `eq.${service.type}` }); if (prevs[0]) { const newMoy = Math.round((+prevs[0].couverts_moyens * 0.85) + (cr * 0.15)); await db.update("previsions_couverts", { couverts_moyens: newMoy, derniere_maj: new Date().toISOString().split("T")[0] }, { jour_semaine: `eq.${dow}`, type_service: `eq.${service.type}` }); } await logAction(db, service.id, user.id, null, "cloture_service", `Couverts réels: ${cr}`); setService({ ...service, phase: "termine", couverts_reels: cr }); setToast("Service clôturé !"); };
  if (step === "ventes") return (<div><Card style={{ padding: 12 }}><span style={{ fontWeight: 600, fontSize: 14 }}>📊 Saisie des ventes</span></Card>{plats.map(p => (<Card key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{p.nom}</div><div style={{ fontSize: 11, color: C.textMuted }}>{p.categorie}</div></div><input value={ventesData[p.id] || ""} onChange={e => setVentesData({ ...ventesData, [p.id]: e.target.value })} type="number" placeholder="0" style={{ width: 60, padding: "8px", background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, fontFamily: F.mono, textAlign: "center" }} /></Card>))}<Btn onClick={saveVentes} style={{ marginTop: 10 }}>💾 Enregistrer les ventes</Btn></div>);
  return (<div><Card style={{ padding: 12 }}><span style={{ fontWeight: 600, fontSize: 14 }}>🔒 Clôture</span></Card><Card><Inp label="Couverts réels" value={couvertsReels} onChange={setCouvertsReels} type="number" placeholder={String(service.couverts_prevus)} /><Inp label="Notes / Remarques" value={notes} onChange={setNotes} placeholder="Incidents, remarques..." /><Btn onClick={closeService} v="danger">🔒 Clôturer le service</Btn></Card></div>);
}

function StockTab({ db, user }) {
  const [produits, setProduits] = useState([]); const [categories, setCategories] = useState([]); const [fournisseurs, setFournisseurs] = useState([]);
  const [filter, setFilter] = useState("all"); const [search, setSearch] = useState(""); const [loading, setLoading] = useState(true); const [toast, setToast] = useState(null);
  const [editId, setEditId] = useState(null); const [editVal, setEditVal] = useState(""); const [showAdd, setShowAdd] = useState(false);
  const [np, setNp] = useState({ nom: "", categorie_id: "", unite: "kg", stock_min: "0", stock_actuel: "0", prix_unitaire: "0", fournisseur_id: "" });
  useEffect(() => { Promise.all([db.select("produits", { actif: "eq.true", order: "nom" }), db.select("categories", { order: "ordre" }), db.select("fournisseurs", { actif: "eq.true", order: "nom" })]).then(([p, c, f]) => { setProduits(p); setCategories(c); setFournisseurs(f); setLoading(false); }); }, [db]);
  const updateStock = async (pid) => { const val = parseFloat(editVal); if (isNaN(val)) return; await db.update("produits", { stock_actuel: val }, { id: `eq.${pid}` }); await db.insert("inventaire_stock", [{ produit_id: pid, quantite: val, fait_par: user.id }]); setProduits(produits.map(p => p.id === pid ? { ...p, stock_actuel: val } : p)); setEditId(null); setToast("Stock mis à jour"); };
  const addProd = async () => { if (!np.nom) return; const row = { nom: np.nom, categorie_id: np.categorie_id ? parseInt(np.categorie_id) : null, unite: np.unite, stock_min: parseFloat(np.stock_min) || 0, stock_actuel: parseFloat(np.stock_actuel) || 0, prix_unitaire: parseFloat(np.prix_unitaire) || 0, fournisseur_id: np.fournisseur_id ? parseInt(np.fournisseur_id) : null, actif: true }; const ins = await db.insert("produits", [row]); setProduits([...produits, ins[0]]); setNp({ nom: "", categorie_id: "", unite: "kg", stock_min: "0", stock_actuel: "0", prix_unitaire: "0", fournisseur_id: "" }); setShowAdd(false); setToast("Produit ajouté"); };
  const filtered = produits.filter(p => { if (search && !p.nom.toLowerCase().includes(search.toLowerCase())) return false; if (filter === "alerte") return +p.stock_actuel <= +p.stock_min; if (filter !== "all") return p.categorie_id === parseInt(filter); return true; });
  const alertCount = produits.filter(p => +p.stock_actuel <= +p.stock_min).length;
  if (loading) return <Loader />;
  return (<div className="fi" style={{ padding: "0 18px" }}>
    <Hdr title="Stock" sub={`${produits.length} produits`} right={<button onClick={() => setShowAdd(!showAdd)} style={{ background: C.accent, border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 16 }}>➕</button>} />
    {showAdd && <Card className="fi" style={{ padding: 16 }}><Inp label="Nom" value={np.nom} onChange={v => setNp({ ...np, nom: v })} /><Sel label="Catégorie" value={np.categorie_id} onChange={v => setNp({ ...np, categorie_id: v })} options={[{ value: "", label: "-- Aucune --" }, ...categories.map(c => ({ value: String(c.id), label: c.nom }))]} /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><Inp label="Unité" value={np.unite} onChange={v => setNp({ ...np, unite: v })} /><Inp label="Stock min" value={np.stock_min} onChange={v => setNp({ ...np, stock_min: v })} type="number" /><Inp label="Stock actuel" value={np.stock_actuel} onChange={v => setNp({ ...np, stock_actuel: v })} type="number" /><Inp label="Prix unit." value={np.prix_unitaire} onChange={v => setNp({ ...np, prix_unitaire: v })} type="number" /></div><Sel label="Fournisseur" value={np.fournisseur_id} onChange={v => setNp({ ...np, fournisseur_id: v })} options={[{ value: "", label: "-- Aucun --" }, ...fournisseurs.map(f => ({ value: String(f.id), label: f.nom }))]} /><Btn onClick={addProd}>💾 Ajouter</Btn></Card>}
    <Inp placeholder="🔍 Rechercher..." value={search} onChange={setSearch} />
    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8 }}>{[{ v: "all", l: "Tous" }, { v: "alerte", l: `⚠️ (${alertCount})` }, ...categories.map(c => ({ v: String(c.id), l: c.nom }))].map(f => <Pill key={f.v} label={f.l} active={filter === f.v} onClick={() => setFilter(f.v)} />)}</div>
    {filtered.map(p => { const isLow = +p.stock_actuel <= +p.stock_min; const cat = categories.find(c => c.id === p.categorie_id); return (<Card key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, borderColor: isLow ? C.danger + "44" : C.border }}><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{p.nom}</div><div style={{ fontSize: 11, color: C.textMuted }}>{cat?.nom || ""} · Min: {p.stock_min} {p.unite}</div></div>{editId === p.id ? <div style={{ display: "flex", gap: 4, alignItems: "center" }}><input value={editVal} onChange={e => setEditVal(e.target.value)} type="number" autoFocus style={{ width: 55, padding: "6px", background: C.inputBg, border: `1px solid ${C.accent}`, borderRadius: 6, color: C.text, fontSize: 14, fontFamily: F.mono, textAlign: "center" }} /><button onClick={() => updateStock(p.id)} style={{ background: C.success, border: "none", borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: "#fff", fontSize: 12 }}>✓</button></div> : <button onClick={() => { setEditId(p.id); setEditVal(String(p.stock_actuel)); }} style={{ background: isLow ? C.dangerBg : C.surfaceAlt, border: `1px solid ${isLow ? C.danger + "44" : C.border}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: isLow ? C.danger : C.text, fontWeight: 700, fontSize: 14, fontFamily: F.mono, minWidth: 48, textAlign: "center" }}>{p.stock_actuel}</button>}</Card>); })}
    {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
  </div>);
}

function CoursesTab({ db }) {
  const [items, setItems] = useState([]); const [produits, setProduits] = useState([]); const [loading, setLoading] = useState(true); const [toast, setToast] = useState(null);
  const [showAdd, setShowAdd] = useState(false); const [addProd, setAddProd] = useState(""); const [addQty, setAddQty] = useState(""); const [addUrg, setAddUrg] = useState("normal");
  useEffect(() => { Promise.all([db.select("liste_courses", { order: "created_at.desc" }), db.select("produits", { actif: "eq.true", order: "nom", select: "id,nom,unite,fournisseur_id,stock_actuel,stock_min" })]).then(([l, p]) => { setItems(l); setProduits(p); setLoading(false); }); }, [db]);
  const addItem = async () => { if (!addProd || !addQty) return; const prod = produits.find(p => p.id === parseInt(addProd)); const ins = await db.insert("liste_courses", [{ produit_id: parseInt(addProd), quantite: parseFloat(addQty), urgence: addUrg, fournisseur_id: prod?.fournisseur_id || null }]); setItems([ins[0], ...items]); setAddProd(""); setAddQty(""); setShowAdd(false); setToast("Ajouté"); };
  const autoGen = async () => { const prods = await db.select("produits", { actif: "eq.true" }); const low = prods.filter(p => +p.stock_actuel <= +p.stock_min); if (!low.length) return setToast({ msg: "Aucune alerte", type: "error" }); const rows = low.map(p => ({ produit_id: p.id, quantite: Math.max(1, +p.stock_min * 2 - +p.stock_actuel), urgence: +p.stock_actuel === 0 ? "urgent" : "normal", fournisseur_id: p.fournisseur_id })); const ins = await db.insert("liste_courses", rows); setItems([...ins, ...items]); setToast(`${ins.length} ajoutés`); };
  const toggle = async (item, field) => { const upd = { [field]: !item[field] }; if (field === "recue" && !item.recue) { const prod = produits.find(p => p.id === item.produit_id); if (prod) await db.update("produits", { stock_actuel: +prod.stock_actuel + +item.quantite }, { id: `eq.${prod.id}` }); } await db.update("liste_courses", upd, { id: `eq.${item.id}` }); setItems(items.map(i => i.id === item.id ? { ...i, ...upd } : i)); };
  const share = (method) => { const pending = items.filter(i => !i.commandee); const text = "🛒 LISTE DE COURSES\n" + pending.map(i => { const p = produits.find(pr => pr.id === i.produit_id); return `${i.urgence === "urgent" ? "🔴 " : ""}${p?.nom || "?"}: ${i.quantite} ${p?.unite || ""}`; }).join("\n"); if (method === "wa") window.open(`https://wa.me/?text=${encodeURIComponent(text)}`); else if (method === "email") window.open(`mailto:?subject=Liste%20courses&body=${encodeURIComponent(text)}`); else { const w = window.open(); w.document.write(`<pre style="font-size:14px;font-family:sans-serif">${text}</pre>`); w.print(); } };
  if (loading) return <Loader />;
  const pending = items.filter(i => !i.commandee); const ordered = items.filter(i => i.commandee && !i.recue); const received = items.filter(i => i.recue);
  return (<div className="fi" style={{ padding: "0 18px" }}>
    <Hdr title="Courses" sub={`${pending.length} à commander`} right={<button onClick={() => setShowAdd(!showAdd)} style={{ background: C.accent, border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 16 }}>➕</button>} />
    {showAdd && <Card className="fi"><Sel label="Produit" value={addProd} onChange={setAddProd} options={[{ value: "", label: "-- Choisir --" }, ...produits.map(p => ({ value: String(p.id), label: `${p.nom} (${p.stock_actuel} ${p.unite})` }))]} /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><Inp label="Quantité" value={addQty} onChange={setAddQty} type="number" /><Sel label="Urgence" value={addUrg} onChange={setAddUrg} options={[{ value: "normal", label: "Normal" }, { value: "urgent", label: "🔴 Urgent" }]} /></div><Btn onClick={addItem}>➕ Ajouter</Btn></Card>}
    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}><Btn v="secondary" onClick={autoGen} style={{ flex: 1, fontSize: 12 }}>⚡ Auto</Btn><button onClick={() => share("wa")} style={{ background: "#25D366", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 16 }}>💬</button><button onClick={() => share("email")} style={{ background: C.blue, border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 16 }}>📧</button><button onClick={() => share("print")} style={{ background: C.surfaceAlt, border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 16 }}>🖨️</button></div>
    {[{ t: "À commander", l: pending, b: C.danger }, { t: "Commandés", l: ordered, b: C.accent }, { t: "Reçus", l: received, b: C.success }].map(s => s.l.length > 0 && <div key={s.t}><div style={{ display: "flex", alignItems: "center", gap: 6, margin: "12px 0 6px" }}><span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase" }}>{s.t}</span><Badge color={s.b}>{s.l.length}</Badge></div>{s.l.map(item => { const prod = produits.find(p => p.id === item.produit_id); return (<Card key={item.id} style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{prod?.nom || "?"}</div><div style={{ fontSize: 11, color: C.textMuted }}>{item.quantite} {prod?.unite} {item.urgence === "urgent" ? "🔴" : ""}</div></div>{!item.commandee && <button onClick={() => toggle(item, "commandee")} style={{ background: C.accent + "22", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 11, color: C.accent, fontWeight: 600 }}>Commandé</button>}{item.commandee && !item.recue && <button onClick={() => toggle(item, "recue")} style={{ background: C.success + "22", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 11, color: C.success, fontWeight: 600 }}>Reçu</button>}</Card>); })}</div>)}
    {items.length === 0 && <Empty icon="🛒" msg="Liste vide" />}
    {toast && <Toast msg={typeof toast === "string" ? toast : toast.msg} type={typeof toast === "string" ? "success" : toast.type} onClose={() => setToast(null)} />}
  </div>);
}

function AdminTab({ db, user }) {
  const [sub, setSub] = useState("dashboard"); const [toast, setToast] = useState(null);
  const subs = [{ id: "dashboard", l: "📊" }, { id: "users", l: "👥" }, { id: "postes", l: "🏷️" }, { id: "taches", l: "📋" }, { id: "equips", l: "🌡️" }, { id: "plats", l: "🍽️" }, { id: "fournisseurs", l: "🚚" }, { id: "historique", l: "📜" }, { id: "temperatures", l: "🧊" }, { id: "import", l: "📥" }, { id: "export", l: "📤" }];
  return (<div className="fi" style={{ padding: "0 18px" }}>
    <Hdr title="Administration" />
    <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 8, marginBottom: 8 }}>{subs.map(s => <Pill key={s.id} label={s.l} active={sub === s.id} onClick={() => setSub(s.id)} />)}</div>
    {sub === "dashboard" && <DashSub db={db} />}
    {sub === "users" && <UsersSub db={db} st={setToast} />}
    {sub === "postes" && <PostesSub db={db} st={setToast} />}
    {sub === "taches" && <TachesSub db={db} st={setToast} />}
    {sub === "equips" && <EquipsSub db={db} st={setToast} />}
    {sub === "plats" && <PlatsSub db={db} st={setToast} />}
    {sub === "fournisseurs" && <FournSub db={db} st={setToast} />}
    {sub === "historique" && <HistSub db={db} />}
    {sub === "temperatures" && <TempSub db={db} />}
    {sub === "import" && <ImportSub db={db} st={setToast} />}
    {sub === "export" && <ExportSub db={db} st={setToast} />}
    {toast && <Toast msg={typeof toast === "string" ? toast : toast.msg} type={typeof toast === "string" ? "success" : toast.type} onClose={() => setToast(null)} />}
  </div>);
}

function DashSub({ db }) { const [s, setS] = useState(null); useEffect(() => { const today = new Date().toISOString().split("T")[0]; Promise.all([db.select("services", { date: `eq.${today}` }), db.select("pertes", { select: "valeur_euros", limit: 50 }), db.select("ruptures", { select: "id", limit: 50 }), db.select("produits", { actif: "eq.true", select: "id,stock_actuel,stock_min" })]).then(([sv, pe, ru, pr]) => { setS({ services: sv.length, pertes: pe.reduce((a, p) => a + (+p.valeur_euros || 0), 0).toFixed(2), ruptures: ru.length, alertes: pr.filter(p => +p.stock_actuel <= +p.stock_min).length }); }); }, [db]); if (!s) return <Loader />; return (<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{[{ l: "Services", v: s.services, c: C.accent }, { l: "Pertes €", v: s.pertes + "€", c: C.danger }, { l: "Ruptures", v: s.ruptures, c: C.orange }, { l: "Alertes", v: s.alertes, c: s.alertes > 0 ? C.danger : C.success }].map(x => <Card key={x.l} style={{ textAlign: "center", padding: 14 }}><div style={{ fontSize: 22, fontWeight: 700, fontFamily: F.display, color: x.c }}>{x.v}</div><div style={{ fontSize: 10, color: C.textMuted }}>{x.l}</div></Card>)}</div>); }

function UsersSub({ db, st }) { const [users, setUsers] = useState([]); const [postes, setPostes] = useState([]); const [ups, setUps] = useState([]); const [nw, setNw] = useState({ nom: "", pin: "", role: "equipe" }); const [sp, setSp] = useState([]); useEffect(() => { Promise.all([db.select("users", { order: "nom" }), db.select("postes"), db.select("user_postes")]).then(([u, p, up]) => { setUsers(u); setPostes(p); setUps(up); }); }, [db]); const add = async () => { if (!nw.nom || !nw.pin) return; const u = await db.insert("users", [{ ...nw, actif: true }]); if (sp.length) await db.insert("user_postes", sp.map(pid => ({ user_id: u[0].id, poste_id: pid }))); setUsers([...users, u[0]]); setNw({ nom: "", pin: "", role: "equipe" }); setSp([]); st("Ajouté"); }; const tp = (pid) => setSp(sp.includes(pid) ? sp.filter(x => x !== pid) : [...sp, pid]); return (<div><Card><Inp label="Nom" value={nw.nom} onChange={v => setNw({ ...nw, nom: v })} /><Inp label="PIN" value={nw.pin} onChange={v => setNw({ ...nw, pin: v })} type="number" /><Sel label="Rôle" value={nw.role} onChange={v => setNw({ ...nw, role: v })} options={[{ value: "equipe", label: "Équipe" }, { value: "manager", label: "Manager" }]} /><div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, color: C.textMuted, marginBottom: 6, fontWeight: 600, textTransform: "uppercase" }}>Postes</label><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{postes.map(p => <Pill key={p.id} label={p.nom} active={sp.includes(p.id)} onClick={() => tp(p.id)} color={p.couleur} />)}</div></div><Btn onClick={add}>➕ Ajouter</Btn></Card>{users.map(u => { const pn = ups.filter(x => x.user_id === u.id).map(x => postes.find(p => p.id === x.poste_id)?.nom).filter(Boolean); return (<Card key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, opacity: u.actif ? 1 : .5 }}><div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{u.nom} <Badge color={u.role === "manager" ? C.accent : C.blue}>{u.role}</Badge></div><div style={{ fontSize: 11, color: C.textMuted }}>PIN: {u.pin}{pn.length ? ` · ${pn.join(", ")}` : ""}</div></div><button onClick={async () => { await db.update("users", { actif: !u.actif }, { id: `eq.${u.id}` }); setUsers(users.map(x => x.id === u.id ? { ...x, actif: !x.actif } : x)); }} style={{ background: u.actif ? C.danger + "22" : C.success + "22", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 10, fontWeight: 600, color: u.actif ? C.danger : C.success }}>{u.actif ? "Désact." : "Activer"}</button></Card>); })}</div>); }

function PostesSub({ db, st }) { const [ps, setPs] = useState([]); const [nom, setNom] = useState(""); const [col, setCol] = useState("#D4A843"); useEffect(() => { db.select("postes", { order: "nom" }).then(setPs); }, [db]); const add = async () => { if (!nom) return; const p = await db.insert("postes", [{ nom, couleur: col }]); setPs([...ps, p[0]]); setNom(""); st("Créé"); }; return (<div><Card><div style={{ display: "flex", gap: 8 }}><Inp label="Nom" value={nom} onChange={setNom} style={{ flex: 1 }} /><Inp label="Couleur" value={col} onChange={setCol} type="color" style={{ width: 60 }} /></div><Btn onClick={add}>➕ Créer</Btn></Card>{ps.map(p => <Card key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 16, height: 16, borderRadius: 4, background: p.couleur }} /><span style={{ fontWeight: 600, fontSize: 13 }}>{p.nom}</span></Card>)}</div>); }

function TachesSub({ db, st }) { const [ts, setTs] = useState([]); const [ps, setPs] = useState([]); const [type, setType] = useState("ouverture"); const [nom, setNom] = useState(""); const [pid, setPid] = useState(""); useEffect(() => { Promise.all([db.select("taches_checklist", { order: "type,ordre" }), db.select("postes")]).then(([t, p]) => { setTs(t); setPs(p); }); }, [db]); const add = async () => { if (!nom) return; const t = await db.insert("taches_checklist", [{ nom, type, poste_id: pid ? parseInt(pid) : null, ordre: ts.filter(x => x.type === type).length + 1 }]); setTs([...ts, t[0]]); setNom(""); st("Ajoutée"); }; return (<div><Card><Sel label="Type" value={type} onChange={setType} options={[{ value: "ouverture", label: "📋 Ouverture" }, { value: "fermeture", label: "🔒 Fermeture" }]} /><Inp label="Tâche" value={nom} onChange={setNom} /><Sel label="Poste" value={pid} onChange={setPid} options={[{ value: "", label: "-- Tous --" }, ...ps.map(p => ({ value: String(p.id), label: p.nom }))]} /><Btn onClick={add}>➕</Btn></Card>{["ouverture", "fermeture"].map(tp => <div key={tp}><p style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", margin: "12px 0 6px" }}>{tp}</p>{ts.filter(t => t.type === tp).map(t => { const p = ps.find(x => x.id === t.poste_id); return <Card key={t.id}><span style={{ fontSize: 13, fontWeight: 600 }}>{t.nom}</span> {p && <Badge color={p.couleur}>{p.nom}</Badge>}</Card>; })}</div>)}</div>); }

function EquipsSub({ db, st }) { const [es, setEs] = useState([]); const [nom, setNom] = useState(""); const [type, setType] = useState("positif"); const [mn, setMn] = useState("0"); const [mx, setMx] = useState("4"); useEffect(() => { db.select("equipements_froid").then(setEs); }, [db]); const add = async () => { if (!nom) return; const e = await db.insert("equipements_froid", [{ nom, type_froid: type, seuil_min: parseFloat(mn), seuil_max: parseFloat(mx) }]); setEs([...es, e[0]]); setNom(""); st("Ajouté"); }; return (<div><Card><Inp label="Nom" value={nom} onChange={setNom} /><Sel label="Type" value={type} onChange={v => { setType(v); if (v === "positif") { setMn("0"); setMx("4"); } else { setMn("-25"); setMx("-18"); } }} options={[{ value: "positif", label: "Froid +" }, { value: "negatif", label: "Froid -" }]} /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><Inp label="Min °C" value={mn} onChange={setMn} type="number" /><Inp label="Max °C" value={mx} onChange={setMx} type="number" /></div><Btn onClick={add}>➕</Btn></Card>{es.map(e => <Card key={e.id}><div style={{ fontWeight: 600, fontSize: 13 }}>{e.nom}</div><div style={{ fontSize: 11, color: C.textMuted }}>{e.seuil_min}°C → {e.seuil_max}°C</div></Card>)}</div>); }

function PlatsSub({ db, st }) { const [ps, setPs] = useState([]); const [nom, setNom] = useState(""); const [cat, setCat] = useState("Plat"); const [prix, setPrix] = useState(""); const [isSugg, setIsSugg] = useState(false); useEffect(() => { db.select("plats_carte", { order: "ordre" }).then(setPs); }, [db]); const add = async () => { if (!nom) return; const p = await db.insert("plats_carte", [{ nom, categorie: cat, prix: parseFloat(prix) || 0, est_suggestion: isSugg, ordre: ps.length + 1 }]); setPs([...ps, p[0]]); setNom(""); setPrix(""); st("Ajouté"); }; const tog = async (p, f) => { await db.update("plats_carte", { [f]: !p[f] }, { id: `eq.${p.id}` }); setPs(ps.map(x => x.id === p.id ? { ...x, [f]: !x[f] } : x)); }; return (<div><Card><Inp label="Nom" value={nom} onChange={setNom} /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><Sel label="Catégorie" value={cat} onChange={setCat} options={[{ value: "Entrée", label: "Entrée" }, { value: "Plat", label: "Plat" }, { value: "Dessert", label: "Dessert" }, { value: "Boisson", label: "Boisson" }]} /><Inp label="Prix €" value={prix} onChange={setPrix} type="number" /></div><label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 10, cursor: "pointer" }}><input type="checkbox" checked={isSugg} onChange={() => setIsSugg(!isSugg)} /> Suggestion</label><Btn onClick={add}>➕</Btn></Card>{ps.map(p => (<Card key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{p.nom} {p.est_suggestion ? "🌟" : ""}</div><div style={{ fontSize: 11, color: C.textMuted }}>{p.categorie} · {p.prix}€</div></div><Pill label={p.actif_midi ? "M✓" : "M✗"} active={p.actif_midi} onClick={() => tog(p, "actif_midi")} color={C.success} /><Pill label={p.actif_soir ? "S✓" : "S✗"} active={p.actif_soir} onClick={() => tog(p, "actif_soir")} color={C.blue} /></Card>))}</div>); }

function FournSub({ db, st }) { const [ls, setLs] = useState([]); const [nom, setNom] = useState(""); const [tel, setTel] = useState(""); const [jrs, setJrs] = useState(""); useEffect(() => { db.select("fournisseurs", { order: "nom" }).then(setLs); }, [db]); const add = async () => { if (!nom) return; const f = await db.insert("fournisseurs", [{ nom, telephone: tel, jours_livraison: jrs }]); setLs([...ls, f[0]]); setNom(""); setTel(""); setJrs(""); st("Ajouté"); }; return (<div><Card><Inp label="Nom" value={nom} onChange={setNom} /><Inp label="Téléphone" value={tel} onChange={setTel} /><Inp label="Jours livraison" value={jrs} onChange={setJrs} placeholder="Lun, Jeu" /><Btn onClick={add}>➕</Btn></Card>{ls.map(f => <Card key={f.id}><div style={{ fontWeight: 600, fontSize: 13 }}>{f.nom}</div><div style={{ fontSize: 11, color: C.textMuted }}>{f.telephone} · {f.jours_livraison}</div></Card>)}</div>); }

function HistSub({ db }) { const [as, setAs] = useState([]); const [us, setUs] = useState([]); useEffect(() => { Promise.all([db.select("historique_actions", { order: "created_at.desc", limit: 100 }), db.select("users")]).then(([a, u]) => { setAs(a); setUs(u); }); }, [db]); return (<div>{as.length === 0 ? <Empty icon="📜" msg="Aucune action" /> : as.map(a => { const u = us.find(x => x.id === a.user_id); const t = new Date(a.created_at).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }); return <Card key={a.id} style={{ padding: 10 }}><div style={{ fontSize: 12, fontWeight: 600 }}>{u?.nom || "?"} — {a.action}</div><div style={{ fontSize: 11, color: C.textMuted }}>{a.detail} · {t}</div></Card>; })}</div>); }

function TempSub({ db }) { const [rs, setRs] = useState([]); const [es, setEs] = useState([]); const [us, setUs] = useState([]); useEffect(() => { Promise.all([db.select("releves_temperatures", { order: "created_at.desc", limit: 100 }), db.select("equipements_froid"), db.select("users")]).then(([r, e, u]) => { setRs(r); setEs(e); setUs(u); }); }, [db]); return (<div>{rs.length === 0 ? <Empty icon="🌡️" msg="Aucun relevé" /> : rs.map(r => { const eq = es.find(e => e.id === r.equipement_id); const u = us.find(x => x.id === r.releve_par); const t = new Date(r.created_at).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }); return (<Card key={r.id} style={{ borderColor: r.conforme ? C.success + "44" : C.danger + "44", padding: 10 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 600, fontSize: 13 }}>{eq?.nom}</span><Badge color={r.conforme ? C.success : C.danger}>{r.temperature}°C</Badge></div><div style={{ fontSize: 11, color: C.textMuted }}>{u?.nom} · {r.moment} · {t}</div>{r.action_corrective && <div style={{ fontSize: 11, color: C.danger, marginTop: 4 }}>⚠️ {r.action_corrective}</div>}</Card>); })}</div>); }

function ImportSub({ db, st }) { const fr = useRef(null); const [imp, setImp] = useState(false); const [log, setLog] = useState([]); const hi = async (e) => { const f = e.target.files?.[0]; if (!f) return; setImp(true); setLog([]); const al = (m) => setLog(p => [...p, m]); try { const X = await loadXLSX(); const d = await f.arrayBuffer(); const wb = X.read(d); al(`📁 ${f.name} — ${wb.SheetNames.length} onglets`); for (const sn of wb.SheetNames) { const rows = X.utils.sheet_to_json(wb.Sheets[sn]); if (!rows.length) { al(`⚠️ ${sn}: vide`); continue; } const n = sn.toLowerCase(); if (n.includes("produit")) { const cats = [...new Set(rows.map(r => r.categorie || r.Categorie || "Divers"))]; const ec = await db.select("categories"); const cm = {}; for (const c of ec) cm[c.nom.toLowerCase()] = c.id; for (const cn of cats) { if (!cm[cn.toLowerCase()]) { const i = await db.insert("categories", [{ nom: cn }]); cm[cn.toLowerCase()] = i[0].id; } } const ps = rows.map(r => ({ nom: r.nom || r.Nom || "?", categorie_id: cm[(r.categorie || r.Categorie || "Divers").toLowerCase()] || null, unite: r.unite || r.Unité || "pce", stock_min: parseFloat(r.stock_min || 0) || 0, stock_actuel: parseFloat(r.stock || 0) || 0, prix_unitaire: parseFloat(r.prix || 0) || 0, actif: true })); await db.insert("produits", ps); al(`✅ ${ps.length} produits`); } else if (n.includes("tache") || n.includes("mep")) { const ts = rows.map((r, i) => ({ nom: r.nom || r.Nom || "?", couverts_ratio: parseFloat(r.ratio || 0) || 0, unite: r.unite || "pce", ordre: i + 1, actif: true })); await db.insert("taches_mep", ts); al(`✅ ${ts.length} tâches`); } else if (n.includes("plat")) { const ps = rows.map((r, i) => ({ nom: r.nom || r.Nom || "?", categorie: r.categorie || "Plat", prix: parseFloat(r.prix || 0) || 0, ordre: i + 1 })); await db.insert("plats_carte", ps); al(`✅ ${ps.length} plats`); } else al(`⏭️ "${sn}" ignoré`); } al("🎉 Terminé"); st("Import réussi"); } catch (e) { al(`❌ ${e.message}`); } setImp(false); if (fr.current) fr.current.value = ""; }; return (<div><Card style={{ padding: 16 }}><p style={{ fontSize: 13, color: C.textMuted, marginBottom: 12 }}>Onglets : <strong style={{ color: C.accent }}>produits</strong>, <strong style={{ color: C.accent }}>taches</strong>, <strong style={{ color: C.accent }}>plats</strong></p><input ref={fr} type="file" accept=".xlsx,.xls" onChange={hi} style={{ display: "none" }} /><Btn onClick={() => fr.current?.click()} disabled={imp}>📥 {imp ? "Import..." : "Fichier Excel"}</Btn></Card>{log.length > 0 && <Card><div style={{ fontFamily: F.mono, fontSize: 11, lineHeight: 1.8, maxHeight: 250, overflow: "auto" }}>{log.map((l, i) => <div key={i} style={{ color: l.includes("❌") ? C.danger : l.includes("✅") ? C.success : C.textMuted }}>{l}</div>)}</div></Card>}</div>); }

function ExportSub({ db, st }) { const exp = async () => { const X = await loadXLSX(); const [p, t, pl, u] = await Promise.all([db.select("produits"), db.select("taches_mep"), db.select("plats_carte"), db.select("users")]); const wb = X.utils.book_new(); if (p.length) X.utils.book_append_sheet(wb, X.utils.json_to_sheet(p), "Produits"); if (t.length) X.utils.book_append_sheet(wb, X.utils.json_to_sheet(t), "Taches"); if (pl.length) X.utils.book_append_sheet(wb, X.utils.json_to_sheet(pl), "Plats"); if (u.length) X.utils.book_append_sheet(wb, X.utils.json_to_sheet(u), "Users"); X.writeFile(wb, `lembouchure_${new Date().toISOString().split("T")[0]}.xlsx`); st("Exporté"); }; return <Card style={{ textAlign: "center", padding: 24 }}><div style={{ fontSize: 36 }}>📤</div><p style={{ fontSize: 13, color: C.textMuted, margin: "10px 0 16px" }}>Exporter en Excel</p><Btn onClick={exp}>📤 Exporter</Btn></Card>; }

export default function App() {
  const [db, setDb] = useState(null); const [user, setUser] = useState(null); const [tab, setTab] = useState("home"); const [service, setService] = useState(null); const [userPostes, setUserPostes] = useState([]); const [toast, setToast] = useState(null);
  useEffect(() => { injectCSS(); }, []);
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem("lemb_db") || "{}"); if (s.url && s.key) { const c = new DB(s.url, s.key); c.select("users", { limit: 1 }).then(() => setDb(c)).catch(() => {}); } } catch {} }, []);
  useEffect(() => { if (!db || !user) return; const today = new Date().toISOString().split("T")[0]; db.select("services", { date: `eq.${today}`, order: "created_at.desc", limit: 1 }).then(s => { if (s[0] && s[0].phase !== "termine") setService(s[0]); }); db.select("user_postes", { user_id: `eq.${user.id}` }).then(ups => setUserPostes(ups.map(u => u.poste_id))); }, [db, user]);
  if (!db) return <SetupScreen onConnect={setDb} />;
  if (!user) return <LoginScreen db={db} onLogin={setUser} />;
  const isManager = user.role === "manager";
  return (<Wrap>
    {tab === "home" && <HomeTab db={db} user={user} onLogout={() => setUser(null)} setTab={setTab} service={service} />}
    {tab === "service" && <ServiceTab db={db} user={user} service={service} setService={setService} userPostes={userPostes} toast={toast} setToast={setToast} />}
    {tab === "stock" && <StockTab db={db} user={user} />}
    {tab === "courses" && <CoursesTab db={db} />}
    {tab === "admin" && isManager && <AdminTab db={db} user={user} />}
    <Nav tab={tab} setTab={setTab} isManager={isManager} />
    {toast && <Toast msg={typeof toast === "string" ? toast : toast.msg} type={typeof toast === "string" ? "success" : toast.type} onClose={() => setToast(null)} />}
  </Wrap>);
}
