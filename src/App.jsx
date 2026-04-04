import { useState, useEffect, useCallback, useRef } from "react";

// ═══ SUPABASE CONFIG (hardcoded — no setup screen) ═══
const SB_URL = "https://gqoapmuuremxztmmshua.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxb2FwbXV1cmVteHp0bW1zaHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTIxMTQsImV4cCI6MjA5MDgyODExNH0.YvQmirXaJppkMnrLG3RmbN7pWppoz33xUQSG_7M71L8";
const LOGO = "data:image/webp;base64,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";

// ═══ DB CLIENT ═══
class DB {
  constructor() {
    this.url = SB_URL.replace(/\/$/, "");
    this.h = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };
  }
  async q(t, m = "GET", b, p = {}) {
    let u = `${this.url}/rest/v1/${t}`;
    const sp = new URLSearchParams(p); if (sp.toString()) u += `?${sp}`;
    const o = { method: m, headers: { ...this.h } }; if (b) o.body = JSON.stringify(b);
    const r = await fetch(u, o);
    if (!r.ok) { const e = await r.text(); throw new Error(e); }
    const txt = await r.text(); return txt ? JSON.parse(txt) : [];
  }
  sel(t, p = {}) { return this.q(t, "GET", null, p); }
  ins(t, r) { return this.q(t, "POST", r); }
  upd(t, b, m) { return this.q(t, "PATCH", b, m); }
  del(t, m) { return this.q(t, "DELETE", null, m); }
}
const db = new DB();

// ═══ DESIGN ═══
const C = {
  bg: "#111318", s1: "#1a1d24", s2: "#22252f", s3: "#2c303c",
  acc: "#e8a045", accDim: "rgba(232,160,69,0.15)",
  blue: "#4a90d9", blueDim: "rgba(74,144,217,0.15)",
  grn: "#3ecf8e", grnDim: "rgba(62,207,142,0.12)",
  red: "#e05c5c", redDim: "rgba(224,92,92,0.12)",
  prpl: "#9b8bf4",
  txt: "#f0f2f5", txt2: "rgba(240,242,245,0.5)", txt3: "rgba(240,242,245,0.25)",
  brd: "rgba(255,255,255,0.08)",
};

const injectCSS = () => {
  if (document.getElementById("le-css")) return;
  const l = document.createElement("link"); l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap";
  document.head.appendChild(l);
  const s = document.createElement("style"); s.id = "le-css";
  s.textContent = `*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}body{background:${C.bg};color:${C.txt};font-family:'Lato',sans-serif;font-size:15px}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.s3};border-radius:2px}@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}.fi{animation:fi .3s ease both}`;
  document.head.appendChild(s);
};

// ═══ COMPONENTS ═══
const Wrap = ({ children }) => <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.bg }}>{children}</div>;

const Btn = ({ children, onClick, v = "primary", disabled, style = {} }) => {
  const vars = { primary: { background: C.acc, color: "#fff", boxShadow: "0 4px 16px rgba(232,160,69,0.3)" }, green: { background: C.grn, color: "#fff" }, red: { background: C.red, color: "#fff" }, blue: { background: C.blue, color: "#fff" }, ghost: { background: C.s3, color: C.txt }, outline: { background: "transparent", border: `1px solid ${C.brd}`, color: C.txt2 } };
  return <button onClick={onClick} disabled={disabled} style={{ width: "100%", padding: "13px", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Lato',sans-serif", letterSpacing: .3, transition: "all .15s", ...vars[v], ...style }}>{children}</button>;
};

const Inp = ({ label, value, onChange, type = "text", placeholder, style = {} }) => (
  <div style={{ marginBottom: 14, ...style }}>
    {label && <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.txt2, marginBottom: 5, letterSpacing: .8, textTransform: "uppercase" }}>{label}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", background: C.s2, border: `1px solid ${C.brd}`, borderRadius: 8, padding: "11px 13px", color: C.txt, fontSize: 14, fontFamily: "'Lato',sans-serif", outline: "none" }} />
  </div>
);

const Sel = ({ label, value, onChange, options, style = {} }) => (
  <div style={{ marginBottom: 14, ...style }}>
    {label && <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.txt2, marginBottom: 5, letterSpacing: .8, textTransform: "uppercase" }}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", background: C.s2, border: `1px solid ${C.brd}`, borderRadius: 8, padding: "11px 13px", color: C.txt, fontSize: 14, fontFamily: "'Lato',sans-serif", outline: "none", WebkitAppearance: "none" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Card = ({ children, style = {}, onClick, className = "" }) => (
  <div onClick={onClick} className={className} style={{ background: C.s1, border: `1px solid ${C.brd}`, borderRadius: 8, padding: 13, marginBottom: 8, cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>
);

const Badge = ({ children, color = C.acc }) => <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: color === C.acc ? C.accDim : color === C.grn ? C.grnDim : color === C.red ? C.redDim : color === C.blue ? C.blueDim : color + "22", color }}>{children}</span>;

const TopBar = ({ title, onBack, right }) => (
  <div style={{ background: C.s1, borderBottom: `1px solid ${C.brd}`, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
    {onBack ? <button onClick={onBack} style={{ background: C.s3, border: "none", color: C.txt2, fontSize: 13, padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontFamily: "'Lato'" }}>← Retour</button> : <div style={{ width: 70 }} />}
    <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: .2 }}>{title}</div>
    {right || <div style={{ width: 70 }} />}
  </div>
);

const Toast = ({ msg, onClose }) => { useEffect(() => { const t = setTimeout(onClose, 2800); return () => clearTimeout(t); }, [onClose]); return <div className="fi" style={{ position: "fixed", bottom: 18, left: "50%", transform: "translateX(-50%)", background: C.s3, color: C.txt, padding: "10px 18px", borderRadius: 20, fontSize: 13, fontWeight: 700, zIndex: 2000, boxShadow: "0 8px 32px rgba(0,0,0,.5)", textAlign: "center", maxWidth: "90vw" }}>{msg}</div>; };

const Loader = () => <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div style={{ width: 24, height: 24, border: `2px solid ${C.brd}`, borderTopColor: C.acc, borderRadius: "50%", animation: "spin .8s linear infinite" }} /></div>;

const Empty = ({ icon, msg }) => <div style={{ textAlign: "center", padding: "36px 16px", color: C.txt3 }}><div style={{ fontSize: 36 }}>{icon}</div><div style={{ fontSize: 13, marginTop: 10 }}>{msg}</div></div>;

