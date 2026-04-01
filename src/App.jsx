import { useState, useEffect, useCallback, useRef } from "react";
import { db, cols, logAction, onSnapshot, query, orderBy, limit, getDocs, getDoc, setDoc, updateDoc, addDoc, deleteDoc, serverTimestamp } from "./firebase.js";

// ═══════════════════════════════════════════════════════
// DESIGN SYSTEM — thème clair moderne
// ═══════════════════════════════════════════════════════
const T = {
  bg:"#F1F5F9", surface:"#FFFFFF", card:"#FFFFFF", cardAlt:"#F8FAFC",
  border:"#E2E8F0", borderB:"#CBD5E1",
  acc:"#2563EB", accL:"#EFF6FF", accD:"#1D4ED8",
  grn:"#16A34A", grnL:"#F0FDF4", grnB:"#86EFAC",
  red:"#DC2626", redL:"#FEF2F2", redB:"#FECACA",
  org:"#EA580C", orgL:"#FFF7ED",
  yel:"#D97706", yelL:"#FFFBEB",
  pur:"#7C3AED", purL:"#F5F3FF",
  t1:"#0F172A", t2:"#475569", t3:"#94A3B8", t4:"#CBD5E1",
  shadow:"0 1px 3px rgba(0,0,0,0.08)",
  shadowM:"0 4px 12px rgba(0,0,0,0.08)",
};

const ROLES = {
  "Cuisinier":   {c:T.org, i:"👨‍🍳", profil:"cuisine", phases:["arrivee","hygiene","mep","service","cloture"], labels:{arrivee:"Arrivée",hygiene:"Hygiène HACCP",mep:"Mise en place",service:"Service",cloture:"Clôture"}, tasks:{arrivee:[{id:"ca1",t:"Tenue réglementaire",k:true},{id:"ca2",t:"Lavage mains 30s",k:true},{id:"ca3",t:"Lecture bons de commande",k:false}],hygiene:[{id:"ch1",t:"Relevé T° frigo viandes",k:true,h:true},{id:"ch2",t:"Relevé T° frigo laitiers",k:true,h:true},{id:"ch3",t:"Relevé T° congélateur",k:true,h:true},{id:"ch4",t:"Vérification DLC produits frais",k:true,h:true},{id:"ch5",t:"Contrôle huile friteuse",k:true,h:true},{id:"ch6",t:"Désinfection plans de travail",k:true},{id:"ch7",t:"Étiquetage produits entamés",k:true,h:true}],mep:[],service:[{id:"cs1",t:"Poste opérationnel",k:false},{id:"cs2",t:"Four à température",k:true}],cloture:[{id:"cc1",t:"Dégraissage four et plaques",k:true},{id:"cc2",t:"Film alimentaire sur denrées",k:true},{id:"cc3",t:"Rangement frigos",k:true},{id:"cc4",t:"Sol cuisine nettoyé",k:true},{id:"cc5",t:"Coupure gaz",k:true},{id:"cc6",t:"Fiche HACCP signée",k:true,h:true}]}},
  "Chef de rang":{c:T.acc, i:"🍷", profil:"salle",    phases:["arrivee","hygiene","salle","service","cloture"], labels:{arrivee:"Arrivée",hygiene:"Hygiène",salle:"Mise en place salle",service:"Service",cloture:"Clôture"}, tasks:{arrivee:[{id:"ra1",t:"Tenue vérifiée",k:false},{id:"ra2",t:"Réservations lues",k:true},{id:"ra3",t:"Allergènes notés",k:true}],hygiene:[{id:"rh1",t:"Lavage mains",k:true},{id:"rh2",t:"Désinfection salle",k:true}],salle:[{id:"rs1",t:"Dressage tables",k:true},{id:"rs2",t:"Couverts polis",k:true},{id:"rs3",t:"Verres polis",k:true},{id:"rs4",t:"Condiments remplis",k:false},{id:"rs5",t:"Menus à jour",k:true},{id:"rs6",t:"Plan de salle vérifié",k:true},{id:"rs7",t:"WC clients approvisionnés",k:false}],service:[{id:"rsv",t:"Accueil en position",k:true}],cloture:[{id:"rc1",t:"Tables nettoyées",k:true},{id:"rc2",t:"Vaisselle rendue plonge",k:false},{id:"rc3",t:"Ménage salle",k:true}]}},
  "Barman":      {c:T.pur, i:"🍸", profil:"salle",    phases:["arrivee","hygiene","bar","service","cloture"],   labels:{arrivee:"Arrivée",hygiene:"Hygiène",bar:"Mise en place bar",service:"Service",cloture:"Clôture"}, tasks:{arrivee:[{id:"ba1",t:"Tenue vérifiée",k:false},{id:"ba2",t:"Inventaire boissons",k:true}],hygiene:[{id:"bh1",t:"Lavage mains",k:true},{id:"bh2",t:"Nettoyage bar",k:true}],bar:[{id:"bb1",t:"Frigo bar rempli",k:true},{id:"bb2",t:"Glaces en place",k:true},{id:"bb3",t:"Garnishes préparées",k:false},{id:"bb4",t:"Caisse bar vérifiée",k:true}],service:[{id:"bsv",t:"Poste opérationnel",k:false}],cloture:[{id:"bc1",t:"Inventaire alcools",k:true},{id:"bc2",t:"Nettoyage bar",k:true},{id:"bc3",t:"Caisse fermée",k:true}]}},
  "Plongeur":    {c:T.grn, i:"🧽", profil:"cuisine",  phases:["arrivee","hygiene","plonge","service","cloture"], labels:{arrivee:"Arrivée",hygiene:"Hygiène",plonge:"Poste plonge",service:"Service",cloture:"Clôture"}, tasks:{arrivee:[{id:"pa1",t:"Tablier et gants",k:false},{id:"pa2",t:"Eau chaude machine",k:true}],hygiene:[{id:"ph1",t:"Lavage mains",k:true},{id:"ph2",t:"Dosage lessive",k:true},{id:"ph3",t:"Filtres nettoyés",k:true}],plonge:[{id:"pp1",t:"Zones tri déchets",k:false},{id:"pp2",t:"Bacs rinçage prêts",k:true},{id:"pp3",t:"Poubelles vidées",k:true}],service:[{id:"psv",t:"Poste organisé",k:false}],cloture:[{id:"pc1",t:"Vaisselle lavée",k:true},{id:"pc2",t:"Machine vidée et séchée",k:true},{id:"pc3",t:"Sol nettoyé",k:true},{id:"pc4",t:"Poubelles sorties",k:true}]}},
  "Manager":     {c:T.red, i:"📋", profil:"both",     phases:["arrivee","briefing","controle","service","cloture"], labels:{arrivee:"Arrivée",briefing:"Briefing",controle:"Contrôle",service:"Service",cloture:"Clôture"}, tasks:{arrivee:[{id:"ma1",t:"Réservations lues",k:true},{id:"ma2",t:"Présence équipe",k:true},{id:"ma3",t:"Caisse ouverte",k:true}],briefing:[{id:"mb1",t:"Plat du jour communiqué",k:true},{id:"mb2",t:"Allergènes communiqués",k:true},{id:"mb3",t:"Effectif confirmé",k:true}],controle:[{id:"mc1",t:"MEP salle validée",k:true},{id:"mc2",t:"MEP cuisine validée",k:true},{id:"mc3",t:"HACCP signées",k:true},{id:"mc4",t:"Extincteurs accessibles",k:true}],service:[{id:"msv",t:"Ouverture lancée",k:true}],cloture:[{id:"mcl1",t:"Rapport Z signé",k:true},{id:"mcl2",t:"Feuille service remplie",k:true},{id:"mcl3",t:"Alarme activée",k:true},{id:"mcl4",t:"Dernière ronde",k:true}]}},
};

const PROD0=[
  {id:"p1",n:"Filet de bœuf",u:"kg",q:3.5,m:4,cat:"Viande",p:"cuisine",urg:false},
  {id:"p2",n:"Saumon frais",u:"kg",q:1.2,m:2,cat:"Poisson",p:"cuisine",urg:true},
  {id:"p3",n:"Crème 35%",u:"L",q:6,m:3,cat:"Laitier",p:"cuisine",urg:false},
  {id:"p4",n:"Beurre AOP",u:"kg",q:2,m:1.5,cat:"Laitier",p:"cuisine",urg:false},
  {id:"p5",n:"Farine T55",u:"kg",q:25,m:10,cat:"Sec",p:"cuisine",urg:false},
  {id:"p6",n:"Pommes de terre",u:"kg",q:15,m:8,cat:"Légume",p:"cuisine",urg:false},
  {id:"p7",n:"Tomates cerises",u:"kg",q:1,m:2,cat:"Légume",p:"cuisine",urg:true},
  {id:"p8",n:"Dégraissant cuisine",u:"L",q:2,m:1,cat:"Nettoyage",p:"cuisine",urg:false},
  {id:"p9",n:"Film alimentaire",u:"rouleau",q:3,m:2,cat:"Nettoyage",p:"cuisine",urg:false},
  {id:"p20",n:"Vin rouge pichet",u:"L",q:20,m:15,cat:"Boisson",p:"salle",urg:false},
  {id:"p21",n:"Champagne 75cl",u:"bouteille",q:6,m:3,cat:"Boisson",p:"salle",urg:false},
  {id:"p22",n:"Eau gazeuse 75cl",u:"bouteille",q:24,m:12,cat:"Boisson",p:"salle",urg:false},
  {id:"p23",n:"Eau plate 75cl",u:"bouteille",q:24,m:12,cat:"Boisson",p:"salle",urg:false},
  {id:"p30",n:"Serviettes tissu",u:"unité",q:80,m:40,cat:"Consommable",p:"salle",urg:false},
  {id:"p31",n:"Serviettes papier",u:"paquet",q:5,m:3,cat:"Consommable",p:"salle",urg:false},
  {id:"p32",n:"PH WC",u:"rouleau",q:12,m:6,cat:"Consommable",p:"salle",urg:false},
  {id:"p33",n:"Savon mains WC",u:"flacon",q:3,m:2,cat:"Consommable",p:"salle",urg:false},
  {id:"p40",n:"Spray nettoyant tables",u:"flacon",q:3,m:2,cat:"Nettoyage",p:"salle",urg:false},
];

const DISHES0=[
  {id:"d1",n:"Tartare de bœuf",cat:"Entrée",svc:["Déjeuner","Dîner"],r:0.35,comps:[{id:"c1",l:"Filet haché",u:"g",pc:200,note:"Minute +2°C"},{id:"c2",l:"Condiments",u:"g",pc:30,note:"Brunoise"},{id:"c3",l:"Pain toasté",u:"tr",pc:2}]},
  {id:"d2",n:"Saumon mi-cuit",cat:"Entrée",svc:["Déjeuner","Dîner"],r:0.28,comps:[{id:"c4",l:"Pavé saumon",u:"g",pc:120,note:"Assaisonner"},{id:"c5",l:"Crème citron",u:"cl",pc:5,note:"+4°C"}]},
  {id:"d3",n:"Sole meunière",cat:"Plat",svc:["Déjeuner","Dîner"],r:0.30,comps:[{id:"c6",l:"Sole",u:"g",pc:400,note:"Lever filets"},{id:"c7",l:"Beurre clarifié",u:"g",pc:30},{id:"c8",l:"Pommes vapeur",u:"g",pc:150}]},
  {id:"d4",n:"Fondant chocolat",cat:"Dessert",svc:["Déjeuner","Dîner"],r:0.40,comps:[{id:"c9",l:"Appareil fondant",u:"unité",pc:1,note:"Surgeler veille"},{id:"c10",l:"Crème anglaise",u:"cl",pc:6}]},
];

