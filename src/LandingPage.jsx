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
const DEMO_SUBJECTS = {
  USMLE:["Cardiology","Neurology","GI","Renal","Pulmonology","Derm","MSK"],
  MCAT: ["C/P","CARS","B/B","Psych/Soc"],
  LSAT: ["Logical Reasoning","Analytical Reasoning","Reading Comprehension"],
};
const DEMO_QTYPES = {
  USMLE:["Diagnosis","Management","Pathophysiology","Pharmacology","Biostats/Ethics"],
  MCAT:["Passage-based","Discrete","Data analysis","Research interpretation","Critical analysis"],
  LSAT:["Inference","Main Point","Strengthen","Weaken","Method"],
};
const DEMO_TIMING = ["Under the limit","At the limit","Over the limit"];
const DEMO_ANSWER_CHANGES = ["No change","Incorrect → Correct","Correct → Incorrect","Incorrect → Incorrect"];
const DEMO_CONFIDENCE = ["High confidence","Medium confidence","Low confidence"];
const DEMO_REASONS = {
  correct:["Right reasoning","Narrowed choices well","Educated guess"],
  incorrect:["Didn't know the material","Wrong algorithm","Misread stem","Ran out of time"],
};
const DEMO_LIMIT = 5;

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

function InteractiveDemo({ T }) {
  const theme = T; // Use passed theme if provided
  const [exam, setExam]                 = useState("USMLE");
  const [questions, setQuestions]       = useState([]);
  const [result, setResult]             = useState("");
  const [subject, setSubject]           = useState("");
  const [qtype, setQtype]               = useState("");
  const [timing, setTiming]             = useState("");
  const [answerChange, setAnswerChange] = useState("");
  const [confidence, setConfidence]     = useState("");
  const [reason, setReason]             = useState("");
  const [concept, setConcept]           = useState("");
  const [showSave, setShowSave]         = useState(false);
  const [email, setEmail]               = useState("");
  const [pass, setPass]                 = useState("");
  const [linkStatus, setLinkStatus]     = useState("idle");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) supabase.auth.signInAnonymously().catch(() => {});
    });
  }, []);

  const resetQuestionForm = () => {
    setResult("");
    setSubject("");
    setQtype("");
    setTiming("");
    setAnswerChange("");
    setConfidence("");
    setReason("");
    setConcept("");
  };

  const stepItems = [
    { label:"1. Result", done: !!result },
    { label:"2. Subject", done: !!subject },
    { label:"3. Question Type", done: !!qtype },
    { label:"4. Timing", done: !!timing },
    { label:"5. Answer Change", done: !!answerChange },
    { label:"6. Confidence", done: !!confidence },
    { label:`7. ${result === "incorrect" ? "Mistake Reason" : "Why Correct"}`, done: !!reason },
    { label:"8. Concept Tag", done: concept.trim().length >= 3 },
  ];

  const completedSteps = stepItems.filter(s => s.done).length;
  const canLog = completedSteps === stepItems.length;
  const isDone = questions.length >= DEMO_LIMIT;

  const addQuestion = () => {
    if (!canLog) return;
    setQuestions(prev => [...prev, {
      id: Date.now(),
      exam,
      result,
      subject,
      qtype,
      timing,
      answerChange,
      confidence,
      reason,
      concept: concept.trim(),
      date: new Date().toLocaleDateString("en-US", { month:"short", day:"numeric" }),
    }]);
    resetQuestionForm();
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

  const correct = questions.filter(q => q.result === "correct").length;
  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  const bySubj = {};
  const byReason = {};
  questions.forEach(q => {
    bySubj[q.subject] = (bySubj[q.subject] || 0) + 1;
    byReason[q.reason] = (byReason[q.reason] || 0) + 1;
  });
  const pieData = Object.entries(bySubj).map(([name, value]) => ({ name, value }));
  const topPattern = Object.entries(byReason).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const resultBtn = (active, danger) => ({
    flex:1,
    background: active ? (danger ? theme.danger+"22" : theme.success+"22") : theme.raised,
    border: `1px solid ${active ? (danger ? theme.danger : theme.success) : theme.border}`,
    color: active ? (danger ? theme.danger : theme.success) : theme.dim,
    borderRadius:8,
    padding:"10px",
    fontSize:13,
    cursor:"pointer",
    fontFamily:"'DM Sans',sans-serif",
    fontWeight: active ? 600 : 400,
    transition:"all 0.15s",
  });

  const selectStyle = {
    width:"100%",
    background:theme.raised,
    border:`1px solid ${theme.border}`,
    borderRadius:8,
    padding:"9px 11px",
    color:theme.text,
    fontSize:12,
    fontFamily:"'DM Sans',sans-serif",
  };

  return (
    <div style={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:16,padding:"28px 24px",maxWidth:760,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:theme.text}}>Live Demo — 8-step reflection flow</div>
          <div style={{fontSize:12,color:theme.muted,marginTop:3}}>Simulate real post-block review and see analytics update as your dataset grows.</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {["USMLE","MCAT","LSAT"].map(e => (
            <button
              key={e}
              onClick={() => { setExam(e); resetQuestionForm(); }}
              style={{
                background:exam===e?theme.accent:theme.raised,
                border:`1px solid ${exam===e?theme.accent:theme.border}`,
                borderRadius:7,
                padding:"5px 12px",
                color:exam===e?"#fff":theme.dim,
                fontSize:12,
                fontWeight:exam===e?600:400,
                cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif"
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {!isDone ? (
        <div style={{marginBottom:22}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center",gap:10}}>
            <div style={{fontSize:10,color:C.muted,letterSpacing:"0.8px",textTransform:"uppercase"}}>
              Question {questions.length + 1} of {DEMO_LIMIT} · {completedSteps}/8 steps complete
            </div>
            <div style={{fontSize:11,color:C.accent,fontWeight:600}}>{Math.round((completedSteps / 8) * 100)}%</div>
          </div>
          <div style={{height:7,background:C.raised,borderRadius:999,overflow:"hidden",marginBottom:14}}>
            <div style={{height:"100%",width:`${(completedSteps / 8) * 100}%`,background:C.accent,transition:"width 0.15s ease"}}/>
          </div>

          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
            {stepItems.map(s => (
              <div key={s.label} style={{
                fontSize:10,
                borderRadius:999,
                padding:"4px 9px",
                border:`1px solid ${s.done ? C.accent+"66" : C.border}`,
                background:s.done ? C.accent+"1f" : C.raised,
                color:s.done ? C.accent : C.muted,
                fontWeight:500,
              }}>
                {s.done ? "✓ " : "• "}{s.label}
              </div>
            ))}
          </div>

          <div style={{fontSize:10,color:C.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:8}}>Step 1 · Result</div>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <button onClick={() => { setResult("correct"); setReason(""); }} style={resultBtn(result==="correct",false)}>✓ Correct</button>
            <button onClick={() => { setResult("incorrect"); setReason(""); }} style={resultBtn(result==="incorrect",true)}>✗ Incorrect</button>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:10,marginBottom:10}}>
            <div>
              <div style={{fontSize:10,color:C.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:6}}>Step 2 · Subject</div>
              <select value={subject} onChange={e => setSubject(e.target.value)} style={selectStyle}>
                <option value="">Select subject</option>
                {DEMO_SUBJECTS[exam].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:10,color:C.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:6}}>Step 3 · Question type</div>
              <select value={qtype} onChange={e => setQtype(e.target.value)} style={selectStyle}>
                <option value="">Select type</option>
                {DEMO_QTYPES[exam].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:10,color:C.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:6}}>Step 4 · Timing</div>
              <select value={timing} onChange={e => setTiming(e.target.value)} style={selectStyle}>
                <option value="">Select timing</option>
                {DEMO_TIMING.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:10,color:C.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:6}}>Step 5 · Answer change</div>
              <select value={answerChange} onChange={e => setAnswerChange(e.target.value)} style={selectStyle}>
                <option value="">Select answer-change behavior</option>
                {DEMO_ANSWER_CHANGES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:10,color:C.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:6}}>Step 6 · Confidence</div>
              <select value={confidence} onChange={e => setConfidence(e.target.value)} style={selectStyle}>
                <option value="">Select confidence</option>
                {DEMO_CONFIDENCE.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:10,color:C.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:6}}>
                {result === "incorrect" ? "Step 7 · Mistake reason" : "Step 7 · Why correct"}
              </div>
              <select value={reason} onChange={e => setReason(e.target.value)} style={selectStyle}>
                <option value="">Select reason</option>
                {(result === "incorrect" ? DEMO_REASONS.incorrect : DEMO_REASONS.correct).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,color:C.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:6}}>Step 8 · Concept tag</div>
            <input
              value={concept}
              onChange={e => setConcept(e.target.value)}
              placeholder="e.g., nephritic vs nephrotic syndrome, author's tone drift, assumption family"
              style={{
                width:"100%",
                boxSizing:"border-box",
                background:C.raised,
                border:`1px solid ${C.border}`,
                borderRadius:8,
                padding:"10px 12px",
                color:C.text,
                fontSize:12,
                fontFamily:"'DM Sans',sans-serif",
                outline:"none",
              }}
            />
          </div>

          <button
            onClick={addQuestion}
            disabled={!canLog}
            style={{
              width:"100%",
              background:canLog?theme.accent:theme.raised,
              border:`1px solid ${canLog?theme.accent:theme.border}`,
              borderRadius:8,
              padding:"11px",
              color:canLog?"#fff":theme.muted,
              fontSize:14,
              fontWeight:600,
              cursor:canLog?"pointer":"not-allowed",
              opacity:canLog?1:0.55,
              fontFamily:"'DM Sans',sans-serif",
            }}
          >
            Log Question + Update Analytics →
          </button>
        </div>
      ) : (
        <div style={{background:theme.accent+"14",border:`1px solid ${theme.accent}30`,borderRadius:10,padding:"14px",marginBottom:20,textAlign:"center"}}>
          <div style={{fontSize:14,fontWeight:600,color:theme.accent,marginBottom:4}}>Demo complete 🎯</div>
          <div style={{fontSize:12,color:theme.muted}}>You just ran the full 8-step review cycle. Create a free account to log unlimited sessions.</div>
        </div>
      )}

      {questions.length > 0 && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:16}}>
            {[
              {l:"Questions",v:questions.length,c:theme.text},
              {l:"Score",v:`${score}%`,c:score>=75?theme.success:score>=60?theme.warn:theme.danger},
              {l:"Correct",v:correct,c:theme.success},
              {l:"Top Pattern",v:topPattern,c:theme.accent},
            ].map(s => (
              <div key={s.l} style={{background:theme.raised,border:`1px solid ${theme.border}`,borderRadius:8,padding:"11px 12px"}}>
                <div style={{fontSize:9,color:theme.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:5}}>{s.l}</div>
                <div style={{fontSize:18,fontWeight:700,color:s.c,lineHeight:1.25}}>{s.v}</div>
              </div>
            ))}
          </div>

          {pieData.length > 0 && (
            <>
              <div style={{height:160,marginBottom:10}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={68} paddingAngle={3} dataKey="value" startAngle={90} endAngle={450}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                    </Pie>
                    <Tooltip
                      contentStyle={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:8,fontSize:11,color:theme.text}}
                      formatter={(v) => [`${v} Q`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:14}}>
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

          <div style={{fontSize:11,color:theme.muted,marginBottom:16,borderTop:`1px solid ${theme.border}`,paddingTop:12}}>
            Last entries: {questions.slice(-3).map(q => `${q.subject} / ${q.qtype} / ${q.result}`).join(" • ")}
          </div>

          {questions.length >= 2 && (
            <div style={{borderTop:`1px solid ${theme.border}`,paddingTop:16}}>
              {!showSave ? (
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,color:theme.muted}}>Save this demo data and continue inside the full app</span>
                  <button
                    onClick={() => setShowSave(true)}
                    style={{
                      background:theme.accent,
                      border:"none",
                      borderRadius:8,
                      padding:"8px 18px",
                      color:"#fff",
                      fontSize:13,
                      fontWeight:600,
                      cursor:"pointer",
                      fontFamily:"'DM Sans',sans-serif"
                    }}
                  >
                    Save Free →
                  </button>
                </div>
              ) : linkStatus === "done" ? (
                <div style={{textAlign:"center",color:theme.success,fontSize:13,fontWeight:600}}>
                  ✓ Account created! Check your email, then <a href="/app" style={{color:theme.accent}}>open the full app →</a>
                </div>
              ) : (
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:10}}>Create your free account — your demo data carries over</div>
                  {["email","password"].map((t, i) => (
                    <input
                      key={t}
                      type={t}
                      placeholder={t === "email" ? "you@email.com" : "Create password"}
                      value={i===0?email:pass}
                      onChange={e => i===0?setEmail(e.target.value):setPass(e.target.value)}
                      style={{
                        width:"100%",
                        boxSizing:"border-box",
                        background:theme.raised,
                        border:`1px solid ${theme.border}`,
                        borderRadius:8,
                        padding:"9px 14px",
                        color:theme.text,
                        fontSize:13,
                        fontFamily:"'DM Sans',sans-serif",
                        outline:"none",
                        marginBottom:8
                      }}
                    />
                  ))}
                  {linkStatus==="error" && <div style={{color:theme.danger,fontSize:12,marginBottom:8}}>Something went wrong — try again.</div>}
                  <button
                    onClick={linkAccount}
                    disabled={!email || !pass || linkStatus === "working"}
                    style={{
                      width:"100%",
                      background:C.accent,
                      border:"none",
                      borderRadius:8,
                      padding:"10px",
                      color:"#fff",
                      fontSize:13,
                      fontWeight:600,
                      cursor:"pointer",
                      fontFamily:"'DM Sans',sans-serif",
                      opacity:!email||!pass?0.6:1
                    }}
                  >
                    {linkStatus==="working" ? "Creating account…" : "Create Free Account →"}
                  </button>
                  <div style={{textAlign:"center",marginTop:8,fontSize:12,color:C.muted}}>
                    Already have an account? <a href="/app" style={{color:C.accent}}>Sign in</a>
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
    screenshotLabel: "[Product screenshot: Question review interface]"
  },
  {
    title: "USMLE Wrong Answers",
    subtitle: "4 Types & How to Fix Each",
    body: "Not all wrong answers are equal. Learn the 4 types of mistakes and apply the right study strategy to each one.",
    cta: "Learn the Framework →",
    blogSlug: "learn-from-wrong-answers-usmle",
    hasScreenshot: true,
    screenshotLabel: "[Product screenshot: Analysis dashboard]"
  },
  {
    title: "Building Your Anki Deck",
    subtitle: "From Real Exam Mistakes",
    body: "The most powerful Anki decks are built from your actual wrong answers. Generate cards automatically from logged questions.",
    cta: "See the Strategy →",
    blogSlug: "spaced-repetition-anki-premed",
    hasScreenshot: true,
    screenshotLabel: "[Product screenshot: Anki export feature]"
  },
  {
    title: "LSAT Logical Reasoning",
    subtitle: "Master 10 Question Types",
    body: "LR accounts for 50% of your score. Learn question types and the exact plan to master them efficiently.",
    cta: "Start the Plan →",
    blogSlug: "lsat-logical-reasoning",
    hasScreenshot: true,
    screenshotLabel: "[Product screenshot: Practice tracker]"
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
          <a href="/app" style={{fontSize:13,color:C.text,fontWeight:500}}>Sign In</a>
          <button onClick={scrollToDemo} style={{background:C.accent,border:"none",borderRadius:8,
            padding:"7px 18px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif"}}>Learn Better →</button>
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
            padding:32}}>
            {HERO_SLIDES[heroSlide]?.hasScreenshot ? (
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