const Pill = ({ label, active, onClick, color = C.acc }) => <button onClick={onClick} style={{ padding: "6px 13px", borderRadius: 20, border: `1px solid ${active ? color : C.brd}`, background: active ? (color === C.acc ? C.accDim : color + "22") : "transparent", color: active ? color : C.txt2, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", cursor: "pointer", fontFamily: "'Lato'" }}>{label}</button>;

const CheckItem = ({ label, checked, onToggle, badge, critical }) => (
  <div onClick={onToggle} style={{ background: C.s1, border: `1px solid ${C.brd}`, borderRadius: 8, padding: 13, marginBottom: 8, display: "flex", alignItems: "center", gap: 11, opacity: checked ? .45 : 1, cursor: "pointer" }}>
    <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${checked ? C.grn : C.brd}`, background: checked ? C.grn : C.s2, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", transition: "all .15s" }}>{checked && "✓"}</div>
    <div style={{ flex: 1, fontSize: 14, textDecoration: checked ? "line-through" : "none" }}>{label}</div>
    {badge && <span style={{ fontSize: 11, background: C.s3, padding: "2px 8px", borderRadius: 10, color: critical ? C.red : C.txt2 }}>{badge}</span>}
  </div>
);

const StatCard = ({ label, value, color = C.txt }) => (
  <Card style={{ padding: 13 }}>
    <div style={{ fontSize: 26, fontWeight: 900, color }}>{value}</div>
    <div style={{ fontSize: 11, color: C.txt2, marginTop: 3 }}>{label}</div>
  </Card>
);

const MenuCard = ({ icon, label, sub, color, onClick, done, locked, badge }) => (
  <button onClick={locked ? undefined : onClick} style={{ background: C.s1, border: `1px solid ${C.brd}`, borderRadius: 12, borderTop: `3px solid ${color}`, padding: "16px 13px", cursor: locked ? "default" : "pointer", textAlign: "left", position: "relative", opacity: locked ? .45 : 1, width: "100%", fontFamily: "'Lato'" }}>
    {done && <span style={{ position: "absolute", top: 10, right: 10, color: C.grn, fontSize: 16, fontWeight: 900 }}>✓</span>}
    {badge > 0 && <span style={{ position: "absolute", top: 10, right: 10, background: C.red, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "2px 7px" }}>{badge}</span>}
    <span style={{ fontSize: 26, display: "block", marginBottom: 8 }}>{icon}</span>
    <div style={{ fontSize: 13, fontWeight: 700, color: C.txt, lineHeight: 1.3 }}>{label}</div>
    <div style={{ fontSize: 11, color: C.txt2, marginTop: 3 }}>{locked ? "🔒 Vérifications requises" : sub}</div>
  </button>
);

const STitle = ({ children }) => <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.txt3, marginBottom: 10, marginTop: 4 }}>{children}</div>;

const ProdRow = ({ name, sub, right, status = "ok" }) => (
  <div style={{ background: C.s1, border: `1px solid ${C.brd}`, borderLeft: `3px solid ${status === "low" ? C.red : status === "warn" ? C.acc : C.grn}`, borderRadius: 8, padding: "11px 13px", marginBottom: 7, display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{name}</div>{sub && <div style={{ fontSize: 11, color: C.txt2 }}>{sub}</div>}</div>
    {right}
  </div>
);

const logAct = async (sid, uid, action, detail) => { try { await db.ins("historique_actions", [{ service_id: sid, user_id: uid, action, detail }]); } catch {} };


// ═══ LOGIN ═══
function LoginScreen({ onLogin }) {
  const [users, setUsers] = useState([]); const [sel, setSel] = useState(null);
  const [pin, setPin] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("staff");
  const [dbOk, setDbOk] = useState(true);

  useEffect(() => {
    db.sel("users", { actif: "eq.true", order: "nom" })
      .then(u => { setUsers(u); setLoading(false); })
      .catch(e => { setDbOk(false); setLoading(false); });
  }, []);

  const filtered = users.filter(u => role === "admin" ? u.role === "manager" : u.role !== "manager");

  const press = (d) => {
    if (pin.length >= 4) return;
    const np = pin + d; setPin(np); setError("");
    if (np.length === 4 && sel) {
      if (sel.pin === np) onLogin(sel);
      else { setError("PIN incorrect"); setTimeout(() => setPin(""), 400); }
    }
  };

  if (loading) return <Wrap><Loader /></Wrap>;
  if (!dbOk) return <Wrap><div style={{ padding: 40, textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div><p style={{ color: C.red, fontSize: 14 }}>Impossible de se connecter à la base de données.<br/>Vérifiez que le SQL a été exécuté dans Supabase.</p></div></Wrap>;

  return (
    <Wrap>
      <div style={{ padding: 24, paddingTop: 50, display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", background: `radial-gradient(ellipse at 20% 10%, rgba(232,160,69,0.1) 0%, transparent 55%), radial-gradient(ellipse at 85% 85%, rgba(74,144,217,0.07) 0%, transparent 45%), ${C.bg}` }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 100, height: 100, background: "#fff", borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: "0 12px 40px rgba(232,160,69,0.25)", overflow: "hidden", padding: 8 }}>
            <img src={LOGO} alt="L'Embouchure" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>L'Embouchure</h1>
          <p style={{ color: C.txt2, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", marginTop: 3 }}>Gestion de Service</p>
        </div>

        <div style={{ background: C.s1, border: `1px solid ${C.brd}`, borderRadius: 12, padding: 24, width: "100%", maxWidth: 360, boxShadow: "0 8px 32px rgba(0,0,0,.5)" }}>
          {/* Role tabs */}
          <div style={{ display: "flex", background: C.s2, borderRadius: 8, padding: 3, marginBottom: 20 }}>
            {[{ id: "staff", l: "👤 Personnel" }, { id: "admin", l: "🔑 Manager" }].map(t => (
              <button key={t.id} onClick={() => { setRole(t.id); setSel(null); setPin(""); }} style={{ flex: 1, padding: 8, textAlign: "center", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700, color: role === t.id ? "#fff" : C.txt2, background: role === t.id ? C.acc : "transparent", border: "none", fontFamily: "'Lato'", boxShadow: role === t.id ? "0 2px 10px rgba(232,160,69,0.4)" : "none", transition: "all .2s" }}>{t.l}</button>
            ))}
          </div>

          {!sel ? (
            <div className="fi">
              <STitle>Qui êtes-vous ?</STitle>
              {filtered.map(u => (
                <Card key={u.id} onClick={() => setSel(u)} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: C.s3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
                  <div><div style={{ fontWeight: 700, fontSize: 14 }}>{u.nom}</div></div>
                </Card>
              ))}
              {filtered.length === 0 && <Empty icon="👤" msg={role === "admin" ? "Aucun manager configuré" : "Aucun membre d'équipe"} />}
            </div>
          ) : (
            <div className="fi" style={{ textAlign: "center" }}>
              <button onClick={() => { setSel(null); setPin(""); setError(""); }} style={{ background: "none", border: "none", color: C.txt2, cursor: "pointer", fontSize: 13, marginBottom: 16, fontFamily: "'Lato'" }}>← Changer</button>
              <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>{sel.nom}</h3>
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                {[0,1,2,3].map(i => <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${i < pin.length ? C.acc : C.brd}`, background: i < pin.length ? C.acc : "transparent", transition: "all .15s" }} />)}
              </div>
              {error && <p style={{ color: C.red, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>{error}</p>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {[1,2,3,4,5,6,7,8,9,null,0,"⌫"].map((d,i) => (
                  <button key={i} onClick={() => { if (d === "⌫") setPin(pin.slice(0,-1)); else if (d !== null) press(String(d)); }} disabled={d === null}
                    style={{ background: d === null ? "transparent" : C.s2, border: d === null ? "none" : `1px solid ${C.brd}`, borderRadius: 8, padding: 16, fontSize: d === "⌫" ? 16 : 20, fontWeight: 700, color: d === "⌫" ? C.txt2 : C.txt, cursor: d === null ? "default" : "pointer", fontFamily: "'Lato'" }}>{d}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Wrap>
  );
}

// ═══ HOME ═══
function HomeScreen({ user, onLogout, onNav, actions }) {
  const [stats, setStats] = useState({ prods: 0, low: 0, courses: 0 });
  const now = new Date();
  const svc = now.getHours() >= 15 ? "Soir" : "Midi";

  useEffect(() => {
    Promise.all([
      db.sel("produits", { actif: "eq.true", select: "id,stock_actuel,stock_min" }),
      db.sel("liste_courses", { commandee: "eq.false", select: "id" }),
    ]).then(([p, c]) => setStats({ prods: p.length, low: p.filter(x => +x.stock_actuel <= +x.stock_min).length, courses: c.length })).catch(() => {});
  }, []);

  const isManager = user.role === "manager";
  const cards = [
    { id: "verif", icon: "⚠️", label: "Vérifications arrivée", sub: "Obligatoire · 1x/service", color: C.red },
    { id: "mep", icon: "🔪", label: "Mise en place", sub: "Prévisionnel auto", color: C.acc },
    { id: "ruptures", icon: "🚨", label: "Déclarer rupture", sub: "Produit manquant", color: C.red },
    { id: "inventaire", icon: "📦", label: "Inventaire", sub: "Stocks complets", color: C.blue, badge: stats.low },
    { id: "courses", icon: "🛒", label: "Liste de courses", sub: "Commandes", color: C.prpl },
    { id: "pertes", icon: "🗑️", label: "Déclarer perte", sub: "Traçabilité", color: C.red },
    { id: "fin", icon: "🌅", label: "Fin de service", sub: "Clôture", color: C.grn },
    { id: "add-prod", icon: "➕", label: "Ajouter produit", sub: "Nouveau référencement", color: "#f472b6" },
  ];
  if (isManager) cards.push({ id: "admin", icon: "🔑", label: "Administration", sub: "Manager", color: C.acc });

  return (
    <Wrap>
      <div style={{ background: `linear-gradient(135deg, ${C.s1}, ${C.s2})`, borderBottom: `1px solid ${C.brd}`, padding: "18px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 21, fontWeight: 900, lineHeight: 1.25 }}>Bonjour, <span style={{ color: C.acc }}>{user.nom}</span> ! 👋</div>
            <div style={{ fontSize: 12, color: C.txt2, marginTop: 5 }}>{now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} — {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
          <button onClick={onLogout} style={{ background: C.s3, border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12, color: C.txt2, fontFamily: "'Lato'" }}>🚪</button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <Badge color={C.acc}>🍽️ Service {svc}</Badge>
          <Badge color={C.blue}>📦 {stats.prods} produits</Badge>
          {stats.low > 0 && <Badge color={C.red}>⚠️ {stats.low} alertes</Badge>}
          {stats.courses > 0 && <Badge color={C.prpl}>🛒 {stats.courses} à commander</Badge>}
        </div>
      </div>

      <div style={{ padding: 16, paddingBottom: 40, overflowY: "auto", maxHeight: "calc(100vh - 140px)" }}>
        <STitle>Votre service</STitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {cards.map(c => <MenuCard key={c.id} {...c} onClick={() => onNav(c.id)} />)}
        </div>

        <STitle>Journal des actions</STitle>
        {actions.length === 0 ? <Empty icon="📜" msg="Aucune action enregistrée" /> :
          actions.slice(0, 8).map((a, i) => (
            <Card key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: C.s3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>
                {{ "Vérifications": "✅", "Mise en place": "🔪", "Inventaire": "📦", "Courses": "🛒", "Perte": "🗑️", "Rupture": "🚨", "Fin de service": "🌅" }[a.action] || "📌"}
              </div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{a.action}</div><div style={{ fontSize: 12, color: C.txt2, marginTop: 2 }}>{a.detail?.substring(0, 60)}</div></div>
              <div style={{ fontSize: 11, color: C.txt3, whiteSpace: "nowrap" }}>{new Date(a.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
            </Card>
          ))
        }
      </div>
    </Wrap>
  );
}


// ═══ VÉRIFICATIONS ═══
function VerifScreen({ user, onBack, setToast }) {
  const [equips, setEquips] = useState([]); const [temps, setTemps] = useState({});
  const [checks, setChecks] = useState([]); const [done, setDone] = useState({});
  const [remarks, setRemarks] = useState(""); const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      db.sel("equipements_froid", { actif: "eq.true" }),
      db.sel("taches_checklist", { type: "eq.ouverture", actif: "eq.true", order: "ordre" }),
    ]).then(([e, t]) => { setEquips(e); setChecks(t); setLoading(false); });
  }, []);

  const colorTemp = (v, eq) => {
    const n = parseFloat(v); if (isNaN(n)) return C.txt2;
    return (n >= +eq.seuil_min && n <= +eq.seuil_max) ? C.grn : n <= +eq.seuil_max + 2 ? C.acc : C.red;
  };

  const save = async () => {
    const tempEntries = equips.map(e => ({ val: parseFloat(temps[e.id]), equip: e })).filter(t => !isNaN(t.val));
    const hors = tempEntries.filter(t => t.val < +t.equip.seuil_min || t.val > +t.equip.seuil_max);
    if (hors.length > 0 && !confirm(`🚨 ${hors.length} hors norme ! Valider quand même ?`)) return;

    const critiques = checks.filter(c => c.description?.includes("Critique") || c.description?.includes("critique"));
    const critDone = critiques.filter(c => done[c.id]).length;
    if (critiques.length > 0 && critDone < critiques.length && !confirm(`⚠️ ${critiques.length - critDone} tâche(s) critique(s) non cochée(s). Continuer ?`)) return;

    // Save temperatures
    for (const t of tempEntries) {
      const conf = t.val >= +t.equip.seuil_min && t.val <= +t.equip.seuil_max;
      await db.ins("releves_temperatures", [{ equipement_id: t.equip.id, temperature: t.val, conforme: conf, moment: "ouverture", releve_par: user.id }]);
    }

    const tempStr = tempEntries.map(t => `${t.equip.nom}: ${t.val}°C`).join(", ");
    const doneCount = Object.values(done).filter(Boolean).length;
    await logAct(null, user.id, "Vérifications", `${doneCount}/${checks.length} · ${tempStr}${remarks ? " · " + remarks : ""}`);
    setToast("✅ Vérifications enregistrées");
    onBack();
  };

  if (loading) return <Wrap><TopBar title="⚠️ Vérifications" onBack={onBack} /><Loader /></Wrap>;

  return (
    <Wrap>
      <TopBar title="⚠️ Vérifications arrivée" onBack={onBack} />
      <div style={{ padding: 16, overflowY: "auto", maxHeight: "calc(100vh - 52px)" }}>
        <div style={{ padding: "11px 13px", borderRadius: 8, fontSize: 13, marginBottom: 14, background: C.accDim, color: C.acc, border: `1px solid rgba(232,160,69,0.2)` }}>⚠️ Checklist obligatoire — relevé de températures + vérifications.</div>

        <STitle>🌡️ Relevé de températures</STitle>
        {equips.map(e => (
          <ProdRow key={e.id} name={e.nom} sub={`${e.seuil_min}°C → ${e.seuil_max}°C`} status={temps[e.id] ? (parseFloat(temps[e.id]) >= +e.seuil_min && parseFloat(temps[e.id]) <= +e.seuil_max ? "ok" : "low") : "warn"}
            right={<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="number" value={temps[e.id] || ""} onChange={ev => setTemps({ ...temps, [e.id]: ev.target.value })} placeholder="°C" step="0.5" style={{ width: 80, background: C.s2, border: `1px solid ${C.brd}`, borderRadius: 6, padding: "6px 8px", color: colorTemp(temps[e.id], e), fontSize: 14, textAlign: "center", fontFamily: "'Lato'", outline: "none" }} />
              <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{!temps[e.id] ? "—" : (parseFloat(temps[e.id]) >= +e.seuil_min && parseFloat(temps[e.id]) <= +e.seuil_max) ? "✅" : parseFloat(temps[e.id]) <= +e.seuil_max + 2 ? "⚠️" : "🚨"}</span>
            </div>} />
        ))}
        <div style={{ padding: "4px 0 4px", fontSize: 12, color: C.blue, marginBottom: 14 }}>✅ Normal: 0–4°C · ⚠️ Attention: 4–6°C · 🚨 Hors norme: &gt;6°C</div>

        <hr style={{ border: "none", borderTop: `1px solid ${C.brd}`, margin: "14px 0" }} />
        <STitle>Checklist arrivée</STitle>
        {checks.map(c => {
          const isCrit = c.description?.toLowerCase().includes("critique");
          return <CheckItem key={c.id} label={c.nom} checked={!!done[c.id]} onToggle={() => setDone({ ...done, [c.id]: !done[c.id] })} badge={isCrit ? "Critique" : null} critical={isCrit} />;
        })}

        <div style={{ marginTop: 8, marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.txt2, marginBottom: 5, letterSpacing: .8, textTransform: "uppercase" }}>Remarques (optionnel)</label>
          <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Observations, anomalie..." style={{ width: "100%", background: C.s2, border: `1px solid ${C.brd}`, borderRadius: 8, padding: "11px 13px", color: C.txt, fontSize: 14, fontFamily: "'Lato'", outline: "none", resize: "vertical", minHeight: 70 }} />
        </div>
        <Btn v="green" onClick={save}>✅ Valider et enregistrer</Btn>
      </div>
    </Wrap>
  );
}

// ═══ MEP (3 étapes) ═══
function MEPScreen({ user, onBack, setToast }) {
  const [step, setStep] = useState(0);
  const [prods, setProds] = useState([]); const [taches, setTaches] = useState([]);
  const [remain, setRemain] = useState({}); const [preview, setPreview] = useState([]);
  const [confirmDone, setConfirmDone] = useState({}); const [confirmQty, setConfirmQty] = useState({});
  const [couverts, setCouverts] = useState(30); const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      db.sel("produits", { actif: "eq.true", order: "nom" }),
      db.sel("taches_mep", { actif: "eq.true", order: "ordre" }),
      db.sel("previsions_couverts", { jour_semaine: `eq.${new Date().getDay()}` }),
    ]).then(([p, t, prev]) => {
      setProds(p); setTaches(t);
      const svc = new Date().getHours() >= 15 ? "soir" : "midi";
      const pr = prev.find(x => x.type_service === svc);
      if (pr) setCouverts(Math.round(+pr.couverts_moyens));
      setLoading(false);
    });
  }, []);

  const calcPreview = () => {
    const prev = taches.map((t, i) => {
      const theorique = Math.ceil((+t.couverts_ratio || 0) * couverts);
      const reste = remain[t.id] || 0;
      const needed = Math.max(0, theorique - reste);
      return { ...t, theorique, reste, needed, idx: i };
    });
    setPreview(prev);
    prev.forEach((p, i) => { setConfirmQty(q => ({ ...q, [i]: p.needed })); });
    setStep(1);
  };

  const save = async () => {
    const items = preview.map((p, i) => ({
      nom: p.nom, qty: confirmQty[i] ?? p.needed, unite: p.unite, done: !!confirmDone[i]
    }));
    const doneCount = items.filter(x => x.done).length;
    await logAct(null, user.id, "Mise en place", `${doneCount}/${items.length} produits · ${couverts} couverts`);
    setToast("✅ Mise en place enregistrée");
    onBack();
  };

  if (loading) return <Wrap><TopBar title="🔪 Mise en place" onBack={onBack} /><Loader /></Wrap>;

  return (
    <Wrap>
      <TopBar title="🔪 Mise en place" onBack={onBack} />
      <div style={{ padding: 16, overflowY: "auto", maxHeight: "calc(100vh - 52px)" }}>
        {/* Step dots */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 18 }}>
          {[0,1,2].map(s => <div key={s} style={{ width: s === step ? 22 : 8, height: 8, borderRadius: s === step ? 4 : "50%", background: s < step ? C.grn : s === step ? C.acc : C.s3, transition: "all .2s" }} />)}
        </div>

        {step === 0 && <>
          <div style={{ padding: "11px 13px", borderRadius: 8, fontSize: 13, marginBottom: 14, background: C.blueDim, color: C.blue, border: `1px solid rgba(74,144,217,0.2)` }}>📍 Étape 1/3 — Relevé des stocks restants</div>
          <Inp label="Couverts prévus" value={String(couverts)} onChange={v => setCouverts(parseInt(v) || 0)} type="number" />
          <STitle>Quantités restantes trouvées</STitle>
          {taches.map(t => (
            <ProdRow key={t.id} name={t.nom} sub={`${t.couverts_ratio} portion/couvert${t.description ? " · " + t.description : ""}`}
              right={<input type="number" value={remain[t.id] || ""} onChange={e => setRemain({ ...remain, [t.id]: parseFloat(e.target.value) || 0 })} placeholder="reste" min="0" step="0.5" style={{ width: 72, background: C.s2, border: `1px solid ${C.brd}`, borderRadius: 6, padding: "6px 8px", color: C.txt, fontSize: 14, textAlign: "center", fontFamily: "'Lato'", outline: "none" }} />} />
          ))}
          <Btn onClick={calcPreview} style={{ marginTop: 14 }}>Calculer prévisionnel →</Btn>
        </>}

        {step === 1 && <>
          <div style={{ padding: "11px 13px", borderRadius: 8, fontSize: 13, marginBottom: 14, background: C.grnDim, color: C.grn, border: `1px solid rgba(62,207,142,0.2)` }}>✅ Étape 2/3 — Prévisionnel calculé</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 14 }}>
            <StatCard label="Couverts" value={couverts} color={C.acc} />
            <StatCard label="Tâches MEP" value={preview.length} color={C.blue} />
          </div>
          <STitle>Quantités recommandées</STitle>
          {preview.map(p => (
            <ProdRow key={p.id} name={p.nom} sub={`${p.couverts_ratio} × ${couverts} = ${p.theorique} − reste ${p.reste}`} status={p.needed > 0 ? "warn" : "ok"}
              right={<Badge color={p.needed > 0 ? C.acc : C.grn}>+{p.needed}</Badge>} />
          ))}
          <Btn onClick={() => setStep(2)} style={{ marginTop: 14 }}>Confirmer →</Btn>
        </>}

        {step === 2 && <>
          <div style={{ padding: "11px 13px", borderRadius: 8, fontSize: 13, marginBottom: 14, background: C.blueDim, color: C.blue, border: `1px solid rgba(74,144,217,0.2)` }}>📍 Étape 3/3 — Cocher une fois fait</div>
          {preview.map((p, i) => (
            <div key={i} style={{ background: C.s1, border: `1px solid ${C.brd}`, borderRadius: 8, padding: 13, marginBottom: 8, display: "flex", alignItems: "center", gap: 11, opacity: confirmDone[i] ? .45 : 1 }}>
              <div onClick={() => setConfirmDone({ ...confirmDone, [i]: !confirmDone[i] })} style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${confirmDone[i] ? C.grn : C.brd}`, background: confirmDone[i] ? C.grn : C.s2, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", cursor: "pointer" }}>{confirmDone[i] && "✓"}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{p.nom}</div><div style={{ fontSize: 11, color: C.txt2 }}>Recommandé: +{p.needed} {p.unite}</div></div>
              <input type="number" value={confirmQty[i] ?? p.needed} onChange={e => setConfirmQty({ ...confirmQty, [i]: parseFloat(e.target.value) || 0 })} min="0" step="0.5" style={{ width: 72, background: C.s2, border: `1px solid ${C.brd}`, borderRadius: 6, padding: "6px 8px", color: C.txt, fontSize: 14, textAlign: "center", fontFamily: "'Lato'", outline: "none" }} />
            </div>
          ))}
          <Btn v="green" onClick={save} style={{ marginTop: 14 }}>💾 Valider la mise en place</Btn>
        </>}
      </div>
    </Wrap>
  );
}


// ═══ RUPTURES ═══
function RupturesScreen({ user, onBack, setToast }) {
  const [prods, setProds] = useState([]); const [sel, setSel] = useState("");
  const [qty, setQty] = useState(""); const [comment, setComment] = useState(""); const [statut, setStatut] = useState("À commander");
  useEffect(() => { db.sel("produits", { actif: "eq.true", order: "nom" }).then(setProds); }, []);
  const save = async () => {
    if (!sel || !qty) { setToast("Remplir produit et quantité"); return; }
    const p = prods.find(x => x.id === parseInt(sel));
    await db.ins("ruptures", [{ produit_id: parseInt(sel), declare_par: user.id }]);
    await logAct(null, user.id, "Rupture", `${qty} ${p?.unite} de ${p?.nom} — ${statut}${comment ? " · " + comment : ""}`);
    setToast(`🚨 Rupture: ${p?.nom}`); setSel(""); setQty(""); setComment("");
  };
  return (
    <Wrap><TopBar title="🚨 Déclarer rupture" onBack={onBack} />
      <div style={{ padding: 16 }}>
        <div style={{ padding: "11px 13px", borderRadius: 8, fontSize: 13, marginBottom: 14, background: C.redDim, color: C.red, border: `1px solid rgba(224,92,92,0.2)` }}>🚨 Un produit manque ? Déclarez-le ici.</div>
        <Sel label="Produit en rupture *" value={sel} onChange={setSel} options={[{ value: "", label: "-- Sélectionner --" }, ...prods.map(p => ({ value: String(p.id), label: p.nom }))]} />
        {sel && <>
          <Inp label="Quantité manquante *" value={qty} onChange={setQty} type="number" placeholder="0" />
          <Inp label="Commentaire" value={comment} onChange={setComment} placeholder="Ex: stock épuisé dès 12h30..." />
          <Sel label="Statut achat" value={statut} onChange={setStatut} options={[{ value: "À commander", label: "À commander" }, { value: "En cours d'achat", label: "En cours d'achat" }, { value: "Acheté", label: "Acheté" }]} />
          <Btn v="red" onClick={save}>🚨 Déclarer la rupture</Btn>
        </>}
      </div>
    </Wrap>
  );
}

// ═══ INVENTAIRE STOCK ═══
function InventaireScreen({ user, onBack, setToast }) {
  const [prods, setProds] = useState([]); const [cats, setCats] = useState([]); const [vals, setVals] = useState({});
  const [saved, setSaved] = useState(false); const [recap, setRecap] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([db.sel("produits", { actif: "eq.true", order: "nom" }), db.sel("categories", { order: "ordre" })]).then(([p, c]) => {
      setProds(p); setCats(c); p.forEach(x => setVals(v => ({ ...v, [x.id]: String(x.stock_actuel) }))); setLoading(false);
    });
  }, []);
  const save = async () => {
    const low = []; let total = 0;
    for (const p of prods) {
      const v = parseFloat(vals[p.id]); if (isNaN(v)) continue;
      await db.upd("produits", { stock_actuel: v }, { id: `eq.${p.id}` });
      await db.ins("inventaire_stock", [{ produit_id: p.id, quantite: v, fait_par: user.id }]);
      if (v <= +p.stock_min) low.push(p.nom);
      total++;
    }
    await logAct(null, user.id, "Inventaire", `${total} produits. ${low.length} sous seuil.`);
    setRecap({ total, low }); setSaved(true);
    setToast(low.length > 0 ? `⚠️ ${low.length} sous seuil` : "✅ Inventaire enregistré");
  };
  const shareRecap = (method) => {
    if (!recap) return;
    const txt = `📦 INVENTAIRE — L'Embouchure\n${new Date().toLocaleDateString("fr-FR")}\n\n${recap.total} produits inventoriés\n${recap.low.length} sous seuil minimum\n${recap.low.length > 0 ? "\n⚠️ Alertes:\n" + recap.low.map(n => "- " + n).join("\n") : "\n✅ Tous les stocks OK"}`;
    if (method === "wa") window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`);
    else if (method === "print") { const w = window.open(); w.document.write(`<pre style="font-size:14px;font-family:sans-serif">${txt}</pre>`); w.print(); }
  };
  if (loading) return <Wrap><TopBar title="📦 Inventaire" onBack={onBack} /><Loader /></Wrap>;
  const grouped = cats.map(c => ({ cat: c, items: prods.filter(p => p.categorie_id === c.id) })).filter(g => g.items.length > 0);
  const ungrouped = prods.filter(p => !cats.some(c => c.id === p.categorie_id));
  return (
    <Wrap><TopBar title="📦 Inventaire" onBack={onBack} />
      <div style={{ padding: 16, overflowY: "auto", maxHeight: "calc(100vh - 52px)" }}>
        {!saved ? <>
          <div style={{ padding: "11px 13px", borderRadius: 8, fontSize: 13, marginBottom: 14, background: C.blueDim, color: C.blue, border: `1px solid rgba(74,144,217,0.2)` }}>Saisissez les quantités réelles. Les produits sous seuil seront signalés.</div>
          {grouped.map(g => (
            <div key={g.cat.id}><STitle>{g.cat.nom}</STitle>
              {g.items.map(p => <ProdRow key={p.id} name={p.nom} sub={`Seuil: ${p.stock_min} ${p.unite}`} status={parseFloat(vals[p.id]) <= +p.stock_min ? "low" : "ok"}
                right={<input type="number" value={vals[p.id] || ""} onChange={e => setVals({ ...vals, [p.id]: e.target.value })} min="0" step="0.5" style={{ width: 72, background: C.s2, border: `1px solid ${C.brd}`, borderRadius: 6, padding: "6px 8px", color: C.txt, fontSize: 14, textAlign: "center", fontFamily: "'Lato'", outline: "none" }} />} />)}
            </div>
          ))}
          {ungrouped.length > 0 && <><STitle>Autres</STitle>{ungrouped.map(p => <ProdRow key={p.id} name={p.nom} sub={`Seuil: ${p.stock_min} ${p.unite}`} right={<input type="number" value={vals[p.id] || ""} onChange={e => setVals({ ...vals, [p.id]: e.target.value })} min="0" step="0.5" style={{ width: 72, background: C.s2, border: `1px solid ${C.brd}`, borderRadius: 6, padding: "6px 8px", color: C.txt, fontSize: 14, textAlign: "center", fontFamily: "'Lato'", outline: "none" }} />} />)}</>}
          <Btn onClick={save} style={{ marginTop: 14 }}>📤 Enregistrer l'inventaire</Btn>
        </> : <>
          <div style={{ padding: "11px 13px", borderRadius: 8, fontSize: 13, marginBottom: 14, background: C.grnDim, color: C.grn, border: `1px solid rgba(62,207,142,0.2)` }}>✅ Inventaire enregistré</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 14 }}>
            <StatCard label="Produits inventoriés" value={recap.total} color={C.blue} />
            <StatCard label="Sous seuil" value={recap.low.length} color={recap.low.length > 0 ? C.red : C.grn} />
          </div>
          {recap.low.length > 0 && <><STitle>⚠️ Alertes stock</STitle>{recap.low.map((n, i) => <ProdRow key={i} name={n} status="low" />)}</>}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Btn v="green" onClick={() => shareRecap("wa")} style={{ flex: 1 }}>💬 WhatsApp</Btn>
            <Btn v="ghost" onClick={() => shareRecap("print")} style={{ flex: 1 }}>🖨️ Imprimer</Btn>
          </div>
          <Btn v="outline" onClick={onBack} style={{ marginTop: 8 }}>← Retour accueil</Btn>
        </>}
      </div>
    </Wrap>
  );
}

// ═══ COURSES ═══
function CoursesScreen({ user, onBack, setToast }) {
  const [prods, setProds] = useState([]); const [selected, setSelected] = useState({}); const [qtys, setQtys] = useState({});
  const [saved, setSaved] = useState(false); const [list, setList] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => {
    db.sel("produits", { actif: "eq.true", order: "nom" }).then(p => {
      setProds(p);
      // Auto-select low stock
      const auto = {}; const autoQ = {};
      p.forEach(x => { if (+x.stock_actuel <= +x.stock_min) { auto[x.id] = true; autoQ[x.id] = String(Math.max(1, +x.stock_min * 2 - +x.stock_actuel)); } });
      setSelected(auto); setQtys(autoQ); setLoading(false);
    });
  }, []);
  const cats = [...new Set(prods.map(p => p.categorie_id))];
  const toggle = (id) => { setSelected({ ...selected, [id]: !selected[id] }); };
  const save = async () => {
    const items = prods.filter(p => selected[p.id]).map(p => ({ id: p.id, nom: p.nom, qty: qtys[p.id] || "?", unite: p.unite }));
    if (!items.length) { setToast("Aucun produit sélectionné"); return; }
    for (const i of items) {
      await db.ins("liste_courses", [{ produit_id: i.id, quantite: parseFloat(i.qty) || 1, urgence: +prods.find(p => p.id === i.id).stock_actuel === 0 ? "urgent" : "normal" }]);
    }
    await logAct(null, user.id, "Courses", `${items.length} produits`);
    setList(items); setSaved(true); setToast(`✅ ${items.length} produits ajoutés`);
  };
  const share = (method) => {
    const txt = `🛒 LISTE DE COURSES — L'Embouchure\n${new Date().toLocaleDateString("fr-FR")}\n\n` + list.map(i => `☐ ${i.nom} — ${i.qty} ${i.unite}`).join("\n");
    if (method === "wa") window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`);
    else if (method === "print") {
      const w = window.open(); w.document.write(`<html><head><title>Liste courses</title><style>body{font-family:sans-serif;padding:20px}h1{font-size:18px}.item{padding:8px;border-bottom:1px solid #eee;display:flex;gap:10px}.box{width:18px;height:18px;border:2px solid #333;display:inline-block}</style></head><body><h1>🛒 Liste de courses — L'Embouchure</h1><p>${new Date().toLocaleDateString("fr-FR")}</p>${list.map(i => `<div class="item"><div class="box"></div><span>${i.nom} — ${i.qty} ${i.unite}</span></div>`).join("")}</body></html>`); w.document.close(); w.print();
    }
  };
  if (loading) return <Wrap><TopBar title="🛒 Courses" onBack={onBack} /><Loader /></Wrap>;
  return (
    <Wrap><TopBar title="🛒 Liste de courses" onBack={onBack} />
      <div style={{ padding: 16, overflowY: "auto", maxHeight: "calc(100vh - 52px)" }}>
        {!saved ? <>
          <div style={{ padding: "11px 13px", borderRadius: 8, fontSize: 13, marginBottom: 14, background: C.blueDim, color: C.blue, border: `1px solid rgba(74,144,217,0.2)` }}>Cochez les produits et indiquez les quantités. Les produits sous seuil sont pré-sélectionnés.</div>
          {prods.map(p => {
            const low = +p.stock_actuel <= +p.stock_min;
            return <ProdRow key={p.id} name={<><span onClick={() => toggle(p.id)} style={{ cursor: "pointer" }}>{selected[p.id] ? "✅" : "☐"} {p.nom}</span> {low && <Badge color={C.red}>⚠️</Badge>}</>} sub={`Stock: ${p.stock_actuel} ${p.unite} · Seuil: ${p.stock_min}`} status={low ? "low" : "ok"}
              right={selected[p.id] ? <input type="number" value={qtys[p.id] || ""} onChange={e => setQtys({ ...qtys, [p.id]: e.target.value })} placeholder="qté" min="0" step="0.5" style={{ width: 72, background: C.s2, border: `1px solid ${C.brd}`, borderRadius: 6, padding: "6px 8px", color: C.txt, fontSize: 14, textAlign: "center", fontFamily: "'Lato'", outline: "none" }} /> : null} />;
          })}
          <Btn onClick={save} style={{ marginTop: 14 }}>📤 Valider la liste</Btn>
        </> : <>
          <div style={{ padding: "11px 13px", borderRadius: 8, fontSize: 13, marginBottom: 14, background: C.grnDim, color: C.grn }}>✅ {list.length} produits ajoutés</div>
          {list.map((i, idx) => <ProdRow key={idx} name={`☐ ${i.nom}`} sub={`${i.qty} ${i.unite}`} />)}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Btn v="green" onClick={() => share("wa")} style={{ flex: 1 }}>💬 WhatsApp</Btn>
            <Btn v="ghost" onClick={() => share("print")} style={{ flex: 1 }}>🖨️ Imprimer</Btn>
          </div>
          <Btn v="outline" onClick={onBack} style={{ marginTop: 8 }}>← Retour accueil</Btn>
        </>}
      </div>
    </Wrap>
  );
}

// ═══ PERTES ═══
function PertesScreen({ user, onBack, setToast }) {
  const [prods, setProds] = useState([]); const [sel, setSel] = useState("");
  const [qty, setQty] = useState(""); const [motif, setMotif] = useState("DLC dépassée"); const [comment, setComment] = useState("");
  useEffect(() => { db.sel("produits", { actif: "eq.true", order: "nom" }).then(setProds); }, []);
  const save = async () => {
    if (!sel || !qty) { setToast("Remplir produit et quantité"); return; }
    const p = prods.find(x => x.id === parseInt(sel));
    const val = (+qty * +(p?.prix_unitaire || 0)).toFixed(2);
    await db.ins("pertes", [{ produit_id: parseInt(sel), quantite: parseFloat(qty), motif, valeur_euros: parseFloat(val), declare_par: user.id }]);
    if (p) await db.upd("produits", { stock_actuel: Math.max(0, +p.stock_actuel - parseFloat(qty)) }, { id: `eq.${p.id}` });
    await logAct(null, user.id, "Perte", `${qty} ${p?.unite} de ${p?.nom} — ${motif} (${val}€)${comment ? " · " + comment : ""}`);
    setToast(`🗑️ Perte: ${p?.nom}`); setSel(""); setQty(""); setComment("");
  };
  return (
    <Wrap><TopBar title="🗑️ Déclarer perte" onBack={onBack} />
      <div style={{ padding: 16 }}>
        <Sel label="Produit *" value={sel} onChange={setSel} options={[{ value: "", label: "-- Sélectionner --" }, ...prods.map(p => ({ value: String(p.id), label: p.nom }))]} />
        {sel && <>
          <Inp label="Quantité perdue *" value={qty} onChange={setQty} type="number" placeholder="0" />
          <Sel label="Motif" value={motif} onChange={setMotif} options={[{ value: "DLC dépassée", label: "DLC dépassée" }, { value: "Mauvaise conservation", label: "Mauvaise conservation" }, { value: "Accident cuisine", label: "Accident cuisine" }, { value: "Sur-production", label: "Sur-production" }, { value: "Autre", label: "Autre" }]} />
          <Inp label="Commentaire" value={comment} onChange={setComment} placeholder="Précisions..." />
          <Btn v="red" onClick={save}>🗑️ Déclarer la perte</Btn>
        </>}
      </div>
    </Wrap>
  );
}

// ═══ FIN DE SERVICE ═══
function FinScreen({ user, onBack, setToast }) {
  const [prods, setProds] = useState([]); const [vals, setVals] = useState({});
  const [actions] = useState(["Filmer les produits (film alimentaire)", "Étiquetage DLC sur toutes les préparations", "Nettoyage complet de la cuisine", "Sortir les poubelles", "Remplir PMS"]);
  const [done, setDone] = useState({}); const [loading, setLoading] = useState(true);
  useEffect(() => { db.sel("produits", { actif: "eq.true", order: "nom" }).then(p => { setProds(p); setLoading(false); }); }, []);
  const save = async () => {
    const doneCount = Object.values(done).filter(Boolean).length;
    if (doneCount < actions.length && !confirm(`${actions.length - doneCount} action(s) non effectuée(s). Clôturer ?`)) return;
    for (const p of prods) { const v = parseFloat(vals[p.id]); if (!isNaN(v)) await db.upd("produits", { stock_actuel: v }, { id: `eq.${p.id}` }); }
    await logAct(null, user.id, "Fin de service", `${doneCount}/${actions.length} actions`);
    setToast("✅ Service clôturé"); onBack();
  };
  if (loading) return <Wrap><TopBar title="🌅 Fin de service" onBack={onBack} /><Loader /></Wrap>;
  return (
    <Wrap><TopBar title="🌅 Fin de service" onBack={onBack} />
      <div style={{ padding: 16, overflowY: "auto", maxHeight: "calc(100vh - 52px)" }}>
        <div style={{ padding: "11px 13px", borderRadius: 8, fontSize: 13, marginBottom: 14, background: C.accDim, color: C.acc }}>Stocks restants puis actions de clôture.</div>
        <STitle>Stocks restants après service</STitle>
        {prods.map(p => <ProdRow key={p.id} name={p.nom} right={<input type="number" value={vals[p.id] || ""} onChange={e => setVals({ ...vals, [p.id]: e.target.value })} placeholder="Reste" min="0" step="0.5" style={{ width: 72, background: C.s2, border: `1px solid ${C.brd}`, borderRadius: 6, padding: "6px 8px", color: C.txt, fontSize: 14, textAlign: "center", fontFamily: "'Lato'", outline: "none" }} />} />)}
        <hr style={{ border: "none", borderTop: `1px solid ${C.brd}`, margin: "14px 0" }} />
        <STitle>Actions de clôture</STitle>
        {actions.map((a, i) => <CheckItem key={i} label={a} checked={!!done[i]} onToggle={() => setDone({ ...done, [i]: !done[i] })} />)}
        <Btn v="green" onClick={save} style={{ marginTop: 14 }}>✅ Clôturer le service</Btn>
      </div>
    </Wrap>
  );
}

// ═══ ADD PRODUIT ═══
function AddProdScreen({ user, onBack, setToast }) {
  const [nom, setNom] = useState(""); const [cat, setCat] = useState("Viande"); const [unite, setUnite] = useState("kg");
  const [stock, setStock] = useState("0"); const [seuil, setSeuil] = useState("0"); const [ratio, setRatio] = useState("0.1"); const [fourn, setFourn] = useState("");
  const save = async () => {
    if (!nom || !seuil) { setToast("Nom et seuil requis"); return; }
    await db.ins("produits", [{ nom, unite, stock_actuel: parseFloat(stock) || 0, stock_min: parseFloat(seuil) || 0, prix_unitaire: 0, actif: true }]);
    await logAct(null, user.id, "Ajout produit", nom);
    setToast(`✅ "${nom}" ajouté`); setNom(""); onBack();
  };
  return (
    <Wrap><TopBar title="➕ Nouveau produit" onBack={onBack} />
      <div style={{ padding: 16 }}>
        <Inp label="Nom *" value={nom} onChange={setNom} placeholder="Ex: Filet de bœuf" />
        <Sel label="Catégorie" value={cat} onChange={setCat} options={["Viande","Poisson","Légume","Fruit","Produit laitier","Épicerie","Condiment","Boisson","Consommable"].map(v => ({ value: v, label: v }))} />
        <Sel label="Unité" value={unite} onChange={setUnite} options={["kg","g","L","pièce(s)","portion(s)","botte(s)","paquet(s)","rouleau(x)","boîte(s)","barquette(s)"].map(v => ({ value: v, label: v }))} />
        <Inp label="Stock actuel" value={stock} onChange={setStock} type="number" />
        <Inp label="Stock minimum (alerte) *" value={seuil} onChange={setSeuil} type="number" />
        <Inp label="Ratio par couvert" value={ratio} onChange={setRatio} type="number" placeholder="0.4 = 1 portion/2-3 couverts" />
        <div style={{ fontSize: 11, color: C.txt2, marginBottom: 14 }}>💡 0.5 = 1 portion pour 2 couverts · 1 = 1 portion par couvert</div>
        <Inp label="Fournisseur" value={fourn} onChange={setFourn} placeholder="Ex: Boucherie Marcel" />
        <Btn onClick={save}>💾 Enregistrer</Btn>
      </div>
    </Wrap>
  );
}


// ═══ ADMIN ═══
function AdminScreen({ user, onBack, setToast }) {
  const [tab, setTab] = useState("dashboard");
  const tabs = [
    { id: "dashboard", l: "📊 Dashboard" }, { id: "personnel", l: "👥 Équipe" },
    { id: "produits", l: "📦 Produits" }, { id: "taches", l: "📋 Tâches" },
    { id: "previsions", l: "🗓️ Prévisions" }, { id: "releves", l: "🌡️ Relevés" },
    { id: "rapports", l: "📋 Rapports" },
  ];
  return (
    <Wrap>
      <TopBar title="🔑 Manager" onBack={onBack} right={<div style={{ fontSize: 12, color: C.acc, fontWeight: 700 }}>{user.nom}</div>} />
      <div style={{ display: "flex", background: C.s1, borderBottom: `1px solid ${C.brd}`, overflowX: "auto", flexShrink: 0 }}>
        {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ flexShrink: 0, padding: "12px 15px", fontSize: 12, fontWeight: 700, color: tab === t.id ? C.acc : C.txt2, cursor: "pointer", borderBottom: `2px solid ${tab === t.id ? C.acc : "transparent"}`, background: "transparent", border: "none", borderLeft: "none", borderTop: "none", borderRight: "none", fontFamily: "'Lato'", letterSpacing: .3, whiteSpace: "nowrap" }}>{t.l}</button>)}
      </div>
      <div style={{ padding: 16, overflowY: "auto", maxHeight: "calc(100vh - 110px)" }}>
        {tab === "dashboard" && <AdminDash />}
        {tab === "personnel" && <AdminPersonnel setToast={setToast} />}
        {tab === "produits" && <AdminProduits setToast={setToast} />}
        {tab === "taches" && <AdminTaches setToast={setToast} />}
        {tab === "previsions" && <AdminPrevisions setToast={setToast} />}
        {tab === "releves" && <AdminReleves />}
        {tab === "rapports" && <AdminRapports />}
      </div>
    </Wrap>
  );
}

