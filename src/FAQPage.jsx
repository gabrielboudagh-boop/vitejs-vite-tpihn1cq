import { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext.jsx";
import BrandLogo from "./BrandLogo.jsx";

function SEO({ title, description }) {
  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [title, description]);
}

function Footer({ T }) {
  return (
    <footer style={{borderTop:`1px solid ${T.border}`,padding:"28px 24px",textAlign:"center"}}>
      <div style={{fontSize:13,color:T.muted,marginBottom:8,display:"flex",gap:20,justifyContent:"center",flexWrap:"wrap"}}>
        <a href="/" style={{color:T.muted,textDecoration:"none"}}>Home</a>
        <a href="/blog" style={{color:T.muted,textDecoration:"none"}}>Blog</a>
        <a href="/about" style={{color:T.muted,textDecoration:"none"}}>About</a>
        <a href="/faq" style={{color:T.muted,textDecoration:"none"}}>FAQ</a>
        <a href="/contact" style={{color:T.muted,textDecoration:"none"}}>Contact</a>
        <a href="/terms" style={{color:T.muted,textDecoration:"none"}}>Terms</a>
        <a href="/privacy" style={{color:T.muted,textDecoration:"none"}}>Privacy</a>
      </div>
      <div style={{fontSize:12,color:T.muted+"66"}}>© 2026 Vima Vima · Built for serious exam prep</div>
    </footer>
  );
}

function Nav({ T, isDark, setIsDark }) {
  return (
    <nav style={{position:"sticky",top:0,zIndex:100,background:T.surface+"ee",
      backdropFilter:"blur(12px)",borderBottom:`1px solid ${T.border}`,
      padding:"14px 32px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <a href="/" style={{display:"flex",alignItems:"center",textDecoration:"none"}}>
          <BrandLogo dark={isDark} height={30}/>
        </a>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:18}}>
        <a href="/blog" style={{fontSize:13,color:T.muted,fontWeight:500,textDecoration:"none"}}>Blog</a>
        <a href="/about" style={{fontSize:13,color:T.muted,fontWeight:500,textDecoration:"none"}}>About</a>
        <a href="/faq" style={{fontSize:13,color:T.muted,fontWeight:500,textDecoration:"none"}}>FAQ</a>
        <button onClick={() => setIsDark(!isDark)} style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,
          padding:"7px 14px",color:T.text,fontSize:13,fontWeight:600,cursor:"pointer",
          fontFamily:"'DM Sans',sans-serif"}}>
          {isDark ? "☀️ Light" : "🌙 Dark"}
        </button>
        <a href="/app" style={{fontSize:13,color:T.text,fontWeight:500,textDecoration:"none"}}>Sign In</a>
      </div>
    </nav>
  );
}

