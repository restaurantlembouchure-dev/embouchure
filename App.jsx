import { useState, useCallback } from "react";

// ─── COULEURS ─────────────────────────────────────────────────────
const C = {
  bg:"#090d12", card:"#111720", border:"#1d2a3a", bB:"#243040",
  acc:"#e8a247", accG:"rgba(232,162,71,0.13)",
  grn:"#3dba7e", grnG:"rgba(61,186,126,0.12)",
  red:"#e85454", redD:"#3a0f0f",
  blu:"#4a9eff", pur:"#a47eff", org:"#ff8c42",
  t1:"#eef2f7", t2:"#8090a8", t3:"#3d5068", t4:"#1e2e40",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{background:${C.bg};color:${C.t1};font-family:'Syne',sans-serif;min-height:100vh}
.mono{font-family:'DM Mono',monospace}
input,select,textarea,button{font-family:'Syne',sans-serif}
input[type=range]{accent-color:${C.acc};width:100%}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-thumb{background:${C.bB};border-radius:2px}
@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.up{animation:up .3s ease forwards}
.pulse{animation:pulse 2s ease infinite}
`;

// ─── DONNÉES RÔLES ────────────────────────────────────────────────
const ROLES = {
  "Cuisinier":    { c:C.org, i:"👨‍🍳", profil:"cuisine",
    phases:["arrivee","hygiene","mep","service","cloture"],
    labels:{arrivee:"Arrivée",hygiene:"Hygiène HACCP",mep:"Mise en place",service:"Service",cloture:"Clôture"},
    tasks:{
      arrivee:[{id:"ca1",t:"Tenue réglementaire (veste, calot)",k:true},{id:"ca2",t:"Lavage mains 30 secondes",k:true},{id:"ca3",t:"Lecture bons de commande",k:false}],
      hygiene:[{id:"ch1",t:"Relevé T° frigo viandes",k:true,h:true},{id:"ch2",t:"Relevé T° frigo laitiers",k:true,h:true},{id:"ch3",t:"Relevé T° congélateur",k:true,h:true},{id:"ch4",t:"Vérification DLC produits frais",k:true,h:true},{id:"ch5",t:"Contrôle huile friteuse",k:true,h:true},{id:"ch6",t:"Désinfection plans de travail",k:true},{id:"ch7",t:"Étiquetage produits entamés",k:true,h:true}],
      mep:[], service:[{id:"cs1",t:"Poste opérationnel",k:false},{id:"cs2",t:"Four à température",k:true}],
      cloture:[{id:"cc1",t:"Dégraissage four et plaques",k:true},{id:"cc2",t:"Film alimentaire denrées",k:true},{id:"cc3",t:"Rangement frigos (crus en bas)",k:true},{id:"cc4",t:"Sol cuisine nettoyé",k:true},{id:"cc5",t:"Coupure gaz",k:true},{id:"cc6",t:"Fiche HACCP signée",k:true,h:true}],
    }},
  "Chef de rang": { c:C.blu, i:"🍷", profil:"salle",
    phases:["arrivee","hygiene","salle","service","cloture"],
    labels:{arrivee:"Arrivée",hygiene:"Hygiène",salle:"Mise en place salle",service:"Service",cloture:"Clôture"},
    tasks:{
      arrivee:[{id:"ra1",t:"Tenue vérifiée",k:false},{id:"ra2",t:"Réservations lues",k:true},{id:"ra3",t:"Allergènes du jour notés",k:true}],
      hygiene:[{id:"rh1",t:"Lavage mains",k:true},{id:"rh2",t:"Désinfection surfaces salle",k:true}],
      salle:[{id:"rs1",t:"Dressage tables",k:true},{id:"rs2",t:"Couverts polis en place",k:true},{id:"rs3",t:"Verres polis",k:true},{id:"rs4",t:"Condiments remplis",k:false},{id:"rs5",t:"Menus à jour",k:true},{id:"rs6",t:"WC clients approvisionnés",k:false}],
      service:[{id:"rsv",t:"Accueil clients en position",k:true}],
      cloture:[{id:"rc1",t:"Tables débarrassées",k:true},{id:"rc2",t:"Vaisselle plonge",k:false},{id:"rc3",t:"Ménage salle",k:true}],
    }},
  "Barman":       { c:C.pur, i:"🍸", profil:"salle",
    phases:["arrivee","hygiene","bar","service","cloture"],
    labels:{arrivee:"Arrivée",hygiene:"Hygiène",bar:"Mise en place bar",service:"Service",cloture:"Clôture"},
    tasks:{
      arrivee:[{id:"ba1",t:"Tenue vérifiée",k:false},{id:"ba2",t:"Inventaire boissons",k:true}],
      hygiene:[{id:"bh1",t:"Lavage mains",k:true},{id:"bh2",t:"Nettoyage bar",k:true}],
      bar:[{id:"bb1",t:"Frigo bar rempli",k:true},{id:"bb2",t:"Glaces en place",k:true},{id:"bb3",t:"Garnishes préparées",k:false},{id:"bb4",t:"Caisse bar vérifiée",k:true}],
      service:[{id:"bsv",t:"Poste opérationnel",k:false}],
      cloture:[{id:"bc1",t:"Inventaire alcools",k:true},{id:"bc2",t:"Nettoyage bar",k:true},{id:"bc3",t:"Caisse fermée",k:true}],
    }},
  "Plongeur":     { c:C.grn, i:"🧽", profil:"cuisine",
    phases:["arrivee","hygiene","plonge","service","cloture"],
    labels:{arrivee:"Arrivée",hygiene:"Hygiène",plonge:"Poste plonge",service:"Service",cloture:"Clôture"},
    tasks:{
      arrivee:[{id:"pa1",t:"Tablier et gants",k:false},{id:"pa2",t:"Eau chaude machine",k:true}],
      hygiene:[{id:"ph1",t:"Lavage mains",k:true},{id:"ph2",t:"Dosage lessive machine",k:true},{id:"ph3",t:"Filtres nettoyés",k:true}],
      plonge:[{id:"pp1",t:"Zones tri déchets ok",k:false},{id:"pp2",t:"Bacs rinçage prêts",k:true},{id:"pp3",t:"Poubelles vidées",k:true}],
      service:[{id:"psv",t:"Poste organisé",k:false}],
      cloture:[{id:"pc1",t:"Vaisselle lavée et rangée",k:true},{id:"pc2",t:"Machine vidée et séchée",k:true},{id:"pc3",t:"Sol plonge nettoyé",k:true},{id:"pc4",t:"Poubelles sorties",k:true}],
    }},
  "Manager":      { c:C.red, i:"📋", profil:"both",
    phases:["arrivee","briefing","controle","service","cloture"],
    labels:{arrivee:"Arrivée",briefing:"Briefing équipe",controle:"Contrôle",service:"Service",cloture:"Clôture"},
    tasks:{
      arrivee:[{id:"ma1",t:"Réservations lues",k:true},{id:"ma2",t:"Présence équipe vérifiée",k:true},{id:"ma3",t:"Caisse ouverte",k:true}],
      briefing:[{id:"mb1",t:"Plat du jour communiqué",k:true},{id:"mb2",t:"Allergènes communiqués",k:true},{id:"mb3",t:"Effectif confirmé",k:true}],
      controle:[{id:"mc1",t:"Mise en place salle OK",k:true},{id:"mc2",t:"Mise en place cuisine OK",k:true},{id:"mc3",t:"HACCP signées",k:true},{id:"mc4",t:"Extincteurs accessibles",k:true}],
      service:[{id:"msv",t:"Ouverture lancée",k:true}],
      cloture:[{id:"mcl1",t:"Rapport Z signé",k:true},{id:"mcl2",t:"Feuille service remplie",k:true},{id:"mcl3",t:"Alarme activée",k:true},{id:"mcl4",t:"Dernière ronde",k:true}],
    }},
};

// ─── PRODUITS INITIAUX ────────────────────────────────────────────
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
  {id:"d1",n:"Tartare de bœuf",cat:"Entrée",svc:["Déjeuner","Dîner"],r:0.35,c:[{id:"c1",l:"Filet haché",u:"g",pc:200,note:"Minute, +2°C"},{id:"c2",l:"Condiments",u:"g",pc:30,note:"Brunoise"},{id:"c3",l:"Pain toasté",u:"tr",pc:2,note:"Filmer"}]},
  {id:"d2",n:"Saumon mi-cuit",cat:"Entrée",svc:["Déjeuner","Dîner"],r:0.28,c:[{id:"c4",l:"Pavé saumon",u:"g",pc:120,note:"Assaisonner"},{id:"c5",l:"Crème citron",u:"cl",pc:5,note:"+4°C"}]},
  {id:"d3",n:"Sole meunière",cat:"Plat",svc:["Déjeuner","Dîner"],r:0.30,c:[{id:"c6",l:"Sole",u:"g",pc:400,note:"Lever filets"},{id:"c7",l:"Beurre clarifié",u:"g",pc:30,note:"Batch matin"},{id:"c8",l:"Pommes vapeur",u:"g",pc:150,note:"Tourner"}]},
  {id:"d4",n:"Fondant chocolat",cat:"Dessert",svc:["Déjeuner","Dîner"],r:0.40,c:[{id:"c9",l:"Appareil fondant",u:"unité",pc:1,note:"Surgeler veille"},{id:"c10",l:"Crème anglaise",u:"cl",pc:6,note:"+4°C"}]},
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
};

// ─── UTILITAIRES ──────────────────────────────────────────────────
const todayK = () => ["dim","lun","mar","mer","jeu","ven","sam"][new Date().getDay()];
const tnow = () => new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
const dnow = () => new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
const uid = () => Math.random().toString(36).slice(2,8);
const detSvc = s => { const h=new Date().getHours(); return h>=(s?.lS??10)&&h<(s?.lE??15)?"Déjeuner":h>=(s?.dS??17)?"Dîner":"Dîner"; };
const myProds = (prods, role) => { const p=ROLES[role]?.profil||"salle"; return p==="both"?prods:prods.filter(x=>x.p===p||x.p==="both"); };
const load = () => { try{const s=sessionStorage.getItem("emb7");if(s)return{...INIT,...JSON.parse(s)};}catch{} return INIT; };
const save = d => { try{sessionStorage.setItem("emb7",JSON.stringify(d));}catch{} };

// ─── ATOMS ────────────────────────────────────────────────────────
const Pill = ({c,s,children}) => <span style={{background:`${c}20`,color:c,border:`1px solid ${c}40`,padding:s?"1px 6px":"2px 9px",borderRadius:20,fontSize:s?10:11,fontWeight:700,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{children}</span>;

const Btn = ({onClick,children,v="p",sm,dis,full,col,icon}) => {
  const bg=v==="p"?(col||C.acc):v==="g"?"transparent":v==="d"?C.redD:C.card;
  const fg=v==="p"?(col?"#fff":"#08100f"):v==="d"?C.red:C.t1;
  const br=v==="g"?`1px solid ${C.border}`:v==="d"?`1px solid ${C.red}55`:"none";
  return <button onClick={onClick} disabled={dis} style={{background:bg,color:fg,border:br,padding:sm?"7px 13px":"11px 20px",borderRadius:10,fontWeight:700,fontSize:sm?12:14,cursor:dis?"not-allowed":"pointer",opacity:dis?.5:1,width:full?"100%":"auto",transition:"all .15s",display:"inline-flex",alignItems:"center",gap:6,flexShrink:0}}>{icon&&<span>{icon}</span>}{children}</button>;
};

const Box = ({children,style,glow,gc,onClick}) => <div onClick={onClick} style={{background:C.card,border:`1px solid ${glow?(gc||C.acc)+"55":C.border}`,borderRadius:14,padding:16,transition:"all .2s",cursor:onClick?"pointer":"default",...style}}>{children}</div>;

const Bar = ({v,max,c}) => <div style={{background:C.t4,borderRadius:4,height:5,overflow:"hidden"}}><div style={{width:`${max>0?Math.min(100,v/max*100):0}%`,height:"100%",background:c||C.acc,borderRadius:4,transition:"width .4s"}}/></div>;

const Ring = ({v,max,sz=48,sw=5,c}) => {
  const r=(sz-sw*2)/2,ci=2*Math.PI*r,pt=max>0?Math.min(1,v/max):0;
  return <svg width={sz} height={sz} style={{flexShrink:0}}><circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={C.t4} strokeWidth={sw}/><circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={c||C.acc} strokeWidth={sw} strokeDasharray={ci} strokeDashoffset={ci*(1-pt)} strokeLinecap="round" transform={`rotate(-90 ${sz/2} ${sz/2})`} style={{transition:"stroke-dashoffset .4s"}}/><text x={sz/2} y={sz/2+4} textAnchor="middle" fill={pt>=1?C.grn:C.t1} fontSize={10} fontWeight={800} fontFamily="'DM Mono',monospace">{Math.round(pt*100)}%</text></svg>;
};

const Tog = ({on,set,label,c}) => <div onClick={set} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",userSelect:"none"}}><div style={{width:34,height:20,borderRadius:10,background:on?(c||C.grn):C.t4,position:"relative",transition:"background .2s",flexShrink:0}}><div style={{position:"absolute",top:3,left:on?16:3,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/></div>{label&&<span style={{fontSize:12,color:C.t2,fontWeight:600}}>{label}</span>}</div>;

const FIn = ({label,val,set,type,ph}) => <div style={{marginBottom:8}}>
  {label&&<div style={{fontSize:10,color:C.t3,marginBottom:3,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{label}</div>}
  <input type={type||"text"} value={val} placeholder={ph||""} onChange={e=>set(e.target.value)} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 11px",color:C.t1,fontSize:13,outline:"none"}}/>
</div>;

// ─── CHECK ITEM ───────────────────────────────────────────────────
const CheckItem = ({task, done, onToggle}) => (
  <div onClick={onToggle} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 14px",background:done?C.grnG:"#141f2e",border:`1px solid ${done?C.grn+"44":C.border}`,borderRadius:10,cursor:"pointer",marginBottom:7,transition:"all .2s"}}>
    <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${done?C.grn:C.bB}`,background:done?C.grn:"transparent",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
      {done&&<span style={{color:"#08100f",fontSize:11,fontWeight:900}}>✓</span>}
    </div>
    <div style={{flex:1}}>
      <div style={{fontSize:14,color:done?C.t3:C.t1,textDecoration:done?"line-through":"none",lineHeight:1.35}}>{task.t}</div>
      <div style={{display:"flex",gap:4,marginTop:4}}>
        {task.k&&<Pill c={C.red} s>CRITIQUE</Pill>}
        {task.h&&<Pill c={C.org} s>HACCP</Pill>}
      </div>
    </div>
  </div>
);