function AdminDash() {
  const [s, setS] = useState(null);
  useEffect(() => {
    Promise.all([db.sel("produits", { actif: "eq.true", select: "id,stock_actuel,stock_min,nom" }), db.sel("historique_actions", { order: "created_at.desc", limit: 6 }), db.sel("users", { select: "id" })]).then(([p, a, u]) => {
      const low = p.filter(x => +x.stock_actuel <= +x.stock_min);
      setS({ prods: p.length, low, actions: a, users: u.length });
    });
  }, []);
  if (!s) return <Loader />;
  return (<div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 14 }}>
      <StatCard label="Produits" value={s.prods} color={C.blue} />
      <StatCard label="Sous seuil" value={s.low.length} color={s.low.length > 0 ? C.red : C.grn} />
      <StatCard label="Membres" value={s.users} color={C.acc} />
      <StatCard label="Actions" value={s.actions.length} color={C.prpl} />
    </div>
    {s.low.length > 0 && <><div style={{ padding: "11px 13px", borderRadius: 8, fontSize: 13, marginBottom: 8, background: C.redDim, color: C.red }}>⚠️ {s.low.length} produit(s) sous seuil</div>{s.low.map(p => <ProdRow key={p.id} name={p.nom} sub={`${p.stock_actuel} / seuil ${p.stock_min}`} status="low" />)}</>}
    <STitle style={{ marginTop: 14 }}>Dernières actions</STitle>
    {s.actions.map((a, i) => <Card key={i} style={{ padding: 10 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{a.action}</div><div style={{ fontSize: 11, color: C.txt2 }}>{a.detail?.substring(0, 80)} · {new Date(a.created_at).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}</div></Card>)}
  </div>);
}

