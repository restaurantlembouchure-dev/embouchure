import { useState, useCallback } from "react";

// ═══════════════════════════════════════════════════════
// DESIGN SYSTEM — thème clair moderne
// ═══════════════════════════════════════════════════════
const T = {
  // Backgrounds
  bg:       "#F4F6F9",
  surface:  "#FFFFFF",
  card:     "#FFFFFF",
  cardAlt:  "#F8FAFC",

  // Borders
  border:   "#E2E8F0",
  borderB:  "#CBD5E1",

  // Brand
  acc:      "#2563EB",
  accL:     "#EFF6FF",
  accD:     "#1D4ED8",

  // Status
  grn:      "#16A34A",
  grnL:     "#F0FDF4",
  grnB:     "#BBF7D0",
  red:      "#DC2626",
  redL:     "#FEF2F2",
  redB:     "#FECACA",
  org:      "#EA580C",
  orgL:     "#FFF7ED",
  yel:      "#D97706",
  yelL:     "#FFFBEB",
  pur:      "#7C3AED",
  purL:     "#F5F3FF",

  // Roles
  rCuisin:  "#EA580C",
  rRang:    "#2563EB",
  rBarman:  "#7C3AED",
  rPlongeur:"#16A34A",
  rRunner:  "#D97706",
  rManager: "#DC2626",

  // Text
  t1:       "#0F172A",
  t2:       "#475569",
  t3:       "#94A3B8",
  t4:       "#CBD5E1",

  // Shadow
  shadow:   "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowM:  "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body{background:${T.bg};color:${T.t1};font-family:'Inter',sans-serif;min-height:100vh;font-size:15px}
.mono{font-family:'DM Mono',monospace}
input,select,textarea,button{font-family:'Inter',sans-serif}
input[type=range]{accent-color:${T.acc};width:100%}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:${T.bg}}
::-webkit-scrollbar-thumb{background:${T.borderB};border-radius:4px}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.up{animation:fadeUp .25s ease forwards}
.fi{animation:fadeIn .2s ease forwards}
.pulse{animation:pulse 2s ease infinite}
.spin{animation:spin 1s linear infinite}
`;

// ═══════════════════════════════════════════════════════
// RÔLES
// ═══════════════════════════════════════════════════════
const ROLES = {
  "Cuisinier":    { c:T.rCuisin, i:"👨‍🍳", profil:"cuisine",
    phases:["arrivee","hygiene","mep","service","cloture"],
    labels:{arrivee:"Arrivée",hygiene:"Hygiène HACCP",mep:"Mise en place",service:"Service",cloture:"Clôture"},
    tasks:{
      arrivee:[{id:"ca1",t:"Tenue réglementaire (veste, calot, tablier)",k:true},{id:"ca2",t:"Lavage mains protocole 30 secondes",k:true},{id:"ca3",t:"Lecture bons de commande",k:false}],
      hygiene:[{id:"ch1",t:"Relevé T° frigo viandes",k:true,h:true},{id:"ch2",t:"Relevé T° frigo laitiers",k:true,h:true},{id:"ch3",t:"Relevé T° congélateur",k:true,h:true},{id:"ch4",t:"Vérification DLC produits frais",k:true,h:true},{id:"ch5",t:"Contrôle huile friteuse",k:true,h:true},{id:"ch6",t:"Désinfection plans de travail",k:true},{id:"ch7",t:"Étiquetage produits entamés",k:true,h:true}],
      mep:[],
      service:[{id:"cs1",t:"Poste opérationnel",k:false},{id:"cs2",t:"Four à température",k:true}],
      cloture:[{id:"cc1",t:"Dégraissage four et plaques",k:true},{id:"cc2",t:"Film alimentaire sur denrées ouvertes",k:true},{id:"cc3",t:"Rangement frigos (crus en bas)",k:true},{id:"cc4",t:"Sol cuisine nettoyé et désinfecté",k:true},{id:"cc5",t:"Coupure gaz vérifiée",k:true},{id:"cc6",t:"Fiche HACCP signée",k:true,h:true}],
    }},
  "Chef de rang": { c:T.rRang, i:"🍷", profil:"salle",
    phases:["arrivee","hygiene","salle","service","cloture"],
    labels:{arrivee:"Arrivée",hygiene:"Hygiène",salle:"Mise en place salle",service:"Service",cloture:"Clôture"},
    tasks:{
      arrivee:[{id:"ra1",t:"Tenue vérifiée (uniforme propre)",k:false},{id:"ra2",t:"Réservations du service lues",k:true},{id:"ra3",t:"Allergènes du jour notés",k:true}],
      hygiene:[{id:"rh1",t:"Lavage mains avant prise de poste",k:true},{id:"rh2",t:"Désinfection surfaces salle",k:true}],
      salle:[{id:"rs1",t:"Dressage tables",k:true},{id:"rs2",t:"Couverts polis en place",k:true},{id:"rs3",t:"Verres polis sur tables",k:true},{id:"rs4",t:"Condiments remplis",k:false},{id:"rs5",t:"Menus à jour",k:true},{id:"rs6",t:"Plan de salle vérifié",k:true},{id:"rs7",t:"WC clients approvisionnés",k:false},{id:"rs8",t:"Vitres et façade propres",k:false}],
      service:[{id:"rsv",t:"Accueil clients en position",k:true}],
      cloture:[{id:"rc1",t:"Tables débarrassées et nettoyées",k:true},{id:"rc2",t:"Vaisselle rendue plonge",k:false},{id:"rc3",t:"Ménage salle",k:true}],
    }},
  "Barman":       { c:T.rBarman, i:"🍸", profil:"salle",
    phases:["arrivee","hygiene","bar","service","cloture"],
    labels:{arrivee:"Arrivée",hygiene:"Hygiène",bar:"Mise en place bar",service:"Service",cloture:"Clôture"},
    tasks:{
      arrivee:[{id:"ba1",t:"Tenue vérifiée",k:false},{id:"ba2",t:"Inventaire rapide boissons",k:true}],
      hygiene:[{id:"bh1",t:"Lavage mains",k:true},{id:"bh2",t:"Nettoyage plan de travail bar",k:true}],
      bar:[{id:"bb1",t:"Frigo bar rempli",k:true},{id:"bb2",t:"Glaces en place",k:true},{id:"bb3",t:"Garnishes préparées",k:false},{id:"bb4",t:"Caisse bar vérifiée",k:true}],
      service:[{id:"bsv",t:"Poste opérationnel",k:false}],
      cloture:[{id:"bc1",t:"Inventaire alcools fin de service",k:true},{id:"bc2",t:"Nettoyage bar et désinfection",k:true},{id:"bc3",t:"Caisse bar fermée et comptée",k:true}],
    }},
  "Plongeur":     { c:T.rPlongeur, i:"🧽", profil:"cuisine",
    phases:["arrivee","hygiene","plonge","service","cloture"],
    labels:{arrivee:"Arrivée",hygiene:"Hygiène",plonge:"Poste plonge",service:"Service",cloture:"Clôture"},
    tasks:{
      arrivee:[{id:"pa1",t:"Tablier et gants enfilés",k:false},{id:"pa2",t:"Eau chaude machine vérifiée",k:true}],
      hygiene:[{id:"ph1",t:"Lavage mains",k:true},{id:"ph2",t:"Dosage lessive machine",k:true},{id:"ph3",t:"Filtres machine nettoyés",k:true}],
      plonge:[{id:"pp1",t:"Zones tri déchets organisées",k:false},{id:"pp2",t:"Bacs de rinçage prêts",k:true},{id:"pp3",t:"Poubelles vidées avant service",k:true}],
      service:[{id:"psv",t:"Poste organisé et opérationnel",k:false}],
      cloture:[{id:"pc1",t:"Vaisselle lavée et rangée",k:true},{id:"pc2",t:"Machine vidée et séchée",k:true},{id:"pc3",t:"Sol plonge nettoyé",k:true},{id:"pc4",t:"Poubelles sorties",k:true}],
    }},
  "Manager":      { c:T.rManager, i:"📋", profil:"both",
    phases:["arrivee","briefing","controle","service","cloture"],
    labels:{arrivee:"Arrivée",briefing:"Briefing équipe",controle:"Contrôle",service:"Service",cloture:"Clôture"},
    tasks:{
      arrivee:[{id:"ma1",t:"Réservations et événements lus",k:true},{id:"ma2",t:"Présence équipe vérifiée",k:true},{id:"ma3",t:"Caisse ouverte et fond vérifié",k:true}],
      briefing:[{id:"mb1",t:"Plat du jour communiqué à l'équipe",k:true},{id:"mb2",t:"Allergènes communiqués à la salle",k:true},{id:"mb3",t:"Effectif confirmé",k:true},{id:"mb4",t:"VIP et événements signalés",k:false}],
      controle:[{id:"mc1",t:"Mise en place salle validée",k:true},{id:"mc2",t:"Mise en place cuisine validée",k:true},{id:"mc3",t:"Températures HACCP signées",k:true},{id:"mc4",t:"Extincteurs accessibles",k:true}],
      service:[{id:"msv",t:"Ouverture et accueil lancés",k:true}],
      cloture:[{id:"mcl1",t:"Rapport Z imprimé et signé",k:true},{id:"mcl2",t:"Feuille de service remplie",k:true},{id:"mcl3",t:"Alarme activée",k:true},{id:"mcl4",t:"Dernière ronde effectuée",k:true}],
    }},
};

// ═══════════════════════════════════════════════════════
// DONNÉES INITIALES
// ═══════════════════════════════════════════════════════
const PROD0 = [
  {id:"p1",n:"Filet de bœuf",u:"kg",q:3.5,m:4,cat:"Viande",p:"cuisine",urg:false},
  {id:"p2",n:"Saumon frais",u:"kg",q:1.2,m:2,cat:"Poisson",p:"cuisine",urg:true},
  {id:"p3",n:"Crème 35%",u:"L",q:6,m:3,cat:"Laitier",p:"cuisine",urg:false},
  {id:"p4",n:"Beurre AOP",u:"kg",q:2,m:1.5,cat:"Laitier",p:"cuisine",urg:false},
  {id:"p5",n:"Farine T55",u:"kg",q:25,m:10,cat:"Sec",p:"cuisine",urg:false},
  {id:"p6",n:"Pommes de terre",u:"kg",q:15,m:8,cat:"Légume",p:"cuisine",urg:false},
  {id:"p7",n:"Tomates cerises",u:"kg",q:1,m:2,cat:"Légume",p:"cuisine",urg:true},
  {id:"p8",n:"Dégraissant cuisine",u:"L",q:2,m:1,cat:"Nettoyage",p:"cuisine",urg:false},
  {id:"p9",n:"Film alimentaire",u:"rouleau",q:3,m:2,cat:"Nettoyage",p:"cuisine",urg:false},
  {id:"p10",n:"Gants latex",u:"boîte",q:2,m:1,cat:"Nettoyage",p:"cuisine",urg:false},
  {id:"p20",n:"Vin rouge pichet",u:"L",q:20,m:15,cat:"Boisson",p:"salle",urg:false},
  {id:"p21",n:"Champagne 75cl",u:"bouteille",q:6,m:3,cat:"Boisson",p:"salle",urg:false},
  {id:"p22",n:"Eau gazeuse 75cl",u:"bouteille",q:24,m:12,cat:"Boisson",p:"salle",urg:false},
  {id:"p23",n:"Eau plate 75cl",u:"bouteille",q:24,m:12,cat:"Boisson",p:"salle",urg:false},
  {id:"p30",n:"Serviettes tissu",u:"unité",q:80,m:40,cat:"Consommable",p:"salle",urg:false},
  {id:"p31",n:"Serviettes papier",u:"paquet",q:5,m:3,cat:"Consommable",p:"salle",urg:false},
  {id:"p32",n:"PH WC",u:"rouleau",q:12,m:6,cat:"Consommable",p:"salle",urg:false},
  {id:"p33",n:"Savon mains WC",u:"flacon",q:3,m:2,cat:"Consommable",p:"salle",urg:false},
  {id:"p40",n:"Spray nettoyant tables",u:"flacon",q:3,m:2,cat:"Nettoyage",p:"salle",urg:false},
  {id:"p41",n:"Produit sol salle",u:"L",q:2,m:1,cat:"Nettoyage",p:"salle",urg:false},
];

const DISHES0 = [
  {id:"d1",n:"Tartare de bœuf",cat:"Entrée",svc:["Déjeuner","Dîner"],r:0.35,comps:[{id:"c1",l:"Filet haché",u:"g",pc:200,note:"Minute, +2°C"},{id:"c2",l:"Condiments",u:"g",pc:30,note:"Brunoise"},{id:"c3",l:"Pain toasté",u:"tr",pc:2,note:"Filmer"}]},
  {id:"d2",n:"Saumon mi-cuit",cat:"Entrée",svc:["Déjeuner","Dîner"],r:0.28,comps:[{id:"c4",l:"Pavé saumon",u:"g",pc:120,note:"Assaisonner"},{id:"c5",l:"Crème citron",u:"cl",pc:5,note:"+4°C"}]},
  {id:"d3",n:"Sole meunière",cat:"Plat",svc:["Déjeuner","Dîner"],r:0.30,comps:[{id:"c6",l:"Sole",u:"g",pc:400,note:"Lever filets"},{id:"c7",l:"Beurre clarifié",u:"g",pc:30,note:"Batch matin"},{id:"c8",l:"Pommes vapeur",u:"g",pc:150,note:"Tourner"}]},
  {id:"d4",n:"Fondant chocolat",cat:"Dessert",svc:["Déjeuner","Dîner"],r:0.40,comps:[{id:"c9",l:"Appareil fondant",u:"unité",pc:1,note:"Surgeler veille"},{id:"c10",l:"Crème anglaise",u:"cl",pc:6,note:"+4°C"}]},
];

const INIT = {
  settings:{name:"L'Embouchure",lS:10,lE:15,dS:17,cvr:{lun:40,mar:55,mer:65,jeu:70,ven:95,sam:120,dim:80}},
  staff:[
    {id:1,n:"Karim Benali",r:"Cuisinier",pin:"1111",on:true},
    {id:2,n:"Marie Leblanc",r:"Chef de rang",pin:"2222",on:true},
    {id:3,n:"Sofia Greco",r:"Barman",pin:"3333",on:true},
    {id:4,n:"Thomas Petit",r:"Plongeur",pin:"4444",on:true},
    {id:5,n:"Amara Diallo",r:"Manager",pin:"5555",on:true},
  ],
  products: PROD0,
  dishes: DISHES0,
  losses: [],
  daily: {},
  disabledTasks: {},   // {taskId: true} — tâches désactivées par le manager
  mepActual: {},       // {dishId_svc: qty} — quantités réellement produites
};

const todayK = () => ["dim","lun","mar","mer","jeu","ven","sam"][new Date().getDay()];
const tnow = () => new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
const dnow = () => new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
const uid  = () => Math.random().toString(36).slice(2,8);
const detSvc = s => { const h=new Date().getHours(); return h>=(s?.lS??10)&&h<(s?.lE??15)?"Déjeuner":h>=(s?.dS??17)?"Dîner":"Dîner"; };
const myProds = (prods,role) => { const p=ROLES[role]?.profil||"salle"; return p==="both"?prods:prods.filter(x=>x.p===p||x.p==="both"); };

const load = () => { try{const s=sessionStorage.getItem("emb8");if(s)return{...INIT,...JSON.parse(s)};}catch{} return INIT; };
const save = d => { try{sessionStorage.setItem("emb8",JSON.stringify(d));}catch{} };

// ═══════════════════════════════════════════════════════
// ATOMS
// ═══════════════════════════════════════════════════════
const Badge = ({c,bg,children}) => (
  <span style={{background:bg||`${c}15`,color:c,border:`1px solid ${c}30`,padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:600,whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:3}}>
    {children}
  </span>
);

const Btn = ({onClick,children,variant="primary",sm,dis,full,icon,danger}) => {
  const styles = {
    primary:  {bg:T.acc,        fg:"#fff",        border:"none",            hover:T.accD},
    secondary:{bg:T.surface,    fg:T.t1,          border:`1px solid ${T.border}`},
    ghost:    {bg:"transparent",fg:T.t2,          border:`1px solid ${T.border}`},
    danger:   {bg:T.redL,       fg:T.red,         border:`1px solid ${T.redB}`},
    success:  {bg:T.grnL,       fg:T.grn,         border:`1px solid ${T.grnB}`},
  };
  const s = danger ? styles.danger : styles[variant]||styles.primary;
  return (
    <button onClick={onClick} disabled={dis} style={{
      background:s.bg, color:s.fg, border:s.border,
      padding:sm?"6px 12px":"10px 18px", borderRadius:8,
      fontWeight:600, fontSize:sm?12:14,
      cursor:dis?"not-allowed":"pointer", opacity:dis?.5:1,
      width:full?"100%":"auto", transition:"all .15s",
      display:"inline-flex", alignItems:"center", gap:6, flexShrink:0,
      boxShadow: variant==="primary"&&!dis ? "0 1px 2px rgba(37,99,235,0.3)" : "none",
    }}>
      {icon&&<span style={{fontSize:14}}>{icon}</span>}{children}
    </button>
  );
};

const Card = ({children,style,onClick,highlight,highlightColor}) => (
  <div onClick={onClick} style={{
    background:T.card, borderRadius:12, padding:16,
    border:`1px solid ${highlight?(highlightColor||T.acc)+"50":T.border}`,
    boxShadow: highlight ? `0 0 0 3px ${(highlightColor||T.acc)}15` : T.shadow,
    cursor:onClick?"pointer":"default", transition:"all .2s", ...style
  }}>
    {children}
  </div>
);

const Bar = ({v,max,c}) => (
  <div style={{background:T.bg,borderRadius:4,height:6,overflow:"hidden"}}>
    <div style={{width:`${max>0?Math.min(100,v/max*100):0}%`,height:"100%",background:c||T.acc,borderRadius:4,transition:"width .4s"}}/>
  </div>
);

const Ring = ({v,max,sz=48,sw=5,c}) => {
  const r=(sz-sw*2)/2,ci=2*Math.PI*r,pt=max>0?Math.min(1,v/max):0;
  return <svg width={sz} height={sz} style={{flexShrink:0}}>
    <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={T.border} strokeWidth={sw}/>
    <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={c||T.acc} strokeWidth={sw} strokeDasharray={ci} strokeDashoffset={ci*(1-pt)} strokeLinecap="round" transform={`rotate(-90 ${sz/2} ${sz/2})`} style={{transition:"stroke-dashoffset .4s"}}/>
    <text x={sz/2} y={sz/2+4} textAnchor="middle" fill={pt>=1?T.grn:T.t1} fontSize={10} fontWeight={700} fontFamily="'DM Mono',monospace">{Math.round(pt*100)}%</text>
  </svg>;
};

const Toggle = ({on,set,label,c}) => (
  <div onClick={set} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",userSelect:"none"}}>
    <div style={{width:36,height:20,borderRadius:10,background:on?(c||T.grn):T.t4,position:"relative",transition:"background .2s",flexShrink:0}}>
      <div style={{position:"absolute",top:2,left:on?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
    </div>
    {label&&<span style={{fontSize:13,color:T.t2,fontWeight:500}}>{label}</span>}
  </div>
);

const FIn = ({label,val,set,type,ph,small}) => (
  <div style={{marginBottom:small?0:10}}>
    {label&&<div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{label}</div>}
    <input type={type||"text"} value={val} placeholder={ph||""} onChange={e=>set(e.target.value)}
      style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.t1,fontSize:13,outline:"none",transition:"border .15s"}}/>
  </div>
);

const Divider = ({label}) => (
  <div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0 10px"}}>
    {label&&<span style={{fontSize:11,color:T.t3,fontWeight:600,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{label}</span>}
    <div style={{flex:1,height:1,background:T.border}}/>
  </div>
);

const StatCard = ({icon,value,label,color,alert}) => (
  <Card style={{textAlign:"center",padding:"14px 10px"}} highlight={alert} highlightColor={T.red}>
    <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
    <div className="mono" style={{fontSize:20,fontWeight:700,color:color||T.t1}}>{value}</div>
    <div style={{fontSize:11,color:T.t3,marginTop:2,fontWeight:500}}>{label}</div>
  </Card>
);

// ═══════════════════════════════════════════════════════
// AJOUTER UN PRODUIT (formulaire inline pour les users)
// ═══════════════════════════════════════════════════════
const AddProductForm = ({profil, onAdd, onClose}) => {
  const [n,setN]=useState(""); const [u,setU]=useState(""); const [q,setQ]=useState(""); const [m,setM]=useState(""); const [cat,setCat]=useState("");
  const cats = profil==="cuisine"
    ? ["Viande","Poisson","Laitier","Sec","Légume","Nettoyage"]
    : ["Boisson","Consommable","Nettoyage"];
  const save = () => {
    if(!n||!u) return;
    onAdd({id:`p${uid()}`,n,u,q:parseFloat(q)||0,m:parseFloat(m)||1,cat:cat||cats[0],p:profil,urg:false});
    onClose();
  };
  return (
    <Card style={{marginBottom:12,border:`1px solid ${T.acc}40`,background:T.accL}}>
      <div style={{fontSize:13,fontWeight:700,color:T.acc,marginBottom:12}}>➕ Nouveau produit</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <FIn label="Nom" val={n} set={setN} ph="Ex: Crème fraîche"/>
        <FIn label="Unité" val={u} set={setU} ph="kg, L, unité…"/>
        <FIn label="Quantité actuelle" val={q} set={setQ} type="number"/>
        <FIn label="Seuil minimum" val={m} set={setM} type="number"/>
      </div>
      <div style={{marginBottom:10}}>
        <div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Catégorie</div>
        <select value={cat||cats[0]} onChange={e=>setCat(e.target.value)}
          style={{width:"100%",background:"#fff",border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.t1,fontSize:13,outline:"none"}}>
          {cats.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={onClose} variant="ghost" full sm>Annuler</Btn>
        <Btn onClick={save} full sm dis={!n||!u} icon="✓">Ajouter</Btn>
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════
// STOCK
// ═══════════════════════════════════════════════════════
const Stock = ({products,setData,role}) => {
  const my = myProds(products,role);
  const [cf,setCf] = useState("Tous");
  const [showAdd,setShowAdd] = useState(false);
  const cats = ["Tous",...new Set(my.map(p=>p.cat))];
  const shown = cf==="Tous"?my:my.filter(p=>p.cat===cf);
  const alerts = my.filter(p=>p.q<p.m).length;
  const profil = ROLES[role]?.profil||"salle";

  const updQ = (id,d) => setData(prev=>({...prev,products:prev.products.map(p=>p.id===id?{...p,q:Math.max(0,+(p.q+d).toFixed(2))}:p)}));
  const togUrg = id => setData(prev=>({...prev,products:prev.products.map(p=>p.id===id?{...p,urg:!p.urg}:p)}));
  const addProduct = prod => setData(prev=>({...prev,products:[...prev.products,prod]}));

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:T.t1}}>Stocks</h2>
          <div style={{fontSize:13,color:alerts>0?T.red:T.t3,marginTop:2}}>{alerts} alerte(s) · {my.length} produits</div>
        </div>
        <Btn onClick={()=>setShowAdd(!showAdd)} variant="secondary" sm icon="➕">Ajouter</Btn>
      </div>

      {showAdd&&<AddProductForm profil={profil} onAdd={addProduct} onClose={()=>setShowAdd(false)}/>}

      <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:4,scrollbarWidth:"none"}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setCf(c)} style={{padding:"5px 12px",borderRadius:20,flexShrink:0,border:`1px solid ${cf===c?T.acc:T.border}`,background:cf===c?T.acc:"#fff",color:cf===c?"#fff":T.t2,cursor:"pointer",fontWeight:500,fontSize:12,transition:"all .15s"}}>
            {c}
          </button>
        ))}
      </div>

      {shown.map(p=>{
        const al=p.q<p.m;
        return (
          <Card key={p.id} style={{marginBottom:10}} highlight={al||p.urg} highlightColor={p.urg?T.red:T.org}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:4}}>
                  <span style={{fontWeight:600,fontSize:14,color:T.t1}}>{p.n}</span>
                  {al&&<Badge c={T.red}>⚠ Alerte</Badge>}
                  {p.urg&&<Badge c={T.red}>🚨 Urgent</Badge>}
                </div>
                <span style={{fontSize:12,color:T.t3}}>{p.cat}</span>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <span className="mono" style={{fontSize:18,fontWeight:700,color:al?T.red:T.t1}}>{p.q}</span>
                <span style={{fontSize:12,color:T.t3,marginLeft:3}}>{p.u}</span>
                <div style={{fontSize:11,color:T.t3}}>min {p.m} {p.u}</div>
              </div>
            </div>
            <Bar v={p.q} max={p.m*2} c={al?T.red:p.q/p.m>1.5?T.grn:T.yel}/>
            <div style={{display:"flex",gap:6,marginTop:10,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:4}}>
                {[-1,-.5,.5,1,5].map(d=>(
                  <button key={d} onClick={()=>updQ(p.id,d)} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${T.border}`,background:T.bg,color:d<0?T.red:T.grn,cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .1s"}}>
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