// ─── MEP CHECKLIST ────────────────────────────────────────────────
const MepList = ({dishes, chks, tog, col}) => (
  <div>
    {dishes.length===0&&<div style={{textAlign:"center",padding:28,color:C.t3,fontSize:13}}>Aucun plat configuré pour ce service.</div>}
    {dishes.map(d=>{
      const done=d.subs.every(s=>chks[s.id]);
      const cnt=d.subs.filter(s=>chks[s.id]).length;
      return <Box key={d.id} style={{marginBottom:11}} glow={done} gc={C.grn}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9,paddingBottom:8,borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontWeight:800,fontSize:14,color:done?C.grn:C.t1}}>{d.l}</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span className="mono" style={{fontSize:20,fontWeight:800,color:done?C.grn:col}}>{d.pts}</span>
            <Pill c={done?C.grn:col}>{cnt}/{d.subs.length}</Pill>
          </div>
        </div>
        {d.subs.map(s=>(
          <div key={s.id} onClick={()=>tog(s.id)} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"8px 0",borderBottom:`1px solid ${C.border}20`,cursor:"pointer",opacity:chks[s.id]?.5:1,transition:"opacity .2s"}}>
            <div style={{width:18,height:18,borderRadius:5,flexShrink:0,marginTop:1,border:`2px solid ${chks[s.id]?C.grn:C.bB}`,background:chks[s.id]?C.grn:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {chks[s.id]&&<span style={{color:"#08100f",fontSize:10,fontWeight:900}}>✓</span>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:C.t1,textDecoration:chks[s.id]?"line-through":"none"}}>{s.l}</div>
              {s.note&&<div style={{fontSize:11,color:C.t3,fontStyle:"italic",marginTop:1}}>{s.note}</div>}
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div className="mono" style={{fontSize:15,fontWeight:800,color:chks[s.id]?C.grn:C.acc}}>{s.qty>999?`${(s.qty/1000).toFixed(1)}k`:s.qty}</div>
              <div className="mono" style={{fontSize:10,color:C.t3}}>{s.u}</div>
            </div>
          </div>
        ))}
      </Box>;
    })}
  </div>
);

