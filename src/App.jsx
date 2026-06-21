import { useState, useMemo, useEffect, useRef } from "react";
import { supabase } from './supabase.js'  //
// ── Fonts ────────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap";
document.head.appendChild(fontLink);
 
const styleEl = document.createElement("style");
styleEl.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #0f1115; }

  /* Sleek Scrollbar */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #1a1d24; }
  ::-webkit-scrollbar-thumb { border-radius: 10px; background: #3a3f4b; border: 2px solid #1a1d24; }

  /* Modern Buttons */
  button { 
    padding: 10px 20px; 
    border-radius: 12px; 
    border: none; 
    background: #2563eb; 
    color: white; 
    transition: transform 0.2s, background 0.2s; 
    cursor: pointer;
  }
  button:hover { background: #1d4ed8; transform: translateY(-1px); }
`;
document.head.appendChild(styleEl);
const LOGO_B64 = "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";
const LOGO_SRC = `data:image/png;base64,${LOGO_B64}`;
 
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
  bg:"#07090f", surface:"#0d1020", raised:"#131728",
  border:"rgba(100,140,255,0.09)", borderHov:"rgba(100,140,255,0.22)",
  text:"#dce8ff", muted:"#4e6080", dim:"#8aa0c0",
  accent:"#3b6eff", accentGlow:"rgba(59,110,255,0.18)",
  success:"#22c55e", danger:"#ef4444", warn:"#f59e0b", gold:"#C9A84C",
  scoreColor:(p)=>p>=75?"#22c55e":p>=60?"#f59e0b":"#ef4444",
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

  const inp = {
    width:"100%",
    background:T.raised,
    border:"1px solid "+T.border,
    borderRadius:8,
    padding:"11px 14px",
    color:T.text,
    fontSize:13,
    marginBottom:14,
    boxSizing:"border-box"
  };

  const btn = (disabled) => ({
    width:"100%",
    background:disabled?T.muted:T.accent,
    border:"none",
    borderRadius:10,
    padding:"12px",
    color:"#fff",
    fontSize:14,
    fontWeight:600,
    cursor:disabled?"not-allowed":"pointer",
    marginTop:4,
    opacity:disabled?0.45:1
  });

  const oBtn = {
    width:"100%",
    background:T.raised,
    border:"1px solid "+T.border,
    borderRadius:10,
    padding:"11px",
    color:T.text,
    fontSize:13,
    fontWeight:500,
    cursor:"pointer",
    marginBottom:10,
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    gap:10
  };

  // ✅ SUPABASE LOGIN FUNCTION
  const signInWithProvider = async (provider) => {
    try {
      // window.location.origin automatically gets your current StackBlitz preview URL or production URL
      const currentUrl = window.location.origin;
  
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: currentUrl,
        }
      });
      if (error) setError(error.message);
    } catch (err) {
      setError("Login failed. Try again.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('vimavima_track'); // Clear their track choice
    window.location.reload(); // Refresh to clean the slate
  };

  const handleSubmit = () => {
    if (!email || !pass) {
      setError("Please fill in all fields.");
      return;
    }
    if (screen==="signup" && !name) {
      setError("Please enter your name.");
      return;
    }
    setError("");
    setScreen("onboarding");
  };

  // ── ONBOARDING SCREEN ───────────────────────────────
  if (screen === "onboarding") return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:20 }}>
      <div style={{ background:T.surface, border:"1px solid "+T.border, borderRadius:20, padding:"40px 36px", width:"100%", maxWidth:440 }}>
        <div style={{ marginBottom:28, display:"flex", justifyContent:"center" }}>
          <VimaLogo dark={T.name==="dark"}/>
        </div>

        <div style={{ fontSize:22, fontWeight:700, color:T.text, marginBottom:6, textAlign:"center" }}>
          What are you studying for?
        </div>

        <div style={{ fontSize:13, color:T.muted, textAlign:"center", marginBottom:28 }}>
          This personalizes your question types and subjects.
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
          {TRACKS.map(tr => (
            <button
              key={tr.id}
              onClick={() => setTrack(tr.id)}
              style={{
                background:track===tr.id?T.accent+"22":T.raised,
                border:"2px solid "+(track===tr.id?T.accent:T.border),
                borderRadius:12,
                padding:"16px 18px",
                cursor:"pointer",
                textAlign:"left",
                display:"flex",
                alignItems:"center",
                gap:14
              }}
            >
              <span style={{ fontSize:26 }}>{tr.icon}</span>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:T.text }}>
                  {tr.label}
                </div>
                <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>
                  {tr.sub}
                </div>
              </div>
              {track===tr.id && (
                <span style={{ marginLeft:"auto", color:T.accent, fontSize:18 }}>✓</span>
              )}
            </button>
          ))}
        </div>

        <button
          disabled={!track}
          onClick={() => onAuth({ name, email, track })}
          style={btn(!track)}
        >
          Get Started →
        </button>
      </div>
    </div>
  );

  // ── AUTH SCREEN ───────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:20 }}>
      <div style={{ background:T.surface, border:"1px solid "+T.border, borderRadius:20, padding:"40px 36px", width:"100%", maxWidth:420 }}>

        <div style={{ marginBottom:28, display:"flex", justifyContent:"center" }}>
          <VimaLogo dark={T.name==="dark"}/>
        </div>

        <div style={{ fontSize:22, fontWeight:700, color:T.text, marginBottom:6, textAlign:"center" }}>
          {screen==="login"?"Welcome back":"Create your account"}
        </div>

        <div style={{ fontSize:13, color:T.muted, textAlign:"center", marginBottom:24 }}>
          {screen==="login"?"Log in to your VIMA VIMA account":"Start tracking your performance"}
        </div>

        {/* GOOGLE */}
        <button style={oBtn} onClick={() => signInWithProvider('google')}>
          Continue with Google
        </button>

        {/* APPLE */}
        <button style={oBtn} onClick={() => signInWithProvider('apple')}>
          Continue with Apple
        </button>

        {/* GITHUB (replaces Yahoo) */}
        <button style={oBtn} onClick={() => signInWithProvider('github')}>
          Continue with GitHub
        </button>

        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"18px 0" }}>
          <div style={{ flex:1, height:1, background:T.border }}/>
          <span style={{ fontSize:11, color:T.muted }}>OR</span>
          <div style={{ flex:1, height:1, background:T.border }}/>
        </div>

        {error && (
          <div style={{ background:T.danger+"18", border:"1px solid "+T.danger+"30", borderRadius:8, padding:"9px 12px", fontSize:12, color:T.danger, marginBottom:14, textAlign:"center" }}>
            {error}
          </div>
        )}

        {screen==="signup" && (
          <>
            <label style={{ fontSize:10, color:T.muted, letterSpacing:"0.9px", textTransform:"uppercase", marginBottom:6, display:"block" }}>
              Full Name
            </label>
            <input style={inp} placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/>
          </>
        )}

        <label style={{ fontSize:10, color:T.muted, letterSpacing:"0.9px", textTransform:"uppercase", marginBottom:6, display:"block" }}>
          Email
        </label>
        <input style={inp} type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>

        <label style={{ fontSize:10, color:T.muted, letterSpacing:"0.9px", textTransform:"uppercase", marginBottom:6, display:"block" }}>
          Password
        </label>
        <input style={inp} type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)}/>

        <button style={btn(false)} onClick={handleSubmit}>
          {screen==="login"?"Log In":"Create Account"}
        </button>

        <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:T.muted }}>
          {screen==="login" ? (
            <span>No account? <span style={{ color:T.accent, cursor:"pointer", fontWeight:600 }} onClick={()=>{setScreen("signup");setError("");}}>Sign up free</span></span>
          ) : (
            <span>Have an account? <span style={{ color:T.accent, cursor:"pointer", fontWeight:600 }} onClick={()=>{setScreen("login");setError("");}}>Log in</span></span>
          )}
        </div>

      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App(){
  const [splashDone,setSplashDone]=useState(false);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const handleUserSession = (session) => {
      if (session?.user) {
        const savedTrack = localStorage.getItem('vimavima_track');
        setUser({
          name: session.user.user_metadata?.full_name || session.user.email,
          email: session.user.email,
          track: savedTrack || null
        });
      } else {
        setUser(null);
      }
      setIsAuthLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 
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

// 1. Show loading screen while checking Supabase
if (isAuthLoading) {
  return <div style={{ minHeight: "100vh", background: T.bg }}></div>; 
}

// 2. Show auth if not logged in
if (!user) {
  return <AuthScreen T={T} onAuth={(u) => { 
    localStorage.setItem('vimavima_track', u.track);
    setUser(u); 
  }} />;
}

// 3. If the user is logged in but hasn't picked a track yet, show onboarding
if (user && !user.track) {
  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <h1 style={{fontSize:24,fontWeight:700,marginBottom:8}}>Welcome to VimaVima</h1>
      <p style={{color:T.muted,marginBottom:32}}>What exam track are you studying for?</p>
      <div style={{display:"flex",gap:16,maxWidth:800,width:"100%",padding:20,justifyContent:"center"}}>
        {TRACKS.map(tr => {
          return (
            <div 
              key={tr.id} 
              onClick={() => {
                localStorage.setItem('vimavima_track', tr.id);
                setUser(prev => ({ ...prev, track: tr.id }));
              }}
              style={{
                background:T.raised,
                border:`1px solid ${T.border}`,
                borderRadius:12,
                padding:24,
                textAlign:"center",
                cursor:"pointer",
                flex:1,
                maxWidth:200
              }}
            >
              <div style={{fontSize:24,marginBottom:8}}>{tr.icon}</div>
              <div style={{fontWeight:600}}>{tr.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 4. Show splash screen before loading the main app
if (!splashDone) return <SplashScreen dark={darkMode} onDone={() => setSplashDone(true)} />;
if(view==="session"&&activeSess) return (
  <>
    <SessionDetail session={activeSess} onBack={()=>setView("home")} onAddQuestion={()=>setShowWizard(true)} mode={mode} T={T}/>
    {showWizard&&<Wizard onClose={()=>setShowWizard(false)} onSave={addQuestion} mode={mode} T={T}/>}
  </>
);
  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'DM Sans',sans-serif",paddingBottom:60}}>

      {/* Header */}
      <div style={{
      width: "100%",          // <--- Changed from fixed constraints
      minHeight: "100vh",     // Keeps it at least the full window height
      background: T.bg,       // Keeps your theme background
      margin: 0,              // Removes external spacing
      padding: 0,             // Removes internal spacing
      display: "flex",
      flexDirection: "column"
    }}>

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