function AdminPersonnel({ setToast }) {
  const [users, setUsers] = useState([]); const [postes, setPostes] = useState([]); const [ups, setUps] = useState([]);
  const [nw, setNw] = useState({ nom: "", pin: "", role: "equipe" }); const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  useEffect(() => { Promise.all([db.sel("users", { order: "nom" }), db.sel("postes"), db.sel("user_postes")]).then(([u, p, up]) => { setUsers(u); setPostes(p); setUps(up); }); }, []);
  const add = async () => { if (!nw.nom || !nw.pin) return; const u = await db.ins("users", [{ ...nw, actif: true }]); setUsers([...users, u[0]]); setNw({ nom: "", pin: "", role: "equipe" }); setToast("Ajouté"); };
  const startEdit = (u) => { setEditId(u.id); setEditData({ nom: u.nom, pin: u.pin, role: u.role }); };
  const saveEdit = async () => { await db.upd("users", editData, { id: `eq.${editId}` }); setUsers(users.map(u => u.id === editId ? { ...u, ...editData } : u)); setEditId(null); setToast("Modifié"); };
  const remove = async (id) => { if (!confirm("Supprimer ?")) return; await db.upd("users", { actif: false }, { id: `eq.${id}` }); setUsers(users.map(u => u.id === id ? { ...u, actif: false } : u)); setToast("Désactivé"); };
  return (<div>
    <Card style={{ padding: 16 }}>
      <Inp label="Prénom" value={nw.nom} onChange={v => setNw({ ...nw, nom: v })} />
      <Inp label="PIN (4 chiffres)" value={nw.pin} onChange={v => setNw({ ...nw, pin: v })} type="number" />
      <Sel label="Rôle" value={nw.role} onChange={v => setNw({ ...nw, role: v })} options={[{ value: "equipe", label: "Équipe" }, { value: "manager", label: "Manager" }]} />
      <Btn onClick={add}>➕ Ajouter</Btn>
    </Card>
    <STitle>Équipe ({users.filter(u => u.actif).length})</STitle>
    {users.filter(u => u.actif).map(u => (
      <Card key={u.id}>
        {editId === u.id ? <div>
          <Inp label="Nom" value={editData.nom} onChange={v => setEditData({ ...editData, nom: v })} />
          <Inp label="PIN" value={editData.pin} onChange={v => setEditData({ ...editData, pin: v })} type="number" />
          <Sel label="Rôle" value={editData.role} onChange={v => setEditData({ ...editData, role: v })} options={[{ value: "equipe", label: "Équipe" }, { value: "manager", label: "Manager" }]} />
          <div style={{ display: "flex", gap: 8 }}><Btn v="green" onClick={saveEdit} style={{ flex: 1 }}>💾</Btn><Btn v="ghost" onClick={() => setEditId(null)} style={{ flex: 1 }}>Annuler</Btn></div>
        </div> : <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: C.s3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{u.nom} <Badge color={u.role === "manager" ? C.acc : C.blue}>{u.role}</Badge></div><div style={{ fontSize: 11, color: C.txt2 }}>PIN: {u.pin}</div></div>
          <button onClick={() => startEdit(u)} style={{ background: C.blueDim, border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11, fontWeight: 700, color: C.blue }}>✏️</button>
          <button onClick={() => remove(u.id)} style={{ background: C.redDim, border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11, fontWeight: 700, color: C.red }}>🗑</button>
        </div>}
      </Card>
    ))}
  </div>);
}

