import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "./ThemeContext.jsx";
import BrandLogo from "./BrandLogo.jsx";

// ── Brand tokens (mirrors DARK theme) ────────────────────────────────────────
const C = {
  bg:"#07090f", surface:"#0e1121", raised:"#141829",
  border:"rgba(100,140,255,0.13)", text:"#dce8ff",
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

function InteractiveDemo() {
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
    background: active ? (danger ? C.danger+"22" : C.success+"22") : C.raised,
    border: `1px solid ${active ? (danger ? C.danger : C.success) : C.border}`,
    color: active ? (danger ? C.danger : C.success) : C.dim,
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
    background:C.raised,
    border:`1px solid ${C.border}`,
    borderRadius:8,
    padding:"9px 11px",
    color:C.text,
    fontSize:12,
    fontFamily:"'DM Sans',sans-serif",
  };

  return (
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"28px 24px",maxWidth:760,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:C.text}}>Live Demo — 8-step reflection flow</div>
          <div style={{fontSize:12,color:C.muted,marginTop:3}}>Simulate real post-block review and see analytics update as your dataset grows.</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {["USMLE","MCAT","LSAT"].map(e => (
            <button
              key={e}
              onClick={() => { setExam(e); resetQuestionForm(); }}
              style={{
                background:exam===e?C.accent:C.raised,
                border:`1px solid ${exam===e?C.accent:C.border}`,
                borderRadius:7,
                padding:"5px 12px",
                color:exam===e?"#fff":C.dim,
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
              background:canLog?C.accent:C.raised,
              border:`1px solid ${canLog?C.accent:C.border}`,
              borderRadius:8,
              padding:"11px",
              color:canLog?"#fff":C.muted,
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
        <div style={{background:C.accent+"14",border:`1px solid ${C.accent}30`,borderRadius:10,padding:"14px",marginBottom:20,textAlign:"center"}}>
          <div style={{fontSize:14,fontWeight:600,color:C.accent,marginBottom:4}}>Demo complete 🎯</div>
          <div style={{fontSize:12,color:C.muted}}>You just ran the full 8-step review cycle. Create a free account to log unlimited sessions.</div>
        </div>
      )}

      {questions.length > 0 && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:16}}>
            {[
              {l:"Questions",v:questions.length,c:C.text},
              {l:"Score",v:`${score}%`,c:score>=75?C.success:score>=60?C.warn:C.danger},
              {l:"Correct",v:correct,c:C.success},
              {l:"Top Pattern",v:topPattern,c:C.accent},
            ].map(s => (
              <div key={s.l} style={{background:C.raised,border:`1px solid ${C.border}`,borderRadius:8,padding:"11px 12px"}}>
                <div style={{fontSize:9,color:C.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:5}}>{s.l}</div>
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
                      contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11,color:C.text}}
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

          <div style={{fontSize:11,color:C.muted,marginBottom:16,borderTop:`1px solid ${C.border}`,paddingTop:12}}>
            Last entries: {questions.slice(-3).map(q => `${q.subject} / ${q.qtype} / ${q.result}`).join(" • ")}
          </div>

          {questions.length >= 2 && (
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16}}>
              {!showSave ? (
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,color:C.muted}}>Save this demo data and continue inside the full app</span>
                  <button
                    onClick={() => setShowSave(true)}
                    style={{
                      background:C.accent,
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
                <div style={{textAlign:"center",color:C.success,fontSize:13,fontWeight:600}}>
                  ✓ Account created! Check your email, then <a href="/app" style={{color:C.accent}}>open the full app →</a>
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
                        background:C.raised,
                        border:`1px solid ${C.border}`,
                        borderRadius:8,
                        padding:"9px 14px",
                        color:C.text,
                        fontSize:13,
                        fontFamily:"'DM Sans',sans-serif",
                        outline:"none",
                        marginBottom:8
                      }}
                    />
                  ))}
                  {linkStatus==="error" && <div style={{color:C.danger,fontSize:12,marginBottom:8}}>Something went wrong — try again.</div>}
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
function QuestionLogSlide() {
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
          <div style={{fontSize:11,color:C.muted,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:6}}>
            USMLE Step 1 · Block 4 · Question 12
          </div>
          <span style={{background:C.danger+"22",border:`1px solid ${C.danger}40`,borderRadius:6,
            padding:"3px 10px",fontSize:12,color:C.danger,fontWeight:600}}>✗  Incorrect</span>
        </div>
        <div style={{fontSize:11,color:C.muted+"80"}}>Sep 1, 2026</div>
      </div>
      <div>
        {fields.map(([label, value]) => (
          <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px"}}>{label}</span>
            <span style={{fontSize:13,color:C.text,fontWeight:500}}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{marginTop:16,display:"flex",alignItems:"center",gap:8,background:C.accent+"12",
        border:`1px solid ${C.accent}25`,borderRadius:8,padding:"9px 14px"}}>
        <span style={{fontSize:12,color:C.accent,fontWeight:500}}>⚡ Flagged for Anki export</span>
      </div>
    </div>
  );
}

function AnalyticsSlide() {
  const subjects = [
    { name:"Cardiology",   pct:67, c:C.warn },
    { name:"Renal",        pct:40, c:C.danger },
    { name:"Neurology",    pct:100,c:C.success },
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

function AnkiSlide() {
  const [flipped, setFlipped]             = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const flip = () => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => { setFlipped(f => !f); setTransitioning(false); }, 200);
  };
  return (
    <div>
      <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:14}}>
        AI-generated from your missed question · Cardiology
      </div>
      <div onClick={flip} style={{
        cursor:"pointer",
        background:flipped ? C.accent+"18" : C.raised,
        border:`1px solid ${flipped ? C.accent+"50" : C.border}`,
        borderRadius:12, padding:"20px",
        opacity:transitioning ? 0 : 1,
        transform:transitioning ? "scale(0.97)" : "scale(1)",
        transition:"opacity 0.2s ease, transform 0.2s ease, background 0.3s, border-color 0.3s",
        minHeight:175,
      }}>
        {!flipped ? (
          <div>
            <div style={{fontSize:10,color:C.accent,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:12,fontWeight:600}}>Front</div>
            <p style={{fontSize:13,color:C.text,lineHeight:1.7,marginBottom:14}}>
              A 52-year-old man presents with sudden, severe tearing chest pain radiating to the back.
              BP is 162/90 in the right arm and 134/78 in the left. CXR shows a widened mediastinum.
              <br/><br/>What is the most likely diagnosis?
            </p>
            <div style={{textAlign:"right",fontSize:11,color:C.muted}}>tap to reveal →</div>
          </div>
        ) : (
          <div>
            <div style={{fontSize:10,color:C.accent,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:10,fontWeight:600}}>Back</div>
            <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:12}}>Aortic Dissection (Type A)</div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {[
                "Tearing/ripping quality — not pressure-like (ACS)",
                "Radiates to the back, not jaw or left arm",
                "BP differential ≥20 mmHg between arms",
                "Widened mediastinum on CXR",
                "Troponin usually negative in early presentation",
              ].map(b => (
                <div key={b} style={{display:"flex",gap:8}}>
                  <span style={{color:C.accent,flexShrink:0}}>·</span>
                  <span style={{fontSize:12,color:C.dim,lineHeight:1.5}}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{textAlign:"center",marginTop:10,fontSize:11,color:C.muted}}>
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

function ShowcaseCarousel() {
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
    <section style={{background:C.bg,padding:"64px 24px"}}>
      <div style={{maxWidth:820,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:11,color:C.accent,fontWeight:600,letterSpacing:"1.2px",textTransform:"uppercase",marginBottom:10}}>
            See it in action
          </div>
          <h2 style={{fontSize:26,fontWeight:700,color:C.text,marginBottom:10}}>
            Your data, structured and actionable
          </h2>
          <p style={{fontSize:14,color:C.muted,lineHeight:1.65,maxWidth:500,margin:"0 auto"}}>
            Every question you log builds a precise diagnostic picture of exactly where your score is leaking.
          </p>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:28,flexWrap:"wrap"}}>
          {SHOWCASE_META.map((m, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              background:i===active ? C.surface : "transparent",
              border:`1px solid ${i===active ? C.accent+"50" : C.border}`,
              borderRadius:999, padding:"8px 18px", cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s ease",
              display:"flex", alignItems:"center", gap:7,
            }}>
              <span style={{fontSize:14}}>{m.icon}</span>
              <span style={{fontSize:13,fontWeight:i===active?600:400,color:i===active?C.text:C.muted}}>{m.tag}</span>
            </button>
          ))}
        </div>
        <div style={{
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:20, padding:"28px",
          minHeight:360,
          opacity:fade?1:0,
          transform:fade?"translateY(0px)":"translateY(7px)",
          transition:"opacity 0.22s ease, transform 0.22s ease",
          boxShadow:`0 0 80px ${C.accent}07`,
        }}>
          <div style={{fontSize:11,color:C.muted,fontWeight:500,letterSpacing:"0.5px",marginBottom:18,
            display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:6,height:6,borderRadius:3,background:C.accent,display:"inline-block",flexShrink:0}}/>
            {SHOWCASE_META[active].label}
          </div>
          {active === 0 && <QuestionLogSlide />}
          {active === 1 && <AnalyticsSlide />}
          {active === 2 && <AnkiSlide />}
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:22}}>
          {[0,1,2].map(i => (
            <button key={i} onClick={() => goTo(i)} style={{
              width:i===active?22:6, height:6, borderRadius:3,
              background:i===active?C.accent:C.raised,
              border:`1px solid ${i===active?C.accent:C.border}`,
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
    title: "Try the Free Demo",
    subtitle: "See how Vima Vima works in 2 minutes",
    body: "Log a few practice questions and get instant analytics. No account required.",
    cta: "Start Demo →",
    emoji: "🚀",
    gradient: "linear-gradient(135deg, rgba(59,110,255,0.15) 0%, rgba(16,185,129,0.1) 100%)",
    animationElements: [
      {type:"circle",size:80,top:"10%",left:"10%",delay:"0s",color:"rgba(59,110,255,0.2)"},
      {type:"square",size:120,top:"70%",right:"5%",delay:"1s",color:"rgba(16,185,129,0.15)"}
    ]
  },
  {
    title: "Track Every Question You Miss",
    subtitle: "Build a personal data map of your gaps",
    body: "Log your practice questions with 8 reflection fields. Vima Vima finds the patterns you can't see.",
    cta: "Learn More →",
    emoji: "📊",
    gradient: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,110,255,0.1) 100%)",
    animationElements: [
      {type:"circle",size:100,top:"15%",right:"8%",delay:"0.5s",color:"rgba(139,92,246,0.2)"},
      {type:"triangle",size:90,bottom:"12%",left:"10%",delay:"1.5s",color:"rgba(59,110,255,0.15)"}
    ]
  },
  {
    title: "Get AI Study Insights",
    subtitle: "Understand your mistake patterns",
    body: "Not generic advice. Personalized insights based on your actual wrong answers.",
    cta: "See How →",
    emoji: "🧠",
    gradient: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(236,72,153,0.1) 100%)",
    animationElements: [
      {type:"circle",size:110,top:"8%",left:"15%",delay:"0.3s",color:"rgba(245,158,11,0.2)"},
      {type:"hexagon",size:85,bottom:"10%",right:"12%",delay:"1.2s",color:"rgba(236,72,153,0.15)"}
    ]
  },
  {
    title: "Export to Anki Automatically",
    subtitle: "Build decks from your real mistakes",
    body: "Every question you flag creates an Anki card targeting your specific gaps.",
    cta: "Explore →",
    emoji: "📝",
    gradient: "linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(59,110,255,0.1) 100%)",
    animationElements: [
      {type:"square",size:95,top:"12%",right:"10%",delay:"0.8s",color:"rgba(6,182,212,0.2)"},
      {type:"circle",size:75,bottom:"15%",left:"8%",delay:"1.3s",color:"rgba(59,110,255,0.15)"}
    ]
  },
  {
    title: "Free for MCAT, USMLE, and LSAT",
    subtitle: "No credit card required",
    body: "Start tracking your questions today. Premium features coming soon.",
    cta: "Get Started →",
    emoji: "✨",
    gradient: "linear-gradient(135deg, rgba(59,110,255,0.15) 0%, rgba(139,92,246,0.1) 100%)",
    animationElements: [
      {type:"circle",size:120,top:"5%",left:"12%",delay:"0.5s",color:"rgba(59,110,255,0.2)"},
      {type:"square",size:110,bottom:"8%",right:"10%",delay:"1.1s",color:"rgba(139,92,246,0.15)"},
      {type:"circle",size:60,top:"50%",right:"5%",delay:"1.8s",color:"rgba(59,110,255,0.12)"}
    ]
  }
];