const todayK = () => ["dim","lun","mar","mer","jeu","ven","sam"][new Date().getDay()];
const tnow = () => new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
const dnow = () => new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
const uid = () => Math.random().toString(36).slice(2,9);
const detSvc = s => { const h=new Date().getHours(); return h>=(s?.lS??10)&&h<(s?.lE??15)?"Déjeuner":"Dîner"; };
const myProds = (prods,role) => { const p=ROLES[role]?.profil||"salle"; return p==="both"?prods:prods.filter(x=>x.p===p||x.p==="both"); };
const fmtDate = iso => iso ? new Date(iso).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}) : "";

const css=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body{background:${T.bg};color:${T.t1};font-family:'Inter',sans-serif;min-height:100vh}
.mono{font-family:'DM Mono',monospace}
input,select,textarea,button{font-family:'Inter',sans-serif}
input[type=range]{accent-color:${T.acc};width:100%}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:${T.bg}}
::-webkit-scrollbar-thumb{background:${T.borderB};border-radius:4px}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.up{animation:fadeUp .25s ease forwards}
.spin{animation:spin 1s linear infinite}
@media print{
  .no-print{display:none!important}
  body{background:white;font-size:12px}
  .print-card{break-inside:avoid;border:1px solid #ccc!important;box-shadow:none!important}
}
`;

// ═══════════════════════════════════════════════════════
// FIREBASE HOOKS
// ═══════════════════════════════════════════════════════
const useFirestore = () => {
  const [products,setProducts]   = useState(PROD0);
  const [dishes,setDishes]       = useState(DISHES0);
  const [staff,setStaff]         = useState([]);
  const [settings,setSettings]   = useState({name:"L'Embouchure",lS:10,lE:15,dS:17,cvr:{lun:40,mar:55,mer:65,jeu:70,ven:95,sam:120,dim:80}});
  const [losses,setLosses]       = useState([]);
  const [daily,setDaily]         = useState({});
  const [disabledTasks,setDT]    = useState({});
  const [mepActual,setMepActual] = useState({});
  const [history,setHistory]     = useState([]);
  const [ready,setReady]         = useState(false);
  const [offline,setOffline]     = useState(false);

  useEffect(()=>{
    const subs = [];
    const tryInit = async () => {
      try {
        // Settings
        subs.push(onSnapshot(cols.settings(), snap=>{
          if(snap.exists()) setSettings(s=>({...s,...snap.data()}));
        }));
        // Products
        subs.push(onSnapshot(cols.products(), snap=>{
          const data = snap.docs.map(d=>({id:d.id,...d.data()}));
          if(data.length>0) setProducts(data);
          else {
            // Seed initial products
            PROD0.forEach(p=>setDoc(cols.product(p.id),p));
          }
        }));
        // Dishes
        subs.push(onSnapshot(cols.dishes(), snap=>{
          const data = snap.docs.map(d=>({id:d.id,...d.data()}));
          if(data.length>0) setDishes(data);
          else DISHES0.forEach(d=>setDoc(cols.dish(d.id),d));
        }));
        // Staff
        subs.push(onSnapshot(cols.staff(), snap=>{
          const data = snap.docs.map(d=>({id:d.id,...d.data()}));
          setStaff(data);
        }));
        // Losses
        subs.push(onSnapshot(query(cols.losses(),orderBy("date","desc"),limit(100)), snap=>{
          setLosses(snap.docs.map(d=>({id:d.id,...d.data()})));
        }));
        // Daily
        const dk=todayK();
        ["Déjeuner","Dîner","Brunch"].forEach(svc=>{
          subs.push(onSnapshot(cols.daily(dk,svc), snap=>{
            if(snap.exists()) setDaily(prev=>({...prev,[`${dk}_${svc}`]:snap.data()}));
          }));
        });
        // Disabled tasks
        subs.push(onSnapshot(cols.disabledTasks(), snap=>{
          if(snap.exists()) setDT(snap.data());
        }));
        // Mep actual
        subs.push(onSnapshot(cols.mepActual(), snap=>{
          if(snap.exists()) setMepActual(snap.data());
        }));
        // Historique 3 mois
        subs.push(onSnapshot(query(cols.history(),orderBy("date","desc"),limit(2000)), snap=>{
          const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth()-3);
          const co = cutoff.toISOString();
          setHistory(snap.docs.map(d=>({id:d.id,...d.data()})).filter(h=>!h.date||h.date>=co));
        }));
        setReady(true);
      } catch(e) {
        console.error("Firebase error:", e);
        setOffline(true);
        setReady(true);
      }
    };
    tryInit();
    return ()=>subs.forEach(u=>u&&u());
  },[]);

  // ── Actions ──────────────────────────────────────────
  const updProduct = useCallback(async(id,changes,user)=>{
    try{
      await setDoc(cols.product(id),changes,{merge:true});
      if(user) await logAction("stock_update",user,{productId:id,...changes});
    }catch(e){setOffline(true);}
  },[]);

  const addProduct = useCallback(async(prod,user)=>{
    const id=`p${uid()}`;
    await setDoc(cols.product(id),{...prod,id});
    if(user) await logAction("product_add",user,{name:prod.n});
    return id;
  },[]);

  const delProduct = useCallback(async(id,user)=>{
    await deleteDoc(cols.product(id));
    if(user) await logAction("product_delete",user,{productId:id});
  },[]);

  const addLoss = useCallback(async(loss,user)=>{
    const id=`l${uid()}`;
    const l={...loss,id,date:new Date().toISOString()};
    await setDoc(cols.loss(id),l);
    await setDoc(cols.product(loss.pid),{q:Math.max(0,(products.find(p=>p.id===loss.pid)?.q||0)-loss.qty)},{merge:true});
    if(user) await logAction("loss_declared",user,{product:loss.pn,qty:loss.qty,reason:loss.rsn});
    return id;
  },[products]);

  const resolveLoss = useCallback(async(id,user)=>{
    await setDoc(cols.loss(id),{res:true},{merge:true});
    if(user) await logAction("loss_resolved",user,{lossId:id});
  },[]);

  const checkTask = useCallback(async(taskId,taskLabel,phase,done,user,svc)=>{
    const dk=todayK();
    const key=`${dk}_${svc}`;
    const prev=daily[key]||{};
    const chks={...(prev.chks||{}),[taskId]:done};
    await setDoc(cols.daily(dk,svc),{...prev,chks},{merge:true});
    if(user) await logAction(done?"task_checked":"task_unchecked",user,{task:taskLabel,phase,service:svc});
  },[daily]);

  const advancePhase = useCallback(async(phase,user,svc)=>{
    const dk=todayK();
    await setDoc(cols.daily(dk,svc),{currentPhase:phase},{merge:true});
    if(user) await logAction("phase_advanced",user,{phase,service:svc});
  },[]);

  const toggleDisabledTask = useCallback(async(taskId)=>{
    const next={...disabledTasks,[taskId]:!disabledTasks[taskId]};
    await setDoc(cols.disabledTasks(),next);
  },[disabledTasks]);

  const setMepActualVal = useCallback(async(key,val,user)=>{
    const next={...mepActual,[key]:val};
    await setDoc(cols.mepActual(),next);
    if(user) await logAction("mep_actual",user,{key,val});
  },[mepActual]);

  const updSettings = useCallback(async(changes)=>{
    await setDoc(cols.settings(),changes,{merge:true});
  },[]);

  const updStaff = useCallback(async(id,changes)=>{
    await setDoc(cols.staffDoc(id),changes,{merge:true});
  },[]);

  const addStaff = useCallback(async(member)=>{
    const id=uid();
    await setDoc(cols.staffDoc(id),{...member,id,on:true});
    return id;
  },[]);

  const delStaff = useCallback(async(id)=>{
    await deleteDoc(cols.staffDoc(id));
  },[]);

  const addDish = useCallback(async(dish)=>{
    const id=`d${uid()}`;
    await setDoc(cols.dish(id),{...dish,id});
    return id;
  },[]);

  const updDish = useCallback(async(id,changes)=>{
    await setDoc(cols.dish(id),changes,{merge:true});
  },[]);

  const delDish = useCallback(async(id)=>{
    await deleteDoc(cols.dish(id));
  },[]);

  const addShoppingList = useCallback(async(items,user)=>{
    const id=`sl${uid()}`;
    const list={id,items,createdBy:user?.n||"Admin",date:new Date().toISOString(),shared:false};
    await setDoc(cols.shoppingList(id),list);
    await logAction("shopping_list_created",user,{itemCount:items.length});
    return id;
  },[]);

  return {
    products,dishes,staff,settings,losses,daily,disabledTasks,mepActual,history,ready,offline,
    updProduct,addProduct,delProduct,addLoss,resolveLoss,checkTask,advancePhase,
    toggleDisabledTask,setMepActualVal,updSettings,updStaff,addStaff,delStaff,
    addDish,updDish,delDish,addShoppingList,
  };
};

// ═══════════════════════════════════════════════════════
// ATOMS
// ═══════════════════════════════════════════════════════
const Badge=({c,bg,children,sm})=><span style={{background:bg||`${c}18`,color:c,border:`1px solid ${c}35`,padding:sm?"1px 6px":"2px 8px",borderRadius:6,fontSize:sm?10:11,fontWeight:600,whiteSpace:"nowrap"}}>{children}</span>;

const Btn=({onClick,children,variant="primary",sm,dis,full,icon,col})=>{
  const V={primary:{bg:col||T.acc,fg:"#fff",br:"none"},secondary:{bg:"#fff",fg:T.t1,br:`1px solid ${T.border}`},ghost:{bg:"transparent",fg:T.t2,br:`1px solid ${T.border}`},danger:{bg:T.redL,fg:T.red,br:`1px solid ${T.redB}`},success:{bg:T.grnL,fg:T.grn,br:`1px solid ${T.grnB}`}};
  const s=V[variant]||V.primary;
  return <button onClick={onClick} disabled={dis} style={{background:s.bg,color:s.fg,border:s.br,padding:sm?"6px 12px":"10px 18px",borderRadius:8,fontWeight:600,fontSize:sm?12:14,cursor:dis?"not-allowed":"pointer",opacity:dis?.5:1,width:full?"100%":"auto",transition:"all .15s",display:"inline-flex",alignItems:"center",gap:6,flexShrink:0,boxShadow:variant==="primary"&&!dis?`0 1px 3px ${(col||T.acc)}40`:"none"}}>{icon&&<span style={{fontSize:14}}>{icon}</span>}{children}</button>;
};

const Card=({children,style,onClick,hi,hc,className})=><div onClick={onClick} className={className} style={{background:T.card,borderRadius:12,padding:16,border:`1px solid ${hi?(hc||T.acc)+"60":T.border}`,boxShadow:hi?`0 0 0 3px ${(hc||T.acc)}15`:T.shadow,cursor:onClick?"pointer":"default",transition:"all .2s",...style}}>{children}</div>;

const Bar=({v,max,c})=><div style={{background:T.bg,borderRadius:4,height:6,overflow:"hidden"}}><div style={{width:`${max>0?Math.min(100,v/max*100):0}%`,height:"100%",background:c||T.acc,borderRadius:4,transition:"width .4s"}}/></div>;

const Ring=({v,max,sz=48,sw=5,c})=>{const r=(sz-sw*2)/2,ci=2*Math.PI*r,pt=max>0?Math.min(1,v/max):0;return<svg width={sz} height={sz} style={{flexShrink:0}}><circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={T.border} strokeWidth={sw}/><circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={c||T.acc} strokeWidth={sw} strokeDasharray={ci} strokeDashoffset={ci*(1-pt)} strokeLinecap="round" transform={`rotate(-90 ${sz/2} ${sz/2})`} style={{transition:"stroke-dashoffset .4s"}}/><text x={sz/2} y={sz/2+4} textAnchor="middle" fill={pt>=1?T.grn:T.t1} fontSize={10} fontWeight={700} fontFamily="'DM Mono',monospace">{Math.round(pt*100)}%</text></svg>;};

const Toggle=({on,set,label,c})=><div onClick={set} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",userSelect:"none"}}><div style={{width:36,height:20,borderRadius:10,background:on?(c||T.grn):T.t4,position:"relative",transition:"background .2s",flexShrink:0}}><div style={{position:"absolute",top:2,left:on?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/></div>{label&&<span style={{fontSize:13,color:T.t2,fontWeight:500}}>{label}</span>}</div>;

const FIn=({label,val,set,type,ph})=><div style={{marginBottom:10}}>{label&&<div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{label}</div>}<input type={type||"text"} value={val} placeholder={ph||""} onChange={e=>set(e.target.value)} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.t1,fontSize:13,outline:"none"}}/></div>;

const Divider=({label})=><div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0 10px"}}>{label&&<span style={{fontSize:11,color:T.t3,fontWeight:600,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{label}</span>}<div style={{flex:1,height:1,background:T.border}}/></div>;

const Loader=()=><div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",flexDirection:"column",gap:12}}><div className="spin" style={{width:32,height:32,border:`3px solid ${T.border}`,borderTop:`3px solid ${T.acc}`,borderRadius:"50%"}}/><div style={{fontSize:13,color:T.t3}}>Connexion à la base de données…</div></div>;

const OfflineBanner=()=><div style={{background:T.redL,border:`1px solid ${T.redB}`,borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:13,color:T.red,fontWeight:500,display:"flex",gap:8,alignItems:"center"}}>⚠️ Mode hors ligne — les modifications ne seront pas synchronisées</div>;

// ═══════════════════════════════════════════════════════
// PDF EXPORT & PARTAGE
// ═══════════════════════════════════════════════════════
const generatePDFContent = (items, title, restaurantName) => {
  const date = new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const urgent = items.filter(i=>i.urg);
  const normal = items.filter(i=>!i.urg);

  let html = `
    <html><head><style>
      body{font-family:Arial,sans-serif;padding:30px;color:#0F172A}
      h1{font-size:22px;margin-bottom:4px}
      .sub{color:#64748B;font-size:13px;margin-bottom:24px}
      .section{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94A3B8;margin:16px 0 8px}
      .item{display:flex;justify-content:space-between;padding:8px 12px;border:1px solid #E2E8F0;border-radius:6px;margin-bottom:6px;align-items:center}
      .item.urgent{border-color:#FECACA;background:#FEF2F2}
      .name{font-weight:600;font-size:13px}
      .source{font-size:11px;color:#94A3B8;margin-top:2px}
      .qty{font-family:monospace;font-size:15px;font-weight:700;color:#2563EB}
      .urgent .qty{color:#DC2626}
      .footer{margin-top:30px;padding-top:12px;border-top:1px solid #E2E8F0;font-size:11px;color:#94A3B8;text-align:center}
      @media print{body{padding:10px}}
    </style></head><body>
    <h1>🛒 ${title}</h1>
    <div class="sub">${restaurantName} · ${date}</div>
  `;

  if(urgent.length>0){
    html+=`<div class="section">🚨 Urgents (${urgent.length})</div>`;
    urgent.forEach(i=>{html+=`<div class="item urgent"><div><div class="name">${i.n}</div><div class="source">${i.src}</div></div><div class="qty">${i.need} ${i.u}</div></div>`;});
  }

  if(normal.length>0){
    const cats=[...new Set(normal.map(i=>i.cat))];
    cats.forEach(cat=>{
      const catItems=normal.filter(i=>i.cat===cat);
      html+=`<div class="section">${cat} (${catItems.length})</div>`;
      catItems.forEach(i=>{html+=`<div class="item"><div><div class="name">${i.n}</div><div class="source">${i.src}</div></div><div class="qty">${i.need} ${i.u}</div></div>`;});
    });
  }

  if(items.length===0) html+=`<div style="text-align:center;padding:40px;color:#94A3B8">✅ Aucun produit à commander</div>`;
  html+=`<div class="footer">Généré le ${date} · ${restaurantName}</div></body></html>`;
  return html;
};

const printShoppingList = (items, restaurantName) => {
  const html = generatePDFContent(items, "Liste de courses", restaurantName);
  const w = window.open("","_blank","width=800,height=600");
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(()=>w.print(),500);
};

const shareWhatsApp = (items, restaurantName) => {
  const date = new Date().toLocaleDateString("fr-FR");
  let text = `🛒 *Liste de courses — ${restaurantName}*\n📅 ${date}\n\n`;
  const urgent = items.filter(i=>i.urg);
  const normal = items.filter(i=>!i.urg);
  if(urgent.length>0){
    text += `🚨 *URGENTS*\n`;
    urgent.forEach(i=>{text+=`• ${i.n}: *${i.need} ${i.u}*\n`;});
    text+="\n";
  }
  const cats=[...new Set(normal.map(i=>i.cat))];
  cats.forEach(cat=>{
    text+=`*${cat}*\n`;
    normal.filter(i=>i.cat===cat).forEach(i=>{text+=`• ${i.n}: ${i.need} ${i.u}\n`;});
    text+="\n";
  });
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank");
};

const shareEmail = (items, restaurantName) => {
  const date = new Date().toLocaleDateString("fr-FR");
  const subject = `Liste de courses ${restaurantName} - ${date}`;
  let body = `Liste de courses — ${restaurantName}\n${date}\n\n`;
  const urgent = items.filter(i=>i.urg);
  const normal = items.filter(i=>!i.urg);
  if(urgent.length>0){body+="=== URGENTS ===\n";urgent.forEach(i=>{body+=`• ${i.n}: ${i.need} ${i.u} (${i.src})\n`;});body+="\n";}
  const cats=[...new Set(normal.map(i=>i.cat))];
  cats.forEach(cat=>{body+=`--- ${cat} ---\n`;normal.filter(i=>i.cat===cat).forEach(i=>{body+=`• ${i.n}: ${i.need} ${i.u}\n`;});body+="\n";});
  window.location.href=`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

// ═══════════════════════════════════════════════════════
// SHOPPING LIST VIEW
// ═══════════════════════════════════════════════════════
const CoursesView = ({products,losses,role,fb,user,onNavigate}) => {
  const my = myProds(products,role);
  const prof = ROLES[role]?.profil||"salle";
  const [chk,setChk] = useState({});
  const [showManual,setShowManual] = useState(false);
  const [manSel,setManSel] = useState("");
  const [manQty,setManQty] = useState("");
  const [manuals,setManuals] = useState([]);
  const [showShare,setShowShare] = useState(false);

  const belowMin = my.filter(p=>p.q<p.m).map(p=>({id:`i_${p.id}`,pid:p.id,n:p.n,u:p.u,cat:p.cat,need:+(p.m-p.q+p.m*0.2).toFixed(2),src:"Inventaire",urg:p.urg}));
  const ruptures = losses.filter(l=>l.rsn==="Rupture de stock"&&!l.res&&(l.prof===prof||l.prof==="both")).map(l=>({id:`r_${l.id}`,pid:l.pid,n:l.pn,u:l.u,cat:"Rupture",need:l.qty,src:"Rupture déclarée",urg:true}));
  const all = [...ruptures,...belowMin.filter(b=>!ruptures.some(r=>r.pid===b.pid)),...manuals];
  const urgCount = all.filter(i=>i.urg).length;
  const cats = [...new Set(all.filter(i=>!i.urg).map(i=>i.cat))];

  const addManual = () => {
    if(!manSel||!manQty) return;
    const prod=my.find(p=>p.id===manSel);
    setManuals(prev=>[...prev,{id:`m_${uid()}`,pid:manSel,n:prod?.n||manSel,u:prod?.u||"",cat:"Manuel",need:parseFloat(manQty)||1,src:"Ajout manuel",urg:false}]);
    setManSel(""); setManQty(""); setShowManual(false);
  };

  const markDone = async(pid) => {
    const prod=products.find(p=>p.id===pid);
    if(prod) await fb.updProduct(pid,{q:prod.m*1.3},user);
    await Promise.all(losses.filter(l=>l.pid===pid&&!l.res).map(l=>fb.resolveLoss(l.id,user)));
    setManuals(prev=>prev.filter(m=>m.pid!==pid));
  };

  const CItem = ({item}) => (
    <Card style={{marginBottom:8,padding:"12px 14px"}} className="print-card">
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div onClick={()=>setChk(x=>({...x,[item.id]:!x[item.id]}))}
          style={{width:22,height:22,borderRadius:6,flexShrink:0,border:`2px solid ${chk[item.id]?T.grn:T.borderB}`,background:chk[item.id]?T.grn:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s"}}>
          {chk[item.id]&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>✓</span>}
        </div>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
            <span style={{fontWeight:600,fontSize:13,textDecoration:chk[item.id]?"line-through":"none",color:chk[item.id]?T.t3:T.t1}}>{item.n}</span>
            {item.urg&&<Badge c={T.red} sm>🚨 Urgent</Badge>}
          </div>
          <Badge c={item.src==="Rupture déclarée"?T.red:item.src==="Ajout manuel"?T.pur:T.org} sm>{item.src}</Badge>
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
        <div style={{display:"flex",gap:6}}>
          <Btn onClick={()=>setShowManual(!showManual)} variant="secondary" sm icon="➕">Ajouter</Btn>
          <Btn onClick={()=>setShowShare(!showShare)} variant="secondary" sm icon="📤">Partager</Btn>
        </div>
      </div>

      {/* Panneau partage */}
      {showShare&&(
        <Card style={{marginBottom:14,border:`1px solid ${T.acc}40`,background:T.accL}}>
          <div style={{fontSize:13,fontWeight:700,color:T.acc,marginBottom:12}}>📤 Partager la liste</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Btn onClick={()=>printShoppingList(all,fb.settings?.name||"Restaurant")} variant="secondary" full sm icon="🖨️">Imprimer / PDF</Btn>
            <Btn onClick={()=>shareWhatsApp(all,fb.settings?.name||"Restaurant")} full sm icon="💬" col="#25D366">WhatsApp</Btn>
            <Btn onClick={()=>shareEmail(all,fb.settings?.name||"Restaurant")} variant="secondary" full sm icon="📧">Email</Btn>
            <Btn onClick={()=>{const txt=all.map(i=>`${i.n}: ${i.need}${i.u}`).join("\n");navigator.clipboard?.writeText(txt).then(()=>alert("Copié !"));}} variant="ghost" full sm icon="📋">Copier texte</Btn>
          </div>
          <button onClick={()=>setShowShare(false)} style={{marginTop:10,background:"none",border:"none",color:T.t3,cursor:"pointer",fontSize:12,width:"100%"}}>Fermer</button>
        </Card>
      )}

      {/* Ajout manuel */}
      {showManual&&(
        <Card style={{marginBottom:14,border:`1px solid ${T.pur}40`,background:T.purL}}>
          <div style={{fontSize:13,fontWeight:700,color:T.pur,marginBottom:10}}>Ajouter manuellement</div>
          <div style={{marginBottom:8}}>
            <div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Produit</div>
            <select value={manSel} onChange={e=>setManSel(e.target.value)}
              style={{width:"100%",background:"#fff",border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:manSel?T.t1:T.t3,fontSize:13,outline:"none"}}>
              <option value="">— Sélectionner dans la liste —</option>
              {my.map(p=><option key={p.id} value={p.id}>{p.n} ({p.u})</option>)}
            </select>
          </div>
          <FIn label="Quantité à commander" val={manQty} set={setManQty} type="number" ph="Ex: 5"/>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={()=>setShowManual(false)} variant="ghost" full sm>Annuler</Btn>
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

      {urgCount>0&&<div style={{marginBottom:14}}><Divider label="🚨 Urgents"/>{all.filter(i=>i.urg).map(i=><CItem key={i.id} item={i}/>)}</div>}
      {cats.map(cat=>{const items=all.filter(i=>i.cat===cat&&!i.urg);if(!items.length)return null;return<div key={cat} style={{marginBottom:14}}><Divider label={cat}/>{items.map(i=><CItem key={i.id} item={i}/>)}</div>;})}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// HISTORIQUE
// ═══════════════════════════════════════════════════════
const HistoryView = ({history,user,isAdmin}) => {
  const myHistory = isAdmin ? history : history.filter(h=>h.user===user?.n);
  const [filter,setFilter] = useState("Tous");

  const actionLabels = {
    task_checked:"Tâche cochée", task_unchecked:"Tâche décochée",
    phase_advanced:"Phase avancée", stock_update:"Stock modifié",
    product_add:"Produit ajouté", product_delete:"Produit supprimé",
    loss_declared:"Perte déclarée", loss_resolved:"Perte résolue",
    mep_actual:"MEP saisie", shopping_list_created:"Liste de courses créée",
  };

  const actionColor = {
    task_checked:T.grn, task_unchecked:T.t3, phase_advanced:T.acc,
    stock_update:T.yel, product_add:T.grn, product_delete:T.red,
    loss_declared:T.red, loss_resolved:T.grn, mep_actual:T.org,
    shopping_list_created:T.pur,
  };

  const cats = ["Tous","Tâches","Stock","Pertes","MEP"];
  const catFilter = (h) => {
    if(filter==="Tous") return true;
    if(filter==="Tâches") return h.action?.startsWith("task")||h.action?.startsWith("phase");
    if(filter==="Stock") return h.action?.startsWith("stock")||h.action?.startsWith("product");
    if(filter==="Pertes") return h.action?.startsWith("loss");
    if(filter==="MEP") return h.action?.startsWith("mep");
    return true;
  };

  const filtered = myHistory.filter(catFilter).slice(0,100);

  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:700,marginBottom:4}}>Historique</h2>
      <div style={{fontSize:13,color:T.t3,marginBottom:16}}>{isAdmin?"Toutes les actions":"Vos dernières actions"}</div>

      <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:16,paddingBottom:4,scrollbarWidth:"none"}}>
        {cats.map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:"5px 12px",borderRadius:20,flexShrink:0,border:`1px solid ${filter===c?T.acc:T.border}`,background:filter===c?T.acc:"#fff",color:filter===c?"#fff":T.t2,cursor:"pointer",fontWeight:500,fontSize:12}}>{c}</button>)}
      </div>

      {filtered.length===0&&<div style={{textAlign:"center",padding:32,color:T.t3,fontSize:13}}>Aucune action enregistrée</div>}

      {filtered.map((h,i)=>(
        <div key={h.id||i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:actionColor[h.action]||T.t4,flexShrink:0,marginTop:5}}/>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div>
                <span style={{fontWeight:600,fontSize:13,color:T.t1}}>{actionLabels[h.action]||h.action}</span>
                {isAdmin&&<span style={{fontSize:12,color:T.t3,marginLeft:6}}>— {h.user}</span>}
                {h.role&&<span style={{fontSize:11,color:T.t4,marginLeft:4}}>({h.role})</span>}
              </div>
              <span className="mono" style={{fontSize:10,color:T.t3,flexShrink:0}}>{fmtDate(h.date)}</span>
            </div>
            {h.details&&Object.keys(h.details).length>0&&(
              <div style={{fontSize:11,color:T.t2,marginTop:2}}>
                {h.details.task&&<span>{h.details.task}</span>}
                {h.details.product&&<span>{h.details.product} {h.details.qty&&`(−${h.details.qty})`}</span>}
                {h.details.name&&<span>{h.details.name}</span>}
                {h.details.phase&&<span>{h.details.phase} · {h.details.service}</span>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// STOCK VIEW
// ═══════════════════════════════════════════════════════
const StockView = ({products,fb,role,user,filterUrgent}) => {
  const my = myProds(products,role);
  const [cf,setCf] = useState(filterUrgent?"Tous":"Tous");
  const [showAdd,setShowAdd] = useState(false);
  const [form,setForm] = useState({n:"",u:"",q:"",m:"",cat:"",p:ROLES[role]?.profil||"salle",urg:false});
  const cats = ["Tous",...new Set(my.map(p=>p.cat))];
  const shown = (cf==="Tous"?my:my.filter(p=>p.cat===cf)).filter(p=>!filterUrgent||p.urg);
  const alerts = my.filter(p=>p.q<p.m).length;

  const updQ = async(prod,delta) => {
    const newQ = Math.max(0,+(prod.q+delta).toFixed(2));
    await fb.updProduct(prod.id,{q:newQ},user);
  };
  const togUrg = async(prod) => {
    await fb.updProduct(prod.id,{urg:!prod.urg},user);
  };
  const addProduct = async() => {
    if(!form.n||!form.u) return;
    await fb.addProduct({...form,q:parseFloat(form.q)||0,m:parseFloat(form.m)||1},user);
    setForm({n:"",u:"",q:"",m:"",cat:"",p:ROLES[role]?.profil||"salle",urg:false});
    setShowAdd(false);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700}}>Stocks{filterUrgent?" · Urgents":""}</h2>
          <div style={{fontSize:13,color:alerts>0?T.red:T.t3,marginTop:2}}>{alerts} alerte(s) · {my.length} produits</div>
        </div>
        <Btn onClick={()=>setShowAdd(!showAdd)} variant="secondary" sm icon="➕">Ajouter</Btn>
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
            <div style={{display:"flex",gap:6}}>{["cuisine","salle","both"].map(pr=><button key={pr} onClick={()=>setForm(p=>({...p,p:pr}))} style={{flex:1,padding:"7px 4px",borderRadius:8,border:`1px solid ${form.p===pr?T.acc:T.border}`,background:form.p===pr?T.acc:"#fff",color:form.p===pr?"#fff":T.t2,cursor:"pointer",fontWeight:500,fontSize:11}}>{{cuisine:"🍳 Cuisine",salle:"🍷 Salle",both:"🔄 Les deux"}[pr]}</button>)}</div>
          </div>
          <div style={{marginBottom:12}}><Toggle on={form.urg} set={()=>setForm(p=>({...p,urg:!p.urg}))} label="Urgent 🚨" c={T.red}/></div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={()=>setShowAdd(false)} variant="ghost" full sm>Annuler</Btn>
            <Btn onClick={addProduct} full sm dis={!form.n||!form.u} icon="✓">Ajouter</Btn>
          </div>
        </Card>
      )}

      <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:4,scrollbarWidth:"none"}}>
        {cats.map(c=><button key={c} onClick={()=>setCf(c)} style={{padding:"5px 12px",borderRadius:20,flexShrink:0,border:`1px solid ${cf===c?T.acc:T.border}`,background:cf===c?T.acc:"#fff",color:cf===c?"#fff":T.t2,cursor:"pointer",fontWeight:500,fontSize:12}}>{c}</button>)}
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
                {[-1,-.5,.5,1,5].map(d=><button key={d} onClick={()=>updQ(p,d)} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${T.border}`,background:T.bg,color:d<0?T.red:T.grn,cursor:"pointer",fontSize:12,fontWeight:600}}>{d>0?"+":""}{d}</button>)}
              </div>
              <div style={{flex:1}}/>
              <Toggle on={!!p.urg} set={()=>togUrg(p)} label="Urgent" c={T.red}/>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// INVENTAIRE VIEW
// ═══════════════════════════════════════════════════════
const InventaireView = ({products,fb,role,user}) => {
  const my = myProds(products,role);
  const [vals,setVals] = useState(()=>Object.fromEntries(my.map(p=>[p.id,p.q])));
  const [ok,setOk] = useState(false);
  const [cf,setCf] = useState("Tous");
  const [showAdd,setShowAdd] = useState(false);
  const [form,setForm] = useState({n:"",u:"",q:"",m:"",cat:"",p:ROLES[role]?.profil||"salle",urg:false});
  const cats = ["Tous",...new Set(my.map(p=>p.cat))];
  const shown = cf==="Tous"?my:my.filter(p=>p.cat===cf);
  const below = my.filter(p=>(parseFloat(vals[p.id])??p.q)<p.m).length;

  const doSave = async() => {
    await Promise.all(my.map(p=>{
      const newQ=parseFloat(vals[p.id]);
      if(newQ!==undefined&&newQ!==p.q) return fb.updProduct(p.id,{q:newQ},user);
      return Promise.resolve();
    }));
    await logAction("inventory_done",user,{below,role});
    setOk(true); setTimeout(()=>setOk(false),2500);
  };

  const addProduct = async() => {
    if(!form.n||!form.u) return;
    const id = await fb.addProduct({...form,q:parseFloat(form.q)||0,m:parseFloat(form.m)||1},user);
    setVals(v=>({...v,[id]:parseFloat(form.q)||0}));
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
          <Btn onClick={()=>setShowAdd(!showAdd)} variant="secondary" sm icon="➕">Produit</Btn>
          <Btn onClick={doSave} variant="success" sm icon="💾">{ok?"Sauvé ✓":"Valider"}</Btn>
        </div>
      </div>

      {ok&&<div className="up" style={{padding:"10px 14px",background:T.grnL,border:`1px solid ${T.grnB}`,borderRadius:10,marginBottom:12,fontSize:13,color:T.grn,fontWeight:600}}>✅ Inventaire sauvegardé sur tous les appareils</div>}

      {showAdd&&(
        <Card style={{marginBottom:14,border:`1px solid ${T.acc}40`,background:T.accL}}>
          <div style={{fontSize:13,fontWeight:700,color:T.acc,marginBottom:12}}>Nouveau produit</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <FIn label="Nom" val={form.n} set={v=>setForm(p=>({...p,n:v}))} ph="Ex: Crème fraîche"/>
            <FIn label="Unité" val={form.u} set={v=>setForm(p=>({...p,u:v}))} ph="kg, L, unité…"/>
            <FIn label="Qté actuelle" val={form.q} set={v=>setForm(p=>({...p,q:v}))} type="number"/>
            <FIn label="Minimum" val={form.m} set={v=>setForm(p=>({...p,m:v}))} type="number"/>
          </div>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <Btn onClick={()=>setShowAdd(false)} variant="ghost" full sm>Annuler</Btn>
            <Btn onClick={addProduct} full sm dis={!form.n||!form.u} icon="✓">Ajouter</Btn>
          </div>
        </Card>
      )}

      <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:4,scrollbarWidth:"none"}}>
        {cats.map(c=><button key={c} onClick={()=>setCf(c)} style={{padding:"5px 12px",borderRadius:20,flexShrink:0,border:`1px solid ${cf===c?T.acc:T.border}`,background:cf===c?T.acc:"#fff",color:cf===c?"#fff":T.t2,cursor:"pointer",fontWeight:500,fontSize:12}}>{c}</button>)}
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
                <button onClick={()=>setVals(x=>({...x,[p.id]:Math.max(0,(parseFloat(x[p.id])||0)-1)}))} style={{width:30,height:30,borderRadius:8,border:`1px solid ${T.border}`,background:T.bg,color:T.red,cursor:"pointer",fontSize:16,fontWeight:700}}>−</button>
                <input type="number" value={vals[p.id]??p.q} onChange={e=>setVals(x=>({...x,[p.id]:e.target.value}))} style={{width:64,textAlign:"center",background:bl?T.redL:"#fff",border:`1px solid ${bl?T.red:T.border}`,borderRadius:8,padding:"6px 4px",color:bl?T.red:T.t1,fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:600,outline:"none"}}/>
                <button onClick={()=>setVals(x=>({...x,[p.id]:(parseFloat(x[p.id])||0)+1}))} style={{width:30,height:30,borderRadius:8,border:`1px solid ${T.border}`,background:T.bg,color:T.grn,cursor:"pointer",fontSize:16,fontWeight:700}}>+</button>
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
// PERTES VIEW
// ═══════════════════════════════════════════════════════
const PertesView = ({products,losses,fb,role,user}) => {
  const my = products.filter(p=>p.p===(ROLES[role]?.profil||"salle")||p.p==="both");
  const [sel,setSel]=useState(""); const [qty,setQty]=useState(""); const [rsn,setRsn]=useState("Perte"); const [urg,setUrg]=useState(false); const [ok,setOk]=useState(false);
  const prof = ROLES[role]?.profil||"salle";
  const mine = losses.filter(l=>l.prof===prof||l.prof==="both").slice(0,30);

  const declare = async() => {
    if(!sel||!qty) return;
    const prod=products.find(x=>x.id===sel);
    await fb.addLoss({pid:sel,pn:prod?.n||"?",qty:parseFloat(qty)||0,u:prod?.u||"",rsn,prof,urg},user);
    setSel(""); setQty(""); setUrg(false); setOk(true); setTimeout(()=>setOk(false),2000);
  };

  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:700,marginBottom:4}}>Pertes & Ruptures</h2>
      <div style={{fontSize:13,color:T.t3,marginBottom:16}}>{mine.filter(l=>!l.res).length} active(s)</div>
      <Card style={{marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Nouvelle déclaration</div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Produit</div>
          <select value={sel} onChange={e=>setSel(e.target.value)} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:sel?T.t1:T.t3,fontSize:13,outline:"none"}}>
            <option value="">— Sélectionner —</option>
            {my.map(p=><option key={p.id} value={p.id}>{p.n} ({p.q} {p.u})</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <FIn label="Quantité" val={qty} set={setQty} type="number" ph="Ex: 2"/>
          <div>
            <div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Motif</div>
            <select value={rsn} onChange={e=>setRsn(e.target.value)} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.t1,fontSize:13,outline:"none"}}>
              {["Perte","Rupture de stock","DLC dépassée","Casse / bris","Autre"].map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div style={{marginBottom:12}}><Toggle on={urg} set={()=>setUrg(!urg)} label="Marquer urgent" c={T.red}/></div>
        <Btn onClick={declare} full dis={!sel||!qty} icon="📝">Déclarer</Btn>
        {ok&&<div style={{marginTop:8,fontSize:13,color:T.grn,fontWeight:600,textAlign:"center"}}>✅ Déclaré et synchronisé</div>}
      </Card>
      <Divider label="Historique"/>
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
              <div style={{fontSize:11,color:T.t3}}>{fmtDate(l.date)}</div>
            </div>
            {!l.res&&<Btn onClick={()=>fb.resolveLoss(l.id,user)} sm variant="success" icon="✓">Résolu</Btn>}
          </div>
        </Card>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// MEP VIEW
// ═══════════════════════════════════════════════════════
const MepView = ({dishes,chks,tog,col,mepActual,fb,svc,user}) => {
  const mepDishes = dishes.filter(d=>d.svc?.includes(svc)).map(d=>({
    id:`m_${d.id}`, dishId:d.id, l:d.n, pts:Math.ceil(1*d.r*40), // placeholder, covers passed from journey
    subs:(d.comps||[]).map(c=>({id:`m_${d.id}_${c.id}`,l:c.l,qty:c.pc,u:c.u,note:c.note}))
  }));
  if(mepDishes.length===0) return <div style={{textAlign:"center",padding:32,color:T.t3,fontSize:13}}>Aucun plat configuré.</div>;
  return <div>{mepDishes.map(d=><div key={d.id} style={{marginBottom:8,color:T.t2,fontSize:13}}>{d.l}</div>)}</div>;
};

// ═══════════════════════════════════════════════════════
// STAFF JOURNEY
// ═══════════════════════════════════════════════════════
const Journey = ({user,fb,svc,covers,onLogout,onNavigate}) => {
  const {products,losses,dishes,daily,disabledTasks,mepActual,history,offline} = fb;
  const rc = ROLES[user.r]||ROLES["Manager"];
  const col = rc.c;
  const dk = todayK();
  const sk = `${dk}_${svc}`;
  const st = daily[sk]||{};
  const chks = st.chks||{};
  const [view,setView] = useState("journey");
  const [phase,setPhase] = useState(st.currentPhase||rc.phases[0]);

  const getActiveTasks = p => {
    if(p==="mep") return [];
    return (rc.tasks[p]||[]).filter(t=>!disabledTasks[t.id]);
  };

  const getMep = () => (dishes||[]).filter(d=>d.svc?.includes(svc)).map(d=>({
    id:`m_${d.id}`, dishId:d.id, l:d.n, pts:Math.ceil(covers*(d.r||0.3)),
    subs:(d.comps||[]).map(c=>({id:`m_${d.id}_${c.id}`,l:c.l,qty:Math.ceil(covers*(d.r||0.3)*(c.pc||0)),u:c.u,note:c.note}))
  }));

  const getPct = p => {
    if(p==="mep"){const t=getMep().flatMap(d=>d.subs);return t.length?t.filter(x=>chks[x.id]).length/t.length:1;}
    const t=getActiveTasks(p);return t.length?t.filter(x=>chks[x.id]).length/t.length:1;
  };
  const pOk = p => getPct(p)>=1;
  const unlocked = p => {const i=rc.phases.indexOf(p);return i===0||pOk(rc.phases[i-1]);};

  const tog = async(taskId,taskLabel,phase_) => {
    const done=!chks[taskId];
    const newChks={...chks,[taskId]:done};
    await setDoc(cols.daily(dk,svc),{...st,chks:newChks},{merge:true});
    await logAction(done?"task_checked":"task_unchecked",user,{task:taskLabel,phase:phase_,service:svc});
  };

  const advance = async(p) => {
    const i=rc.phases.indexOf(p), nx=rc.phases[i+1];
    if(nx){
      await setDoc(cols.daily(dk,svc),{...st,currentPhase:nx},{merge:true});
      await logAction("phase_advanced",user,{phase:nx,service:svc});
      setPhase(nx);
    }
  };

  const setMepActualVal = async(key,val) => {
    await fb.setMepActualVal(key,val,user);
  };

  const oPct = Math.round(rc.phases.reduce((s,p)=>s+getPct(p),0)/rc.phases.length*100);
  const allDone = rc.phases.every(p=>pOk(p));
  const curTasks = phase==="mep"?getMep():getActiveTasks(phase);
  const curDone = phase==="mep"?curTasks.flatMap(d=>d.subs).filter(s=>chks[s.id]).length:curTasks.filter(t=>chks[t.id]).length;
  const curTot = phase==="mep"?curTasks.flatMap(d=>d.subs).length:curTasks.length;

  const myP = myProds(products,user.r);
  const alertN = myP.filter(p=>p.q<p.m).length;
  const prof = rc.profil;
  const rupN = (losses||[]).filter(l=>l.rsn==="Rupture de stock"&&!l.res&&(l.prof===prof||l.prof==="both")).length;
  const coursN = alertN+rupN;
  const histN = history.filter(h=>h.user===user.n).length;

  const VIEWS=[
    {id:"journey",l:"Service",icon:"🗓"},
    {id:"stock",l:"Stocks",icon:"📦",b:alertN>0?alertN:null},
    {id:"inventaire",l:"Inventaire",icon:"📋"},
    {id:"pertes",l:"Pertes",icon:"🗑",b:rupN>0?rupN:null},
    {id:"courses",l:"Courses",icon:"🛒",b:coursN>0?coursN:null},
    {id:"history",l:"Historique",icon:"📜"},
  ];

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
      {/* HEADER */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"12px 16px",boxShadow:T.shadow}} className="no-print">
        <div style={{display:"flex",alignItems:"center",gap:10,maxWidth:680,margin:"0 auto"}}>
          <div style={{width:38,height:38,borderRadius:10,flexShrink:0,background:`${col}18`,border:`2px solid ${col}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{rc.i}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:14,color:T.t1}}>{user.n}</div>
            <div style={{fontSize:12,color:col,fontWeight:600}}>{user.r}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:20,background:svc==="Déjeuner"?T.yelL:T.purL,color:svc==="Déjeuner"?T.yel:T.pur,whiteSpace:"nowrap"}}>{svc}</div>
              <div style={{fontSize:11,color:T.t3,marginTop:2,whiteSpace:"nowrap"}}>{covers} couverts</div>
            </div>
            {view==="journey"&&<Ring v={oPct} max={100} c={allDone?T.grn:col} sz={40} sw={4}/>}
            <button onClick={onLogout} title="Déconnexion" style={{width:34,height:34,borderRadius:8,border:`1px solid ${T.border}`,background:T.bg,color:T.t3,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>⬅</button>
          </div>
        </div>
        {view==="journey"&&(
          <div style={{display:"flex",gap:3,marginTop:10,maxWidth:680,margin:"10px auto 0"}}>
            {rc.phases.map(p=>{const d=pOk(p),a=p===phase,lk=!unlocked(p);return<div key={p} onClick={()=>!lk&&setPhase(p)} style={{flex:1,height:5,borderRadius:3,cursor:lk?"not-allowed":"pointer",background:d?T.grn:a?col:T.border,opacity:lk&&!d?.3:1,transition:"all .3s"}} title={rc.labels[p]}/>;})}</div>
        )}
      </div>

      {/* NAV */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`}} className="no-print">
        <div style={{display:"flex",gap:0,overflowX:"auto",scrollbarWidth:"none",maxWidth:680,margin:"0 auto"}}>
          {VIEWS.map(v=>(
            <button key={v.id} onClick={()=>setView(v.id)} style={{display:"flex",alignItems:"center",gap:4,padding:"10px 12px",border:"none",borderBottom:`2px solid ${view===v.id?col:"transparent"}`,background:"transparent",color:view===v.id?col:T.t3,cursor:"pointer",fontWeight:view===v.id?700:500,fontSize:12,whiteSpace:"nowrap",transition:"all .15s",flexShrink:0}}>
              <span>{v.icon}</span>{v.l}
              {v.b!=null&&<span style={{background:T.red,color:"#fff",borderRadius:10,fontSize:9,fontWeight:700,padding:"1px 5px",fontFamily:"'DM Mono',monospace"}}>{v.b}</span>}
            </button>
          ))}
        </div>
      </div>

      {offline&&<div style={{padding:"0 16px",maxWidth:680,margin:"8px auto 0"}}><OfflineBanner/></div>}

      {/* CONTENT */}
      <div style={{padding:16,paddingBottom:80,maxWidth:680,margin:"0 auto",flex:1,width:"100%"}} className="up">
        {view==="stock"      &&<StockView products={products} fb={fb} role={user.r} user={user}/>}
        {view==="inventaire" &&<InventaireView products={products} fb={fb} role={user.r} user={user}/>}
        {view==="pertes"     &&<PertesView products={products} losses={losses} fb={fb} role={user.r} user={user}/>}
        {view==="courses"    &&<CoursesView products={products} losses={losses} role={user.r} fb={fb} user={user}/>}
        {view==="history"    &&<HistoryView history={history} user={user} isAdmin={false}/>}

        {view==="journey"&&(
          <>
            <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:16,paddingBottom:4,scrollbarWidth:"none"}}>
              {rc.phases.map(p=>{
                const d=pOk(p),a=p===phase,lk=!unlocked(p);
                return <button key={p} onClick={()=>!lk&&setPhase(p)} style={{display:"flex",alignItems:"center",gap:4,padding:"7px 12px",borderRadius:20,flexShrink:0,border:`1px solid ${a?col:d?T.grn:T.border}`,background:a?col:d?T.grnL:"#fff",color:a?"#fff":d?T.grn:lk?T.t4:T.t2,cursor:lk?"not-allowed":"pointer",fontWeight:600,fontSize:12,boxShadow:a?`0 2px 8px ${col}40`:"none",transition:"all .2s"}}>
                  {d?"✓":lk?"🔒":""} {rc.labels[p]}
                </button>;
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
              <Card style={{marginBottom:16,textAlign:"center",padding:24,background:T.redL,border:`1px solid ${T.redB}`}}>
                <div style={{fontSize:28,marginBottom:8}}>🔒</div>
                <div style={{fontWeight:700,color:T.red}}>Phase verrouillée</div>
                <div style={{fontSize:13,color:T.t2,marginTop:6}}>Complétez d'abord : <strong>{rc.labels[rc.phases[rc.phases.indexOf(phase)-1]]}</strong></div>
              </Card>
            )}

            {unlocked(phase)&&phase==="mep"&&(
              <div>
                {curTasks.length===0&&<div style={{textAlign:"center",padding:32,color:T.t3,fontSize:13}}>Aucun plat pour ce service.</div>}
                {curTasks.map(d=>{
                  const done=d.subs.every(s=>chks[s.id]),cnt=d.subs.filter(s=>chks[s.id]).length;
                  const actualKey=`${d.dishId}_${svc}`;
                  const actual=mepActual?.[actualKey];
                  return (
                    <Card key={d.id} style={{marginBottom:12}} hi={done} hc={T.grn}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${T.border}`}}>
                        <div><div style={{fontWeight:700,fontSize:15,color:done?T.grn:T.t1,marginBottom:3}}>{d.l}</div><Badge c={done?T.grn:col}>{cnt}/{d.subs.length} étapes</Badge></div>
                        <div style={{textAlign:"right"}}><div style={{fontSize:11,color:T.t3,marginBottom:2}}>Recommandé</div><div className="mono" style={{fontSize:22,fontWeight:700,color:col}}>{d.pts}</div><div style={{fontSize:11,color:T.t3}}>portions</div></div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,padding:"8px 12px",background:T.bg,borderRadius:8}}>
                        <span style={{fontSize:12,color:T.t2,flex:1}}>Quantité réelle produite :</span>
                        <input type="number" value={actual??d.pts} onChange={e=>setMepActualVal(actualKey,parseInt(e.target.value)||0)} style={{width:64,textAlign:"center",background:"#fff",border:`1px solid ${actual&&actual!==d.pts?T.org:T.border}`,borderRadius:8,padding:"5px 4px",color:actual&&actual!==d.pts?T.org:T.t1,fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:600,outline:"none"}}/>
                        <span style={{fontSize:12,color:T.t3}}>portions</span>
                        {actual&&actual!==d.pts&&<Badge c={T.org} sm>Modifié</Badge>}
                      </div>
                      {d.subs.map(s=>(
                        <div key={s.id} onClick={()=>tog(s.id,s.l,"mep")} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.border}`,cursor:"pointer",opacity:chks[s.id]?.5:1,transition:"opacity .2s"}}>
                          <div style={{width:20,height:20,borderRadius:5,flexShrink:0,marginTop:1,border:`2px solid ${chks[s.id]?T.grn:T.borderB}`,background:chks[s.id]?T.grn:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{chks[s.id]&&<span style={{color:"#fff",fontSize:10,fontWeight:700}}>✓</span>}</div>
                          <div style={{flex:1}}><div style={{fontSize:13,textDecoration:chks[s.id]?"line-through":"none"}}>{s.l}</div>{s.note&&<div style={{fontSize:11,color:T.t3,fontStyle:"italic",marginTop:1}}>{s.note}</div>}</div>
                          <div style={{textAlign:"right",flexShrink:0}}><div className="mono" style={{fontSize:14,fontWeight:600,color:chks[s.id]?T.grn:T.acc}}>{s.qty>999?`${(s.qty/1000).toFixed(1)}k`:s.qty}</div><div style={{fontSize:10,color:T.t3}}>{s.u}</div></div>
                        </div>
                      ))}
                    </Card>
                  );
                })}
              </div>
            )}

            {unlocked(phase)&&phase!=="mep"&&(
              <div>
                {curTasks.length===0&&<Card style={{textAlign:"center",padding:20,color:T.t3}}>Toutes les tâches ont été désactivées par le manager.</Card>}
                {curTasks.map(t=>(
                  <div key={t.id} onClick={()=>tog(t.id,t.t,phase)} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"13px 14px",background:chks[t.id]?T.grnL:"#fff",border:`1px solid ${chks[t.id]?T.grnB:T.border}`,borderRadius:10,cursor:"pointer",marginBottom:8,transition:"all .2s",boxShadow:chks[t.id]?"none":T.shadow}}>
                    <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${chks[t.id]?T.grn:T.borderB}`,background:chks[t.id]?T.grn:"#fff",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>{chks[t.id]&&<span style={{color:"#fff",fontSize:12,fontWeight:700}}>✓</span>}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,color:chks[t.id]?T.t3:T.t1,textDecoration:chks[t.id]?"line-through":"none",fontWeight:500,lineHeight:1.4}}>{t.t}</div>
                      <div style={{display:"flex",gap:4,marginTop:5}}>{t.k&&<Badge c={T.red} sm>Critique</Badge>}{t.h&&<Badge c={T.org} sm>HACCP</Badge>}</div>
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
                    <div><div style={{fontWeight:700,fontSize:14,color:T.grn}}>Phase terminée !</div><div style={{fontSize:12,color:T.t2}}>{rc.labels[rc.phases[rc.phases.indexOf(phase)+1]]} est débloquée</div></div>
                  </div>
                </Card>
                <Btn onClick={()=>advance(phase)} full col={col} icon="→">Passer à : {rc.labels[rc.phases[rc.phases.indexOf(phase)+1]]}</Btn>
              </div>
            )}

            {allDone&&(
              <Card style={{marginTop:20,textAlign:"center",padding:28,background:`${col}08`,border:`2px solid ${col}30`}}>
                <div style={{fontSize:40,marginBottom:10}}>{rc.i}</div>
                <div style={{fontSize:20,fontWeight:700,color:col}}>Bravo !</div>
                <div style={{fontSize:14,color:T.t2,marginTop:4}}>Toutes les phases du {svc} complétées</div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// LOGIN — corrigé (bouton dans le cadre)
// ═══════════════════════════════════════════════════════
const Login = ({staff,onLogin,svc,setSvc,settings}) => {
  const [sel,setSel]=useState(null);
  const [pin,setPin]=useState("");
  const [err,setErr]=useState("");
  const [apw,setApw]=useState("");
  const [showAdmin,setShowAdmin]=useState(false);
  const cvr=settings?.cvr?.[todayK()]||0;
  const auto=detSvc(settings);
  const aff=cvr>=100?{l:"Forte affluence",c:T.red,bg:T.redL}:cvr>=70?{l:"Affluence moyenne",c:T.org,bg:T.orgL}:{l:"Service calme",c:T.grn,bg:T.grnL};

  const tryLogin=()=>{
    if(showAdmin){
      if(apw===""||apw==="admin"){onLogin({id:0,n:"Admin",r:"Manager",admin:true});return;}
      setErr("Mot de passe incorrect");return;
    }
    const m=staff.find(s=>s.id===sel||String(s.id)===String(sel));
    if(m&&(m.pin===pin||pin==="")){onLogin(m);setErr("");}
    else{setErr("PIN incorrect");setPin("");}
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Header bleu */}
      <div style={{background:T.acc,padding:"28px 24px 20px",textAlign:"center",flexShrink:0}}>
        <div style={{fontSize:26,fontWeight:700,color:"#fff",letterSpacing:-.5}}>L'Embouchure</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.75)",marginTop:3}}>Système opérationnel</div>
        <div className="mono" style={{fontSize:11,color:"rgba(255,255,255,.5)",marginTop:3}}>{dnow()} · {tnow()}</div>
      </div>

      {/* Corps scrollable */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 32px"}}>
        <div style={{maxWidth:420,margin:"0 auto"}}>
          {/* Service selector */}
          <Card style={{marginBottom:14,padding:14}}>
            <div style={{fontSize:11,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:10,textAlign:"center"}}>Service actif</div>
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {["Déjeuner","Dîner","Brunch"].map(s=>{
                const active=svc===s, c=s==="Déjeuner"?T.yel:s==="Dîner"?T.pur:T.acc;
                return <button key={s} onClick={()=>setSvc(s)} style={{flex:1,padding:"9px 4px",borderRadius:10,border:`2px solid ${active?c:T.border}`,background:active?`${c}18`:"#fff",color:active?c:T.t3,cursor:"pointer",fontWeight:600,fontSize:12,transition:"all .15s"}}>
                  {s}{s===auto&&<span style={{fontSize:9,opacity:.6}}> ●</span>}
                </button>;
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:aff.bg,borderRadius:8}}>
              <span style={{fontSize:13,color:aff.c,fontWeight:600}}>{aff.l}</span>
              <span className="mono" style={{fontSize:15,color:T.t1,fontWeight:700}}>{cvr} couverts</span>
            </div>
          </Card>

          {/* Staff list */}
          {!sel&&!showAdmin&&(
            <>
              <div style={{fontSize:11,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Qui êtes-vous ?</div>
              {staff.filter(s=>s.on).map(s=>{
                const rc=ROLES[s.r];
                return <Card key={s.id} onClick={()=>setSel(s.id)} style={{marginBottom:8,display:"flex",alignItems:"center",gap:12,cursor:"pointer",padding:"12px 14px"}}>
                  <div style={{width:44,height:44,borderRadius:12,flexShrink:0,background:`${rc?.c||T.acc}18`,border:`2px solid ${rc?.c||T.acc}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{rc?.i||"👤"}</div>
                  <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{s.n}</div><div style={{fontSize:12,color:rc?.c||T.t2,fontWeight:500,marginTop:1}}>{s.r}</div></div>
                  <div style={{color:T.t4,fontSize:18}}>›</div>
                </Card>;
              })}
              {staff.filter(s=>s.on).length===0&&(
                <Card style={{textAlign:"center",padding:24,color:T.t3}}>
                  <div style={{fontSize:32,marginBottom:8}}>👥</div>
                  <div style={{fontWeight:600}}>Aucun membre actif</div>
                  <div style={{fontSize:12,marginTop:4}}>Connectez-vous en tant qu'administrateur pour ajouter du personnel.</div>
                </Card>
              )}
              <div style={{marginTop:16,textAlign:"center"}}>
                <button onClick={()=>setShowAdmin(true)} style={{background:"none",border:"none",color:T.t3,cursor:"pointer",fontSize:13,textDecoration:"underline",padding:"8px 16px"}}>
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
                <div style={{fontWeight:700,fontSize:16}}>Accès Administrateur</div>
              </div>
              <FIn label="Mot de passe" val={apw} set={setApw} type="password" ph="Mot de passe (admin ou vide)"/>
              {err&&<div style={{color:T.red,fontSize:13,marginBottom:8,fontWeight:500}}>{err}</div>}
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={()=>{setShowAdmin(false);setErr("");setApw("");}} variant="ghost" full sm>Retour</Btn>
                <Btn onClick={tryLogin} full sm>Connexion →</Btn>
              </div>
            </Card>
          )}

          {/* PIN pad */}
          {sel&&!showAdmin&&(()=>{
            const m=staff.find(s=>s.id===sel||String(s.id)===String(sel)),rc=ROLES[m?.r];
            return (
              <Card className="up">
                <div style={{textAlign:"center",marginBottom:16}}>
                  <div style={{width:60,height:60,borderRadius:16,background:`${rc?.c||T.acc}18`,border:`2px solid ${rc?.c||T.acc}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 10px"}}>{rc?.i}</div>
                  <div style={{fontWeight:700,fontSize:17}}>{m?.n}</div>
                  <div style={{fontSize:13,color:rc?.c,fontWeight:600,marginTop:2}}>{m?.r}</div>
                </div>
                <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:16}}>
                  {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:pin.length>i?T.acc:T.border,transition:"all .2s"}}/>)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                  {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>(
                    <button key={i} onClick={()=>{if(k==="⌫")setPin(p=>p.slice(0,-1));else if(k!=="")setPin(p=>p.length<4?p+k:p);}}
                      style={{padding:"14px",borderRadius:12,border:`1px solid ${T.border}`,background:k===""?"transparent":T.bg,color:T.t1,fontSize:18,fontWeight:600,cursor:k===""?"default":"pointer",opacity:k===""?0:1,boxShadow:k===""?"none":T.shadow}}>
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
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════════════════════════
const Admin = ({fb,svc,covers,onLogout}) => {
  const {products,dishes,staff,settings,losses,history,disabledTasks,offline} = fb;
  const [tab,setTab]=useState("vue");
  const [deepView,setDeepView]=useState(null); // {view,filter}
  const dk=todayK();

  const navigate = (view,filter) => { setTab("vue"); setDeepView({view,filter}); };

  const TABS=[{id:"vue",l:"Vue",i:"📊"},{id:"taches",l:"Tâches",i:"✅"},{id:"produits",l:"Produits",i:"🗂️"},{id:"courses",l:"Courses",i:"🛒"},{id:"pertes",l:"Pertes",i:"🗑"},{id:"equipe",l:"Équipe",i:"👥"},{id:"config",l:"Config",i:"⚙️"},{id:"history",l:"Historique",i:"📜"}];

  // Si deep navigation active
  if(deepView) {
    return (
      <div style={{minHeight:"100vh",background:T.bg}}>
        <div style={{background:T.acc,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setDeepView(null)} style={{background:"rgba(255,255,255,.2)",border:"1px solid rgba(255,255,255,.3)",color:"#fff",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:13,fontWeight:600}}>← Retour</button>
          <span style={{color:"#fff",fontWeight:600,fontSize:14}}>{settings?.name}</span>
        </div>
        <div style={{padding:16,maxWidth:800,margin:"0 auto"}}>
          {deepView.view==="stock-urgent"&&<StockView products={products} fb={fb} role="Manager" user={{n:"Admin",r:"Manager"}} filterUrgent={true}/>}
          {deepView.view==="stock-alert"&&<StockView products={products} fb={fb} role="Manager" user={{n:"Admin",r:"Manager"}}/>}
          {deepView.view==="courses"&&<CoursesView products={products} losses={losses} role="Manager" fb={fb} user={{n:"Admin",r:"Manager"}}/>}
          {deepView.view==="pertes"&&<PertesView products={products} losses={losses} fb={fb} role="Manager" user={{n:"Admin",r:"Manager"}}/>}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
      <div style={{background:T.acc,padding:"14px 16px",boxShadow:T.shadowM,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:800,margin:"0 auto"}}>
          <div><div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{settings?.name||"L'Embouchure"}</div><div style={{fontSize:12,color:"rgba(255,255,255,.7)"}}>{dnow()} · {svc} · {covers} couverts</div></div>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)",color:"#fff",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:13,fontWeight:600,flexShrink:0}}>Déconnexion</button>
        </div>
      </div>

      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{display:"flex",overflowX:"auto",scrollbarWidth:"none",maxWidth:800,margin:"0 auto"}}>
          {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:4,padding:"12px 13px",border:"none",borderBottom:`2px solid ${tab===t.id?T.acc:"transparent"}`,background:"transparent",color:tab===t.id?T.acc:T.t3,cursor:"pointer",fontWeight:tab===t.id?700:500,fontSize:12,whiteSpace:"nowrap",transition:"all .15s",flexShrink:0}}><span>{t.i}</span>{t.l}</button>)}
        </div>
      </div>

      {offline&&<div style={{padding:"0 16px",maxWidth:800,margin:"8px auto 0"}}><OfflineBanner/></div>}

      <div style={{padding:16,paddingBottom:60,maxWidth:800,margin:"0 auto",flex:1,width:"100%"}} className="up">
        {tab==="vue"     &&<AdminVue fb={fb} svc={svc} covers={covers} onNavigate={navigate}/>}
        {tab==="taches"  &&<AdminTaches fb={fb}/>}
        {tab==="produits"&&<AdminProduitsPanel fb={fb}/>}
        {tab==="courses" &&<CoursesView products={products} losses={losses} role="Manager" fb={fb} user={{n:"Admin",r:"Manager"}}/>}
        {tab==="pertes"  &&<PertesView products={products} losses={losses} fb={fb} role="Manager" user={{n:"Admin",r:"Manager"}}/>}
        {tab==="equipe"  &&<AdminEquipe fb={fb}/>}
        {tab==="config"  &&<AdminConfig fb={fb}/>}
        {tab==="history" &&<HistoryView history={history} user={{n:"Admin"}} isAdmin={true}/>}
      </div>
    </div>
  );
};

// ─── Admin Vue (cliquable) ────────────────────────────
const AdminVue = ({fb,svc,covers,onNavigate}) => {
  const {products,losses,daily,disabledTasks,staff,settings} = fb;
  const dk=todayKey();
  const sp=staff.filter(s=>s.on).map(s=>{
    const rc=ROLES[s.r];if(!rc)return null;
    const chks=daily?.[`${dk}_${svc}`]?.chks||{};
    let tot=0,dn=0;
    rc.phases.forEach(p=>{if(p==="mep")return;const t=(rc.tasks[p]||[]).filter(x=>!disabledTasks[x.id]);tot+=t.length;dn+=t.filter(x=>chks[x.id]).length;});
    return{...s,pct:tot>0?Math.round(dn/tot*100):0,dn,tot,rc};
  }).filter(Boolean);

  const low=(products||[]).filter(p=>p.q<p.m);
  const urg=(products||[]).filter(p=>p.urg&&p.q<p.m);
  const ruptures=(losses||[]).filter(l=>l.rsn==="Rupture de stock"&&!l.res);

  return (
    <div>
      {/* KPIs cliquables */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
        <Card style={{textAlign:"center",padding:"14px 10px",cursor:"pointer"}} onClick={()=>onNavigate("stock-urgent")} hi={urg.length>0} hc={T.red}>
          <div style={{fontSize:22}}>🚨</div>
          <div className="mono" style={{fontSize:22,fontWeight:700,color:urg.length>0?T.red:T.grn}}>{urg.length}</div>
          <div style={{fontSize:11,color:T.t3,marginTop:2}}>Urgents</div>
          {urg.length>0&&<div style={{fontSize:10,color:T.acc,marginTop:4}}>Voir →</div>}
        </Card>
        <Card style={{textAlign:"center",padding:"14px 10px",cursor:"pointer"}} onClick={()=>onNavigate("stock-alert")} hi={low.length>0} hc={T.org}>
          <div style={{fontSize:22}}>📦</div>
          <div className="mono" style={{fontSize:22,fontWeight:700,color:low.length>0?T.org:T.grn}}>{low.length}</div>
          <div style={{fontSize:11,color:T.t3,marginTop:2}}>Alertes stock</div>
          {low.length>0&&<div style={{fontSize:10,color:T.acc,marginTop:4}}>Voir →</div>}
        </Card>
        <Card style={{textAlign:"center",padding:"14px 10px",cursor:"pointer"}} onClick={()=>onNavigate("courses")} hi={low.length>0||ruptures.length>0} hc={T.pur}>
          <div style={{fontSize:22}}>🛒</div>
          <div className="mono" style={{fontSize:22,fontWeight:700,color:T.pur}}>{low.length+ruptures.length}</div>
          <div style={{fontSize:11,color:T.t3,marginTop:2}}>À commander</div>
          <div style={{fontSize:10,color:T.acc,marginTop:4}}>Voir →</div>
        </Card>
      </div>

      {/* Urgents cliquables */}
      {urg.length>0&&(
        <Card style={{marginBottom:16,background:T.redL,border:`1px solid ${T.redB}`,cursor:"pointer"}} onClick={()=>onNavigate("stock-urgent")}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:T.red}}>🚨 Produits urgents</div>
            <span style={{fontSize:12,color:T.acc}}>Voir tout →</span>
          </div>
          {urg.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.redB}`,fontSize:13}}>
            <span style={{fontWeight:500}}>{p.n}</span>
            <span className="mono" style={{color:T.red}}>{p.q}/{p.m} {p.u}</span>
          </div>)}
        </Card>
      )}

      {/* Ruptures cliquables */}
      {ruptures.length>0&&(
        <Card style={{marginBottom:16,cursor:"pointer"}} onClick={()=>onNavigate("pertes")}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:T.red}}>⛔ Ruptures de stock</div>
            <span style={{fontSize:12,color:T.acc}}>Gérer →</span>
          </div>
          {ruptures.slice(0,3).map(l=><div key={l.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12,color:T.t2}}><span>{l.pn}</span><span className="mono" style={{color:T.red}}>−{l.qty} {l.u}</span></div>)}
        </Card>
      )}

      {/* Avancement équipe */}
      <Divider label="Avancement équipe"/>
      {sp.map(s=>(
        <Card key={s.id} style={{marginBottom:8,padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:`${s.rc.c}15`,border:`2px solid ${s.rc.c}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{s.rc.i}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><span style={{fontWeight:600,fontSize:13}}>{s.n}</span><span className="mono" style={{fontSize:12,fontWeight:600,color:s.pct===100?T.grn:s.rc.c}}>{s.pct}%</span></div>
              <Bar v={s.dn} max={s.tot} c={s.pct===100?T.grn:s.rc.c}/>
            </div>
          </div>
        </Card>
      ))}

      {/* Semaine */}
      <Divider label="Couverts semaine"/>
      <Card>{Object.entries(settings?.cvr||{}).map(([d,c])=>{const iT=d===dk,af=c>=100?T.red:c>=70?T.yel:T.grn;return<div key={d} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div className="mono" style={{width:28,fontSize:11,color:iT?T.acc:T.t3,fontWeight:iT?700:400}}>{d.toUpperCase()}</div><div style={{flex:1}}><Bar v={c} max={150} c={iT?T.acc:af}/></div><div className="mono" style={{fontSize:12,color:iT?T.acc:T.t2,width:40,textAlign:"right",fontWeight:iT?700:400}}>{c}</div></div>;})}</Card>
    </div>
  );
};

// ─── Admin Tâches ─────────────────────────────────────
const AdminTaches = ({fb}) => {
  const {disabledTasks,toggleDisabledTask} = fb;
  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:700,marginBottom:4}}>Gestion des tâches</h2>
      <div style={{fontSize:13,color:T.t3,marginBottom:16}}>Activez ou désactivez les tâches. Les tâches désactivées disparaissent pour le personnel.</div>
      {Object.entries(ROLES).map(([role,rc])=>(
        <div key={role} style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"8px 12px",background:`${rc.c}10`,borderRadius:10,border:`1px solid ${rc.c}30`}}>
            <span style={{fontSize:18}}>{rc.i}</span><span style={{fontWeight:700,fontSize:14,color:rc.c}}>{role}</span>
          </div>
          {rc.phases.filter(p=>p!=="mep").map(p=>{
            const tasks=rc.tasks[p]||[];
            if(!tasks.length) return null;
            return <div key={p} style={{marginBottom:12,paddingLeft:8}}>
              <div style={{fontSize:11,fontWeight:600,color:T.t3,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>{rc.labels[p]}</div>
              {tasks.map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:disabledTasks[t.id]?T.bg:"#fff",border:`1px solid ${T.border}`,borderRadius:8,marginBottom:5,opacity:disabledTasks[t.id]?.5:1}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:disabledTasks[t.id]?T.t3:T.t1,textDecoration:disabledTasks[t.id]?"line-through":"none",fontWeight:500}}>{t.t}</div>
                    <div style={{display:"flex",gap:4,marginTop:3}}>{t.k&&<Badge c={T.red} sm>Critique</Badge>}{t.h&&<Badge c={T.org} sm>HACCP</Badge>}</div>
                  </div>
                  <Toggle on={!disabledTasks[t.id]} set={()=>toggleDisabledTask(t.id)} c={T.grn}/>
                </div>
              ))}
            </div>;
          })}
        </div>
      ))}
    </div>
  );
};

// ─── Admin Produits ───────────────────────────────────
const AdminProduitsPanel = ({fb}) => {
  const {products} = fb;
  const [pf,setPf]=useState("Tous");const [cf,setCf]=useState("Tous");
  const [showA,setShowA]=useState(false);const [editId,setEditId]=useState(null);
  const [form,setForm]=useState({n:"",u:"",q:0,m:1,cat:"",p:"cuisine",urg:false});
  const cats=["Tous",...new Set(products.map(p=>p.cat))];
  const shown=products.filter(p=>(pf==="Tous"||p.p===pf)&&(cf==="Tous"||p.cat===cf));
  const PL={cuisine:"🍳 Cuisine",salle:"🍷 Salle",both:"🔄 Les deux"};
  const user={n:"Admin",r:"Manager"};

  const saveP=async()=>{if(!form.n||!form.u)return;await fb.addProduct({...form,q:parseFloat(form.q)||0,m:parseFloat(form.m)||1},user);setForm({n:"",u:"",q:0,m:1,cat:"",p:"cuisine",urg:false});setShowA(false);};
  const remP=id=>fb.delProduct(id,user);
  const updP=(id,k,v)=>fb.updProduct(id,{[k]:k==="q"||k==="m"?parseFloat(v)||0:v},user);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><h2 style={{fontSize:18,fontWeight:700}}>Produits</h2><div style={{fontSize:13,color:T.t3,marginTop:2}}>{products.length} produits</div></div>
        <Btn onClick={()=>setShowA(!showA)} variant="secondary" sm icon="➕">Ajouter</Btn>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
        {["Tous","cuisine","salle","both"].map(p=><button key={p} onClick={()=>setPf(p)} style={{padding:"5px 12px",borderRadius:20,flexShrink:0,border:`1px solid ${pf===p?T.acc:T.border}`,background:pf===p?T.acc:"#fff",color:pf===p?"#fff":T.t2,cursor:"pointer",fontWeight:500,fontSize:12}}>{p==="Tous"?"Tous":PL[p]}</button>)}
      </div>
      <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:14,paddingBottom:4,scrollbarWidth:"none"}}>
        {cats.map(c=><button key={c} onClick={()=>setCf(c)} style={{padding:"5px 12px",borderRadius:20,flexShrink:0,border:`1px solid ${cf===c?T.pur:T.border}`,background:cf===c?T.purL:"#fff",color:cf===c?T.pur:T.t2,cursor:"pointer",fontWeight:500,fontSize:12}}>{c}</button>)}
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
            <div style={{display:"flex",gap:6}}>{["cuisine","salle","both"].map(pr=><button key={pr} onClick={()=>setForm(p=>({...p,p:pr}))} style={{flex:1,padding:"7px 4px",borderRadius:8,border:`1px solid ${form.p===pr?T.acc:T.border}`,background:form.p===pr?T.acc:"#fff",color:form.p===pr?"#fff":T.t2,cursor:"pointer",fontWeight:500,fontSize:11}}>{PL[pr]}</button>)}</div>
          </div>
          <div style={{marginBottom:12}}><Toggle on={form.urg} set={()=>setForm(p=>({...p,urg:!p.urg}))} label="Urgent 🚨" c={T.red}/></div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={()=>setShowA(false)} variant="ghost" full sm>Annuler</Btn>
            <Btn onClick={saveP} full sm dis={!form.n||!form.u} icon="✓">Ajouter</Btn>
          </div>
        </Card>
      )}
      {shown.map(p=>{
        const al=p.q<p.m,ed=editId===p.id;
        return <Card key={p.id} style={{marginBottom:8}} hi={p.urg&&al} hc={T.red}>
          {ed?(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                <FIn label="Nom" val={p.n} set={v=>updP(p.id,"n",v)}/>
                <FIn label="Catégorie" val={p.cat} set={v=>updP(p.id,"cat",v)}/>
                <FIn label="Actuel" val={p.q} set={v=>updP(p.id,"q",v)} type="number"/>
                <FIn label="Minimum" val={p.m} set={v=>updP(p.id,"m",v)} type="number"/>
                <FIn label="Unité" val={p.u} set={v=>updP(p.id,"u",v)}/>
                <div><div style={{fontSize:11,color:T.t2,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Profil</div><select value={p.p} onChange={e=>updP(p.id,"p",e.target.value)} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 10px",color:T.t1,fontSize:13,outline:"none"}}><option value="cuisine">🍳 Cuisine</option><option value="salle">🍷 Salle</option><option value="both">🔄 Les deux</option></select></div>
              </div>
              <div style={{marginBottom:10}}><Toggle on={!!p.urg} set={()=>updP(p.id,"urg",!p.urg)} label="Urgent 🚨" c={T.red}/></div>
              <Btn onClick={()=>setEditId(null)} full sm variant="success">Valider ✓</Btn>
            </div>
          ):(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div><div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:4}}><span style={{fontWeight:600,fontSize:13}}>{p.n}</span>{al&&<Badge c={T.red} sm>Alerte</Badge>}{p.urg&&<Badge c={T.red} sm>🚨</Badge>}</div><div style={{display:"flex",gap:4}}><Badge c={p.p==="cuisine"?T.org:p.p==="salle"?T.acc:T.pur} sm>{PL[p.p]}</Badge><Badge c={T.t3} sm>{p.cat}</Badge></div></div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}><span className="mono" style={{fontSize:14,fontWeight:600,color:al?T.red:T.t1}}>{p.q}<span style={{fontSize:11,color:T.t3,marginLeft:2}}>{p.u}</span></span><Btn onClick={()=>setEditId(p.id)} sm variant="secondary">✏️</Btn><Btn onClick={()=>remP(p.id)} sm variant="danger">✕</Btn></div>
              </div>
              <Bar v={p.q} max={p.m*2} c={al?T.red:p.q/p.m>1.5?T.grn:T.yel}/>
              <div style={{fontSize:11,color:T.t3,marginTop:4}}>Seuil : {p.m} {p.u}</div>
            </div>
          )}
        </Card>;
      })}
    </div>
  );
};

