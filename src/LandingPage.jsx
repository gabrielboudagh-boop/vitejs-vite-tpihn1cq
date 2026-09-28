import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "./ThemeContext.jsx";
import BrandLogo from "./BrandLogo.jsx";
import SEO from "./SEO.jsx";

// ── Brand tokens (mirrors DARK theme) ────────────────────────────────────────
const C = {
  bg:"#050810", surface:"#0a0f1f", raised:"#101629",
  border:"rgba(100,140,255,0.12)", text:"#e8ecf5",
  muted:"#8896b0", dim:"#a0b4cc", accent:"#3b6eff",
  success:"#3dab80", danger:"#c86060", warn:"#b8943a",
};
const PIE_COLORS = ["#3b82f6","#10b981","#8b5cf6","#f59e0b","#ec4899","#06b6d4","#f97316"];
// Taxonomy below mirrors MODES / QBANKS_MAP in App.jsx exactly so the demo matches the real app.
const DEMO_SUBJECTS = {
  USMLE:["Cardiology","Pulmonology","Neurology","OB/GYN","GI","Renal","MSK","Derm","Heme/Onc","ID","Endo","Peds","Psych","Surgery","Biostats/Ethics","Other"],
  MCAT: ["C/P","CARS","B/B","Psych/Soc"],
  LSAT: ["Logical Reasoning","Analytical Reasoning","Reading Comprehension"],
};
const DEMO_QTYPES = {
  USMLE:["Diagnosis","Management","Biostats/Ethics","Pathophysiology","Pharmacology"],
  MCAT:["Passage-based","Discrete","Research interpretation","Data analysis","Critical analysis"],
  LSAT:["Strengthen","Weaken","Assumption","Inference","Flaw","Parallel","Method","Main Point","Must Be True","Cannot Be True"],
};
const DEMO_QBANKS = {
  USMLE:["UWorld","Amboss","NBME","Free 120","UWise","Kaplan","Other"],
  MCAT: ["UWorld MCAT","Kaplan","Princeton Review","Blueprint","AAMC Official","Khan Academy","Other"],
  LSAT: ["7Sage","PowerScore","Princeton Review","Manhattan Prep","LSAC Official","Khan Academy","Other"],
};
const DEMO_TIMING = ["Under the limit","At the limit","Over the limit"];
const DEMO_ANSWER_CHANGES = ["No change","Incorrect → Correct","Correct → Incorrect","Incorrect → Incorrect"];
const WRONG_REASONS   = ["Didn't know the material","Knew material, wrong algorithm","Ran out of time","Silly mistake / misread"];
const CORRECT_REASONS = ["Right reasoning","Guessed","Flawed reasoning"];
const DEMO_LIMIT = 5;
const FULL_STEPS = ["result","time","change","why","category","summary","anki","notes"];
const FULL_STEP_LABELS = ["Correct or incorrect?","Time taken","Answer changed?","Why?","What was this about?","Question summary","Flashcard","Reflection & notes"];

// ── Theme-aware gradient helper ───────────────────────────────────────────────
function getHeroGradients(isDark) {
  if (isDark) {
    return {
      slide1: "linear-gradient(135deg, rgba(59,110,255,0.15) 0%, rgba(16,185,129,0.1) 100%)",
      slide2: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,110,255,0.1) 100%)",
      slide3: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(236,72,153,0.1) 100%)",
      slide4: "linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(59,110,255,0.1) 100%)",
      slide5: "linear-gradient(135deg, rgba(59,110,255,0.15) 0%, rgba(139,92,246,0.1) 100%)",
      colors: [
        {primary:"rgba(59,110,255,0.3)", secondary:"rgba(16,185,129,0.25)"},
        {primary:"rgba(139,92,246,0.3)", secondary:"rgba(59,110,255,0.25)"},
        {primary:"rgba(245,158,11,0.3)", secondary:"rgba(236,72,153,0.25)"},
        {primary:"rgba(6,182,212,0.3)", secondary:"rgba(59,110,255,0.25)"},
        {primary:"rgba(59,110,255,0.3)", secondary:"rgba(139,92,246,0.25)"},
      ]
    };
  } else {
    // Light mode: Much stronger gradients for better visibility on light backgrounds
    return {
      slide1: "linear-gradient(135deg, rgba(0,85,212,0.28) 0%, rgba(34,197,94,0.22) 100%)",
      slide2: "linear-gradient(135deg, rgba(147,51,234,0.28) 0%, rgba(0,85,212,0.22) 100%)",
      slide3: "linear-gradient(135deg, rgba(217,119,6,0.28) 0%, rgba(190,24,93,0.22) 100%)",
      slide4: "linear-gradient(135deg, rgba(6,182,212,0.28) 0%, rgba(0,85,212,0.22) 100%)",
      slide5: "linear-gradient(135deg, rgba(0,85,212,0.28) 0%, rgba(147,51,234,0.22) 100%)",
      colors: [
        {primary:"rgba(0,85,212,0.5)", secondary:"rgba(34,197,94,0.45)"},
        {primary:"rgba(147,51,234,0.5)", secondary:"rgba(0,85,212,0.45)"},
        {primary:"rgba(217,119,6,0.5)", secondary:"rgba(190,24,93,0.45)"},
        {primary:"rgba(6,182,212,0.5)", secondary:"rgba(0,85,212,0.45)"},
        {primary:"rgba(0,85,212,0.5)", secondary:"rgba(147,51,234,0.45)"},
      ]
    };
  }
}

// ── AdSense (public pages only) ───────────────────────────────────────────────
function injectAdSense() {
  if (document.querySelector('script[src*="adsbygoogle"]')) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4179326594130154";
  s.crossOrigin = "anonymous";
  document.head.appendChild(s);
}

function AdUnit() {
  useEffect(() => {
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
  }, []);
  return (
    <div style={{width:"100%",overflow:"hidden",margin:"40px 0"}}>
      <ins className="adsbygoogle" style={{display:"block"}}
        data-ad-client="ca-pub-4179326594130154"
        data-ad-format="auto" data-full-width-responsive="true"/>
    </div>
  );
}