// ═══════════════════════════════════════════════════════
// INVENTAIRE
// ═══════════════════════════════════════════════════════
const Inventaire = ({products,setData,role}) => {
  const my = myProds(products,role);
  const [vals,setVals] = useState(()=>Object.fromEntries(my.map(p=>[p.id,p.q])));
  const [ok,setOk] = useState(false);
  const [cf,setCf] = useState("Tous");
  const [showAdd,setShowAdd] = useState(false);
  const profil = ROLES[role]?.profil||"salle";
  const cats = ["Tous",...new Set(my.map(p=>p.cat))];
  const shown = cf==="Tous"?my:my.filter(p=>p.cat===cf);
  const below = my.filter(p=>(parseFloat(vals[p.id])??p.q)<p.m).length;

  const doSave = () => {
    setData(prev=>({...prev,products:prev.products.map(p=>vals[p.id]!==undefined?{...p,q:parseFloat(vals[p.id])||0}:p)}));
    setOk(true); setTimeout(()=>setOk(false),2500);
  };
  const addProduct = prod => {
    setData(prev=>({...prev,products:[...prev.products,prod]}));
    setVals(v=>({...v,[prod.id]:prod.q}));
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700}}>Inventaire</h2>
          <div style={{fontSize:13,color:below>0?T.red:T.t3,marginTop:2}}>{below} produit(s) sous seuil</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>setShowAdd(!showAdd)} variant="secondary" sm icon="➕">Produit</Btn>
          <Btn onClick={doSave} variant="success" sm icon="💾">{ok?"Sauvegardé ✓":"Valider"}</Btn>
        </div>
      </div>

      {ok&&<div className="up" style={{padding:"10px 14px",background:T.grnL,border:`1px solid ${T.grnB}`,borderRadius:10,marginBottom:12,fontSize:13,color:T.grn,fontWeight:600}}>
        ✅ Inventaire sauvegardé — les produits sous seuil apparaissent dans la liste de courses
      </div>}

      {showAdd&&<AddProductForm profil={profil} onAdd={addProduct} onClose={()=>setShowAdd(false)}/>}

      <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:4,scrollbarWidth:"none"}}>
        {cats.map(c=><button key={c} onClick={()=>setCf(c)} style={{padding:"5px 12px",borderRadius:20,flexShrink:0,border:`1px solid ${cf===c?T.acc:T.border}`,background:cf===c?T.acc:"#fff",color:cf===c?"#fff":T.t2,cursor:"pointer",fontWeight:500,fontSize:12}}>{c}</button>)}
      </div>

      {shown.map(p=>{
        const v=parseFloat(vals[p.id]??p.q), bl=v<p.m;
        return (
          <Card key={p.id} style={{marginBottom:8,padding:"12px 14px"}} highlight={bl} highlightColor={T.red}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:2}}>
                  <span style={{fontWeight:600,fontSize:13}}>{p.n}</span>
                  {bl&&<Badge c={T.red}>↓ Sous seuil</Badge>}
                </div>
                <span style={{fontSize:12,color:T.t3}}>Seuil min : <strong>{p.m} {p.u}</strong></span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <button onClick={()=>setVals(x=>({...x,[p.id]:Math.max(0,(parseFloat(x[p.id])||0)-1)}))}
                  style={{width:30,height:30,borderRadius:8,border:`1px solid ${T.border}`,background:T.bg,color:T.red,cursor:"pointer",fontSize:16,fontWeight:700}}>−</button>
                <input type="number" value={vals[p.id]??p.q} onChange={e=>setVals(x=>({...x,[p.id]:e.target.value}))}
                  style={{width:64,textAlign:"center",background:bl?T.redL:"#fff",border:`1px solid ${bl?T.red:T.border}`,borderRadius:8,padding:"6px 4px",color:bl?T.red:T.t1,fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:600,outline:"none"}}/>
                <button onClick={()=>setVals(x=>({...x,[p.id]:(parseFloat(x[p.id])||0)+1}))}
                  style={{width:30,height:30,borderRadius:8,border:`1px solid ${T.border}`,background:T.bg,color:T.grn,cursor:"pointer",fontSize:16,fontWeight:700}}>+</button>
                <span style={{fontSize:12,color:T.t3,width:20}}>{p.u}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// PERTES
// ═══════════════════════════════════════════════════════
const Pertes = ({products,losses,setData,profil,userName}) => {
  const my = products.filter(p=>p.p===profil||p.p==="both");
  const [sel,setSel]=useState(""); const [qty,setQty]=useState(""); const [rsn,setRsn]=useState("Perte"); const [urg,setUrg]=useState(false); const [ok,setOk]=useState(false);
  const mine = losses.filter(l=>l.prof===profil||l.prof==="both").slice(0,20);

  const declare = () => {
    if(!sel||!qty) return;
    const prod=products.find(x=>x.id===sel);
    const loss={id:uid(),date:new Date().toISOString(),pid:sel,pn:prod?.n||"?",qty:parseFloat(qty)||0,u:prod?.u||"",rsn,prof:profil,by:userName,urg};
    setData(prev=>({...prev,losses:[loss,...prev.losses],products:prev.products.map(p=>p.id===sel?{...p,q:Math.max(0,p.q-(parseFloat(qty)||0))}:p)}));
    setSel(""); setQty(""); setUrg(false); setOk(true); setTimeout(()=>setOk(false),2000);
  };
  const resolve = id => setData(prev=>({...prev,losses:prev.losses.map(l=>l.id===id?{...l,res:true}:l)}));

  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:700,marginBottom:4}}>Pertes & Ruptures</h2>
      <div style={{fontSize:13,color:T.t3,marginBottom:16}}>{mine.filter(l=>!l.res).length} déclaration(s) active(s)</div>

      <Card style={{marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:12}}>Nouvelle déclaration</div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Produit</div>
          <select value={sel} onChange={e=>setSel(e.target.value)}
            style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:sel?T.t1:T.t3,fontSize:13,outline:"none"}}>
            <option value="">— Sélectionner un produit —</option>
            {my.map(p=><option key={p.id} value={p.id}>{p.n} ({p.q} {p.u})</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <FIn label="Quantité" val={qty} set={setQty} type="number" ph="Ex: 2"/>
          <div>
            <div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Motif</div>
            <select value={rsn} onChange={e=>setRsn(e.target.value)}
              style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.t1,fontSize:13,outline:"none"}}>
              {["Perte","Rupture de stock","DLC dépassée","Casse / bris","Autre"].map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div style={{marginBottom:12}}><Toggle on={urg} set={()=>setUrg(!urg)} label="Marquer comme urgent" c={T.red}/></div>
        <Btn onClick={declare} full dis={!sel||!qty} icon="📝">Déclarer</Btn>
        {ok&&<div style={{marginTop:8,fontSize:13,color:T.grn,fontWeight:600,textAlign:"center"}}>✅ Déclaré — stock mis à jour</div>}
      </Card>

      <Divider label="Historique"/>
      {mine.length===0&&<div style={{textAlign:"center",padding:24,color:T.t3,fontSize:13}}>Aucune déclaration</div>}
      {mine.map(l=>(
        <Card key={l.id} style={{marginBottom:8,opacity:l.res?.5:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:4}}>
                <span style={{fontWeight:600,fontSize:13}}>{l.pn}</span>
                <Badge c={l.rsn==="Rupture de stock"?T.red:T.yel}>{l.rsn}</Badge>
                {l.urg&&<Badge c={T.red}>🚨</Badge>}
              </div>
              <div className="mono" style={{fontSize:13,color:T.red,marginBottom:2}}>−{l.qty} {l.u}</div>
              <div style={{fontSize:11,color:T.t3}}>{l.by} · {new Date(l.date).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</div>
            </div>
            {!l.res&&<Btn onClick={()=>resolve(l.id)} sm variant="success" icon="✓">Résolu</Btn>}
          </div>
        </Card>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// LISTE DE COURSES
// ═══════════════════════════════════════════════════════
const Courses = ({products,losses,setData,role}) => {
  const my = myProds(products,role);
  const prof = ROLES[role]?.profil||"salle";
  const [chk,setChk] = useState({});
  // Ajout manuel
  const [showManual,setShowManual] = useState(false);
  const [manSel,setManSel] = useState("");
  const [manQty,setManQty] = useState("");
  const [manuals,setManuals] = useState([]);

  const belowMin = my.filter(p=>p.q<p.m).map(p=>({
    id:`i_${p.id}`,pid:p.id,n:p.n,u:p.u,cat:p.cat,
    need:+(p.m-p.q+p.m*0.2).toFixed(2),src:"Inventaire",urg:p.urg
  }));
  const ruptures = losses.filter(l=>l.rsn==="Rupture de stock"&&!l.res&&(l.prof===prof||l.prof==="both")).map(l=>({
    id:`r_${l.id}`,pid:l.pid,n:l.pn,u:l.u,cat:"Rupture",need:l.qty,src:"Rupture",urg:true
  }));

  const all = [...ruptures,...belowMin.filter(b=>!ruptures.some(r=>r.pid===b.pid)),...manuals];
  const urgCount = all.filter(i=>i.urg).length;

  const addManual = () => {
    if(!manSel||!manQty) return;
    const prod = my.find(p=>p.id===manSel)||products.find(p=>p.id===manSel);
    setManuals(prev=>[...prev,{id:`m_${uid()}`,pid:manSel,n:prod?.n||manSel,u:prod?.u||"",cat:"Manuel",need:parseFloat(manQty)||1,src:"Ajout manuel",urg:false}]);
    setManSel(""); setManQty(""); setShowManual(false);
  };

  const markDone = pid => {
    setData(prev=>({...prev,products:prev.products.map(p=>p.id===pid?{...p,q:p.m*1.3}:p),losses:prev.losses.map(l=>l.pid===pid?{...l,res:true}:l)}));
    setManuals(prev=>prev.filter(m=>m.pid!==pid));
  };

  const cats = [...new Set(all.filter(i=>!i.urg).map(i=>i.cat))];

  const CItem = ({item}) => (
    <Card style={{marginBottom:8,opacity:chk[item.id]?.6:1}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div onClick={()=>setChk(x=>({...x,[item.id]:!x[item.id]}))}
          style={{width:22,height:22,borderRadius:6,flexShrink:0,border:`2px solid ${chk[item.id]?T.grn:T.borderB}`,background:chk[item.id]?T.grn:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s"}}>
          {chk[item.id]&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>✓</span>}
        </div>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:3}}>
            <span style={{fontWeight:600,fontSize:13,textDecoration:chk[item.id]?"line-through":"none",color:chk[item.id]?T.t3:T.t1}}>{item.n}</span>
            {item.urg&&<Badge c={T.red}>🚨 Urgent</Badge>}
          </div>
          <Badge c={item.src==="Rupture"?T.red:item.src==="Ajout manuel"?T.pur:T.org}>{item.src}</Badge>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div className="mono" style={{fontSize:16,fontWeight:700,color:item.urg?T.red:T.acc}}>{item.need}</div>
          <div style={{fontSize:11,color:T.t3}}>{item.u}</div>
        </div>
      </div>
      {!chk[item.id]&&(
        <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`}}>
          <Btn onClick={()=>markDone(item.pid)} sm variant="success" full icon="✅">Marquer commandé</Btn>
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
        <Btn onClick={()=>setShowManual(!showManual)} variant="secondary" sm icon="➕">Ajouter</Btn>
      </div>

      {/* Ajout manuel via liste déroulante */}
      {showManual&&(
        <Card style={{marginBottom:14,border:`1px solid ${T.pur}40`,background:T.purL}}>
          <div style={{fontSize:13,fontWeight:700,color:T.pur,marginBottom:10}}>Ajouter un produit à la liste</div>
          <div style={{marginBottom:8}}>
            <div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Produit</div>
            <select value={manSel} onChange={e=>setManSel(e.target.value)}
              style={{width:"100%",background:"#fff",border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:manSel?T.t1:T.t3,fontSize:13,outline:"none"}}>
              <option value="">— Sélectionner dans la liste —</option>
              {my.map(p=><option key={p.id} value={p.id}>{p.n} ({p.u})</option>)}
            </select>
          </div>
          <FIn label="Quantité à commander" val={manQty} set={setManQty} type="number" ph="Ex: 5"/>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <Btn onClick={()=>setShowManual(false)} variant="ghost" full sm>Annuler</Btn>
            <Btn onClick={addManual} full sm dis={!manSel||!manQty} icon="➕">Ajouter</Btn>
          </div>
        </Card>
      )}

      {all.length===0&&(
        <Card style={{textAlign:"center",padding:32}}>
          <div style={{fontSize:32,marginBottom:8}}>✅</div>
          <div style={{fontWeight:600,color:T.grn,fontSize:15}}>Tout est approvisionné !</div>
          <div style={{fontSize:13,color:T.t3,marginTop:4}}>Aucun produit sous seuil ni rupture déclarée</div>
        </Card>
      )}

      {urgCount>0&&(
        <div style={{marginBottom:16}}>
          <Divider label="🚨 Urgents"/>
          {all.filter(i=>i.urg).map(i=><CItem key={i.id} item={i}/>)}
        </div>
      )}
      {cats.map(cat=>{
        const items=all.filter(i=>i.cat===cat&&!i.urg);
        if(!items.length) return null;
        return <div key={cat} style={{marginBottom:14}}><Divider label={cat}/>{items.map(i=><CItem key={i.id} item={i}/>)}</div>;
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// MEP CHECKLIST avec quantités réelles saisies
// ═══════════════════════════════════════════════════════
const MepList = ({dishes,chks,tog,col,mepActual,setData,svc}) => {
  if(dishes.length===0) return <div style={{textAlign:"center",padding:32,color:T.t3,fontSize:13}}>Aucun plat configuré pour ce service.</div>;
  return (
    <div>
      {dishes.map(d=>{
        const done=d.subs.every(s=>chks[s.id]);
        const cnt=d.subs.filter(s=>chks[s.id]).length;
        const actualKey=`${d.id}_${svc}`;
        const actual=mepActual?.[actualKey];
        return (
          <Card key={d.id} style={{marginBottom:12}} highlight={done} highlightColor={T.grn}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${T.border}`}}>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:done?T.grn:T.t1,marginBottom:3}}>{d.l}</div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <Badge c={done?T.grn:col}>{cnt}/{d.subs.length} étapes</Badge>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:T.t3,marginBottom:3}}>Recommandé</div>
                <div className="mono" style={{fontSize:22,fontWeight:700,color:col}}>{d.pts}</div>
                <div style={{fontSize:11,color:T.t3}}>portions</div>
              </div>
            </div>

            {/* Quantité réelle produite */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,padding:"8px 12px",background:T.bg,borderRadius:8}}>
              <span style={{fontSize:12,color:T.t2,fontWeight:500,flex:1}}>Quantité réellement produite :</span>
              <input type="number"
                value={actual??d.pts}
                onChange={e=>setData(prev=>({...prev,mepActual:{...(prev.mepActual||{}),[actualKey]:parseInt(e.target.value)||0}}))}
                style={{width:64,textAlign:"center",background:"#fff",border:`1px solid ${actual&&actual!==d.pts?T.org:T.border}`,borderRadius:8,padding:"5px 4px",color:actual&&actual!==d.pts?T.org:T.t1,fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:600,outline:"none"}}/>
              <span style={{fontSize:12,color:T.t3}}>portions</span>
              {actual&&actual!==d.pts&&<Badge c={T.org}>Modifié</Badge>}
            </div>

            {d.subs.map(s=>(
              <div key={s.id} onClick={()=>tog(s.id)}
                style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.border}`,cursor:"pointer",opacity:chks[s.id]?.5:1,transition:"opacity .2s"}}>
                <div style={{width:20,height:20,borderRadius:5,flexShrink:0,marginTop:1,border:`2px solid ${chks[s.id]?T.grn:T.borderB}`,background:chks[s.id]?T.grn:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {chks[s.id]&&<span style={{color:"#fff",fontSize:10,fontWeight:700}}>✓</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:T.t1,textDecoration:chks[s.id]?"line-through":"none"}}>{s.l}</div>
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

// ═══════════════════════════════════════════════════════
// STAFF JOURNEY
// ═══════════════════════════════════════════════════════
const Journey = ({user,data,setData,svc,covers,onLogout}) => {
  const rc = ROLES[user.r]||ROLES["Manager"];
  const col = rc.c;
  const sk = `${todayK()}_${svc}_${user.id}`;
  const st = data.daily?.[sk]||{};
  const chks = st.chks||{};
  const [view,setView] = useState("journey");
  const [phase,setPhase] = useState(st.phase||rc.phases[0]);
  const [unlAnim,setUnlAnim] = useState(null);
  const disabled = data.disabledTasks||{};

  const setSt = upd => setData(prev=>({...prev,daily:{...prev.daily,[sk]:{...(prev.daily?.[sk]||{}),...upd}}}));
  const tog = id => setSt({chks:{...chks,[id]:!chks[id]}});

  const getMep = () => (data.dishes||[]).filter(d=>d.svc.includes(svc)).map(d=>({
    id:`m_${d.id}`, l:d.n, pts:Math.ceil(covers*d.r),
    subs:d.comps.map(c=>({id:`m_${d.id}_${c.id}`,l:c.l,qty:Math.ceil(covers*d.r*c.pc),u:c.u,note:c.note}))
  }));

  const getActiveTasks = p => {
    if(p==="mep") return getMep();
    return (rc.tasks[p]||[]).filter(t=>!disabled[t.id]);
  };

  const getPct = p => {
    if(p==="mep"){const t=getMep().flatMap(d=>d.subs);return t.length?t.filter(x=>chks[x.id]).length/t.length:1;}
    const t=getActiveTasks(p);return t.length?t.filter(x=>chks[x.id]).length/t.length:1;
  };
  const pOk = p => getPct(p)>=1;
  const unlocked = p => {const i=rc.phases.indexOf(p);return i===0||pOk(rc.phases[i-1]);};
  const advance = p => {
    const i=rc.phases.indexOf(p),nx=rc.phases[i+1];
    if(nx){setSt({phase:nx});setPhase(nx);setUnlAnim(nx);setTimeout(()=>setUnlAnim(null),700);}
  };

  const oPct = Math.round(rc.phases.reduce((s,p)=>s+getPct(p),0)/rc.phases.length*100);
  const allDone = rc.phases.every(p=>pOk(p));
  const curTasks = getActiveTasks(phase);
  const curDone = phase==="mep"?curTasks.flatMap(d=>d.subs).filter(s=>chks[s.id]).length:curTasks.filter(t=>chks[t.id]).length;
  const curTot = phase==="mep"?curTasks.flatMap(d=>d.subs).length:curTasks.length;
  const myP = myProds(data.products||[],user.r);
  const alertN = myP.filter(p=>p.q<p.m).length;
  const prof = rc.profil;
  const rupN = (data.losses||[]).filter(l=>l.rsn==="Rupture de stock"&&!l.res&&(l.prof===prof||l.prof==="both")).length;
  const coursN = alertN+rupN;

  const VIEWS = [
    {id:"journey",l:"Service",icon:"🗓"},
    {id:"stock",l:"Stocks",icon:"📦",b:alertN>0?alertN:null},
    {id:"inventaire",l:"Inventaire",icon:"📋"},
    {id:"pertes",l:"Pertes",icon:"🗑",b:rupN>0?rupN:null},
    {id:"courses",l:"Courses",icon:"🛒",b:coursN>0?coursN:null},
  ];

  return (
    <div style={{minHeight:"100vh",background:T.bg}}>
      {/* HEADER */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"12px 16px",position:"sticky",top:0,zIndex:20,boxShadow:T.shadow}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:10,flexShrink:0,background:`${col}15`,border:`2px solid ${col}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{rc.i}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:14,color:T.t1}}>{user.n}</div>
            <div style={{fontSize:12,color:col,fontWeight:600}}>{user.r}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,background:svc==="Déjeuner"?T.yelL:T.purL,color:svc==="Déjeuner"?T.yel:T.pur,border:`1px solid ${svc==="Déjeuner"?T.yel:T.pur}30`}}>{svc}</div>
              <div style={{fontSize:11,color:T.t3,marginTop:2}}>{covers} couverts</div>
            </div>
            {view==="journey"&&<Ring v={oPct} max={100} c={allDone?T.grn:col} sz={42} sw={4}/>}
            <button onClick={onLogout} style={{width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:T.bg,color:T.t3,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}} title="Déconnexion">⬅</button>
          </div>
        </div>
        {view==="journey"&&(
          <div style={{display:"flex",gap:3,marginTop:10}}>
            {rc.phases.map(p=>{const d=pOk(p),a=p===phase,lk=!unlocked(p);return(
              <div key={p} onClick={()=>!lk&&setPhase(p)} style={{flex:1,height:5,borderRadius:3,cursor:lk?"not-allowed":"pointer",background:d?T.grn:a?col:T.border,opacity:lk&&!d?.3:1,transition:"all .3s"}} title={rc.labels[p]}/>
            );})}
          </div>
        )}
      </div>

      {/* NAV TABS */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"0 12px",display:"flex",gap:2,overflowX:"auto",scrollbarWidth:"none"}}>
        {VIEWS.map(v=>(
          <button key={v.id} onClick={()=>setView(v.id)} style={{
            display:"flex",alignItems:"center",gap:5,padding:"10px 12px",
            border:"none",borderBottom:`2px solid ${view===v.id?col:"transparent"}`,
            background:"transparent",color:view===v.id?col:T.t3,
            cursor:"pointer",fontWeight:view===v.id?700:500,fontSize:12,whiteSpace:"nowrap",
            transition:"all .15s",flexShrink:0,
          }}>
            <span>{v.icon}</span>{v.l}
            {v.b!=null&&<span style={{background:T.red,color:"#fff",borderRadius:10,fontSize:9,fontWeight:700,padding:"1px 5px",fontFamily:"'DM Mono',monospace"}}>{v.b}</span>}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{padding:16,paddingBottom:80,maxWidth:680,margin:"0 auto"}} className="up">
        {view==="stock"&&<Stock products={data.products||[]} setData={setData} role={user.r}/>}
        {view==="inventaire"&&<Inventaire products={data.products||[]} setData={setData} role={user.r}/>}
        {view==="pertes"&&<Pertes products={data.products||[]} losses={data.losses||[]} setData={setData} profil={prof} userName={user.n}/>}
        {view==="courses"&&<Courses products={data.products||[]} losses={data.losses||[]} setData={setData} role={user.r}/>}

        {view==="journey"&&(
          <>
            {/* Phase tabs */}
            <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:16,paddingBottom:4,scrollbarWidth:"none"}}>
              {rc.phases.map(p=>{
                const d=pOk(p),a=p===phase,lk=!unlocked(p);
                return (
                  <button key={p} onClick={()=>!lk&&setPhase(p)} style={{
                    display:"flex",alignItems:"center",gap:4,padding:"7px 12px",borderRadius:20,flexShrink:0,
                    border:`1px solid ${a?col:d?T.grn:T.border}`,
                    background:a?col:d?T.grnL:"#fff",
                    color:a?"#fff":d?T.grn:lk?T.t4:T.t2,
                    cursor:lk?"not-allowed":"pointer",fontWeight:600,fontSize:12,
                    boxShadow:a?`0 2px 8px ${col}40`:"none",
                    transition:"all .2s",animation:unlAnim===p?"fadeUp .3s ease":""
                  }}>
                    {d?"✓":lk?"🔒":""} {rc.labels[p]}
                  </button>
                );
              })}
            </div>

            {/* Phase header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <h2 style={{fontSize:20,fontWeight:700,color:T.t1}}>{rc.labels[phase]}</h2>
                <div style={{fontSize:12,color:T.t3,marginTop:2}}>{dnow()}</div>
              </div>
              <Ring v={curDone} max={curTot||1} c={getPct(phase)>=1?T.grn:col} sz={52} sw={5}/>
            </div>

            {/* Locked */}
            {!unlocked(phase)&&(
              <Card style={{marginBottom:16,textAlign:"center",padding:24,background:T.redL,border:`1px solid ${T.redB}`}}>
                <div style={{fontSize:28,marginBottom:8}}>🔒</div>
                <div style={{fontWeight:700,color:T.red,fontSize:15}}>Phase verrouillée</div>
                <div style={{fontSize:13,color:T.t2,marginTop:6}}>Complétez d'abord : <strong>{rc.labels[rc.phases[rc.phases.indexOf(phase)-1]]}</strong></div>
              </Card>
            )}

            {/* Tasks */}
            {unlocked(phase)&&(
              phase==="mep"
                ? <MepList dishes={curTasks} chks={chks} tog={tog} col={col} mepActual={data.mepActual||{}} setData={setData} svc={svc}/>
                : <div>
                    {curTasks.length===0&&<Card style={{textAlign:"center",padding:20,color:T.t3}}>Toutes les tâches ont été désactivées par le manager.</Card>}
                    {curTasks.map(t=>(
                      <div key={t.id} onClick={()=>tog(t.id)} style={{
                        display:"flex",alignItems:"flex-start",gap:12,padding:"13px 14px",
                        background:chks[t.id]?T.grnL:"#fff",
                        border:`1px solid ${chks[t.id]?T.grnB:T.border}`,
                        borderRadius:10,cursor:"pointer",marginBottom:8,transition:"all .2s",
                        boxShadow:chks[t.id]?"none":T.shadow,
                      }}>
                        <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${chks[t.id]?T.grn:T.borderB}`,background:chks[t.id]?T.grn:"#fff",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                          {chks[t.id]&&<span style={{color:"#fff",fontSize:12,fontWeight:700}}>✓</span>}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,color:chks[t.id]?T.t3:T.t1,textDecoration:chks[t.id]?"line-through":"none",fontWeight:chks[t.id]?400:500,lineHeight:1.4}}>{t.t}</div>
                          <div style={{display:"flex",gap:5,marginTop:5}}>
                            {t.k&&<Badge c={T.red}>Critique</Badge>}
                            {t.h&&<Badge c={T.org}>HACCP</Badge>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
            )}

            {/* Advance */}
            {unlocked(phase)&&pOk(phase)&&rc.phases.indexOf(phase)<rc.phases.length-1&&(
              <div className="up" style={{marginTop:16}}>
                <Card style={{marginBottom:12,background:T.grnL,border:`1px solid ${T.grnB}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:24}}>✅</span>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:T.grn}}>Phase terminée !</div>
                      <div style={{fontSize:12,color:T.t2}}>{rc.labels[rc.phases[rc.phases.indexOf(phase)+1]]} est débloquée</div>
                    </div>
                  </div>
                </Card>
                <Btn onClick={()=>advance(phase)} full col={col} icon="→">
                  Passer à : {rc.labels[rc.phases[rc.phases.indexOf(phase)+1]]}
                </Btn>
              </div>
            )}

            {allDone&&(
              <Card style={{marginTop:20,textAlign:"center",padding:28,background:`${col}08`,border:`2px solid ${col}30`}}>
                <div style={{fontSize:40,marginBottom:10}}>{rc.i}</div>
                <div style={{fontSize:20,fontWeight:700,color:col}}>Bravo !</div>
                <div style={{fontSize:14,color:T.t2,marginTop:4}}>Toutes les phases du {svc} sont complétées</div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════
const Login = ({staff,onLogin,svc,setSvc,settings}) => {
  const [sel,setSel]=useState(null);
  const [pin,setPin]=useState("");
  const [err,setErr]=useState("");
  const [apw,setApw]=useState("");
  const [showAdmin,setShowAdmin]=useState(false);
  const cvr=settings.cvr[todayK()]||0;
  const auto=detSvc(settings);
  const aff=cvr>=100?{l:"Forte affluence",c:T.red,bg:T.redL}:cvr>=70?{l:"Affluence moyenne",c:T.org,bg:T.orgL}:{l:"Service calme",c:T.grn,bg:T.grnL};

  const tryLogin=()=>{
    if(showAdmin){
      if(apw===""||apw==="admin"){onLogin({id:0,n:"Admin",r:"Manager",admin:true});return;}
      setErr("Mot de passe incorrect");return;
    }
    const m=staff.find(s=>s.id===sel);
    if(m&&(m.pin===pin||pin==="")){onLogin(m);setErr("");}
    else{setErr("PIN incorrect");setPin("");}
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:T.acc,padding:"32px 24px 24px",textAlign:"center",color:"#fff"}}>
        <div style={{fontSize:28,fontWeight:700,letterSpacing:-.5}}>L'Embouchure</div>
        <div style={{fontSize:13,opacity:.8,marginTop:4}}>Système opérationnel</div>
        <div style={{fontSize:12,opacity:.6,marginTop:3,fontFamily:"'DM Mono',monospace"}}>{dnow()} · {tnow()}</div>
      </div>

      <div style={{flex:1,padding:"16px",maxWidth:480,margin:"0 auto",width:"100%"}}>
        {/* Service selector */}
        <Card style={{marginBottom:16,padding:14}}>
          <div style={{fontSize:11,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:10,textAlign:"center"}}>Service actif</div>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {["Déjeuner","Dîner","Brunch"].map(s=>{
              const active=svc===s;
              const col=s==="Déjeuner"?T.yel:s==="Dîner"?T.pur:T.acc;
              return <button key={s} onClick={()=>setSvc(s)} style={{flex:1,padding:"9px 4px",borderRadius:10,border:`2px solid ${active?col:T.border}`,background:active?col+"15":"#fff",color:active?col:T.t3,cursor:"pointer",fontWeight:600,fontSize:12,transition:"all .15s"}}>
                {s}{s===auto&&<span style={{fontSize:9,opacity:.6}}> ●</span>}
              </button>;
            })}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:aff.bg,borderRadius:8}}>
            <span style={{fontSize:13,color:aff.c,fontWeight:600}}>{aff.l}</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:15,color:T.t1,fontWeight:700}}>{cvr} couverts</span>
          </div>
        </Card>

        {/* Staff / Admin toggle */}
        {!sel&&!showAdmin&&(
          <>
            <div style={{fontSize:11,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Qui êtes-vous ?</div>
            {staff.filter(s=>s.on).map(s=>{
              const rc=ROLES[s.r];
              return (
                <Card key={s.id} onClick={()=>setSel(s.id)} style={{marginBottom:8,display:"flex",alignItems:"center",gap:12,cursor:"pointer",padding:"12px 14px"}}>
                  <div style={{width:44,height:44,borderRadius:12,flexShrink:0,background:`${rc?.c||T.acc}15`,border:`2px solid ${rc?.c||T.acc}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{rc?.i||"👤"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14,color:T.t1}}>{s.n}</div>
                    <div style={{fontSize:12,color:rc?.c||T.t2,fontWeight:500,marginTop:1}}>{s.r}</div>
                  </div>
                  <div style={{color:T.t4,fontSize:18}}>›</div>
                </Card>
              );
            })}
            <div style={{marginTop:16,textAlign:"center",paddingBottom:20}}>
              <button onClick={()=>setShowAdmin(true)} style={{background:"none",border:"none",color:T.t3,cursor:"pointer",fontSize:12,textDecoration:"underline"}}>
                Accès administrateur
              </button>
            </div>
          </>
        )}

        {/* Admin login */}
        {showAdmin&&(
          <Card className="up">
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{width:56,height:56,borderRadius:16,background:T.redL,border:`2px solid ${T.redB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 10px"}}>🔐</div>
              <div style={{fontWeight:700,fontSize:16,color:T.t1}}>Accès Administrateur</div>
            </div>
            <FIn label="Mot de passe" val={apw} set={setApw} type="password" ph="Mot de passe admin"/>
            {err&&<div style={{color:T.red,fontSize:13,marginBottom:8,fontWeight:500}}>{err}</div>}
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <Btn onClick={()=>{setShowAdmin(false);setErr("");setApw("");}} variant="ghost" full sm>Retour</Btn>
              <Btn onClick={tryLogin} full sm>Connexion →</Btn>
            </div>
            <div style={{fontSize:11,color:T.t3,textAlign:"center",marginTop:8}}>Mot de passe : admin (ou vide)</div>
          </Card>
        )}

        {/* Staff PIN */}
        {sel&&!showAdmin&&(()=>{
          const m=staff.find(s=>s.id===sel),rc=ROLES[m?.r];
          return (
            <Card className="up">
              <div style={{textAlign:"center",marginBottom:16}}>
                <div style={{width:60,height:60,borderRadius:16,background:`${rc?.c||T.acc}15`,border:`2px solid ${rc?.c||T.acc}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 10px"}}>{rc?.i}</div>
                <div style={{fontWeight:700,fontSize:17,color:T.t1}}>{m?.n}</div>
                <div style={{fontSize:13,color:rc?.c,fontWeight:600,marginTop:2}}>{m?.r}</div>
              </div>
              <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:16}}>
                {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:pin.length>i?T.acc:T.border,transition:"all .2s"}}/>)}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>(
                  <button key={i} onClick={()=>{if(k==="⌫")setPin(p=>p.slice(0,-1));else if(k!=="")setPin(p=>p.length<4?p+k:p);}}
                    style={{padding:"14px",borderRadius:12,border:`1px solid ${T.border}`,background:k===""?"transparent":T.bg,color:T.t1,fontSize:18,fontWeight:600,cursor:k===""?"default":"pointer",opacity:k===""?0:1,boxShadow:k===""?"none":T.shadow,transition:"all .1s"}}>
                    {k}
                  </button>
                ))}
              </div>
              {err&&<div style={{color:T.red,fontSize:13,textAlign:"center",marginBottom:8,fontWeight:500}}>{err}</div>}
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={()=>{setSel(null);setPin("");setErr("");}} variant="ghost" full>Retour</Btn>
                <Btn onClick={tryLogin} full>Connexion →</Btn>
              </div>
              <div style={{fontSize:11,color:T.t3,textAlign:"center",marginTop:8}}>Laisser vide pour accès sans PIN</div>
            </Card>
          );
        })()}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════════════════════════
const Admin = ({data,setData,svc,covers,onLogout}) => {
  const [tab,setTab]=useState("vue");
  const dk=todayK();
  const TABS=[
    {id:"vue",l:"Vue d'ensemble",i:"📊"},
    {id:"taches",l:"Tâches",i:"✅"},
    {id:"produits",l:"Produits",i:"🗂️"},
    {id:"courses",l:"Courses",i:"🛒"},
    {id:"pertes",l:"Pertes",i:"🗑"},
    {id:"equipe",l:"Équipe",i:"👥"},
    {id:"config",l:"Config",i:"⚙️"},
  ];

  return (
    <div style={{minHeight:"100vh",background:T.bg}}>
      {/* Header */}
      <div style={{background:T.acc,padding:"14px 16px",boxShadow:T.shadowM}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:800,margin:"0 auto"}}>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{data.settings.name}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.7)"}}>{dnow()} · {svc} · {covers} couverts</div>
          </div>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)",color:"#fff",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:13,fontWeight:600}}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,boxShadow:T.shadow}}>
        <div style={{display:"flex",gap:0,overflowX:"auto",scrollbarWidth:"none",maxWidth:800,margin:"0 auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              display:"flex",alignItems:"center",gap:5,padding:"12px 14px",
              border:"none",borderBottom:`2px solid ${tab===t.id?T.acc:"transparent"}`,
              background:"transparent",color:tab===t.id?T.acc:T.t3,
              cursor:"pointer",fontWeight:tab===t.id?700:500,fontSize:12,whiteSpace:"nowrap",
              transition:"all .15s",flexShrink:0,
            }}>
              <span>{t.i}</span>{t.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:16,paddingBottom:60,maxWidth:800,margin:"0 auto"}} className="up">
        {tab==="vue"    &&<AdminVue data={data} svc={svc} covers={covers}/>}
        {tab==="taches" &&<AdminTaches data={data} setData={setData}/>}
        {tab==="produits"&&<AdminProduits data={data} setData={setData}/>}
        {tab==="courses"&&<Courses products={data.products||[]} losses={data.losses||[]} setData={setData} role="Manager"/>}
        {tab==="pertes" &&<Pertes products={data.products||[]} losses={data.losses||[]} setData={setData} profil="both" userName="Admin"/>}
        {tab==="equipe" &&<AdminEquipe data={data} setData={setData}/>}
        {tab==="config" &&<AdminConfig data={data} setData={setData}/>}
      </div>
    </div>
  );
};

// ─── Admin Vue ────────────────────────────────────────
const AdminVue = ({data,svc,covers}) => {
  const dk=todayK();
  const sp=data.staff.filter(s=>s.on).map(s=>{
    const rc=ROLES[s.r];if(!rc)return null;
    const chks=data.daily?.[`${dk}_${svc}_${s.id}`]?.chks||{};
    const disabled=data.disabledTasks||{};
    let tot=0,dn=0;
    rc.phases.forEach(p=>{if(p==="mep")return;const t=(rc.tasks[p]||[]).filter(x=>!disabled[x.id]);tot+=t.length;dn+=t.filter(x=>chks[x.id]).length;});
    return{...s,pct:tot>0?Math.round(dn/tot*100):0,dn,tot,rc};
  }).filter(Boolean);
  const low=(data.products||[]).filter(p=>p.q<p.m);
  const urg=(data.products||[]).filter(p=>p.urg&&p.q<p.m);
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
        <StatCard icon="🍽️" value={covers} label="Couverts" color={T.acc}/>
        <StatCard icon="🚨" value={urg.length} label="Urgents" color={urg.length>0?T.red:T.grn} alert={urg.length>0}/>
        <StatCard icon="📦" value={low.length} label="Alertes stock" color={low.length>0?T.red:T.grn} alert={low.length>0}/>
      </div>

      {urg.length>0&&(
        <Card style={{marginBottom:16,background:T.redL,border:`1px solid ${T.redB}`}}>
          <div style={{fontSize:13,fontWeight:700,color:T.red,marginBottom:10}}>🚨 Produits urgents à commander</div>
          {urg.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}>
            <span style={{fontWeight:500}}>{p.n}</span>
            <span className="mono" style={{color:T.red}}>{p.q}/{p.m} {p.u}</span>
          </div>)}
        </Card>
      )}

      <Divider label="Avancement équipe"/>
      {sp.map(s=>(
        <Card key={s.id} style={{marginBottom:8,padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:`${s.rc.c}15`,border:`2px solid ${s.rc.c}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{s.rc.i}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontWeight:600,fontSize:13,color:T.t1}}>{s.n}</span>
                <span className="mono" style={{fontSize:12,fontWeight:600,color:s.pct===100?T.grn:s.rc.c}}>{s.pct}%</span>
              </div>
              <Bar v={s.dn} max={s.tot} c={s.pct===100?T.grn:s.rc.c}/>
            </div>
          </div>
        </Card>
      ))}

      <Divider label="Couverts semaine"/>
      <Card>
        {Object.entries(data.settings.cvr).map(([d,c])=>{
          const iT=d===dk,af=c>=100?T.red:c>=70?T.yel:T.grn;
          return <div key={d} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div className="mono" style={{width:28,fontSize:11,color:iT?T.acc:T.t3,fontWeight:iT?700:400}}>{d.toUpperCase()}</div>
            <div style={{flex:1}}><Bar v={c} max={150} c={iT?T.acc:af}/></div>
            <div className="mono" style={{fontSize:12,color:iT?T.acc:T.t2,width:40,textAlign:"right",fontWeight:iT?700:400}}>{c}</div>
          </div>;
        })}
      </Card>
    </div>
  );
};

// ─── Admin Tâches — activer/désactiver ───────────────
const AdminTaches = ({data,setData}) => {
  const disabled = data.disabledTasks||{};
  const toggle = id => setData(prev=>({...prev,disabledTasks:{...(prev.disabledTasks||{}),[id]:!(prev.disabledTasks||{})[id]}}));
  const allPhases = Object.entries(ROLES).map(([role,rc])=>({
    role,rc,
    phases:rc.phases.filter(p=>p!=="mep").map(p=>({phase:p,label:rc.labels[p],tasks:rc.tasks[p]||[]}))
  }));

  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:700,marginBottom:4}}>Gestion des tâches</h2>
      <div style={{fontSize:13,color:T.t3,marginBottom:16}}>Activez ou désactivez les tâches pour chaque rôle. Les tâches désactivées n'apparaissent pas pour le personnel.</div>

      {allPhases.map(({role,rc,phases})=>(
        <div key={role} style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"8px 12px",background:`${rc.c}10`,borderRadius:10,border:`1px solid ${rc.c}30`}}>
            <span style={{fontSize:18}}>{rc.i}</span>
            <span style={{fontWeight:700,fontSize:14,color:rc.c}}>{role}</span>
          </div>
          {phases.map(({phase,label,tasks})=>(
            tasks.length>0&&<div key={phase} style={{marginBottom:12,paddingLeft:8}}>
              <div style={{fontSize:11,fontWeight:600,color:T.t3,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>{label}</div>
              {tasks.map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:disabled[t.id]?T.bg:T.surface,border:`1px solid ${T.border}`,borderRadius:8,marginBottom:5,opacity:disabled[t.id]?.6:1}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:disabled[t.id]?T.t3:T.t1,textDecoration:disabled[t.id]?"line-through":"none",fontWeight:500}}>{t.t}</div>
                    <div style={{display:"flex",gap:4,marginTop:3}}>
                      {t.k&&<Badge c={T.red}>Critique</Badge>}
                      {t.h&&<Badge c={T.org}>HACCP</Badge>}
                    </div>
                  </div>
                  <Toggle on={!disabled[t.id]} set={()=>toggle(t.id)} c={T.grn}/>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// ─── Admin Produits ───────────────────────────────────
const AdminProduits = ({data,setData}) => {
  const [pf,setPf]=useState("Tous");
  const [cf,setCf]=useState("Tous");
  const [showA,setShowA]=useState(false);
  const [editId,setEditId]=useState(null);
  const [form,setForm]=useState({n:"",u:"",q:0,m:1,cat:"",p:"cuisine",urg:false});
  const prods=data.products||[];
  const cats=["Tous",...new Set(prods.map(p=>p.cat))];
  const shown=prods.filter(p=>(pf==="Tous"||p.p===pf)&&(cf==="Tous"||p.cat===cf));
  const PL={cuisine:"🍳 Cuisine",salle:"🍷 Salle",both:"🔄 Les deux"};
  const saveP=()=>{if(!form.n||!form.u)return;setData(prev=>({...prev,products:[...(prev.products||[]),{...form,id:`p${uid()}`,q:parseFloat(form.q)||0,m:parseFloat(form.m)||1}]}));setForm({n:"",u:"",q:0,m:1,cat:"",p:"cuisine",urg:false});setShowA(false);};
  const remP=id=>setData(prev=>({...prev,products:(prev.products||[]).filter(p=>p.id!==id)}));
  const updP=(id,k,v)=>setData(prev=>({...prev,products:(prev.products||[]).map(p=>p.id===id?{...p,[k]:k==="q"||k==="m"?parseFloat(v)||0:v}:p)}));

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><h2 style={{fontSize:18,fontWeight:700}}>Produits</h2><div style={{fontSize:13,color:T.t3,marginTop:2}}>{prods.length} produits</div></div>
        <Btn onClick={()=>setShowA(!showA)} variant="secondary" sm icon="➕">Ajouter</Btn>
      </div>

      <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
        {["Tous","cuisine","salle","both"].map(p=><button key={p} onClick={()=>setPf(p)} style={{padding:"5px 12px",borderRadius:20,flexShrink:0,border:`1px solid ${pf===p?T.acc:T.border}`,background:pf===p?T.acc:"#fff",color:pf===p?"#fff":T.t2,cursor:"pointer",fontWeight:500,fontSize:12}}>{p==="Tous"?"Tous":PL[p]}</button>)}
      </div>
      <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:14,paddingBottom:4,scrollbarWidth:"none"}}>
        {cats.map(c=><button key={c} onClick={()=>setCf(c)} style={{padding:"5px 12px",borderRadius:20,flexShrink:0,border:`1px solid ${cf===c?T.pur:T.border}`,background:cf===c?T.purL:"#fff",color:cf===c?T.pur:T.t2,cursor:"pointer",fontWeight:500,fontSize:12}}>{c}</button>)}
      </div>

      {showA&&(
        <Card style={{marginBottom:16,border:`1px solid ${T.acc}40`,background:T.accL}}>
          <div style={{fontSize:13,fontWeight:700,color:T.acc,marginBottom:12}}>Nouveau produit</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <FIn label="Nom" val={form.n} set={v=>setForm(p=>({...p,n:v}))} ph="Crème fraîche"/>
            <FIn label="Unité" val={form.u} set={v=>setForm(p=>({...p,u:v}))} ph="kg, L, unité…"/>
            <FIn label="Qté actuelle" val={form.q} set={v=>setForm(p=>({...p,q:v}))} type="number"/>
            <FIn label="Seuil minimum" val={form.m} set={v=>setForm(p=>({...p,m:v}))} type="number"/>
            <FIn label="Catégorie" val={form.cat} set={v=>setForm(p=>({...p,cat:v}))} ph="Viande, Boisson…"/>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:T.t2,marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Profil utilisateur</div>
            <div style={{display:"flex",gap:6}}>
              {["cuisine","salle","both"].map(pr=><button key={pr} onClick={()=>setForm(p=>({...p,p:pr}))} style={{flex:1,padding:"7px 4px",borderRadius:8,border:`1px solid ${form.p===pr?T.acc:T.border}`,background:form.p===pr?T.acc:"#fff",color:form.p===pr?"#fff":T.t2,cursor:"pointer",fontWeight:500,fontSize:11}}>{PL[pr]}</button>)}
            </div>
          </div>
          <div style={{marginBottom:12}}><Toggle on={form.urg} set={()=>setForm(p=>({...p,urg:!p.urg}))} label="Produit urgent 🚨" c={T.red}/></div>
          <Btn onClick={saveP} full dis={!form.n||!form.u} icon="➕">Ajouter le produit</Btn>
        </Card>
      )}

      {shown.map(p=>{
        const al=p.q<p.m,ed=editId===p.id;
        return (
          <Card key={p.id} style={{marginBottom:8}} highlight={p.urg&&al} highlightColor={T.red}>
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
                    <select value={p.p} onChange={e=>updP(p.id,"p",e.target.value)} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 10px",color:T.t1,fontSize:13,outline:"none"}}>
                      <option value="cuisine">🍳 Cuisine</option><option value="salle">🍷 Salle</option><option value="both">🔄 Les deux</option>
                    </select>
                  </div>
                </div>
                <div style={{marginBottom:10}}><Toggle on={!!p.urg} set={()=>updP(p.id,"urg",!p.urg)} label="Urgent 🚨" c={T.red}/></div>
                <div style={{display:"flex",gap:8}}>
                  <Btn onClick={()=>setEditId(null)} variant="ghost" full sm>Annuler</Btn>
                  <Btn onClick={()=>setEditId(null)} variant="success" full sm>Valider ✓</Btn>
                </div>
              </div>
            ):(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:4}}>
                      <span style={{fontWeight:600,fontSize:13}}>{p.n}</span>
                      {al&&<Badge c={T.red}>Alerte</Badge>}
                      {p.urg&&<Badge c={T.red}>🚨</Badge>}
                    </div>
                    <div style={{display:"flex",gap:5}}>
                      <Badge c={p.p==="cuisine"?T.org:p.p==="salle"?T.acc:T.pur}>{PL[p.p]}</Badge>
                      <Badge c={T.t3}>{p.cat}</Badge>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span className="mono" style={{fontSize:14,fontWeight:600,color:al?T.red:T.t1}}>{p.q}<span style={{fontSize:11,color:T.t3,marginLeft:2}}>{p.u}</span></span>
                    <Btn onClick={()=>setEditId(p.id)} sm variant="secondary">✏️</Btn>
                    <Btn onClick={()=>remP(p.id)} sm danger>✕</Btn>
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

// ─── Admin Equipe ─────────────────────────────────────
const AdminEquipe = ({data,setData}) => {
  const [f,setF]=useState({n:"",r:"Cuisinier",pin:""});
  const add=()=>{if(!f.n)return;setData(prev=>({...prev,staff:[...prev.staff,{...f,id:Date.now(),on:true}]}));setF({n:"",r:"Cuisinier",pin:""});};
  const tog=id=>setData(prev=>({...prev,staff:prev.staff.map(s=>s.id===id?{...s,on:!s.on}:s)}));
  const rem=id=>setData(prev=>({...prev,staff:prev.staff.filter(s=>s.id!==id)}));
  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:700,marginBottom:16}}>Équipe</h2>
      <Card style={{marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:12}}>Ajouter un membre</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <FIn label="Nom" val={f.n} set={v=>setF(p=>({...p,n:v}))}/>
          <FIn label="PIN (4 chiffres)" val={f.pin} set={v=>setF(p=>({...p,pin:v}))} type="password"/>
          <div style={{gridColumn:"span 2"}}>
            <div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Rôle</div>
            <select value={f.r} onChange={e=>setF(p=>({...p,r:e.target.value}))} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.t1,fontSize:13,outline:"none"}}>
              {Object.keys(ROLES).map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <Btn onClick={add} full icon="➕" dis={!f.n}>Ajouter</Btn>
      </Card>
      {data.staff.map(s=>{const rc=ROLES[s.r];return(
        <Card key={s.id} style={{marginBottom:8,display:"flex",alignItems:"center",gap:10,opacity:s.on?1:.5}}>
          <div style={{width:38,height:38,borderRadius:10,flexShrink:0,background:`${rc?.c||T.acc}15`,border:`2px solid ${rc?.c||T.acc}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{rc?.i||"👤"}</div>
          <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{s.n}</div><div style={{fontSize:12,color:rc?.c||T.t2,fontWeight:500}}>{s.r}</div></div>
          <div style={{display:"flex",gap:6}}>
            <Btn onClick={()=>tog(s.id)} sm variant="secondary">{s.on?"Pause":"Activer"}</Btn>
            <Btn onClick={()=>rem(s.id)} sm danger>✕</Btn>
          </div>
        </Card>
      );})}
    </div>
  );
};

// ─── Admin Config ─────────────────────────────────────
const AdminConfig = ({data,setData}) => {
  const s=data.settings;
  const upd=(k,v)=>setData(prev=>({...prev,settings:{...prev.settings,[k]:v}}));
  const updC=(d,v)=>setData(prev=>({...prev,settings:{...prev.settings,cvr:{...prev.settings.cvr,[d]:parseInt(v)||0}}}));
  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:700,marginBottom:16}}>Configuration</h2>
      <Card style={{marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Restaurant</div>
        <FIn label="Nom" val={s.name} set={v=>upd("name",v)}/>
        <Divider label="Détection automatique des services"/>
        {[{l:"Déjeuner commence",k:"lS"},{l:"Déjeuner se termine",k:"lE"},{l:"Dîner commence",k:"dS"}].map(f=>(
          <div key={f.k} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:12,color:T.t2,fontWeight:500}}>{f.l}</span>
              <span className="mono" style={{fontSize:13,color:T.acc,fontWeight:600}}>{String(s[f.k]).padStart(2,"0")}h00</span>
            </div>
            <input type="range" min={0} max={24} value={s[f.k]} onChange={e=>upd(f.k,parseInt(e.target.value))}/>
          </div>
        ))}
      </Card>
      <Card>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Couverts prévus par jour</div>
        {Object.entries(s.cvr).map(([d,c])=>(
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

// ═══════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════
export default function App() {
  const [data,setRaw] = useState(load);
  const [user,setUser] = useState(null);
  const [svc,setSvc] = useState(()=>detSvc(load().settings));

  const setData = useCallback(upd => setRaw(prev => {
    const next = typeof upd==="function"?upd(prev):upd;
    save(next); return next;
  }), []);

  const covers = data.settings.cvr[todayK()]||0;

  return (
    <>
      <style>{css}</style>
      {!user
        ? <Login staff={data.staff} onLogin={setUser} svc={svc} setSvc={setSvc} settings={data.settings}/>
        : user.admin||user.r==="Manager"
          ? <Admin data={data} setData={setData} svc={svc} covers={covers} onLogout={()=>setUser(null)}/>
          : <Journey user={user} data={data} setData={setData} svc={svc} covers={covers} onLogout={()=>setUser(null)}/>
      }
    </>
  );
}
