import { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from "sheetjs";

// ============================================================
// L'EMBOUCHURE — Restaurant Kitchen Management PWA
// Database: Supabase (PostgreSQL)
// ============================================================

// --------------- SUPABASE CONFIG ---------------
// Users must set their own Supabase credentials
const DEFAULT_SUPABASE_URL = "";
const DEFAULT_SUPABASE_KEY = "";

// --------------- SUPABASE CLIENT ---------------
class SupabaseClient {
  constructor(url, key) {
    this.url = url.replace(/\/$/, "");
    this.key = key;
    this.headers = {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };
  }

  async query(table, { method = "GET", body, params = {} } = {}) {
    let url = `${this.url}/rest/v1/${table}`;
    const searchParams = new URLSearchParams(params);
    if (searchParams.toString()) url += `?${searchParams}`;
    const opts = { method, headers: { ...this.headers } };
    if (body) opts.body = JSON.stringify(body);
    if (method === "POST") opts.headers["Prefer"] = "return=representation";
    if (method === "PATCH") opts.headers["Prefer"] = "return=representation";
    if (method === "DELETE") opts.headers["Prefer"] = "return=representation";
    const res = await fetch(url, opts);
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase error (${res.status}): ${err}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : [];
  }

  async select(table, params = {}) {
    return this.query(table, { params });
  }

  async insert(table, rows) {
    return this.query(table, { method: "POST", body: rows });
  }

  async update(table, body, matchParams) {
    return this.query(table, { method: "PATCH", body, params: matchParams });
  }

  async delete(table, matchParams) {
    return this.query(table, { method: "DELETE", params: matchParams });
  }

  async rpc(fnName, args = {}) {
    const url = `${this.url}/rest/v1/rpc/${fnName}`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(args),
    });
    if (!res.ok) throw new Error(`RPC error: ${await res.text()}`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }
}

// --------------- DESIGN TOKENS ---------------
const COLORS = {
  bg: "#0C0F0A",
  surface: "#1A1E16",
  surfaceAlt: "#232820",
  accent: "#D4A843",
  accentDark: "#B8912E",
  accentLight: "#E8C96A",
  text: "#F2EDE4",
  textMuted: "#9A958C",
  danger: "#C4453A",
  dangerBg: "#2A1614",
  success: "#5A9E5F",
  successBg: "#142016",
  border: "#2E332A",
  inputBg: "#14170F",
};