function AdminProduits({ setToast }) {
  const [prods, setProds] = useState([]); const [editId, setEditId] = useState(null); const [ed, setEd] = useState({});
  useEffect(() => { db.sel("produits", { actif: "eq.true", order: "nom" }).then(setProds); }, []);
  const startEdit = (p) => { setEditId(p.id); setEd({ nom: p.nom, unite: p.unite, stock_min: String(p.stock_min), prix_unitaire: String(p.prix_unitaire) }); };
  const saveEdit = async () => { await db.upd("produits", { nom: ed.nom, unite: ed.unite, stock_min: parseFloat(ed.stock_min) || 0, prix_unitaire: parseFloat(ed.prix_unitaire) || 0 }, { id: `eq.${editId}` }); setProds(prods.map(p => p.id === editId ? { ...p, ...ed, stock_min: parseFloat(ed.stock_min), prix_unitaire: parseFloat(ed.prix_unitaire) } : p)); setEditId(null); setToast("Modifié"); };
  const remove = async (id) => { if (!confirm("Supprimer ?")) return; await db.upd("produits", { actif: false }, { id: `eq.${id}` }); setProds(prods.filter(p => p.id !== id)); setToast("Supprimé"); };
  return (<div>
    {prods.map(p => (
      <Card key={p.id}>
        {editId === p.id ? <div>
          <Inp label="Nom" value={ed.nom} onChange={v => setEd({ ...ed, nom: v })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><Inp label="Unité" value={ed.unite} onChange={v => setEd({ ...ed, unite: v })} /><Inp label="Stock min" value={ed.stock_min} onChange={v => setEd({ ...ed, stock_min: v })} type="number" /></div>
          <Inp label="Prix unitaire" value={ed.prix_unitaire} onChange={v => setEd({ ...ed, prix_unitaire: v })} type="number" />
          <div style={{ display: "flex", gap: 8 }}><Btn v="green" onClick={saveEdit} style={{ flex: 1 }}>💾</Btn><Btn v="ghost" onClick={() => setEditId(null)} style={{ flex: 1 }}>Annuler</Btn></div>
        </div> : <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{p.nom}</div><div style={{ fontSize: 11, color: C.txt2 }}>Stock: {p.stock_actuel} {p.unite} · Seuil: {p.stock_min} · Prix: {p.prix_unitaire}€</div></div>
          <button onClick={() => startEdit(p)} style={{ background: C.blueDim, border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11, color: C.blue }}>✏️</button>
          <button onClick={() => remove(p.id)} style={{ background: C.redDim, border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11, color: C.red }}>🗑</button>
        </div>}
      </Card>
    ))}
  </div>);
}

function AdminTaches({ setToast }) {
  const [taches, setTaches] = useState([]); const [nw, setNw] = useState({ nom: "", description: "", couverts_ratio: "0.1", unite: "portion(s)" });
  const [editId, setEditId] = useState(null); const [ed, setEd] = useState({});
  useEffect(() => { db.sel("taches_mep", { actif: "eq.true", order: "ordre" }).then(setTaches); }, []);
  const add = async () => { if (!nw.nom) return; const t = await db.ins("taches_mep", [{ ...nw, couverts_ratio: parseFloat(nw.couverts_ratio) || 0, ordre: taches.length + 1, actif: true }]); setTaches([...taches, t[0]]); setNw({ nom: "", description: "", couverts_ratio: "0.1", unite: "portion(s)" }); setToast("Ajoutée"); };
  const startEdit = (t) => { setEditId(t.id); setEd({ nom: t.nom, description: t.description || "", couverts_ratio: String(t.couverts_ratio), unite: t.unite, ordre: String(t.ordre) }); };
  const saveEdit = async () => { await db.upd("taches_mep", { nom: ed.nom, description: ed.description, couverts_ratio: parseFloat(ed.couverts_ratio) || 0, unite: ed.unite, ordre: parseInt(ed.ordre) || 0 }, { id: `eq.${editId}` }); setTaches(taches.map(t => t.id === editId ? { ...t, ...ed, couverts_ratio: parseFloat(ed.couverts_ratio), ordre: parseInt(ed.ordre) } : t)); setEditId(null); setToast("Modifié"); };
  const remove = async (id) => { if (!confirm("Supprimer ?")) return; await db.upd("taches_mep", { actif: false }, { id: `eq.${id}` }); setTaches(taches.filter(t => t.id !== id)); setToast("Supprimée"); };
  return (<div>
    <Card style={{ padding: 16 }}>
      <Inp label="Nom tâche *" value={nw.nom} onChange={v => setNw({ ...nw, nom: v })} />
      <Inp label="Description" value={nw.description} onChange={v => setNw({ ...nw, description: v })} placeholder="Détail de la tâche..." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Inp label="Ratio/couvert" value={nw.couverts_ratio} onChange={v => setNw({ ...nw, couverts_ratio: v })} type="number" />
        <Inp label="Unité" value={nw.unite} onChange={v => setNw({ ...nw, unite: v })} />
      </div>
      <Btn onClick={add}>➕ Ajouter</Btn>
    </Card>
    {taches.map((t, i) => (
      <Card key={t.id}>
        {editId === t.id ? <div>
          <Inp label="Nom" value={ed.nom} onChange={v => setEd({ ...ed, nom: v })} />
          <Inp label="Description" value={ed.description} onChange={v => setEd({ ...ed, description: v })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <Inp label="Ratio" value={ed.couverts_ratio} onChange={v => setEd({ ...ed, couverts_ratio: v })} type="number" />
            <Inp label="Unité" value={ed.unite} onChange={v => setEd({ ...ed, unite: v })} />
            <Inp label="Ordre" value={ed.ordre} onChange={v => setEd({ ...ed, ordre: v })} type="number" />
          </div>
          <div style={{ display: "flex", gap: 8 }}><Btn v="green" onClick={saveEdit} style={{ flex: 1 }}>💾</Btn><Btn v="ghost" onClick={() => setEditId(null)} style={{ flex: 1 }}>Annuler</Btn></div>
        </div> : <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: C.s3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.txt2 }}>{t.ordre || i + 1}</div>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{t.nom}</div><div style={{ fontSize: 11, color: C.txt2 }}>{t.description || ""} · {t.couverts_ratio} {t.unite}/couvert</div></div>
          <button onClick={() => startEdit(t)} style={{ background: C.blueDim, border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11, color: C.blue }}>✏️</button>
          <button onClick={() => remove(t.id)} style={{ background: C.redDim, border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11, color: C.red }}>🗑</button>
        </div>}
      </Card>
    ))}
  </div>);
}