const FAQS = [
  {q:"What is Vima Vima?",a:"Vima Vima is a question tracking and analytics platform for serious exam prep. Log every practice question you encounter, get AI-powered insights into your mistake patterns, and automatically generate Anki flashcards from your weak spots. Built for USMLE, MCAT, and LSAT students."},
  {q:"Is Vima Vima free?",a:"Yes. Core features — question logging, performance analytics, session tracking, and Anki card generation — are completely free. Create an account with an email address or Google sign-in and get immediate access. There's also an interactive demo on the homepage that requires no account at all."},
  {q:"Which exams does Vima Vima support?",a:"Vima Vima supports three exam tracks: USMLE (Step 1 and Step 2 CK), MCAT, and LSAT. Each track has its own subject taxonomy and question-type categories that match the actual structure of those exams. USMLE subjects include Cardiology, Neurology, GI, Renal, Pulmonology, and others. MCAT tracks C/P, CARS, B/B, and Psych/Soc. LSAT tracks Logical Reasoning, Analytical Reasoning, and Reading Comprehension separately."},
  {q:"How does the question logging work?",a:"After each practice block, open Vima Vima and log each question you want to track. The wizard walks you through 8 quick reflection fields: correct or incorrect, time taken, did you change your answer, why you got it wrong (if incorrect), confidence level, and the concept tested. Most students log questions during the review phase of a block, which takes about 30–60 seconds per question."},
  {q:"What is the AI study insight feature?",a:"As you log questions, Vima Vima analyzes your performance patterns and surfaces personalized insights — not generic study advice, but data specific to your gaps. For example: 'You get Cardiology questions right when they're about pathophysiology, but miss 60% of management questions' or 'You change answers to wrong 4 times per session — this timing strategy needs a rethink.'"},
  {q:"How does the Anki export work?",a:"When you log an incorrect answer, you can flag it for Anki export and optionally fill in a front and back field (or let AI draft them based on your concept tag). Vima Vima compiles all flagged questions into a real .apkg file (Anki's native format) that you import directly into Anki desktop or AnkiDroid in one click. Cards come from your actual wrong answers, targeting your specific gaps rather than a generic pre-made deck."},
  {q:"Can I use Vima Vima on my phone?",a:"Yes. Vima Vima is fully mobile-responsive. You can log questions on your phone during or after a practice session. The analytics dashboard is also fully functional on mobile, though the larger screen view is recommended for detailed analysis."},
  {q:"Is my data private and secure?",a:"Yes. Your study data — wrong answers, session notes, Anki card drafts — is stored securely and is never sold to third parties. You can delete your account and all associated data at any time by emailing vimavimasupport@gmail.com. Vima Vima uses Supabase for authentication and storage, and Google AdSense to display ads on public pages."},
  {q:"How is this different from just using an Excel spreadsheet?",a:"A spreadsheet requires you to design your own structure, build formulas, and manually create charts. Vima Vima provides structured data entry with consistent reflection fields for every question, pre-built analytics that surface patterns across hundreds of questions, and Anki export — no configuration needed. Because every question is logged in the same schema, the system can identify patterns like 'you get Cardiology Diagnosis questions right but miss Cardiology Management 60% of the time' — something a spreadsheet would never surface automatically."},
  {q:"Who built Vima Vima?",a:"Vima Vima was built by a medical student who spent years tutoring MCAT students, then entered medical school and discovered the same problem students had — no good way to track mistakes and understand patterns across hundreds of practice questions. Read the full story on our About page."},
  {q:"How do I cancel my account?",a:"You can cancel anytime by emailing vimavimasupport@gmail.com. Your account will be deleted and all associated data will be permanently removed."},
  {q:"I'm getting a connection error at school/hospital — what do I do?",a:"Some institutions have network restrictions that block certain domains. Try using a mobile hotspot or accessing Vima Vima from a different network. If the problem persists, email vimavimasupport@gmail.com with details about the error message."},
];

export default function FAQPage() {
  const { isDark, setIsDark, theme: T } = useTheme();
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    document.body.style.background = T.bg;
    document.body.style.color = T.text;
  }, [T]);

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'DM Sans',sans-serif"}}>
      <SEO title="FAQ | Vima Vima" description="Frequently asked questions about Vima Vima — question tracking, analytics, and Anki export for USMLE, MCAT, and LSAT prep." />
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{color:${T.accent};text-decoration:none}a:hover{text-decoration:underline}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(100,140,255,0.2);border-radius:10px}`}</style>

      <Nav T={T} isDark={isDark} setIsDark={setIsDark} />

      {/* Hero */}
      <section style={{maxWidth:720,margin:"0 auto",padding:"60px 24px 40px",textAlign:"center"}}>
        <h1 style={{fontSize:"clamp(36px,6vw,52px)",fontWeight:800,color:T.text,lineHeight:1.1,
          letterSpacing:"-1px",marginBottom:16}}>
          Frequently Asked Questions
        </h1>
        <p style={{fontSize:14,color:T.muted,lineHeight:1.6}}>Everything you need to know before you start.</p>
      </section>

      {/* FAQ Accordion */}
      <section style={{maxWidth:700,margin:"0 auto",padding:"40px 24px 60px"}}>
        <div style={{display:"flex",flexDirection:"column"}}>
          {FAQS.map((item, i) => (
            <div key={i} style={{borderTop:`1px solid ${T.border}`,paddingTop:20,paddingBottom:20}}>
              <button onClick={() => setExpanded(expanded === i ? null : i)} style={{
                width:"100%",background:"none",border:"none",textAlign:"left",
                cursor:"pointer",padding:0,display:"flex",alignItems:"center",
                justifyContent:"space-between",gap:16
              }}>
                <div style={{fontSize:15,fontWeight:600,color:T.text}}>{item.q}</div>
                <div style={{fontSize:20,color:T.accent,flexShrink:0,transition:"transform 0.2s"}}>
                  {expanded === i ? "−" : "+"}
                </div>
              </button>
              {expanded === i && (
                <p style={{fontSize:13,color:T.muted,lineHeight:1.8,marginTop:12}}>
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer T={T} />
    </div>
  );
}
