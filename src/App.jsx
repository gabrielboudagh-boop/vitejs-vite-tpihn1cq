import { useState, useMemo, useEffect, useRef } from "react";

// ── Fonts ────────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap";
document.head.appendChild(fontLink);

const styleEl = document.createElement("style");
styleEl.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; }
  #root { max-width: 100% !important; padding: 0 !important; margin: 0 !important; width: 100%; text-align: left; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { border-radius: 3px; background: #2a2d35; }
  input, select, textarea, button { font-family: 'DM Sans', sans-serif; outline: none; }
  select option { background: #1a1d24; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
  @keyframes goldPulse {
    0%   { opacity: 0; }
    20%  { opacity: 1; filter: drop-shadow(0 0 10px #FFD700) drop-shadow(0 0 20px #FFD700); }
    60%  { opacity: 1; filter: drop-shadow(0 0 16px #FFD700) drop-shadow(0 0 30px #FFD700); }
    100% { opacity: 1; filter: drop-shadow(0 0 8px #DAA520); }
  }
  @keyframes logoFadeOut { from { opacity:1; } to { opacity:0; } }
  @keyframes splashLogoIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
  .fade-in { animation: fadeIn 0.28s ease forwards; }
  .session-row:hover { border-color: var(--bhov) !important; }
`;
document.head.appendChild(styleEl);

const Logo = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon: Modern minimalist steps forming a forward-moving 'V' */}
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-indigo-200">
        <svg 
          viewBox="0 0 24 24" 
          className="h-5 w-5 text-white" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M4 16v-2a2 2 0 0 1 2-2h2" />
          <path d="M8 12v-2a2 2 0 0 1 2-2h2" />
          <path d="M12 8V6a2 2 0 0 1 2-2h4" />
          <path d="M18 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
        </svg>
      </div>
      
      {/* Typography: Premium Academic / Tech Feel */}
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight text-slate-800 font-sans">
          Vima <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Vima</span>
        </span>
        <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 -mt-1">
          Step By Step
        </span>
      </div>
    </div>
  );
};

// ── Exam Modes ───────────────────────────────────────────────────────────────
const MODES = {
  USMLE: {
    label:"USMLE",
    subjects:["Cardiology","Pulmonology","Neurology","OB/GYN","GI","Renal","MSK","Derm","Heme/Onc","ID","Endo","Peds","Psych","Surgery","Biostats/Ethics","Other"],
    qtypes:["Diagnosis","Management","Biostats/Ethics","Pathophysiology","Pharmacology"],
  },
  MCAT: {
    label:"MCAT",
    subjects:["C/P","CARS","B/B","Psych/Soc"],
    qtypes:["Passage-based","Discrete","Research interpretation","Data analysis","Critical analysis"],
  },
  LSAT: {
    label:"LSAT",
    subjects:["Logical Reasoning","Analytical Reasoning","Reading Comprehension"],
    qtypes:["Strengthen","Weaken","Assumption","Inference","Flaw","Parallel","Method","Main Point","Must Be True","Cannot Be True"],
  },
};

const WRONG_REASONS   = ["Didn't know the material","Knew material, wrong algorithm","Ran out of time","Silly mistake / misread"];
const CORRECT_REASONS = ["Right reasoning","Guessed","Flawed reasoning"];
const ANSWER_CHANGES  = ["No change","Incorrect → Correct","Correct → Incorrect","Incorrect → Incorrect"];
const QBANKS_MAP = {
  USMLE:["UWorld","Amboss","NBME","Free 120","UWise","Kaplan","Other"],
  MCAT: ["UWorld MCAT","Kaplan","Princeton Review","Blueprint","AAMC Official","Khan Academy","Other"],
  LSAT: ["7Sage","PowerScore","Princeton Review","Manhattan Prep","LSAC Official","Khan Academy","Other"],
};

const pct = (c,t) => t ? Math.round((c/t)*100) : 0;

// ── Themes ───────────────────────────────────────────────────────────────────
const DARK = {
  bg:"#05080f", surface:"#080e1a", raised:"#0d1526",
  border:"rgba(82,140,220,0.12)", borderHov:"rgba(82,160,255,0.28)",
  text:"#d8e8ff", muted:"#3d5575", dim:"#7099c0",
  accent:"#2979e8", accentGlow:"rgba(41,121,232,0.20)",
  success:"#1db87a", danger:"#e8454a", warn:"#f5a623", gold:"#C9A84C",
  scoreColor:(p)=>p>=75?"#1db87a":p>=60?"#f5a623":"#e8454a",
  name:"dark",
};
const LIGHT = {
  bg:"#f4f6fb", surface:"#ffffff", raised:"#eef1f8",
  border:"rgba(0,0,0,0.07)", borderHov:"rgba(0,0,0,0.16)",
  text:"#0a0d1a", muted:"#9ba8be", dim:"#4a5568",
  accent:"#0055d4", accentGlow:"rgba(0,85,212,0.10)",
  success:"#16a34a", danger:"#dc2626", warn:"#d97706", gold:"#b8860b",
  scoreColor:(p)=>p>=75?"#16a34a":p>=60?"#d97706":"#dc2626",
  name:"light",
};

const subjColors = {
  Cardiology:"#3b82f6",Pulmonology:"#06b6d4",Neurology:"#8b5cf6","OB/GYN":"#ec4899",
  GI:"#f59e0b",Renal:"#14b8a6",MSK:"#84cc16",Derm:"#f97316","Heme/Onc":"#ef4444",
  ID:"#10b981",Endo:"#c084fc",Peds:"#fb923c",Psych:"#e879f9",Surgery:"#64748b",
  "Biostats/Ethics":"#64748b",Other:"#6b7280",
  "C/P":"#60a5fa","CARS":"#34d399","B/B":"#a78bfa","Psych/Soc":"#f472b6",
  "Logical Reasoning":"#fb923c","Analytical Reasoning":"#4ade80","Reading Comprehension":"#c084fc",
};

// ── Splash Screen ─────────────────────────────────────────────────────────────
function SplashScreen({ dark, onDone }) {
  const [phase, setPhase] = useState("in");
  // in → glow → out
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("glow"), 800);
    const t2 = setTimeout(() => setPhase("out"),  1800);
    const t3 = setTimeout(() => onDone(),          2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const bg = dark ? "#07090f" : "#f4f6fb";

  return (
    <div style={{
      position:"fixed", inset:0, background:bg,
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999,
      opacity: phase === "out" ? 0 : 1,
      transition: phase === "out" ? "opacity 0.7s ease" : "none",
    }}>
      <div style={{ position:"relative" }}>
        {/* Logo — always visible */}
        <img
          src={LOGO_SRC}
          alt="VIMA VIMA"
          style={{
            width: 400,
            display: "block",
            filter: dark ? "invert(1)" : "none",
            opacity: phase === "in" ? 0 : 1,
            animation: phase === "in" ? "splashLogoIn 0.6s ease forwards" : "none",
          }}
        />
        {/* Gold glow overlay — sits over just the ladder in the center */}
        <div style={{
          position: "absolute",
          top: "15%",
          left: "42%",
          width: "16%",
          height: "70%",
          background: "#FFD700",
          borderRadius: 3,
          opacity: phase === "glow" ? 0.85 : 0,
          transition: "opacity 0.5s ease",
          filter: "blur(6px)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}/>
      </div>
    </div>
  );
}

// ── Logo component (header) ───────────────────────────────────────────────────
function VimaLogo({ dark }) {
  return (
    <img
      src={LOGO_SRC}
      alt="VIMA VIMA"
      style={{
        height: 28,
        display: "block",
        filter: dark ? "invert(1) brightness(1.1)" : "none",
      }}
    />
  );
}

// ── Excel Export ──────────────────────────────────────────────────────────────
async function exportExcel(session) {
  // Build CSV-style data and create a styled HTML table that Excel can open
  const qs = session.questions;
  const total = qs.length;
  const correct = qs.filter(q=>q.result==="correct").length;
  const score = total ? Math.round((correct/total)*100) : 0;

  // We'll generate an HTML file that Excel reads with nice formatting
  const green = "#D6F5E3"; const red = "#FDE8E8"; const amber = "#FEF3C7";
  const navy = "#0D1020"; const gold = "#C9A84C"; const white = "#FFFFFF";
  const midGray = "#3A3F52"; const lightBg = "#F4F6FA"; const subBlue = "#DBEAFE";

  const scoreColor = score>=75?"#145C32":score>=60?"#78350F":"#8B1A1A";
  const scoreBg = score>=75?green:score>=60?amber:red;

  const changeStyle = (c) => {
    if(c==="Incorrect → Correct") return `background:${green};color:#145C32;font-weight:bold`;
    if(c==="Correct → Incorrect") return `background:${red};color:#8B1A1A;font-weight:bold`;
    if(c==="Incorrect → Incorrect") return `background:${amber};color:#78350F;font-weight:bold`;
    return `background:${lightBg};color:#374151`;
  };

  const rows = qs.map((q,i) => {
    const isC = q.result==="correct";
    const why = isC ? (q.correctReason||"") : (q.wrongReason||"");
    const change = q.answerChange || "No change";
    return `
    <tr style="height:22px">
      <td style="background:${midGray};color:${white};font-weight:bold;text-align:center;border:1px solid #555">${i+1}</td>
      <td style="background:${isC?green:red};color:${isC?"#145C32":"#8B1A1A"};font-weight:bold;text-align:center;border:1px solid #ccc">${isC?"✓  Correct":"✗  Incorrect"}</td>
      <td style="background:${i%2===0?white:lightBg};border:1px solid #e5e7eb">${q.date||""}</td>
      <td style="background:${subBlue};color:#1E40AF;font-weight:bold;border:1px solid #bfdbfe">${q.subject||""}</td>
      <td style="background:${i%2===0?white:lightBg};border:1px solid #e5e7eb">${q.qtype||""}</td>
      <td style="background:${i%2===0?white:lightBg};border:1px solid #e5e7eb">${q.concept||""}</td>
      <td style="background:${isC?"#F0FFF4":"#FFF5F5"};color:${isC?"#145C32":"#8B1A1A"};border:1px solid #e5e7eb">${why}</td>
      <td style="background:${i%2===0?white:lightBg};border:1px solid #e5e7eb">${q.time||""}</td>
      <td style="${changeStyle(change)};border:1px solid #e5e7eb;text-align:center">${change}</td>
      <td style="background:${i%2===0?white:lightBg};border:1px solid #e5e7eb">${q.qbank||""}</td>
      <td style="background:${i%2===0?white:lightBg};border:1px solid #e5e7eb">${q.resource||""}</td>
      <td style="background:${i%2===0?white:lightBg};border:1px solid #e5e7eb">${q.notes||""}</td>
    </tr>`;
  }).join("");

  // Subject breakdown
  const bySubj = {};
  qs.forEach(q=>{
    const s=q.subject||"Other";
    if(!bySubj[s])bySubj[s]={c:0,t:0};
    bySubj[s].t++;
    if(q.result==="correct")bySubj[s].c++;
  });
  const subjRows = Object.entries(bySubj).map(([s,d])=>{
    const p=d.t?Math.round((d.c/d.t)*100):0;
    const bg=p>=75?green:p>=60?amber:red;
    const fg=p>=75?"#145C32":p>=60?"#78350F":"#8B1A1A";
    return `<tr style="height:20px">
      <td style="background:${bg};border:1px solid #ccc;padding:4px 8px">${s}</td>
      <td style="background:${bg};text-align:center;border:1px solid #ccc;padding:4px">${d.t}</td>
      <td style="background:${bg};text-align:center;border:1px solid #ccc;padding:4px">${d.c}</td>
      <td style="background:${bg};text-align:center;border:1px solid #ccc;padding:4px">${d.t-d.c}</td>
      <td style="background:${bg};color:${fg};font-weight:bold;text-align:center;border:1px solid #ccc;padding:4px">${p}%</td>
    </tr>`;
  }).join("");

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; font-size: 10pt; }
  table { border-collapse: collapse; width: 100%; }
  td, th { padding: 5px 8px; font-size: 10pt; }
  .title-row td { font-size: 14pt; font-weight: bold; color: ${white}; background: ${navy}; text-align: center; height: 36px; }
  .sub-row td { font-size: 9pt; color: ${gold}; background: ${midGray}; text-align: center; height: 20px; font-style: italic; }
  .stat-label { background: ${midGray}; color: ${white}; font-weight: bold; padding: 6px 12px; }
  .stat-val { background: #F5E6BE; color: ${navy}; font-weight: bold; text-align: center; padding: 6px 10px; }
  .score-val { background: ${scoreBg}; color: ${scoreColor}; font-weight: bold; text-align: center; font-size: 13pt; }
</style>
</head><body>

<table>
<tr class="title-row"><td colspan="12">VIMA VIMA &nbsp;·&nbsp; ${session.name}</td></tr>
<tr class="sub-row"><td colspan="12">Session Export &nbsp;·&nbsp; ${total} Questions &nbsp;·&nbsp; Score: ${score}%</td></tr>
<tr style="height:8px"><td colspan="12"></td></tr>
<tr style="background:${midGray};color:${white};font-weight:bold;height:28px;font-size:10pt">
  <th style="border:1px solid #555;width:30px">#</th>
  <th style="border:1px solid #555;width:90px">Result</th>
  <th style="border:1px solid #555;width:80px">Date</th>
  <th style="border:1px solid #555;width:110px">Subject</th>
  <th style="border:1px solid #555;width:110px">Q Type</th>
  <th style="border:1px solid #555;width:180px">Concept</th>
  <th style="border:1px solid #555;width:180px">Why Wrong / Why Correct</th>
  <th style="border:1px solid #555;width:110px">Time</th>
  <th style="border:1px solid #555;width:140px">Answer Change</th>
  <th style="border:1px solid #555;width:90px">QBank</th>
  <th style="border:1px solid #555;width:130px">Resource</th>
  <th style="border:1px solid #555;width:180px">Notes</th>
</tr>
${rows}
</table>

<br/><br/>

<table style="width:400px">
<tr class="title-row"><td colspan="2">Summary Statistics</td></tr>
<tr><td class="stat-label">Total Questions</td><td class="stat-val">${total}</td></tr>
<tr><td class="stat-label">Correct</td><td class="stat-val" style="color:#145C32;background:#D6F5E3">${correct}</td></tr>
<tr><td class="stat-label">Incorrect</td><td class="stat-val" style="color:#8B1A1A;background:#FDE8E8">${total-correct}</td></tr>
<tr><td class="stat-label">Score</td><td class="score-val">${score}%</td></tr>
</table>

<br/>

<table style="width:500px">
<tr class="title-row"><td colspan="5">Performance by Subject</td></tr>
<tr style="background:${midGray};color:${white};font-weight:bold;height:24px">
  <th style="border:1px solid #555;padding:5px 8px">Subject</th>
  <th style="border:1px solid #555;text-align:center">Total</th>
  <th style="border:1px solid #555;text-align:center">Correct</th>
  <th style="border:1px solid #555;text-align:center">Incorrect</th>
  <th style="border:1px solid #555;text-align:center">Score</th>
</tr>
${subjRows}
</table>

</body></html>`;

  const blob = new Blob([html], { type:"application/vnd.ms-excel;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${session.name.replace(/\s+/g,"_")}_VIMAVIMAexport.xls`;
  a.click();
}


// ── Shared UI ─────────────────────────────────────────────────────────────────
function Card({children,style={},onClick,T}){
  return <div className={onClick?"session-row":""} onClick={onClick} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,transition:"border-color 0.15s",cursor:onClick?"pointer":undefined,"--bhov":T.borderHov,...style}}>{children}</div>;
}
function Pill({label,color}){
  return <span style={{background:(color||"#6b7280")+"18",color:color||"#94a3b8",border:`1px solid ${(color||"#6b7280")}28`,borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>;
}
function ResultBadge({result,T}){
  const ok=result==="correct";
  return <span style={{background:ok?T.success+"22":T.danger+"22",color:ok?T.success:T.danger,border:`1px solid ${ok?T.success:T.danger}28`,borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{ok?"✓  Correct":"✗  Incorrect"}</span>;
}
function StatCard({label,value,sub,color,T}){
  return <Card T={T} style={{padding:"20px 22px"}}>
    <div style={{fontSize:10,color:T.muted,letterSpacing:"0.9px",textTransform:"uppercase",marginBottom:10}}>{label}</div>
    <div style={{fontSize:32,fontWeight:700,color:color||T.text,lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:12,color:T.muted,marginTop:6}}>{sub}</div>}
  </Card>;
}
function TabBar({tabs,active,onChange,T,style={}}){
  return <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,overflowX:"auto",...style}}>
    {tabs.map(([id,label])=>(
      <button key={id} onClick={()=>onChange(id)} style={{background:"none",border:"none",borderBottom:active===id?`2px solid ${T.accent}`:"2px solid transparent",padding:"12px 20px",fontSize:13,fontWeight:active===id?600:400,color:active===id?T.text:T.muted,cursor:"pointer",whiteSpace:"nowrap",transition:"color 0.15s"}}>{label}</button>
    ))}
  </div>;
}
function Inp({T,style={},textarea=false,...props}){
  const s={width:"100%",background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 14px",color:T.text,fontSize:13,...style};
  return textarea?<textarea style={{...s,resize:"vertical"}} {...props}/>:<input style={s} {...props}/>;
}
function Sel({T,style={},children,...props}){
  return <select style={{width:"100%",background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 14px",color:T.text,fontSize:13,...style}} {...props}>{children}</select>;
}
function Lbl({children,T}){
  return <div style={{fontSize:10,color:T.muted,letterSpacing:"0.9px",textTransform:"uppercase",marginBottom:6}}>{children}</div>;
}
function BarRow({label,p,T}){
  return <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
    <div style={{fontSize:12,color:T.dim,width:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</div>
    <div style={{flex:1,height:6,background:T.raised,borderRadius:3,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${p}%`,background:T.scoreColor(p),borderRadius:3,transition:"width 0.5s ease"}}/>
    </div>
    <div style={{fontSize:12,color:T.muted,width:34,textAlign:"right"}}>{p}%</div>
  </div>;
}


// ── WIZARD ────────────────────────────────────────────────────────────────────
const STEPS=["result","time","change","why","category","anki","summary","notes"];
const STEP_LABELS=["Correct or incorrect?","Time taken","Answer changed?","Why?","Subject & Category","Flashcard (1-liner)","Question summary","Reflection & notes"];

function Wizard({onClose,onSave,mode,T}){
  const [step,setStep]=useState(0);
  const [data,setData]=useState({result:"",time:"",answerChange:"",wrongReason:"",correctReason:"",subject:"",qtype:"",concept:"",qnum:"",qbank:"",ankiFront:"",summary:"",resource:"",notes:""});
  const [aiText,setAiText]=useState(""); const [aiLoading,setAiLoading]=useState(false);
  const [aiAnki,setAiAnki]=useState(""); const [ankiLoading,setAnkiLoading]=useState(false);
  const cfg=MODES[mode];
  const set=(k,v)=>setData(d=>({...d,[k]:v}));
  const next=()=>setStep(s=>Math.min(s+1,STEPS.length-1));
  const back=()=>setStep(s=>Math.max(s-1,0));
  const autoNext=(k,v)=>{set(k,v);setTimeout(next,160);};

  useEffect(()=>{
    const s=STEPS[step];
    if(s==="anki"&&!data.ankiFront&&data.concept){
      setAnkiLoading(true);setAiAnki("");
      fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:`Create one concise Anki flashcard FRONT for a ${mode} question about "${data.concept}" (${data.qtype||""}, ${data.subject||""}). Max 20 words, exam-vignette style cue. Return ONLY the front text, nothing else.`}]})})
      .then(r=>r.json()).then(j=>{setAiAnki(j.content?.find(b=>b.type==="text")?.text?.trim()||"");setAnkiLoading(false);}).catch(()=>setAnkiLoading(false));
    }
    if(s==="notes"){
      setAiLoading(true);setAiText("");
      fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:700,messages:[{role:"user",content:`A ${mode} student just ${data.result==="correct"?`answered correctly (${data.correctReason})`:`got wrong (${data.wrongReason})`} a question on "${data.concept||data.subject}" (${data.qtype}, ${data.subject}). Give a 2-sentence clinical/exam insight. List 2 relevant references as "REF: [source] — [tip]". End with one short motivational line.`}]})})
      .then(r=>r.json()).then(j=>{setAiText(j.content?.find(b=>b.type==="text")?.text||"");setAiLoading(false);}).catch(()=>setAiLoading(false));
    }
  },[step]);

  const finish=()=>{onSave({...data,id:Date.now(),date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})});onClose();};

  const Choice=({selected,onSelect,icon,title,sub,selBg})=>(
    <button onClick={onSelect} style={{width:"100%",background:selected?(selBg||T.accentGlow):T.raised,border:`1px solid ${selected?T.accent+"60":T.border}`,borderRadius:12,padding:"17px 20px",display:"flex",alignItems:"center",gap:16,cursor:"pointer",marginBottom:10,textAlign:"left",transition:"all 0.15s"}}>
      <span style={{fontSize:22,width:30,textAlign:"center"}}>{icon}</span>
      <div><div style={{fontSize:15,fontWeight:600,color:T.text}}>{title}</div>{sub&&<div style={{fontSize:12,color:T.muted,marginTop:2}}>{sub}</div>}</div>
    </button>
  );

  const s=STEPS[step];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:20}}>
      <div className="fade-in" style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"20px 24px 14px",borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,background:T.surface,zIndex:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div><div style={{fontSize:15,fontWeight:600,color:T.text}}>Log Question</div><div style={{fontSize:12,color:T.muted,marginTop:2}}>{STEP_LABELS[step]}</div></div>
            <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,fontSize:20,cursor:"pointer",lineHeight:1}}>×</button>
          </div>
          <div style={{display:"flex",gap:4}}>
            {STEPS.map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?T.accent:T.raised,transition:"background 0.25s"}}/>)}
          </div>
          <div style={{fontSize:11,color:T.muted,textAlign:"center",marginTop:5}}>{step+1} of {STEPS.length}</div>
        </div>
        <div style={{padding:"24px",flex:1}}>
          {s==="result"&&(<><div style={{textAlign:"center",marginBottom:26}}><div style={{fontSize:34,marginBottom:8}}>❓</div><div style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:4}}>Did you get it right?</div><div style={{fontSize:13,color:T.muted}}>Be honest with yourself</div></div><Choice selected={data.result==="correct"} onSelect={()=>autoNext("result","correct")} icon="✅" title="Correct" sub="I picked the right answer" selBg={T.success+"18"}/><Choice selected={data.result==="incorrect"} onSelect={()=>autoNext("result","incorrect")} icon="❌" title="Incorrect" sub="I got it wrong" selBg={T.danger+"18"}/></>)}
          {s==="time"&&(<><div style={{textAlign:"center",marginBottom:26}}><div style={{fontSize:34,marginBottom:8}}>🕐</div><div style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:4}}>How long did it take?</div><div style={{fontSize:13,color:T.muted}}>Relative to the question time limit</div></div><Choice selected={data.time==="Under the limit"} onSelect={()=>autoNext("time","Under the limit")} icon="⚡" title="Under the limit" sub="Finished with time to spare"/><Choice selected={data.time==="At the limit"} onSelect={()=>autoNext("time","At the limit")} icon="🕐" title="At the limit" sub="Used the full time allotted"/><Choice selected={data.time==="Over the limit"} onSelect={()=>autoNext("time","Over the limit")} icon="🚨" title="Over the limit" sub="Ran over time" selBg={T.danger+"18"}/></>)}
          {s==="change"&&(<><div style={{textAlign:"center",marginBottom:26}}><div style={{fontSize:34,marginBottom:8}}>🔄</div><div style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:4}}>Did you change your answer?</div><div style={{fontSize:13,color:T.muted}}>Track your second-guessing patterns</div></div>{ANSWER_CHANGES.map(c=><Choice key={c} selected={data.answerChange===c} onSelect={()=>autoNext("answerChange",c)} icon={c==="No change"?"➡️":c==="Incorrect → Correct"?"✅":c==="Correct → Incorrect"?"❌":"🔁"} title={c} selBg={c==="Incorrect → Correct"?T.success+"18":c==="Correct → Incorrect"?T.danger+"18":T.warn+"18"}/>)}</>)}
          {s==="why"&&data.result==="correct"&&(<><div style={{textAlign:"center",marginBottom:26}}><div style={{fontSize:34,marginBottom:8}}>✅</div><div style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:4}}>Why were you correct?</div><div style={{fontSize:13,color:T.muted}}>Understanding your wins matters too</div></div>{CORRECT_REASONS.map(r=><Choice key={r} selected={data.correctReason===r} onSelect={()=>autoNext("correctReason",r)} icon={r==="Right reasoning"?"🎯":r==="Guessed"?"🎲":"⚠️"} title={r}/>)}</>)}
          {s==="why"&&data.result!=="correct"&&(<><div style={{textAlign:"center",marginBottom:26}}><div style={{fontSize:34,marginBottom:8}}>❌</div><div style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:4}}>Why did you get it wrong?</div><div style={{fontSize:13,color:T.muted}}>Identify your weak points</div></div>{WRONG_REASONS.map(r=><Choice key={r} selected={data.wrongReason===r} onSelect={()=>autoNext("wrongReason",r)} icon={r==="Didn't know the material"?"📚":r==="Knew material, wrong algorithm"?"🧠":r==="Ran out of time"?"⏰":"😅"} title={r}/>)}</>)}
          {s==="category"&&(<><div style={{textAlign:"center",marginBottom:22}}><div style={{fontSize:34,marginBottom:8}}>⚡</div><div style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:4}}>What was this about?</div><div style={{fontSize:13,color:T.muted}}>Categorize the question</div></div><div style={{display:"grid",gap:14}}><div><Lbl T={T}>Subject</Lbl><Sel T={T} value={data.subject} onChange={e=>set("subject",e.target.value)}><option value="">Select subject...</option>{cfg.subjects.map(s=><option key={s}>{s}</option>)}</Sel></div><div><Lbl T={T}>Question Type</Lbl><Sel T={T} value={data.qtype} onChange={e=>set("qtype",e.target.value)}><option value="">Select type...</option>{cfg.qtypes.map(t=><option key={t}>{t}</option>)}</Sel></div><div><Lbl T={T}>Concept Tested</Lbl><Inp T={T} placeholder="e.g. Giant cell arteritis..." value={data.concept} onChange={e=>set("concept",e.target.value)}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><div><Lbl T={T}>Question #</Lbl><Inp T={T} placeholder="Optional" value={data.qnum} onChange={e=>set("qnum",e.target.value)}/></div><div><Lbl T={T}>QBank</Lbl><Sel T={T} value={data.qbank} onChange={e=>set("qbank",e.target.value)}><option value="">Select...</option>{(QBANKS_MAP[mode]||QBANKS_MAP.USMLE).map(q=><option key={q}>{q}</option>)}</Sel></div></div></div></>)}
          {s==="anki"&&(<>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:34,marginBottom:8}}>⚡</div>
              <div style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:4}}>Anki One-Liner</div>
              <div style={{fontSize:13,color:T.muted}}>A concise cue for your flashcard front</div>
            </div>
            {/* Styled card preview like screenshot */}
            <div style={{background:T.name==="dark"?"#0a1628":"#fff8e6",border:"1px solid "+(T.name==="dark"?"#c9a84c40":"#c9a84c60"),borderRadius:12,padding:"16px 18px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{fontSize:13}}>🃏</span>
                <span style={{fontSize:10,fontWeight:700,color:"#c9a84c",letterSpacing:"1px"}}>ANKI ONE-LINER</span>
                <span style={{fontSize:10,color:T.muted,marginLeft:4}}>— copy into your card</span>
              </div>
              {data.ankiFront
                ? <div style={{fontSize:14,fontWeight:600,color:T.name==="dark"?"#fde68a":T.text,lineHeight:1.55,marginBottom:10}}>{data.ankiFront}</div>
                : <div style={{fontSize:13,color:T.muted,fontStyle:"italic",marginBottom:10}}>Your 1-liner will appear here...</div>}
              {data.ankiFront && <button onClick={()=>navigator.clipboard?.writeText(data.ankiFront)} style={{background:"#c9a84c",border:"none",borderRadius:6,padding:"5px 12px",color:"#000",fontSize:11,fontWeight:700,cursor:"pointer"}}>📋 Copy</button>}
            </div>
            {/* AI suggestion */}
            <div style={{background:T.raised,border:"1px solid "+T.border,borderRadius:10,padding:"12px 14px",marginBottom:14}}>
              <div style={{fontSize:10,color:T.muted,letterSpacing:"0.8px",marginBottom:8}}>✨ AI SUGGESTED</div>
              {ankiLoading?<div style={{color:T.muted,fontSize:12,fontStyle:"italic"}}>Generating suggestion...</div>
              :aiAnki?<><div style={{fontSize:13,color:T.text,lineHeight:1.5,marginBottom:8}}>{aiAnki}</div><button onClick={()=>set("ankiFront",aiAnki)} style={{background:T.accent,border:"none",borderRadius:6,padding:"5px 12px",color:"#fff",fontSize:11,cursor:"pointer"}}>Use this →</button></>
              :<div style={{fontSize:12,color:T.muted}}>Fill in concept on previous step for a suggestion.</div>}
            </div>
            <Lbl T={T}>Write your own 1-liner</Lbl>
            <Inp T={T} placeholder="e.g. 55M jaw claudication + vision loss → next step?" value={data.ankiFront} onChange={e=>set("ankiFront",e.target.value)}/>
          </>)}
          {s==="summary"&&(<><div style={{textAlign:"center",marginBottom:22}}><div style={{fontSize:34,marginBottom:8}}>📄</div><div style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:4}}>Question Summary</div><div style={{fontSize:13,color:T.muted}}>Brief note on what was asked</div></div><Lbl T={T}>Summary</Lbl><Inp T={T} textarea placeholder="Brief summary..." value={data.summary} onChange={e=>set("summary",e.target.value)} style={{height:110}}/><div style={{marginTop:14}}><Lbl T={T}>Screenshot</Lbl><div style={{border:`1px dashed ${T.border}`,borderRadius:8,padding:"12px 16px",display:"inline-flex",alignItems:"center",gap:8,cursor:"pointer",color:T.muted,fontSize:13}}>📎 Attach screenshot</div></div></>)}
          {s==="notes"&&(<><div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:34,marginBottom:8}}>💡</div><div style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:4}}>Reflection & Notes</div><div style={{fontSize:13,color:T.muted}}>Cement what you learned</div></div><div style={{background:T.name==="dark"?"#0e0e2a":"#eff2ff",border:`1px solid ${T.name==="dark"?"#3730a360":"#c7d2fe"}`,borderRadius:12,padding:"14px 16px",marginBottom:16}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span>✨</span><span style={{fontSize:10,fontWeight:700,color:T.name==="dark"?"#a5b4fc":T.accent,letterSpacing:"0.8px"}}>AI STUDY INSIGHT</span></div>{aiLoading?<div style={{color:T.muted,fontSize:12,fontStyle:"italic"}}>Generating...</div>:aiText?<div style={{color:T.name==="dark"?"#c7d2fe":T.dim,fontSize:12,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{aiText}</div>:<div style={{fontSize:12,color:T.muted}}>Fill in subject/concept above.</div>}</div><div style={{marginBottom:14}}><Lbl T={T}>Resource to Review</Lbl><Inp T={T} placeholder="e.g. FA p.342, Pathoma Ch.3..." value={data.resource} onChange={e=>set("resource",e.target.value)}/></div><div><Lbl T={T}>Personal Notes</Lbl><Inp T={T} textarea placeholder="Your own notes..." value={data.notes} onChange={e=>set("notes",e.target.value)} style={{height:72}}/></div><div style={{marginTop:12,background:data.result==="correct"?T.success+"18":T.danger+"18",border:`1px solid ${data.result==="correct"?T.success+"30":T.danger+"30"}`,borderRadius:8,padding:"10px 14px",fontSize:12,color:data.result==="correct"?T.success:T.danger}}>{data.result==="correct"?"✅  Great job! Add notes and submit.":"📚  Review the concept, add resources, then submit."}</div></>)}
        </div>
        {step>0&&(<div style={{padding:"12px 24px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",bottom:0,background:T.surface}}>
          <button onClick={back} style={{background:"none",border:"none",color:T.muted,fontSize:13,cursor:"pointer"}}>← Back</button>
          {step===STEPS.length-1?<button onClick={finish} style={{background:T.accent,border:"none",borderRadius:8,padding:"9px 22px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Submit ✓</button>:["category","anki","summary"].includes(s)?<button onClick={next} style={{background:T.accent,border:"none",borderRadius:8,padding:"9px 20px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Next →</button>:<div/>}
        </div>)}
      </div>
    </div>
  );
}


// ── SESSION DETAIL ─────────────────────────────────────────────────────────────
function SessionDetail({session,onBack,onAddQuestion,mode,T}){
  const [tab,setTab]=useState("questions");
  const [expanded,setExpanded]=useState({});
  const qs=session.questions;
  const correct=qs.filter(q=>q.result==="correct").length;
  const score=pct(correct,qs.length);
  const changedWrong=qs.filter(q=>q.answerChange==="Correct → Incorrect").length;
  const ankiReady=qs.filter(q=>q.ankiFront&&q.ankiFront.trim()).length;
  const bySubject={},byType={},wrongReasons={};
  qs.forEach(q=>{
    if(!bySubject[q.subject])bySubject[q.subject]={c:0,t:0};bySubject[q.subject].t++;if(q.result==="correct")bySubject[q.subject].c++;
    if(!byType[q.qtype])byType[q.qtype]={c:0,t:0};byType[q.qtype].t++;if(q.result==="correct")byType[q.qtype].c++;
    if(q.result==="incorrect"&&q.wrongReason)wrongReasons[q.wrongReason]=(wrongReasons[q.wrongReason]||0)+1;
  });

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{padding:"22px 32px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <button onClick={onBack} style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 14px",color:T.dim,cursor:"pointer",fontSize:13}}>← Back</button>
          <div>
            <span style={{fontSize:20,fontWeight:700}}>{session.name}</span>
            <span style={{fontSize:11,background:T.accent+"22",color:T.accent,borderRadius:6,padding:"2px 8px",marginLeft:10,fontWeight:500}}>{mode}</span>
            <div style={{fontSize:12,color:T.muted,marginTop:3}}>{session.date}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={()=>exportExcel(session)} style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 14px",color:T.dim,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            📊 Export Excel
          </button>
          {ankiReady>0&&<button onClick={()=>downloadApkg(session, mode, ANKI_SERVER_URL)} style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 14px",color:T.accent,fontSize:12,cursor:"pointer"}}>⚡ Download Anki ({ankiReady})</button>}
          <button onClick={onAddQuestion} style={{background:T.accent,border:"none",borderRadius:8,padding:"8px 18px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>+ Log Question</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,padding:"20px 32px"}}>
        <StatCard T={T} label="Total" value={qs.length} sub="questions"/>
        <StatCard T={T} label="Score" value={`${score}%`} sub={`${correct}/${qs.length}`} color={T.scoreColor(score)}/>
        <StatCard T={T} label="Incorrect" value={qs.length-correct} sub="questions"/>
        <StatCard T={T} label="Changed → Wrong" value={changedWrong} sub="trust your gut" color={T.danger}/>
      </div>
      <TabBar T={T} tabs={[["questions","≡  Questions"],["analytics","📊  Analytics"]]} active={tab} onChange={setTab} style={{padding:"0 32px"}}/>
      <div style={{padding:"18px 32px"}}>
        {tab==="questions"&&(<>
          <div style={{display:"grid",gridTemplateColumns:"110px 56px 78px 1fr 180px",gap:10,padding:"6px 14px",marginBottom:6}}>
            {["RESULT","Q#","DATE","SUBJECT / CONCEPT","ACTIONS"].map(h=><div key={h} style={{fontSize:9,color:T.muted,letterSpacing:"0.9px"}}>{h}</div>)}
          </div>
          {qs.length===0&&<div style={{textAlign:"center",color:T.muted,padding:"50px 0",fontSize:13}}>No questions yet.</div>}
          {qs.map(q=>(
            <Card key={q.id} T={T} style={{marginBottom:8}}>
              <div style={{display:"grid",gridTemplateColumns:"110px 56px 78px 1fr 180px",gap:10,padding:"13px 14px",alignItems:"center"}}>
                <ResultBadge result={q.result} T={T}/>
                <span style={{fontSize:13,fontWeight:600,color:T.text}}>{q.qnum||"—"}</span>
                <span style={{fontSize:12,color:T.muted}}>{q.date}</span>
                <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                  {q.subject&&<Pill label={q.subject} color={subjColors[q.subject]}/>}
                  {q.concept&&<span style={{fontSize:12,color:T.muted}}>· {q.concept}</span>}
                  {q.answerChange&&q.answerChange!=="No change"&&<span style={{fontSize:10,color:q.answerChange==="Incorrect → Correct"?T.success:T.danger,background:q.answerChange==="Incorrect → Correct"?T.success+"18":T.danger+"18",borderRadius:4,padding:"1px 6px"}}>🔄 {q.answerChange}</span>}
                  {q.ankiFront&&<span style={{fontSize:10,color:T.accent,background:T.accent+"18",borderRadius:4,padding:"1px 6px"}}>⚡ Anki</span>}
                </div>
                <div style={{display:"flex",gap:10,alignItems:"center",justifyContent:"flex-end"}}>
                  <button onClick={()=>setExpanded(e=>({...e,[q.id]:!e[q.id]}))} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:12}}>{expanded[q.id]?"▲":"▼"} Notes</button>
                  <span style={{color:"#fb923c",fontSize:12,cursor:"pointer"}}>✏ Edit</span>
                </div>
              </div>
              {expanded[q.id]&&(
                <div style={{borderTop:`1px solid ${T.border}`,padding:"12px 14px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                  {[q.result==="incorrect"&&q.wrongReason&&["WHY WRONG",q.wrongReason,T.danger],q.result==="correct"&&q.correctReason&&["WHY CORRECT",q.correctReason,T.success],q.time&&["TIME",q.time,T.dim],q.qtype&&["TYPE",q.qtype,T.dim],q.qbank&&["QBANK",q.qbank,T.dim],q.resource&&["RESOURCE",q.resource,T.accent]].filter(Boolean).map(([lbl,val,color])=>(
                    <div key={lbl}><div style={{fontSize:9,color:T.muted,letterSpacing:"0.8px",marginBottom:3}}>{lbl}</div><div style={{fontSize:12,color}}>{val}</div></div>
                  ))}
                  {q.ankiFront&&<div style={{gridColumn:"1/-1"}}><div style={{fontSize:9,color:T.muted,letterSpacing:"0.8px",marginBottom:3}}>ANKI FRONT</div><div style={{fontSize:12,color:T.accent,fontStyle:"italic"}}>"{q.ankiFront}"</div></div>}
                  {q.summary&&<div style={{gridColumn:"1/-1"}}><div style={{fontSize:9,color:T.muted,letterSpacing:"0.8px",marginBottom:3}}>SUMMARY</div><div style={{fontSize:12,color:T.dim}}>{q.summary}</div></div>}
                  {q.notes&&<div style={{gridColumn:"1/-1"}}><div style={{fontSize:9,color:T.muted,letterSpacing:"0.8px",marginBottom:3}}>NOTES</div><div style={{fontSize:12,color:T.dim}}>{q.notes}</div></div>}
                </div>
              )}
            </Card>
          ))}
        </>)}
        {tab==="analytics"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {[{title:"Score by Subject",data:bySubject},{title:"Score by Question Type",data:byType}].map(({title,data:d})=>(
              <Card key={title} T={T} style={{padding:"18px 20px"}}>
                <div style={{fontSize:10,color:T.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:14}}>{title}</div>
                {Object.entries(d).map(([k,v])=><BarRow key={k} T={T} label={k} p={pct(v.c,v.t)}/>)}
                {Object.keys(d).length===0&&<div style={{fontSize:12,color:T.muted}}>No data yet.</div>}
              </Card>
            ))}
            <Card T={T} style={{padding:"18px 20px"}}>
              <div style={{fontSize:10,color:T.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:14}}>Why Wrong</div>
              {Object.entries(wrongReasons).map(([r,c])=><div key={r} style={{display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:12}}><span style={{color:T.dim}}>{r}</span><span style={{color:T.danger,fontWeight:600}}>{c}</span></div>)}
              {Object.keys(wrongReasons).length===0&&<div style={{fontSize:12,color:T.muted}}>No wrong answers yet.</div>}
            </Card>
            <Card T={T} style={{padding:"18px 20px"}}>
              <div style={{fontSize:10,color:T.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:14}}>Answer Changes</div>
              {ANSWER_CHANGES.filter(a=>a!=="No change").map(a=>{const cnt=qs.filter(q=>q.answerChange===a).length;return(<div key={a} style={{display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:12}}><span style={{color:T.dim}}>{a}</span><span style={{fontWeight:600,color:a==="Incorrect → Correct"?T.success:a==="Correct → Incorrect"?T.danger:T.warn}}>{cnt}</span></div>);})}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}


// ── Anki .apkg Export ─────────────────────────────────────────────────────────
// Set this to your deployed backend URL after deploying anki_server.py
const ANKI_SERVER_URL = "https://vimavima.onrender.com";

async function downloadApkg(session, mode, serverUrl) {
  if (!serverUrl || serverUrl.includes("YOUR_BACKEND")) {
    alert("To download .apkg files, deploy the anki_server.py backend and update ANKI_SERVER_URL in the app.\n\nSee the README for setup instructions.");
    return;
  }
  const cards = session.questions.filter(q => q.ankiFront && q.ankiFront.trim());
  if (!cards.length) { alert("No flashcards in this session yet. Log questions with a 1-liner to create cards."); return; }
  try {
    const res = await fetch(`${serverUrl}/export/apkg`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deck_name: session.name, mode, questions: cards }),
    });
    if (!res.ok) { const err = await res.json(); alert("Export failed: " + err.error); return; }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `VIMAVIMA_${session.name.replace(/\s+/g,"_")}.apkg`;
    a.click();
  } catch(e) {
    alert("Could not reach the export server. Make sure anki_server.py is running.");
  }
}

// ── Flip Card ─────────────────────────────────────────────────────────────────
function FlipCard({ T, front, backLines, session }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div onClick={() => setFlipped(f => !f)} style={{ cursor:"pointer", height:180, perspective:1000 }}>
      <div style={{
        position:"relative", width:"100%", height:"100%",
        transformStyle:"preserve-3d",
        transition:"transform 0.5s cubic-bezier(0.4,0.2,0.2,1)",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}>
        {/* FRONT */}
        <div style={{
          position:"absolute", inset:0, backfaceVisibility:"hidden",
          background: T.surface, border:`1px solid ${T.border}`,
          borderRadius:14, padding:"22px 20px",
          display:"flex", flexDirection:"column", justifyContent:"space-between",
        }}>
          <div>
            <div style={{fontSize:10,color:T.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:10}}>Front · Tap to reveal</div>
            <div style={{fontSize:14,fontWeight:600,color:T.text,lineHeight:1.55}}>{front}</div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:10,color:T.muted}}>{session}</span>
            <span style={{fontSize:18,color:T.muted,opacity:0.5}}>↻</span>
          </div>
        </div>
        {/* BACK */}
        <div style={{
          position:"absolute", inset:0, backfaceVisibility:"hidden",
          transform:"rotateY(180deg)",
          background: T.name==="dark" ? "#0d1520" : "#f0f4ff",
          border:`1px solid ${T.accent}40`,
          borderRadius:14, padding:"16px 18px",
          display:"flex", flexDirection:"column", justifyContent:"space-between",
        }}>
          <div>
            <div style={{fontSize:10,color:T.accent,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:10}}>Back · Answer</div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {backLines.map(({label,val,color},i)=>(
                <div key={i} style={{display:"flex",gap:6,fontSize:12,alignItems:"flex-start"}}>
                  <span style={{color:T.muted,minWidth:70,fontSize:10,paddingTop:1,letterSpacing:"0.5px"}}>{label}</span>
                  <span style={{color:color||T.text,fontWeight:label==="Result"?700:400,lineHeight:1.4}}>{val}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <span style={{fontSize:18,color:T.accent,opacity:0.6}}>↻</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sample Data ────────────────────────────────────────────────────────────────
const SAMPLE_DATA={
  USMLE:[
    {id:1,name:"NBME 13",date:"2026-05-10",questions:[
      {id:101,qnum:"4.50",date:"May 11",result:"correct",correctReason:"Right reasoning",time:"Under the limit",answerChange:"No change",subject:"Pulmonology",qtype:"Diagnosis",concept:"ARDS",qbank:"NBME",ankiFront:"Young trauma pt, bilateral infiltrates, low PaO2/FiO2 → diagnosis?",summary:"",resource:"",notes:""},
      {id:102,qnum:"4.47",date:"May 11",result:"correct",correctReason:"Right reasoning",time:"Under the limit",answerChange:"No change",subject:"Cardiology",qtype:"Diagnosis",concept:"Giant cell arteritis",qbank:"NBME",ankiFront:"70F jaw claudication + temporal headache + ESR 110 → next step?",summary:"",resource:"",notes:""},
      {id:103,qnum:"4.46",date:"May 11",result:"correct",correctReason:"Guessed",time:"At the limit",answerChange:"No change",subject:"MSK",qtype:"Diagnosis",concept:"Flatfeet",qbank:"NBME",ankiFront:"",summary:"",resource:"",notes:""},
      {id:104,qnum:"4.45",date:"May 11",result:"correct",correctReason:"Right reasoning",time:"Under the limit",answerChange:"No change",subject:"Neurology",qtype:"Diagnosis",concept:"Subdural hematoma",qbank:"NBME",ankiFront:"",summary:"",resource:"",notes:""},
      {id:105,qnum:"4.44",date:"May 11",result:"correct",correctReason:"Right reasoning",time:"Under the limit",answerChange:"No change",subject:"OB/GYN",qtype:"Management",concept:"Primary dysmenorrhea",qbank:"NBME",ankiFront:"",summary:"",resource:"",notes:""},
      {id:108,qnum:"4.12",date:"May 11",result:"incorrect",wrongReason:"Didn't know the material",time:"Over the limit",answerChange:"Correct → Incorrect",subject:"Cardiology",qtype:"Management",concept:"Heart failure management",qbank:"NBME",ankiFront:"",summary:"Missed the diuretic choice",resource:"FA p.280",notes:""},
      {id:109,qnum:"3.88",date:"May 11",result:"incorrect",wrongReason:"Silly mistake / misread",time:"Under the limit",answerChange:"No change",subject:"Neurology",qtype:"Diagnosis",concept:"MS vs ALS",qbank:"NBME",ankiFront:"",summary:"Confused UMN vs LMN",resource:"",notes:""},
    ]},
    {id:2,name:"NBME 12",date:"2026-05-07",questions:[
      {id:201,qnum:"3.1",date:"May 7",result:"correct",correctReason:"Right reasoning",time:"Under the limit",answerChange:"No change",subject:"GI",qtype:"Diagnosis",concept:"Crohn's vs UC",qbank:"NBME",ankiFront:"",summary:"",resource:"",notes:""},
      {id:202,qnum:"3.2",date:"May 7",result:"incorrect",wrongReason:"Knew material, wrong algorithm",time:"At the limit",answerChange:"Incorrect → Correct",subject:"Heme/Onc",qtype:"Management",concept:"CML treatment",qbank:"NBME",ankiFront:"",summary:"",resource:"",notes:""},
    ]},
    {id:3,name:"NBME 11",date:"2026-04-22",questions:[{id:301,qnum:"2.1",date:"Apr 22",result:"incorrect",wrongReason:"Ran out of time",time:"Over the limit",answerChange:"No change",subject:"Psych",qtype:"Diagnosis",concept:"Bipolar vs MDD",qbank:"NBME",ankiFront:"",summary:"",resource:"",notes:""}]},
    {id:4,name:"Amboss Session 4/19/26",date:"2026-04-18",questions:[{id:401,qnum:"1.1",date:"Apr 18",result:"correct",correctReason:"Right reasoning",time:"Under the limit",answerChange:"No change",subject:"Renal",qtype:"Management",concept:"AKI management",qbank:"Amboss",ankiFront:"",summary:"",resource:"",notes:""}]},
  ],
  MCAT:[],LSAT:[],
};


// ── Topic Browser ────────────────────────────────────────────────────────────
function TopicBrowser({ T, allQ, sessions, cfg }) {
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterType,    setFilterType]    = useState("All");
  const [filterResult,  setFilterResult]  = useState("All");
  const [filterChange,  setFilterChange]  = useState("All");
  const [sortBy,        setSortBy]        = useState("newest");
  const [search,        setSearch]        = useState("");
  const [expanded,      setExpanded]      = useState({});

  const filtered = allQ
    .filter(q => filterSubject==="All" || q.subject===filterSubject)
    .filter(q => filterType==="All"    || q.qtype===filterType)
    .filter(q => filterResult==="All"  || q.result===filterResult.toLowerCase())
    .filter(q => filterChange==="All"  || q.answerChange===filterChange)
    .filter(q => !search || (q.concept||"").toLowerCase().includes(search.toLowerCase()) || (q.subject||"").toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => {
      if (sortBy==="newest") return b.id - a.id;
      if (sortBy==="oldest") return a.id - b.id;
      if (sortBy==="subject") return (a.subject||"").localeCompare(b.subject||"");
      if (sortBy==="result") return a.result.localeCompare(b.result);
      return 0;
    });

  const selStyle = { background:T.raised, border:"1px solid "+T.border, borderRadius:7, padding:"7px 10px", color:T.dim, fontSize:12, cursor:"pointer" };

  const subjects = [...new Set(allQ.map(q=>q.subject).filter(Boolean))];
  const qtypes   = [...new Set(allQ.map(q=>q.qtype).filter(Boolean))];

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom:14 }}>
        <input
          placeholder="Search concept, subject..."
          value={search} onChange={e=>setSearch(e.target.value)}
          style={{ width:"100%", background:T.raised, border:"1px solid "+T.border, borderRadius:9, padding:"10px 16px", color:T.text, fontSize:13, boxSizing:"border-box" }}
        />
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <select style={selStyle} value={filterSubject} onChange={e=>setFilterSubject(e.target.value)}>
          <option>All</option>{subjects.map(s=><option key={s}>{s}</option>)}
        </select>
        <select style={selStyle} value={filterType} onChange={e=>setFilterType(e.target.value)}>
          <option>All</option>{qtypes.map(t=><option key={t}>{t}</option>)}
        </select>
        <select style={selStyle} value={filterResult} onChange={e=>setFilterResult(e.target.value)}>
          <option value="All">All Results</option>
          <option value="Correct">✓ Correct</option>
          <option value="Incorrect">✗ Incorrect</option>
        </select>
        <select style={selStyle} value={filterChange} onChange={e=>setFilterChange(e.target.value)}>
          <option value="All">All Changes</option>
          <option>No change</option>
          <option>Incorrect → Correct</option>
          <option>Correct → Incorrect</option>
          <option>Incorrect → Incorrect</option>
        </select>
        <select style={selStyle} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="subject">By Subject</option>
          <option value="result">By Result</option>
        </select>
        <span style={{ fontSize:11, color:T.muted, marginLeft:"auto" }}>{filtered.length} questions</span>
        {(filterSubject!=="All"||filterType!=="All"||filterResult!=="All"||filterChange!=="All"||search) &&
          <button onClick={()=>{setFilterSubject("All");setFilterType("All");setFilterResult("All");setFilterChange("All");setSearch("");}} style={{ background:"none", border:"none", color:T.accent, fontSize:12, cursor:"pointer" }}>Clear filters</button>}
      </div>

      {/* Subject breakdown pills */}
      <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
        {[...new Set(allQ.map(q=>q.subject).filter(Boolean))].map(s => {
          const total = allQ.filter(q=>q.subject===s).length;
          const correct = allQ.filter(q=>q.subject===s&&q.result==="correct").length;
          const p = Math.round(correct/total*100);
          return (
            <button key={s} onClick={()=>setFilterSubject(filterSubject===s?"All":s)} style={{
              background: filterSubject===s ? (subjColors[s]||T.accent)+"28" : T.raised,
              border: "1px solid "+(filterSubject===s ? (subjColors[s]||T.accent)+"60" : T.border),
              borderRadius:20, padding:"5px 12px", cursor:"pointer",
              display:"flex", alignItems:"center", gap:6,
            }}>
              <span style={{ fontSize:11, fontWeight:600, color:subjColors[s]||T.dim }}>{s}</span>
              <span style={{ fontSize:10, color:T.scoreColor(p), fontWeight:700 }}>{p}%</span>
            </button>
          );
        })}
      </div>

      {/* Question list */}
      {filtered.length===0 && <div style={{ textAlign:"center", color:T.muted, padding:"40px 0", fontSize:13 }}>No questions match your filters.</div>}
      {filtered.map(q => {
        const sess = sessions.find(s=>s.questions.some(sq=>sq.id===q.id));
        const isC = q.result==="correct";
        return (
          <Card key={q.id} T={T} style={{ marginBottom:8 }}>
            <div style={{ padding:"13px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7, flexWrap:"wrap" }}>
                    <ResultBadge result={q.result} T={T}/>
                    {q.subject && <Pill label={q.subject} color={subjColors[q.subject]}/>}
                    {q.qtype && <span style={{ fontSize:11, color:T.muted, background:T.raised, borderRadius:5, padding:"1px 7px" }}>{q.qtype}</span>}
                    {q.answerChange && q.answerChange!=="No change" && (
                      <span style={{ fontSize:10, color:q.answerChange==="Incorrect → Correct"?T.success:T.danger, background:q.answerChange==="Incorrect → Correct"?T.success+"18":T.danger+"18", borderRadius:4, padding:"1px 6px" }}>🔄 {q.answerChange}</span>
                    )}
                  </div>
                  {q.concept && <div style={{ fontSize:14, fontWeight:600, color:T.text, marginBottom:4 }}>{q.concept}</div>}
                  <div style={{ fontSize:11, color:T.muted }}>{sess?.name} · {q.date}</div>
                </div>
                <button onClick={()=>setExpanded(e=>({...e,[q.id]:!e[q.id]}))} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:12, whiteSpace:"nowrap" }}>
                  {expanded[q.id]?"▲ Less":"▼ More"}
                </button>
              </div>
              {expanded[q.id] && (
                <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid "+T.border, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                  {[
                    isC && q.correctReason && ["WHY CORRECT", q.correctReason, T.success],
                    !isC && q.wrongReason  && ["WHY WRONG",   q.wrongReason,   T.danger],
                    q.time     && ["TIME",     q.time,     T.dim],
                    q.qbank    && ["QBANK",    q.qbank,    T.dim],
                    q.resource && ["RESOURCE", q.resource, T.accent],
                  ].filter(Boolean).map(([lbl,val,color]) => (
                    <div key={lbl}><div style={{ fontSize:9, color:T.muted, letterSpacing:"0.8px", marginBottom:3 }}>{lbl}</div><div style={{ fontSize:12, color }}>{val}</div></div>
                  ))}
                  {q.ankiFront && <div style={{ gridColumn:"1/-1" }}><div style={{ fontSize:9, color:T.muted, letterSpacing:"0.8px", marginBottom:3 }}>ANKI</div><div style={{ fontSize:12, color:T.accent, fontStyle:"italic" }}>"{q.ankiFront}"</div></div>}
                  {q.summary && <div style={{ gridColumn:"1/-1" }}><div style={{ fontSize:9, color:T.muted, letterSpacing:"0.8px", marginBottom:3 }}>SUMMARY</div><div style={{ fontSize:12, color:T.dim }}>{q.summary}</div></div>}
                  {q.notes && <div style={{ gridColumn:"1/-1" }}><div style={{ fontSize:9, color:T.muted, letterSpacing:"0.8px", marginBottom:3 }}>NOTES</div><div style={{ fontSize:12, color:T.dim }}>{q.notes}</div></div>}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── Auth / Onboarding ────────────────────────────────────────────────────────
const TRACKS = [
  { id:"MCAT",  label:"Pre-Med",     sub:"MCAT prep — C/P, CARS, B/B, Psych/Soc",   icon:"🔬" },
  { id:"USMLE", label:"Med Student", sub:"USMLE Step 1 & Step 2 question tracking",  icon:"🩺" },
  { id:"LSAT",  label:"Pre-Law",     sub:"LSAT — LR, AR, Reading Comprehension",     icon:"⚖️" },
];

function AuthScreen({ onAuth, T }) {
  const [screen, setScreen] = useState("login");
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [track, setTrack]   = useState(null);
  const [error, setError]   = useState("");

  const inp = { width:"100%", background:T.raised, border:"1px solid "+T.border, borderRadius:8, padding:"11px 14px", color:T.text, fontSize:13, marginBottom:14, boxSizing:"border-box" };
  const btn = (disabled) => ({ width:"100%", background:disabled?T.muted:T.accent, border:"none", borderRadius:10, padding:"12px", color:"#fff", fontSize:14, fontWeight:600, cursor:disabled?"not-allowed":"pointer", marginTop:4, opacity:disabled?0.45:1 });
  const oBtn = { width:"100%", background:T.raised, border:"1px solid "+T.border, borderRadius:10, padding:"11px", color:T.text, fontSize:13, fontWeight:500, cursor:"pointer", marginBottom:10, display:"flex", alignItems:"center", justifyContent:"center", gap:10 };

  if (screen === "onboarding") return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:20 }}>
      <div style={{ background:T.surface, border:"1px solid "+T.border, borderRadius:20, padding:"40px 36px", width:"100%", maxWidth:440 }}>
        <div style={{ marginBottom:28, display:"flex", justifyContent:"center" }}><VimaLogo dark={T.name==="dark"}/></div>
        <div style={{ fontSize:22, fontWeight:700, color:T.text, marginBottom:6, textAlign:"center" }}>What are you studying for?</div>
        <div style={{ fontSize:13, color:T.muted, textAlign:"center", marginBottom:28 }}>This personalizes your question types and subjects.</div>
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
          {TRACKS.map(tr => (
            <button key={tr.id} onClick={() => setTrack(tr.id)} style={{ background:track===tr.id?T.accent+"22":T.raised, border:"2px solid "+(track===tr.id?T.accent:T.border), borderRadius:12, padding:"16px 18px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ fontSize:26 }}>{tr.icon}</span>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:T.text }}>{tr.label}</div>
                <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>{tr.sub}</div>
              </div>
              {track===tr.id && <span style={{ marginLeft:"auto", color:T.accent, fontSize:18 }}>✓</span>}
            </button>
          ))}
        </div>
        <button disabled={!track} onClick={() => onAuth({ name, email, track })} style={btn(!track)}>Get Started →</button>
      </div>
    </div>
  );

  const handleSubmit = () => {
    if (!email || !pass) { setError("Please fill in all fields."); return; }
    if (screen==="signup" && !name) { setError("Please enter your name."); return; }
    setError(""); setScreen("onboarding");
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:20 }}>
      <div style={{ background:T.surface, border:"1px solid "+T.border, borderRadius:20, padding:"40px 36px", width:"100%", maxWidth:420 }}>
        <div style={{ marginBottom:28, display:"flex", justifyContent:"center" }}><VimaLogo dark={T.name==="dark"}/></div>
        <div style={{ fontSize:22, fontWeight:700, color:T.text, marginBottom:6, textAlign:"center" }}>{screen==="login"?"Welcome back":"Create your account"}</div>
        <div style={{ fontSize:13, color:T.muted, textAlign:"center", marginBottom:24 }}>{screen==="login"?"Log in to your VIMA VIMA account":"Start tracking your performance"}</div>
        <button style={oBtn} onClick={() => setScreen("onboarding")}><svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Continue with Google</button>
        <button style={oBtn} onClick={() => setScreen("onboarding")}><svg width="18" height="18" viewBox="0 0 24 24" fill={T.text}><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>Continue with Apple</button>
        <button style={oBtn} onClick={() => setScreen("onboarding")}><span style={{ fontSize:16 }}>Y</span>Continue with Yahoo</button>
        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"18px 0" }}><div style={{ flex:1, height:1, background:T.border }}/><span style={{ fontSize:11, color:T.muted }}>OR</span><div style={{ flex:1, height:1, background:T.border }}/></div>
        {error && <div style={{ background:T.danger+"18", border:"1px solid "+T.danger+"30", borderRadius:8, padding:"9px 12px", fontSize:12, color:T.danger, marginBottom:14, textAlign:"center" }}>{error}</div>}
        {screen==="signup" && <><label style={{ fontSize:10, color:T.muted, letterSpacing:"0.9px", textTransform:"uppercase", marginBottom:6, display:"block" }}>Full Name</label><input style={inp} placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/></>}
        <label style={{ fontSize:10, color:T.muted, letterSpacing:"0.9px", textTransform:"uppercase", marginBottom:6, display:"block" }}>Email</label>
        <input style={inp} type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
        <label style={{ fontSize:10, color:T.muted, letterSpacing:"0.9px", textTransform:"uppercase", marginBottom:6, display:"block" }}>Password</label>
        <input style={inp} type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)}/>
        <button style={btn(false)} onClick={handleSubmit}>{screen==="login"?"Log In":"Create Account"}</button>
        <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:T.muted }}>
          {screen==="login"?<span>No account? <span style={{ color:T.accent, cursor:"pointer", fontWeight:600 }} onClick={()=>{setScreen("signup");setError("");}}>Sign up free</span></span>:<span>Have an account? <span style={{ color:T.accent, cursor:"pointer", fontWeight:600 }} onClick={()=>{setScreen("login");setError("");}}>Log in</span></span>}
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App(){
  const [splashDone,setSplashDone]=useState(false);
  const [user,setUser]=useState(null); // {name, email, track}
  const [darkMode,setDarkMode]=useState(true);
  const T=darkMode?DARK:LIGHT;
  const mode = user?.track || "USMLE";
  const [sessionsByMode,setSessionsByMode]=useState(SAMPLE_DATA);
  const sessions=sessionsByMode[mode]||[];
  const setSessions=(upd)=>setSessionsByMode(prev=>({...prev,[mode]:typeof upd==="function"?upd(prev[mode]):upd}));
  const [view,setView]=useState("home");
  const [activeId,setActiveId]=useState(null);
  const [showWizard,setShowWizard]=useState(false);
  const [showNewSession,setShowNewSession]=useState(false);
  const [newSess,setNewSess]=useState({name:"",date:""});
  const [tab,setTab]=useState("sessions");
  const [filterSubject,setFilterSubject]=useState("All");
  const [filterResult,setFilterResult]=useState("All");

  const activeSess=sessions.find(s=>s.id===activeId);
  const allQ=sessions.flatMap(s=>s.questions);
  const totalC=allQ.filter(q=>q.result==="correct").length;
  const overallPct=pct(totalC,allQ.length);
  const changedWrong=allQ.filter(q=>q.answerChange==="Correct → Incorrect").length;
  const recentSess=[...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  const recentQs=recentSess?.questions||[];
  const recentPct=pct(recentQs.filter(q=>q.result==="correct").length,recentQs.length);
  const ankiTotal=allQ.filter(q=>q.ankiFront&&q.ankiFront.trim()).length;

  const analytics=useMemo(()=>{
    const bySubject={},byType={},byReason={},byChange={};
    allQ.forEach(q=>{
      if(!bySubject[q.subject])bySubject[q.subject]={c:0,t:0};bySubject[q.subject].t++;if(q.result==="correct")bySubject[q.subject].c++;
      if(!byType[q.qtype])byType[q.qtype]={c:0,t:0};byType[q.qtype].t++;if(q.result==="correct")byType[q.qtype].c++;
      if(q.wrongReason)byReason[q.wrongReason]=(byReason[q.wrongReason]||0)+1;
      if(q.answerChange&&q.answerChange!=="No change")byChange[q.answerChange]=(byChange[q.answerChange]||0)+1;
    });
    return{bySubject,byType,byReason,byChange};
  },[allQ]);

  function addQuestion(qdata){setSessions(prev=>prev.map(s=>s.id===activeId?{...s,questions:[...s.questions,qdata]}:s));}
  function createSession(){
    if(!newSess.name)return;
    const ns={id:Date.now(),name:newSess.name,date:newSess.date||new Date().toISOString().split("T")[0],questions:[]};
    setSessions(p=>[...p,ns]);setActiveId(ns.id);setView("session");setShowNewSession(false);setNewSess({name:"",date:""});
  }

  const cfg=MODES[mode];
  const filteredQ=allQ.filter(q=>(filterSubject==="All"||q.subject===filterSubject)&&(filterResult==="All"||q.result===filterResult.toLowerCase()));

  // Show auth if not logged in
  if(!user) return <AuthScreen T={T} onAuth={(u)=>{ setUser(u); }} />;
  if(!splashDone) return <SplashScreen dark={darkMode} onDone={()=>setSplashDone(true)}/>;

  if(view==="session"&&activeSess) return (
    <>
      <SessionDetail session={activeSess} onBack={()=>setView("home")} onAddQuestion={()=>setShowWizard(true)} mode={mode} T={T}/>
      {showWizard&&<Wizard onClose={()=>setShowWizard(false)} onSave={addQuestion} mode={mode} T={T}/>}
    </>
  );

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'DM Sans',sans-serif",paddingBottom:60}}>

      {/* Header */}
      <div style={{padding:"18px 32px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,background:T.bg}}>
        <VimaLogo dark={darkMode}/>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{background:T.accent+"22",color:T.accent,border:"1px solid "+T.accent+"30",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600}}>{MODES[mode]?.label||mode}</span>
          <button onClick={()=>setShowNewSession(true)} style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 14px",fontSize:12,color:T.dim,cursor:"pointer"}}>📁 New Session</button>
          <button onClick={()=>{if(sessions.length){setActiveId(sessions[sessions.length-1].id);setView("session");setShowWizard(true);}else setShowNewSession(true);}} style={{background:T.accent,border:"none",borderRadius:8,padding:"7px 16px",fontSize:12,color:"#fff",cursor:"pointer",fontWeight:600}}>+ Log Question</button>
          <button onClick={()=>setDarkMode(d=>!d)} style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 11px",fontSize:14,cursor:"pointer",color:T.dim}}>{darkMode?"☀":"🌙"}</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:14,padding:"20px 32px"}}>
        <StatCard T={T} label="Total Questions" value={allQ.length} sub={`${totalC} correct`}/>
        <StatCard T={T} label="Overall Score" value={`${overallPct}%`} sub={`${totalC} correct`} color={T.scoreColor(overallPct)}/>
        <StatCard T={T} label="Recent 20" value={`${recentPct}%`} sub={`${recentQs.filter(q=>q.result==="correct").length}/${recentQs.length}`} color={T.scoreColor(recentPct)}/>
        <StatCard T={T} label="Changed → Wrong" value={changedWrong} sub="Trust your gut!" color={T.danger}/>
      </div>

      {/* Tabs */}
      <TabBar T={T} tabs={[["sessions","📁  Sessions"],["topics","🔍  Topics"],["analytics","📊  Analytics"],["flashcards",`⚡  Flashcards${ankiTotal>0?" ("+ankiTotal+")":""}`]]} active={tab} onChange={setTab} style={{padding:"0 32px"}}/>

      <div style={{padding:"20px 32px"}}>
        {/* SESSIONS */}
        {tab==="sessions"&&(<>
          {sessions.length===0&&<div style={{textAlign:"center",color:T.muted,padding:"50px 0",fontSize:13}}>No {mode} sessions yet. Create your first session!</div>}
          {[...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(s=>{
            const c=s.questions.filter(q=>q.result==="correct").length,p=pct(c,s.questions.length);
            return(<Card key={s.id} T={T} onClick={()=>{setActiveId(s.id);setView("session");}} style={{padding:"16px 20px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:15,fontWeight:600,marginBottom:4,color:T.text}}>{s.name}</div>
                  <div style={{fontSize:12,color:T.muted,display:"flex",gap:16}}>
                    <span>📅 {s.date}</span><span>📄 {s.questions.length} questions</span>
                    {s.questions.filter(q=>q.ankiFront).length>0&&<span style={{color:T.accent}}>⚡ {s.questions.filter(q=>q.ankiFront).length} Anki</span>}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:22,fontWeight:700,color:s.questions.length?T.scoreColor(p):T.muted}}>{s.questions.length?`${p}%`:"—"}</div>
                    {s.questions.length>0&&<div style={{fontSize:11,color:T.muted}}>{c}/{s.questions.length}</div>}
                  </div>
                  <button onClick={e=>{e.stopPropagation();setSessions(prev=>prev.filter(x=>x.id!==s.id));}} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:14,padding:"4px 6px"}}>🗑</button>
                  <span style={{color:T.muted,fontSize:16}}>›</span>
                </div>
              </div>
            </Card>);
          })}
        </>)}

        {/* ALL QUESTIONS */}
        {tab==="allquestions"&&(<>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:11,color:T.muted}}>Filter:</span>
            <select style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:7,padding:"5px 10px",color:T.dim,fontSize:11}} value={filterSubject} onChange={e=>setFilterSubject(e.target.value)}><option>All</option>{cfg.subjects.map(s=><option key={s}>{s}</option>)}</select>
            <select style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:7,padding:"5px 10px",color:T.dim,fontSize:11}} value={filterResult} onChange={e=>setFilterResult(e.target.value)}>{["All","Correct","Incorrect"].map(r=><option key={r}>{r}</option>)}</select>
            <span style={{fontSize:11,color:T.muted,marginLeft:"auto"}}>{filteredQ.length} questions</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"110px 80px 70px 1fr 90px",gap:10,padding:"5px 14px",marginBottom:6}}>
            {["RESULT","SESSION","DATE","SUBJECT / CONCEPT","TYPE"].map(h=><div key={h} style={{fontSize:9,color:T.muted,letterSpacing:"0.9px"}}>{h}</div>)}
          </div>
          {filteredQ.map(q=>{const sess=sessions.find(s=>s.questions.some(sq=>sq.id===q.id));return(
            <Card key={q.id} T={T} style={{padding:"10px 14px",marginBottom:7}}>
              <div style={{display:"grid",gridTemplateColumns:"110px 80px 70px 1fr 90px",gap:10,alignItems:"center"}}>
                <ResultBadge result={q.result} T={T}/>
                <span style={{fontSize:11,color:T.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sess?.name}</span>
                <span style={{fontSize:11,color:T.muted}}>{q.date}</span>
                <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                  {q.subject&&<Pill label={q.subject} color={subjColors[q.subject]}/>}
                  {q.concept&&<span style={{fontSize:12,color:T.muted}}>· {q.concept}</span>}
                  {q.ankiFront&&<span style={{fontSize:10,color:T.accent,background:T.accent+"18",borderRadius:4,padding:"1px 5px"}}>⚡</span>}
                </div>
                <span style={{fontSize:11,color:T.muted}}>{q.qtype||"—"}</span>
              </div>
            </Card>
          );})}
          {filteredQ.length===0&&<div style={{textAlign:"center",color:T.muted,padding:"40px 0",fontSize:12}}>No questions match your filters.</div>}
        </>)}


        {/* TOPICS */}
        {tab==="topics"&&(<TopicBrowser T={T} allQ={allQ} sessions={sessions} cfg={cfg}/>)}

        {/* ANALYTICS */}
        {tab==="analytics"&&(<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:20}}>
            {[{l:"Correct → Wrong",v:allQ.filter(q=>q.answerChange==="Correct → Incorrect").length,c:T.danger},{l:"Wrong → Correct",v:allQ.filter(q=>q.answerChange==="Incorrect → Correct").length,c:T.success},{l:"Wrong → Wrong",v:allQ.filter(q=>q.answerChange==="Incorrect → Incorrect").length,c:T.warn},{l:"Didn't know",v:allQ.filter(q=>q.wrongReason==="Didn't know the material").length,c:T.danger},{l:"Wrong algorithm",v:allQ.filter(q=>q.wrongReason==="Knew material, wrong algorithm").length,c:T.warn},{l:"Silly mistake",v:allQ.filter(q=>q.wrongReason==="Silly mistake / misread").length,c:"#fb923c"}].map(item=>(
              <Card key={item.l} T={T} style={{padding:"14px 16px"}}><div style={{fontSize:10,color:T.muted,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:6}}>{item.l}</div><div style={{fontSize:24,fontWeight:700,color:item.c}}>{item.v}</div></Card>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {[{title:"Score by Subject",data:analytics.bySubject},{title:"Score by Question Type",data:analytics.byType}].map(({title,data:d})=>(
              <Card key={title} T={T} style={{padding:"18px 20px"}}><div style={{fontSize:10,color:T.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:14}}>{title}</div>{Object.entries(d).map(([k,v])=><BarRow key={k} T={T} label={k} p={pct(v.c,v.t)}/>)}{Object.keys(d).length===0&&<div style={{fontSize:12,color:T.muted}}>No data yet.</div>}</Card>
            ))}
            <Card T={T} style={{padding:"18px 20px"}}><div style={{fontSize:10,color:T.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:14}}>Why You Got It Wrong</div>{Object.entries(analytics.byReason).map(([r,c])=><div key={r} style={{display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:12}}><span style={{color:T.dim}}>{r}</span><span style={{color:T.danger,fontWeight:600}}>{c}</span></div>)}{Object.keys(analytics.byReason).length===0&&<div style={{fontSize:12,color:T.muted}}>No data yet.</div>}</Card>
            <Card T={T} style={{padding:"18px 20px"}}><div style={{fontSize:10,color:T.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:14}}>Answer Change Patterns</div>{Object.entries(analytics.byChange).map(([c,n])=><div key={c} style={{display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:12}}><span style={{color:T.dim}}>{c}</span><span style={{fontWeight:600,color:c==="Incorrect → Correct"?T.success:c==="Correct → Incorrect"?T.danger:T.warn}}>{n}</span></div>)}{Object.keys(analytics.byChange).length===0&&<div style={{fontSize:12,color:T.muted}}>No data yet.</div>}</Card>
          </div>
        </>)}

        {/* FLASHCARDS */}
        {tab==="flashcards"&&(<>
          {/* Header row */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div>
              <div style={{fontSize:16,fontWeight:600,color:T.text,marginBottom:3}}>Flashcards</div>
              <div style={{fontSize:12,color:T.muted}}>{ankiTotal} cards ready · Click any card to flip · Download for Anki</div>
            </div>
            {ankiTotal>0&&<button onClick={()=>{
              const rows=allQ.filter(q=>q.ankiFront&&q.ankiFront.trim()).map(q=>{
                const back=[
                  q.result==="correct"?"✓ Correct":"✗ Incorrect",
                  q.subject&&`Subject: ${q.subject}`,
                  q.concept&&`Concept: ${q.concept}`,
                  q.wrongReason&&`Why wrong: ${q.wrongReason}`,
                  q.correctReason&&`Why correct: ${q.correctReason}`,
                  q.resource&&`Review: ${q.resource}`,
                  q.notes&&`Notes: ${q.notes}`,
                ].filter(Boolean).join("<br>");
                return `${q.ankiFront.replace(/\t/g," ")}\t${back}`;
              }).join("\n");
              const a=document.createElement("a");
              a.href=URL.createObjectURL(new Blob([rows],{type:"text/plain"}));
              a.download="vimavima_anki.txt"; a.click();
            }} style={{background:T.accent,border:"none",borderRadius:8,padding:"9px 20px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>⬇ Download .apkg Deck</button>}
          </div>

          {/* How it works note */}
          <div style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 14px",marginBottom:20,fontSize:12,color:T.dim,display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:16}}>💡</span>
            <span>Each card has a <b style={{color:T.text}}>front</b> (your 1-liner cue) and a <b style={{color:T.text}}>back</b> (answer details). Click to flip. Download exports a .txt file — open Anki → File → Import → select the file.</span>
          </div>

          {allQ.filter(q=>q.ankiFront).length===0&&(
            <div style={{textAlign:"center",color:T.muted,padding:"50px 0",fontSize:13}}>
              <div style={{fontSize:36,marginBottom:12}}>⚡</div>
              <div style={{color:T.dim,marginBottom:6,fontWeight:600}}>No flashcards yet</div>
              <div style={{fontSize:12}}>When logging a question, fill in the <b style={{color:T.text}}>"Flashcard 1-liner"</b> step to create a card automatically.</div>
            </div>
          )}

          {/* Flip cards grid */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
            {allQ.filter(q=>q.ankiFront&&q.ankiFront.trim()).map(q=>{
              const sess=sessions.find(s=>s.questions.some(sq=>sq.id===q.id));
              const isC=q.result==="correct";
              const backLines=[
                {label:"Result",  val: isC?"✓ Correct":"✗ Incorrect", color: isC?T.success:T.danger},
                {label:"Concept", val: q.concept,   color: T.text},
                {label:"Subject", val: q.subject,   color: subjColors[q.subject]||T.dim},
                {label:"Type",    val: q.qtype,     color: T.dim},
                isC
                  ? {label:"Why correct", val: q.correctReason, color: T.success}
                  : {label:"Why wrong",   val: q.wrongReason,   color: T.danger},
                q.resource && {label:"Review", val: q.resource, color: T.accent},
                q.notes    && {label:"Notes",  val: q.notes,    color: T.dim},
              ].filter(Boolean).filter(x=>x.val);

              return <FlipCard key={q.id} T={T} front={q.ankiFront} backLines={backLines} session={sess?.name}/>;
            })}
          </div>
        </>)}
      </div>

      {/* New Session Modal */}
      {showNewSession&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500}} onClick={e=>e.target===e.currentTarget&&setShowNewSession(false)}>
          <Card T={T} style={{padding:"28px 30px",width:"100%",maxWidth:380}}>
            <h2 style={{fontSize:17,fontWeight:700,marginBottom:20,color:T.text}}>New {mode} Session</h2>
            <div style={{marginBottom:14}}><Lbl T={T}>Session Name</Lbl><Inp T={T} placeholder="e.g. NBME 14, MCAT Practice 3…" value={newSess.name} onChange={e=>setNewSess(n=>({...n,name:e.target.value}))} autoFocus/></div>
            <div style={{marginBottom:22}}><Lbl T={T}>Date</Lbl><Inp T={T} type="date" value={newSess.date} onChange={e=>setNewSess(n=>({...n,date:e.target.value}))}/></div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
              <button onClick={()=>setShowNewSession(false)} style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 16px",color:T.muted,cursor:"pointer",fontSize:12}}>Cancel</button>
              <button onClick={createSession} style={{background:T.accent,border:"none",borderRadius:8,padding:"8px 18px",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600}}>Create</button>
            </div>
          </Card>
        </div>
      )}
      
    </div>
  );
}