function AdminPrevisions({ setToast }) {
  const [prevs, setPrevs] = useState([]); const [midi, setMidi] = useState("30"); const [soir, setSoir] = useState("25");
  useEffect(() => {
    db.sel("previsions_couverts", { order: "jour_semaine" }).then(p => {
      setPrevs(p);
      const dow = new Date().getDay();
      const pm = p.find(x => +x.jour_semaine === dow && x.type_service === "midi");
      const ps = p.find(x => +x.jour_semaine === dow && x.type_service === "soir");
      if (pm) setMidi(String(Math.round(+pm.couverts_moyens)));
      if (ps) setSoir(String(Math.round(+ps.couverts_moyens)));
    });
  }, []);
  const save = async () => {
    const dow = new Date().getDay();
    await db.upd("previsions_couverts", { couverts_moyens: parseInt(midi) || 0 }, { jour_semaine: `eq.${dow}`, type_service: "eq.midi" });
    await db.upd("previsions_couverts", { couverts_moyens: parseInt(soir) || 0 }, { jour_semaine: `eq.${dow}`, type_service: "eq.soir" });
    setToast("Prévisions mises à jour");
  };
  const jours = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  return (<div>
    <div style={{ padding: "11px 13px", borderRadius: 8, fontSize: 13, marginBottom: 14, background: C.blueDim, color: C.blue }}>📅 Saisissez les prévisions pour alimenter le calcul MEP.</div>
    <STitle>Aujourd'hui</STitle>
    <ProdRow name="🌞 Couverts Midi" right={<input type="number" value={midi} onChange={e => setMidi(e.target.value)} style={{ width: 72, background: C.s2, border: `1px solid ${C.brd}`, borderRadius: 6, padding: "6px 8px", color: C.txt, fontSize: 14, textAlign: "center", fontFamily: "'Lato'", outline: "none" }} />} />
    <ProdRow name="🌙 Couverts Soir" right={<input type="number" value={soir} onChange={e => setSoir(e.target.value)} style={{ width: 72, background: C.s2, border: `1px solid ${C.brd}`, borderRadius: 6, padding: "6px 8px", color: C.txt, fontSize: 14, textAlign: "center", fontFamily: "'Lato'", outline: "none" }} />} />
    <Btn onClick={save} style={{ marginTop: 14 }}>💾 Enregistrer</Btn>
    <STitle style={{ marginTop: 18 }}>Moyennes par jour</STitle>
    {[1,2,3,4,5,6,0].map(d => {
      const pm = prevs.find(x => +x.jour_semaine === d && x.type_service === "midi");
      const ps = prevs.find(x => +x.jour_semaine === d && x.type_service === "soir");
      return <ProdRow key={d} name={jours[d]} sub={`Midi: ${pm ? Math.round(+pm.couverts_moyens) : "—"} · Soir: ${ps ? Math.round(+ps.couverts_moyens) : "—"}`} />;
    })}
  </div>);
}

