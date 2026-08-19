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
            src={"data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCACmA3gDASIAAhEBAxEB/8QAHQAAAQUAAwEAAAAAAAAAAAAAAAIDBwgJAQQGBf/EAF0QAAEDAgMDBAgPDAUKBwEAAAEAAgMEBgUREwcSUQghM2EJFhgiMXF1gRQVN0FVV3OClJWztNHS0yMyNjhCVnJ2kZKywRdFk8LUNDVDRlR0g4WiwyVEUmJjoaNT/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ALhar+KNV/FNoQOar+K5Y5z3BrjmCmk5B0gQPaTOCNJnBLQgRpM4JL2tY0uaMiE6kT9GUDOq/ijVfxTaEDmq/iuWOc9wa45gppOQdIED2kzgjSZwS0IEaTOCS9rWNLmjIhOpE/RlAzqv4o1X8U2hA5qv4rljnPcGuOYKaTkHSBA9pM4I0mcEtCBGkzgkva1jS5oyITqRP0ZQM6r+KNV/FNoQOar+K5Y5z3BrjmCmk5B0gQPaTOCNJnBLQgRpM4JL2tY0uaMiE6kT9GUDOq/ijVfxTaEDmq/iuWOc9wa45gppOQdIED2kzgjSZwS0IEaTOCS9rWNLmjIhOpE/RlAzqv4o1X8U2hA5qv4rljnPcGuOYKaTkHSBA9pM4I0mcEtCBGkzgkva1jS5oyITqRP0ZQM6r+KNV/FNoQOar+K5Y5z3BrjmCmk5B0gQPaTOCNJnBLQgRpM4JL2tY0uaMiE6kT9GUDOq/ijVfxTaEDmq/iuWOc9wa45gppOQdIED2kzgjSZwS0IEaTOCS9rWNLmjIhOpE/RlAzqv4o1X8U2hA5qv4rljnPcGuOYKaTkHSBA9pM4I0mcEtCBGkzgkva1jS5oyITqRP0ZQM6r+KNV/FNoQOar+K5Y5z3BrjmCmk5B0gQPaTOCNJnBLQgRpM4JL2tY0uaMiE6kT9GUDOq/ijVfxTaEDmq/iuWOc9wa45gppOQdIED2kzgjSZwS0IEaTOCS9rWNLmjIhOpE/RlAzqv4o1X8U2hA5qv4rljnPcGuOYKaTkHSBA9pM4I0mcEtCBGkzgkva1jS5oyITqRP0ZQM6r+KNV/FNoQOar+K5Y5z3BrjmCmk5B0gQPaTOCNJnBLQgRpM4JL2tY0uaMiE6kT9GUDOq/ijVfxTaEDmq/iuWOc9wa45gppOQdIED2kzgjSZwS0IEaTOCEtCDpIQhAKHuUVtwm2N1ODvls+TGqPE2yBtQyv0NORhGbCNN3rOBBz5+fgphUO8sWzO3HYXjGhFqV2DZYpTZDn+5A6g88Zk5uICCKO7lpfa0m+Oh9iju5aX2tJvjofYqlqEGk/Jw5Q+HbYsexTBRbr8DrKKmbVRMdWifXj3t15+8bluks4573rZKbp+jKyy5M95dou2228bll06N9SKStJOTdGbvHE9Td4P96FqbP0ZQdVCEIBOQdIE2nIOkCDsqD+Ufyh8O2O47hWCm3X45WVtM6qkY2tEGhHvbrD947PeIfwy3fXzU4LLPlQXh277crkxeKXUo4ak0VGQc26MP3MEdTiHP98gsN3ctL7Wk3x0PsVw/lx0rmkf0aTD/AJ0PsVS5CDTbk6bXp9sGE4riwtV+CUdDOynjkdW6+vIW7zwO8blugs4/fr317Y2LaszG7jdTGqGFYdUVpgD9zV0o3P3d7I5Z7uWeRyzXj+TTZvaLsWt/BZYtOtkp/RlaCMna0vfuB62ghnvV9fbf6i18fq7iHzaRBXDu3qb2tpvjkfYrlnLgpWuB/o2mP/OR9iqZIQaEbEOVPBtN2kYfZrLIkwt1ayZ/ok4mJgzTjc/73Sbnnu5eH11ZBZrchn8ZW3vcaz5tItKUAoM5SXKBh2PY7heESWo/GTiFK6oEja8QbmTy3LLTdn4PDmFOaor2Sb1QbV8lP+VKD73dvU3tbTfHI+xR3b1N7W03xyPsVTNCC5ndvU3tbTfHI+xXsdi3Ksw/aDtJwu0JrPkwc4iZGR1TsSEwD2xueGlum3w7uXh8JCoEvs2Pjs9r3ngtx02Zlwyuhq2gflbjw7Lz5ZedBr+hNUVTBW0cFZSyCWCeNssTx4HNcMwf2FOoBIn6MpaRP0ZQR/tu2hUmzDZ5WXbVUJxAwSRRQ0gm0jM97w3IOyOWQ3neA/equ3dvU3tbTfHI+xS+yPXLuYZa1oRSc800uI1DM/AGDTjPn35f2KmCC5ndvU3tbTfHI+xXLOXBStcD/RtMf+cj7FUyQgul3ctL7Wk3x0PsVbvBa0Ylg9FiIj0hVU8c25nnu7zQ7LP18s1jktgbK/A3BPJ8HybUH10ifoylpE/RlB1UIQgF8PaBdVDY9k4xdmJN36bDKV05jDt0yuHMyMH1i5xa0dZX3FU3siN7+g7ewWwaSbKXEJPR9c0Hn0WEtjaepz94+OMIGO7lpfa0m+Oh9iju5aX2tJvjofYqlqEF1GcuSjL2h+zWdrc++IxkEgeLR51bfDsQpMWwWkxXD5mz0dZAyogkb4HxvaHNcPGCCsdFcnkz8pmz7U2SUVq3vUYiyuwyR8NM+GmMofTk7zMyDzFubm5cGtQXCQoF7rXY7/t+L/FzvpR3Wux3/b8X+LnfSgnpOQdIFAPda7Hf9vxf4ud9KVFyt9jjXgmvxjLyc76UFhUKAe672Nf7fjHxc76Ud13sa/2/GPi530oJ+SJ+jKgTuu9jX+34x8XO+lJl5XWxpzCBX4xn5Od9KCc0KBe612O/7fi/xc76Ud1rsd/2/F/i530oPjbXuVLJs42hYnaFfs+lqn0TmmOoGKhgnjc0Oa8DSOWYPgzORBHrLyjOXBStcD/RtMf+cj7FRZyw7/2f7SsfwW4rPqat9dDTvpK5s9K6LeYHb0TgT4SC6QH3qgVBdLu5aX2tJvjofYqw+wTadQ7WbAZdNHQHDpG1MlLU0jptUwyMyIG9k3PNrmO8A++y9ZZTK13Y5by9AXvjdk1MuUOLUwq6VpPNrQ/fAdbmOJPuaC9SRP0ZS0ifoyg6qEIQCcg6QJtfC2hXNT2bYuN3TU7pZhlDLUNa48z3hp3Ge+dut86CB9p/LAwyzb/xm1aSypMXZhdSaV1W3ExEJJGgB43dJ2W67eb4Tnu59S833ctL7Wk3x0PsVTSvqqiurp66rldNUVErpZZHeF73HMk+MkphBdLu5aX2tJvjofYqzmzG6Kq9dnWEXXV4O7B34pB6IZSOn1iyNxO4d7dbnvN3XeD8pZabMbWqb22hYFalLvB+J1scDnNHOyPPN7/esDneZa101JTUGGQUFHE2Gmpomwwxt8DGNADQOoABBGvKF2pR7I7KpLlkwR2MCoxFlFoNqdDd3o5H729uuz6PLLL11A/dvU3tbTfHI+xXreyJeolhP6xQfN6lUGQXM7t6m9rab45H2Kmfk1baotscWNTR24/BfSp8LSHVgn1dQPP/AKG5ZbnX4VmYrpdjS/yC9/dqL+GdBcZCEIKubTeV5T2Tf+NWm6wZa52F1Tqc1AxURiTL193SOXizK82/lx0rmkf0aTD/AJ0PsVXblP8A4wV7eVZP5KN0FzO7epva2m+OR9iju3qb2tpvjkfYqmaEGlXJx26UW2J2NQx4C/BKnCxE7SdVifVZJvDeB3G5ZFuR/SCmWDpAs5eQzcvpBt7oaGSTcp8bpZqB+Z5t7LUZ596MNH6S0ag6QIOyhCEAoU5Su3yh2O1mDYe+3343U4nFLK5jawQaLGFoaT3js94l3D70qa1mvy4Lm7Y+UHi8Ecm/T4NDFhsXP67BvyDzSPePMglzu3qb2tpvjkfYo7t6m9rab45H2KpmhBczu3qb2tpvjkfYr1GyjlZ098bRMFtJtiS0DsTqNEVBxQSCPvSc93SGfg4hULUn8lL8Yiy/KA/gcg1JQhCASJ+jKWkT9GUHVQhCCMOURthw/Y/bmH4lU4W7FqvEKowQUbagQkta0l8m9uu5m96PB4XhQgzlwUrXA/0bTH/nI+xUUct+9+2zbVVYXTTb+H29H6AiAPMZs96Z3j3u8PuYUEoLpd3LS+1pN8dD7Fep2T8rvCr32hYRadZZ0mCtxOb0PHVuxITBshB3Glum3752TfD4XBUET1DVVFDWwVtJM+Gpp5GywyMOTmPac2uHWCAUGySRP0ZXl9kN4U9/bNcCu2n3AcQpGvmY3wRzDvZWeZ7XDzL1E/RlB1UIQgE5B0gTacg6QIOyhCEAhCECNJnBGkzgloQI0mcE1VU8MlNJFJG18b2lj2uGYcCMiCOC7CRP0ZQZL7YrSksXafcFqva4R0NY5tOXeF0Du/id52OaV5JW37ItZvofGsAvymiyjq4zh1Y4Dm1GZviJ6y0vHijCqQgFqfycLyN+bG7cxyabVqjSimrSTz68XePJ63Fu94nBZYK43Y4Lw3am4rDqZeZwbilG0n1xlHMPkjl1FBc/SZwRpM4JaECNJnBJe1rGlzRkQnUifoygj/b5eb7G2QXJcbJtOpgo3RUh9fXk+5xkeJzgfECsqjznMq5/ZGbv0sNtyxqeXvp5HYnVtB591uccWfUSZT42hUwQCkjkz2X2+ba7dwOaLUomVAq60EZjQi79wPU7IM98FG6uv2OOzfQ+FY9flTFlJVyDDqNxHPpsyfKR1FxYPGwoLfaTOC8dtyjYNil9ED/VzEPm0i9ovHbc/UTvr9XMQ+bSIMmEIQgm3kPkt5SNvEeHRq/m0i0i1X8Vm5yIPxkLf9xq/m0i0fQOar+Ko12SBxdf9rEn+qn/ACpV4VR3sjv4f2v5Kf8AKlBVZCEIBC7mNYdU4RitRhtW3dmgfuu4EeEEdRBBHjXTQaccki6n3PsAtmofLv1FDAcOm58yDAdxufWWBh86lfVfxVPOxw3LvUd1WfLJ0ckWJU7M/DvDTlP/AExftVv0Dmq/iuWOc9wa45gppdXGsUpsEwWvxqtdu0tBSy1Ux4MjYXO/+gUGc/LWuQXFyhMcjifv02ENjw2Hn8GmM5B/aPkULLu49iVTjWOV+MVrt6qrqmSpmdxe9xc4/tJXSQCF3KvDamlw2ir5m7sVbqGH/wBzWO3SfFvZjzFdNALXizJX9p+C8/8AV8HybVkOtdbM/A/BfJ8HybUH2tV/Fcsc57g1xzBTScg6QIHtJnBGkzgloQNujjaCTkAOcknwLKzlE3t/SBthx+4opS+hdUGnoOfmFPH3jCOG8Bv+NxV+eV7fPaLsNxmpp5tPEcUb6WUWRyIfKCHuHAtjDyDxAWYqAQhPPpqhlJFVvgkbTzPcyOUtIa9zd0uAPrkbzc/GEDKEIQCEIQCEIQCEIQCEIQCEIQCEIQC9PsquqeyNo+AXXAXZ4bWslkDfC+LPKRvvmFw868whBsVS1jKqmiqaeZssMzBJG9pzDmkZgjqITzHOe4NccwVCvI0vDtu2E4QyaXfrcGJwuozPPlGBpn+zcwZ8QVNMHSBA9pM4I0mcEtCBGkzgqv8AZEbtbhGzTC7RppN2ox2s1J2g+GngycQfHI6Mj9Eq0azX5bt4dte3vFKaGXfo8CjbhkOR5t5mbpfPqOe33oQQehCEFqux22ca69MZvioizhwqnFJSOI/08v3xHW1gIPuivMxznuDXHMFRNyUbN7Sdh2BUM0WnXV8fpjWAjI6kwDgD1tZuNP6KliDpAgrf2RljW7EMIIH+scHzapVAFoD2Rv1D8I/WOD5tUrP5AK6XY1ebCb6cPCJqHL92dUtV0uxrf5nvv3ah/hnQW91X8Uar+KbQgy75ThJ2/wB6k+ysn8lHCkblN+r9enlWT+SjlAIXcwbDqnFsQbQ0bd+d7HuY313FrC7IdZ3cgumg+paONVFuXXhNwUuevhtbDVxjPLMxvDgPPktd6Cqpa7DKbEqJ4kp6mFk0Lx+UxwBaf2ELHRaa8j+5+2fk727JJJv1GGxuwybnz3dE7rB/Z6Z86CWtV/FGq/im0IGMaxWHCMHrcVrJNymoqeSomdwYxpc4/sBWRdyYrU47cOJY5WneqsQq5aqY5+F8jy53/wBkrRflmXL2t8n7HRHJuVGKmPDYefw6p+6D+zbIs2EAhC7mNYbU4Ric2HVjdyogyErf/S4gEjxjPJB01J3JWJHKFswj2Q/uOUYqTeSv+MLZnlD+45BqFqv4o1X8U2hA5qv4rljnPcGuOYKaTkHSBA9pM4Lym126qSwtmmPXbUBpOH0jnwtceaSY97Ezzvc0edeuVO+yO3zpUOA7PKObvp3emde0H8hubIWnqJ1Dl/7WlBTGtqaitrJqyqldNUTyOllkccy97jmSeskplCEAhPVdNUUk2jVQSQS7jX7kjS07rmhzTkfWLSCOohMoLl9jqvx2hjmzyrn52H0zoA4+scmTNHn03Adbirisc57g1xzBWT2xm8ZrB2nYFdcZdpUVUPRLW+F8Du9lb4yxzsuvJat4fPDVRQ1NPK2WGVgfG9pzDmkZgg8CEHb0mcEaTOCWhAjSZwSXtaxpc0ZEJ1In6MoGdV/FGq/im0IHNV/FCbQg7qEIQCRP0ZS0ifoygi/lK2b29bF7hwWKLUrY6c1lEAM3a0XftA63AFnvisulsWsu+UrZvaLtouHBIotOikqDV0QAyboS9+0DqaSWe9KCOF77k9Xj2ibZLbuOSXTpIqtsNYc+bQk+5yE8cmuLvG0LwKEGzA5xmEKMeS5eXbxsOtzFpZdStp6f0DWknN2tD3hJ63NDX++UnIBIn6Mpa8Lt+u4WNsfuS5WyCOopqNzKQ5/6eT7nF+x7mnxAoM7uVDd/bptwuPFIpdSjp6j0DSEHMaUPeZjqc4Of75RkuSSSSTmT4SuEC4IpJ5mQwsdJJI4NYxozLiTkABxWr+xa0o7F2a29arGtElDRtbUFvgdO7v5Xed7nFUB5HNm9uG3TCDPFqUOD54pU5jm+5kaY88hZzcAVpXB0gQdleO25+onfX6uYh82kXsV47bn6id9fq5iHzaRBkwhCEE2ciD8ZC3/cav5tItH1nByIPxkLf9xq/m0i0fQCo72R38P7X8lP+VKvEqO9kd/D+1/JT/lSgqshCEEy8rW2/SS+MBxWOPdhxy28Pq8wObUbC2J48f3Nrj+koaVzOW3bfovYHs4uqKPN+GwQUkpA59Oana4E9QdEB75UzQTHyNbl7WuUBgOpJuU+K7+GTc/h1R9zH9q2NaULH7CK+pwrFqPFKN+5U0c7KiF3/pexwc0/tAWuNs4tTY/beGY7RnOmxGkiqoufPvZGBw/+ig+goX5alzdrnJ/xmOOTcqMXkjw2Ln8O+d6QeeNkg86mhUu7I7cupjFrWhFJzQQS4jUNB8JedOP9gZJ+8gqKhC9Psptx13bS7ctoNLmYjiMMEuXrRl41D5m7x8yD3/KUtrtSt7Zdgro9OZtqMqJ25c4lmnlleD1hzyPMoZVpuyQta3afbTWgNaMEyAA5gNeRVZQC11sz8D8F8nwfJtWRS11sz8D8F8nwfJtQfWTkHSBNpyDpAg7KEL5V449Q2tamK3HiTt2jw2kkqpefnIY0nIdZyyHWQgox2Qq+fTzadRWdSTb1Jb9PnOAeY1MwDnePJgjHUS4Ksa+ldONV1yXLiVwYnJqVuI1UlVO71t97i45dXPkOpfNQcgEkADMnwBXJ24bGBgvI+t1sVLljNshtfW5N74+iCPRLfeucw5/+mJQRyU7M7d9uGBUE0OpQ0MnpjWgjMacJDgD1OfuN98tLMcwyjxrBa7B8QiEtHXU8lNOw/lRvaWuH7CUGQCF9q+rdrLSvLF7ZrwfRGGVklM52WW+GuIDh1OGRHUV8VBbPsd12UQuDGrAxWGnlbWx+j8P1Yw7KVgDZWDP13M3Xf8Mq7HpThXsZRf2DfoWS2zS6quyL+wS7KHeMuGVbJiwHLUZnk9nicwub51rZg+IUmL4TR4rh8zZ6OtgZUU8jfA+N7Q5pHjBCBHpThXsZRf2DfoSJsJwrTP8A4ZRf2DfoX0Eifoyg+T6U4X7G0f8AYN+hHpThfsbR/wBg36F3EIOn6U4X7G0f9g36EuHCcL1B/wCG0f8AYN+hdlOQdIEDfpThXsZRf2DfoR6U4V7GUX9g36F3UIOl6U4V7GUX9g36FVjsiFhU01k4Ne+GUUUUmF1JpKzSjDc4ZfvHOy9Zr2gD3RW0Xmdqlr0967OsdtWp3Q3EqN8LHOHMyTLON/vXhrvMgyNQn6+lqKGunoauJ0NRTyuiljd4WPaciD1ggphBZ/sel4ele0XFLPqJcoMbpNanaT/p4c3ZDxxukJ/QCvhB0gWR+zq5Kmz77wS6KXeMmGVsdQWg5b7Q7vmeJzc2+da0YRWU2IUdNX0crZqapibNDI3wPY4AtI8YIQfRQhCD4O0S5Kaz7Exu6KvdMWGUUtTuk5b7mtO6zxudk3zrI3EaypxDEKmvrJXTVNTK6aaR3he9xJcT4ySr5dkRvD0o2XYbaNPLu1GPVm/M0Hw08GTjn45DF+wqgqAXutglnG/NrlvW0+MvpZ6oS1nD0PH38niza0gdZC8Krjdjos3muG/amLhhdE4jxSTEf/kM/wBIILitAa0NaAABkAPWTkHSBNpyDpAgrj2Rv1D8I/WOD5tUrP5aA9kb9Q/CP1jg+bVKz+QCul2Nb/M99+7UP8M6parpdjW/zPffu1D/AAzoLcoQhBl1ym/V+vTyrJ/JRypG5Tfq/Xp5Vk/ko5QSNyZo45tvtmRSsa+N+KRtc1wzBBzzBXmdo9vyWpf+P21IHD0sxCemaT+U1jyGu87cj516jkwfjBWT5Vi/mvecvu2/STbzLisce7DjlBDV5gc2o0GJ48f3NpP6SCvauT2N65/ud22bLJ//ACxOmZn/AMKU/Iqmyl3kf3N2scoC3ZHyblPiUjsNm58t4TDdYP7TTPmQaXIQhBTPsj1y71batnxSdHHLiVQzPw7x04j/ANMv7VUBSxyt7l7Z9v1y1DJN+noZxh0PPmAIRuOy8bw8+dROg9Nsqtx13bSrctoNLmYjiMMEuXrRl43z5m7x8y+1yj2tZt5vdrWhrRjVQAAMgBvlSZ2Pu2vTjbi/GpI84cDw6WdriOYSyZRNH7r5D71RpykfV8vjy3U/xlBHyk3kr/jC2Z5Q/uOUZKTeSv8AjC2Z5Q/uOQafIQhAJyDpAm05B0gQPyyMiifLK9rI2NLnOccg0DwklZQ7d71ftB2s4/dO+51NU1RZRg/k07O8iGXrd60E9ZKvvyz757SthmKR082niONn0spcjzgSA6rvNGHjP1i5qzQQC9XsitKa+tpeA2pEHbuIVjWTub4WQjvpXeZjXHzLyitz2OiyvROMXBf1VDnHRxjDaJxHNqvyfKR1taGDxSFB8bsgdiQ4HeeC3dhtK2GixSkFHMGNyayaABrfFnHugD/4yqvrTblXWX28bEMcoYYdSvoGemNEAMzqQgkgdbmF7R1uWZKAWjfIevjtu2NUeHVU2/iNvP8AS+YE85iAzhd4tzvPHGVnIp95C189qe2qnweqm3MPuOP0DICe9E+e9C7x72bB7og0bQhCASJ+jKWkT9GUHVQhCAQhCBzVfxRqv4ptCBzVfxXLHOe4NccwU0nIOkCB7SZwVROyOWSJsEt+/aSHv6SQ4bWuA59N+b4ieoODx45ArfLyO2a0I782XXDaj2tMlfRubTl3gbO3v4neZ7WlBkqhLnikgmfBNG6OWNxY9jhkWkHIgjikILd9jlvN1Ni9w2JPNkyqjbiVI0nm32ZMlA6y0xnxMKupqv4rKPYhdzrF2r27c5eWQUlY0VWXrwP7yX/oc7z5LVdjmvYHscHNcMwQcwQgd1X8VUXsjV5Oiwa3bFgm76pldiVW0HI7jM2RA9RcZD42BW2WYnKmu/tz25XFiMUupR0s/oCkyOY04e8zHU5we73yCL0IXcwPDKzGsaocHw+Iy1ldUR01OwflSPcGtH7SEF6+x5WSMJ2Z4jeNXDlU49VacBI/8vCS0EeOQyfutVnHtaxpc0ZEL5di29R2lZuD2zQAehsMo46Vjsst/daAXHrJzJ6yvrT9GUDOq/ivHbcJHnYtfIJ/1cxD5tIvWrx+2/1Fr4/V3EPm0iDKRCEIJu5DYDuUpbwPg0az5tItJ9JnBZs8hn8ZW3vcaz5tItKUCNJnBUX7JI0N2gWsAP6qf8qVetUV7JN6oNq+Sn/KlBVFCEINK9q1vuuvkk1WEtZqSttynq4ABzmSCNkrQOs7mXnWai1ssGNkuzu34pGh7H4TTNc0jMEGFuYWWe0e332pf+P228EeluITUzCfymNeQ13nbkfOg8+tIuQ3cbLj5P8AhlPK/fqcGqJcOlzPPk078fmDJGD3qzdVuOxt3P6Hui57Qlk72tpI6+BpPMHRO3H5dZEjT7xBd3SZwWX3KyuUXRt/umrik3qejqvS+DI5gNgAjOXUXte73y0pv3H4bVsjG7kn3dPDKCaqIP5RYwuDfOQB51kPVzzVVVLVVEjpJpnmSR7vC5xOZJ86BpWJ5AFunFdtr8bezOLA8Plna4jMCWTKJo/dfIfMq7K9nY7bc9AbNscuaWPdlxbERDGSPvooG8x/fkkHmQRt2RxxdtPtwk/1L/35FVxWi7I16p1ueRf+/IquoBa/WXEztOwTm/q+D5NqyBWwNlfgbgnk+D5NqD6mkzgkva1jS5oyITqRP0ZQM6r+KrB2Qi+nYTs7w+yaWfKpx2fVqWg84poSHZHhvSbmX6DlZtZkcqu9+3rbZjeIQTamH0D/AEuoSDmNKIkFw6nPL3DqcEEVoQuxhlFVYliVLh1FC6aqqpmQQxt8L3uIa0DxkgILw9jpsgUNk4zfNXDlNi1R6EpHEf6CL74jqdISD7mFazSZwXwdmtr0tlWBgdq0m6Y8Moo4C5oy1Hgd+/3zi53nXoUFDOyI2QMI2g4XetJDu02N02hUuA8FRCAAT+lGWAfoFVaWnvK5snt42F45SQQ6lfhrPTOiyGZ34QS4DrdGZGjrcFmEgFYrZPyrrpsKwsNtLteoMWiw5ro4Kieoex+mXEtaQAR3ueQ6gFXVCC2fdu3P+Y+E/DJPoR3btzHmdY2Ekf75J9CqYhBbLu2ri/MPCPhkn0I7tq4vzDwj4ZJ9CqahBbLu2ri/MPCPhkn0Lnu27jHO2xMJB/3yT6FUxCC2fdu3P+Y+E/DJPoR3btz/AJj4T8Mk+hVMQgtn3btz/mPhPwyT6Ed27cx5nWNhJH++SfQqmIQei2k3Ky8b6xa6WYXDhZxOoNRJTQvL2NkcBvkEgHvnZu8ZXnUIQC0h5Ed4C6dg2H0s0u/XYDK7DZczz7jcnRHLhpua33hWbyst2Pm8fSXalX2nUS7tNcFGdJpPN6Ihze39rDL58kF+dV/FGq/im18S/riprSsnGbmq8jDhlFLUlpOW+WtJa3xuOQHjQUA5bl4m6tu2I0kUu/R4FE3DYsjzb7c3SnLjqOc33gUHLsYnW1OJYlVYjWymWqqpnzTSHwve4lzj5ySuug5a0ucGtBLicgAOcrVvYHZMdh7Irdtp8QZVQUjZKziaiTv5PHk5xA6gFn5ySbL7d9uuA0U0WpQ4fJ6ZVmYzGnCQ5oPU6TTaf0lp+gRpM4JL2tY0uaMiE6kT9GUFZeyKPc7YjhIJ/wBY4Pm9SqCK/PZEvUSwn9YoPm9SqDIBXS7Gnz4dfDT4DNRZ/uzqlqul2NL/ACC9/dqL+GdBcPSZwRpM4JaEGV/KeAHKBvYD2Vk/ko3Ukcp/8YK9vKsn8lG6CR+TISNv9lEeysf81Z3sjVvGusa3LpYzekw2vfSSkDnEczMwT1B0QHvlWHky+r9ZflWP+a0A5S9udtWwu7MKbHvzNoHVUAA5zJCRK0DrO5l50GXK7GG1lRh+I01fSSGOoppWzRPH5L2kEH9oC66EGwFn4tSXJaeEXDSAaGJ0UNXGAc8hIwOy82eSTeuL0tsWfjNx1IGjhlDNVvBP3wjYXZefLLzqH+Qjc/bBsBoaGSTfqMEq5qB+Z593PUZ5t2QNH6KTy8rm9IdgVZh8cm7UY5WQ0Lcjz7gOq8+LKPdP6SDOmuqp62tnraqQyT1EjpZXnwuc45k/tKZQhBezsdVvOw7ZvjtzPZuy4tiAgYSPDFA3mP78kg96qpco4k7eb3J9mqn+MrQ/k8252qbFLTwV0enNHhzJp25c4llzleD4nPI8yzw5Rvq8Xt5aqP4yg8ApP5KYB5Q9lg+yH9xyjBSfyUvxiLL8oD+ByDUbSZwRpM4JaECNJnBJe1rGlzRkQnV8HaJclHaFj4zc9eR6HwykkqHNzy3y0d6wdbjk0dZCCiXL6vl1ybWYbYppt+ityDScAeY1MmT5D5gI29Ra5VyXdx3E6zGsbrsYxGUzVldUSVNQ8/lSPcXOP7SV0kAtSuTRZpsXY1b2ATRadY+n9F1wIydry9+4HrbmGe9CoByZLM7ettWAYPNFqUME/o2uBGbdGLvyD1OIaz361Eg6QIHjDGQQW5g+ELKrlEWUdn+2K4bcjiMdGypM9Dzc3oeXv4wOO6Du+NpWrCp92R6ydbC7f2gUkOb6Z5wyucBz7js3xE9QdqDxvCClCeoaqooa2CtpJnw1FPI2WKRhycx7TmCOsEAplCDWTZHekV+bNsCuuBzAa+la6djfBHMO9lZ5ntcPMvV6r+Kpz2Oy+N6LHNntZNztPpnQBx9Y5MmaP/zcB1uKuEgc1X8VyxznuDXHMFNJyDpAge0mcEaTOCWhAjSZwQloQdJCEIBOQdIE2nIOkCDsoQhBmdyzbL7TdvGMaEWnQ4zlilNkOb7qTqDzSCTm4EKGFfjsiFl+m+zPDbxpot6pwGq053Af+XmIaSfFII8v0nKg6AWm3JPvDtz2F4BWyy6lbQR+ltXmczvw5NaT1lmm4/pLMlWv7HXeHoO6sesiplyixGAV1I0nm1Yu9eB1uY4HxRoLU7cbtFjbJrjuZsgZPS0Tm0p/+d/eRf8AW5vmzWVDiXOLnEkk5kn11dTsi93+h8Ct6x6eXJ9ZM7EatoPPpszZGD1FznnxsCpUgFYXkE2X2y7am47URb9FblOaskjNpnfmyIePne8e5qvS0X5Btl9rGxKLGqiLcrriqHVriR3whb3kQ8WQc8e6ILApE/RlLSJ+jKDqrx+2/wBRa+P1dxD5tIvYLx+2/wBRa+P1dxD5tIgykQhCCb+Qz+Mrb3uNZ82kWlKzW5DP4ytve41nzaRaUoBUV7JN6oNq+Sn/ACpV6lRXsk3qg2r5Kf8AKlBVFCEINbtnn4AW75KpfkmqiXL1tz0m26SYrHHuw43QQ1WYHNqMBicPHlG0n9JXt2efgBbvkql+Saq69kXtz0ZYdvXRFHnJhte+llIHgjmZnmeoOiaPfIKNqTOS5c/ant6tTFHyblPLWiiqCTzac4MRJ6gXh3vVGaVFI+KVksb3Mexwc1zTkQR4CEGivL4ub0i2DT4XFJuz47XQ0YAPPptOq8+L7mGn9JZ0KxHLQ2ksvyPZ9HTytcxuAR4lUtaeZlRUZb7D1t0h+8q7oBan8nu3O1PYpamCOj05o8OZNO3LnEsv3WQeZzyPMs2Nk1uG7dptuW3uF8dfiMMUwHrRbwMh8zA4+ZaxgAAAAADwAIKLdka9U63PIv8A35FV1Wi7I16p1ueRf+/IquoBbA2V+BuCeT4Pk2rH5bA2V+BuCeT4Pk2oPrpE/RlLSJ+jKCL+Ule/aBsbx3HYZdOvkh9CUBByOvL3rSOtozf4mFZdK1nZD739H3bg9h0k2cOFRejKxoPMZ5Rkxp62x8//ABVVNAKeuQvZfbTtxpMUqIt+ht6I18hI5jN97CPHvHfHuZUCrs0VfXUReaKsqKbfy3tGVzN7LwZ5Hn8JQbHoWPPp9jns1iPwp/0o9Psc9msR+FP+lBsK4BzS1wBBGRB9dZS8oOyjs/2wXDbTIiykiqjNRc3MaeTv4wOOTXBp62leU9Psc9msR+FP+ldOrqqqsl1qupmqJMst+V5ccuGZQMoQhB7yzNj20m8sCjxy2bXqMSw6R7mNminiA3mnIggvBB8Y4L7Q5Om2onIWFXZ/7xB9dS92O6+PQmO41s/rJsoq5nphQtJ5tVgDZWjrczdPijKu3B0gQZkdzhts/MGu+EQfXR3OG2z8wa74RB9dagIQZf8Ac4bbPzBrvhEH11weTltrAzNg12X+8QfXWoKRP0ZQZf8Ac67afzDrvhEH10dzrtp/MOu+EQfXWmyEGZPc67afzDrvhEH11yOTptqJyFhV2f8AvEH11pqnIOkCDMjucNtn5g13wiD66jPHMLxDBMYrMHxWlkpK+imdBUQSffRyNOTgfOFsYs+eyCWX6QbXae6KaLdpLipRI8gZD0REAyQeduk7rLigravsWRj9Xat4YRclCT6IwysiqmDPLe3HAlp6iMweor46EGwODYjSYvhFFi1BKJaStp2VEDx+Ux7Q5p84IVc+yDXf6T7LKC1YJd2ox6sBlaD4aeDJ7v8ArMX7Cvu8hi8O2XYjT4VPLv1lvzuoXgnvjEe/iPi3XFg9zVYOW9d/bPt0r6GCXfo8BhZh0eR5tQZulPj33Fp/QCCDEIT+H0dTiGIU9BRxOmqamVsMMbfC97iA0DxkhBeTsc9l+l9kYzfFVFlNi9QKSkcRz6EP3xHU6QkH3MK1q87sytemsrZ9gdqUu6WYZRRwOc0c0kgGb3++eXO869EgEifoylpE/RlBWPsiXqJYT+sUHzepVBlfnsiXqJYT+sUHzepVBkArpdjS/wAgvf3ai/hnVLVdLsaX+QXv7tRfwzoLjIQhBlfyn/xgr28qyfyUbqSOU/8AjBXt5Vk/ko3QSNyZfV+svyrH/NahysZLG6ORoex4LXNIzBB8IWXnJl9X6y/Ksf8ANaioMlNpFvvtTaBj9tvDh6W4hNTMJ/KY15DXeduR868+rA8va3PSbbm/Fo492HG6CGqzA5tRgMTh48o2k/pKvyC2XY3rn9CXpclpTSZMxGiZWwgnm1IXbrgOstlz94uOyQ3N6Lve27SikzZh1C+smAPNqTO3QD1hsWfv1CfJpuftR26WnjD5NOA17aWoJPMIpgYnE9QD97zI5S1zdt23S7MYZJqQej3UtOQeYxQgRNI6iGZ+dBHS9Psnt03btMty29wvjxDEYYpgPWi3gZD5mBx8y8wrGdj+tv0220z45JHnDgeHSzNdl4JZcomj910h8yC/4AaAAAAOYALLPlG+rxe3lqo/jK1MWWfKN9Xi9vLVR/GUHgFJ/JS/GIsvygP4HKMFJ/JS/GIsvygP4HINSUIQgFVHsi18el1mYRYVJNlPi83oysaDziniPeA9TpMiPcirXLLLlOXx/SBtpx7G4ZtWghm9BUBBzboRZta4dTjvP9+gjRCEILtdjssz0HbWO33VRZS4hKKCjcRz6UffSEdTnlo8catrB0gWPtNi2KUsLYKbEqyGJue6yOdzWjPn8AKc9Pcc9mcR+FP+lBsOvJbY7Qhv3Zhj9pyhu/X0bm07neBk7e+id5ntaVlN6fY57NYj8Kf9KPT7HPZrEfhT/pQdGphmpqiWnqI3RTRPLJGOGRa4HIgjiCm0qR75Hukkc573ElznHMkn1ykoPX7GrxmsHabgV1xF+nRVTfRLW+F8Du9lb4yxzsuvJasUs8NVTRVNNK2WGZgkjkacw5pGYIPAhY8LRfkR3x23bFqTDaqbfxG3n+l8oJ5zEBnC7xbnef8ADKCdE5B0gTacg6QIOyhCEAhCECNJnBGkzgloQI0mcEl7WsaXNGRCdSJ+jKBnVfxRqv4ptCD5N9YFTXbZuMWzX5ehsTo5KZ5yz3d5pAcOsHIjrCyWxvDavB8ZrcIxCIxVlDUSU87D+TIxxa4ftBWv6z05dtm9re2h+N08W5RXDTiraQMmiduTJR4+Zrz7ogr+vV7ILsksfadb91MLgzD61j5w3wuhPeyt87HOHnXlEIJS5VN5xXztwx/FKOobPh1LIKChe12bTFF3u80+uHP33j9JRahCD7dh27V3bemD2zRZ6+J1kdM1wGe4HOALj1NGZPUFrTg1HT4RhFFhNBGIaOip2U8EY8DI2NDWjzABUZ7HtZvprtFxO8amLOnwOl0qdxH/AJiYFuY8UYkz/TCvagc1X8VyxznuDXHMFNJyDpAge0mcF47blGwbFL6IH+rmIfNpF7ReO25+onfX6uYh82kQZMIQhBNvIfJbykbeI8OjV/NpFpFqv4rNzkQfjIW/7jV/NpFo+gc1X8VRrskDi6/7WJP9VP8AlSrwqjvZHfw/tfyU/wCVKCqyEIQa77OomHZ9bhy/qql+SavL8pm2G3RsJu3CmRb8woHVUAHhMkJErQOslmXnXq9nXqfW55Kpfkmr7NUxklO+ORocxwyc0jMEH1kGNiF6HaXbz7U2hXBbbmkDDcQmp2Z/lMa8hjvO3I+deeQKfI+Td33udut3W5nPIcB1JKEILH9j4tkYxtrnxyWPOHA8Okla7LwSy5RNH7rpT5loNpM4KsHY5ra9Ltl2NXNLHuy4xiWkw5ffQwNyB/ffKPMrRIKG9khaG7ULcA9hf+/Iqsq0/ZI/VRtvyJ/35FVhALXizJX9p+C8/wDV8HybVkOtdbM/A/BfJ8HybUH2tV/FdTGMVpMJwitxbE5hDRUVPJU1Eh8DI2NLnHzAFPqu/L0vftc2Rstqlm3K6459AgHIimjydKfOdNvieUFGdoNy1l43vjN0V2YnxOskqC0nPTaT3rB1Nbk0dQXwkIQCFOXJS2F0+2GqxyfFsSrcNwvDGRsbLTNaXSTPJIb3wIyDWkn9JqnmTkS2U1pIvG4f3IfqoKKIV5u4qsv877g/ch+qjuKrL/O+4P3IfqoKMoV5u4qsv877g/ch+quY+RRZbnAG8Lg/ch+qgowhSzyoNkQ2QXxSYTR1lTX4XXUYqKWpnaA4uBLZGHLmzBAPicFEyD0Oza6Kuyr8wW6qLMy4bVsnLActRgOT2eJzS5vnWtGFV1FimDUeL4bK2akrIGVFPK3wPje0OafOCFjspBt/bXtUwDBKXBMHvbE6TD6SPTp4GlpbG31mjME5INTtV/FGq/isv+6A2yfn/in7I/qo7oDbJ+f+Kfsj+qg1A1X8VyxznuDXHMFZfd0Btk/P/FP2R/VQOUDtlBzF/wCKg+KP6qDUbSZwRpM4LLvuhNs/tg4r+yP6qO6E2z+2Div7I/qoNRNJnBJe1rGlzRkQsve6E2z+2Div7I/qrg8oPbORkdoGKkeKP6qDT/VfxUG8ty0HXbsNr62GLUrcAkGJQkDn02gtmHi3HF3vAqY90Btk/P8AxT9kf1UzWbd9rtZSTUdVfOIzU88bo5Y3tjLXscMi0jd5wQckEbIQhBOfI62oUmza7sfdi0gGG12DzybhdkHVFOx0sQ8bgJGDiXhQritdVYpilXiddKZaqrnfPO8+Fz3uLnHzkldZCAU68h+zDdO3GixGeLforfiOIykjm1QQ2EePfcHD9AqCloNyBLL7X9jc9zVMW5WXHVGVpIyPoeIlkY/e1HeJwQWJ1X8Uar+KbQgc1X8VyxznuDXHMFNJyDpAgrf2RljW7EMIIH+scHzapVAFoD2Rv1D8I/WOD5tUrP5AK6XY1ebCb6cPCJqHL92dUtV0uxrf5nvv3ah/hnQW91X8Uar+KbQgy75ThJ2/3qT7KyfyUcKRuU36v16eVZP5KOUEkcmEA8oGyQfZWL+a1N0mcFllyYPxgrJ8qxfzWqCCqXZHbYbVWBbt0wx5yYZiDqWUgeCOdmeZ6g6Jo98qKLVPlL2322bCbtwhsepMMPdVQADnMkJErQOslmXnWViDlrnNcHNcWuBzBByIKHuc9xe9xc5xzJJzJK4QgFfHsdNuegNmmNXHLHuyYxiIiYcvvooG5A/vySDzKhy1V5PNudqexu08DdHpzQ4dHLO3LwSy/dZB++9yCQNJnBZVcpAAbe74A9mqn+MrVhZUcpH1fL48t1P8ZQR8pO5KxI5QtmEeyH9xyjFSbyV/xhbM8of3HINQtV/FGq/im0IIx5U99vsTYpjeJQz6WIVsfpfQkHI6soI3h1tZvv8AerMJWg7IRe/ptf8Ahtk0k2dNgkGvVAHmNRMAQD+jHuZfpuVX0AhCtbyfeSrhV/7L8Pu64sexXDZ8RfI+ngpmR5aLXbrXHeBOZLXHxEIKpIV7e4jsn88bh/ch+qkyciWymtJF43D+5D9VBRRCvN3FVl/nfcH7kP1UdxVZf533B+5D9VBRlCvN3FVl/nfcH7kP1VTbaDbVZZ174za9dmZ8Mq5KcuIy32g968dTm5OHUUHwlPnIYvhtqbaqfB6uXcw644/QEgJyaJ896B3j3s2D3RQGnqKpqKKsgrKSZ8NRBI2WKRhycx7TmCOsEAoNj9JnBJe1rGlzRkQvMbH7xp7+2Z4DdsBYHV9I107G+COZveys8z2uHiXqZ+jKBnVfxRqv4ptCBzVfxQm0IO6hCEAkT9GUtIn6MoOqhCEAoB5ddmdsuxaTGqeLfrbenFY0gZuMDu8lHiyLXn3NT8uvimHUmMYXWYRiEQmo62nkpp4z+VG9pa4ecEoMfEL7d+W7V2jemM2xXZ+iMMrJKZzsst8NcQHDqcMiOor4iAQhew2L2hJfe1K37Wa1zoq2rb6JLfC2Bvfyn9xrvPkgv3yPrN7TdheDMni067FwcUqsxz5ygaYPijEfNxzUwJMUccUTIomNZGxoa1rRkGgeAAJSATkHSBNpyDpAg7K8dtz9RO+v1cxD5tIvYrx23P1E76/VzEPm0iDJhCEIJs5EH4yFv+41fzaRaPrODkQfjIW/7jV/NpFo+gFR3sjv4f2v5Kf8qVeJUd7I7+H9r+Sn/KlBVZCEINetnXqfW55Kpfkmr7c/RlfE2dep9bnkql+Savtz9GUGdvL3tz0m25OxeOPKHG6CGpLgObUYDE4ePJjCf0lXxXm7Itbno3Z/b90RR5yYZXuppCB4I52Z5nqDomj3yoygEIXrNjtt9t+1S2bbLN+KuxKGOcZf6EODpD5mBxQaY8n22u1HYraeAuj05ocNjknbl4Jpfusg/fe5e7QOYZBCCh3ZI/VRtvyJ/wB+RVYVp+yR+qjbfkT/AL8iqwgFrrZn4H4L5Pg+TasilrrZn4H4L5Pg+Tag+ss3eWbe/bltvxKCnm1MPwMellNkeYuYSZXeeQuGfrhrVe/bfeUdgbK8eukuaJ6WlLaQH8qof3kQy9cbzgT1ArKqaSSaZ80r3SSPcXPc45lxPOSTxQIQhe32EWa6/trVvWuWF9PVVbX1eXrU7O/l5/W7xpA6yEGgfI/srtJ2E4JBPDp1+KtOKVeYyO9MAWA8CIxGCOIKlufoylMa1jGsY0Na0ZNaBkAOCTP0ZQdVCEIBOQdIE2nIOkCCBuXlY/bTsXkx2lh36+25vRjSBm4wOybM3xZbrz7ms6VshilDS4nhlVhtdC2ekq4XwTxu8D2PaWuafGCQsktptq1VkbQMctOs3jJhlY+Fr3DIyR55sf75ha7zoPOIQhAIVidkHJgn2k2DQXbhl9UVPHVb7JKd9A5z4JGOLXMJD+fwZjiCD669d3EmM+2BQfFz/roKkIVt+4kxn2wKD4uf9dcs5EeMudl/SBQfFz/roKjoVvO4dxr2wsP+LX/XR3DuNe2Fh/xa/wCugqGhW87h3GvbCw/4tf8AXXD+Q/jTW5/0g4f8Wv8AroKiIVt+4kxn2wKD4uf9dHcSYz7YFB8XP+ugqQhWhvDkdXBgVq4pjdLd9HiUtBSSVLaRlC5jptxpcWtO8ecgHLm8Kq8gEIQg+paWCVty3RhdvYc3eq8Sq4qWHm5g57g0E9QzzPUtcLfweit62MOwHDmblHh1LHSwN/8AYxoaM+vIKiHY+LL9PdrVVdVTFvUlu0pdGSOb0RMCxn7Gap6iAtAJ+jKDqoQhAJyDpAm05B0gQVx7I36h+EfrHB82qVn8tAeyN+ofhH6xwfNqlZ/IBXS7Gt/me+/dqH+GdUtV0uxrf5nvv3ah/hnQW5QhCDLrlN+r9enlWT+SjlSNym/V+vTyrJ/JRygkjkwfjBWT5Vi/mtUFlfyYPxgrJ8qxfzWqCDiRjJI3RvaHMcCHNIzBB9ZZF7TrdfaW0S4bac0gYbiM1PHn+UxryGO87cj51rqs7+yAW36TbdTjEceUOOYfDUlwHNqMBicPHlGwn9JBXdCEIPVbIbcN3bULbtws3467EYY5h/8AFvAyHzMDj5lrJAAHgDmCz+7H5bnprtmqcdkjziwTDpJGOy8Esv3No/cMv7FoFB0gQdlZUcpH1fL48t1P8ZWq6yo5SPq+Xx5bqf4ygj5SbyV/xhbM8of3HKMlJvJX/GFszyh/ccg0+Xz7lxiit63sRx3EpNOjw+lkqZ3cGMaXHLryC+gq2cv+9/SLZhSWjSzbtZcFR91APOKaIhzvFm8xjrG8go9eeP1t03ZityYi7OrxKrkqZBnmGl7id0dQHMOoBfIQhB9ezMArbpu3Cbbw4Z1WJ1kVLEcsw0vcBvHqGeZ6gtcrdwmiwC38PwPDo9Ojw+ljpYGcGMaGt/8AoKiXY87K9OtqNfd9TDvUtv0uUJI5vRMwLW+PJgk8RLVfxAJE/RlLSJ+jKDqoQhAKj3ZDrJ9L7wwi+6SHKDFYfQdY4DmE8Q7wnrdHzf8ACV4VG/KXsjt/2M49gsMOrXww+jaAAZu14s3Bo63DeZ79Bl4hCEFzuxx31mzHdndZNzt/8Tw8OPrczJmj/wDNwHW4q48/RlZNbGLyn2f7T8BuyIv06GqaaljfC+B3eyt8ZY52XXktYI6iCroY6qmlZLBMxskcjDm17SMwQeBBQNIQhAIQhA5qv4o1X8U2hA5qv4rljnPcGuOYKaTkHSBA9pM4I0mcEtCBGkzgkva1jS5oyITqRP0ZQVQ5TvJquPaPtLdd1p4jgVG2rpI2VzK+aVjnTMzaHt3I3AgsDBz5c7VFvcYbUfZ6zvhdT9gr7oQUI7jDaj7PWd8LqfsFM/JN5PGObLrxxK47rrsGramSjFLQiglkkEYc7ORzt+NmRya0DLPmLvB69kE5B0gQPaTOCNJnBLQgRpM4JL2tY0uaMiE6kT9GUDOq/ivgbRsKrbk2e3JbtFLDHVYphNVRQvmJEbXyxOY0uIBIbm4Z5AnL1ivtoQUI7jDaj7PWd8LqfsEpvIv2oudkMes34ZU/4dX1TkHSBBU7k48mK/NnO1zCrux3FraqaCkjnbJHR1M75SXwvYMg6Fo8Lhnz+BW30mcEtCBGkzgq3crjYJd21i5sGxW2sRwKkgoKJ1PK2vnlY4uLy7Nu5G8ZZH1yFZRIn6MoM/u4w2o+z1nfC6n7BHcYbUfZ6zvhdT9gr7oQdC1KSpwm18JwuofG6ajooaeR0ZJaXMYGkjMA5ZjgvqMc57g1xzBTScg6QIPH7c7FO0PZTjto076eGqroG+hZJyQxkzHtewuIBIG80AkAnInmKpz3FW1P2fsz4ZU/4dX/AEIKAdxVtT9n7M+GVP8Ah1JvJn5Mt2bNtqEN33Tidv1cFHSTNpWUE80kgmeAzMh8TAG7jpOfPPMjmVskifoygZ1X8Uar+KbQgrfystg947W7ywnGbexLAqWCjw/0LI2vnlY8u1HuzAZG8ZZOHrqGm8i/ai52Qx6zfhlT/h1fVOQdIEFCe4q2p+z9mfDKn/Dq91vYc7D8Aw6gnLHS01LFC8sJLS5rADln62YX0UIIN5Wmyu+dq+A4PgFqYjgdDh9PUPqq30wqJWOlkDd2MNDI38wDpCc/XI4KuLuRXtTa3M4/Znwyp/w60ASJ+jKDP7uMNqPs9Z3wup+wU18k3k/Y3soubF7huiuwesrZ6VtLRegJJJBGwu3pC7fYzIndYBlnzbysYhA5qv4rljnPcGuOYKaTkHSBA9pM4I0mcEtCBGkzgkva1jS5oyITqRP0ZQM6r+KrFyqOTnj20++qS6rUr8Fop30YgxBtfLJHqOYe8e3cjfmd07pzy5mt8KsyhBQjuMNqPs9Z3wup+wSm8i/ai52Qx6zfhlT/AIdX1TkHSBBB3JJ2S35smoMbwa6cSwKuwutlZU0raCome6KYDdfmHxMGTmhngP5HWp30mcEtCBGkzgkva1jS5oyITqRP0ZQM6r+KNV/FNoQOar+K5Y5z3BrjmCmk5B0gQPaTOCNJnBLQgbMMZBBaCDzEFUXvHkY3zNdGK1Nu41a0ODS1cj6GKoqZ2yxwlxLGuDYSMwCBzE+BXsSJ+jKDP7uMNqPs9Z3wup+wR3GG1H2es74XU/YK+6EEWcl3ZfVbJdnL8ExKeiqcXq6ySqrZqRznRk8zWNa5zWuIDWg84HO53jUsMc57g1xzBTScg6QIHtJnBGkzgloQI0mcEl7WsaXNGRCdSJ+jKCHOVbs1uDaxs6obct+sw2lqqfFo61z6+R7IyxsUzCAWMcd7OQetllnzqsPcYbUfZ6zvhdT9gr7oQUI7jDaj7PWd8LqfsFYXkg7HLn2R0tx09y12D1ZxWSndD6XyyPDRGJAd7fjZl9+Mss/XU5JyDpAge0mcEaTOCWhBS3bFyTtol47ULhujC8ZtWGixKtfUQR1NVUNka0+AODYSAfESvIu5Fe1Nrczj9mfDKn/DrQBIn6MoKV7HeSttDs3ahb10YljNrS0eGVrKiZlPUzukc0es0OhAJ8ZCudqv4ptCBzVfxUGcrXYxjW2HDcA7XqzC6TEsLmlzfXyPYx0MjW5gFjHnMOY3IEZc551N6cg6QIKE9xVtT9n7M+GVP+HR3FW1P2fsz4ZU/wCHV/0IIO5JOxbFdkVu43DcVXhlXimJ1bHF9BI98YhjZkwEvY0728+TmyyyI51Nj2tY0uaMiE6kT9GUDOq/iqWbWeSltEu3aZcVzYdjVqxUmJ4hLVQsqKqdsjWvcSA4NhIB8RKuehBQjuMNqPs9Z3wup+wXstiXJX2g2ZtWt66cVxi15qLDqrWmjpqmd0rm7pGTQ6EAnn9chXFTkHSBA9pM4KqPKX5O+07artOnuGgxm16bCYaeOlw+Cpq6gSMjaM3FwbCQCXueeYnmy4K2KEFAO4q2p+z9mfDKn/Drh3Ir2ptbmcfsz4ZU/wCHWgCRP0ZQRRyY9mdRsn2aMwCvno6jFaiqkqq6alLnRuecmtDS5rXEBjW+EDn3lKOq/im0IHNV/Fcsc57g1xzBTScg6QIHtJnBGkzgloQI0mcEl7WsaXNGRCdSJ+jKCj20bkfXlid941iVrYtbFNg1XWPnpIKqonZJE153twhsLgA0kgZE8wC8/wBxhtR9nrO+F1P2CvuhBQjuMNqPs9Z3wup+wVxdhGAXTauzDBrWu+rw+sxDDIjTNmopXvjfC0/chm9jTmG5N8H5IXsk5B0gQPaTOCNJnBLQgRpM4IS0IOkhCEAnIOkCbTkHSBB2UIQgEifoylpE/RlB1UIQgE5B0gTacg6QIOyhCEAkT9GUtIn6MoOqhCEAnIOkCbTkHSBB2UIQgEifoylpE/RlB1UIQgE5B0gTacg6QIOyhCEAkT9GUtIn6MoOqhCEAnIOkCbTkHSBB2UIQgEifoylpE/RlB1UIQgE5B0gTacg6QIOyhCEAkT9GUtIn6MoOqhCEAnIOkCbTkHSBB2UIQgEifoylpE/RlB1UIQgE5B0gTacg6QIOyhCEAkT9GUtIn6MoOqhCEAnIOkCbTkHSBB2UIQgEifoylpE/RlB1UIQgE5B0gTacg6QIOyhCEAkT9GUtIn6MoOqhCEAnIOkCbTkHSBB2UIQgEifoylpE/RlB1UIQgE5B0gTacg6QIOyhCEAkT9GUtIn6MoOqhCEAnIOkCbTkHSBB2UIQgEifoylpE/RlB1UIQgE5B0gTacg6QIOyhCEAhCECNJnBGkzghCA0mcEl7WsaXNGRCEIG9V/FGq/ihCA1X8VyxznuDXHMFCEDukzgjSZwQhAaTOCS9rWNLmjIhCEDeq/ijVfxQhAar+K5Y5z3BrjmChCB3SZwRpM4IQgNJnBJe1rGlzRkQhCBvVfxRqv4oQgNV/Fcsc57g1xzBQhA7pM4I0mcEIQGkzgkva1jS5oyIQhA3qv4o1X8UIQGq/iuWOc9wa45goQgd0mcEaTOCEIDSZwSXtaxpc0ZEIQgb1X8Uar+KEIDVfxXLHOe4NccwUIQO6TOCNJnBCEBpM4JL2tY0uaMiEIQN6r+KNV/FCEBqv4rljnPcGuOYKEIHdJnBGkzghCA0mcEl7WsaXNGRCEIG9V/FGq/ihCA1X8VyxznuDXHMFCEDukzgjSZwQhAaTOCS9rWNLmjIhCEDeq/ijVfxQhAar+K5Y5z3BrjmChCB3SZwRpM4IQgNJnBJe1rGlzRkQhCBvVfxRqv4oQgNV/Fcsc57g1xzBQhA7pM4I0mcEIQGkzgkva1jS5oyIQhA3qv4o1X8UIQGq/iuWOc9wa45goQgd0mcEaTOCEIDSZwSXtaxpc0ZEIQgb1X8Uar+KEIDVfxXLHOe4NccwUIQO6TOCNJnBCEBpM4JL2tY0uaMiEIQN6r+KNV/FCEBqv4rljnPcGuOYKEIHdJnBGkzghCA0mcEl7WsaXNGRCEIG9V/FGq/ihCA1X8VyxznuDXHMFCEDukzgjSZwQhAaTOCS9rWNLmjIhCEDeq/ijVfxQhAar+KEIQf/Z"}
            alt="VIMA VIMA"
            style={{
              height:64,
              filter:C.isDark?"invert(1) brightness(1.05)":"none",
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
 