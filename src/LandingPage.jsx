import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
 
// ── Brand tokens (mirrors DARK theme) ────────────────────────────────────────
const DARK_C = {
  bg:"#07090f", surface:"#0e1121", raised:"#141829",
  border:"rgba(100,140,255,0.13)", text:"#dce8ff",
  muted:"#8896b0", dim:"#a0b4cc", accent:"#3b6eff",
  success:"#3dab80", danger:"#c86060", warn:"#b8943a",
  isDark: true,
};
const LIGHT_C = {
  bg:"#f5f7fa", surface:"#ffffff", raised:"#eef1f8",
  border:"rgba(0,0,0,0.08)", text:"#0a0d1a",
  muted:"#9ba8be", dim:"#4a5568", accent:"#0055d4",
  success:"#16a34a", danger:"#dc2626", warn:"#d97706",
  isDark: false,
};
 
// Auto-switch: 6am-8pm = light, 8pm-6am = dark
const hour = new Date().getHours();
const C = (hour >= 6 && hour < 20) ? LIGHT_C : DARK_C;
const PIE_COLORS = ["#3b82f6","#10b981","#8b5cf6","#f59e0b","#ec4899","#06b6d4","#f97316"];
const DEMO_SUBJECTS = {
  USMLE:["Cardiology","Neurology","GI","Renal","Pulmonology","Derm","MSK"],
  MCAT: ["C/P","CARS","B/B","Psych/Soc"],
  LSAT: ["Logical Reasoning","Analytical Reasoning","Reading Comprehension"],
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
function InteractiveDemo() {
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
 
// ── Landing Page ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const demoRef = useRef(null);
  const [showExitModal, setShowExitModal] = useState(false);
 
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
 
      {/* Hero Header — centered logo + nav buttons below */}
      <header style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"48px 24px 32px",textAlign:"center"}}>
        {/* Logo */}
        <div style={{display:"flex",justifyContent:"center",marginBottom:28}}>
          <img
            src={C.isDark
              ? "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iNjAwLjAwMDAwMHB0IiBoZWlnaHQ9Ijk0LjAwMDAwMHB0IiB2aWV3Qm94PSIwIDAgNjAwLjAwMDAwMCA5NC4wMDAwMDAiCiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsOTQuMDAwMDAwKSBzY2FsZSgwLjA2NjY2NywtMC4wNjY2NjcpIgpmaWxsPSIjZmZmZmZmIiBzdHJva2U9Im5vbmUiPgo8cGF0aCBkPSJNODg4MiAxMzgwIGMwIC0yMSA0IC0yOSA4IC0xOSA0IDExIDQgMjcgMCAzOCAtNCAxMCAtOCAyIC04IC0xOXoiLz4KPHBhdGggZD0iTTEzNSAxMjc4IGMwIC04IDM4IC0xMTggODQgLTI0NSA0NyAtMTI3IDE0MCAtMzg5IDIwOSAtNTgzIGwxMjQKLTM1MiAxMzUgLTUgMTM1IC00IDM0IDEwMiBjMTggNTYgMTEzIDMyNCAyMTEgNTk1IDk4IDI3MiAxNzggNDk2IDE3OCA0OTkgMCA0Ci01OCA0IC0xMjkgMiBsLTEyOSAtNCAtODkgLTI3MCBjLTQ5IC0xNDkgLTExMSAtMzQ1IC0xMzkgLTQzNSAtMjggLTkxIC01NgotMTY0IC02MiAtMTYzIC03IDIgLTc3IDE5OCAtMTU3IDQzNSBsLTE0NSA0MzMgLTEzMCA0IGMtNzEgMiAtMTMwIC0yIC0xMzAgLTl6Ii8+CjxwYXRoIGQ9Ik0xMzY1IDEyODYgYy0xMSAtMTUzIDEgLTEyMDMgMTMgLTEyMDIgOSAxIDY0IDMgMTIyIDQgbDEwNSAyIDAgNjAwCjAgNjAwIC0xMjAgMCBjLTY2IDAgLTEyMCAtMiAtMTIwIC00eiIvPgo8cGF0aCBkPSJNMTgzMCA2OTIgbDAgLTYwMCAxMDcgLTUgYzEzNCAtNiAxMjMgLTUxIDExNSA0NzYgLTQgMjQzIC0yIDQ0MiA0CjQ0MiA5IDAgMTg5IC03MTYgMjE4IC04NjYgbDEwIC00OSAxMjIgMCAxMjIgMCAxMTEgNDY1IGM2MiAyNTUgMTE2IDQ2MCAxMjAKNDU2IDUgLTUgNiAtMjE0IDMgLTQ2NSBsLTUgLTQ1NiAxMTQgMCAxMTQgMCAwIDYwMCAwIDYwMSAtMTgzIC00IC0xODMgLTQKLTEwMCAtMzk4IGMtNTUgLTIxOSAtMTA2IC0zOTQgLTExMiAtMzkwIC03IDQgLTU3IDE4MyAtMTEyIDM5OCBsLTEwMCAzOTAKLTE4MiA0IC0xODMgNCAwIC01OTl6Ii8+CjxwYXRoIGQ9Ik0zNTU2IDEyNTYgYy0yMiAtNTggLTQzOCAtMTEyOCAtNDQ3IC0xMTQ4IC02IC0xNSAyMSAtMTggMTI0IC0xNQpsMTMyIDUgNDQgMTMxIDQ0IDEzMSAyNDMgMCAyNDMgMCAyMCAtNTYgYzExIC0zMSAzMyAtOTIgNDkgLTEzNSBsMjkgLTc5IDEzNQowIGMxMjggMCAxMzMgMSAxMTkgMjkgLTMzIDYxIC0zMCA2MSA0MzMgNjEgbDQ0OSAwIDEwIC00NiAxMCAtNDUgMTM1IDQgMTM1IDUKMjAzIDU2MiBjMTExIDMwOSAyMDYgNTc4IDIxMCA1OTYgNyAzMyA0IDM0IC0xMTkgMzQgbC0xMjYgMCAtMTMwIC00MDEgYy03MQotMjIxIC0xMzQgLTQyMCAtMTM5IC00NDMgLTE4IC03MiAtMjggLTQ5IC0xNzcgNDAyIGwtMTQ3IDQ0MiAtMTM2IDAgYy0xMjMgMAotMTM0IC0yIC0xMjQgLTI2IDM1IC04NSA2OSAtNzkgLTQ0NiAtNzkgbC00NzEgMCAtMTkgNTMgLTE5IDUyIC0xMjcgMCBjLTExOAowIC0xMjggLTIgLTE0MCAtMzR6IG0xNjUgLTMwNyBjOSAtMzEgNDUgLTEyOSA3OCAtMjE4IDMzIC04OSA1NiAtMTY2IDUyIC0xNzAKLTQgLTQgLTc4IC01IC0xNjQgLTMgbC0xNTcgNSA3MiAxOTUgYzM5IDEwNyA3NCAyMDYgNzggMjIxIDExIDM5IDIxIDMyIDQxCi0zMHogbTExOTIgLTQ1IGMxNiAtNDggMzEgLTk1IDM0IC0xMDUgNCAtMTUgLTk1IC0xOSAtNDU5IC0xOSBsLTQ2MyAwIC00MCA5NApjLTIyIDUxIC00MCA5OSAtNDAgMTA1IDAgNiAyMTEgMTEgNDcwIDExIGw0NzAgMCAyOCAtODZ6IG0xNDQgLTQwMSBjMTUgLTQyCjMyIC04NyAzNyAtMTAyIDggLTI1IC0xOCAtMjYgLTQ1MiAtMjIgbC00NTkgNCAtNDQgMTAxIC00MyAxMDEgNDY2IC00IDQ2NiAtMwoyOSAtNzV6Ii8+CjxwYXRoIGQ9Ik02MDAwIDY5MSBsMCAtNjAxIDExMyAwIGM2MSAwIDExNSAwIDEyMCAwIDQgMCA4IDI2OCA4IDU5NiBsMCA1OTcKLTEyMCA0IC0xMjEgNCAwIC02MDB6Ii8+CjxwYXRoIGQ9Ik02NDY1IDY5MSBsMCAtNTk5IDEwNSAtNSBjNTggLTIgMTExIC0zIDExNyAtMSA2IDIgOCAyMTQgNSA0NzEgLTQKMzQxIC0xIDQ2NCAxMSA0NTcgOSAtNiAxNyAtMjAgMTcgLTMyIDAgLTE4IDE4MSAtNzg1IDIwNCAtODY2IDEzIC00NSAyNDMgLTM4CjI1MyA4IDUgMTggNTIgMjEyIDEwNSA0MzEgNTQgMjE5IDk4IDQwOSA5OCA0MjMgMCAxNCA3IDMwIDE3IDM1IDEyIDggMTUgLTExNwoxMSAtNDU2IGwtNSAtNDY3IDExMyAwIDExMyAwIDQgNjAwIDMgNjAwIC0xODYgMCAtMTg2IDAgLTYyIC0yNDQgYy0zNCAtMTM0Ci03OSAtMzE2IC0xMDEgLTQwNSAtMjIgLTg4IC00NCAtMTYxIC01MCAtMTYxIC02IDAgLTMyIDg2IC01OCAxOTEgLTI2IDEwNQotNzIgMjg4IC0xMDMgNDA1IGwtNTUgMjE0IC0xODUgMCAtMTg1IDAgMCAtNTk5eiIvPgo8cGF0aCBkPSJNODEwMCAxMDAxIGMtNjEgLTE1OSAtMTY2IC00MjkgLTIzMyAtNjAwIC02OCAtMTcxIC0xMTkgLTMxMyAtMTE0Ci0zMTUgNSAtMiA2NSAtMiAxMzIgMSBsMTIzIDUgNDQgMTMwIDQzIDEzMSAyNDUgMCAyNDQgMCA0NiAtMTMxIDQ2IC0xMzAgMTIxCi01IGM2NiAtMyAxMjYgLTEgMTMyIDQgNyA1IC05NSAyNzcgLTIyNSA2MDQgbC0yMzYgNTk0IC0xMjkgMSAtMTI4IDAgLTExMQotMjg5eiBtMzE2IC0yMDIgYzM4IC0xMDUgNzUgLTIwMyA4MSAtMjE4IDEwIC0yNCAtMyAtMjYgLTE1NyAtMjYgLTE1NCAwIC0xNjgKMiAtMTYwIDI2IDQ0IDE0MCAxNTEgNDIzIDE1NyA0MTcgNCAtNCA0MCAtOTQgNzkgLTE5OXoiLz4KPHBhdGggZD0iTTg4ODIgMTIwNCBjLTIgLTQ1IDIgLTQ5IDQzIC00OSAzMyAwIDQyIDYgMzYgMjIgLTcgMTcgLTE2IDE5IC0zNyA4Ci0yMyAtMTMgLTI4IC04IC0zMyAyNiAtNiAzOSAtNyAzOCAtOSAtN3oiLz4KPHBhdGggZD0iTTg5OTAgMTAxMyBjMCAtNTggMyAtODAgNiAtNDkgMyAzMSAzIDc4IDAgMTA1IC0zIDI3IC02IDEgLTYgLTU2eiIvPgo8L2c+Cjwvc3ZnPgo="
              : "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iNjAwLjAwMDAwMHB0IiBoZWlnaHQ9Ijk0LjAwMDAwMHB0IiB2aWV3Qm94PSIwIDAgNjAwLjAwMDAwMCA5NC4wMDAwMDAiCiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsOTQuMDAwMDAwKSBzY2FsZSgwLjA2NjY2NywtMC4wNjY2NjcpIgpmaWxsPSIjMDAwMDAwIiBzdHJva2U9Im5vbmUiPgo8cGF0aCBkPSJNODg4MiAxMzgwIGMwIC0yMSA0IC0yOSA4IC0xOSA0IDExIDQgMjcgMCAzOCAtNCAxMCAtOCAyIC04IC0xOXoiLz4KPHBhdGggZD0iTTEzNSAxMjc4IGMwIC04IDM4IC0xMTggODQgLTI0NSA0NyAtMTI3IDE0MCAtMzg5IDIwOSAtNTgzIGwxMjQKLTM1MiAxMzUgLTUgMTM1IC00IDM0IDEwMiBjMTggNTYgMTEzIDMyNCAyMTEgNTk1IDk4IDI3MiAxNzggNDk2IDE3OCA0OTkgMCA0Ci01OCA0IC0xMjkgMiBsLTEyOSAtNCAtODkgLTI3MCBjLTQ5IC0xNDkgLTExMSAtMzQ1IC0xMzkgLTQzNSAtMjggLTkxIC01NgotMTY0IC02MiAtMTYzIC03IDIgLTc3IDE5OCAtMTU3IDQzNSBsLTE0NSA0MzMgLTEzMCA0IGMtNzEgMiAtMTMwIC0yIC0xMzAgLTl6Ii8+CjxwYXRoIGQ9Ik0xMzY1IDEyODYgYy0xMSAtMTUzIDEgLTEyMDMgMTMgLTEyMDIgOSAxIDY0IDMgMTIyIDQgbDEwNSAyIDAgNjAwCjAgNjAwIC0xMjAgMCBjLTY2IDAgLTEyMCAtMiAtMTIwIC00eiIvPgo8cGF0aCBkPSJNMTgzMCA2OTIgbDAgLTYwMCAxMDcgLTUgYzEzNCAtNiAxMjMgLTUxIDExNSA0NzYgLTQgMjQzIC0yIDQ0MiA0CjQ0MiA5IDAgMTg5IC03MTYgMjE4IC04NjYgbDEwIC00OSAxMjIgMCAxMjIgMCAxMTEgNDY1IGM2MiAyNTUgMTE2IDQ2MCAxMjAKNDU2IDUgLTUgNiAtMjE0IDMgLTQ2NSBsLTUgLTQ1NiAxMTQgMCAxMTQgMCAwIDYwMCAwIDYwMSAtMTgzIC00IC0xODMgLTQKLTEwMCAtMzk4IGMtNTUgLTIxOSAtMTA2IC0zOTQgLTExMiAtMzkwIC03IDQgLTU3IDE4MyAtMTEyIDM5OCBsLTEwMCAzOTAKLTE4MiA0IC0xODMgNCAwIC01OTl6Ii8+CjxwYXRoIGQ9Ik0zNTU2IDEyNTYgYy0yMiAtNTggLTQzOCAtMTEyOCAtNDQ3IC0xMTQ4IC02IC0xNSAyMSAtMTggMTI0IC0xNQpsMTMyIDUgNDQgMTMxIDQ0IDEzMSAyNDMgMCAyNDMgMCAyMCAtNTYgYzExIC0zMSAzMyAtOTIgNDkgLTEzNSBsMjkgLTc5IDEzNQowIGMxMjggMCAxMzMgMSAxMTkgMjkgLTMzIDYxIC0zMCA2MSA0MzMgNjEgbDQ0OSAwIDEwIC00NiAxMCAtNDUgMTM1IDQgMTM1IDUKMjAzIDU2MiBjMTExIDMwOSAyMDYgNTc4IDIxMCA1OTYgNyAzMyA0IDM0IC0xMTkgMzQgbC0xMjYgMCAtMTMwIC00MDEgYy03MQotMjIxIC0xMzQgLTQyMCAtMTM5IC00NDMgLTE4IC03MiAtMjggLTQ5IC0xNzcgNDAyIGwtMTQ3IDQ0MiAtMTM2IDAgYy0xMjMgMAotMTM0IC0yIC0xMjQgLTI2IDM1IC04NSA2OSAtNzkgLTQ0NiAtNzkgbC00NzEgMCAtMTkgNTMgLTE5IDUyIC0xMjcgMCBjLTExOAowIC0xMjggLTIgLTE0MCAtMzR6IG0xNjUgLTMwNyBjOSAtMzEgNDUgLTEyOSA3OCAtMjE4IDMzIC04OSA1NiAtMTY2IDUyIC0xNzAKLTQgLTQgLTc4IC01IC0xNjQgLTMgbC0xNTcgNSA3MiAxOTUgYzM5IDEwNyA3NCAyMDYgNzggMjIxIDExIDM5IDIxIDMyIDQxCi0zMHogbTExOTIgLTQ1IGMxNiAtNDggMzEgLTk1IDM0IC0xMDUgNCAtMTUgLTk1IC0xOSAtNDU5IC0xOSBsLTQ2MyAwIC00MCA5NApjLTIyIDUxIC00MCA5OSAtNDAgMTA1IDAgNiAyMTEgMTEgNDcwIDExIGw0NzAgMCAyOCAtODZ6IG0xNDQgLTQwMSBjMTUgLTQyCjMyIC04NyAzNyAtMTAyIDggLTI1IC0xOCAtMjYgLTQ1MiAtMjIgbC00NTkgNCAtNDQgMTAxIC00MyAxMDEgNDY2IC00IDQ2NiAtMwoyOSAtNzV6Ii8+CjxwYXRoIGQ9Ik02MDAwIDY5MSBsMCAtNjAxIDExMyAwIGM2MSAwIDExNSAwIDEyMCAwIDQgMCA4IDI2OCA4IDU5NiBsMCA1OTcKLTEyMCA0IC0xMjEgNCAwIC02MDB6Ii8+CjxwYXRoIGQ9Ik02NDY1IDY5MSBsMCAtNTk5IDEwNSAtNSBjNTggLTIgMTExIC0zIDExNyAtMSA2IDIgOCAyMTQgNSA0NzEgLTQKMzQxIC0xIDQ2NCAxMSA0NTcgOSAtNiAxNyAtMjAgMTcgLTMyIDAgLTE4IDE4MSAtNzg1IDIwNCAtODY2IDEzIC00NSAyNDMgLTM4CjI1MyA4IDUgMTggNTIgMjEyIDEwNSA0MzEgNTQgMjE5IDk4IDQwOSA5OCA0MjMgMCAxNCA3IDMwIDE3IDM1IDEyIDggMTUgLTExNwoxMSAtNDU2IGwtNSAtNDY3IDExMyAwIDExMyAwIDQgNjAwIDMgNjAwIC0xODYgMCAtMTg2IDAgLTYyIC0yNDQgYy0zNCAtMTM0Ci03OSAtMzE2IC0xMDEgLTQwNSAtMjIgLTg4IC00NCAtMTYxIC01MCAtMTYxIC02IDAgLTMyIDg2IC01OCAxOTEgLTI2IDEwNQotNzIgMjg4IC0xMDMgNDA1IGwtNTUgMjE0IC0xODUgMCAtMTg1IDAgMCAtNTk5eiIvPgo8cGF0aCBkPSJNODEwMCAxMDAxIGMtNjEgLTE1OSAtMTY2IC00MjkgLTIzMyAtNjAwIC02OCAtMTcxIC0xMTkgLTMxMyAtMTE0Ci0zMTUgNSAtMiA2NSAtMiAxMzIgMSBsMTIzIDUgNDQgMTMwIDQzIDEzMSAyNDUgMCAyNDQgMCA0NiAtMTMxIDQ2IC0xMzAgMTIxCi01IGM2NiAtMyAxMjYgLTEgMTMyIDQgNyA1IC05NSAyNzcgLTIyNSA2MDQgbC0yMzYgNTk0IC0xMjkgMSAtMTI4IDAgLTExMQotMjg5eiBtMzE2IC0yMDIgYzM4IC0xMDUgNzUgLTIwMyA4MSAtMjE4IDEwIC0yNCAtMyAtMjYgLTE1NyAtMjYgLTE1NCAwIC0xNjgKMiAtMTYwIDI2IDQ0IDE0MCAxNTEgNDIzIDE1NyA0MTcgNCAtNCA0MCAtOTQgNzkgLTE5OXoiLz4KPHBhdGggZD0iTTg4ODIgMTIwNCBjLTIgLTQ1IDIgLTQ5IDQzIC00OSAzMyAwIDQyIDYgMzYgMjIgLTcgMTcgLTE2IDE5IC0zNyA4Ci0yMyAtMTMgLTI4IC04IC0zMyAyNiAtNiAzOSAtNyAzOCAtOSAtN3oiLz4KPHBhdGggZD0iTTg5OTAgMTAxMyBjMCAtNTggMyAtODAgNiAtNDkgMyAzMSAzIDc4IDAgMTA1IC0zIDI3IC02IDEgLTYgLTU2eiIvPgo8L2c+Cjwvc3ZnPgo="}
            alt="VIMA VIMA"
            style={{
              height:60,
              objectFit:"contain",
            }}
          />
        </div>
        {/* Nav buttons centered below logo */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:24,flexWrap:"wrap"}}>
          <a href="/blog" style={{fontSize:14,color:C.muted,fontWeight:500,letterSpacing:"0.2px"}}>Guides</a>
          <a href="/app" style={{fontSize:14,color:C.text,fontWeight:500,letterSpacing:"0.2px"}}>Sign In</a>
          <button onClick={scrollToDemo} style={{
            background:C.accent,border:"none",borderRadius:9,
            padding:"9px 22px",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif",
            boxShadow:`0 0 24px ${C.accent}44`,
            letterSpacing:"0.2px",
          }}>Learn Better →</button>
        </div>
      </header>
 
      {/* Hero */}
      <section style={{maxWidth:760,margin:"0 auto",padding:"80px 24px 60px",textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:C.accent+"1a",
          border:`1px solid ${C.accent}30`,borderRadius:20,padding:"5px 14px",
          marginBottom:28,fontSize:12,color:C.accent,fontWeight:600}}>
          📊 MCAT · USMLE · LSAT Performance Analytics
        </div>
        <h1 style={{fontSize:"clamp(36px,6vw,58px)",fontWeight:800,color:C.text,lineHeight:1.1,
          letterSpacing:"-1px",marginBottom:20}}>
          See Your Weak Spots<br/>Before Test Day
        </h1>
        <p style={{fontSize:"clamp(16px,2vw,19px)",color:C.dim,lineHeight:1.7,
          maxWidth:580,margin:"0 auto 36px"}}>
          Vima Vima tracks every practice question you log across MCAT, USMLE, and LSAT prep — then
          surfaces precise analytics showing exactly where you're losing points, so you stop
          re-reading textbooks and start fixing the right things.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={scrollToDemo} style={{background:C.accent,border:"none",borderRadius:10,
            padding:"13px 30px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif",boxShadow:`0 0 32px ${C.accent}44`}}>
            Try the Free Demo →
          </button>
          <a href="/app" style={{background:C.raised,border:`1px solid ${C.border}`,borderRadius:10,
            padding:"13px 24px",color:C.dim,fontSize:14,fontWeight:500,
            display:"inline-flex",alignItems:"center"}}>
            Sign In to My Account
          </a>
        </div>
      </section>
 
      <AdUnit/>
 
      {/* Features */}
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
 
      {/* Demo */}
      <section ref={demoRef} style={{background:C.surface,padding:"60px 24px"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:36}}>
            <h2 style={{fontSize:26,fontWeight:700,color:C.text,marginBottom:10}}>
              Try it live — no account needed
            </h2>
            <p style={{fontSize:14,color:C.muted,lineHeight:1.6}}>
              Pick your exam, log a few practice questions, and watch your personal analytics
              build in real time. This is the real tool — not a mockup.
            </p>
          </div>
          <InteractiveDemo/>
        </div>
      </section>
 
      {/* Blog preview */}
      <section style={{maxWidth:900,margin:"0 auto",padding:"60px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:10}}>
          <h2 style={{fontSize:22,fontWeight:700,color:C.text}}>Study Strategy Guides</h2>
          <a href="/blog" style={{fontSize:13,color:C.accent,fontWeight:500}}>All guides →</a>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:14}}>
          {[
            {slug:"mcat-cars-framework",label:"MCAT",title:"MCAT CARS: The 6-Skill Framework That Separates 128 from 132"},
            {slug:"usmle-step2-question-review",label:"USMLE",title:"USMLE Step 2 CK: How to Review a Practice Block for Maximum Retention"},
            {slug:"lsat-rc-tone-questions",label:"LSAT",title:"LSAT Reading Comprehension: Why You Keep Missing Tone Questions"},
          ].map(a => (
            <a key={a.slug} href={`/blog/${a.slug}`}
              style={{background:C.raised,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px",
                display:"block",textDecoration:"none"}}>
              <span style={{fontSize:10,background:C.accent+"20",color:C.accent,
                borderRadius:5,padding:"2px 8px",fontWeight:600}}>{a.label}</span>
              <div style={{fontSize:14,fontWeight:600,color:C.text,marginTop:10,lineHeight:1.45}}>{a.title}</div>
              <div style={{fontSize:12,color:C.accent,marginTop:10}}>Read guide →</div>
            </a>
          ))}
        </div>
      </section>
 
      {/* Footer */}
      <footer style={{borderTop:`1px solid ${C.border}`,padding:"28px 24px",textAlign:"center"}}>
        <div style={{fontSize:13,color:C.muted,marginBottom:8,display:"flex",gap:20,justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/" style={{color:C.muted}}>Home</a>
          <a href="/blog" style={{color:C.muted}}>Study Guides</a>
          <a href="/app" style={{color:C.muted}}>Sign In</a>
        </div>
        <div style={{fontSize:12,color:C.muted+"66"}}>© 2026 Vima Vima · Built for serious exam prep</div>
      </footer>
    </div>
  );
}
 