const FONTS = {
  display: "'Playfair Display', Georgia, serif",
  body: "'DM Sans', 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

// --------------- GLOBAL STYLES ---------------
const injectStyles = () => {
  if (document.getElementById("lemb-styles")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
  document.head.appendChild(link);

  const style = document.createElement("style");
  style.id = "lemb-styles";
  style.textContent = `
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:${COLORS.bg}; color:${COLORS.text}; font-family:${FONTS.body}; }
    ::-webkit-scrollbar { width:6px; }
    ::-webkit-scrollbar-track { background:${COLORS.bg}; }
    ::-webkit-scrollbar-thumb { background:${COLORS.border}; border-radius:3px; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
    .fade-in { animation: fadeIn .4s ease both; }
    .slide-in { animation: slideIn .3s ease both; }
  `;
  document.head.appendChild(style);
};

// --------------- ICONS (inline SVG) ---------------
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const paths = {
    lock: "M12 2C9.24 2 7 4.24 7 7v3H5v10h14V10h-2V7c0-2.76-2.24-5-5-5zm0 2c1.65 0 3 1.35 3 3v3H9V7c0-1.65 1.35-3 3-3zm-5 8h10v6H7v-6z",
    home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
    clipboard: "M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h2v3h10V5h2v14z",
    box: "M20 3H4c-1.1 0-2 .9-2 2v2c0 .74.4 1.38 1 1.72V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8.72c.6-.34 1-.98 1-1.72V5c0-1.1-.9-2-2-2zm-1 16H5V9h14v10zM4 7V5h16v2H4zm5 5h6v2H9v-2z",
    cart: "M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.16 14.26l.04-.12.96-1.74h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0020.07 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.16-2.74z",
    trash: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
    alert: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
    chart: "M3 13h2v8H3v-8zm4-3h2v11H7V10zm4-3h2v14h-2V7zm4-3h2v17h-2V4zm4 4h2v13h-2V8z",
    upload: "M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z",
    settings: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.6 3.6 0 0112 15.6z",
    check: "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z",
    x: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    user: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    thermometer: "M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-8c0-.55.45-1 1-1s1 .45 1 1h-1v1h1v2h-1v1h1v2h-2V5z",
    moon: "M9.37 5.51A7.35 7.35 0 009.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27A7.014 7.014 0 0112 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49z",
    sun: "M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z",
    list: "M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z",
    logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    database: "M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4zm0 2c3.87 0 6 1.5 6 2s-2.13 2-6 2-6-1.5-6-2 2.13-2 6-2zM6 17V14.77c1.34.77 3.53 1.23 6 1.23s4.66-.46 6-1.23V17c0 .5-2.13 2-6 2s-6-1.5-6-2zm0-5V9.77c1.34.77 3.53 1.23 6 1.23s4.66-.46 6-1.23V12c0 .5-2.13 2-6 2s-6-1.5-6-2z",
    plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
    download: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d={paths[name] || paths.home} />
    </svg>
  );
};

// --------------- SQL SETUP SCRIPT ---------------
const SQL_SETUP = `
-- =============================================
-- L'Embouchure Database Setup
-- Run this in Supabase SQL Editor
-- =============================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  pin TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'equipe',
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE,
  ordre INT DEFAULT 0
);

-- PRODUITS
CREATE TABLE IF NOT EXISTS produits (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  categorie_id INT REFERENCES categories(id),
  unite TEXT DEFAULT 'pce',
  stock_min NUMERIC DEFAULT 0,
  stock_actuel NUMERIC DEFAULT 0,
  prix_unitaire NUMERIC DEFAULT 0,
  fournisseur TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TACHES MEP
CREATE TABLE IF NOT EXISTS taches_mep (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  categorie TEXT,
  description TEXT,
  couverts_ratio NUMERIC DEFAULT 0,
  unite TEXT DEFAULT 'pce',
  ordre INT DEFAULT 0,
  actif BOOLEAN DEFAULT true
);

-- SERVICES
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'midi',
  couverts_prevus INT DEFAULT 0,
  couverts_reels INT,
  statut TEXT DEFAULT 'ouvert',
  ouvert_par INT REFERENCES users(id),
  ferme_par INT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RELEVES TEMPERATURES
CREATE TABLE IF NOT EXISTS releves_temperatures (
  id SERIAL PRIMARY KEY,
  service_id INT REFERENCES services(id),
  zone TEXT NOT NULL,
  temperature NUMERIC NOT NULL,
  conforme BOOLEAN DEFAULT true,
  releve_par INT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- VALIDATIONS MEP
CREATE TABLE IF NOT EXISTS validations_mep (
  id SERIAL PRIMARY KEY,
  service_id INT REFERENCES services(id),
  tache_id INT REFERENCES taches_mep(id),
  quantite NUMERIC,
  valide_par INT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PERTES
CREATE TABLE IF NOT EXISTS pertes (
  id SERIAL PRIMARY KEY,
  service_id INT REFERENCES services(id),
  produit_id INT REFERENCES produits(id),
  quantite NUMERIC NOT NULL,
  motif TEXT,
  declare_par INT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RUPTURES
CREATE TABLE IF NOT EXISTS ruptures (
  id SERIAL PRIMARY KEY,
  service_id INT REFERENCES services(id),
  produit_id INT REFERENCES produits(id),
  heure TIME,
  declare_par INT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INVENTAIRE
CREATE TABLE IF NOT EXISTS inventaire (
  id SERIAL PRIMARY KEY,
  produit_id INT REFERENCES produits(id),
  quantite NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  fait_par INT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- LISTE COURSES
CREATE TABLE IF NOT EXISTS liste_courses (
  id SERIAL PRIMARY KEY,
  produit_id INT REFERENCES produits(id),
  quantite NUMERIC NOT NULL,
  urgence TEXT DEFAULT 'normal',
  commandee BOOLEAN DEFAULT false,
  recue BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ROW LEVEL SECURITY (permissive for app usage)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE taches_mep ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE releves_temperatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE validations_mep ENABLE ROW LEVEL SECURITY;
ALTER TABLE pertes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ruptures ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventaire ENABLE ROW LEVEL SECURITY;
ALTER TABLE liste_courses ENABLE ROW LEVEL SECURITY;

-- Allow anon access (for simplicity with API key auth)
CREATE POLICY "anon_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON produits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON taches_mep FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON releves_temperatures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON validations_mep FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON pertes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON ruptures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON inventaire FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON liste_courses FOR ALL USING (true) WITH CHECK (true);

-- SEED: Default users
INSERT INTO users (nom, pin, role) VALUES
  ('Admin', '9999', 'manager'),
  ('Christelle', '1111', 'equipe'),
  ('Ludovic', '2222', 'equipe'),
  ('Lesli', '3333', 'equipe')
ON CONFLICT DO NOTHING;

-- SEED: Default categories
INSERT INTO categories (nom, ordre) VALUES
  ('Viandes', 1), ('Poissons', 2), ('Légumes', 3),
  ('Fruits', 4), ('Produits laitiers', 5), ('Épicerie', 6),
  ('Boissons', 7), ('Surgelés', 8), ('Condiments', 9)
ON CONFLICT (nom) DO NOTHING;
`;

// --------------- SHARED COMPONENTS ---------------
const containerStyle = {
  maxWidth: 480,
  margin: "0 auto",
  minHeight: "100vh",
  background: COLORS.bg,
  position: "relative",
  overflow: "hidden",
};

const Button = ({ children, onClick, variant = "primary", disabled, style = {}, icon }) => {
  const base = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "12px 20px",
    borderRadius: 10,
    border: "none",
    fontFamily: FONTS.body,
    fontWeight: 600,
    fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all .2s ease",
    width: "100%",
  };
  const variants = {
    primary: { background: COLORS.accent, color: COLORS.bg },
    secondary: { background: COLORS.surfaceAlt, color: COLORS.text, border: `1px solid ${COLORS.border}` },
    danger: { background: COLORS.danger, color: "#fff" },
    ghost: { background: "transparent", color: COLORS.textMuted },
    success: { background: COLORS.success, color: "#fff" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder, style = {} }) => (
  <div style={{ marginBottom: 14, ...style }}>
    {label && <label style={{ display: "block", fontSize: 12, color: COLORS.textMuted, marginBottom: 5, fontWeight: 500, letterSpacing: ".5px", textTransform: "uppercase" }}>{label}</label>}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: "100%", padding: "11px 14px", background: COLORS.inputBg, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontFamily: FONTS.body, fontSize: 15, outline: "none" }}
    />
  </div>
);

const Select = ({ label, value, onChange, options, style = {} }) => (
  <div style={{ marginBottom: 14, ...style }}>
    {label && <label style={{ display: "block", fontSize: 12, color: COLORS.textMuted, marginBottom: 5, fontWeight: 500, letterSpacing: ".5px", textTransform: "uppercase" }}>{label}</label>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: "11px 14px", background: COLORS.inputBg, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontFamily: FONTS.body, fontSize: 15, outline: "none", appearance: "none" }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const Card = ({ children, style = {}, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      cursor: onClick ? "pointer" : "default",
      transition: "border-color .2s",
      ...style,
    }}
  >
    {children}
  </div>
);

const Badge = ({ children, color = COLORS.accent }) => (
  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: color + "22", color, letterSpacing: ".3px" }}>
    {children}
  </span>
);

const Header = ({ title, subtitle, onBack, rightAction }) => (
  <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: 12 }}>
    {onBack && (
      <button onClick={onBack} style={{ background: "none", border: "none", color: COLORS.text, cursor: "pointer", padding: 4 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
      </button>
    )}
    <div style={{ flex: 1 }}>
      <h2 style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 700, color: COLORS.text }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{subtitle}</p>}
    </div>
    {rightAction}
  </div>
);

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fade-in" style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", borderRadius: 10, background: type === "error" ? COLORS.danger : COLORS.success, color: "#fff", fontWeight: 600, fontSize: 14, zIndex: 999, boxShadow: "0 8px 30px rgba(0,0,0,.4)" }}>
      {message}
    </div>
  );
};

const LoadingSpinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
    <div style={{ width: 36, height: 36, border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
);

const EmptyState = ({ icon, message }) => (
  <div style={{ textAlign: "center", padding: "40px 20px", color: COLORS.textMuted }}>
    <Icon name={icon} size={40} color={COLORS.border} />
    <p style={{ marginTop: 12, fontSize: 14 }}>{message}</p>
  </div>
);

// --------------- SETUP SCREEN ---------------
function SetupScreen({ onConnect }) {
  const [url, setUrl] = useState(DEFAULT_SUPABASE_URL);
  const [key, setKey] = useState(DEFAULT_SUPABASE_KEY);
  const [showSql, setShowSql] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");

  // Load saved credentials
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("lemb_config") || "{}");
      if (saved.url) setUrl(saved.url);
      if (saved.key) setKey(saved.key);
    } catch {}
  }, []);

  const handleConnect = async () => {
    if (!url || !key) return setError("URL et clé API requises");
    setTesting(true);
    setError("");
    try {
      const client = new SupabaseClient(url, key);
      const users = await client.select("users", { select: "id,nom", limit: 1 });
      sessionStorage.setItem("lemb_config", JSON.stringify({ url, key }));
      onConnect(client);
    } catch (e) {
      setError("Connexion échouée. Vérifiez vos identifiants et que le SQL d'initialisation a été exécuté. Détail : " + e.message);
    }
    setTesting(false);
  };

  return (
    <div style={{ ...containerStyle, display: "flex", flexDirection: "column", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 0 40px ${COLORS.accent}33` }}>
          <Icon name="database" size={32} color={COLORS.bg} />
        </div>
        <h1 style={{ fontFamily: FONTS.display, fontSize: 28, fontWeight: 700, color: COLORS.accent }}>L'Embouchure</h1>
        <p style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 6 }}>Configuration de la base de données</p>
      </div>

      <Card>
        <Input label="URL Supabase" value={url} onChange={setUrl} placeholder="https://xxx.supabase.co" />
        <Input label="Clé API (anon public)" value={key} onChange={setKey} placeholder="eyJhbGciOiJIUzI1NiIs..." type="password" />
        {error && <p style={{ color: COLORS.danger, fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <Button onClick={handleConnect} disabled={testing} icon="database">
          {testing ? "Connexion..." : "Se connecter"}
        </Button>
      </Card>

      <Card style={{ marginTop: 8 }}>
        <button
          onClick={() => setShowSql(!showSql)}
          style={{ background: "none", border: "none", color: COLORS.accent, cursor: "pointer", fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, width: "100%" }}
        >
          <Icon name="clipboard" size={18} color={COLORS.accent} />
          {showSql ? "Masquer" : "Voir"} le script SQL d'initialisation
        </button>
        {showSql && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>
              Copiez ce script et exécutez-le dans l'éditeur SQL de Supabase (SQL Editor → New Query → Run)
            </p>
            <pre style={{ background: COLORS.inputBg, padding: 12, borderRadius: 8, fontSize: 11, color: COLORS.accentLight, overflow: "auto", maxHeight: 300, fontFamily: FONTS.mono, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {SQL_SETUP}
            </pre>
            <Button
              variant="secondary"
              onClick={() => { navigator.clipboard.writeText(SQL_SETUP); }}
              style={{ marginTop: 8 }}
              icon="clipboard"
            >
              Copier le SQL
            </Button>
          </div>
        )}
      </Card>

      <p style={{ textAlign: "center", fontSize: 12, color: COLORS.textMuted, marginTop: 20, lineHeight: 1.6 }}>
        1. Créez un projet gratuit sur supabase.com<br />
        2. Exécutez le script SQL ci-dessus<br />
        3. Copiez l'URL et la clé anon depuis Settings → API
      </p>
    </div>
  );
}

// --------------- LOGIN SCREEN ---------------
function LoginScreen({ db, onLogin }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.select("users", { "actif": "eq.true", select: "id,nom,role,pin", order: "nom" })
      .then((data) => { setUsers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [db]);

  const handlePinPress = (digit) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError("");
    if (newPin.length === 4 && selectedUser) {
      if (selectedUser.pin === newPin) {
        onLogin(selectedUser);
      } else {
        setError("Code PIN incorrect");
        setTimeout(() => setPin(""), 500);
      }
    }
  };

  if (loading) return <div style={containerStyle}><LoadingSpinner /></div>;

  return (
    <div style={{ ...containerStyle, display: "flex", flexDirection: "column", padding: 24 }}>
      <div style={{ textAlign: "center", marginTop: 30, marginBottom: 30 }}>
        <h1 style={{ fontFamily: FONTS.display, fontSize: 32, fontWeight: 700, color: COLORS.accent, letterSpacing: "-0.5px" }}>L'Embouchure</h1>
        <p style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 4 }}>Gestion de cuisine</p>
      </div>

      {!selectedUser ? (
        <div className="fade-in">
          <p style={{ fontSize: 13, color: COLORS.textMuted, textAlign: "center", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Qui êtes-vous ?</p>
          <div style={{ display: "grid", gap: 10 }}>
            {users.map((u) => (
              <Card key={u.id} onClick={() => setSelectedUser(u)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 14, padding: "16px 18px" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: COLORS.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${COLORS.border}` }}>
                  <Icon name="user" size={22} color={COLORS.accent} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{u.nom}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>{u.role === "manager" ? "Manager" : "Équipe"}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="fade-in" style={{ textAlign: "center" }}>
          <button onClick={() => { setSelectedUser(null); setPin(""); setError(""); }} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 13, marginBottom: 16 }}>
            ← Changer d'utilisateur
          </button>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: COLORS.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", border: `2px solid ${COLORS.accent}` }}>
            <Icon name="user" size={28} color={COLORS.accent} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{selectedUser.nom}</h3>
          <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 24, textTransform: "uppercase", letterSpacing: 1 }}>Entrez votre PIN</p>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: i < pin.length ? COLORS.accent : COLORS.border, transition: "all .15s", transform: i < pin.length ? "scale(1.2)" : "scale(1)" }} />
            ))}
          </div>

          {error && <p style={{ color: COLORS.danger, fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, maxWidth: 260, margin: "0 auto" }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"].map((d, i) => (
              <button
                key={i}
                onClick={() => {
                  if (d === "del") setPin(pin.slice(0, -1));
                  else if (d !== null) handlePinPress(String(d));
                }}
                disabled={d === null}
                style={{ width: 72, height: 56, borderRadius: 12, border: "none", background: d === null ? "transparent" : COLORS.surface, color: COLORS.text, fontSize: d === "del" ? 16 : 22, fontWeight: 600, fontFamily: FONTS.body, cursor: d === null ? "default" : "pointer", transition: "background .15s" }}
              >
                {d === "del" ? "⌫" : d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --------------- TAB NAVIGATION ---------------
const NavBar = ({ activeTab, setActiveTab, isManager }) => {
  const tabs = [
    { id: "home", icon: "home", label: "Accueil" },
    { id: "mep", icon: "clipboard", label: "MEP" },
    { id: "stock", icon: "box", label: "Stock" },
    { id: "courses", icon: "cart", label: "Courses" },
  ];
  if (isManager) tabs.push({ id: "admin", icon: "settings", label: "Admin" });

  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-around", padding: "6px 0 env(safe-area-inset-bottom, 8px)", zIndex: 100 }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 12px", cursor: "pointer", color: activeTab === t.id ? COLORS.accent : COLORS.textMuted, transition: "color .2s" }}
        >
          <Icon name={t.icon} size={22} color={activeTab === t.id ? COLORS.accent : COLORS.textMuted} />
          <span style={{ fontSize: 10, fontWeight: activeTab === t.id ? 700 : 500 }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
};

// --------------- HOME TAB ---------------
function HomeTab({ db, user, onLogout, setTab }) {
  const [todayService, setTodayService] = useState(null);
  const [stats, setStats] = useState({ produits: 0, alertes: 0, courses: 0 });
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    Promise.all([
      db.select("services", { date: `eq.${today}`, limit: 1, order: "created_at.desc" }),
      db.select("produits", { actif: "eq.true", select: "id,stock_actuel,stock_min" }),
      db.select("liste_courses", { commandee: "eq.false", select: "id" }),
    ]).then(([svc, prods, courses]) => {
      setTodayService(svc[0] || null);
      const alertes = prods.filter((p) => Number(p.stock_actuel) <= Number(p.stock_min)).length;
      setStats({ produits: prods.length, alertes, courses: courses.length });
    });
  }, [db, today]);

  const quickActions = [
    { icon: "clipboard", label: "Ouvrir service", color: COLORS.accent, action: () => setTab("mep") },
    { icon: "box", label: "Inventaire", color: COLORS.success, action: () => setTab("stock") },
    { icon: "cart", label: "Liste courses", color: "#6B8DE3", action: () => setTab("courses") },
    { icon: "thermometer", label: "Températures", color: "#E37B6B", action: () => setTab("mep") },
  ];

  return (
    <div className="fade-in" style={{ padding: "0 20px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0" }}>
        <div>
          <p style={{ fontSize: 13, color: COLORS.textMuted }}>Bonjour</p>
          <h2 style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 700, color: COLORS.accent }}>{user.nom}</h2>
        </div>
        <button onClick={onLogout} style={{ background: COLORS.surfaceAlt, border: "none", borderRadius: 10, padding: 10, cursor: "pointer" }}>
          <Icon name="logout" size={20} color={COLORS.textMuted} />
        </button>
      </div>

      {/* Service Status */}
      <Card style={{ background: todayService ? COLORS.successBg : COLORS.surfaceAlt, borderColor: todayService ? COLORS.success + "44" : COLORS.border }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: todayService ? COLORS.success : COLORS.textMuted, animation: todayService?.statut === "ouvert" ? "pulse 2s infinite" : "none" }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{todayService ? `Service ${todayService.type} — ${todayService.statut}` : "Pas de service aujourd'hui"}</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>{today}</div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, margin: "10px 0" }}>
        {[
          { label: "Produits", val: stats.produits, color: COLORS.accent },
          { label: "Alertes stock", val: stats.alertes, color: stats.alertes > 0 ? COLORS.danger : COLORS.success },
          { label: "À commander", val: stats.courses, color: "#6B8DE3" },
        ].map((s) => (
          <Card key={s.label} style={{ textAlign: "center", padding: 14 }}>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: FONTS.display, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <p style={{ fontSize: 12, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, marginTop: 14 }}>Actions rapides</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {quickActions.map((a) => (
          <Card key={a.label} onClick={a.action} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: a.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={a.icon} size={20} color={a.color} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

// --------------- MEP TAB ---------------
function MepTab({ db, user }) {
  const [service, setService] = useState(null);
  const [taches, setTaches] = useState([]);
  const [validations, setValidations] = useState([]);
  const [couverts, setCouverts] = useState("40");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [tempZone, setTempZone] = useState("Frigo 1");
  const [tempVal, setTempVal] = useState("");
  const [showTempForm, setShowTempForm] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const loadData = useCallback(async () => {
    try {
      const [svcs, tch] = await Promise.all([
        db.select("services", { date: `eq.${today}`, order: "created_at.desc", limit: 1 }),
        db.select("taches_mep", { actif: "eq.true", order: "ordre" }),
      ]);
      setTaches(tch);
      if (svcs[0]) {
        setService(svcs[0]);
        setCouverts(String(svcs[0].couverts_prevus));
        const vals = await db.select("validations_mep", { service_id: `eq.${svcs[0].id}` });
        setValidations(vals);
      }
    } catch {}
    setLoading(false);
  }, [db, today]);

  useEffect(() => { loadData(); }, [loadData]);

  const openService = async () => {
    try {
      const svc = await db.insert("services", [{ date: today, type: "midi", couverts_prevus: parseInt(couverts) || 40, statut: "ouvert", ouvert_par: user.id }]);
      setService(svc[0]);
      setToast("Service ouvert !");
    } catch (e) { setToast({ msg: "Erreur: " + e.message, type: "error" }); }
  };

  const validerTache = async (tache) => {
    if (!service) return;
    const existing = validations.find((v) => v.tache_id === tache.id);
    if (existing) return;
    try {
      const qte = tache.couverts_ratio ? Math.ceil(Number(tache.couverts_ratio) * parseInt(couverts)) : 1;
      const val = await db.insert("validations_mep", [{ service_id: service.id, tache_id: tache.id, quantite: qte, valide_par: user.id }]);
      setValidations([...validations, val[0]]);
    } catch {}
  };

  const logTemp = async () => {
    if (!service || !tempVal) return;
    const temp = parseFloat(tempVal);
    try {
      await db.insert("releves_temperatures", [{ service_id: service.id, zone: tempZone, temperature: temp, conforme: temp >= 0 && temp <= 4, releve_par: user.id }]);
      setTempVal("");
      setShowTempForm(false);
      setToast("Température enregistrée");
    } catch {}
  };

  if (loading) return <LoadingSpinner />;

  const progress = taches.length > 0 ? Math.round((validations.length / taches.length) * 100) : 0;

  return (
    <div className="fade-in" style={{ padding: "0 20px 100px" }}>
      <Header title="Mise en Place" subtitle={today} />

      {!service ? (
        <Card style={{ textAlign: "center", padding: 24 }}>
          <Icon name="clipboard" size={40} color={COLORS.border} />
          <p style={{ margin: "12px 0", color: COLORS.textMuted }}>Aucun service ouvert</p>
          <Input label="Couverts prévus" value={couverts} onChange={setCouverts} type="number" />
          <Button onClick={openService} icon="check">Ouvrir le service</Button>
        </Card>
      ) : (
        <>
          {/* Progress */}
          <Card style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Progression MEP</span>
              <Badge color={progress === 100 ? COLORS.success : COLORS.accent}>{progress}%</Badge>
            </div>
            <div style={{ height: 6, background: COLORS.inputBg, borderRadius: 3 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: progress === 100 ? COLORS.success : COLORS.accent, borderRadius: 3, transition: "width .4s ease" }} />
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 6 }}>{couverts} couverts · {validations.length}/{taches.length} tâches</div>
          </Card>

          {/* Temp button */}
          <Button variant="secondary" onClick={() => setShowTempForm(!showTempForm)} icon="thermometer" style={{ marginBottom: 10 }}>
            Relever les températures
          </Button>

          {showTempForm && (
            <Card className="fade-in">
              <Select label="Zone" value={tempZone} onChange={setTempZone} options={[
                { value: "Frigo 1", label: "Frigo 1" }, { value: "Frigo 2", label: "Frigo 2" },
                { value: "Congélateur", label: "Congélateur" }, { value: "Chambre froide", label: "Chambre froide" },
              ]} />
              <Input label="Température (°C)" value={tempVal} onChange={setTempVal} type="number" placeholder="ex: 3.5" />
              <Button onClick={logTemp} icon="check" style={{ marginTop: 4 }}>Enregistrer</Button>
            </Card>
          )}

          {/* Tâches */}
          {taches.length === 0 ? (
            <EmptyState icon="clipboard" message="Aucune tâche MEP configurée. Ajoutez-en dans Admin → Import." />
          ) : (
            taches.map((t, i) => {
              const done = validations.some((v) => v.tache_id === t.id);
              const qte = t.couverts_ratio ? Math.ceil(Number(t.couverts_ratio) * parseInt(couverts)) : null;
              return (
                <Card key={t.id} onClick={() => !done && validerTache(t)} style={{ display: "flex", alignItems: "center", gap: 14, cursor: done ? "default" : "pointer", opacity: done ? 0.6 : 1, borderColor: done ? COLORS.success + "44" : COLORS.border, animationDelay: `${i * 40}ms` }} className="slide-in">
                  <div style={{ width: 32, height: 32, borderRadius: 8, border: `2px solid ${done ? COLORS.success : COLORS.border}`, background: done ? COLORS.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
                    {done && <Icon name="check" size={18} color="#fff" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, textDecoration: done ? "line-through" : "none" }}>{t.nom}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                      {t.categorie && <span>{t.categorie}</span>}
                      {qte && <span> · {qte} {t.unite}</span>}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </>
      )}
      {toast && <Toast message={typeof toast === "string" ? toast : toast.msg} type={typeof toast === "string" ? "success" : toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// --------------- STOCK TAB ---------------
function StockTab({ db, user }) {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([
      db.select("produits", { actif: "eq.true", order: "nom" }),
      db.select("categories", { order: "ordre" }),
    ]).then(([p, c]) => { setProduits(p); setCategories(c); setLoading(false); });
  }, [db]);

  const updateStock = async (prodId) => {
    const val = parseFloat(editVal);
    if (isNaN(val)) return;
    try {
      await db.update("produits", { stock_actuel: val }, { id: `eq.${prodId}` });
      await db.insert("inventaire", [{ produit_id: prodId, quantite: val, fait_par: user.id }]);
      setProduits(produits.map((p) => p.id === prodId ? { ...p, stock_actuel: val } : p));
      setEditingId(null);
      setToast("Stock mis à jour");
    } catch {}
  };

  const filtered = produits.filter((p) => {
    if (search && !p.nom.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "alerte") return Number(p.stock_actuel) <= Number(p.stock_min);
    if (filter !== "all") return p.categorie_id === parseInt(filter);
    return true;
  });

  const alertCount = produits.filter((p) => Number(p.stock_actuel) <= Number(p.stock_min)).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in" style={{ padding: "0 20px 100px" }}>
      <Header title="Stock & Inventaire" subtitle={`${produits.length} produits`} />

      <Input placeholder="Rechercher un produit..." value={search} onChange={setSearch} />

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, marginBottom: 6 }}>
        {[{ v: "all", l: "Tous" }, { v: "alerte", l: `Alertes (${alertCount})` }, ...categories.map((c) => ({ v: String(c.id), l: c.nom }))].map((f) => (
          <button key={f.v} onClick={() => setFilter(f.v)} style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${filter === f.v ? COLORS.accent : COLORS.border}`, background: filter === f.v ? COLORS.accent + "22" : "transparent", color: filter === f.v ? COLORS.accent : COLORS.textMuted, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer", fontFamily: FONTS.body }}>
            {f.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="box" message="Aucun produit trouvé" />
      ) : (
        filtered.map((p) => {
          const isLow = Number(p.stock_actuel) <= Number(p.stock_min);
          const cat = categories.find((c) => c.id === p.categorie_id);
          return (
            <Card key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, borderColor: isLow ? COLORS.danger + "44" : COLORS.border }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.nom}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                  {cat?.nom} · Min: {p.stock_min} {p.unite}
                  {p.fournisseur && ` · ${p.fournisseur}`}
                </div>
              </div>
              {editingId === p.id ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input value={editVal} onChange={(e) => setEditVal(e.target.value)} type="number" style={{ width: 60, padding: "6px 8px", background: COLORS.inputBg, border: `1px solid ${COLORS.accent}`, borderRadius: 6, color: COLORS.text, fontSize: 14, fontFamily: FONTS.mono, textAlign: "center" }} autoFocus />
                  <button onClick={() => updateStock(p.id)} style={{ background: COLORS.success, border: "none", borderRadius: 6, padding: "6px 8px", cursor: "pointer" }}>
                    <Icon name="check" size={16} color="#fff" />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setEditingId(p.id); setEditVal(String(p.stock_actuel)); }} style={{ background: isLow ? COLORS.dangerBg : COLORS.surfaceAlt, border: `1px solid ${isLow ? COLORS.danger + "44" : COLORS.border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: isLow ? COLORS.danger : COLORS.text, fontWeight: 700, fontSize: 15, fontFamily: FONTS.mono, minWidth: 50, textAlign: "center" }}>
                  {p.stock_actuel}
                </button>
              )}
            </Card>
          );
        })
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

// --------------- COURSES TAB ---------------
function CoursesTab({ db }) {
  const [items, setItems] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([
      db.select("liste_courses", { order: "created_at.desc" }),
      db.select("produits", { actif: "eq.true", select: "id,nom,unite" }),
    ]).then(([lc, p]) => { setItems(lc); setProduits(p); setLoading(false); });
  }, [db]);

  const toggleCommandee = async (item) => {
    try {
      await db.update("liste_courses", { commandee: !item.commandee }, { id: `eq.${item.id}` });
      setItems(items.map((i) => i.id === item.id ? { ...i, commandee: !i.commandee } : i));
    } catch {}
  };

  const toggleRecue = async (item) => {
    try {
      await db.update("liste_courses", { recue: !item.recue }, { id: `eq.${item.id}` });
      setItems(items.map((i) => i.id === item.id ? { ...i, recue: !i.recue } : i));
      if (!item.recue) {
        // Update stock when received
        const prod = produits.find((p) => p.id === item.produit_id);
        if (prod) {
          const newStock = Number(prod.stock_actuel || 0) + Number(item.quantite);
          await db.update("produits", { stock_actuel: newStock }, { id: `eq.${prod.id}` });
        }
        setToast("Réception enregistrée + stock mis à jour");
      }
    } catch {}
  };

  const autoGenerate = async () => {
    try {
      const prods = await db.select("produits", { actif: "eq.true" });
      const lowStock = prods.filter((p) => Number(p.stock_actuel) <= Number(p.stock_min));
      if (lowStock.length === 0) return setToast({ msg: "Aucun produit en alerte stock", type: "error" });
      const newItems = lowStock.map((p) => ({
        produit_id: p.id,
        quantite: Math.max(1, Number(p.stock_min) * 2 - Number(p.stock_actuel)),
        urgence: Number(p.stock_actuel) === 0 ? "urgent" : "normal",
      }));
      const inserted = await db.insert("liste_courses", newItems);
      setItems([...inserted, ...items]);
      setToast(`${inserted.length} produits ajoutés à la liste`);
    } catch (e) { setToast({ msg: e.message, type: "error" }); }
  };

  if (loading) return <LoadingSpinner />;

  const pending = items.filter((i) => !i.commandee);
  const ordered = items.filter((i) => i.commandee && !i.recue);
  const received = items.filter((i) => i.recue);

  const renderSection = (title, list, badge) => (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 8px" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>{title}</span>
        <Badge color={badge}>{list.length}</Badge>
      </div>
      {list.map((item) => {
        const prod = produits.find((p) => p.id === item.produit_id);
        return (
          <Card key={item.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{prod?.nom || "?"}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>{item.quantite} {prod?.unite} · {item.urgence === "urgent" ? "🔴 Urgent" : "Normal"}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {!item.commandee && (
                <button onClick={() => toggleCommandee(item)} style={{ background: COLORS.accent + "22", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 11, color: COLORS.accent, fontWeight: 600 }}>Commandé</button>
              )}
              {item.commandee && !item.recue && (
                <button onClick={() => toggleRecue(item)} style={{ background: COLORS.success + "22", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 11, color: COLORS.success, fontWeight: 600 }}>Reçu</button>
              )}
            </div>
          </Card>
        );
      })}
    </>
  );

  return (
    <div className="fade-in" style={{ padding: "0 20px 100px" }}>
      <Header title="Liste de Courses" subtitle={`${pending.length} à commander`} />
      <Button onClick={autoGenerate} variant="secondary" icon="cart" style={{ marginBottom: 10 }}>
        Générer depuis alertes stock
      </Button>
      {items.length === 0 ? (
        <EmptyState icon="cart" message="Liste de courses vide" />
      ) : (
        <>
          {pending.length > 0 && renderSection("À commander", pending, COLORS.danger)}
          {ordered.length > 0 && renderSection("Commandés", ordered, COLORS.accent)}
          {received.length > 0 && renderSection("Reçus", received, COLORS.success)}
        </>
      )}
      {toast && <Toast message={typeof toast === "string" ? toast : toast.msg} type={typeof toast === "string" ? "success" : toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// --------------- ADMIN TAB (with Import) ---------------
function AdminTab({ db, user, onDisconnect }) {
  const [subTab, setSubTab] = useState("import");
  const [toast, setToast] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importLog, setImportLog] = useState([]);
  const fileRef = useRef(null);

  const subTabs = [
    { id: "import", label: "Import Excel", icon: "upload" },
    { id: "users", label: "Utilisateurs", icon: "user" },
    { id: "sql", label: "SQL Setup", icon: "database" },
    { id: "export", label: "Export", icon: "download" },
  ];

  // ---------- IMPORT EXCEL ----------
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportLog([]);
    const log = (msg) => setImportLog((prev) => [...prev, msg]);

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      log(`📁 Fichier: ${file.name} — ${wb.SheetNames.length} onglet(s) détecté(s)`);

      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws);
        if (rows.length === 0) { log(`⚠️ ${sheetName}: vide, ignoré`); continue; }

        const name = sheetName.toLowerCase().trim();

        // --- PRODUITS ---
        if (name.includes("produit") || name.includes("product") || name.includes("article")) {
          log(`📦 Import produits depuis "${sheetName}" (${rows.length} lignes)...`);
          // First ensure categories exist
          const catNames = [...new Set(rows.map((r) => r.categorie || r.Categorie || r.CATEGORIE || r.catégorie || "Divers").filter(Boolean))];
          const existingCats = await db.select("categories", { select: "id,nom" });
          const catMap = {};
          for (const c of existingCats) catMap[c.nom.toLowerCase()] = c.id;

          for (const cName of catNames) {
            if (!catMap[cName.toLowerCase()]) {
              const inserted = await db.insert("categories", [{ nom: cName, ordre: Object.keys(catMap).length + 1 }]);
              catMap[cName.toLowerCase()] = inserted[0].id;
              log(`  + Catégorie créée: ${cName}`);
            }
          }

          const prodRows = rows.map((r) => {
            const cat = r.categorie || r.Categorie || r.CATEGORIE || r.catégorie || "Divers";
            return {
              nom: r.nom || r.Nom || r.NOM || r.produit || r.Produit || "Sans nom",
              categorie_id: catMap[cat.toLowerCase()] || null,
              unite: r.unite || r.Unité || r.unité || r.Unite || "pce",
              stock_min: parseFloat(r.stock_min || r.Stock_min || r["Stock min"] || 0) || 0,
              stock_actuel: parseFloat(r.stock || r.Stock || r.stock_actuel || 0) || 0,
              prix_unitaire: parseFloat(r.prix || r.Prix || r.prix_unitaire || 0) || 0,
              fournisseur: r.fournisseur || r.Fournisseur || null,
              actif: true,
            };
          });
          await db.insert("produits", prodRows);
          log(`  ✅ ${prodRows.length} produits importés`);
        }

        // --- TACHES MEP ---
        else if (name.includes("tache") || name.includes("tâche") || name.includes("mep") || name.includes("task")) {
          log(`📋 Import tâches MEP depuis "${sheetName}" (${rows.length} lignes)...`);
          const tacheRows = rows.map((r, i) => ({
            nom: r.nom || r.Nom || r.tache || r.Tâche || "Tâche",
            categorie: r.categorie || r.Categorie || null,
            description: r.description || r.Description || null,
            couverts_ratio: parseFloat(r.ratio || r.Ratio || r.couverts_ratio || 0) || 0,
            unite: r.unite || r.Unité || "pce",
            ordre: parseInt(r.ordre || r.Ordre || i + 1),
            actif: true,
          }));
          await db.insert("taches_mep", tacheRows);
          log(`  ✅ ${tacheRows.length} tâches importées`);
        }

        // --- USERS ---
        else if (name.includes("user") || name.includes("utilisateur") || name.includes("equipe") || name.includes("équipe")) {
          log(`👥 Import utilisateurs depuis "${sheetName}" (${rows.length} lignes)...`);
          const userRows = rows.map((r) => ({
            nom: r.nom || r.Nom || r.name || "?",
            pin: String(r.pin || r.Pin || r.PIN || r.code || "0000"),
            role: (r.role || r.Role || "equipe").toLowerCase(),
            actif: true,
          }));
          await db.insert("users", userRows);
          log(`  ✅ ${userRows.length} utilisateurs importés`);
        }

        // --- CATEGORIES ---
        else if (name.includes("categorie") || name.includes("catégorie") || name.includes("category")) {
          log(`🏷️ Import catégories depuis "${sheetName}" (${rows.length} lignes)...`);
          const catRows = rows.map((r, i) => ({
            nom: r.nom || r.Nom || "Catégorie",
            ordre: parseInt(r.ordre || r.Ordre || i + 1),
          }));
          await db.insert("categories", catRows);
          log(`  ✅ ${catRows.length} catégories importées`);
        }

        else {
          log(`⏭️ "${sheetName}" non reconnu, ignoré. (Nommez vos onglets: produits, taches, utilisateurs, categories)`);
        }
      }
      log("🎉 Import terminé !");
      setToast("Import terminé avec succès");
    } catch (e) {
      log(`❌ Erreur: ${e.message}`);
      setToast({ msg: "Erreur d'import: " + e.message, type: "error" });
    }
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  // ---------- EXPORT ----------
  const handleExport = async () => {
    try {
      const [produits, taches, users, categories] = await Promise.all([
        db.select("produits", { order: "nom" }),
        db.select("taches_mep", { order: "ordre" }),
        db.select("users", { order: "nom" }),
        db.select("categories", { order: "ordre" }),
      ]);
      const wb = XLSX.utils.book_new();
      if (produits.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(produits), "Produits");
      if (taches.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(taches), "Taches_MEP");
      if (users.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(users), "Utilisateurs");
      if (categories.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(categories), "Categories");
      XLSX.writeFile(wb, `lembouchure_export_${new Date().toISOString().split("T")[0]}.xlsx`);
      setToast("Export téléchargé !");
    } catch (e) { setToast({ msg: e.message, type: "error" }); }
  };

  // ---------- USERS MANAGEMENT ----------
  const [usersList, setUsersList] = useState([]);
  const [newUser, setNewUser] = useState({ nom: "", pin: "", role: "equipe" });
  useEffect(() => {
    if (subTab === "users") db.select("users", { order: "nom" }).then(setUsersList);
  }, [db, subTab]);

  const addUser = async () => {
    if (!newUser.nom || !newUser.pin) return;
    try {
      const u = await db.insert("users", [{ ...newUser, actif: true }]);
      setUsersList([...usersList, u[0]]);
      setNewUser({ nom: "", pin: "", role: "equipe" });
      setToast("Utilisateur ajouté");
    } catch (e) { setToast({ msg: e.message, type: "error" }); }
  };

  const toggleUser = async (u) => {
    try {
      await db.update("users", { actif: !u.actif }, { id: `eq.${u.id}` });
      setUsersList(usersList.map((x) => x.id === u.id ? { ...x, actif: !x.actif } : x));
    } catch {}
  };

  return (
    <div className="fade-in" style={{ padding: "0 20px 100px" }}>
      <Header title="Administration" subtitle="Gestion & paramètres" />

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
        {subTabs.map((t) => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${subTab === t.id ? COLORS.accent : COLORS.border}`, background: subTab === t.id ? COLORS.accent + "18" : "transparent", color: subTab === t.id ? COLORS.accent : COLORS.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONTS.body, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            <Icon name={t.icon} size={14} color={subTab === t.id ? COLORS.accent : COLORS.textMuted} />
            {t.label}
          </button>
        ))}
      </div>

      {/* IMPORT */}
      {subTab === "import" && (
        <div>
          <Card style={{ padding: 20 }}>
            <h3 style={{ fontFamily: FONTS.display, fontSize: 18, marginBottom: 8 }}>Import par lot (Excel)</h3>
            <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6, marginBottom: 16 }}>
              Importez vos produits, tâches MEP, utilisateurs et catégories depuis un fichier Excel.
              Nommez vos onglets : <strong style={{ color: COLORS.accent }}>produits</strong>, <strong style={{ color: COLORS.accent }}>taches</strong>, <strong style={{ color: COLORS.accent }}>utilisateurs</strong>, <strong style={{ color: COLORS.accent }}>categories</strong>.
            </p>

            <div style={{ background: COLORS.inputBg, borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 12, color: COLORS.textMuted, lineHeight: 1.8 }}>
              <strong style={{ color: COLORS.text }}>Colonnes attendues :</strong><br />
              📦 <strong>Produits</strong> : nom, categorie, unite, stock_min, stock, prix, fournisseur<br />
              📋 <strong>Tâches</strong> : nom, categorie, description, ratio, unite, ordre<br />
              👥 <strong>Utilisateurs</strong> : nom, pin, role<br />
              🏷️ <strong>Catégories</strong> : nom, ordre
            </div>

            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleImport} style={{ display: "none" }} />
            <Button onClick={() => fileRef.current?.click()} disabled={importing} icon="upload">
              {importing ? "Import en cours..." : "Choisir un fichier Excel"}
            </Button>
          </Card>

          {importLog.length > 0 && (
            <Card style={{ marginTop: 10 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="list" size={16} /> Journal d'import
              </h4>
              <div style={{ maxHeight: 300, overflow: "auto", fontFamily: FONTS.mono, fontSize: 12, lineHeight: 1.8 }}>
                {importLog.map((l, i) => (
                  <div key={i} style={{ color: l.includes("❌") ? COLORS.danger : l.includes("✅") ? COLORS.success : l.includes("⚠️") ? COLORS.accent : COLORS.textMuted }}>
                    {l}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* USERS */}
      {subTab === "users" && (
        <div>
          <Card>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Ajouter un utilisateur</h4>
            <Input label="Nom" value={newUser.nom} onChange={(v) => setNewUser({ ...newUser, nom: v })} />
            <Input label="Code PIN (4 chiffres)" value={newUser.pin} onChange={(v) => setNewUser({ ...newUser, pin: v })} type="number" />
            <Select label="Rôle" value={newUser.role} onChange={(v) => setNewUser({ ...newUser, role: v })} options={[
              { value: "equipe", label: "Équipe" }, { value: "manager", label: "Manager" },
            ]} />
            <Button onClick={addUser} icon="plus">Ajouter</Button>
          </Card>

          {usersList.map((u) => (
            <Card key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, opacity: u.actif ? 1 : 0.5 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{u.nom}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>PIN: {u.pin} · {u.role}</div>
              </div>
              <button onClick={() => toggleUser(u)} style={{ background: u.actif ? COLORS.danger + "22" : COLORS.success + "22", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600, color: u.actif ? COLORS.danger : COLORS.success }}>
                {u.actif ? "Désactiver" : "Activer"}
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* SQL */}
      {subTab === "sql" && (
        <Card>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Script SQL d'initialisation</h4>
          <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>À exécuter dans Supabase SQL Editor pour créer toutes les tables.</p>
          <pre style={{ background: COLORS.inputBg, padding: 12, borderRadius: 8, fontSize: 10, color: COLORS.accentLight, overflow: "auto", maxHeight: 250, fontFamily: FONTS.mono, whiteSpace: "pre-wrap" }}>{SQL_SETUP}</pre>
          <Button variant="secondary" onClick={() => navigator.clipboard.writeText(SQL_SETUP)} icon="clipboard" style={{ marginTop: 8 }}>Copier le SQL</Button>
        </Card>
      )}

      {/* EXPORT */}
      {subTab === "export" && (
        <Card style={{ textAlign: "center", padding: 24 }}>
          <Icon name="download" size={40} color={COLORS.accent} />
          <h4 style={{ fontSize: 16, fontWeight: 600, margin: "12px 0 6px" }}>Exporter les données</h4>
          <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>Téléchargez toutes vos données (produits, tâches, utilisateurs, catégories) en fichier Excel.</p>
          <Button onClick={handleExport} icon="download">Exporter en Excel</Button>
        </Card>
      )}

      <div style={{ marginTop: 20 }}>
        <Button variant="ghost" onClick={onDisconnect} icon="database" style={{ color: COLORS.danger }}>
          Changer de base de données
        </Button>
      </div>

      {toast && <Toast message={typeof toast === "string" ? toast : toast.msg} type={typeof toast === "string" ? "success" : toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// --------------- MAIN APP ---------------
export default function App() {
  const [db, setDb] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => { injectStyles(); }, []);

  // Auto-reconnect
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("lemb_config") || "{}");
      if (saved.url && saved.key) {
        const client = new SupabaseClient(saved.url, saved.key);
        client.select("users", { limit: 1 }).then(() => setDb(client)).catch(() => {});
      }
    } catch {}
  }, []);

  const handleDisconnect = () => {
    sessionStorage.removeItem("lemb_config");
    setDb(null);
    setUser(null);
  };

  if (!db) return <SetupScreen onConnect={setDb} />;
  if (!user) return <LoginScreen db={db} onLogin={setUser} />;

  const isManager = user.role === "manager";

  return (
    <div style={containerStyle}>
      {activeTab === "home" && <HomeTab db={db} user={user} onLogout={() => setUser(null)} setTab={setActiveTab} />}
      {activeTab === "mep" && <MepTab db={db} user={user} />}
      {activeTab === "stock" && <StockTab db={db} user={user} />}
      {activeTab === "courses" && <CoursesTab db={db} />}
      {activeTab === "admin" && isManager && <AdminTab db={db} user={user} onDisconnect={handleDisconnect} />}
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} isManager={isManager} />
    </div>
  );
}