// ── Interactive Demo ──────────────────────────────────────────────────────────
function LegacyInteractiveDemo() {
  const [exam, setExam]           = useState("USMLE");
  const [questions, setQuestions] = useState([]);
  const [result, setResult]       = useState("");
  const [subject, setSubject]     = useState("");
  const [showSave, setShowSave]   = useState(false);
  const [email, setEmail]         = useState("");
  const [pass, setPass]           = useState("");
  const [linkStatus, setLinkStatus] = useState("idle"); // idle | working | done | error

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) supabase.auth.signInAnonymously().catch(() => {});
    });
  }, []);

  const addQuestion = () => {
    if (!result || !subject) return;
    setQuestions(prev => [...prev, {
      id: Date.now(), result, subject, exam,
      date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),
    }]);
    setResult(""); setSubject("");
  };

  const linkAccount = async () => {
    if (!email || !pass) return;
    setLinkStatus("working");
    const { error } = await supabase.auth.updateUser({ email, password: pass });
    if (error) {
      // anonymous user — try upgrading with signUp which merges the session
      const { error: e2 } = await supabase.auth.signUp({ email, password: pass });
      setLinkStatus(e2 ? "error" : "done");
    } else {
      setLinkStatus("done");
    }
  };

  const correct  = questions.filter(q => q.result === "correct").length;
  const score    = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  const bySubj   = {};
  questions.forEach(q => { bySubj[q.subject] = (bySubj[q.subject] || 0) + 1; });
  const pieData  = Object.entries(bySubj).map(([name, value]) => ({ name, value }));
  const isDone   = questions.length >= DEMO_LIMIT;

  const btn = (active, danger) => ({
    flex:1, background: active ? (danger ? C.danger+"22" : C.success+"22") : C.raised,
    border: `1px solid ${active ? (danger ? C.danger : C.success) : C.border}`,
    color: active ? (danger ? C.danger : C.success) : C.dim,
    borderRadius:8, padding:"10px", fontSize:13, cursor:"pointer",
    fontFamily:"'DM Sans',sans-serif", fontWeight: active ? 600 : 400, transition:"all 0.15s",
  });

  return (
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"28px 24px",maxWidth:620,margin:"0 auto"}}>
      {/* Exam selector */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:C.text}}>Live Demo — no account needed</div>
          <div style={{fontSize:12,color:C.muted,marginTop:3}}>Log up to {DEMO_LIMIT} questions and watch your analytics build live.</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {["USMLE","MCAT","LSAT"].map(e => (
            <button key={e} onClick={() => {setExam(e);setSubject("");}}
              style={{background:exam===e?C.accent:C.raised,border:`1px solid ${exam===e?C.accent:C.border}`,
                borderRadius:7,padding:"5px 12px",color:exam===e?"#fff":C.dim,fontSize:12,
                fontWeight:exam===e?600:400,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      {!isDone ? (
        <div style={{marginBottom:22}}>
          <div style={{fontSize:10,color:C.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:8}}>
            Question {questions.length + 1} of {DEMO_LIMIT} — result?
          </div>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <button onClick={() => setResult("correct")} style={btn(result==="correct",false)}>✓ Correct</button>
            <button onClick={() => setResult("incorrect")} style={btn(result==="incorrect",true)}>✗ Incorrect</button>
          </div>
          <div style={{fontSize:10,color:C.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:8}}>Subject</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
            {DEMO_SUBJECTS[exam].map(s => (
              <button key={s} onClick={() => setSubject(s)}
                style={{background:subject===s?C.accent+"22":C.raised,border:`1px solid ${subject===s?C.accent+"60":C.border}`,
                  borderRadius:7,padding:"5px 12px",color:subject===s?C.accent:C.dim,fontSize:11,
                  cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={addQuestion} disabled={!result || !subject}
            style={{width:"100%",background:result&&subject?C.accent:C.raised,border:`1px solid ${result&&subject?C.accent:C.border}`,
              borderRadius:8,padding:"11px",color:result&&subject?"#fff":C.muted,fontSize:14,
              fontWeight:600,cursor:result&&subject?"pointer":"not-allowed",opacity:result&&subject?1:0.5,
              fontFamily:"'DM Sans',sans-serif"}}>
            Log Question →
          </button>
        </div>
      ) : (
        <div style={{background:C.accent+"14",border:`1px solid ${C.accent}30`,borderRadius:10,padding:"14px",marginBottom:20,textAlign:"center"}}>
          <div style={{fontSize:14,fontWeight:600,color:C.accent,marginBottom:4}}>Demo complete 🎯</div>
          <div style={{fontSize:12,color:C.muted}}>Create a free account to log unlimited sessions, Anki export, and full analytics.</div>
        </div>
      )}

      {/* Analytics */}
      {questions.length > 0 && (
        <div>
          <div style={{display:"flex",gap:10,marginBottom:16}}>
            {[
              {l:"Questions",v:questions.length,c:C.text},
              {l:"Score",v:`${score}%`,c:score>=75?C.success:score>=60?C.warn:C.danger},
              {l:"Correct",v:correct,c:C.success},
            ].map(s => (
              <div key={s.l} style={{flex:1,background:C.raised,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px"}}>
                <div style={{fontSize:9,color:C.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:4}}>{s.l}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div>
              </div>
            ))}
          </div>
          {pieData.length > 0 && (
            <>
              <div style={{height:140,marginBottom:10}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={62} paddingAngle={3} dataKey="value" startAngle={90} endAngle={450}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11,color:C.text}}
                      formatter={(v) => [`${v} Q`, ""]}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:16}}>
                {pieData.map((d, i) => (
                  <div key={d.name} style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:2,background:PIE_COLORS[i%PIE_COLORS.length],flexShrink:0}}/>
                    <span style={{fontSize:12,color:C.dim,flex:1}}>{d.name}</span>
                    <span style={{fontSize:12,fontWeight:700,color:PIE_COLORS[i%PIE_COLORS.length]}}>{d.value} Q</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Save prompt */}
          {questions.length >= 2 && (
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16}}>
              {!showSave ? (
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,color:C.muted}}>Save your data &amp; unlock the full platform</span>
                  <button onClick={() => setShowSave(true)}
                    style={{background:C.accent,border:"none",borderRadius:8,padding:"8px 18px",color:"#fff",
                      fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                    Save Free →
                  </button>
                </div>
              ) : linkStatus === "done" ? (
                <div style={{textAlign:"center",color:C.success,fontSize:13,fontWeight:600}}>
                  ✓ Account created! Check your email, then{" "}
                  <a href="/app" style={{color:C.accent}}>open the full app →</a>
                </div>
              ) : (
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:10}}>Create your free account — your demo data carries over</div>
                  {["email","password"].map((t, i) => (
                    <input key={t} type={t} placeholder={t === "email" ? "you@email.com" : "Create password"}
                      value={i===0?email:pass} onChange={e => i===0?setEmail(e.target.value):setPass(e.target.value)}
                      style={{width:"100%",boxSizing:"border-box",background:C.raised,border:`1px solid ${C.border}`,
                        borderRadius:8,padding:"9px 14px",color:C.text,fontSize:13,fontFamily:"'DM Sans',sans-serif",
                        outline:"none",marginBottom:8}}/>
                  ))}
                  {linkStatus==="error" && <div style={{color:C.danger,fontSize:12,marginBottom:8}}>Something went wrong — try again.</div>}
                  <button onClick={linkAccount} disabled={!email||!pass||linkStatus==="working"}
                    style={{width:"100%",background:C.accent,border:"none",borderRadius:8,padding:"10px",color:"#fff",
                      fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                      opacity:!email||!pass?0.6:1}}>
                    {linkStatus==="working" ? "Creating account…" : "Create Free Account →"}
                  </button>
                  <div style={{textAlign:"center",marginTop:8,fontSize:12,color:C.muted}}>
                    Already have an account?{" "}<a href="/app" style={{color:C.accent}}>Sign in</a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DemoLbl({children,T}){
  return <div style={{fontSize:10,color:T.muted,letterSpacing:"0.9px",textTransform:"uppercase",marginBottom:6}}>{children}</div>;
}
function DemoInp({T,style={},textarea=false,...props}){
  const s={width:"100%",boxSizing:"border-box",background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 14px",color:T.text,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",...style};
  return textarea?<textarea style={{...s,resize:"vertical"}} {...props}/>:<input style={s} {...props}/>;
}
function DemoSel({T,style={},children,...props}){
  return <select style={{width:"100%",background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 14px",color:T.text,fontSize:13,fontFamily:"'DM Sans',sans-serif",...style}} {...props}>{children}</select>;
}
function DemoChoice({T,selected,onSelect,icon,title,sub,selBg}){
  return (
    <button onClick={onSelect} style={{width:"100%",background:selected?(selBg||T.accent+"18"):T.raised,border:`1px solid ${selected?T.accent+"60":T.border}`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",marginBottom:9,textAlign:"left",transition:"all 0.15s",fontFamily:"'DM Sans',sans-serif"}}>
      <span style={{fontSize:20,width:26,textAlign:"center"}}>{icon}</span>
      <div><div style={{fontSize:14,fontWeight:600,color:T.text}}>{title}</div>{sub&&<div style={{fontSize:11,color:T.muted,marginTop:2}}>{sub}</div>}</div>
    </button>
  );
}

// This is the exact 8-step review flow from the real app (App.jsx Wizard), reused here so the
// public demo matches the authenticated product 1:1. Anki/Excel exports are gated to sign-in.
function InteractiveDemo({ T }) {
  const theme = T;
  const [exam, setExam]             = useState("USMLE");
  const [questions, setQuestions]   = useState([]);
  const [step, setStep]             = useState(0);
  const [justLogged, setJustLogged] = useState(false);
  const [data, setData] = useState({result:"",time:"",answerChange:"",wrongReason:"",correctReason:"",subject:"",qtype:"",concept:"",qnum:"",qbank:"",ankiFront:"",ankiBack:"",summary:"",wrongAction:"",nextApproach:"",resource:"",notes:""});
  const [showMatrix, setShowMatrix] = useState(false);
  const [matrix, setMatrix]         = useState({mainIdea:"",tone:"",arguments:"",author:""});
  const [aiText,setAiText]=useState(""); const [aiLoading,setAiLoading]=useState(false);
  const [aiAnki,setAiAnki]=useState(""); const [ankiLoading,setAnkiLoading]=useState(false);
  const [aiAnkiBack,setAiAnkiBack]=useState(""); const [ankiBackLoading,setAnkiBackLoading]=useState(false);
  const [showSave, setShowSave]     = useState(false);
  const [email, setEmail]           = useState("");
  const [pass, setPass]             = useState("");
  const [linkStatus, setLinkStatus] = useState("idle");
  const [exportGate, setExportGate] = useState(null); // null | "anki" | "excel"
  const analyticsRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) supabase.auth.signInAnonymously().catch(() => {});
    });
  }, []);

  const set = (k,v) => setData(d => ({...d,[k]:v}));
  const next = () => setStep(s => Math.min(s+1, FULL_STEPS.length-1));
  const back = () => setStep(s => Math.max(s-1, 0));
  const autoNext = (k,v) => { set(k,v); setTimeout(next,160); };

  const resetWizard = () => {
    setData({result:"",time:"",answerChange:"",wrongReason:"",correctReason:"",subject:"",qtype:"",concept:"",qnum:"",qbank:"",ankiFront:"",ankiBack:"",summary:"",wrongAction:"",nextApproach:"",resource:"",notes:""});
    setMatrix({mainIdea:"",tone:"",arguments:"",author:""});
    setShowMatrix(false);
    setStep(0);
    setJustLogged(false);
    setAiText(""); setAiAnki(""); setAiAnkiBack("");
  };

  useEffect(() => {
    const s = FULL_STEPS[step];
    if (s === "anki" && data.concept) {
      const wrongCtx = data.wrongAction ? ` Student noted: "${data.wrongAction}".` : data.wrongReason ? ` Got it wrong because: ${data.wrongReason}.` : "";
      const approachCtx = data.nextApproach ? ` Next time approach: "${data.nextApproach}".` : "";
      if (!data.ankiFront) {
        setAnkiLoading(true); setAiAnki("");
        fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:`Create one concise Anki flashcard FRONT for a ${exam} question about "${data.concept}" (${data.qtype||""}, ${data.subject||""}).${wrongCtx}${approachCtx} Make it a conceptual cue testing the core mechanism, exam-vignette style. Max 20 words. Return ONLY the front text.`}]})})
        .then(r=>r.json()).then(j=>{setAiAnki(j.content?.find(b=>b.type==="text")?.text?.trim()||"");setAnkiLoading(false);}).catch(()=>setAnkiLoading(false));
      }
      if (!data.ankiBack) {
        setAnkiBackLoading(true); setAiAnkiBack("");
        fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:`Create one concise Anki flashcard BACK (answer) for a ${exam} question about "${data.concept}" (${data.qtype||""}, ${data.subject||""}). Give the key fact, mechanism, diagnosis, or next step in 1-2 lines. Max 25 words. Return ONLY the answer text.`}]})})
        .then(r=>r.json()).then(j=>{setAiAnkiBack(j.content?.find(b=>b.type==="text")?.text?.trim()||"");setAnkiBackLoading(false);}).catch(()=>setAnkiBackLoading(false));
      }
    }
    if (s === "notes") {
      setAiLoading(true); setAiText("");
      fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:700,messages:[{role:"user",content:`A ${exam} student just ${data.result==="correct"?`answered correctly (${data.correctReason})`:`got wrong (${data.wrongReason})`} a question on "${data.concept||data.subject}" (${data.qtype}, ${data.subject}). Give a 2-sentence clinical/exam insight. List 2 relevant references as "REF: [source] — [tip]". End with one short motivational line.`}]})})
      .then(r=>r.json()).then(j=>{setAiText(j.content?.find(b=>b.type==="text")?.text||"");setAiLoading(false);}).catch(()=>setAiLoading(false));
    }
  }, [step]);

  const isDone = questions.length >= DEMO_LIMIT;

  const finish = () => {
    setQuestions(prev => [...prev, {
      ...data, exam,
      matrix: showMatrix ? matrix : null,
      id: Date.now(),
      date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),
    }]);
    setJustLogged(true);
  };

  const linkAccount = async () => {
    if (!email || !pass) return;
    setLinkStatus("working");
    const { error } = await supabase.auth.updateUser({ email, password: pass });
    if (error) {
      const { error: e2 } = await supabase.auth.signUp({ email, password: pass });
      setLinkStatus(e2 ? "error" : "done");
    } else {
      setLinkStatus("done");
    }
  };

  const goToSignIn = () => { window.location.href = "/app"; };

  const correct = questions.filter(q => q.result === "correct").length;
  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  const bySubj = {};
  const wrongReasonsTally = {};
  questions.forEach(q => {
    if (q.subject) bySubj[q.subject] = (bySubj[q.subject] || 0) + 1;
    if (q.result === "incorrect" && q.wrongReason) wrongReasonsTally[q.wrongReason] = (wrongReasonsTally[q.wrongReason] || 0) + 1;
  });
  const pieData = Object.entries(bySubj).map(([name, value]) => ({ name, value }));
  const reasonData = Object.entries(wrongReasonsTally).map(([name, value]) => ({ name, value }));
  const ankiReadyCount = questions.filter(q => q.ankiFront && q.ankiFront.trim() && q.ankiBack && q.ankiBack.trim()).length;

  const s = FULL_STEPS[step];

  return (
    <div style={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:16,padding:"28px 24px",maxWidth:760,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:theme.text}}>Live Demo — the real 8-step review flow</div>
          <div style={{fontSize:12,color:theme.muted,marginTop:3}}>This is the exact question-logging wizard used inside the app. No account required to try it.</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {["USMLE","MCAT","LSAT"].map(e => (
            <button key={e} onClick={() => { setExam(e); resetWizard(); }}
              style={{background:exam===e?theme.accent:theme.raised,border:`1px solid ${exam===e?theme.accent:theme.border}`,borderRadius:7,padding:"5px 12px",color:exam===e?"#fff":theme.dim,fontSize:12,fontWeight:exam===e?600:400,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {isDone ? (
        <div style={{background:theme.accent+"14",border:`1px solid ${theme.accent}30`,borderRadius:10,padding:"14px",marginBottom:20,textAlign:"center"}}>
          <div style={{fontSize:14,fontWeight:600,color:theme.accent,marginBottom:4}}>Demo complete 🎯</div>
          <div style={{fontSize:12,color:theme.muted}}>You just ran the full review cycle {DEMO_LIMIT} times. Create a free account to log unlimited sessions and unlock real exports.</div>
        </div>
      ) : justLogged ? (
        <div style={{background:theme.success+"14",border:`1px solid ${theme.success}30`,borderRadius:10,padding:"18px",marginBottom:20,textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:8}}>✅</div>
          <div style={{fontSize:15,fontWeight:700,color:theme.text,marginBottom:6}}>Question logged!</div>
          <div style={{fontSize:12,color:theme.muted,marginBottom:14}}>Your analytics below just updated.</div>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={resetWizard} style={{background:theme.accent,border:"none",borderRadius:8,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Log Next Question →</button>
            <button onClick={()=>{resetWizard();analyticsRef.current?.scrollIntoView({behavior:"smooth"});}} style={{background:theme.raised,border:`1px solid ${theme.border}`,borderRadius:8,padding:"9px 18px",color:theme.dim,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>View Analytics ↓</button>
          </div>
        </div>
      ) : (
        <div style={{marginBottom:22}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center",gap:10}}>
            <div style={{fontSize:10,color:theme.muted,letterSpacing:"0.8px",textTransform:"uppercase"}}>
              Question {questions.length+1} of {DEMO_LIMIT} · Step {step+1} of {FULL_STEPS.length}
            </div>
            <div style={{fontSize:11,color:theme.accent,fontWeight:600}}>{FULL_STEP_LABELS[step]}</div>
          </div>
          <div style={{display:"flex",gap:4,marginBottom:16}}>
            {FULL_STEPS.map((_,i) => <div key={i} style={{flex:1,height:5,borderRadius:2,background:i<=step?theme.accent:theme.raised,transition:"background 0.2s"}}/>)}
          </div>

          {s === "result" && (<>
            <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:30,marginBottom:6}}>❓</div><div style={{fontSize:17,fontWeight:700,color:theme.text}}>Did you get it right?</div></div>
            <DemoChoice T={theme} selected={data.result==="correct"} onSelect={()=>autoNext("result","correct")} icon="✅" title="Correct" sub="I picked the right answer" selBg={theme.success+"18"}/>
            <DemoChoice T={theme} selected={data.result==="incorrect"} onSelect={()=>autoNext("result","incorrect")} icon="❌" title="Incorrect" sub="I got it wrong" selBg={theme.danger+"18"}/>
          </>)}

          {s === "time" && (<>
            <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:30,marginBottom:6}}>🕐</div><div style={{fontSize:17,fontWeight:700,color:theme.text}}>How long did it take?</div></div>
            <DemoChoice T={theme} selected={data.time==="Under the limit"} onSelect={()=>autoNext("time","Under the limit")} icon="⚡" title="Under the limit"/>
            <DemoChoice T={theme} selected={data.time==="At the limit"} onSelect={()=>autoNext("time","At the limit")} icon="🕐" title="At the limit"/>
            <DemoChoice T={theme} selected={data.time==="Over the limit"} onSelect={()=>autoNext("time","Over the limit")} icon="🚨" title="Over the limit" selBg={theme.danger+"18"}/>
          </>)}

          {s === "change" && (<>
            <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:30,marginBottom:6}}>🔄</div><div style={{fontSize:17,fontWeight:700,color:theme.text}}>Did you change your answer?</div></div>
            {DEMO_ANSWER_CHANGES.map(c => (
              <DemoChoice key={c} T={theme} selected={data.answerChange===c} onSelect={()=>autoNext("answerChange",c)}
                icon={c==="No change"?"➡️":c==="Incorrect → Correct"?"✅":c==="Correct → Incorrect"?"❌":"🔁"} title={c}
                selBg={c==="Incorrect → Correct"?theme.success+"18":c==="Correct → Incorrect"?theme.danger+"18":theme.warn+"18"}/>
            ))}
          </>)}

          {s === "why" && data.result === "correct" && (<>
            <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:30,marginBottom:6}}>✅</div><div style={{fontSize:17,fontWeight:700,color:theme.text}}>Why were you correct?</div></div>
            {CORRECT_REASONS.map(r => <DemoChoice key={r} T={theme} selected={data.correctReason===r} onSelect={()=>autoNext("correctReason",r)} icon={r==="Right reasoning"?"🎯":r==="Guessed"?"🎲":"⚠️"} title={r}/>)}
          </>)}
          {s === "why" && data.result !== "correct" && (<>
            <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:30,marginBottom:6}}>❌</div><div style={{fontSize:17,fontWeight:700,color:theme.text}}>Why did you get it wrong?</div></div>
            {WRONG_REASONS.map(r => <DemoChoice key={r} T={theme} selected={data.wrongReason===r} onSelect={()=>autoNext("wrongReason",r)} icon={r==="Didn't know the material"?"📚":r==="Knew material, wrong algorithm"?"🧠":r==="Ran out of time"?"⏰":"😅"} title={r}/>)}
          </>)}

          {s === "category" && (<>
            <div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:30,marginBottom:6}}>⚡</div><div style={{fontSize:17,fontWeight:700,color:theme.text}}>What was this about?</div></div>
            <div style={{display:"grid",gap:12}}>
              <div><DemoLbl T={theme}>Subject</DemoLbl><DemoSel T={theme} value={data.subject} onChange={e=>set("subject",e.target.value)}><option value="">Select subject...</option>{DEMO_SUBJECTS[exam].map(s=><option key={s}>{s}</option>)}</DemoSel></div>
              <div><DemoLbl T={theme}>Question Type</DemoLbl><DemoSel T={theme} value={data.qtype} onChange={e=>set("qtype",e.target.value)}><option value="">Select type...</option>{DEMO_QTYPES[exam].map(t=><option key={t}>{t}</option>)}</DemoSel></div>
              <div><DemoLbl T={theme}>Concept Tested</DemoLbl><DemoInp T={theme} placeholder="e.g. Giant cell arteritis..." value={data.concept} onChange={e=>set("concept",e.target.value)}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><DemoLbl T={theme}>Question #</DemoLbl><DemoInp T={theme} placeholder="Optional" value={data.qnum} onChange={e=>set("qnum",e.target.value)}/></div>
                <div><DemoLbl T={theme}>QBank</DemoLbl><DemoSel T={theme} value={data.qbank} onChange={e=>set("qbank",e.target.value)}><option value="">Select...</option>{DEMO_QBANKS[exam].map(q=><option key={q}>{q}</option>)}</DemoSel></div>
              </div>
            </div>
            {(data.subject==="CARS"||data.subject==="Reading Comprehension") && (
              <div style={{marginTop:14,background:theme.accent+"10",border:`1px solid ${theme.accent}35`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:600,color:theme.accent,marginBottom:4}}>📖 Author's Blueprint available</div>
                <div style={{fontSize:11,color:theme.dim,marginBottom:8,lineHeight:1.5}}>The real app uses a 6-skill passage matrix for CARS/RC. Add a quick version here:</div>
                <button onClick={()=>setShowMatrix(!showMatrix)} style={{background:showMatrix?theme.accent:"transparent",border:`1.5px solid ${theme.accent}`,borderRadius:6,padding:"6px 14px",color:showMatrix?"#fff":theme.accent,fontSize:11,fontWeight:600,cursor:"pointer"}}>{showMatrix?"✓ Added":"+ Add Passage Analysis"}</button>
                {showMatrix && (
                  <div style={{marginTop:10,display:"grid",gap:8}}>
                    {[{k:"mainIdea",ph:"Main idea in one sentence"},{k:"tone",ph:"Author's tone"},{k:"arguments",ph:"Key arguments"},{k:"author",ph:"Author's perspective"}].map(f=>(
                      <DemoInp key={f.k} T={theme} placeholder={f.ph} value={matrix[f.k]} onChange={e=>setMatrix(m=>({...m,[f.k]:e.target.value}))}/>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>)}

          {s === "summary" && (<>
            <div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:30,marginBottom:6}}>📄</div><div style={{fontSize:17,fontWeight:700,color:theme.text}}>Question Summary</div></div>
            <DemoLbl T={theme}>What was this question about?</DemoLbl>
            <DemoInp T={theme} textarea placeholder="Describe the stem, answer choices, and core concept..." value={data.summary} onChange={e=>set("summary",e.target.value)} style={{height:80,marginBottom:12}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><DemoLbl T={theme}>{data.result==="incorrect"?"What did I do wrong?":"Key insight"}</DemoLbl><DemoInp T={theme} textarea placeholder="..." value={data.wrongAction} onChange={e=>set("wrongAction",e.target.value)} style={{height:70}}/></div>
              <div><DemoLbl T={theme}>Next time approach</DemoLbl><DemoInp T={theme} textarea placeholder="Next time I will..." value={data.nextApproach} onChange={e=>set("nextApproach",e.target.value)} style={{height:70}}/></div>
            </div>
          </>)}

          {s === "anki" && (<>
            <div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:30,marginBottom:6}}>⚡</div><div style={{fontSize:17,fontWeight:700,color:theme.text}}>Flashcard</div><div style={{fontSize:12,color:theme.muted}}>AI-generated card based on your reflection</div></div>
            <DemoLbl T={theme}>Front — Question / Cue</DemoLbl>
            <DemoInp T={theme} placeholder="e.g. 55M jaw claudication + vision loss → next step?" value={data.ankiFront} onChange={e=>set("ankiFront",e.target.value)} style={{marginBottom:8}}/>
            <div style={{background:theme.raised,border:`1px solid ${theme.border}`,borderRadius:10,padding:"10px 14px",marginBottom:12}}>
              <div style={{fontSize:10,color:theme.muted,letterSpacing:"0.8px",marginBottom:6}}>✨ AI SUGGESTED FRONT</div>
              {ankiLoading?<div style={{color:theme.muted,fontSize:12,fontStyle:"italic"}}>Generating suggestion...</div>
              :aiAnki?<><div style={{fontSize:13,color:theme.text,lineHeight:1.5,marginBottom:8}}>{aiAnki}</div><button onClick={()=>set("ankiFront",aiAnki)} style={{background:theme.accent,border:"none",borderRadius:6,padding:"5px 12px",color:"#fff",fontSize:11,cursor:"pointer"}}>Use this →</button></>
              :<div style={{fontSize:12,color:theme.muted}}>Fill in the concept from the previous step for a suggestion.</div>}
            </div>
            <DemoLbl T={theme}>Back — Answer</DemoLbl>
            <DemoInp T={theme} placeholder="e.g. Giant cell arteritis → temporal artery biopsy" value={data.ankiBack} onChange={e=>set("ankiBack",e.target.value)} style={{marginBottom:8}}/>
            <div style={{background:theme.raised,border:`1px solid ${theme.border}`,borderRadius:10,padding:"10px 14px",marginBottom:14}}>
              <div style={{fontSize:10,color:theme.muted,letterSpacing:"0.8px",marginBottom:6}}>✨ AI SUGGESTED BACK</div>
              {ankiBackLoading?<div style={{color:theme.muted,fontSize:12,fontStyle:"italic"}}>Generating answer...</div>
              :aiAnkiBack?<><div style={{fontSize:13,color:theme.text,lineHeight:1.5,marginBottom:8}}>{aiAnkiBack}</div><button onClick={()=>set("ankiBack",aiAnkiBack)} style={{background:theme.success,border:"none",borderRadius:6,padding:"5px 12px",color:"#fff",fontSize:11,cursor:"pointer"}}>Use this →</button></>
              :<div style={{fontSize:12,color:theme.muted}}>Fill in the concept for an AI answer suggestion.</div>}
            </div>
          </>)}

          {s === "notes" && (<>
            <div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:30,marginBottom:6}}>💡</div><div style={{fontSize:17,fontWeight:700,color:theme.text}}>Reflection & Notes</div></div>
            <div style={{background:theme.name==="dark"?"#0e0e2a":"#eff2ff",border:`1px solid ${theme.name==="dark"?"#3730a360":"#c7d2fe"}`,borderRadius:12,padding:"14px 16px",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span>✨</span><span style={{fontSize:10,fontWeight:700,color:theme.name==="dark"?"#a5b4fc":theme.accent,letterSpacing:"0.8px"}}>AI STUDY INSIGHT</span></div>
              {aiLoading?<div style={{color:theme.muted,fontSize:12,fontStyle:"italic"}}>Generating...</div>:aiText?<div style={{color:theme.name==="dark"?"#c7d2fe":theme.dim,fontSize:12,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{aiText}</div>:<div style={{fontSize:12,color:theme.muted}}>Fill in subject/concept above.</div>}
            </div>
            <div style={{marginBottom:12}}><DemoLbl T={theme}>Resource to Review</DemoLbl><DemoInp T={theme} placeholder="e.g. FA p.342, Pathoma Ch.3..." value={data.resource} onChange={e=>set("resource",e.target.value)}/></div>
            <div><DemoLbl T={theme}>Personal Notes</DemoLbl><DemoInp T={theme} textarea placeholder="Your own notes..." value={data.notes} onChange={e=>set("notes",e.target.value)} style={{height:70}}/></div>
          </>)}

          {step > 0 && (
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:18,paddingTop:14,borderTop:`1px solid ${theme.border}`}}>
              <button onClick={back} style={{background:"none",border:"none",color:theme.muted,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>← Back</button>
              {step===FULL_STEPS.length-1
                ? <button onClick={finish} style={{background:theme.accent,border:"none",borderRadius:8,padding:"9px 22px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Submit ✓</button>
                : ["category","summary","anki"].includes(s)
                  ? <button onClick={next} style={{background:theme.accent,border:"none",borderRadius:8,padding:"9px 20px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Next →</button>
                  : <div/>
              }
            </div>
          )}
        </div>
      )}

      {questions.length > 0 && (
        <div ref={analyticsRef}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:16,borderTop:`1px solid ${theme.border}`,paddingTop:20}}>
            {[
              {l:"Questions",v:questions.length,c:theme.text},
              {l:"Score",v:`${score}%`,c:score>=75?theme.success:score>=60?theme.warn:theme.danger},
              {l:"Correct",v:correct,c:theme.success},
              {l:"Anki-ready",v:ankiReadyCount,c:theme.accent},
            ].map(st => (
              <div key={st.l} style={{background:theme.raised,border:`1px solid ${theme.border}`,borderRadius:8,padding:"11px 12px"}}>
                <div style={{fontSize:9,color:theme.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:5}}>{st.l}</div>
                <div style={{fontSize:18,fontWeight:700,color:st.c,lineHeight:1.25}}>{st.v}</div>
              </div>
            ))}
          </div>

          {pieData.length > 0 && (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:theme.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:10}}>Score by Subject</div>
              <div style={{display:"flex",alignItems:"center",gap:18}}>
                <div style={{width:130,height:130,flexShrink:0}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={58} paddingAngle={3} dataKey="value" startAngle={90} endAngle={450}>
                        {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                      </Pie>
                      <Tooltip contentStyle={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:8,fontSize:11,color:theme.text}} formatter={(v)=>[`${v} Q`,""]}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
                  {pieData.map((d,i) => (
                    <div key={d.name} style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:8,height:8,borderRadius:2,background:PIE_COLORS[i%PIE_COLORS.length],flexShrink:0}}/>
                      <span style={{fontSize:12,color:theme.dim,flex:1}}>{d.name}</span>
                      <span style={{fontSize:12,fontWeight:700,color:PIE_COLORS[i%PIE_COLORS.length]}}>{d.value} Q</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {reasonData.length > 0 && (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:theme.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:10}}>Why You Got It Wrong</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {reasonData.map((d) => (
                  <div key={d.name} style={{display:"flex",alignItems:"center",gap:8,background:theme.raised,borderRadius:6,padding:"7px 10px"}}>
                    <span style={{fontSize:12,color:theme.dim,flex:1}}>{d.name}</span>
                    <span style={{fontSize:12,fontWeight:700,color:theme.danger}}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{borderTop:`1px solid ${theme.border}`,paddingTop:16,marginBottom:16}}>
            <div style={{fontSize:11,color:theme.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:10}}>Export Your Data</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <button onClick={()=>setExportGate("anki")} style={{background:theme.raised,border:`1px solid ${theme.accent}50`,borderRadius:8,padding:"9px 16px",color:theme.accent,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>⚡ Export to Anki (.apkg)</button>
              <button onClick={()=>setExportGate("excel")} style={{background:theme.raised,border:`1px solid ${theme.border}`,borderRadius:8,padding:"9px 16px",color:theme.dim,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>📊 Export to Excel</button>
            </div>
            <div style={{fontSize:11,color:theme.muted,marginTop:8}}>Real exports require a free account — click above to continue.</div>
          </div>

          {exportGate && (
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20}} onClick={e=>e.target===e.currentTarget&&setExportGate(null)}>
              <div style={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:18,padding:"36px 32px",maxWidth:400,width:"100%",textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:12}}>{exportGate==="anki"?"⚡":"📊"}</div>
                <div style={{fontSize:18,fontWeight:700,color:theme.text,marginBottom:8}}>
                  {exportGate==="anki" ? "Ready to export your real Anki deck?" : "Ready to export your real Excel sheet?"}
                </div>
                <p style={{fontSize:13,color:theme.muted,lineHeight:1.65,marginBottom:24}}>
                  Continue by creating a free account — it takes 30 seconds, and you'll land right back in the app to pick up where this demo left off.
                </p>
                <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                  <button onClick={goToSignIn} style={{background:theme.accent,border:"none",borderRadius:8,padding:"11px 24px",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Create Free Account →</button>
                  <button onClick={()=>setExportGate(null)} style={{background:theme.raised,border:`1px solid ${theme.border}`,borderRadius:8,padding:"11px 18px",color:theme.muted,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Not now</button>
                </div>
              </div>
            </div>
          )}

          {questions.length >= 2 && (
            <div style={{borderTop:`1px solid ${theme.border}`,paddingTop:16}}>
              {!showSave ? (
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,color:theme.muted}}>Save this demo data and continue inside the full app</span>
                  <button onClick={() => setShowSave(true)} style={{background:theme.accent,border:"none",borderRadius:8,padding:"8px 18px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Save Free →</button>
                </div>
              ) : linkStatus === "done" ? (
                <div style={{textAlign:"center",color:theme.success,fontSize:13,fontWeight:600}}>
                  ✓ Account created! Check your email, then <a href="/app" style={{color:theme.accent}}>open the full app →</a>
                </div>
              ) : (
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:theme.text,marginBottom:10}}>Create your free account — your demo data carries over</div>
                  {["email","password"].map((t, i) => (
                    <input key={t} type={t} placeholder={t === "email" ? "you@email.com" : "Create password"}
                      value={i===0?email:pass} onChange={e => i===0?setEmail(e.target.value):setPass(e.target.value)}
                      style={{width:"100%",boxSizing:"border-box",background:theme.raised,border:`1px solid ${theme.border}`,borderRadius:8,padding:"9px 14px",color:theme.text,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",marginBottom:8}}/>
                  ))}
                  {linkStatus==="error" && <div style={{color:theme.danger,fontSize:12,marginBottom:8}}>Something went wrong — try again.</div>}
                  <button onClick={linkAccount} disabled={!email||!pass||linkStatus==="working"}
                    style={{width:"100%",background:theme.accent,border:"none",borderRadius:8,padding:"10px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:!email||!pass?0.6:1}}>
                    {linkStatus==="working" ? "Creating account…" : "Create Free Account →"}
                  </button>
                  <div style={{textAlign:"center",marginTop:8,fontSize:12,color:theme.muted}}>
                    Already have an account? <a href="/app" style={{color:theme.accent}}>Sign in</a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Exit-Intent Modal ─────────────────────────────────────────────────────────
function ExitModal({ onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",display:"flex",
      alignItems:"center",justifyContent:"center",zIndex:9999,padding:20}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,
        padding:"36px 32px",maxWidth:420,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:12}}>🎯</div>
        <div style={{fontSize:20,fontWeight:700,color:C.text,marginBottom:8}}>Save your progress?</div>
        <p style={{fontSize:13,color:C.muted,lineHeight:1.65,marginBottom:24}}>
          You've started building your performance profile. Create a free account to keep your data,
          track every session, and get personalized weak-spot analytics.
        </p>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <a href="/app" style={{background:C.accent,borderRadius:8,padding:"10px 24px",color:"#fff",
            fontSize:14,fontWeight:600,textDecoration:"none"}}>Create Free Account</a>
          <button onClick={onClose} style={{background:C.raised,border:`1px solid ${C.border}`,
            borderRadius:8,padding:"10px 18px",color:C.muted,fontSize:14,cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif"}}>Stay on Page</button>
        </div>
      </div>
    </div>
  );
}

// ── Showcase Slides ─────────────────────────────────────────────────────────
function QuestionLogSlide({ T }) {
  const fields = [
    ["Subject",        "Cardiology"],
    ["Question Type",  "Diagnosis"],
    ["Timing",         "Over the limit"],
    ["Answer Change",  "Incorrect → Incorrect"],
    ["Confidence",     "Low confidence"],
    ["Mistake Reason", "Didn't know the material"],
    ["Concept Tag",    "Aortic dissection vs. STEMI"],
  ];
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <div>
          <div style={{fontSize:11,color:T.muted,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:6}}>
            USMLE Step 1 · Block 4 · Question 12
          </div>
          <span style={{background:T.danger+"22",border:`1px solid ${T.danger}40`,borderRadius:6,
            padding:"3px 10px",fontSize:12,color:T.danger,fontWeight:600}}>✗  Incorrect</span>
        </div>
        <div style={{fontSize:11,color:T.muted+"80"}}>Sep 1, 2026</div>
      </div>
      <div>
        {fields.map(([label, value]) => (
          <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.5px"}}>{label}</span>
            <span style={{fontSize:13,color:T.text,fontWeight:500}}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{marginTop:16,display:"flex",alignItems:"center",gap:8,background:T.accent+"12",
        border:`1px solid ${T.accent}25`,borderRadius:8,padding:"9px 14px"}}>
        <span style={{fontSize:12,color:T.accent,fontWeight:500}}>⚡ Flagged for Anki export</span>
      </div>
    </div>
  );
}

function AnalyticsSlide({ T }) {
  const subjects = [
    { name:"Cardiology",   pct:67, c:T.warn },
    { name:"Renal",        pct:40, c:T.danger },
    { name:"Neurology",    pct:100,c:T.success },
    { name:"Pulmonology",  pct:75, c:C.success },
    { name:"Pharmacology", pct:58, c:C.warn },
  ];
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:20}}>
        {[
          {l:"Session Score",v:"68%",c:C.warn},
          {l:"Questions",    v:"20", c:C.text},
          {l:"Weak Spot",    v:"Renal",c:C.danger},
        ].map(s => (
          <div key={s.l} style={{background:C.raised,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:4}}>{s.l}</div>
            <div style={{fontSize:18,fontWeight:700,color:s.c,lineHeight:1}}>{s.v}</div>
          </div>
        ))}
      </div>
      {subjects.map(s => (
        <div key={s.name} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:12,color:C.dim}}>{s.name}</span>
            <span style={{fontSize:12,fontWeight:600,color:s.c}}>{s.pct}%</span>
          </div>
          <div style={{height:5,background:C.raised,borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${s.pct}%`,background:s.c,borderRadius:99}}/>
          </div>
        </div>
      ))}
      <div style={{marginTop:14,background:C.warn+"12",border:`1px solid ${C.warn}28`,borderRadius:8,padding:"9px 12px"}}>
        <span style={{fontSize:12,color:C.warn}}>⚠  Pattern: You change answers to wrong 3× this session</span>
      </div>
    </div>
  );
}

function AnkiSlide({ T }) {
  const [flipped, setFlipped]             = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const flip = () => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => { setFlipped(f => !f); setTransitioning(false); }, 200);
  };
  return (
    <div>
      <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:14}}>
        AI-generated from your missed question · Cardiology
      </div>
      <div onClick={flip} style={{
        cursor:"pointer",
        background:flipped ? T.accent+"18" : T.raised,
        border:`1px solid ${flipped ? T.accent+"50" : T.border}`,
        borderRadius:12, padding:"20px",
        opacity:transitioning ? 0 : 1,
        transform:transitioning ? "scale(0.97)" : "scale(1)",
        transition:"opacity 0.2s ease, transform 0.2s ease, background 0.3s, border-color 0.3s",
        minHeight:175,
      }}>
        {!flipped ? (
          <div>
            <div style={{fontSize:10,color:T.accent,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:12,fontWeight:600}}>Front</div>
            <p style={{fontSize:13,color:T.text,lineHeight:1.7,marginBottom:14}}>
              A 52-year-old man presents with sudden, severe tearing chest pain radiating to the back.
              BP is 162/90 in the right arm and 134/78 in the left. CXR shows a widened mediastinum.
              <br/><br/>What is the most likely diagnosis?
            </p>
            <div style={{textAlign:"right",fontSize:11,color:T.muted}}>tap to reveal →</div>
          </div>
        ) : (
          <div>
            <div style={{fontSize:10,color:T.accent,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:10,fontWeight:600}}>Back</div>
            <div style={{fontSize:15,fontWeight:700,color:T.text,marginBottom:12}}>Aortic Dissection (Type A)</div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {[
                "Tearing/ripping quality — not pressure-like (ACS)",
                "Radiates to the back, not jaw or left arm",
                "BP differential ≥20 mmHg between arms",
                "Widened mediastinum on CXR",
                "Troponin usually negative in early presentation",
              ].map(b => (
                <div key={b} style={{display:"flex",gap:8}}>
                  <span style={{color:T.accent,flexShrink:0}}>·</span>
                  <span style={{fontSize:12,color:T.dim,lineHeight:1.5}}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{textAlign:"center",marginTop:10,fontSize:11,color:T.muted}}>
        {flipped ? "← tap to flip back" : "Part of your .apkg Anki export"}
      </div>
    </div>
  );
}

const SHOWCASE_META = [
  { tag:"Question Log",          icon:"📋", label:"USMLE Step 1 · 8-step entry" },
  { tag:"Performance Analytics", icon:"📊", label:"Live session breakdown" },
  { tag:"Anki Flashcard",        icon:"⚡", label:"AI-generated · tap to flip" },
];

function ShowcaseCarousel({ T }) {
  const theme = T;
  const [active, setActive] = useState(0);
  const [fade, setFade]     = useState(true);
  const pendingRef          = useRef(0);

  const goTo = (idx) => {
    if (idx === active || !fade) return;
    pendingRef.current = idx;
    setFade(false);
  };

  useEffect(() => {
    if (!fade) {
      const t = setTimeout(() => { setActive(pendingRef.current); setFade(true); }, 220);
      return () => clearTimeout(t);
    }
  }, [fade]);

  useEffect(() => {
    const t = setInterval(() => {
      pendingRef.current = (active + 1) % 3;
      setFade(false);
    }, 5500);
    return () => clearInterval(t);
  }, [active]);

  return (
    <section style={{background:theme.bg,padding:"64px 24px"}}>
      <div style={{maxWidth:820,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:11,color:theme.accent,fontWeight:600,letterSpacing:"1.2px",textTransform:"uppercase",marginBottom:10}}>
            See it in action
          </div>
          <h2 style={{fontSize:26,fontWeight:700,color:theme.text,marginBottom:10}}>
            Your data, structured and actionable
          </h2>
          <p style={{fontSize:14,color:theme.muted,lineHeight:1.65,maxWidth:500,margin:"0 auto"}}>
            Every question you log builds a precise diagnostic picture of exactly where your score is leaking.
          </p>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:28,flexWrap:"wrap"}}>
          {SHOWCASE_META.map((m, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              background:i===active ? theme.surface : "transparent",
              border:`1px solid ${i===active ? theme.accent+"50" : theme.border}`,
              borderRadius:999, padding:"8px 18px", cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s ease",
              display:"flex", alignItems:"center", gap:7,
            }}>
              <span style={{fontSize:14}}>{m.icon}</span>
              <span style={{fontSize:13,fontWeight:i===active?600:400,color:i===active?theme.text:theme.muted}}>{m.tag}</span>
            </button>
          ))}
        </div>
        <div style={{
          background:theme.surface, border:`1px solid ${theme.border}`,
          borderRadius:20, padding:"28px",
          minHeight:360,
          opacity:fade?1:0,
          transform:fade?"translateY(0px)":"translateY(7px)",
          transition:"opacity 0.22s ease, transform 0.22s ease",
          boxShadow:`0 0 80px ${theme.accent}07`,
        }}>
          <div style={{fontSize:11,color:theme.muted,fontWeight:500,letterSpacing:"0.5px",marginBottom:18,
            display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:6,height:6,borderRadius:3,background:theme.accent,display:"inline-block",flexShrink:0}}/>
            {SHOWCASE_META[active].label}
          </div>
          {active === 0 && <QuestionLogSlide T={theme} />}
          {active === 1 && <AnalyticsSlide T={theme} />}
          {active === 2 && <AnkiSlide T={theme} />}
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:22}}>
          {[0,1,2].map(i => (
            <button key={i} onClick={() => goTo(i)} style={{
              width:i===active?22:6, height:6, borderRadius:3,
              background:i===active?theme.accent:theme.raised,
              border:`1px solid ${i===active?theme.accent:theme.border}`,
              padding:0, cursor:"pointer", transition:"all 0.3s ease",
            }}/>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Landing Page ──────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    title: "Try the Review Flow",
    subtitle: "Experience the core workflow",
    body: "Log a few practice questions and watch instant analytics build. No account required.",
    cta: "Start Demo →",
    ctaSecondary: null,
    isDemo: true,
    hasScreenshot: false
  },
  {
    title: "MCAT CARS",
    subtitle: "The framework that separates 128 from 132.",
    body: "A precise system used by top scorers to read, reason, and perform under pressure.",
    cta: "Read the Guide",
    ctaSecondary: "Try the review flow →",
    blogSlug: "mcat-cars-framework",
    hasScreenshot: true,
    screenshotLabel: "[Product screenshot: Question review interface]",
    // ADD JPEG HERE: drop your image at /public/mcat-cars-hero.jpeg and this will render automatically
    imageSrc: "/mcat-cars-hero.jpeg"
  },
  {
    title: "USMLE Wrong Answers",
    subtitle: "4 Types & How to Fix Each",
    body: "Not all wrong answers are equal. Learn the 4 types of mistakes and apply the right study strategy to each one.",
    cta: "Learn the Framework →",
    blogSlug: "learn-from-wrong-answers-usmle",
    hasScreenshot: true,
    screenshotLabel: "[Product screenshot: Analysis dashboard]",
    // ADD JPEG HERE: drop your image at /public/usmle-wrong-answers-hero.jpeg and this will render automatically
    imageSrc: "/usmle-wrong-answers-hero.jpeg"
  },
  {
    title: "Building Your Anki Deck",
    subtitle: "From Real Exam Mistakes",
    body: "The most powerful Anki decks are built from your actual wrong answers. Generate cards automatically from logged questions.",
    cta: "See the Strategy →",
    blogSlug: "spaced-repetition-anki-premed",
    hasScreenshot: true,
    screenshotLabel: "[Product screenshot: Anki export feature]",
    // ADD JPEG HERE: drop your image at /public/anki-deck-hero.jpeg and this will render automatically
    imageSrc: "/anki-deck-hero.jpeg"
  },
  {
    title: "LSAT Logical Reasoning",
    subtitle: "Master 10 Question Types",
    body: "LR accounts for 50% of your score. Learn question types and the exact plan to master them efficiently.",
    cta: "Start the Plan →",
    blogSlug: "lsat-logical-reasoning",
    hasScreenshot: true,
    screenshotLabel: "[Product screenshot: Practice tracker]",
    // ADD JPEG HERE: drop your image at /public/lsat-hero.jpeg (already wired up)
    imageSrc: "/lsat-hero.jpeg"
  }
];

export default function LandingPage() {
  const { isDark, setIsDark, theme: C } = useTheme();
  const themeGradients = getHeroGradients(isDark);
  const demoRef = useRef(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    injectAdSense();
    if (!document.querySelector('link[href*="DM+Sans"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap";
      document.head.appendChild(link);
    }
    document.body.style.background = C.bg;
    document.body.style.margin = "0";
    document.body.style.fontFamily = "'DM Sans', sans-serif";
  }, [C]);

  // Auto-rotate hero slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Exit-intent fires once per session when cursor leaves viewport top
  useEffect(() => {
    const handler = (e) => {
      if (e.clientY <= 0 && !sessionStorage.getItem("exitShown")) {
        setShowExitModal(true);
        sessionStorage.setItem("exitShown", "1");
      }
    };
    document.addEventListener("mouseleave", handler);
    return () => document.removeEventListener("mouseleave", handler);
  }, []);

  const scrollToDemo = () => demoRef.current?.scrollIntoView({ behavior:"smooth" });

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>
      <SEO 
        title="Vima Vima — AI Question Analytics for USMLE, MCAT, and LSAT Prep" 
        description="Track your practice questions, get AI-powered insights into mistakes, and auto-generate Anki flashcards. Free question logging and analytics for serious exam prep." 
        pathname={window.location.pathname}
      />
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{color:${C.accent};text-decoration:none}a:hover{text-decoration:underline}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(100,140,255,0.2);border-radius:10px}`}</style>

      {showExitModal && <ExitModal onClose={() => setShowExitModal(false)}/>}

      {/* Nav */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:C.surface+"ee",
        backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`,
        padding:"14px 32px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <a href="/" style={{display:"flex",alignItems:"center",textDecoration:"none"}}>
            <BrandLogo dark={isDark} height={30}/>
          </a>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <a href="/blog" style={{fontSize:13,color:C.muted,fontWeight:500}}>Guides</a>
          <a href="/about" style={{fontSize:13,color:C.muted,fontWeight:500}}>About</a>
          <a href="/faq" style={{fontSize:13,color:C.muted,fontWeight:500}}>FAQ</a>
          <button onClick={() => setIsDark(!isDark)} style={{background:C.raised,border:`1px solid ${C.border}`,borderRadius:8,
            padding:"7px 14px",color:C.text,fontSize:13,fontWeight:600,cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif"}}>
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button onClick={() => window.location.href = '/app'} style={{background:C.accent,border:"none",borderRadius:8,
            padding:"7px 18px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif"}}>Sign In</button>
          <button onClick={scrollToDemo} style={{background:"transparent",border:`1.5px solid ${C.accent}`,borderRadius:8,
            padding:"7px 18px",color:C.accent,fontSize:13,fontWeight:600,cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif"}}>Try Demo →</button>
        </div>
      </nav>

      {/* Hero Carousel */}
      <section style={{maxWidth:1200,margin:"0 auto",padding:"80px 24px 60px",position:"relative"}}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          .slide-content { animation: fadeIn 0.5s ease-out; }
        `}</style>
        
        {/* Slide Container - Premium 2-Column Layout */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center",minHeight:500}}>
          {/* Left Column: Content */}
          <div className="slide-content" style={{paddingRight:40}}>
            <div style={{marginBottom:32}}>
              <h1 style={{fontSize:56,fontWeight:700,color:isDark?C.text:"#0a0d1a",lineHeight:1.15,
                letterSpacing:"-1.5px",marginBottom:16}}>
                {HERO_SLIDES[heroSlide]?.title}
              </h1>
              <p style={{fontSize:20,color:isDark?C.muted:"#4a5568",fontWeight:500,lineHeight:1.4,marginBottom:20}}>
                {HERO_SLIDES[heroSlide]?.subtitle}
              </p>
              <p style={{fontSize:16,color:isDark?C.dim:"#5a6b7a",lineHeight:1.7,maxWidth:480}}>
                {HERO_SLIDES[heroSlide]?.body}
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              {HERO_SLIDES[heroSlide]?.isDemo ? (
                <button onClick={scrollToDemo} style={{background:isDark?C.accent:"#0055d4",border:"none",borderRadius:8,
                  padding:"14px 32px",color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s",
                  boxShadow:isDark?"0 4px 16px rgba(59,110,255,0.3)":"0 4px 12px rgba(0,85,212,0.25)"}}>
                  {HERO_SLIDES[heroSlide]?.cta}
                </button>
              ) : (
                <>
                  <a href={`/blog/${HERO_SLIDES[heroSlide]?.blogSlug}`} style={{background:isDark?C.accent:"#0055d4",
                    border:"none",borderRadius:8,padding:"14px 32px",color:"#fff",fontSize:15,fontWeight:600,
                    cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s",display:"inline-block",
                    textDecoration:"none",boxShadow:isDark?"0 4px 16px rgba(59,110,255,0.3)":"0 4px 12px rgba(0,85,212,0.25)"}}>
                    {HERO_SLIDES[heroSlide]?.cta}
                  </a>
                  {HERO_SLIDES[heroSlide]?.ctaSecondary && (
                    <button onClick={scrollToDemo} style={{background:"transparent",border:`1.5px solid ${isDark?C.accent:"#0055d4"}`,
                      borderRadius:8,padding:"12px 30px",color:isDark?C.accent:"#0055d4",fontSize:15,fontWeight:600,
                      cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"}}>
                      {HERO_SLIDES[heroSlide]?.ctaSecondary}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column: Product Screenshot / Visual */}
          <div style={{background:isDark?"#0e1121":"#f8f9fa",borderRadius:12,minHeight:400,
            display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${isDark?"rgba(100,140,255,0.13)":"#e5e7eb"}`,
            padding:32,overflow:"hidden"}}>
            {HERO_SLIDES[heroSlide]?.imageSrc ? (
              <img src={HERO_SLIDES[heroSlide].imageSrc} alt={HERO_SLIDES[heroSlide].title}
                style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:8}}/>
            ) : HERO_SLIDES[heroSlide]?.hasScreenshot ? (
              <div style={{textAlign:"center",color:isDark?C.dim:"#9ca3af",fontSize:14}}>
                <div style={{marginBottom:12,fontSize:48}}>📱</div>
                {HERO_SLIDES[heroSlide]?.screenshotLabel}
                <br/>
                <span style={{fontSize:12,marginTop:8,display:"block",color:isDark?C.muted:"#6b7280"}}>
                  (Real product screenshot will be displayed here)
                </span>
              </div>
            ) : (
              <div style={{textAlign:"center",color:isDark?C.dim:"#9ca3af",fontSize:14}}>
                <div style={{marginBottom:12,fontSize:48}}>✨</div>
                Interactive demo preview
              </div>
            )}
          </div>
        </div>

        {/* Navigation Dots */}
        <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:60}}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setHeroSlide(i)} style={{
              width:heroSlide===i?32:10,height:6,background:heroSlide===i?(isDark?C.accent:"#0055d4"):(isDark?C.border:"#d1d5db"),
              border:"none",borderRadius:3,cursor:"pointer",transition:"all 0.3s"
            }}/>
          ))}
        </div>
      </section>

      {/* Demo */}
      <section ref={demoRef} style={{background:isDark?C.bg:"#f9f9f9",padding:"100px 24px",borderTop:`1px solid ${isDark?C.border:"#e5e7eb"}`}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:60}}>
            <h2 style={{fontSize:44,fontWeight:700,color:isDark?C.text:"#0a0d1a",marginBottom:16,lineHeight:1.2}}>
              Try the Full Review Flow
            </h2>
            <p style={{fontSize:18,color:isDark?C.muted:"#6b7280",lineHeight:1.6,maxWidth:600,margin:"0 auto"}}>
              Experience the complete workflow: log a practice question, reflect on your performance, and watch analytics emerge in real time. No account required.
            </p>
          </div>
          <InteractiveDemo T={C}/>
        </div>
      </section>

      <ShowcaseCarousel T={C} />

      <AdUnit/>

      {/* Study Guides Section */}
      <section style={{maxWidth:1000,margin:"0 auto",padding:"100px 24px",borderTop:`1px solid ${isDark?C.border:"#e5e7eb"}`}}>
        <div style={{textAlign:"center",marginBottom:60}}>
          <h2 style={{fontSize:44,fontWeight:700,color:isDark?C.text:"#0a0d1a",marginBottom:16}}>
            Study Guides & Frameworks
          </h2>
          <p style={{fontSize:18,color:isDark?C.muted:"#6b7280",lineHeight:1.6,maxWidth:600,margin:"0 auto"}}>
            Research-backed strategies from top scorers and exam experts
          </p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:24}}>
        {[
          {slug:"mcat-cars-framework",label:"MCAT",title:"MCAT CARS",preview:"The framework separating 128 from 132 scorers. A precise system for reading comprehension under pressure."},
          {slug:"learn-from-wrong-answers-usmle",label:"USMLE",title:"4 Types of Wrong Answers",preview:"Learn why you miss questions and the exact study strategy to address each type of mistake."},
          {slug:"lsat-logical-reasoning",label:"LSAT",title:"Logical Reasoning Mastery",preview:"Master the 10 question types that account for 50% of your LSAT score."},
          {slug:"spaced-repetition-anki-premed",label:"Study Method",title:"Building Your Anki Deck",preview:"Generate flashcards from your actual wrong answers for lasting retention and intelligent spacing."},
        ].map(item => (
          <a key={item.slug} href={`/blog/${item.slug}`} style={{
            background:isDark?C.surface:"#ffffff",border:`1px solid ${isDark?C.border:"#e5e7eb"}`,borderRadius:8,padding:32,
            display:"flex",flexDirection:"column",textDecoration:"none",transition:"all 0.3s",
            cursor:"pointer"
          }} onMouseEnter={e=>{e.currentTarget.style.borderColor=isDark?C.accent:"#0055d4"; e.currentTarget.style.boxShadow=isDark?"0 12px 32px rgba(59,110,255,0.15)":"0 12px 32px rgba(0,85,212,0.08)"}}
             onMouseLeave={e=>{e.currentTarget.style.borderColor=isDark?C.border:"#e5e7eb"; e.currentTarget.style.boxShadow="none"}}>
            <div style={{fontSize:13,background:isDark?C.accent+"15":C.accent+"10",color:isDark?C.accent:"#0055d4",borderRadius:5,
              padding:"6px 12px",fontWeight:600,width:"fit-content",marginBottom:16}}>
              {item.label}
            </div>
            <h3 style={{fontSize:20,fontWeight:700,color:isDark?C.text:"#0a0d1a",marginBottom:12,lineHeight:1.3}}>
              {item.title}
            </h3>
            <p style={{fontSize:15,color:isDark?C.muted:"#6b7280",lineHeight:1.6,flex:1,marginBottom:16}}>
              {item.preview}
            </p>
            <div style={{fontSize:14,color:isDark?C.accent:"#0055d4",fontWeight:500}}>Read full guide →</div>
          </a>
        ))}
        </div>
        <div style={{textAlign:"center",marginTop:48}}>
          <a href="/blog" style={{background:isDark?C.raised:"#f3f4f6",border:`1px solid ${isDark?C.border:"#e5e7eb"}`,borderRadius:8,
            padding:"14px 32px",color:isDark?C.muted:"#6b7280",fontSize:15,fontWeight:600,textDecoration:"none",
            display:"inline-block",transition:"all 0.3s"}} 
            onMouseEnter={e=>{e.currentTarget.style.background=isDark?C.surface:"#ffffff"; e.currentTarget.style.borderColor=isDark?C.accent+"60":"#d1d5db"}}
            onMouseLeave={e=>{e.currentTarget.style.background=isDark?C.raised:"#f3f4f6"; e.currentTarget.style.borderColor=isDark?C.border:"#e5e7eb"}}>
            View All Guides →
          </a>
        </div>
      </section>

      <AdUnit/>
      <section style={{maxWidth:1000,margin:"0 auto",padding:"100px 24px",borderTop:`1px solid ${isDark?C.border:"#e5e7eb"}`}}>
        <div style={{textAlign:"center",marginBottom:60}}>
          <h2 style={{fontSize:44,fontWeight:700,color:isDark?C.text:"#0a0d1a",marginBottom:16}}>
            Built for High-Scorers
          </h2>
          <p style={{fontSize:18,color:isDark?C.muted:"#6b7280",lineHeight:1.6,maxWidth:700,margin:"0 auto"}}>
            A system designed around how top scorers actually study: structured reflection after every question, analytics that matter, and instant Anki generation from your real mistakes.
          </p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:24}}>
        {[
          {icon:"📋",title:"Structured Question Logging",
            body:"After each practice session, log the essentials: correct or wrong, time taken, whether you changed your answer, why you missed it, and the concept tested. This 90-second habit is what separates improvement from plateau."},
          {icon:"📊",title:"Actionable Analytics",
            body:"A 65% practice score is meaningless without context. Vima Viva breaks performance by subject, question type, and mistake category. You'll know exactly whether your gaps are knowledge, reasoning, or speed."},
          {icon:"⚡",title:"Anki Cards from Mistakes",
            body:"Generate AI-drafted flashcards from your actual wrong answers. Export them directly to Anki as a real .apkg deck. Your personal card deck builds automatically from questions you actually struggled with."},
        ].map(f => (
          <div key={f.title} style={{background:isDark?C.surface:"#ffffff",border:`1px solid ${isDark?C.border:"#e5e7eb"}`,borderRadius:8,padding:32}}>
            <div style={{fontSize:32,marginBottom:16}}>{f.icon}</div>
            <div style={{fontSize:18,fontWeight:700,color:isDark?C.text:"#0a0d1a",marginBottom:12}}>{f.title}</div>
            <p style={{fontSize:15,color:isDark?C.muted:"#6b7280",lineHeight:1.7}}>{f.body}</p>
          </div>
        ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{maxWidth:1000,margin:"0 auto",padding:"100px 24px",borderTop:`1px solid ${isDark?C.border:"#e5e7eb"}`}}>
        <div style={{textAlign:"center",marginBottom:60}}>
          <h2 style={{fontSize:44,fontWeight:700,color:isDark?C.text:"#0a0d1a",marginBottom:16}}>How It Works</h2>
          <p style={{fontSize:18,color:isDark?C.muted:"#6b7280",lineHeight:1.6,maxWidth:700,margin:"0 auto"}}>
            A simple, consistent workflow that builds your learning data and powers your improvement
          </p>
        </div>
        <div style={{maxWidth:800,margin:"0 auto"}}>
          <div style={{display:"flex",flexDirection:"column",gap:32}}>
            {[
              {n:"01",t:"Select Your Exam Track",d:"Start with your exam: USMLE (Step 1/Step 2 CK), MCAT, or LSAT. Each track has its own subject and question-type taxonomy matched to the real exam."},
              {n:"02",t:"Create a Study Session",d:"Log a practice session: one exam, one block, or one timed set. Name it however you track it (UWorld Block 7, NBME 14, PrepTest 90) and begin logging questions."},
              {n:"03",t:"Log Each Question",d:"After each question: mark it correct or wrong, note the time, whether you changed your answer, why you missed it (if wrong), and which concept it tested."},
              {n:"04",t:"Review Your Analytics",d:"After each session, see your score breakdown, timing patterns, most common mistakes, and concept gaps. Track trends over time to see what's working and what needs change."},
              {n:"05",t:"Generate Your Anki Deck",d:"Export all your missed questions as flashcards directly to Anki. Your personal deck builds from the questions you actually struggled with — not generic pre-made cards."},
            ].map(s => (
              <div key={s.n} style={{display:"flex",gap:24,alignItems:"flex-start"}}>
                <div style={{flexShrink:0,width:48,height:48,borderRadius:8,background:isDark?C.accent+"20":C.accent+"15",
                  border:`1.5px solid ${isDark?C.accent+"50":C.accent+"40"}`,display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:14,fontWeight:700,color:isDark?C.accent:"#0055d4"}}>{s.n}</div>
                <div style={{paddingTop:6}}>
                  <div style={{fontSize:16,fontWeight:700,color:isDark?C.text:"#0a0d1a",marginBottom:8}}>{s.t}</div>
                  <p style={{fontSize:15,color:isDark?C.muted:"#6b7280",lineHeight:1.7}}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section style={{maxWidth:1000,margin:"0 auto",padding:"100px 24px",borderTop:`1px solid ${isDark?C.border:"#e5e7eb"}`}}>
        <h2 style={{fontSize:44,fontWeight:700,color:isDark?C.text:"#0a0d1a",marginBottom:60,textAlign:"center"}}>Built for Serious Exam Prep</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:40}}>
          {[
            {track:"USMLE",desc:"Step 1 & Step 2 CK Prep",detail:"Master the UWorld grind with structured question logs, mistake categorization by subject and type, and analytics that reveal whether gaps are knowledge or reasoning. Build a personal Anki deck from your actual wrong answers."},
            {track:"MCAT",desc:"Full Prep + CARS Framework",detail:"Unique CARS Passage Analysis mode using a 6-skill matrix (Main Idea, Tone, Author Perspective, Arguments, Contrasting Theories, Inference traps). Diagnose why you're missing reading comprehension questions — because it's rarely about knowledge."},
            {track:"LSAT",desc:"PrepTest & Practice Tracking",detail:"Track Logical Reasoning, Analytical Reasoning, and Reading Comprehension separately. Identify exactly which question types cost you the most, then focus your preparation on real weaknesses instead of guessing."},
          ].map(g => (
            <div key={g.track} style={{display:"flex",flexDirection:"column"}}>
              <div style={{fontSize:13,fontWeight:700,color:isDark?C.accent:"#0055d4",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:12}}>
                {g.track}
              </div>
              <h3 style={{fontSize:22,fontWeight:700,color:isDark?C.text:"#0a0d1a",marginBottom:12,lineHeight:1.3}}>
                {g.desc}
              </h3>
              <p style={{fontSize:15,color:isDark?C.muted:"#6b7280",lineHeight:1.7}}>
                {g.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <AdUnit/>

      {/* FAQ */}
      <section style={{maxWidth:900,margin:"0 auto",padding:"100px 24px",borderTop:`1px solid ${isDark?C.border:"#e5e7eb"}`}}>
        <div style={{textAlign:"center",marginBottom:60}}>
          <h2 style={{fontSize:44,fontWeight:700,color:isDark?C.text:"#0a0d1a",marginBottom:16}}>Frequently Asked Questions</h2>
          <p style={{fontSize:18,color:isDark?C.muted:"#6b7280",lineHeight:1.6,maxWidth:600,margin:"0 auto"}}>
            Everything you need to know before you start
          </p>
        </div>
        <div style={{display:"flex",flexDirection:"column"}}>
        {[
          {q:"Is Vima Vima free?",a:"Yes. Core features — question logging, performance analytics, session tracking, and Anki card generation — are completely free. Create an account with an email address or Google sign-in and get immediate access."},
          {q:"Which exams does Vima Vima support?",a:"USMLE (Step 1 and Step 2 CK), MCAT, and LSAT. Each track has its own subject taxonomy and question-type categories that match your actual exam."},
          {q:"How is Vima Vima different from a spreadsheet?",a:"Spreadsheets require you to design structure and build formulas. Vima Vima provides structured logging, pre-built analytics that surface patterns across hundreds of questions, and one-click Anki export. You get actionable insights automatically."},
          {q:"How do I export to Anki?",a:"Select your missed questions, generate AI-drafted cards or write your own, and export as a real .apkg file. Import directly into Anki desktop or AnkiDroid in one click. Your personal deck builds from your actual wrong answers."},
          {q:"How long does it take to log a question?",a:"About 30–60 seconds once you're familiar with the form. Six simple fields: correct/incorrect, time, answer change, why you missed it, and concept tested. Most students log during the review phase of each block."},
          {q:"What is the MCAT CARS mode?",a:"A six-skill framework (Main Idea, Tone, Author Perspective, Arguments, Contrasting Theories, Inference traps) for analyzing each passage. Diagnose why you miss CARS questions — it's almost never a knowledge problem."},
          {q:"Is my data private?",a:"Yes. All study data is stored securely and never sold. Delete your account and all data at any time by emailing vimavimasupport@gmail.com."},
          {q:"Can I use Vima Vima with my existing question banks?",a:"Yes. Vima Vima is question-bank agnostic. Tag each question's source (UWorld, NBME, 7Sage, AAMC, etc.) and compare performance across resources."},
        ].map((item,i,arr) => (
          <div key={i} style={{borderBottom:`1px solid ${isDark?C.border:"#e5e7eb"}`,paddingTop:24,paddingBottom:24}}>
            <div style={{fontSize:16,fontWeight:700,color:isDark?C.text:"#0a0d1a",marginBottom:12}}>{item.q}</div>
            <p style={{fontSize:15,color:isDark?C.muted:"#6b7280",lineHeight:1.8}}>{item.a}</p>
          </div>
        ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{borderTop:`1px solid ${isDark?C.border:"#e5e7eb"}`,padding:"48px 24px 32px",textAlign:"center",background:isDark?C.bg:"#f9f9f9"}}>
        <div style={{maxWidth:1000,margin:"0 auto 32px",fontSize:14,color:isDark?C.muted:"#6b7280",display:"flex",gap:24,justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/" style={{color:isDark?C.muted:"#6b7280",textDecoration:"none",transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color=isDark?C.text:"#0a0d1a"} onMouseLeave={e=>e.currentTarget.style.color=isDark?C.muted:"#6b7280"}>Home</a>
          <a href="/blog" style={{color:isDark?C.muted:"#6b7280",textDecoration:"none",transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color=isDark?C.text:"#0a0d1a"} onMouseLeave={e=>e.currentTarget.style.color=isDark?C.muted:"#6b7280"}>Guides</a>
          <a href="/about" style={{color:isDark?C.muted:"#6b7280",textDecoration:"none",transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color=isDark?C.text:"#0a0d1a"} onMouseLeave={e=>e.currentTarget.style.color=isDark?C.muted:"#6b7280"}>About</a>
          <a href="/faq" style={{color:isDark?C.muted:"#6b7280",textDecoration:"none",transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color=isDark?C.text:"#0a0d1a"} onMouseLeave={e=>e.currentTarget.style.color=isDark?C.muted:"#6b7280"}>FAQ</a>
          <a href="/contact" style={{color:isDark?C.muted:"#6b7280",textDecoration:"none",transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color=isDark?C.text:"#0a0d1a"} onMouseLeave={e=>e.currentTarget.style.color=isDark?C.muted:"#6b7280"}>Contact</a>
          <a href="/app" style={{color:isDark?C.muted:"#6b7280",textDecoration:"none",transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color=isDark?C.text:"#0a0d1a"} onMouseLeave={e=>e.currentTarget.style.color=isDark?C.muted:"#6b7280"}>Sign In</a>
          <a href="/terms" style={{color:isDark?C.muted:"#6b7280",textDecoration:"none",transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color=isDark?C.text:"#0a0d1a"} onMouseLeave={e=>e.currentTarget.style.color=isDark?C.muted:"#6b7280"}>Terms</a>
          <a href="/privacy" style={{color:isDark?C.muted:"#6b7280",textDecoration:"none",transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color=isDark?C.text:"#0a0d1a"} onMouseLeave={e=>e.currentTarget.style.color=isDark?C.muted:"#6b7280"}>Privacy</a>
        </div>
        <div style={{fontSize:13,color:isDark?C.muted+"80":"#9ca3af"}}>© 2026 Vima Vima · Designed for serious exam prep</div>
      </footer>
    </div>
  );
}