export default function LandingPage() {
  const { isDark, setIsDark, theme: C } = useTheme();
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
      <section style={{maxWidth:760,margin:"0 auto",padding:"60px 24px 40px",textAlign:"center",position:"relative",minHeight:420}}>
        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } }
          @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
        {/* Slide Container */}
        <div style={{overflow:"hidden",position:"relative",height:340,background:"#000",borderRadius:16}}>
          {HERO_SLIDES.map((slide, i) => (
            <div key={i} style={{
              position:"absolute",inset:0,opacity:heroSlide===i?1:0,
              transition:"opacity 0.6s ease-out",pointerEvents:heroSlide===i?"auto":"none",
              background:slide.gradient,
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              overflow:"hidden"
            }}>
              {/* Animated Background Elements */}
              {slide.animationElements && slide.animationElements.map((elem, ei) => {
                const sizeMap = {circle:"50%", square:"0%", triangle:"50%", hexagon:"50%"};
                const radius = sizeMap[elem.type] || "50%";
                return (
                  <div key={ei} style={{
                    position:"absolute",
                    width:elem.size,
                    height:elem.size,
                    background:elem.type==="triangle"?"transparent":elem.color,
                    top:elem.top,
                    bottom:elem.bottom,
                    left:elem.left,
                    right:elem.right,
                    borderRadius:radius,
                    clipPath:elem.type==="triangle"?"polygon(50% 0%, 0% 100%, 100% 100%)":
                              elem.type==="hexagon"?"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)":"none",
                    animation:`float 6s ease-in-out infinite`,
                    animationDelay:elem.delay,
                    opacity:0.5,
                    zIndex:0
                  }}/>
                );
              })}

              {/* Content (above animated elements) */}
              <div style={{position:"relative",zIndex:10}}>
                <div style={{fontSize:48,marginBottom:16}}>{slide.emoji}</div>
                <h1 style={{fontSize:"clamp(32px,5vw,48px)",fontWeight:800,color:C.text,lineHeight:1.1,
                  letterSpacing:"-1px",marginBottom:12}}>
                  {slide.title}
                </h1>
                <p style={{fontSize:"clamp(14px,1.5vw,16px)",color:C.muted,lineHeight:1.6,marginBottom:8}}>
                  {slide.subtitle}
                </p>
                <p style={{fontSize:"clamp(14px,2vw,16px)",color:C.dim,lineHeight:1.7,maxWidth:520,margin:"0 auto 28px"}}>
                  {slide.body}
                </p>
                <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
                  <button onClick={scrollToDemo} style={{background:C.accent,border:"none",borderRadius:10,
                    padding:"12px 28px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",
                    fontFamily:"'DM Sans',sans-serif",boxShadow:`0 0 32px ${C.accent}44`,
                    position:"relative",zIndex:11}}>
                    {slide.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:24,paddingBottom:12}}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setHeroSlide(i)} style={{
              width:heroSlide===i?28:10,height:8,background:heroSlide===i?C.accent:C.border,
              border:"none",borderRadius:4,cursor:"pointer",transition:"all 0.3s"
            }}/>
          ))}
        </div>
      </section>

      {/* Demo */}
      <section ref={demoRef} style={{background:C.surface,padding:"52px 24px"}}>
        <div style={{maxWidth:780,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:30}}>
            <h2 style={{fontSize:26,fontWeight:700,color:C.text,marginBottom:10}}>
              Try the full review flow now
            </h2>
            <p style={{fontSize:14,color:C.muted,lineHeight:1.6,maxWidth:620,margin:"0 auto"}}>
              This trial mirrors the real learning workflow: complete all 8 steps per question,
              then watch your pattern analytics build in real time.
            </p>
          </div>
          <InteractiveDemo/>
        </div>
      </section>

      <ShowcaseCarousel />

      <AdUnit/>

      {/* Blog Preview */}
      <section style={{maxWidth:900,margin:"0 auto",padding:"60px 24px"}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <h2 style={{fontSize:26,fontWeight:700,color:C.text,marginBottom:12}}>
            Study Guides & Frameworks
          </h2>
          <p style={{fontSize:15,color:C.muted,lineHeight:1.6}}>
            Evidence-based strategies from MCAT, USMLE, and LSAT experts
          </p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:20}}>
          {[
            {slug:"mcat-cars-framework",label:"MCAT",title:"MCAT CARS: The 6-Skill Framework",preview:"Master the exact framework that separates 128 from 132 scorers."},
            {slug:"learn-from-wrong-answers-usmle",label:"USMLE",title:"4 Types of Wrong Answers",preview:"Categorize your misses and fix them with the right study strategy."},
            {slug:"lsat-logical-reasoning",label:"LSAT",title:"Logical Reasoning: 10 Question Types",preview:"Master the patterns that account for 50% of your LSAT score."},
            {slug:"spaced-repetition-anki-premed",label:"Study Strategy",title:"Building Your Anki Deck",preview:"Create flashcards from your actual wrong answers for lasting retention."},
          ].map(item => (
            <a key={item.slug} href={`/blog/${item.slug}`} style={{
              background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:24,
              display:"flex",flexDirection:"column",textDecoration:"none",transition:"all 0.2s",
              cursor:"pointer"
            }} onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
               onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <div style={{fontSize:11,background:C.accent+"20",color:C.accent,borderRadius:5,
                padding:"4px 10px",fontWeight:600,width:"fit-content",marginBottom:12}}>
                {item.label}
              </div>
              <h3 style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:10,lineHeight:1.4}}>
                {item.title}
              </h3>
              <p style={{fontSize:13,color:C.muted,lineHeight:1.6,flex:1}}>
                {item.preview}
              </p>
              <div style={{fontSize:12,color:C.accent,marginTop:12}}>Read full guide →</div>
            </a>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:36}}>
          <a href="/blog" style={{background:C.raised,border:`1px solid ${C.border}`,borderRadius:10,
            padding:"12px 28px",color:C.dim,fontSize:14,fontWeight:600,textDecoration:"none",
            display:"inline-block"}}>
            View All Guides →
          </a>
        </div>
      </section>

      <AdUnit/>
      <section style={{maxWidth:900,margin:"0 auto",padding:"60px 24px"}}>
        <h2 style={{fontSize:26,fontWeight:700,color:C.text,textAlign:"center",marginBottom:44}}>
          Built for the way high-scorers actually study
        </h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:18}}>
          {[
            {icon:"📋",title:"Log every question with reflection",
              body:"After each practice block, log each question: correct/incorrect, why you missed it, how long it took, whether you changed your answer, and the concept being tested. That 90-second habit is what separates plateauing students from improving ones — Vima Vima structures it for you."},
            {icon:"📊",title:"Analytics that pinpoint the real problem",
              body:"A 67% practice score tells you almost nothing actionable. Vima Vima breaks performance down by subject, question type, and mistake category. You'll know whether your Renal struggle is a knowledge gap or a reasoning error, and that difference completely changes how you study."},
            {icon:"⚡",title:"Anki cards built from your actual mistakes",
              body:"Every wrong answer is a potential flashcard. Vima Vima generates AI-drafted Anki cards targeting the exact concept you missed — not generic pre-made cards — and lets you export a real .apkg deck for Anki in one click. Your weak spots become your card deck."},
          ].map(f => (
            <div key={f.title} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"22px 20px"}}>
              <div style={{fontSize:28,marginBottom:12}}>{f.icon}</div>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:10}}>{f.title}</div>
              <p style={{fontSize:13,color:C.muted,lineHeight:1.7}}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{background:C.surface,padding:"60px 24px"}}>
        <div style={{maxWidth:700,margin:"0 auto"}}>
          <h2 style={{fontSize:26,fontWeight:700,color:C.text,marginBottom:12}}>How Vima Vima works</h2>
          <p style={{fontSize:14,color:C.muted,lineHeight:1.75,marginBottom:36}}>
            The core loop is simple. After each practice block — a UWorld session, an NBME,
            a Kaplan full-length, a set of LSAT PrepTest sections — you spend about 3 minutes
            logging each question. The wizard walks you through a quick structured reflection:
            right or wrong, time taken, did you change your answer, why you got it wrong, which
            concept was tested. The data accumulates across sessions, and the analytics surface
            the patterns you'd never catch manually.
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {[
              {n:"01",t:"Choose your exam track",d:"USMLE Step 1 or Step 2 CK, MCAT, or LSAT — each with its own subject and question-type taxonomy so analytics categories match your actual prep material."},
              {n:"02",t:"Create a session for each practice block",d:"A 'session' is one exam, one block, or one timed set. Name it whatever makes sense — NBME 14, UWorld Block 7, PrepTest 90 — and start logging questions."},
              {n:"03",t:"Log each question with a 30-second reflection",d:"Correct or incorrect. Time taken. Answer change. Mistake type. Concept tested. Six quick inputs — but the habit of doing it consistently after every block is the whole game."},
              {n:"04",t:"Review analytics after each session",d:"Your score, timing breakdown, most common mistake type, and missed concepts. Compare across sessions to see trends emerging over weeks of prep."},
              {n:"05",t:"Export Anki cards from wrong answers",d:"Every missed question is a flashcard candidate. Generate AI-drafted cards from your actual misses, then export the full .apkg for Anki desktop — no manual card creation required."},
            ].map(s => (
              <div key={s.n} style={{display:"flex",gap:18,alignItems:"flex-start"}}>
                <div style={{flexShrink:0,width:42,height:42,borderRadius:10,background:C.accent+"1a",
                  border:`1px solid ${C.accent}30`,display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:11,fontWeight:700,color:C.accent}}>{s.n}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:4}}>{s.t}</div>
                  <p style={{fontSize:13,color:C.muted,lineHeight:1.65}}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section style={{maxWidth:700,margin:"0 auto",padding:"60px 24px"}}>
        <h2 style={{fontSize:26,fontWeight:700,color:C.text,marginBottom:20}}>Who this is built for</h2>
        <p style={{fontSize:14,color:C.muted,lineHeight:1.8,marginBottom:18}}>
          Vima Vima is for students in the final 3–6 months of serious exam prep — the phase
          where you're doing hundreds of practice questions a week and the difference between
          a good score and a great score comes down to how effectively you review what you
          get wrong.
        </p>
        <p style={{fontSize:14,color:C.muted,lineHeight:1.8,marginBottom:18}}>
          If you're studying for <strong style={{color:C.text}}>USMLE Step 1 or Step 2 CK</strong>,
          you already know the UWorld grind. The problem most students face isn't access to
          questions — it's that reviewing wrong answers feels random and hard to track over time.
          Vima Vima gives you a structured log of every mistake, categorized by subject and mistake
          type, so your review has a system instead of being a pile of annotations.
        </p>
        <p style={{fontSize:14,color:C.muted,lineHeight:1.8,marginBottom:18}}>
          <strong style={{color:C.text}}>MCAT students</strong> have a unique challenge with
          CARS: unlike science sections where knowing the material gets you the point, CARS is
          entirely about reading strategy. The CARS Passage Analysis mode in Vima Vima uses a
          six-skill matrix (Main Idea, Tone, Author Perspective, Arguments, Contrasting Theories,
          Inference traps) to diagnose <em>why</em> you're missing reading comprehension
          questions — because it's almost never a knowledge problem.
        </p>
        <p style={{fontSize:14,color:C.muted,lineHeight:1.8}}>
          <strong style={{color:C.text}}>LSAT students</strong> preparing with 7Sage, PowerScore,
          or self-directed PrepTest work benefit from the same analytical framework. Logical
          Reasoning, Analytical Reasoning, and Reading Comprehension each have distinct failure
          modes. Vima Vima tracks them separately so your prep time goes where the actual gaps are.
        </p>
      </section>

      <AdUnit/>

      {/* FAQ */}
      <section style={{maxWidth:700,margin:"0 auto",padding:"60px 24px"}}>
        <h2 style={{fontSize:26,fontWeight:700,color:C.text,marginBottom:12}}>Frequently asked questions</h2>
        <p style={{fontSize:14,color:C.muted,lineHeight:1.7,marginBottom:36}}>Everything you need to know before you start.</p>
        <div style={{display:"flex",flexDirection:"column"}}>
          {[
            {q:"Is Vima Vima free?",a:"Yes. Core features — question logging, performance analytics, session tracking, and Anki card generation — are completely free. Create an account with an email address or Google sign-in and get immediate access. There's also an interactive demo on the homepage that requires no account at all."},
            {q:"Which exams does Vima Vima support?",a:"Vima Vima supports three exam tracks: USMLE (Step 1 and Step 2 CK), MCAT, and LSAT. Each track has its own subject taxonomy and question-type categories that match the actual structure of those exams. USMLE subjects include Cardiology, Neurology, GI, Renal, Pulmonology, and 11 others. MCAT tracks C/P, CARS, B/B, and Psych/Soc. LSAT tracks Logical Reasoning, Analytical Reasoning, and Reading Comprehension separately."},
            {q:"How is Vima Vima different from a spreadsheet or Notion?",a:"A spreadsheet requires you to design your own structure, build formulas, and manually create charts. Vima Vima provides structured data entry with consistent reflection fields for every question, pre-built analytics that surface patterns across hundreds of questions, and Anki export — no configuration needed. Because every question is logged in the same schema, the system can identify patterns like 'you get Cardiology Diagnosis questions right but miss Cardiology Management 60% of the time' — something a spreadsheet would never surface automatically."},
            {q:"How does the Anki card generation work?",a:"When you log an incorrect answer, fill in an Anki front and back field — or let the AI draft them based on the concept you tagged. Vima Vima then compiles all flagged questions into a real .apkg file (Anki's native format) that you import directly into Anki desktop or AnkiDroid in one click. Cards come from your actual wrong answers, targeting your specific gaps rather than a generic pre-made deck."},
            {q:"What is the MCAT CARS Passage Analysis mode?",a:"The CARS Passage Analysis mode provides a six-skill framework for analyzing each MCAT reading comprehension passage: Main Idea, Tone, Arguments, Author Perspective, Contrasting Theories, and Inference traps. After each passage you log your analysis across those six categories and note which questions you missed and why. Over time the system identifies which skill failures cost you the most points — for example, 'you consistently miss questions when contrasting theories appear in the passage.'"},
            {q:"Can I use Vima Vima alongside UWorld, 7Sage, or AAMC materials?",a:"Yes — Vima Vima is question-bank agnostic. It's the tracking and analytics layer on top of your existing question bank. When logging a question, tag which bank it came from (UWorld, AMBOSS, NBME, 7Sage, LSAC Official, AAMC, Kaplan, etc.). This lets you compare your performance across resources and see whether your scores differ between third-party banks and official materials."},
            {q:"Is my study data private?",a:"Yes. Your study data — wrong answers, session notes, Anki card drafts — is stored securely and is never sold to third parties. You can delete your account and all associated data at any time by emailing vimavimasupport@gmail.com. Vima Vima uses Supabase for authentication and storage, and Google AdSense to display ads on public pages — see the Privacy Policy for details on how ad cookies work."},
            {q:"How long does it take to log a question?",a:"About 30–60 seconds per question once you're familiar with the form. The fields are: correct or incorrect, time taken, whether you changed your answer, why you got it wrong (if incorrect), and which concept was tested. Most students log during the review phase of a block rather than question by question, which keeps the habit sustainable over months of prep."},
          ].map((item,i,arr) => (
            <div key={i} style={{borderTop:`1px solid ${C.border}`,paddingTop:20,paddingBottom:20,
              borderBottom:i===arr.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:10}}>{item.q}</div>
              <p style={{fontSize:13,color:C.muted,lineHeight:1.8}}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{borderTop:`1px solid ${C.border}`,padding:"28px 24px",textAlign:"center"}}>
        <div style={{fontSize:13,color:C.muted,marginBottom:8,display:"flex",gap:20,justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/" style={{color:C.muted}}>Home</a>
          <a href="/blog" style={{color:C.muted}}>Guides</a>
          <a href="/about" style={{color:C.muted}}>About</a>
          <a href="/faq" style={{color:C.muted}}>FAQ</a>
          <a href="/contact" style={{color:C.muted}}>Contact</a>
          <a href="/app" style={{color:C.muted}}>Sign In</a>
          <a href="/terms" style={{color:C.muted}}>Terms</a>
          <a href="/privacy" style={{color:C.muted}}>Privacy</a>
        </div>
        <div style={{fontSize:12,color:C.muted+"66"}}>© 2026 Vima Vima · Built for serious exam prep</div>
      </footer>
    </div>
  );
}