// ─── STOCK ────────────────────────────────────────────────────────
const Stock = ({products,setData,role}) => {
  const my = myProds(products,role);
  const [cf,setCf] = useState("Tous");
  const cats = ["Tous",...new Set(my.map(p=>p.cat))];
  const shown = cf==="Tous"?my:my.filter(p=>p.cat===cf);
  const updQ = (id,d) => setData(prev=>({...prev,products:prev.products.map(p=>p.id===id?{...p,q:Math.max(0,+(p.q+d).toFixed(2))}:p)}));
  const togUrg = id => setData(prev=>({...prev,products:prev.products.map(p=>p.id===id?{...p,urg:!p.urg}:p)}));
  const alerts = my.filter(p=>p.q<p.m).length;
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
      <div><div style={{fontSize:17,fontWeight:800}}>📦 Stocks</div><div style={{fontSize:11,color:alerts>0?C.red:C.t3}}>{alerts} alerte(s) · {my.length} produits</div></div>
    </div>
    <div style={{display:"flex",gap:4,overflowX:"auto",marginBottom:12,paddingBottom:4,scrollbarWidth:"none"}}>
      {cats.map(c=><button key={c} onClick={()=>setCf(c)} style={{padding:"5px 10px",borderRadius:20,flexShrink:0,border:`1px solid ${cf===c?C.acc:C.border}`,background:cf===c?C.accG:"transparent",color:cf===c?C.acc:C.t3,cursor:"pointer",fontWeight:700,fontSize:11}}>{c}</button>)}
    </div>
    {shown.map(p=>{
      const al=p.q<p.m;
      return <Box key={p.id} style={{marginBottom:8,padding:"11px 13px"}} glow={p.urg||al} gc={p.urg?C.red:C.acc}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
          <div>
            <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontWeight:700,fontSize:13}}>{p.n}</span>
              {al&&<Pill c={C.red} s>ALERTE</Pill>}
              {p.urg&&<Pill c={C.red} s>🚨 URGENT</Pill>}
            </div>
            <div style={{fontSize:11,color:C.t3,marginTop:2}}>{p.cat}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <span className="mono" style={{fontSize:16,fontWeight:800,color:al?C.red:C.t1}}>{p.q}</span>
            <span style={{fontSize:10,color:C.t3,marginLeft:3}}>{p.u}</span>
            <div style={{fontSize:10,color:C.t3}}>min {p.m}</div>
          </div>
        </div>
        <Bar v={p.q} max={p.m*2} c={al?C.red:p.q/p.m>1.5?C.grn:C.acc}/>
        <div style={{display:"flex",gap:5,marginTop:9,alignItems:"center",flexWrap:"wrap"}}>
          {[-1,-.5,.5,1,5].map(d=><button key={d} onClick={()=>updQ(p.id,d)} style={{padding:"4px 8px",borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:d<0?C.red:C.grn,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{d>0?"+":""}{d}</button>)}
          <div style={{flex:1}}/>
          <Tog on={!!p.urg} set={()=>togUrg(p.id)} label="Urgent" c={C.red}/>
        </div>
      </Box>;
    })}
  </div>;
};

// ─── INVENTAIRE ───────────────────────────────────────────────────
const Inventaire = ({products,setData,role}) => {
  const my = myProds(products,role);
  const [vals,setVals] = useState(()=>Object.fromEntries(my.map(p=>[p.id,p.q])));
  const [ok,setOk] = useState(false);
  const [cf,setCf] = useState("Tous");
  const cats = ["Tous",...new Set(my.map(p=>p.cat))];
  const shown = cf==="Tous"?my:my.filter(p=>p.cat===cf);
  const below = my.filter(p=>(parseFloat(vals[p.id])??p.q)<p.m).length;
  const doSave = () => {
    setData(prev=>({...prev,products:prev.products.map(p=>vals[p.id]!==undefined?{...p,q:parseFloat(vals[p.id])||0}:p)}));
    setOk(true); setTimeout(()=>setOk(false),2500);
  };
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div><div style={{fontSize:17,fontWeight:800}}>📋 Inventaire</div><div style={{fontSize:11,color:below>0?C.red:C.t3}}>{below} sous seuil → liste de courses</div></div>
      <Btn onClick={doSave} col={C.grn} icon="💾" sm>{ok?"Sauvé ✓":"Valider"}</Btn>
    </div>
    {ok&&<div className="up" style={{padding:"9px 13px",background:C.grnG,border:`1px solid ${C.grn}44`,borderRadius:10,marginBottom:12,fontSize:12,color:C.grn,fontWeight:700}}>✅ Inventaire sauvegardé — produits sous seuil ajoutés aux courses</div>}
    <div style={{display:"flex",gap:4,overflowX:"auto",marginBottom:12,paddingBottom:4,scrollbarWidth:"none"}}>
      {cats.map(c=><button key={c} onClick={()=>setCf(c)} style={{padding:"5px 10px",borderRadius:20,flexShrink:0,border:`1px solid ${cf===c?C.acc:C.border}`,background:cf===c?C.accG:"transparent",color:cf===c?C.acc:C.t3,cursor:"pointer",fontWeight:700,fontSize:11}}>{c}</button>)}
    </div>
    {shown.map(p=>{
      const v=parseFloat(vals[p.id]??p.q), bl=v<p.m;
      return <Box key={p.id} style={{marginBottom:7,padding:"10px 13px"}} glow={bl} gc={C.red}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontWeight:700,fontSize:13}}>{p.n}</span>
              {bl&&<Pill c={C.red} s>↓ SEUIL</Pill>}
              {p.urg&&<Pill c={C.red} s>URGENT</Pill>}
            </div>
            <div style={{fontSize:11,color:C.t3,marginTop:2}}>min : <span className="mono" style={{color:bl?C.red:C.t2}}>{p.m} {p.u}</span></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <button onClick={()=>setVals(x=>({...x,[p.id]:Math.max(0,(parseFloat(x[p.id])||0)-1)}))} style={{width:28,height:28,borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:C.red,cursor:"pointer",fontSize:15,fontWeight:700}}>−</button>
            <input type="number" value={vals[p.id]??p.q} onChange={e=>setVals(x=>({...x,[p.id]:e.target.value}))} style={{width:60,textAlign:"center",background:bl?C.redD:C.bg,border:`1px solid ${bl?C.red:C.border}`,borderRadius:8,padding:"6px 4px",color:bl?C.red:C.t1,fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:700,outline:"none"}}/>
            <button onClick={()=>setVals(x=>({...x,[p.id]:(parseFloat(x[p.id])||0)+1}))} style={{width:28,height:28,borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:C.grn,cursor:"pointer",fontSize:15,fontWeight:700}}>+</button>
            <span className="mono" style={{fontSize:11,color:C.t3,width:20}}>{p.u}</span>
          </div>
        </div>
      </Box>;
    })}
  </div>;
};