// ─── Admin Équipe ─────────────────────────────────────
const AdminEquipe = ({fb}) => {
  const {staff,addStaff,delStaff,updStaff} = fb;
  const [f,setF]=useState({n:"",r:"Cuisinier",pin:""});
  const add=async()=>{if(!f.n)return;await addStaff(f);setF({n:"",r:"Cuisinier",pin:""});};
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
            <select value={f.r} onChange={e=>setF(p=>({...p,r:e.target.value}))} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.t1,fontSize:13,outline:"none"}}>
              {Object.keys(ROLES).map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <Btn onClick={add} full icon="➕" dis={!f.n}>Ajouter</Btn>
      </Card>
      {staff.map(s=>{const rc=ROLES[s.r];return(
        <Card key={s.id} style={{marginBottom:8,display:"flex",alignItems:"center",gap:10,opacity:s.on?1:.5}}>
          <div style={{width:38,height:38,borderRadius:10,flexShrink:0,background:`${rc?.c||T.acc}18`,border:`2px solid ${rc?.c||T.acc}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{rc?.i||"👤"}</div>
          <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{s.n}</div><div style={{fontSize:12,color:rc?.c||T.t2,fontWeight:500}}>{s.r}</div></div>
          <div style={{display:"flex",gap:6}}>
            <Btn onClick={()=>updStaff(s.id,{on:!s.on})} sm variant="secondary">{s.on?"Pause":"Activer"}</Btn>
            <Btn onClick={()=>delStaff(s.id)} sm variant="danger">✕</Btn>
          </div>
        </Card>
      );})}
    </div>
  );
};

// ─── Admin Config ─────────────────────────────────────
const AdminConfig = ({fb}) => {
  const {settings,updSettings} = fb;
  const s=settings||{};
  const upd=(k,v)=>updSettings({[k]:v});
  const updC=(d,v)=>updSettings({cvr:{...(s.cvr||{}),[d]:parseInt(v)||0}});
  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:700,marginBottom:16}}>Configuration</h2>
      <Card style={{marginBottom:16}}>
        <FIn label="Nom du restaurant" val={s.name||""} set={v=>upd("name",v)}/>
        <Divider label="Détection automatique des services"/>
        {[{l:"Déjeuner commence",k:"lS"},{l:"Déjeuner se termine",k:"lE"},{l:"Dîner commence",k:"dS"}].map(f=>(
          <div key={f.k} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:T.t2,fontWeight:500}}>{f.l}</span><span className="mono" style={{fontSize:13,color:T.acc,fontWeight:600}}>{String(s[f.k]||0).padStart(2,"0")}h00</span></div>
            <input type="range" min={0} max={24} value={s[f.k]||0} onChange={e=>upd(f.k,parseInt(e.target.value))}/>
          </div>
        ))}
      </Card>
      <Card>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Couverts prévus par jour</div>
        {Object.entries(s.cvr||{}).map(([d,c])=>(
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
  const fb = useFirestore();
  const [user,setUser] = useState(null);
  const [svc,setSvc] = useState(()=>detSvc(null));

  useEffect(()=>{
    if(fb.settings) setSvc(s=>s||detSvc(fb.settings));
  },[fb.settings]);

  if(!fb.ready) return <><style>{css}</style><Loader/></>;

  const covers = fb.settings?.cvr?.[todayK()]||0;

  return (
    <>
      <style>{css}</style>
      {!user
        ? <Login staff={fb.staff} onLogin={setUser} svc={svc} setSvc={setSvc} settings={fb.settings||{}}/>
        : user.admin||user.r==="Manager"
          ? <Admin fb={fb} svc={svc} covers={covers} onLogout={()=>setUser(null)}/>
          : <Journey user={user} fb={fb} svc={svc} covers={covers} onLogout={()=>setUser(null)}/>
      }
    </>
  );
}