function AdminReleves() {
  const [releves, setReleves] = useState([]); const [equips, setEquips] = useState([]);
  const [dateFrom, setDateFrom] = useState(""); const [dateTo, setDateTo] = useState("");
  useEffect(() => { Promise.all([db.sel("releves_temperatures", { order: "created_at.desc", limit: 200 }), db.sel("equipements_froid")]).then(([r, e]) => { setReleves(r); setEquips(e); }); }, []);
  const filtered = releves.filter(r => {
    const d = r.created_at?.split("T")[0];
    if (dateFrom && d < dateFrom) return false;
    if (dateTo && d > dateTo) return false;
    return true;
  });
  const exportPrint = () => {
    const w = window.open();
    w.document.write(`<html><head><title>Relevés températures</title><style>body{font-family:sans-serif;padding:20px}h1{font-size:16px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#f5f5f5;padding:6px 8px;border:1px solid #ddd;text-align:left}td{padding:6px 8px;border:1px solid #ddd}.ok{color:green;font-weight:bold}.bad{color:red;font-weight:bold}</style></head><body><h1>🌡️ Relevés températures — L'Embouchure${dateFrom ? ` (${dateFrom} → ${dateTo || "..."})` : ""}</h1><table><tr><th>Date</th><th>Équipement</th><th>Temp</th><th>Conforme</th></tr>${filtered.map(r => { const eq = equips.find(e => e.id === r.equipement_id); return `<tr><td>${new Date(r.created_at).toLocaleString("fr-FR")}</td><td>${eq?.nom || "?"}</td><td class="${r.conforme ? "ok" : "bad"}">${r.temperature}°C</td><td>${r.conforme ? "✅" : "❌"}</td></tr>`; }).join("")}</table></body></html>`);
    w.document.close(); w.print();
  };
  return (<div>
    <div style={{ padding: "11px 13px", borderRadius: 8, fontSize: 13, marginBottom: 14, background: C.blueDim, color: C.blue }}>🌡️ Tous les relevés de températures.</div>
    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
      <Inp label="Du" value={dateFrom} onChange={setDateFrom} type="date" style={{ flex: 1, marginBottom: 0 }} />
      <Inp label="Au" value={dateTo} onChange={setDateTo} type="date" style={{ flex: 1, marginBottom: 0 }} />
    </div>
    <Btn v="ghost" onClick={exportPrint} style={{ marginBottom: 14 }}>📄 Exporter / Imprimer</Btn>
    {filtered.length === 0 ? <Empty icon="🌡️" msg="Aucun relevé" /> : filtered.slice(0, 50).map(r => {
      const eq = equips.find(e => e.id === r.equipement_id);
      return <ProdRow key={r.id} name={eq?.nom || "?"} sub={new Date(r.created_at).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })} status={r.conforme ? "ok" : "low"} right={<Badge color={r.conforme ? C.grn : C.red}>{r.temperature}°C</Badge>} />;
    })}
  </div>);
}