// ─── PERTES ───────────────────────────────────────────────────────
const Pertes = ({products,losses,setData,profil,userName}) => {
  const my = products.filter(p=>p.p===profil||p.p==="both");
  const [sel,setSel]=useState(""); const [qty,setQty]=useState(""); const [rsn,setRsn]=useState("Perte"); const [urg,setUrg]=useState(false); const [ok,setOk]=useState(false);
  const mine = losses.filter(l=>l.prof===profil||l.prof==="both").slice(0,15);
  const declare = () => {
    if(!sel||!qty) return;
    const prod=products.find(x=>x.id===sel);
    const loss={id:uid(),date:new Date().toISOString(),pid:sel,pn:prod?.n||"?",qty:parseFloat(qty)||0,u:prod?.u||"",rsn,prof:profil,by:userName,urg};
    setData(prev=>({...prev,losses:[loss,...prev.losses],products:prev.products.map(p=>p.id===sel?{...p,q:Math.max(0,p.q-(parseFloat(qty)||0))}:p)}));
    setSel(""); setQty(""); setUrg(false); setOk(true); setTimeout(()=>setOk(false),2000);
  };
  const resolve = id => setData(prev=>({...prev,losses:prev.losses.map(l=>l.id===id?{...l,res:true}:l)}));
  return <div>
    <div style={{fontSize:17,fontWeight:800,marginBottom:4}}>🗑️ Pertes & Ruptures</div>
    <div style={{fontSize:11,color:C.t3,marginBottom:12}}>{mine.filter(l=>!l.res).length} déclaration(s) active(s)</div>
    <Box style={{marginBottom:14}}>
      <div style={{fontSize:13,fontWeight:700,color:C.acc,marginBottom:10}}>Nouvelle déclaration</div>
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:C.t3,marginBottom:3,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Produit</div>
        <select value={sel} onChange={e=>setSel(e.target.value)} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 11px",color:sel?C.t1:C.t3,fontSize:13,outline:"none"}}>
          <option value="">— Sélectionner —</option>
          {my.map(p=><option key={p.id} value={p.id}>{p.n} ({p.q} {p.u})</option>)}
        </select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <FIn label="Quantité" val={qty} set={setQty} type="number" ph="Ex: 2"/>
        <div>
          <div style={{fontSize:10,color:C.t3,marginBottom:3,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Motif</div>
          <select value={rsn} onChange={e=>setRsn(e.target.value)} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 11px",color:C.t1,fontSize:13,outline:"none"}}>
            {["Perte","Rupture de stock","DLC dépassée","Casse / bris","Autre"].map(r=><option key={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div style={{marginBottom:12}}><Tog on={urg} set={()=>setUrg(!urg)} label="Marquer urgent" c={C.red}/></div>
      <Btn onClick={declare} full dis={!sel||!qty} col={rsn==="Rupture de stock"?C.red:undefined} icon="📝">Déclarer</Btn>
      {ok&&<div style={{marginTop:8,fontSize:12,color:C.grn,fontWeight:700,textAlign:"center"}}>✅ Déclaré — stock mis à jour</div>}
    </Box>
    <div style={{fontSize:11,fontWeight:700,color:C.t4,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Historique</div>
    {mine.length===0&&<div style={{textAlign:"center",padding:20,color:C.t3,fontSize:12}}>Aucune déclaration</div>}
    {mine.map(l=><Box key={l.id} style={{marginBottom:7,padding:"10px 13px",opacity:l.res?.5:1}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontWeight:700,fontSize:13}}>{l.pn}</span>
            <Pill c={l.rsn==="Rupture de stock"?C.red:C.acc} s>{l.rsn}</Pill>
            {l.urg&&<Pill c={C.red} s>🚨</Pill>}
          </div>
          <div className="mono" style={{fontSize:12,color:C.red,marginTop:2}}>−{l.qty} {l.u}</div>
          <div style={{fontSize:10,color:C.t4,marginTop:2}}>{l.by} · {new Date(l.date).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</div>
        </div>
        {!l.res&&<Btn onClick={()=>resolve(l.id)} sm v="g" icon="✓">Résolu</Btn>}
      </div>
    </Box>)}
  </div>;
};

// ─── COURSES ──────────────────────────────────────────────────────
const Courses = ({products,losses,setData,role}) => {
  const my = myProds(products,role);
  const prof = ROLES[role]?.profil||"salle";
  const belowMin = my.filter(p=>p.q<p.m).map(p=>({id:`i_${p.id}`,pid:p.id,n:p.n,u:p.u,cat:p.cat,need:+(p.m-p.q+p.m*0.2).toFixed(2),src:"Inventaire",urg:p.urg}));
  const ruptures = losses.filter(l=>l.rsn==="Rupture de stock"&&!l.res&&(l.prof===prof||l.prof==="both")).map(l=>({id:`r_${l.id}`,pid:l.pid,n:l.pn,u:l.u,cat:"Rupture",need:l.qty,src:"Rupture",urg:true}));
  const all = [...ruptures,...belowMin.filter(b=>!ruptures.some(r=>r.pid===b.pid))];
  const [chk,setChk] = useState({});
  const markDone = pid => setData(prev=>({...prev,products:prev.products.map(p=>p.id===pid?{...p,q:p.m*1.3}:p),losses:prev.losses.map(l=>l.pid===pid?{...l,res:true}:l)}));
  const cats = [...new Set(all.filter(i=>!i.urg).map(i=>i.cat))];
  const CItem = ({item}) => <Box style={{marginBottom:7,padding:"10px 13px",opacity:chk[item.id]?.6:1}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div onClick={()=>setChk(x=>({...x,[item.id]:!x[item.id]}))} style={{width:20,height:20,borderRadius:5,flexShrink:0,border:`2px solid ${chk[item.id]?C.grn:C.bB}`,background:chk[item.id]?C.grn:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s"}}>
        {chk[item.id]&&<span style={{color:"#08100f",fontSize:10,fontWeight:900}}>✓</span>}
      </div>
      <div style={{flex:1}}>
        <div style={{display:"flex",gap:5,alignItems:"center"}}><span style={{fontWeight:700,fontSize:13,textDecoration:chk[item.id]?"line-through":"none",color:chk[item.id]?C.t3:C.t1}}>{item.n}</span>{item.urg&&<Pill c={C.red} s>🚨</Pill>}</div>
        <Pill c={item.src==="Rupture"?C.red:C.org} s>{item.src}</Pill>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div className="mono" style={{fontSize:15,fontWeight:800,color:item.urg?C.red:C.acc}}>{item.need}</div>
        <div className="mono" style={{fontSize:10,color:C.t3}}>{item.u}</div>
      </div>
    </div>
    {!chk[item.id]&&<div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${C.border}20`}}><Btn onClick={()=>markDone(item.pid)} sm v="g" full icon="✅">Marquer commandé</Btn></div>}
  </Box>;
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div><div style={{fontSize:17,fontWeight:800}}>🛒 Liste de courses</div><div style={{fontSize:11,color:C.t3}}>{all.length} produit(s) · {all.filter(i=>i.urg).length} urgent(s)</div></div>
    </div>
    {all.length===0&&<Box style={{textAlign:"center",padding:28}}><div style={{fontSize:28,marginBottom:8}}>✅</div><div style={{fontWeight:700,color:C.grn}}>Tout est approvisionné !</div></Box>}
    {all.filter(i=>i.urg).length>0&&<div style={{marginBottom:14}}><div style={{fontSize:11,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>🚨 URGENTS</div>{all.filter(i=>i.urg).map(i=><CItem key={i.id} item={i}/>)}</div>}
    {cats.map(cat=>{const items=all.filter(i=>i.cat===cat&&!i.urg);if(!items.length)return null;return<div key={cat} style={{marginBottom:14}}><div style={{fontSize:11,fontWeight:700,color:C.t4,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>{cat}</div>{items.map(i=><CItem key={i.id} item={i}/>)}</div>;})}
  </div>;
};

// ─── STAFF JOURNEY ────────────────────────────────────────────────
const Journey = ({user,data,setData,svc,covers}) => {
  const rc = ROLES[user.r]||ROLES["Manager"];
  const col = rc.c;
  const sk = `${todayK()}_${svc}_${user.id}`;
  const st = data.daily?.[sk]||{};
  const chks = st.chks||{};
  const [view,setView] = useState("journey");
  const [phase,setPhase] = useState(st.phase||rc.phases[0]);
  const [unlAnim,setUnlAnim] = useState(null);

  const setSt = upd => setData(prev=>({...prev,daily:{...prev.daily,[sk]:{...(prev.daily?.[sk]||{}),...upd}}}));
  const tog = id => setSt({chks:{...chks,[id]:!chks[id]}});

  const getMep = () => (data.dishes||[]).filter(d=>d.svc.includes(svc)).map(d=>({
    id:`m_${d.id}`, l:d.n, pts:Math.ceil(covers*d.r),
    subs:d.c.map(c=>({id:`m_${d.id}_${c.id}`,l:c.l,qty:Math.ceil(covers*d.r*c.pc),u:c.u,note:c.note}))
  }));

  const getTasks = p => p==="mep"?getMep():(rc.tasks[p]||[]);
  const getPct = p => {
    if(p==="mep"){const t=getMep().flatMap(d=>d.subs);return t.length?t.filter(x=>chks[x.id]).length/t.length:1;}
    const t=rc.tasks[p]||[];return t.length?t.filter(x=>chks[x.id]).length/t.length:1;
  };
  const pOk = p => getPct(p)>=1;
  const unlocked = p => {const i=rc.phases.indexOf(p);return i===0||pOk(rc.phases[i-1]);};
  const advance = p => {
    const i=rc.phases.indexOf(p), nx=rc.phases[i+1];
    if(nx){setSt({phase:nx});setPhase(nx);setUnlAnim(nx);setTimeout(()=>setUnlAnim(null),700);}
  };

  const oPct = Math.round(rc.phases.reduce((s,p)=>s+getPct(p),0)/rc.phases.length*100);
  const allDone = rc.phases.every(p=>pOk(p));
  const curTasks = getTasks(phase);
  const curDone = phase==="mep"?curTasks.flatMap(d=>d.subs).filter(s=>chks[s.id]).length:curTasks.filter(t=>chks[t.id]).length;
  const curTot = phase==="mep"?curTasks.flatMap(d=>d.subs).length:curTasks.length;
  const myP = myProds(data.products||[],user.r);
  const alertN = myP.filter(p=>p.q<p.m).length;
  const prof = rc.profil;
  const rupN = (data.losses||[]).filter(l=>l.rsn==="Rupture de stock"&&!l.res&&(l.prof===prof||l.prof==="both")).length;
  const coursN = alertN+rupN;

  const VIEWS = [
    {id:"journey",l:"🗓 Service"},
    {id:"stock",l:"📦 Stocks",b:alertN>0?alertN:null},
    {id:"inventaire",l:"📋 Inventaire"},
    {id:"pertes",l:"🗑 Pertes",b:rupN>0?rupN:null},
    {id:"courses",l:"🛒 Courses",b:coursN>0?coursN:null},
  ];

  return <div style={{minHeight:"100vh",background:C.bg}}>
    {/* HEADER */}
    <div style={{background:"#0d1520",borderBottom:`1px solid ${C.border}`,padding:"11px 15px",position:"sticky",top:0,zIndex:20}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:`${col}18`,border:`1.5px solid ${col}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{rc.i}</div>
        <div style={{flex:1}}><div style={{fontWeight:800,fontSize:14}}>{user.n}</div><div style={{fontSize:11,color:col,fontWeight:600}}>{user.r}</div></div>
        <Pill c={svc==="Déjeuner"?C.acc:C.pur}>{svc}</Pill>
        {view==="journey"&&<Ring v={oPct} max={100} c={allDone?C.grn:col} sz={42} sw={4}/>}
      </div>
      {view==="journey"&&<div style={{display:"flex",gap:4,marginTop:10}}>
        {rc.phases.map(p=>{const d=pOk(p),a=p===phase,lk=!unlocked(p);return<div key={p} onClick={()=>!lk&&setPhase(p)} style={{flex:1,height:4,borderRadius:4,cursor:lk?"not-allowed":"pointer",background:d?C.grn:a?col:C.t4,opacity:lk&&!d?.3:1,transition:"all .3s"}} title={rc.labels[p]}/>;})}</div>}
    </div>

    {/* NAV */}
    <div style={{display:"flex",gap:4,overflowX:"auto",padding:"9px 13px 0",borderBottom:`1px solid ${C.border}20`,scrollbarWidth:"none"}}>
      {VIEWS.map(v=><button key={v.id} onClick={()=>setView(v.id)} style={{display:"flex",alignItems:"center",gap:4,padding:"7px 11px",borderRadius:10,flexShrink:0,border:`1px solid ${view===v.id?col:C.border}`,background:view===v.id?`${col}18`:"transparent",color:view===v.id?col:C.t2,cursor:"pointer",fontWeight:700,fontSize:11,whiteSpace:"nowrap"}}>
        {v.l}{v.b!=null&&<span style={{background:C.red,color:"#fff",borderRadius:10,fontSize:9,fontWeight:800,padding:"1px 5px",fontFamily:"'DM Mono',monospace"}}>{v.b}</span>}
      </button>)}
    </div>

    {/* CONTENT */}
    <div style={{padding:15,paddingBottom:80}} className="up">
      {view==="stock"&&<Stock products={data.products||[]} setData={setData} role={user.r}/>}
      {view==="inventaire"&&<Inventaire products={data.products||[]} setData={setData} role={user.r}/>}
      {view==="pertes"&&<Pertes products={data.products||[]} losses={data.losses||[]} setData={setData} profil={prof} userName={user.n}/>}
      {view==="courses"&&<Courses products={data.products||[]} losses={data.losses||[]} setData={setData} role={user.r}/>}
      {view==="journey"&&<>
        {/* Phase tabs */}
        <div style={{display:"flex",gap:4,overflowX:"auto",marginBottom:14,paddingBottom:4,scrollbarWidth:"none"}}>
          {rc.phases.map(p=>{const d=pOk(p),a=p===phase,lk=!unlocked(p);return<button key={p} onClick={()=>!lk&&setPhase(p)} style={{display:"flex",alignItems:"center",gap:3,padding:"6px 11px",borderRadius:10,flexShrink:0,border:`1px solid ${a?col:d?C.grn+"44":C.border}`,background:a?`${col}18`:d?C.grnG:"transparent",color:a?col:d?C.grn:lk?C.t4:C.t2,cursor:lk?"not-allowed":"pointer",fontWeight:700,fontSize:11,animation:unlAnim===p?"up .4s ease":""}}>{d?"✓":lk?"🔒":""} {rc.labels[p]}</button>;})}
        </div>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div><div style={{fontSize:18,fontWeight:800}}>{rc.labels[phase]}</div><div style={{fontSize:11,color:C.t3,marginTop:2}}>{dnow()}</div></div>
          <Ring v={curDone} max={curTot||1} c={getPct(phase)>=1?C.grn:col} sz={50} sw={5}/>
        </div>

        {!unlocked(phase)&&<Box style={{marginBottom:14,textAlign:"center",padding:20}}>
          <div style={{fontSize:24,marginBottom:6}}>🔒</div>
          <div style={{fontWeight:800,color:C.red}}>Phase verrouillée</div>
          <div style={{fontSize:12,color:C.t2,marginTop:5}}>Complétez d'abord : <strong style={{color:C.acc}}>{rc.labels[rc.phases[rc.phases.indexOf(phase)-1]]}</strong></div>
        </Box>}

        {unlocked(phase)&&(phase==="mep"
          ?<MepList dishes={curTasks} chks={chks} tog={tog} col={col}/>
          :<div>{curTasks.map(t=><CheckItem key={t.id} task={t} done={!!chks[t.id]} onToggle={()=>tog(t.id)}/>)}</div>
        )}

        {unlocked(phase)&&pOk(phase)&&rc.phases.indexOf(phase)<rc.phases.length-1&&<div className="up" style={{marginTop:16}}>
          <div style={{padding:"12px 15px",background:C.grnG,border:`1px solid ${C.grn}40`,borderRadius:12,display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:20}}>✅</span>
            <div><div style={{fontWeight:800,fontSize:14,color:C.grn}}>Phase terminée !</div><div style={{fontSize:12,color:C.t2}}>{rc.labels[rc.phases[rc.phases.indexOf(phase)+1]]} débloquée</div></div>
          </div>
          <Btn onClick={()=>advance(phase)} full col={col} icon="→">Passer à : {rc.labels[rc.phases[rc.phases.indexOf(phase)+1]]}</Btn>
        </div>}

        {allDone&&<div className="up" style={{marginTop:18,padding:22,borderRadius:16,textAlign:"center",background:`${col}12`,border:`1.5px solid ${col}44`}}>
          <div style={{fontSize:38,marginBottom:8}}>{rc.i}</div>
          <div style={{fontSize:18,fontWeight:800,color:col}}>Service terminé !</div>
          <div style={{fontSize:13,color:C.t2,marginTop:4}}>Toutes les phases complétées pour le {svc}</div>
        </div>}
      </>}
    </div>
  </div>;
};

// ─── LOGIN ────────────────────────────────────────────────────────
const Login = ({staff,onLogin,svc,setSvc,settings}) => {
  const [sel,setSel]=useState(null); const [pin,setPin]=useState(""); const [err,setErr]=useState(""); const [apw,setApw]=useState("");
  const cvr=settings.cvr[todayK()]||0;
  const auto=detSvc(settings);
  const aff=cvr>=100?{l:"Forte affluence 🔴",c:C.red}:cvr>=70?{l:"Affluence moyenne 🟠",c:C.acc}:{l:"Service calme 🟢",c:C.grn};
  const tryLogin=()=>{
    if(sel===0){if(apw===""||apw==="admin"){onLogin({id:0,n:"Admin",r:"Manager",admin:true});return;}setErr("Mot de passe incorrect");return;}
    const m=staff.find(s=>s.id===sel);
    if(m&&(m.pin===pin||pin==="")){onLogin(m);setErr("");}else{setErr("PIN incorrect");setPin("");}
  };
  return <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:C.bg}}>
    <div style={{padding:"28px 20px 14px",textAlign:"center"}}>
      <div style={{fontSize:30,fontWeight:800,color:C.acc,letterSpacing:-1}}>L'Embouchure</div>
      <div style={{fontSize:12,color:C.t3,marginTop:4}}>Système opérationnel</div>
      <div className="mono" style={{fontSize:11,color:C.t4,marginTop:4}}>{dnow()} · {tnow()}</div>
    </div>
    <div style={{padding:"0 15px 13px"}}>
      <Box style={{padding:12}}>
        <div style={{fontSize:10,fontWeight:700,color:C.t4,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,textAlign:"center"}}>Service actif</div>
        <div style={{display:"flex",gap:5,marginBottom:10}}>
          {["Déjeuner","Dîner","Brunch"].map(s=><button key={s} onClick={()=>setSvc(s)} style={{flex:1,padding:"9px 3px",borderRadius:10,border:`1px solid ${svc===s?(s==="Déjeuner"?C.acc:s==="Dîner"?C.pur:C.blu):C.border}`,background:svc===s?`${s==="Déjeuner"?C.acc:s==="Dîner"?C.pur:C.blu}18`:"transparent",color:svc===s?(s==="Déjeuner"?C.acc:s==="Dîner"?C.pur:C.blu):C.t3,cursor:"pointer",fontWeight:700,fontSize:11}}>{s}{s===auto&&<span style={{fontSize:9,opacity:.5}}> auto</span>}</button>)}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <span style={{fontSize:12,color:aff.c,fontWeight:700}}>{aff.l}</span>
          <span className="mono" style={{fontSize:14,color:C.t1,fontWeight:800}}>{cvr} couverts</span>
        </div>
        <Bar v={cvr} max={150} c={aff.c}/>
      </Box>
    </div>
    <div style={{flex:1,padding:"0 15px",overflowY:"auto"}}>
      {!sel?<>
        <div style={{fontSize:11,fontWeight:700,color:C.t4,textTransform:"uppercase",letterSpacing:2,marginBottom:9}}>Qui êtes-vous ?</div>
        {staff.filter(s=>s.on).map(s=>{const rc=ROLES[s.r];return<Box key={s.id} onClick={()=>setSel(s.id)} style={{marginBottom:7,display:"flex",alignItems:"center",gap:11,cursor:"pointer",padding:"12px 13px"}}>
          <div style={{width:42,height:42,borderRadius:12,flexShrink:0,background:`${rc?.c||C.acc}18`,border:`1.5px solid ${rc?.c||C.acc}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{rc?.i||"👤"}</div>
          <div style={{flex:1}}><div style={{fontWeight:800,fontSize:14}}>{s.n}</div><div style={{fontSize:12,color:rc?.c||C.t2,fontWeight:600,marginTop:1}}>{s.r}</div></div>
          <div style={{color:C.t3,fontSize:18}}>›</div>
        </Box>;})}
        <div style={{marginTop:13,textAlign:"center",paddingBottom:18}}>
          <button onClick={()=>setSel(0)} style={{background:"none",border:"none",color:C.t4,cursor:"pointer",fontSize:12,textDecoration:"underline"}}>Accès administrateur</button>
        </div>
      </>:<div className="up">
        {sel===0?<>
          <div style={{textAlign:"center",marginBottom:14}}><div style={{fontSize:30,marginBottom:5}}>🔐</div><div style={{fontWeight:800,fontSize:16,color:C.red}}>Admin</div></div>
          <input type="password" value={apw} onChange={e=>setApw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryLogin()} placeholder="Mot de passe admin (admin)" style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.t1,fontSize:14,outline:"none",marginBottom:9}}/>
        </>:(()=>{const m=staff.find(s=>s.id===sel),rc=ROLES[m?.r];return<>
          <div style={{textAlign:"center",marginBottom:14}}><div style={{fontSize:44,marginBottom:7}}>{rc?.i}</div><div style={{fontWeight:800,fontSize:18}}>{m?.n}</div><div style={{fontSize:13,color:rc?.c,fontWeight:600,marginTop:2}}>{m?.r}</div></div>
          <div style={{display:"flex",justifyContent:"center",gap:13,marginBottom:14}}>{[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:pin.length>i?C.acc:C.t4,transition:"all .2s"}}/>)}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:9}}>
            {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=><button key={i} onClick={()=>{if(k==="⌫")setPin(p=>p.slice(0,-1));else if(k!=="")setPin(p=>p.length<4?p+k:p);}} style={{padding:"13px",borderRadius:11,border:`1px solid ${C.border}`,background:k===""?"transparent":C.card,color:C.t1,fontSize:18,fontWeight:700,cursor:k===""?"default":"pointer",opacity:k===""?0:1}}>{k}</button>)}
          </div>
        </>;})()}
        {err&&<div style={{color:C.red,fontSize:12,textAlign:"center",marginBottom:7}}>{err}</div>}
        <div style={{display:"flex",gap:7}}><Btn onClick={()=>{setSel(null);setPin("");setErr("");setApw("");}} v="g" full>Retour</Btn><Btn onClick={tryLogin} full>Connexion →</Btn></div>
        {sel!==0&&<div style={{fontSize:11,color:C.t4,textAlign:"center",marginTop:7}}>Laisser vide = accès sans PIN</div>}
      </div>}
    </div>
  </div>;
};

// ─── ADMIN ────────────────────────────────────────────────────────
const Admin = ({data,setData,svc,covers,onLogout}) => {
  const [tab,setTab]=useState("vue");
  const dk=todayK();
  const TABS=[{id:"vue",l:"📊 Vue"},{id:"produits",l:"🗂️ Produits"},{id:"courses",l:"🛒 Courses"},{id:"pertes",l:"🗑 Pertes"},{id:"equipe",l:"👥 Équipe"},{id:"config",l:"⚙️ Config"}];

  // Overview
  const sp=data.staff.filter(s=>s.on).map(s=>{
    const rc=ROLES[s.r];if(!rc)return null;
    const chks=data.daily?.[`${dk}_${svc}_${s.id}`]?.chks||{};
    let tot=0,dn=0;
    rc.phases.forEach(p=>{if(p==="mep")return;const t=rc.tasks[p]||[];tot+=t.length;dn+=t.filter(x=>chks[x.id]).length;});
    return{...s,pct:tot>0?Math.round(dn/tot*100):0,dn,tot,rc};
  }).filter(Boolean);
  const low=(data.products||[]).filter(p=>p.q<p.m);
  const urg=(data.products||[]).filter(p=>p.urg&&p.q<p.m);

  // Produits state
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

  // Config state
  const s=data.settings;
  const upd=(k,v)=>setData(prev=>({...prev,settings:{...prev.settings,[k]:v}}));
  const updC=(d,v)=>setData(prev=>({...prev,settings:{...prev.settings,cvr:{...prev.settings.cvr,[d]:parseInt(v)||0}}}));

  // Equipe state
  const [ef,setEf]=useState({n:"",r:"Cuisinier",pin:""});
  const addE=()=>{if(!ef.n)return;setData(prev=>({...prev,staff:[...prev.staff,{...ef,id:Date.now(),on:true}]}));setEf({n:"",r:"Cuisinier",pin:""});};

  return <div style={{minHeight:"100vh",background:C.bg}}>
    <div style={{background:"#0d1520",borderBottom:`1px solid ${C.border}`,padding:"12px 15px",position:"sticky",top:0,zIndex:20}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:15,fontWeight:800,color:C.acc}}>{data.settings.name}</div><div style={{fontSize:11,color:C.t3}}>{dnow()} · {svc} · {covers} cov.</div></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}><div style={{width:8,height:8,borderRadius:"50%",background:C.red}} className="pulse"/><button onClick={onLogout} style={{background:C.redD,border:`1px solid ${C.red}33`,color:C.red,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>Déco.</button></div>
      </div>
    </div>
    <div style={{display:"flex",gap:3,overflowX:"auto",padding:"9px 12px",borderBottom:`1px solid ${C.border}`,scrollbarWidth:"none"}}>
      {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 10px",borderRadius:10,flexShrink:0,border:`1px solid ${tab===t.id?C.acc:C.border}`,background:tab===t.id?C.accG:"transparent",color:tab===t.id?C.acc:C.t2,cursor:"pointer",fontWeight:700,fontSize:11,whiteSpace:"nowrap"}}>{t.l}</button>)}
    </div>
    <div style={{padding:15,paddingBottom:60}} className="up">

      {tab==="vue"&&<div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
          {[{i:"🍽️",v:covers,l:"Couverts",c:C.acc},{i:"🚨",v:urg.length,l:"Urgents",c:urg.length>0?C.red:C.grn},{i:"📦",v:low.length,l:"Alertes",c:low.length>0?C.red:C.grn}].map(k=><Box key={k.l} style={{textAlign:"center",padding:"11px 7px"}} glow={k.v>0&&k.c===C.red} gc={C.red}><div style={{fontSize:20}}>{k.i}</div><div className="mono" style={{fontSize:22,fontWeight:800,color:k.c}}>{k.v}</div><div style={{fontSize:10,color:C.t3,marginTop:2}}>{k.l}</div></Box>)}
        </div>
        {urg.length>0&&<Box style={{marginBottom:12}} glow gc={C.red}><div style={{fontSize:12,fontWeight:800,color:C.red,marginBottom:7}}>🚨 Urgents à commander</div>{urg.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:12}}><span style={{color:C.t1,fontWeight:600}}>{p.n}</span><span className="mono" style={{color:C.red}}>{p.q}/{p.m} {p.u}</span></div>)}</Box>}
        <div style={{fontSize:11,fontWeight:700,color:C.t4,textTransform:"uppercase",letterSpacing:2,marginBottom:9}}>Avancement équipe — {svc}</div>
        {sp.map(s=><Box key={s.id} style={{marginBottom:7,padding:"11px 13px"}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:34,height:34,borderRadius:10,flexShrink:0,background:`${s.rc.c}18`,border:`1.5px solid ${s.rc.c}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{s.rc.i}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><span style={{fontWeight:700,fontSize:13}}>{s.n}</span><span className="mono" style={{fontSize:12,color:s.pct===100?C.grn:s.rc.c}}>{s.pct}%</span></div>
              <Bar v={s.dn} max={s.tot} c={s.pct===100?C.grn:s.rc.c}/>
            </div>
          </div>
        </Box>)}
        <div style={{fontSize:11,fontWeight:700,color:C.t4,textTransform:"uppercase",letterSpacing:2,margin:"16px 0 9px"}}>Couverts semaine</div>
        <Box>{Object.entries(data.settings.cvr).map(([d,c])=>{const iT=d===dk,af=c>=100?C.red:c>=70?C.acc:C.grn;return<div key={d} style={{display:"flex",alignItems:"center",gap:9,marginBottom:7}}><div className="mono" style={{width:27,fontSize:11,color:iT?C.acc:C.t3,fontWeight:iT?800:400}}>{d.toUpperCase()}</div><div style={{flex:1}}><Bar v={c} max={150} c={iT?C.acc:af}/></div><div className="mono" style={{fontSize:12,color:iT?C.acc:C.t2,width:38,textAlign:"right",fontWeight:iT?800:400}}>{c}</div></div>;})}</Box>
      </div>}

      {tab==="produits"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div><div style={{fontSize:17,fontWeight:800}}>🗂️ Produits</div><div style={{fontSize:11,color:C.t3}}>{prods.length} produits</div></div><Btn onClick={()=>setShowA(!showA)} sm icon="＋">Ajouter</Btn></div>
        <div style={{display:"flex",gap:4,marginBottom:9,flexWrap:"wrap"}}>{["Tous","cuisine","salle","both"].map(p=><button key={p} onClick={()=>setPf(p)} style={{padding:"5px 10px",borderRadius:20,flexShrink:0,border:`1px solid ${pf===p?C.acc:C.border}`,background:pf===p?C.accG:"transparent",color:pf===p?C.acc:C.t3,cursor:"pointer",fontWeight:700,fontSize:11}}>{p==="Tous"?"Tous":PL[p]}</button>)}</div>
        <div style={{display:"flex",gap:4,overflowX:"auto",marginBottom:12,paddingBottom:4,scrollbarWidth:"none"}}>{cats.map(c=><button key={c} onClick={()=>setCf(c)} style={{padding:"5px 9px",borderRadius:20,flexShrink:0,border:`1px solid ${cf===c?C.blu:C.border}`,background:cf===c?`${C.blu}20`:"transparent",color:cf===c?C.blu:C.t3,cursor:"pointer",fontWeight:700,fontSize:11}}>{c}</button>)}</div>
        {showA&&<Box style={{marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:C.acc,marginBottom:10}}>Nouveau produit</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:7}}>
            <FIn label="Nom" val={form.n} set={v=>setForm(p=>({...p,n:v}))} ph="Crème fraîche"/>
            <FIn label="Unité" val={form.u} set={v=>setForm(p=>({...p,u:v}))} ph="kg, L…"/>
            <FIn label="Qté actuelle" val={form.q} set={v=>setForm(p=>({...p,q:v}))} type="number"/>
            <FIn label="Seuil minimum" val={form.m} set={v=>setForm(p=>({...p,m:v}))} type="number"/>
            <FIn label="Catégorie" val={form.cat} set={v=>setForm(p=>({...p,cat:v}))} ph="Viande, Boisson…"/>
          </div>
          <div style={{marginBottom:9}}>
            <div style={{fontSize:10,color:C.t3,marginBottom:5,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Profil utilisateur</div>
            <div style={{display:"flex",gap:5}}>{["cuisine","salle","both"].map(pr=><button key={pr} onClick={()=>setForm(p=>({...p,p:pr}))} style={{flex:1,padding:"7px 3px",borderRadius:8,border:`1px solid ${form.p===pr?C.acc:C.border}`,background:form.p===pr?C.accG:"transparent",color:form.p===pr?C.acc:C.t3,cursor:"pointer",fontWeight:700,fontSize:10}}>{PL[pr]}</button>)}</div>
          </div>
          <div style={{marginBottom:10}}><Tog on={form.urg} set={()=>setForm(p=>({...p,urg:!p.urg}))} label="Produit urgent 🚨" c={C.red}/></div>
          <Btn onClick={saveP} full dis={!form.n||!form.u} icon="＋">Ajouter le produit</Btn>
        </Box>}
        {shown.map(p=>{const al=p.q<p.m,ed=editId===p.id;return<Box key={p.id} style={{marginBottom:7,padding:"11px 13px"}} glow={p.urg&&al} gc={C.red}>
          {ed?<div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:7}}>
              <FIn label="Nom" val={p.n} set={v=>updP(p.id,"n",v)}/>
              <FIn label="Catégorie" val={p.cat} set={v=>updP(p.id,"cat",v)}/>
              <FIn label="Actuel" val={p.q} set={v=>updP(p.id,"q",v)} type="number"/>
              <FIn label="Minimum" val={p.m} set={v=>updP(p.id,"m",v)} type="number"/>
              <FIn label="Unité" val={p.u} set={v=>updP(p.id,"u",v)}/>
              <div><div style={{fontSize:10,color:C.t3,marginBottom:4,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Profil</div><select value={p.p} onChange={e=>updP(p.id,"p",e.target.value)} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",color:C.t1,fontSize:12,outline:"none"}}><option value="cuisine">Cuisine</option><option value="salle">Salle</option><option value="both">Les deux</option></select></div>
            </div>
            <div style={{marginBottom:9}}><Tog on={!!p.urg} set={()=>updP(p.id,"urg",!p.urg)} label="Urgent 🚨" c={C.red}/></div>
            <Btn onClick={()=>setEditId(null)} full sm>Valider</Btn>
          </div>:<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
              <div>
                <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}><span style={{fontWeight:700,fontSize:13}}>{p.n}</span>{al&&<Pill c={C.red} s>ALERTE</Pill>}{p.urg&&<Pill c={C.red} s>🚨</Pill>}</div>
                <div style={{display:"flex",gap:4,marginTop:3}}><Pill c={p.p==="cuisine"?C.org:p.p==="salle"?C.blu:C.pur} s>{PL[p.p]}</Pill><Pill c={C.t3} s>{p.cat}</Pill></div>
              </div>
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                <span className="mono" style={{fontSize:13,fontWeight:800,color:al?C.red:C.t1}}>{p.q}<span style={{fontSize:10,color:C.t3}}>{p.u}</span></span>
                <Btn onClick={()=>setEditId(p.id)} sm v="g">✏️</Btn>
                <Btn onClick={()=>remP(p.id)} sm v="d">✕</Btn>
              </div>
            </div>
            <Bar v={p.q} max={p.m*2} c={al?C.red:p.q/p.m>1.5?C.grn:C.acc}/>
            <div style={{fontSize:10,color:C.t3,marginTop:3}}>Seuil : {p.m} {p.u}</div>
          </div>}
        </Box>;})}
      </div>}

      {tab==="courses"&&<Courses products={data.products||[]} losses={data.losses||[]} setData={setData} role="Manager"/>}
      {tab==="pertes"&&<Pertes products={data.products||[]} losses={data.losses||[]} setData={setData} profil="both" userName="Admin"/>}

      {tab==="equipe"&&<div>
        <div style={{fontSize:17,fontWeight:800,marginBottom:12}}>👥 Équipe</div>
        <Box style={{marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:C.acc,marginBottom:9}}>Ajouter un membre</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:7}}>
            <FIn label="Nom" val={ef.n} set={v=>setEf(p=>({...p,n:v}))}/>
            <FIn label="PIN" val={ef.pin} set={v=>setEf(p=>({...p,pin:v}))} type="password"/>
            <div style={{gridColumn:"span 2"}}><div style={{fontSize:10,color:C.t3,marginBottom:3,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Rôle</div><select value={ef.r} onChange={e=>setEf(p=>({...p,r:e.target.value}))} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",color:C.t1,fontSize:13,outline:"none"}}>{Object.keys(ROLES).map(r=><option key={r}>{r}</option>)}</select></div>
          </div>
          <Btn onClick={addE} full icon="＋" dis={!ef.n}>Ajouter</Btn>
        </Box>
        {data.staff.map(s=>{const rc=ROLES[s.r];return<Box key={s.id} style={{marginBottom:7,padding:"11px 13px",display:"flex",alignItems:"center",gap:9,opacity:s.on?1:.5}}>
          <div style={{width:34,height:34,borderRadius:10,flexShrink:0,background:`${rc?.c||C.acc}18`,border:`1.5px solid ${rc?.c||C.acc}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{rc?.i||"👤"}</div>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{s.n}</div><div style={{fontSize:11,color:rc?.c||C.t2,fontWeight:600}}>{s.r}</div></div>
          <div style={{display:"flex",gap:5}}>
            <Btn onClick={()=>setData(prev=>({...prev,staff:prev.staff.map(x=>x.id===s.id?{...x,on:!x.on}:x)}))} sm v="g">{s.on?"Pause":"Activer"}</Btn>
            <Btn onClick={()=>setData(prev=>({...prev,staff:prev.staff.filter(x=>x.id!==s.id)}))} sm v="d">✕</Btn>
          </div>
        </Box>;})}
      </div>}

      {tab==="config"&&<div>
        <div style={{fontSize:17,fontWeight:800,marginBottom:12}}>⚙️ Configuration</div>
        <Box style={{marginBottom:14}}>
          <FIn label="Nom du restaurant" val={s.name} set={v=>upd("name",v)}/>
          <div style={{fontSize:13,fontWeight:700,color:C.acc,marginBottom:9,marginTop:4}}>Détection automatique des services</div>
          {[{l:"Déjeuner commence",k:"lS"},{l:"Déjeuner se termine",k:"lE"},{l:"Dîner commence",k:"dS"}].map(f=><div key={f.k} style={{marginBottom:11}}><div style={{fontSize:10,color:C.t3,marginBottom:3,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{f.l}</div><div style={{display:"flex",alignItems:"center",gap:7}}><input type="range" min={0} max={24} value={s[f.k]} onChange={e=>upd(f.k,parseInt(e.target.value))}/><span className="mono" style={{fontSize:12,color:C.acc,width:28}}>{String(s[f.k]).padStart(2,"0")}h</span></div></div>)}
        </Box>
        <Box>
          <div style={{fontSize:13,fontWeight:700,color:C.acc,marginBottom:9}}>Couverts par jour</div>
          {Object.entries(s.cvr).map(([d,c])=><div key={d} style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}><div className="mono" style={{width:27,fontSize:11,color:C.t3,fontWeight:700}}>{d.toUpperCase()}</div><input type="range" min={0} max={200} value={c} onChange={e=>updC(d,e.target.value)}/><div className="mono" style={{fontSize:12,color:C.t1,width:46,textAlign:"right"}}>{c} cov</div></div>)}
        </Box>
      </div>}
    </div>
  </div>;
};

// ─── ROOT ─────────────────────────────────────────────────────────
export default function App() {
  const [data,setRaw] = useState(load);
  const [user,setUser] = useState(null);
  const [svc,setSvc] = useState(() => detSvc(load().settings));
  const setData = useCallback(upd => setRaw(prev => {
    const next = typeof upd==="function"?upd(prev):upd;
    save(next); return next;
  }),[]);
  const covers = data.settings.cvr[todayK()]||0;
  return <>
    <style>{css}</style>
    {!user
      ? <Login staff={data.staff} onLogin={setUser} svc={svc} setSvc={setSvc} settings={data.settings}/>
      : user.admin||user.r==="Manager"
        ? <Admin data={data} setData={setData} svc={svc} covers={covers} onLogout={()=>setUser(null)}/>
        : <Journey user={user} data={data} setData={setData} svc={svc} covers={covers}/>
    }
  </>;
}
