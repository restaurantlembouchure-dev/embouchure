import { useState, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════
// DESIGN
// ═══════════════════════════════════════════════════
const T = {
  bg:"#F1F5F9", surface:"#FFFFFF", card:"#FFFFFF",
  border:"#E2E8F0", borderB:"#CBD5E1",
  acc:"#2563EB", accL:"#EFF6FF",
  grn:"#16A34A", grnL:"#F0FDF4", grnB:"#86EFAC",
  red:"#DC2626", redL:"#FEF2F2", redB:"#FECACA",
  org:"#EA580C", orgL:"#FFF7ED",
  yel:"#D97706", yelL:"#FFFBEB",
  pur:"#7C3AED", purL:"#F5F3FF",
  t1:"#0F172A", t2:"#475569", t3:"#94A3B8", t4:"#CBD5E1",
  sh:"0 1px 3px rgba(0,0,0,0.08)",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body{background:${T.bg};color:${T.t1};font-family:'Inter',sans-serif;min-height:100vh;font-size:15px}
.mono{font-family:'DM Mono',monospace}
input,select,textarea,button{font-family:'Inter',sans-serif}
input[type=range]{accent-color:${T.acc};width:100%}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-thumb{background:${T.borderB};border-radius:4px}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.up{animation:fadeUp .25s ease forwards}
.fi{animation:fadeIn .2s ease forwards}
@media print{
  .noprint{display:none!important}
  body{background:white}
  .pcard{break-inside:avoid;border:1px solid #ccc!important;box-shadow:none!important;margin-bottom:8px}
}
`;

// ═══════════════════════════════════════════════════
// RÔLES & TÂCHES
// ═══════════════════════════════════════════════════
const ROLES = {
  "Cuisinier":   { c:"#EA580C", i:"👨‍🍳", profil:"cuisine",
    phases:["arrivee","hygiene","mep","service","cloture"],
    labels:{arrivee:"Arrivée",hygiene:"Hygiène HACCP",mep:"Mise en place",service:"Service",cloture:"Clôture"},
    tasks:{
      arrivee: [{id:"ca1",t:"Tenue réglementaire (veste, calot)",k:true},{id:"ca2",t:"Lavage mains protocole 30s",k:true},{id:"ca3",t:"Lecture bons de commande",k:false}],
      hygiene: [{id:"ch1",t:"Relevé T° frigo viandes",k:true,h:true},{id:"ch2",t:"Relevé T° frigo laitiers",k:true,h:true},{id:"ch3",t:"Relevé T° congélateur",k:true,h:true},{id:"ch4",t:"Vérification DLC produits frais",k:true,h:true},{id:"ch5",t:"Contrôle huile friteuse",k:true,h:true},{id:"ch6",t:"Désinfection plans de travail",k:true},{id:"ch7",t:"Étiquetage produits entamés",k:true,h:true}],
      mep:[], service:[{id:"cs1",t:"Poste opérationnel",k:false},{id:"cs2",t:"Four à température",k:true}],
      cloture:[{id:"cc1",t:"Dégraissage four et plaques",k:true},{id:"cc2",t:"Film alimentaire denrées ouvertes",k:true},{id:"cc3",t:"Rangement frigos (crus en bas)",k:true},{id:"cc4",t:"Sol cuisine nettoyé et désinfecté",k:true},{id:"cc5",t:"Coupure gaz vérifiée",k:true},{id:"cc6",t:"Fiche HACCP signée",k:true,h:true}],
    }},
  "Chef de rang":{ c:"#2563EB", i:"🍷", profil:"salle",
    phases:["arrivee","hygiene","salle","service","cloture"],
    labels:{arrivee:"Arrivée",hygiene:"Hygiène",salle:"Mise en place salle",service:"Service",cloture:"Clôture"},
    tasks:{
      arrivee:[{id:"ra1",t:"Tenue vérifiée (uniforme propre)",k:false},{id:"ra2",t:"Réservations du service lues",k:true},{id:"ra3",t:"Allergènes du jour notés",k:true}],
      hygiene:[{id:"rh1",t:"Lavage mains avant prise de poste",k:true},{id:"rh2",t:"Désinfection surfaces salle",k:true}],
      salle:[{id:"rs1",t:"Dressage tables",k:true},{id:"rs2",t:"Couverts polis en place",k:true},{id:"rs3",t:"Verres polis sur tables",k:true},{id:"rs4",t:"Condiments remplis",k:false},{id:"rs5",t:"Menus à jour",k:true},{id:"rs6",t:"Plan de salle vérifié",k:true},{id:"rs7",t:"WC clients approvisionnés",k:false}],
      service:[{id:"rsv",t:"Accueil clients en position",k:true}],
      cloture:[{id:"rc1",t:"Tables débarrassées et nettoyées",k:true},{id:"rc2",t:"Vaisselle rendue plonge",k:false},{id:"rc3",t:"Ménage salle",k:true}],
    }},
  "Barman":      { c:"#7C3AED", i:"🍸", profil:"salle",
    phases:["arrivee","hygiene","bar","service","cloture"],
    labels:{arrivee:"Arrivée",hygiene:"Hygiène",bar:"Mise en place bar",service:"Service",cloture:"Clôture"},
    tasks:{
      arrivee:[{id:"ba1",t:"Tenue vérifiée",k:false},{id:"ba2",t:"Inventaire rapide boissons",k:true}],
      hygiene:[{id:"bh1",t:"Lavage mains",k:true},{id:"bh2",t:"Nettoyage plan de travail bar",k:true}],
      bar:[{id:"bb1",t:"Frigo bar rempli",k:true},{id:"bb2",t:"Glaces en place",k:true},{id:"bb3",t:"Garnishes préparées",k:false},{id:"bb4",t:"Caisse bar vérifiée",k:true}],
      service:[{id:"bsv",t:"Poste opérationnel",k:false}],
      cloture:[{id:"bc1",t:"Inventaire alcools fin service",k:true},{id:"bc2",t:"Nettoyage bar et désinfection",k:true},{id:"bc3",t:"Caisse bar fermée et comptée",k:true}],
    }},
  "Plongeur":    { c:"#16A34A", i:"🧽", profil:"cuisine",
    phases:["arrivee","hygiene","plonge","service","cloture"],
    labels:{arrivee:"Arrivée",hygiene:"Hygiène",plonge:"Poste plonge",service:"Service",cloture:"Clôture"},
    tasks:{
      arrivee:[{id:"pa1",t:"Tablier et gants enfilés",k:false},{id:"pa2",t:"Eau chaude machine vérifiée",k:true}],
      hygiene:[{id:"ph1",t:"Lavage mains",k:true},{id:"ph2",t:"Dosage lessive machine",k:true},{id:"ph3",t:"Filtres machine nettoyés",k:true}],
      plonge:[{id:"pp1",t:"Zones tri déchets organisées",k:false},{id:"pp2",t:"Bacs de rinçage prêts",k:true},{id:"pp3",t:"Poubelles vidées avant service",k:true}],
      service:[{id:"psv",t:"Poste organisé et opérationnel",k:false}],
      cloture:[{id:"pc1",t:"Vaisselle lavée et rangée",k:true},{id:"pc2",t:"Machine vidée et séchée",k:true},{id:"pc3",t:"Sol plonge nettoyé",k:true},{id:"pc4",t:"Poubelles sorties",k:true}],
    }},
  "Manager":     { c:"#DC2626", i:"📋", profil:"both",
    phases:["arrivee","briefing","controle","service","cloture"],
    labels:{arrivee:"Arrivée",briefing:"Briefing équipe",controle:"Contrôle",service:"Service",cloture:"Clôture"},
    tasks:{
      arrivee:[{id:"ma1",t:"Réservations et événements lus",k:true},{id:"ma2",t:"Présence équipe vérifiée",k:true},{id:"ma3",t:"Caisse ouverte et fond vérifié",k:true}],
      briefing:[{id:"mb1",t:"Plat du jour communiqué",k:true},{id:"mb2",t:"Allergènes communiqués à la salle",k:true},{id:"mb3",t:"Effectif confirmé",k:true},{id:"mb4",t:"VIP et événements signalés",k:false}],
      controle:[{id:"mc1",t:"Mise en place salle validée",k:true},{id:"mc2",t:"Mise en place cuisine validée",k:true},{id:"mc3",t:"Températures HACCP signées",k:true},{id:"mc4",t:"Extincteurs accessibles",k:true}],
      service:[{id:"msv",t:"Ouverture et accueil lancés",k:true}],
      cloture:[{id:"mcl1",t:"Rapport Z imprimé et signé",k:true},{id:"mcl2",t:"Feuille de service remplie",k:true},{id:"mcl3",t:"Alarme activée",k:true},{id:"mcl4",t:"Dernière ronde effectuée",k:true}],
    }},
};

// ═══════════════════════════════════════════════════
// DONNÉES INITIALES
// ═══════════════════════════════════════════════════
const INIT = {
  settings:{ name:"L'Embouchure", lS:10, lE:15, dS:17, cvr:{lun:40,mar:55,mer:65,jeu:70,ven:95,sam:120,dim:80} },
  staff:[
    {id:1,n:"Karim Benali",  r:"Cuisinier",    pin:"1111",on:true},
    {id:2,n:"Marie Leblanc", r:"Chef de rang", pin:"2222",on:true},
    {id:3,n:"Sofia Greco",   r:"Barman",       pin:"3333",on:true},
    {id:4,n:"Thomas Petit",  r:"Plongeur",     pin:"4444",on:true},
    {id:5,n:"Amara Diallo",  r:"Manager",      pin:"5555",on:true},
  ],
  products:[
    {id:"p1", n:"Filet de bœuf",      u:"kg",       q:3.5, m:4,   cat:"Viande",      p:"cuisine", urg:false},
    {id:"p2", n:"Saumon frais",       u:"kg",       q:1.2, m:2,   cat:"Poisson",     p:"cuisine", urg:true},
    {id:"p3", n:"Crème 35%",          u:"L",        q:6,   m:3,   cat:"Laitier",     p:"cuisine", urg:false},
    {id:"p4", n:"Beurre AOP",         u:"kg",       q:2,   m:1.5, cat:"Laitier",     p:"cuisine", urg:false},
    {id:"p5", n:"Farine T55",         u:"kg",       q:25,  m:10,  cat:"Sec",         p:"cuisine", urg:false},
    {id:"p6", n:"Pommes de terre",    u:"kg",       q:15,  m:8,   cat:"Légume",      p:"cuisine", urg:false},
    {id:"p7", n:"Tomates cerises",    u:"kg",       q:1,   m:2,   cat:"Légume",      p:"cuisine", urg:true},
    {id:"p8", n:"Dégraissant cuisine",u:"L",        q:2,   m:1,   cat:"Nettoyage",   p:"cuisine", urg:false},
    {id:"p9", n:"Film alimentaire",   u:"rouleau",  q:3,   m:2,   cat:"Nettoyage",   p:"cuisine", urg:false},
    {id:"p20",n:"Vin rouge pichet",   u:"L",        q:20,  m:15,  cat:"Boisson",     p:"salle",   urg:false},
    {id:"p21",n:"Champagne 75cl",     u:"bouteille",q:6,   m:3,   cat:"Boisson",     p:"salle",   urg:false},
    {id:"p22",n:"Eau gazeuse 75cl",   u:"bouteille",q:24,  m:12,  cat:"Boisson",     p:"salle",   urg:false},
    {id:"p23",n:"Eau plate 75cl",     u:"bouteille",q:24,  m:12,  cat:"Boisson",     p:"salle",   urg:false},
    {id:"p30",n:"Serviettes tissu",   u:"unité",    q:80,  m:40,  cat:"Consommable", p:"salle",   urg:false},
    {id:"p31",n:"Serviettes papier",  u:"paquet",   q:5,   m:3,   cat:"Consommable", p:"salle",   urg:false},
    {id:"p32",n:"PH WC",             u:"rouleau",  q:12,  m:6,   cat:"Consommable", p:"salle",   urg:false},
    {id:"p33",n:"Savon mains WC",    u:"flacon",   q:3,   m:2,   cat:"Consommable", p:"salle",   urg:false},
    {id:"p40",n:"Spray nettoyant",   u:"flacon",   q:3,   m:2,   cat:"Nettoyage",   p:"salle",   urg:false},
  ],
  dishes:[
    {id:"d1",n:"Tartare de bœuf", cat:"Entrée", svc:["Déjeuner","Dîner"],r:0.35,comps:[{id:"c1",l:"Filet haché",u:"g",pc:200,note:"Minute +2°C"},{id:"c2",l:"Condiments",u:"g",pc:30,note:"Brunoise"},{id:"c3",l:"Pain toasté",u:"tr",pc:2}]},
    {id:"d2",n:"Saumon mi-cuit",  cat:"Entrée", svc:["Déjeuner","Dîner"],r:0.28,comps:[{id:"c4",l:"Pavé saumon",u:"g",pc:120,note:"Assaisonner"},{id:"c5",l:"Crème citron",u:"cl",pc:5,note:"+4°C"}]},
    {id:"d3",n:"Sole meunière",   cat:"Plat",   svc:["Déjeuner","Dîner"],r:0.30,comps:[{id:"c6",l:"Sole",u:"g",pc:400,note:"Lever filets"},{id:"c7",l:"Beurre clarifié",u:"g",pc:30},{id:"c8",l:"Pommes vapeur",u:"g",pc:150}]},
    {id:"d4",n:"Fondant chocolat",cat:"Dessert",svc:["Déjeuner","Dîner"],r:0.40,comps:[{id:"c9",l:"Appareil fondant",u:"unité",pc:1,note:"Surgeler veille"},{id:"c10",l:"Crème anglaise",u:"cl",pc:6}]},
  ],
  losses:[], history:[], daily:{}, disabledTasks:{}, mepActual:{},
};

// ═══════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════
const STORE_KEY = "lemb_v9";
const loadData = () => {
  try {
    const s = localStorage.getItem(STORE_KEY);
    if (s) {
      const parsed = JSON.parse(s);
      return { ...INIT, ...parsed };
    }
  } catch(e) {}
  return INIT;
};
const saveData = (d) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch(e) {}
};

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
const todayK = () => ["dim","lun","mar","mer","jeu","ven","sam"][new Date().getDay()];
const tnow = () => new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
const dnow = () => new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
const uid = () => Math.random().toString(36).slice(2,9);
const detSvc = s => { const h=new Date().getHours(); return h>=(s?.lS??10)&&h<(s?.lE??15)?"Déjeuner":"Dîner"; };
const myProds = (prods, role) => {
  const p = ROLES[role]?.profil || "salle";
  return p === "both" ? prods : prods.filter(x => x.p === p || x.p === "both");
};
const fmtDate = iso => iso ? new Date(iso).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}) : "";
const ACTION_LABELS = {
  task_checked:"✅ Tâche cochée", task_unchecked:"↩️ Tâche décochée",
  phase_advanced:"🔓 Phase avancée", stock_update:"📦 Stock modifié",
  product_add:"➕ Produit ajouté", product_delete:"🗑 Produit supprimé",
  loss_declared:"⚠️ Perte déclarée", loss_resolved:"✅ Perte résolue",
  mep_actual:"🍽️ MEP saisie", inventory_done:"📋 Inventaire validé",
};

// ═══════════════════════════════════════════════════
// ATOMS
// ═══════════════════════════════════════════════════
const Badge = ({c,children,sm}) => (
  <span style={{background:`${c}18`,color:c,border:`1px solid ${c}35`,
    padding:sm?"1px 6px":"2px 8px",borderRadius:6,fontSize:sm?10:11,
    fontWeight:600,whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:3}}>
    {children}
  </span>
);

const Btn = ({onClick,children,v="primary",sm,dis,full,icon,col}) => {
  const S = {
    primary:  {bg:col||T.acc, fg:"#fff",    br:"none"},
    secondary:{bg:"#fff",     fg:T.t1,      br:`1px solid ${T.border}`},
    ghost:    {bg:"transparent",fg:T.t2,    br:`1px solid ${T.border}`},
    danger:   {bg:T.redL,    fg:T.red,      br:`1px solid ${T.redB}`},
    success:  {bg:T.grnL,    fg:T.grn,      br:`1px solid ${T.grnB}`},
  };
  const s = S[v]||S.primary;
  return (
    <button onClick={onClick} disabled={dis} style={{
      background:s.bg, color:s.fg, border:s.br,
      padding:sm?"6px 12px":"10px 18px", borderRadius:8,
      fontWeight:600, fontSize:sm?12:14,
      cursor:dis?"not-allowed":"pointer", opacity:dis?.5:1,
      width:full?"100%":"auto", transition:"all .15s",
      display:"inline-flex", alignItems:"center", gap:6, flexShrink:0,
    }}>
      {icon&&<span style={{fontSize:14}}>{icon}</span>}{children}
    </button>
  );
};

const Card = ({children,style,onClick,hi,hc,className}) => (
  <div onClick={onClick} className={className} style={{
    background:T.card, borderRadius:12, padding:16,
    border:`1px solid ${hi?(hc||T.acc)+"60":T.border}`,
    boxShadow:hi?`0 0 0 3px ${(hc||T.acc)}15`:T.sh,
    cursor:onClick?"pointer":"default", transition:"all .2s", ...style
  }}>{children}</div>
);

const Bar = ({v,max,c}) => (
  <div style={{background:T.bg,borderRadius:4,height:6,overflow:"hidden"}}>
    <div style={{width:`${max>0?Math.min(100,v/max*100):0}%`,height:"100%",
      background:c||T.acc,borderRadius:4,transition:"width .4s"}}/>
  </div>
);

const Ring = ({v,max,sz=48,sw=5,c}) => {
  const r=(sz-sw*2)/2, ci=2*Math.PI*r, pt=max>0?Math.min(1,v/max):0;
  return (
    <svg width={sz} height={sz} style={{flexShrink:0}}>
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={T.border} strokeWidth={sw}/>
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={c||T.acc} strokeWidth={sw}
        strokeDasharray={ci} strokeDashoffset={ci*(1-pt)} strokeLinecap="round"
        transform={`rotate(-90 ${sz/2} ${sz/2})`} style={{transition:"stroke-dashoffset .4s"}}/>
      <text x={sz/2} y={sz/2+4} textAnchor="middle" fill={pt>=1?T.grn:T.t1}
        fontSize={10} fontWeight={700} fontFamily="'DM Mono',monospace">
        {Math.round(pt*100)}%
      </text>
    </svg>
  );
};

const Toggle = ({on,set,label,c}) => (
  <div onClick={set} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",userSelect:"none"}}>
    <div style={{width:36,height:20,borderRadius:10,background:on?(c||T.grn):T.t4,
      position:"relative",transition:"background .2s",flexShrink:0}}>
      <div style={{position:"absolute",top:2,left:on?18:2,width:16,height:16,
        borderRadius:"50%",background:"#fff",transition:"left .2s",
        boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
    </div>
    {label&&<span style={{fontSize:13,color:T.t2,fontWeight:500}}>{label}</span>}
  </div>
);

const FIn = ({label,val,set,type,ph}) => (
  <div style={{marginBottom:10}}>
    {label&&<div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,
      textTransform:"uppercase",letterSpacing:.5}}>{label}</div>}
    <input type={type||"text"} value={val} placeholder={ph||""}
      onChange={e=>set(e.target.value)}
      style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,
        borderRadius:8,padding:"9px 11px",color:T.t1,fontSize:13,outline:"none"}}/>
  </div>
);

const Divider = ({label}) => (
  <div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0 10px"}}>
    {label&&<span style={{fontSize:11,color:T.t3,fontWeight:600,
      textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{label}</span>}
    <div style={{flex:1,height:1,background:T.border}}/>
  </div>
);

// ═══════════════════════════════════════════════════
// HISTORY HELPERS
// ═══════════════════════════════════════════════════
const addToHistory = (data, action, user, details={}) => {
  const entry = {
    id: uid(),
    action,
    user: user?.n || "Système",
    role: user?.r || "",
    details,
    date: new Date().toISOString(),
  };
  // Garde 3 mois
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth()-3);
  const co = cutoff.toISOString();
  const history = [...(data.history||[]), entry].filter(h=>h.date>=co).slice(-2000);
  return { ...data, history };
};

// ═══════════════════════════════════════════════════
// PDF & PARTAGE
// ═══════════════════════════════════════════════════
const printList = (items, name) => {
  const date = new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const urgent = items.filter(i=>i.urg);
  const normal = items.filter(i=>!i.urg);
  const cats = [...new Set(normal.map(i=>i.cat))];
  let html = `<html><head><style>
    body{font-family:Arial,sans-serif;padding:30px;color:#0F172A;font-size:13px}
    h1{font-size:20px;margin-bottom:4px;color:#2563EB}
    .sub{color:#64748B;font-size:12px;margin-bottom:24px}
    .sec{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;
      color:#94A3B8;margin:16px 0 8px;padding-bottom:4px;border-bottom:1px solid #E2E8F0}
    .item{display:flex;justify-content:space-between;align-items:center;
      padding:8px 12px;border:1px solid #E2E8F0;border-radius:6px;margin-bottom:5px}
    .item.urg{border-color:#FECACA;background:#FEF2F2}
    .n{font-weight:600}.s{font-size:11px;color:#94A3B8;margin-top:2px}
    .q{font-family:monospace;font-size:15px;font-weight:700;color:#2563EB}
    .urg .q{color:#DC2626}
    .cb{width:16px;height:16px;border:2px solid #CBD5E1;border-radius:4px;
      display:inline-block;margin-right:8px;flex-shrink:0}
    .foot{margin-top:30px;padding-top:12px;border-top:1px solid #E2E8F0;
      font-size:11px;color:#94A3B8;text-align:center}
  </style></head><body>
  <h1>🛒 Liste de courses</h1>
  <div class="sub">${name} · ${date}</div>`;

  if(urgent.length>0){
    html+=`<div class="sec">🚨 Urgents (${urgent.length})</div>`;
    urgent.forEach(i=>{html+=`<div class="item urg"><div style="display:flex;align-items:center"><span class="cb"></span><div><div class="n">${i.n}</div><div class="s">${i.src}</div></div></div><div class="q">${i.need} ${i.u}</div></div>`;});
  }
  cats.forEach(cat=>{
    const ci = normal.filter(i=>i.cat===cat);
    html+=`<div class="sec">${cat} (${ci.length})</div>`;
    ci.forEach(i=>{html+=`<div class="item"><div style="display:flex;align-items:center"><span class="cb"></span><div><div class="n">${i.n}</div><div class="s">${i.src}</div></div></div><div class="q">${i.need} ${i.u}</div></div>`;});
  });
  if(items.length===0) html+=`<div style="text-align:center;padding:40px;color:#94A3B8">✅ Aucun produit à commander</div>`;
  html+=`<div class="foot">Généré le ${date} · ${name}</div></body></html>`;

  const w = window.open("","_blank","width=800,height=600");
  if(w){ w.document.write(html); w.document.close(); w.focus(); setTimeout(()=>w.print(),600); }
};

const shareWA = (items, name) => {
  const date = new Date().toLocaleDateString("fr-FR");
  let txt = `🛒 *Liste de courses — ${name}*\n📅 ${date}\n\n`;
  const urg = items.filter(i=>i.urg);
  const norm = items.filter(i=>!i.urg);
  if(urg.length>0){ txt+=`🚨 *URGENTS*\n`; urg.forEach(i=>{txt+=`• ${i.n}: *${i.need} ${i.u}*\n`;}); txt+="\n"; }
  [...new Set(norm.map(i=>i.cat))].forEach(cat=>{
    txt+=`*${cat}*\n`;
    norm.filter(i=>i.cat===cat).forEach(i=>{txt+=`• ${i.n}: ${i.need} ${i.u}\n`;});
    txt+="\n";
  });
  window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`,"_blank");
};

const shareEmail = (items, name) => {
  const date = new Date().toLocaleDateString("fr-FR");
  const subj = `Liste de courses ${name} - ${date}`;
  let body = `Liste de courses — ${name}\n${date}\n\n`;
  const urg = items.filter(i=>i.urg);
  const norm = items.filter(i=>!i.urg);
  if(urg.length>0){ body+="=== URGENTS ===\n"; urg.forEach(i=>{body+=`• ${i.n}: ${i.need} ${i.u}\n`;}); body+="\n"; }
  [...new Set(norm.map(i=>i.cat))].forEach(cat=>{
    body+=`--- ${cat} ---\n`;
    norm.filter(i=>i.cat===cat).forEach(i=>{body+=`• ${i.n}: ${i.need} ${i.u}\n`;});
    body+="\n";
  });
  window.location.href=`mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
};

// ═══════════════════════════════════════════════════
// HISTORIQUE FEED (affiché sur la page d'accueil)
// ═══════════════════════════════════════════════════
const HistoryFeed = ({history, filterUser, maxItems=20}) => {
  const filtered = (history||[])
    .filter(h => !filterUser || h.user===filterUser)
    .slice(-maxItems)
    .reverse();

  if(filtered.length===0) return (
    <div style={{textAlign:"center",padding:20,color:T.t3,fontSize:13}}>
      Aucune action enregistrée
    </div>
  );

  return (
    <div>
      {filtered.map((h,i) => {
        const label = ACTION_LABELS[h.action]||h.action;
        const col = h.action?.includes("delete")||h.action?.includes("loss_declared") ? T.red
          : h.action?.includes("checked")||h.action?.includes("resolved")||h.action?.includes("done") ? T.grn
          : h.action?.includes("add")||h.action?.includes("advanced") ? T.acc : T.t3;
        return (
          <div key={h.id||i} style={{
            display:"flex", gap:10, padding:"9px 0",
            borderBottom:`1px solid ${T.border}`,
          }}>
            <div style={{width:8,height:8,borderRadius:"50%",background:col,
              flexShrink:0,marginTop:5}}/>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",
                alignItems:"flex-start",gap:8}}>
                <div>
                  <span style={{fontWeight:600,fontSize:13,color:T.t1}}>{label}</span>
                  {h.user&&<span style={{fontSize:12,color:T.t3,marginLeft:6}}>— {h.user}</span>}
                  {h.role&&<span style={{fontSize:11,color:T.t4,marginLeft:4}}>({h.role})</span>}
                </div>
                <span className="mono" style={{fontSize:10,color:T.t3,flexShrink:0}}>
                  {fmtDate(h.date)}
                </span>
              </div>
              {h.details&&(
                <div style={{fontSize:11,color:T.t2,marginTop:2}}>
                  {h.details.task||h.details.product||h.details.name||h.details.phase||""}
                  {h.details.qty&&` (−${h.details.qty})`}
                  {h.details.service&&` · ${h.details.service}`}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════
// STOCK
// ═══════════════════════════════════════════════════
const StockView = ({data, setData, role, user, filterUrgent=false}) => {
  const my = myProds(data.products, role).filter(p=>!filterUrgent||p.urg);
  const [cf,setCf] = useState("Tous");
  const [showAdd,setShowAdd] = useState(false);
  const [form,setForm] = useState({n:"",u:"",q:"",m:"",cat:"",p:ROLES[role]?.profil||"salle",urg:false});
  const cats = ["Tous",...new Set(myProds(data.products,role).map(p=>p.cat))];
  const shown = cf==="Tous" ? my : my.filter(p=>p.cat===cf);
  const alerts = myProds(data.products,role).filter(p=>p.q<p.m).length;

  const updQ = (id, delta) => {
    setData(prev => {
      const next = {...prev, products: prev.products.map(p=>
        p.id===id ? {...p, q:Math.max(0,+(p.q+delta).toFixed(2))} : p
      )};
      return addToHistory(next,"stock_update",user,{product:prev.products.find(p=>p.id===id)?.n,delta});
    });
  };

  const togUrg = id => setData(prev=>({...prev,
    products:prev.products.map(p=>p.id===id?{...p,urg:!p.urg}:p)
  }));

  const addProd = () => {
    if(!form.n||!form.u) return;
    const prod = {...form, id:`p${uid()}`, q:parseFloat(form.q)||0, m:parseFloat(form.m)||1};
    setData(prev => addToHistory({...prev, products:[...prev.products,prod]},
      "product_add", user, {name:prod.n}));
    setForm({n:"",u:"",q:"",m:"",cat:"",p:ROLES[role]?.profil||"salle",urg:false});
    setShowAdd(false);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700}}>
            Stocks{filterUrgent?" · 🚨 Urgents":""}
          </h2>
          <div style={{fontSize:13,color:alerts>0?T.red:T.t3,marginTop:2}}>
            {alerts} alerte(s) · {myProds(data.products,role).length} produits
          </div>
        </div>
        <Btn onClick={()=>setShowAdd(!showAdd)} v="secondary" sm icon="➕">Ajouter</Btn>
      </div>

      {showAdd&&(
        <Card style={{marginBottom:14,border:`1px solid ${T.acc}40`,background:T.accL}}>
          <div style={{fontSize:13,fontWeight:700,color:T.acc,marginBottom:12}}>Nouveau produit</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <FIn label="Nom" val={form.n} set={v=>setForm(p=>({...p,n:v}))} ph="Crème fraîche"/>
            <FIn label="Unité" val={form.u} set={v=>setForm(p=>({...p,u:v}))} ph="kg, L…"/>
            <FIn label="Quantité actuelle" val={form.q} set={v=>setForm(p=>({...p,q:v}))} type="number"/>
            <FIn label="Seuil minimum" val={form.m} set={v=>setForm(p=>({...p,m:v}))} type="number"/>
            <FIn label="Catégorie" val={form.cat} set={v=>setForm(p=>({...p,cat:v}))} ph="Viande, Boisson…"/>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:T.t2,marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Profil</div>
            <div style={{display:"flex",gap:6}}>
              {["cuisine","salle","both"].map(pr=>(
                <button key={pr} onClick={()=>setForm(p=>({...p,p:pr}))}
                  style={{flex:1,padding:"7px 4px",borderRadius:8,
                    border:`1px solid ${form.p===pr?T.acc:T.border}`,
                    background:form.p===pr?T.acc:"#fff",
                    color:form.p===pr?"#fff":T.t2,
                    cursor:"pointer",fontWeight:500,fontSize:11}}>
                  {{cuisine:"🍳 Cuisine",salle:"🍷 Salle",both:"🔄 Les deux"}[pr]}
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <Toggle on={form.urg} set={()=>setForm(p=>({...p,urg:!p.urg}))} label="Urgent 🚨" c={T.red}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={()=>setShowAdd(false)} v="ghost" full sm>Annuler</Btn>
            <Btn onClick={addProd} full sm dis={!form.n||!form.u} icon="✓">Ajouter</Btn>
          </div>
        </Card>
      )}

      <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:4,scrollbarWidth:"none"}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setCf(c)}
            style={{padding:"5px 12px",borderRadius:20,flexShrink:0,
              border:`1px solid ${cf===c?T.acc:T.border}`,
              background:cf===c?T.acc:"#fff",
              color:cf===c?"#fff":T.t2,
              cursor:"pointer",fontWeight:500,fontSize:12}}>
            {c}
          </button>
        ))}
      </div>

      {shown.map(p=>{
        const al=p.q<p.m;
        return (
          <Card key={p.id} style={{marginBottom:10}} hi={al||p.urg} hc={p.urg?T.red:T.org}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:4}}>
                  <span style={{fontWeight:600,fontSize:14}}>{p.n}</span>
                  {al&&<Badge c={T.red} sm>⚠ Alerte</Badge>}
                  {p.urg&&<Badge c={T.red} sm>🚨 Urgent</Badge>}
                </div>
                <span style={{fontSize:12,color:T.t3}}>{p.cat}</span>
              </div>
              <div style={{textAlign:"right"}}>
                <span className="mono" style={{fontSize:18,fontWeight:700,color:al?T.red:T.t1}}>{p.q}</span>
                <span style={{fontSize:12,color:T.t3,marginLeft:3}}>{p.u}</span>
                <div style={{fontSize:11,color:T.t3}}>min {p.m} {p.u}</div>
              </div>
            </div>
            <Bar v={p.q} max={p.m*2} c={al?T.red:p.q/p.m>1.5?T.grn:T.yel}/>
            <div style={{display:"flex",gap:5,marginTop:10,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:4}}>
                {[-1,-.5,.5,1,5].map(d=>(
                  <button key={d} onClick={()=>updQ(p.id,d)}
                    style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${T.border}`,
                      background:T.bg,color:d<0?T.red:T.grn,cursor:"pointer",fontSize:12,fontWeight:600}}>
                    {d>0?"+":""}{d}
                  </button>
                ))}
              </div>
              <div style={{flex:1}}/>
              <Toggle on={!!p.urg} set={()=>togUrg(p.id)} label="Urgent" c={T.red}/>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════
// INVENTAIRE
// ═══════════════════════════════════════════════════
const InventaireView = ({data, setData, role, user}) => {
  const my = myProds(data.products, role);
  const [vals,setVals] = useState(()=>Object.fromEntries(my.map(p=>[p.id,p.q])));
  const [ok,setOk] = useState(false);
  const [cf,setCf] = useState("Tous");
  const [showAdd,setShowAdd] = useState(false);
  const [form,setForm] = useState({n:"",u:"",q:"",m:"",cat:"",p:ROLES[role]?.profil||"salle",urg:false});
  const cats = ["Tous",...new Set(my.map(p=>p.cat))];
  const shown = cf==="Tous" ? my : my.filter(p=>p.cat===cf);
  const below = my.filter(p=>(parseFloat(vals[p.id])??p.q)<p.m).length;

  const doSave = () => {
    setData(prev => {
      let next = {...prev, products: prev.products.map(p=>{
        const nq = parseFloat(vals[p.id]);
        return (nq!==undefined&&nq!==p.q) ? {...p,q:nq} : p;
      })};
      next = addToHistory(next,"inventory_done",user,{below,role});
      return next;
    });
    setOk(true); setTimeout(()=>setOk(false),2500);
  };

  const addProd = () => {
    if(!form.n||!form.u) return;
    const prod = {...form, id:`p${uid()}`, q:parseFloat(form.q)||0, m:parseFloat(form.m)||1};
    setData(prev => addToHistory({...prev, products:[...prev.products,prod]},
      "product_add", user, {name:prod.n}));
    setVals(v=>({...v,[prod.id]:prod.q}));
    setForm({n:"",u:"",q:"",m:"",cat:"",p:ROLES[role]?.profil||"salle",urg:false});
    setShowAdd(false);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700}}>Inventaire</h2>
          <div style={{fontSize:13,color:below>0?T.red:T.t3,marginTop:2}}>{below} produit(s) sous seuil</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>setShowAdd(!showAdd)} v="secondary" sm icon="➕">Produit</Btn>
          <Btn onClick={doSave} v="success" sm icon="💾">{ok?"Sauvé ✓":"Valider"}</Btn>
        </div>
      </div>

      {ok&&<div className="up" style={{padding:"10px 14px",background:T.grnL,
        border:`1px solid ${T.grnB}`,borderRadius:10,marginBottom:12,
        fontSize:13,color:T.grn,fontWeight:600}}>
        ✅ Inventaire sauvegardé
      </div>}

      {showAdd&&(
        <Card style={{marginBottom:14,border:`1px solid ${T.acc}40`,background:T.accL}}>
          <div style={{fontSize:13,fontWeight:700,color:T.acc,marginBottom:12}}>Nouveau produit</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <FIn label="Nom" val={form.n} set={v=>setForm(p=>({...p,n:v}))} ph="Ex: Crème fraîche"/>
            <FIn label="Unité" val={form.u} set={v=>setForm(p=>({...p,u:v}))} ph="kg, L…"/>
            <FIn label="Qté actuelle" val={form.q} set={v=>setForm(p=>({...p,q:v}))} type="number"/>
            <FIn label="Minimum" val={form.m} set={v=>setForm(p=>({...p,m:v}))} type="number"/>
          </div>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <Btn onClick={()=>setShowAdd(false)} v="ghost" full sm>Annuler</Btn>
            <Btn onClick={addProd} full sm dis={!form.n||!form.u} icon="✓">Ajouter</Btn>
          </div>
        </Card>
      )}

      <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:4,scrollbarWidth:"none"}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setCf(c)}
            style={{padding:"5px 12px",borderRadius:20,flexShrink:0,
              border:`1px solid ${cf===c?T.acc:T.border}`,
              background:cf===c?T.acc:"#fff",color:cf===c?"#fff":T.t2,
              cursor:"pointer",fontWeight:500,fontSize:12}}>
            {c}
          </button>
        ))}
      </div>

      {shown.map(p=>{
        const v=parseFloat(vals[p.id]??p.q), bl=v<p.m;
        return (
          <Card key={p.id} style={{marginBottom:8,padding:"12px 14px"}} hi={bl} hc={T.red}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}>
                  <span style={{fontWeight:600,fontSize:13}}>{p.n}</span>
                  {bl&&<Badge c={T.red} sm>↓ Sous seuil</Badge>}
                </div>
                <span style={{fontSize:12,color:T.t3}}>min : <strong>{p.m} {p.u}</strong></span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <button onClick={()=>setVals(x=>({...x,[p.id]:Math.max(0,(parseFloat(x[p.id])||0)-1)}))}
                  style={{width:30,height:30,borderRadius:8,border:`1px solid ${T.border}`,
                    background:T.bg,color:T.red,cursor:"pointer",fontSize:16,fontWeight:700}}>−</button>
                <input type="number" value={vals[p.id]??p.q}
                  onChange={e=>setVals(x=>({...x,[p.id]:e.target.value}))}
                  style={{width:64,textAlign:"center",background:bl?T.redL:"#fff",
                    border:`1px solid ${bl?T.red:T.border}`,borderRadius:8,padding:"6px 4px",
                    color:bl?T.red:T.t1,fontFamily:"'DM Mono',monospace",
                    fontSize:14,fontWeight:600,outline:"none"}}/>
                <button onClick={()=>setVals(x=>({...x,[p.id]:(parseFloat(x[p.id])||0)+1}))}
                  style={{width:30,height:30,borderRadius:8,border:`1px solid ${T.border}`,
                    background:T.bg,color:T.grn,cursor:"pointer",fontSize:16,fontWeight:700}}>+</button>
                <span style={{fontSize:12,color:T.t3,width:20}}>{p.u}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════
// PERTES
// ═══════════════════════════════════════════════════
const PertesView = ({data, setData, role, user}) => {
  const prof = ROLES[role]?.profil||"salle";
  const my = data.products.filter(p=>p.p===prof||p.p==="both");
  const [sel,setSel]=useState(""); const [qty,setQty]=useState("");
  const [rsn,setRsn]=useState("Perte"); const [urg,setUrg]=useState(false); const [ok,setOk]=useState(false);
  const mine = (data.losses||[]).filter(l=>l.prof===prof||l.prof==="both").slice(0,30).reverse();

  const declare = () => {
    if(!sel||!qty) return;
    const prod = data.products.find(x=>x.id===sel);
    const loss = {id:uid(),date:new Date().toISOString(),pid:sel,pn:prod?.n||"?",
      qty:parseFloat(qty)||0, u:prod?.u||"", rsn, prof, by:user?.n||"", urg};
    setData(prev => {
      let next = {
        ...prev,
        losses:[loss,...(prev.losses||[])],
        products:prev.products.map(p=>p.id===sel?{...p,q:Math.max(0,p.q-(parseFloat(qty)||0))}:p),
      };
      return addToHistory(next,"loss_declared",user,{product:prod?.n,qty:parseFloat(qty),reason:rsn});
    });
    setSel(""); setQty(""); setUrg(false); setOk(true); setTimeout(()=>setOk(false),2000);
  };

  const resolve = id => {
    setData(prev => addToHistory(
      {...prev, losses:prev.losses.map(l=>l.id===id?{...l,res:true}:l)},
      "loss_resolved", user, {lossId:id}
    ));
  };

  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:700,marginBottom:4}}>Pertes & Ruptures</h2>
      <div style={{fontSize:13,color:T.t3,marginBottom:16}}>
        {mine.filter(l=>!l.res).length} déclaration(s) active(s)
      </div>

      <Card style={{marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Nouvelle déclaration</div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Produit</div>
          <select value={sel} onChange={e=>setSel(e.target.value)}
            style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,
              borderRadius:8,padding:"9px 11px",color:sel?T.t1:T.t3,fontSize:13,outline:"none"}}>
            <option value="">— Sélectionner un produit —</option>
            {my.map(p=><option key={p.id} value={p.id}>{p.n} ({p.q} {p.u})</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <FIn label="Quantité" val={qty} set={setQty} type="number" ph="Ex: 2"/>
          <div>
            <div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Motif</div>
            <select value={rsn} onChange={e=>setRsn(e.target.value)}
              style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,
                borderRadius:8,padding:"9px 11px",color:T.t1,fontSize:13,outline:"none"}}>
              {["Perte","Rupture de stock","DLC dépassée","Casse / bris","Autre"].map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <Toggle on={urg} set={()=>setUrg(!urg)} label="Marquer urgent" c={T.red}/>
        </div>
        <Btn onClick={declare} full dis={!sel||!qty} icon="📝">Déclarer</Btn>
        {ok&&<div style={{marginTop:8,fontSize:13,color:T.grn,fontWeight:600,textAlign:"center"}}>
          ✅ Déclaré — stock mis à jour
        </div>}
      </Card>

      <Divider label="Historique"/>
      {mine.length===0&&<div style={{textAlign:"center",padding:20,color:T.t3,fontSize:13}}>Aucune déclaration</div>}
      {mine.map(l=>(
        <Card key={l.id} style={{marginBottom:8,opacity:l.res?.5:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:4}}>
                <span style={{fontWeight:600,fontSize:13}}>{l.pn}</span>
                <Badge c={l.rsn==="Rupture de stock"?T.red:T.yel} sm>{l.rsn}</Badge>
                {l.urg&&<Badge c={T.red} sm>🚨</Badge>}
              </div>
              <div className="mono" style={{fontSize:13,color:T.red,marginBottom:2}}>−{l.qty} {l.u}</div>
              <div style={{fontSize:11,color:T.t3}}>{l.by} · {fmtDate(l.date)}</div>
            </div>
            {!l.res&&<Btn onClick={()=>resolve(l.id)} sm v="success" icon="✓">Résolu</Btn>}
          </div>
        </Card>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════
// COURSES
// ═══════════════════════════════════════════════════
const CoursesView = ({data, setData, role, user}) => {
  const my = myProds(data.products, role);
  const prof = ROLES[role]?.profil||"salle";
  const [chk,setChk] = useState({});
  const [showManual,setShowManual] = useState(false);
  const [manSel,setManSel] = useState("");
  const [manQty,setManQty] = useState("");
  const [manuals,setManuals] = useState([]);
  const [showShare,setShowShare] = useState(false);

  const belowMin = my.filter(p=>p.q<p.m).map(p=>({
    id:`i_${p.id}`,pid:p.id,n:p.n,u:p.u,cat:p.cat,
    need:+(p.m-p.q+p.m*0.2).toFixed(2),src:"Inventaire",urg:p.urg
  }));
  const ruptures = (data.losses||[]).filter(l=>l.rsn==="Rupture de stock"&&!l.res&&(l.prof===prof||l.prof==="both"))
    .map(l=>({id:`r_${l.id}`,pid:l.pid,n:l.pn,u:l.u,cat:"Rupture",need:l.qty,src:"Rupture déclarée",urg:true}));
  const all = [...ruptures,...belowMin.filter(b=>!ruptures.some(r=>r.pid===b.pid)),...manuals];
  const urgCount = all.filter(i=>i.urg).length;
  const cats = [...new Set(all.filter(i=>!i.urg).map(i=>i.cat))];
  const name = data.settings?.name||"Restaurant";

  const addManual = () => {
    if(!manSel||!manQty) return;
    const prod = my.find(p=>p.id===manSel);
    setManuals(prev=>[...prev,{id:`m_${uid()}`,pid:manSel,n:prod?.n||manSel,
      u:prod?.u||"",cat:"Ajout manuel",need:parseFloat(manQty)||1,src:"Ajout manuel",urg:false}]);
    setManSel(""); setManQty(""); setShowManual(false);
  };

  const markDone = pid => {
    const prod = data.products.find(p=>p.id===pid);
    if(prod) setData(prev=>({...prev,
      products:prev.products.map(p=>p.id===pid?{...p,q:p.m*1.3}:p),
      losses:prev.losses.map(l=>l.pid===pid?{...l,res:true}:l)
    }));
    setManuals(prev=>prev.filter(m=>m.pid!==pid));
  };

  const CItem = ({item}) => (
    <Card style={{marginBottom:8}} className="pcard">
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div onClick={()=>setChk(x=>({...x,[item.id]:!x[item.id]}))}
          style={{width:22,height:22,borderRadius:6,flexShrink:0,
            border:`2px solid ${chk[item.id]?T.grn:T.borderB}`,
            background:chk[item.id]?T.grn:"#fff",
            display:"flex",alignItems:"center",justifyContent:"center",
            cursor:"pointer",transition:"all .2s"}}>
          {chk[item.id]&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>✓</span>}
        </div>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
            <span style={{fontWeight:600,fontSize:13,
              textDecoration:chk[item.id]?"line-through":"none",
              color:chk[item.id]?T.t3:T.t1}}>{item.n}</span>
            {item.urg&&<Badge c={T.red} sm>🚨 Urgent</Badge>}
          </div>
          <Badge c={item.src==="Rupture déclarée"?T.red:item.src==="Ajout manuel"?T.pur:T.org} sm>
            {item.src}
          </Badge>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div className="mono" style={{fontSize:16,fontWeight:700,color:item.urg?T.red:T.acc}}>
            {item.need}
          </div>
          <div style={{fontSize:11,color:T.t3}}>{item.u}</div>
        </div>
      </div>
      {!chk[item.id]&&(
        <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`}}>
          <Btn onClick={()=>markDone(item.pid)} sm v="success" full icon="✅">Marquer commandé</Btn>
        </div>
      )}
    </Card>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700}}>Liste de courses</h2>
          <div style={{fontSize:13,color:T.t3,marginTop:2}}>{all.length} produit(s) · {urgCount} urgent(s)</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <Btn onClick={()=>setShowManual(!showManual)} v="secondary" sm icon="➕">Ajouter</Btn>
          <Btn onClick={()=>setShowShare(!showShare)} v="secondary" sm icon="📤">Partager</Btn>
        </div>
      </div>

      {/* Partage */}
      {showShare&&(
        <Card style={{marginBottom:14,border:`1px solid ${T.acc}40`,background:T.accL}}>
          <div style={{fontSize:13,fontWeight:700,color:T.acc,marginBottom:12}}>📤 Partager la liste</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Btn onClick={()=>printList(all,name)} v="secondary" full sm icon="🖨️">Imprimer / PDF</Btn>
            <Btn onClick={()=>shareWA(all,name)} full sm icon="💬" col="#25D366">WhatsApp</Btn>
            <Btn onClick={()=>shareEmail(all,name)} v="secondary" full sm icon="📧">Email</Btn>
            <Btn onClick={()=>{
              const txt=all.map(i=>`${i.n}: ${i.need}${i.u}`).join("\n");
              navigator.clipboard?.writeText(txt).then(()=>alert("Copié !"));
            }} v="ghost" full sm icon="📋">Copier texte</Btn>
          </div>
          <button onClick={()=>setShowShare(false)}
            style={{marginTop:10,background:"none",border:"none",color:T.t3,
              cursor:"pointer",fontSize:12,width:"100%"}}>Fermer</button>
        </Card>
      )}

      {/* Ajout manuel */}
      {showManual&&(
        <Card style={{marginBottom:14,border:`1px solid ${T.pur}40`,background:T.purL}}>
          <div style={{fontSize:13,fontWeight:700,color:T.pur,marginBottom:10}}>Ajouter à la liste</div>
          <div style={{marginBottom:8}}>
            <div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Produit</div>
            <select value={manSel} onChange={e=>setManSel(e.target.value)}
              style={{width:"100%",background:"#fff",border:`1px solid ${T.border}`,
                borderRadius:8,padding:"9px 11px",color:manSel?T.t1:T.t3,fontSize:13,outline:"none"}}>
              <option value="">— Sélectionner dans la liste —</option>
              {my.map(p=><option key={p.id} value={p.id}>{p.n} ({p.u})</option>)}
            </select>
          </div>
          <FIn label="Quantité à commander" val={manQty} set={setManQty} type="number" ph="Ex: 5"/>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={()=>setShowManual(false)} v="ghost" full sm>Annuler</Btn>
            <Btn onClick={addManual} full sm dis={!manSel||!manQty} icon="➕">Ajouter</Btn>
          </div>
        </Card>
      )}

      {all.length===0&&(
        <Card style={{textAlign:"center",padding:32}}>
          <div style={{fontSize:32,marginBottom:8}}>✅</div>
          <div style={{fontWeight:600,color:T.grn,fontSize:15}}>Tout est approvisionné !</div>
          <div style={{fontSize:13,color:T.t3,marginTop:4}}>Aucun produit sous seuil ni rupture</div>
        </Card>
      )}

      {urgCount>0&&(
        <div style={{marginBottom:14}}>
          <Divider label="🚨 Urgents"/>
          {all.filter(i=>i.urg).map(i=><CItem key={i.id} item={i}/>)}
        </div>
      )}
      {cats.map(cat=>{
        const items=all.filter(i=>i.cat===cat&&!i.urg);
        if(!items.length) return null;
        return <div key={cat} style={{marginBottom:14}}>
          <Divider label={cat}/>
          {items.map(i=><CItem key={i.id} item={i}/>)}
        </div>;
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════
// MEP CHECKLIST
// ═══════════════════════════════════════════════════
const MepList = ({dishes,chks,onTog,col,mepActual,setData,svc,user}) => {
  if(!dishes.length) return (
    <div style={{textAlign:"center",padding:32,color:T.t3,fontSize:13}}>
      Aucun plat configuré pour ce service.
    </div>
  );
  return (
    <div>
      {dishes.map(d=>{
        const done=d.subs.every(s=>chks[s.id]);
        const cnt=d.subs.filter(s=>chks[s.id]).length;
        const ak=`${d.dishId}_${svc}`;
        const actual=mepActual?.[ak];
        return (
          <Card key={d.id} style={{marginBottom:12}} hi={done} hc={T.grn}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${T.border}`}}>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:done?T.grn:T.t1,marginBottom:3}}>{d.l}</div>
                <Badge c={done?T.grn:col}>{cnt}/{d.subs.length} étapes</Badge>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:T.t3,marginBottom:2}}>Recommandé</div>
                <div className="mono" style={{fontSize:22,fontWeight:700,color:col}}>{d.pts}</div>
                <div style={{fontSize:11,color:T.t3}}>portions</div>
              </div>
            </div>
            {/* Quantité réelle */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,
              padding:"8px 12px",background:T.bg,borderRadius:8}}>
              <span style={{fontSize:12,color:T.t2,flex:1}}>Quantité réellement produite :</span>
              <input type="number" value={actual??d.pts}
                onChange={e=>{
                  const val=parseInt(e.target.value)||0;
                  setData(prev=>addToHistory(
                    {...prev,mepActual:{...(prev.mepActual||{}),[ak]:val}},
                    "mep_actual",user,{dish:d.l,val}
                  ));
                }}
                style={{width:64,textAlign:"center",background:"#fff",
                  border:`1px solid ${actual&&actual!==d.pts?T.org:T.border}`,
                  borderRadius:8,padding:"5px 4px",
                  color:actual&&actual!==d.pts?T.org:T.t1,
                  fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:600,outline:"none"}}/>
              <span style={{fontSize:12,color:T.t3}}>portions</span>
              {actual&&actual!==d.pts&&<Badge c={T.org} sm>Modifié</Badge>}
            </div>
            {d.subs.map(s=>(
              <div key={s.id} onClick={()=>onTog(s.id,s.l)}
                style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",
                  borderBottom:`1px solid ${T.border}`,cursor:"pointer",
                  opacity:chks[s.id]?.5:1,transition:"opacity .2s"}}>
                <div style={{width:20,height:20,borderRadius:5,flexShrink:0,marginTop:1,
                  border:`2px solid ${chks[s.id]?T.grn:T.borderB}`,
                  background:chks[s.id]?T.grn:"#fff",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {chks[s.id]&&<span style={{color:"#fff",fontSize:10,fontWeight:700}}>✓</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,textDecoration:chks[s.id]?"line-through":"none"}}>{s.l}</div>
                  {s.note&&<div style={{fontSize:11,color:T.t3,fontStyle:"italic",marginTop:1}}>{s.note}</div>}
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div className="mono" style={{fontSize:14,fontWeight:600,color:chks[s.id]?T.grn:T.acc}}>
                    {s.qty>999?`${(s.qty/1000).toFixed(1)}k`:s.qty}
                  </div>
                  <div style={{fontSize:10,color:T.t3}}>{s.u}</div>
                </div>
              </div>
            ))}
          </Card>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════
// STAFF JOURNEY
// ═══════════════════════════════════════════════════
const Journey = ({user, data, setData, svc, covers, onLogout, onDeepNav}) => {
  const rc = ROLES[user.r]||ROLES["Manager"];
  const col = rc.c;
  const dk = todayK();
  const sk = `${dk}_${svc}_${user.id}`;
  const st = data.daily?.[sk]||{};
  const chks = st.chks||{};
  const [view,setView] = useState("journey");
  const [phase,setPhase] = useState(st.phase||rc.phases[0]);
  const [unlAnim,setUnlAnim] = useState(null);
  const disabled = data.disabledTasks||{};

  const setSt = upd => setData(prev=>({...prev,
    daily:{...prev.daily,[sk]:{...(prev.daily?.[sk]||{}),...upd}}
  }));

  const getActiveTasks = p => {
    if(p==="mep") return [];
    return (rc.tasks[p]||[]).filter(t=>!disabled[t.id]);
  };

  const getMep = () => (data.dishes||[]).filter(d=>d.svc?.includes(svc)).map(d=>({
    id:`m_${d.id}`, dishId:d.id, l:d.n,
    pts:Math.ceil(covers*(d.r||0.3)),
    subs:(d.comps||[]).map(c=>({
      id:`m_${d.id}_${c.id}`,l:c.l,
      qty:Math.ceil(covers*(d.r||0.3)*(c.pc||0)),
      u:c.u,note:c.note
    }))
  }));

  const getPct = p => {
    if(p==="mep"){ const t=getMep().flatMap(d=>d.subs); return t.length?t.filter(x=>chks[x.id]).length/t.length:1; }
    const t=getActiveTasks(p); return t.length?t.filter(x=>chks[x.id]).length/t.length:1;
  };
  const pOk = p => getPct(p)>=1;
  const unlocked = p => { const i=rc.phases.indexOf(p); return i===0||pOk(rc.phases[i-1]); };

  const togTask = (taskId, taskLabel, phase_) => {
    const done = !chks[taskId];
    const newChks = {...chks,[taskId]:done};
    setSt({chks:newChks});
    setData(prev=>addToHistory(
      {...prev, daily:{...prev.daily,[sk]:{...(prev.daily?.[sk]||{}),chks:newChks}}},
      done?"task_checked":"task_unchecked", user,
      {task:taskLabel, phase:phase_, service:svc}
    ));
  };

  const advance = p => {
    const i=rc.phases.indexOf(p), nx=rc.phases[i+1];
    if(nx){
      setSt({phase:nx});
      setData(prev=>addToHistory(
        {...prev, daily:{...prev.daily,[sk]:{...(prev.daily?.[sk]||{}),phase:nx}}},
        "phase_advanced", user, {phase:nx, service:svc}
      ));
      setPhase(nx); setUnlAnim(nx); setTimeout(()=>setUnlAnim(null),700);
    }
  };

  const oPct = Math.round(rc.phases.reduce((s,p)=>s+getPct(p),0)/rc.phases.length*100);
  const allDone = rc.phases.every(p=>pOk(p));
  const curTasks = phase==="mep"?getMep():getActiveTasks(phase);
  const curDone = phase==="mep"?curTasks.flatMap(d=>d.subs).filter(s=>chks[s.id]).length:curTasks.filter(t=>chks[t.id]).length;
  const curTot = phase==="mep"?curTasks.flatMap(d=>d.subs).length:curTasks.length;

  const myP = myProds(data.products, user.r);
  const alertN = myP.filter(p=>p.q<p.m).length;
  const prof = rc.profil;
  const rupN = (data.losses||[]).filter(l=>l.rsn==="Rupture de stock"&&!l.res&&(l.prof===prof||l.prof==="both")).length;
  const coursN = alertN+rupN;

  const VIEWS = [
    {id:"journey",   l:"Service",   icon:"🗓"},
    {id:"accueil",   l:"Accueil",   icon:"🏠"},
    {id:"stock",     l:"Stocks",    icon:"📦", b:alertN>0?alertN:null},
    {id:"inventaire",l:"Inventaire",icon:"📋"},
    {id:"pertes",    l:"Pertes",    icon:"🗑",  b:rupN>0?rupN:null},
    {id:"courses",   l:"Courses",   icon:"🛒",  b:coursN>0?coursN:null},
  ];

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
      {/* HEADER */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,
        padding:"12px 16px",boxShadow:T.sh}} className="noprint">
        <div style={{display:"flex",alignItems:"center",gap:10,maxWidth:680,margin:"0 auto"}}>
          <div style={{width:38,height:38,borderRadius:10,flexShrink:0,
            background:`${col}18`,border:`2px solid ${col}30`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{rc.i}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:14}}>{user.n}</div>
            <div style={{fontSize:12,color:col,fontWeight:600}}>{user.r}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:20,
                background:svc==="Déjeuner"?T.yelL:T.purL,
                color:svc==="Déjeuner"?T.yel:T.pur,whiteSpace:"nowrap"}}>{svc}</div>
              <div style={{fontSize:11,color:T.t3,marginTop:2}}>{covers} couverts</div>
            </div>
            {view==="journey"&&<Ring v={oPct} max={100} c={allDone?T.grn:col} sz={40} sw={4}/>}
            <button onClick={onLogout} title="Déconnexion"
              style={{width:34,height:34,borderRadius:8,border:`1px solid ${T.border}`,
                background:T.bg,color:T.t3,cursor:"pointer",fontSize:14,
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              ⬅
            </button>
          </div>
        </div>
        {view==="journey"&&(
          <div style={{display:"flex",gap:3,marginTop:10,maxWidth:680,margin:"10px auto 0"}}>
            {rc.phases.map(p=>{
              const d=pOk(p),a=p===phase,lk=!unlocked(p);
              return <div key={p} onClick={()=>!lk&&setPhase(p)}
                style={{flex:1,height:5,borderRadius:3,cursor:lk?"not-allowed":"pointer",
                  background:d?T.grn:a?col:T.border,opacity:lk&&!d?.3:1,transition:"all .3s"}}
                title={rc.labels[p]}/>;
            })}
          </div>
        )}
      </div>

      {/* NAV */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`}} className="noprint">
        <div style={{display:"flex",overflowX:"auto",scrollbarWidth:"none",maxWidth:680,margin:"0 auto"}}>
          {VIEWS.map(v=>(
            <button key={v.id} onClick={()=>setView(v.id)} style={{
              display:"flex",alignItems:"center",gap:4,padding:"10px 11px",
              border:"none",borderBottom:`2px solid ${view===v.id?col:"transparent"}`,
              background:"transparent",color:view===v.id?col:T.t3,
              cursor:"pointer",fontWeight:view===v.id?700:500,fontSize:12,
              whiteSpace:"nowrap",transition:"all .15s",flexShrink:0,
            }}>
              <span>{v.icon}</span>{v.l}
              {v.b!=null&&<span style={{background:T.red,color:"#fff",borderRadius:10,
                fontSize:9,fontWeight:700,padding:"1px 5px",fontFamily:"'DM Mono',monospace"}}>
                {v.b}
              </span>}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{padding:16,paddingBottom:80,maxWidth:680,margin:"0 auto",flex:1,width:"100%"}} className="up">

        {/* PAGE ACCUEIL — historique visible par tous */}
        {view==="accueil"&&(
          <div>
            <h2 style={{fontSize:18,fontWeight:700,marginBottom:4}}>Activité du restaurant</h2>
            <div style={{fontSize:13,color:T.t3,marginBottom:16}}>{dnow()}</div>

            {/* Résumé rapide */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
              <Card style={{textAlign:"center",padding:"14px 10px",cursor:"pointer"}}
                onClick={()=>setView("stock")} hi={alertN>0} hc={T.org}>
                <div style={{fontSize:22}}>📦</div>
                <div className="mono" style={{fontSize:22,fontWeight:700,color:alertN>0?T.org:T.grn}}>{alertN}</div>
                <div style={{fontSize:11,color:T.t3,marginTop:2}}>Alertes stock</div>
                {alertN>0&&<div style={{fontSize:10,color:T.acc,marginTop:4}}>Voir →</div>}
              </Card>
              <Card style={{textAlign:"center",padding:"14px 10px",cursor:"pointer"}}
                onClick={()=>setView("courses")} hi={coursN>0} hc={T.pur}>
                <div style={{fontSize:22}}>🛒</div>
                <div className="mono" style={{fontSize:22,fontWeight:700,color:T.pur}}>{coursN}</div>
                <div style={{fontSize:11,color:T.t3,marginTop:2}}>À commander</div>
                <div style={{fontSize:10,color:T.acc,marginTop:4}}>Voir →</div>
              </Card>
            </div>

            <Divider label="Historique des actions — toute l'équipe"/>
            <HistoryFeed history={data.history} maxItems={50}/>
          </div>
        )}

        {view==="stock"      &&<StockView data={data} setData={setData} role={user.r} user={user}/>}
        {view==="inventaire" &&<InventaireView data={data} setData={setData} role={user.r} user={user}/>}
        {view==="pertes"     &&<PertesView data={data} setData={setData} role={user.r} user={user}/>}
        {view==="courses"    &&<CoursesView data={data} setData={setData} role={user.r} user={user}/>}

        {view==="journey"&&(
          <>
            {/* Phase tabs */}
            <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:16,paddingBottom:4,scrollbarWidth:"none"}}>
              {rc.phases.map(p=>{
                const d=pOk(p),a=p===phase,lk=!unlocked(p);
                return (
                  <button key={p} onClick={()=>!lk&&setPhase(p)} style={{
                    display:"flex",alignItems:"center",gap:4,padding:"7px 12px",borderRadius:20,
                    flexShrink:0,border:`1px solid ${a?col:d?T.grn:T.border}`,
                    background:a?col:d?T.grnL:"#fff",color:a?"#fff":d?T.grn:lk?T.t4:T.t2,
                    cursor:lk?"not-allowed":"pointer",fontWeight:600,fontSize:12,
                    boxShadow:a?`0 2px 8px ${col}40`:"none",transition:"all .2s",
                    animation:unlAnim===p?"fadeUp .3s ease":"",
                  }}>
                    {d?"✓":lk?"🔒":""} {rc.labels[p]}
                  </button>
                );
              })}
            </div>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <h2 style={{fontSize:20,fontWeight:700}}>{rc.labels[phase]}</h2>
                <div style={{fontSize:12,color:T.t3,marginTop:2}}>{dnow()}</div>
              </div>
              <Ring v={curDone} max={curTot||1} c={getPct(phase)>=1?T.grn:col} sz={52} sw={5}/>
            </div>

            {!unlocked(phase)&&(
              <Card style={{marginBottom:16,textAlign:"center",padding:24,
                background:T.redL,border:`1px solid ${T.redB}`}}>
                <div style={{fontSize:28,marginBottom:8}}>🔒</div>
                <div style={{fontWeight:700,color:T.red}}>Phase verrouillée</div>
                <div style={{fontSize:13,color:T.t2,marginTop:6}}>
                  Complétez d'abord : <strong>{rc.labels[rc.phases[rc.phases.indexOf(phase)-1]]}</strong>
                </div>
              </Card>
            )}

            {unlocked(phase)&&phase==="mep"&&(
              <MepList dishes={curTasks} chks={chks} onTog={(id,l)=>togTask(id,l,"mep")}
                col={col} mepActual={data.mepActual||{}} setData={setData} svc={svc} user={user}/>
            )}

            {unlocked(phase)&&phase!=="mep"&&(
              <div>
                {curTasks.length===0&&(
                  <Card style={{textAlign:"center",padding:20,color:T.t3}}>
                    Toutes les tâches ont été désactivées par le manager.
                  </Card>
                )}
                {curTasks.map(t=>(
                  <div key={t.id} onClick={()=>togTask(t.id,t.t,phase)} style={{
                    display:"flex",alignItems:"flex-start",gap:12,padding:"13px 14px",
                    background:chks[t.id]?T.grnL:"#fff",
                    border:`1px solid ${chks[t.id]?T.grnB:T.border}`,
                    borderRadius:10,cursor:"pointer",marginBottom:8,
                    transition:"all .2s",boxShadow:chks[t.id]?"none":T.sh,
                  }}>
                    <div style={{width:22,height:22,borderRadius:6,
                      border:`2px solid ${chks[t.id]?T.grn:T.borderB}`,
                      background:chks[t.id]?T.grn:"#fff",flexShrink:0,marginTop:1,
                      display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                      {chks[t.id]&&<span style={{color:"#fff",fontSize:12,fontWeight:700}}>✓</span>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,color:chks[t.id]?T.t3:T.t1,
                        textDecoration:chks[t.id]?"line-through":"none",
                        fontWeight:500,lineHeight:1.4}}>{t.t}</div>
                      <div style={{display:"flex",gap:4,marginTop:5}}>
                        {t.k&&<Badge c={T.red} sm>Critique</Badge>}
                        {t.h&&<Badge c={T.org} sm>HACCP</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {unlocked(phase)&&pOk(phase)&&rc.phases.indexOf(phase)<rc.phases.length-1&&(
              <div className="up" style={{marginTop:16}}>
                <Card style={{marginBottom:12,background:T.grnL,border:`1px solid ${T.grnB}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:24}}>✅</span>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:T.grn}}>Phase terminée !</div>
                      <div style={{fontSize:12,color:T.t2}}>
                        {rc.labels[rc.phases[rc.phases.indexOf(phase)+1]]} est débloquée
                      </div>
                    </div>
                  </div>
                </Card>
                <Btn onClick={()=>advance(phase)} full col={col} icon="→">
                  Passer à : {rc.labels[rc.phases[rc.phases.indexOf(phase)+1]]}
                </Btn>
              </div>
            )}

            {allDone&&(
              <Card style={{marginTop:20,textAlign:"center",padding:28,
                background:`${col}08`,border:`2px solid ${col}30`}}>
                <div style={{fontSize:40,marginBottom:10}}>{rc.i}</div>
                <div style={{fontSize:20,fontWeight:700,color:col}}>Bravo !</div>
                <div style={{fontSize:14,color:T.t2,marginTop:4}}>
                  Toutes les phases du {svc} complétées
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════
const Login = ({data, onLogin, svc, setSvc}) => {
  const [sel,setSel]=useState(null);
  const [pin,setPin]=useState("");
  const [err,setErr]=useState("");
  const [apw,setApw]=useState("");
  const [showAdmin,setShowAdmin]=useState(false);
  const {staff,settings} = data;
  const cvr = settings?.cvr?.[todayK()]||0;
  const auto = detSvc(settings);
  const aff = cvr>=100?{l:"Forte affluence",c:T.red,bg:T.redL}
    :cvr>=70?{l:"Affluence moyenne",c:T.org,bg:T.orgL}
    :{l:"Service calme",c:T.grn,bg:T.grnL};

  const tryLogin = () => {
    if(showAdmin){
      if(apw===""||apw==="admin"){ onLogin({id:0,n:"Admin",r:"Manager",admin:true}); return; }
      setErr("Mot de passe incorrect"); return;
    }
    const m = staff.find(s=>String(s.id)===String(sel));
    if(m&&(m.pin===pin||pin==="")){ onLogin(m); setErr(""); }
    else { setErr("PIN incorrect"); setPin(""); }
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Header */}
      <div style={{background:T.acc,padding:"28px 24px 20px",textAlign:"center",flexShrink:0}}>
        <div style={{fontSize:26,fontWeight:700,color:"#fff",letterSpacing:-.5}}>L'Embouchure</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.75)",marginTop:3}}>Système opérationnel</div>
        <div className="mono" style={{fontSize:11,color:"rgba(255,255,255,.5)",marginTop:3}}>
          {dnow()} · {tnow()}
        </div>
      </div>

      {/* Corps scrollable */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 32px"}}>
        <div style={{maxWidth:420,margin:"0 auto"}}>

          {/* Service */}
          <Card style={{marginBottom:14,padding:14}}>
            <div style={{fontSize:11,fontWeight:700,color:T.t3,textTransform:"uppercase",
              letterSpacing:1,marginBottom:10,textAlign:"center"}}>Service actif</div>
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {["Déjeuner","Dîner","Brunch"].map(s=>{
                const active=svc===s, c=s==="Déjeuner"?T.yel:s==="Dîner"?T.pur:T.acc;
                return (
                  <button key={s} onClick={()=>setSvc(s)} style={{
                    flex:1,padding:"9px 4px",borderRadius:10,
                    border:`2px solid ${active?c:T.border}`,
                    background:active?`${c}18`:"#fff",color:active?c:T.t3,
                    cursor:"pointer",fontWeight:600,fontSize:12,transition:"all .15s",
                  }}>
                    {s}{s===auto&&<span style={{fontSize:9,opacity:.6}}> ●</span>}
                  </button>
                );
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"8px 12px",background:aff.bg,borderRadius:8}}>
              <span style={{fontSize:13,color:aff.c,fontWeight:600}}>{aff.l}</span>
              <span className="mono" style={{fontSize:15,color:T.t1,fontWeight:700}}>{cvr} couverts</span>
            </div>
          </Card>

          {/* Staff list */}
          {!sel&&!showAdmin&&(
            <>
              <div style={{fontSize:11,fontWeight:700,color:T.t3,textTransform:"uppercase",
                letterSpacing:1,marginBottom:10}}>Qui êtes-vous ?</div>
              {staff.filter(s=>s.on).map(s=>{
                const rc=ROLES[s.r];
                return (
                  <Card key={s.id} onClick={()=>setSel(String(s.id))}
                    style={{marginBottom:8,display:"flex",alignItems:"center",
                      gap:12,cursor:"pointer",padding:"12px 14px"}}>
                    <div style={{width:44,height:44,borderRadius:12,flexShrink:0,
                      background:`${rc?.c||T.acc}18`,border:`2px solid ${rc?.c||T.acc}30`,
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>
                      {rc?.i||"👤"}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:14}}>{s.n}</div>
                      <div style={{fontSize:12,color:rc?.c||T.t2,fontWeight:500,marginTop:1}}>{s.r}</div>
                    </div>
                    <div style={{color:T.t4,fontSize:18}}>›</div>
                  </Card>
                );
              })}
              {staff.filter(s=>s.on).length===0&&(
                <Card style={{textAlign:"center",padding:24,color:T.t3}}>
                  <div style={{fontSize:32,marginBottom:8}}>👥</div>
                  <div style={{fontWeight:600}}>Aucun membre actif</div>
                  <div style={{fontSize:12,marginTop:4}}>Connectez-vous en tant qu'administrateur.</div>
                </Card>
              )}
              <div style={{marginTop:16,textAlign:"center"}}>
                <button onClick={()=>setShowAdmin(true)}
                  style={{background:"none",border:"none",color:T.t3,
                    cursor:"pointer",fontSize:13,textDecoration:"underline",padding:"8px 16px"}}>
                  Accès administrateur
                </button>
              </div>
            </>
          )}

          {/* Admin login */}
          {showAdmin&&(
            <Card className="up">
              <div style={{textAlign:"center",marginBottom:16}}>
                <div style={{width:56,height:56,borderRadius:16,background:T.redL,
                  border:`2px solid ${T.redB}`,display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:24,margin:"0 auto 10px"}}>🔐</div>
                <div style={{fontWeight:700,fontSize:16}}>Accès Administrateur</div>
              </div>
              <FIn label="Mot de passe" val={apw} set={setApw} type="password" ph="admin (ou laisser vide)"/>
              {err&&<div style={{color:T.red,fontSize:13,marginBottom:8,fontWeight:500}}>{err}</div>}
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={()=>{setShowAdmin(false);setErr("");setApw("");}} v="ghost" full sm>Retour</Btn>
                <Btn onClick={tryLogin} full sm>Connexion →</Btn>
              </div>
            </Card>
          )}

          {/* PIN pad */}
          {sel&&!showAdmin&&(()=>{
            const m=staff.find(s=>String(s.id)===sel), rc=ROLES[m?.r];
            return (
              <Card className="up">
                <div style={{textAlign:"center",marginBottom:16}}>
                  <div style={{width:60,height:60,borderRadius:16,
                    background:`${rc?.c||T.acc}18`,border:`2px solid ${rc?.c||T.acc}30`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:26,margin:"0 auto 10px"}}>{rc?.i}</div>
                  <div style={{fontWeight:700,fontSize:17}}>{m?.n}</div>
                  <div style={{fontSize:13,color:rc?.c,fontWeight:600,marginTop:2}}>{m?.r}</div>
                </div>
                {/* PIN dots */}
                <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:16}}>
                  {[0,1,2,3].map(i=>(
                    <div key={i} style={{width:14,height:14,borderRadius:"50%",
                      background:pin.length>i?T.acc:T.border,transition:"all .2s"}}/>
                  ))}
                </div>
                {/* PIN pad */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                  {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>(
                    <button key={i} onClick={()=>{
                      if(k==="⌫") setPin(p=>p.slice(0,-1));
                      else if(k!=="") setPin(p=>p.length<4?p+k:p);
                    }} style={{
                      padding:"14px",borderRadius:12,
                      border:`1px solid ${T.border}`,
                      background:k===""?"transparent":T.bg,
                      color:T.t1,fontSize:18,fontWeight:600,
                      cursor:k===""?"default":"pointer",
                      opacity:k===""?0:1,boxShadow:k===""?"none":T.sh,
                    }}>{k}</button>
                  ))}
                </div>
                {err&&<div style={{color:T.red,fontSize:13,textAlign:"center",marginBottom:8,fontWeight:500}}>{err}</div>}
                <div style={{display:"flex",gap:8}}>
                  <Btn onClick={()=>{setSel(null);setPin("");setErr("");}} v="ghost" full>Retour</Btn>
                  <Btn onClick={tryLogin} full>Connexion →</Btn>
                </div>
                <div style={{fontSize:11,color:T.t3,textAlign:"center",marginTop:8}}>
                  Laisser vide pour accès sans PIN
                </div>
              </Card>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════════════════════
const Admin = ({data, setData, svc, covers, onLogout}) => {
  const [tab,setTab]=useState("vue");
  const [deepView,setDeepView]=useState(null);
  const dk = todayK();

  const navigate = (view) => { setDeepView(view); };
  const goBack = () => setDeepView(null);

  if(deepView) return (
    <div style={{minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.acc,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}} className="noprint">
        <button onClick={goBack}
          style={{background:"rgba(255,255,255,.2)",border:"1px solid rgba(255,255,255,.3)",
            color:"#fff",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:13,fontWeight:600}}>
          ← Retour
        </button>
        <span style={{color:"#fff",fontWeight:600,fontSize:14}}>{data.settings?.name}</span>
      </div>
      <div style={{padding:16,maxWidth:800,margin:"0 auto"}}>
        {deepView==="stock-urgent"&&<StockView data={data} setData={setData} role="Manager" user={{n:"Admin",r:"Manager"}} filterUrgent={true}/>}
        {deepView==="stock-alert"&&<StockView data={data} setData={setData} role="Manager" user={{n:"Admin",r:"Manager"}}/>}
        {deepView==="courses"&&<CoursesView data={data} setData={setData} role="Manager" user={{n:"Admin",r:"Manager"}}/>}
        {deepView==="pertes"&&<PertesView data={data} setData={setData} role="Manager" user={{n:"Admin",r:"Manager"}}/>}
        {deepView==="history"&&(
          <div>
            <h2 style={{fontSize:18,fontWeight:700,marginBottom:16}}>📜 Historique complet</h2>
            <HistoryFeed history={data.history} maxItems={200}/>
          </div>
        )}
      </div>
    </div>
  );

  const TABS = [
    {id:"vue",      l:"Vue d'ensemble", i:"📊"},
    {id:"taches",   l:"Tâches",         i:"✅"},
    {id:"produits", l:"Produits",        i:"🗂️"},
    {id:"courses",  l:"Courses",         i:"🛒"},
    {id:"pertes",   l:"Pertes",          i:"🗑"},
    {id:"equipe",   l:"Équipe",          i:"👥"},
    {id:"config",   l:"Config",          i:"⚙️"},
  ];

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
      <div style={{background:T.acc,padding:"14px 16px",boxShadow:T.sh,flexShrink:0}} className="noprint">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:800,margin:"0 auto"}}>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{data.settings?.name||"L'Embouchure"}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.7)"}}>{dnow()} · {svc} · {covers} couverts</div>
          </div>
          <button onClick={onLogout}
            style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)",
              color:"#fff",borderRadius:8,padding:"7px 14px",cursor:"pointer",
              fontSize:13,fontWeight:600,flexShrink:0}}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,flexShrink:0}} className="noprint">
        <div style={{display:"flex",overflowX:"auto",scrollbarWidth:"none",maxWidth:800,margin:"0 auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              display:"flex",alignItems:"center",gap:4,padding:"12px 13px",
              border:"none",borderBottom:`2px solid ${tab===t.id?T.acc:"transparent"}`,
              background:"transparent",color:tab===t.id?T.acc:T.t3,
              cursor:"pointer",fontWeight:tab===t.id?700:500,fontSize:12,
              whiteSpace:"nowrap",transition:"all .15s",flexShrink:0,
            }}><span>{t.i}</span>{t.l}</button>
          ))}
        </div>
      </div>

      <div style={{padding:16,paddingBottom:60,maxWidth:800,margin:"0 auto",flex:1,width:"100%"}} className="up">
        {tab==="vue"     &&<AdminVue data={data} svc={svc} covers={covers} onNavigate={navigate}/>}
        {tab==="taches"  &&<AdminTaches data={data} setData={setData}/>}
        {tab==="produits"&&<AdminProduits data={data} setData={setData}/>}
        {tab==="courses" &&<CoursesView data={data} setData={setData} role="Manager" user={{n:"Admin",r:"Manager"}}/>}
        {tab==="pertes"  &&<PertesView data={data} setData={setData} role="Manager" user={{n:"Admin",r:"Manager"}}/>}
        {tab==="equipe"  &&<AdminEquipe data={data} setData={setData}/>}
        {tab==="config"  &&<AdminConfig data={data} setData={setData}/>}
      </div>
    </div>
  );
};