function AdminRapports() {
  const [actions, setActions] = useState([]);
  useEffect(() => { db.sel("historique_actions", { order: "created_at.desc", limit: 100 }).then(setActions); }, []);
  const byType = {};
  actions.forEach(a => { byType[a.action] = (byType[a.action] || 0) + 1; });
  return (<div>
    <STitle>Résumé</STitle>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 14 }}>
      {Object.entries(byType).slice(0, 6).map(([k, v]) => <StatCard key={k} label={k} value={v} />)}
    </div>
    <STitle>Journal complet</STitle>
    {actions.map((a, i) => <Card key={i} style={{ padding: 10 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{a.action}</div><div style={{ fontSize: 11, color: C.txt2 }}>{a.detail?.substring(0, 100)}</div><div style={{ fontSize: 10, color: C.txt3, marginTop: 2 }}>{new Date(a.created_at).toLocaleString("fr-FR")}</div></Card>)}
  </div>);
}


// ═══ MAIN APP ═══
export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("home");
  const [toast, setToast] = useState(null);
  const [actions, setActions] = useState([]);

  useEffect(() => { injectCSS(); }, []);

  // Load actions when logged in
  useEffect(() => {
    if (!user) return;
    db.sel("historique_actions", { order: "created_at.desc", limit: 15 }).then(setActions).catch(() => {});
  }, [user, screen]);

  const goHome = () => setScreen("home");
  const showToast = (msg) => setToast(msg);

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <>
      {screen === "home" && <HomeScreen user={user} onLogout={() => { setUser(null); setScreen("home"); }} onNav={setScreen} actions={actions} />}
      {screen === "verif" && <VerifScreen user={user} onBack={goHome} setToast={showToast} />}
      {screen === "mep" && <MEPScreen user={user} onBack={goHome} setToast={showToast} />}
      {screen === "ruptures" && <RupturesScreen user={user} onBack={goHome} setToast={showToast} />}
      {screen === "inventaire" && <InventaireScreen user={user} onBack={goHome} setToast={showToast} />}
      {screen === "courses" && <CoursesScreen user={user} onBack={goHome} setToast={showToast} />}
      {screen === "pertes" && <PertesScreen user={user} onBack={goHome} setToast={showToast} />}
      {screen === "fin" && <FinScreen user={user} onBack={goHome} setToast={showToast} />}
      {screen === "add-prod" && <AddProdScreen user={user} onBack={goHome} setToast={showToast} />}
      {screen === "admin" && <AdminScreen user={user} onBack={goHome} setToast={showToast} />}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}