// ─── Admin Vue ────────────────────────────────────────
const AdminVue = ({data, svc, covers, onNavigate}) => {
  const dk = todayK();
  const low = data.products.filter(p=>p.q<p.m);
  const urg = data.products.filter(p=>p.urg&&p.q<p.m);
  const ruptures = (data.losses||[]).filter(l=>l.rsn==="Rupture de stock"&&!l.res);

  const sp = data.staff.filter(s=>s.on).map(s=>{
    const rc=ROLES[s.r]; if(!rc) return null;
    const chks=data.daily?.[`${dk}_${svc}_${s.id}`]?.chks||{};
    const disabled=data.disabledTasks||{};
    let tot=0,dn=0;
    rc.phases.forEach(p=>{
      if(p==="mep") return;
      const t=(rc.tasks[p]||[]).filter(x=>!disabled[x.id]);
      tot+=t.length; dn+=t.filter(x=>chks[x.id]).length;
    });
    return {...s,pct:tot>0?Math.round(dn/tot*100):0,dn,tot,rc};
  }).filter(Boolean);

  return (
    <div>
      {/* KPIs cliquables */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
        <Card style={{textAlign:"center",padding:"14px 10px",cursor:"pointer"}}
          onClick={()=>onNavigate("stock-urgent")} hi={urg.length>0} hc={T.red}>
          <div style={{fontSize:22}}>🚨</div>
          <div className="mono" style={{fontSize:22,fontWeight:700,color:urg.length>0?T.red:T.grn}}>{urg.length}</div>
          <div style={{fontSize:11,color:T.t3,marginTop:2}}>Urgents</div>
          {urg.length>0&&<div style={{fontSize:10,color:T.acc,marginTop:4}}>Voir →</div>}
        </Card>
        <Card style={{textAlign:"center",padding:"14px 10px",cursor:"pointer"}}
          onClick={()=>onNavigate("stock-alert")} hi={low.length>0} hc={T.org}>
          <div style={{fontSize:22}}>📦</div>
          <div className="mono" style={{fontSize:22,fontWeight:700,color:low.length>0?T.org:T.grn}}>{low.length}</div>
          <div style={{fontSize:11,color:T.t3,marginTop:2}}>Alertes stock</div>
          {low.length>0&&<div style={{fontSize:10,color:T.acc,marginTop:4}}>Voir →</div>}
        </Card>
        <Card style={{textAlign:"center",padding:"14px 10px",cursor:"pointer"}}
          onClick={()=>onNavigate("courses")} hi={low.length+ruptures.length>0} hc={T.pur}>
          <div style={{fontSize:22}}>🛒</div>
          <div className="mono" style={{fontSize:22,fontWeight:700,color:T.pur}}>{low.length+ruptures.length}</div>
          <div style={{fontSize:11,color:T.t3,marginTop:2}}>À commander</div>
          <div style={{fontSize:10,color:T.acc,marginTop:4}}>Voir →</div>
        </Card>
      </div>

      {/* Urgents */}
      {urg.length>0&&(
        <Card style={{marginBottom:16,background:T.redL,border:`1px solid ${T.redB}`,cursor:"pointer"}}
          onClick={()=>onNavigate("stock-urgent")}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:T.red}}>🚨 Produits urgents</div>
            <span style={{fontSize:12,color:T.acc}}>Voir tout →</span>
          </div>
          {urg.map(p=>(
            <div key={p.id} style={{display:"flex",justifyContent:"space-between",
              padding:"6px 0",borderBottom:`1px solid ${T.redB}`,fontSize:13}}>
              <span style={{fontWeight:500}}>{p.n}</span>
              <span className="mono" style={{color:T.red}}>{p.q}/{p.m} {p.u}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Ruptures */}
      {ruptures.length>0&&(
        <Card style={{marginBottom:16,cursor:"pointer"}} onClick={()=>onNavigate("pertes")}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:T.red}}>⛔ Ruptures déclarées</div>
            <span style={{fontSize:12,color:T.acc}}>Gérer →</span>
          </div>
          {ruptures.slice(0,3).map(l=>(
            <div key={l.id} style={{display:"flex",justifyContent:"space-between",
              padding:"5px 0",fontSize:12,color:T.t2}}>
              <span>{l.pn}</span>
              <span className="mono" style={{color:T.red}}>−{l.qty} {l.u}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Avancement équipe */}
      <Divider label="Avancement équipe"/>
      {sp.map(s=>(
        <Card key={s.id} style={{marginBottom:8,padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,flexShrink:0,
              background:`${s.rc.c}15`,border:`2px solid ${s.rc.c}30`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
              {s.rc.i}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <span style={{fontWeight:600,fontSize:13}}>{s.n}</span>
                <span className="mono" style={{fontSize:12,fontWeight:600,
                  color:s.pct===100?T.grn:s.rc.c}}>{s.pct}%</span>
              </div>
              <Bar v={s.dn} max={s.tot} c={s.pct===100?T.grn:s.rc.c}/>
            </div>
          </div>
        </Card>
      ))}

      {/* Historique cliquable */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"16px 0 10px"}}>
        <Divider label="Dernières actions"/>
        <button onClick={()=>onNavigate("history")}
          style={{background:"none",border:"none",color:T.acc,cursor:"pointer",
            fontSize:12,fontWeight:600,flexShrink:0,marginLeft:10}}>
          Voir tout →
        </button>
      </div>
      <HistoryFeed history={data.history} maxItems={10}/>

      {/* Semaine */}
      <Divider label="Couverts semaine"/>
      <Card>
        {Object.entries(data.settings?.cvr||{}).map(([d,c])=>{
          const iT=d===dk, af=c>=100?T.red:c>=70?T.yel:T.grn;
          return (
            <div key={d} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div className="mono" style={{width:28,fontSize:11,color:iT?T.acc:T.t3,fontWeight:iT?700:400}}>
                {d.toUpperCase()}
              </div>
              <div style={{flex:1}}><Bar v={c} max={150} c={iT?T.acc:af}/></div>
              <div className="mono" style={{fontSize:12,color:iT?T.acc:T.t2,width:40,textAlign:"right",fontWeight:iT?700:400}}>
                {c}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

// ─── Admin Tâches ─────────────────────────────────────
const AdminTaches = ({data, setData}) => {
  const disabled = data.disabledTasks||{};
  const toggle = id => setData(prev=>({...prev,
    disabledTasks:{...(prev.disabledTasks||{}),[id]:!(prev.disabledTasks||{})[id]}
  }));
  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:700,marginBottom:4}}>Gestion des tâches</h2>
      <div style={{fontSize:13,color:T.t3,marginBottom:16}}>
        Activez ou désactivez les tâches. Les tâches désactivées disparaissent pour le personnel.
      </div>
      {Object.entries(ROLES).map(([role,rc])=>(
        <div key={role} style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,
            padding:"8px 12px",background:`${rc.c}10`,borderRadius:10,border:`1px solid ${rc.c}30`}}>
            <span style={{fontSize:18}}>{rc.i}</span>
            <span style={{fontWeight:700,fontSize:14,color:rc.c}}>{role}</span>
          </div>
          {rc.phases.filter(p=>p!=="mep").map(p=>{
            const tasks=rc.tasks[p]||[];
            if(!tasks.length) return null;
            return (
              <div key={p} style={{marginBottom:12,paddingLeft:8}}>
                <div style={{fontSize:11,fontWeight:600,color:T.t3,textTransform:"uppercase",
                  letterSpacing:.5,marginBottom:6}}>{rc.labels[p]}</div>
                {tasks.map(t=>(
                  <div key={t.id} style={{display:"flex",alignItems:"center",
                    justifyContent:"space-between",padding:"8px 12px",
                    background:disabled[t.id]?T.bg:"#fff",border:`1px solid ${T.border}`,
                    borderRadius:8,marginBottom:5,opacity:disabled[t.id]?.5:1}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,color:disabled[t.id]?T.t3:T.t1,
                        textDecoration:disabled[t.id]?"line-through":"none",fontWeight:500}}>
                        {t.t}
                      </div>
                      <div style={{display:"flex",gap:4,marginTop:3}}>
                        {t.k&&<Badge c={T.red} sm>Critique</Badge>}
                        {t.h&&<Badge c={T.org} sm>HACCP</Badge>}
                      </div>
                    </div>
                    <Toggle on={!disabled[t.id]} set={()=>toggle(t.id)} c={T.grn}/>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ─── Admin Produits ───────────────────────────────────
const AdminProduits = ({data, setData}) => {
  const [pf,setPf]=useState("Tous");
  const [cf,setCf]=useState("Tous");
  const [showA,setShowA]=useState(false);
  const [editId,setEditId]=useState(null);
  const [form,setForm]=useState({n:"",u:"",q:0,m:1,cat:"",p:"cuisine",urg:false});
  const prods=data.products||[];
  const cats=["Tous",...new Set(prods.map(p=>p.cat))];
  const PL={cuisine:"🍳 Cuisine",salle:"🍷 Salle",both:"🔄 Les deux"};
  const shown=prods.filter(p=>(pf==="Tous"||p.p===pf)&&(cf==="Tous"||p.cat===cf));
  const user={n:"Admin",r:"Manager"};

  const saveP=()=>{
    if(!form.n||!form.u) return;
    const prod={...form,id:`p${uid()}`,q:parseFloat(form.q)||0,m:parseFloat(form.m)||1};
    setData(prev=>addToHistory({...prev,products:[...prev.products,prod]},"product_add",user,{name:prod.n}));
    setForm({n:"",u:"",q:0,m:1,cat:"",p:"cuisine",urg:false}); setShowA(false);
  };
  const remP=id=>setData(prev=>addToHistory({...prev,products:prev.products.filter(p=>p.id!==id)},"product_delete",user,{productId:id}));
  const updP=(id,k,v)=>setData(prev=>({...prev,products:prev.products.map(p=>p.id===id?{...p,[k]:k==="q"||k==="m"?parseFloat(v)||0:v}:p)}));

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><h2 style={{fontSize:18,fontWeight:700}}>Produits</h2>
        <div style={{fontSize:13,color:T.t3,marginTop:2}}>{prods.length} produits</div></div>
        <Btn onClick={()=>setShowA(!showA)} v="secondary" sm icon="➕">Ajouter</Btn>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
        {["Tous","cuisine","salle","both"].map(p=>(
          <button key={p} onClick={()=>setPf(p)} style={{padding:"5px 12px",borderRadius:20,
            flexShrink:0,border:`1px solid ${pf===p?T.acc:T.border}`,
            background:pf===p?T.acc:"#fff",color:pf===p?"#fff":T.t2,
            cursor:"pointer",fontWeight:500,fontSize:12}}>
            {p==="Tous"?"Tous":PL[p]}
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:14,paddingBottom:4,scrollbarWidth:"none"}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setCf(c)} style={{padding:"5px 12px",borderRadius:20,
            flexShrink:0,border:`1px solid ${cf===c?T.pur:T.border}`,
            background:cf===c?T.purL:"#fff",color:cf===c?T.pur:T.t2,
            cursor:"pointer",fontWeight:500,fontSize:12}}>
            {c}
          </button>
        ))}
      </div>
      {showA&&(
        <Card style={{marginBottom:14,border:`1px solid ${T.acc}40`,background:T.accL}}>
          <div style={{fontSize:13,fontWeight:700,color:T.acc,marginBottom:12}}>Nouveau produit</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <FIn label="Nom" val={form.n} set={v=>setForm(p=>({...p,n:v}))} ph="Crème fraîche"/>
            <FIn label="Unité" val={form.u} set={v=>setForm(p=>({...p,u:v}))} ph="kg, L…"/>
            <FIn label="Qté" val={form.q} set={v=>setForm(p=>({...p,q:v}))} type="number"/>
            <FIn label="Minimum" val={form.m} set={v=>setForm(p=>({...p,m:v}))} type="number"/>
            <FIn label="Catégorie" val={form.cat} set={v=>setForm(p=>({...p,cat:v}))} ph="Viande…"/>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:T.t2,marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Profil</div>
            <div style={{display:"flex",gap:6}}>
              {["cuisine","salle","both"].map(pr=>(
                <button key={pr} onClick={()=>setForm(p=>({...p,p:pr}))}
                  style={{flex:1,padding:"7px 4px",borderRadius:8,
                    border:`1px solid ${form.p===pr?T.acc:T.border}`,
                    background:form.p===pr?T.acc:"#fff",
                    color:form.p===pr?"#fff":T.t2,cursor:"pointer",fontWeight:500,fontSize:11}}>
                  {PL[pr]}
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:12}}><Toggle on={form.urg} set={()=>setForm(p=>({...p,urg:!p.urg}))} label="Urgent 🚨" c={T.red}/></div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={()=>setShowA(false)} v="ghost" full sm>Annuler</Btn>
            <Btn onClick={saveP} full sm dis={!form.n||!form.u} icon="✓">Ajouter</Btn>
          </div>
        </Card>
      )}
      {shown.map(p=>{
        const al=p.q<p.m, ed=editId===p.id;
        return (
          <Card key={p.id} style={{marginBottom:8}} hi={p.urg&&al} hc={T.red}>
            {ed?(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <FIn label="Nom" val={p.n} set={v=>updP(p.id,"n",v)}/>
                  <FIn label="Catégorie" val={p.cat} set={v=>updP(p.id,"cat",v)}/>
                  <FIn label="Actuel" val={p.q} set={v=>updP(p.id,"q",v)} type="number"/>
                  <FIn label="Minimum" val={p.m} set={v=>updP(p.id,"m",v)} type="number"/>
                  <FIn label="Unité" val={p.u} set={v=>updP(p.id,"u",v)}/>
                  <div>
                    <div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Profil</div>
                    <select value={p.p} onChange={e=>updP(p.id,"p",e.target.value)}
                      style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,
                        borderRadius:8,padding:"8px 10px",color:T.t1,fontSize:13,outline:"none"}}>
                      <option value="cuisine">🍳 Cuisine</option>
                      <option value="salle">🍷 Salle</option>
                      <option value="both">🔄 Les deux</option>
                    </select>
                  </div>
                </div>
                <div style={{marginBottom:10}}><Toggle on={!!p.urg} set={()=>updP(p.id,"urg",!p.urg)} label="Urgent 🚨" c={T.red}/></div>
                <div style={{display:"flex",gap:8}}>
                  <Btn onClick={()=>setEditId(null)} v="ghost" full sm>Annuler</Btn>
                  <Btn onClick={()=>setEditId(null)} v="success" full sm>Valider ✓</Btn>
                </div>
              </div>
            ):(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:4}}>
                      <span style={{fontWeight:600,fontSize:13}}>{p.n}</span>
                      {al&&<Badge c={T.red} sm>Alerte</Badge>}
                      {p.urg&&<Badge c={T.red} sm>🚨</Badge>}
                    </div>
                    <div style={{display:"flex",gap:4}}>
                      <Badge c={p.p==="cuisine"?T.org:p.p==="salle"?T.acc:T.pur} sm>{PL[p.p]}</Badge>
                      <Badge c={T.t3} sm>{p.cat}</Badge>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span className="mono" style={{fontSize:14,fontWeight:600,color:al?T.red:T.t1}}>
                      {p.q}<span style={{fontSize:11,color:T.t3,marginLeft:2}}>{p.u}</span>
                    </span>
                    <Btn onClick={()=>setEditId(p.id)} sm v="secondary">✏️</Btn>
                    <Btn onClick={()=>remP(p.id)} sm v="danger">✕</Btn>
                  </div>
                </div>
                <Bar v={p.q} max={p.m*2} c={al?T.red:p.q/p.m>1.5?T.grn:T.yel}/>
                <div style={{fontSize:11,color:T.t3,marginTop:4}}>Seuil : {p.m} {p.u}</div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

// ─── Admin Équipe ─────────────────────────────────────
const AdminEquipe = ({data, setData}) => {
  const [f,setF]=useState({n:"",r:"Cuisinier",pin:""});
  const add=()=>{
    if(!f.n) return;
    setData(prev=>({...prev,staff:[...prev.staff,{...f,id:Date.now(),on:true}]}));
    setF({n:"",r:"Cuisinier",pin:""});
  };
  const tog=id=>setData(prev=>({...prev,staff:prev.staff.map(s=>s.id===id?{...s,on:!s.on}:s)}));
  const rem=id=>setData(prev=>({...prev,staff:prev.staff.filter(s=>s.id!==id)}));
  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:700,marginBottom:16}}>Équipe</h2>
      <Card style={{marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Ajouter un membre</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <FIn label="Nom" val={f.n} set={v=>setF(p=>({...p,n:v}))}/>
          <FIn label="PIN (4 chiffres)" val={f.pin} set={v=>setF(p=>({...p,pin:v}))} type="password"/>
          <div style={{gridColumn:"span 2"}}>
            <div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Rôle</div>
            <select value={f.r} onChange={e=>setF(p=>({...p,r:e.target.value}))}
              style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,
                borderRadius:8,padding:"9px 11px",color:T.t1,fontSize:13,outline:"none"}}>
              {Object.keys(ROLES).map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <Btn onClick={add} full icon="➕" dis={!f.n}>Ajouter</Btn>
      </Card>
      {data.staff.map(s=>{
        const rc=ROLES[s.r];
        return (
          <Card key={s.id} style={{marginBottom:8,display:"flex",alignItems:"center",gap:10,opacity:s.on?1:.5}}>
            <div style={{width:38,height:38,borderRadius:10,flexShrink:0,
              background:`${rc?.c||T.acc}18`,border:`2px solid ${rc?.c||T.acc}30`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
              {rc?.i||"👤"}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:13}}>{s.n}</div>
              <div style={{fontSize:12,color:rc?.c||T.t2,fontWeight:500}}>{s.r}</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <Btn onClick={()=>tog(s.id)} sm v="secondary">{s.on?"Pause":"Activer"}</Btn>
              <Btn onClick={()=>rem(s.id)} sm v="danger">✕</Btn>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// ─── Admin Config ─────────────────────────────────────
const AdminConfig = ({data, setData}) => {
  const s=data.settings;
  const upd=(k,v)=>setData(prev=>({...prev,settings:{...prev.settings,[k]:v}}));
  const updC=(d,v)=>setData(prev=>({...prev,settings:{...prev.settings,cvr:{...prev.settings.cvr,[d]:parseInt(v)||0}}}));
  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:700,marginBottom:16}}>Configuration</h2>
      <Card style={{marginBottom:16}}>
        <FIn label="Nom du restaurant" val={s?.name||""} set={v=>upd("name",v)}/>
        <Divider label="Détection automatique des services"/>
        {[{l:"Déjeuner commence",k:"lS"},{l:"Déjeuner se termine",k:"lE"},{l:"Dîner commence",k:"dS"}].map(f=>(
          <div key={f.k} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:12,color:T.t2,fontWeight:500}}>{f.l}</span>
              <span className="mono" style={{fontSize:13,color:T.acc,fontWeight:600}}>
                {String(s?.[f.k]||0).padStart(2,"0")}h00
              </span>
            </div>
            <input type="range" min={0} max={24} value={s?.[f.k]||0}
              onChange={e=>upd(f.k,parseInt(e.target.value))}/>
          </div>
        ))}
      </Card>
      <Card>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Couverts prévus par jour</div>
        {Object.entries(s?.cvr||{}).map(([d,c])=>(
          <div key={d} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div className="mono" style={{width:28,fontSize:11,color:T.t3,fontWeight:600,textTransform:"uppercase"}}>{d}</div>
            <input type="range" min={0} max={200} value={c} onChange={e=>updC(d,e.target.value)} style={{flex:1}}/>
            <div className="mono" style={{fontSize:13,color:T.t1,fontWeight:600,width:50,textAlign:"right"}}>{c} cov</div>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════
export default function App() {
  const [data, setRaw] = useState(loadData);
  const [user, setUser] = useState(null);
  const [svc, setSvc] = useState(() => detSvc(loadData().settings));

  // Sauvegarde automatique à chaque modification
  const setData = useCallback(upd => {
    setRaw(prev => {
      const next = typeof upd === "function" ? upd(prev) : upd;
      saveData(next);
      return next;
    });
  }, []);

  // Détection service auto au chargement
  useEffect(() => {
    setSvc(detSvc(data.settings));
  }, []);

  const covers = data.settings?.cvr?.[todayK()] || 0;

  return (
    <>
      <style>{css}</style>
      {!user
        ? <Login data={data} onLogin={setUser} svc={svc} setSvc={setSvc}/>
        : user.admin || user.r === "Manager"
          ? <Admin data={data} setData={setData} svc={svc} covers={covers} onLogout={()=>setUser(null)}/>
          : <Journey user={user} data={data} setData={setData} svc={svc} covers={covers} onLogout={()=>setUser(null)}/>
      }
    </>
  );
}
