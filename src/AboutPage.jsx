import { useEffect } from "react";
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

export default function AboutPage() {
  const { isDark, setIsDark, theme: T } = useTheme();

  useEffect(() => {
    document.body.style.background = T.bg;
    document.body.style.color = T.text;
  }, [T]);

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'DM Sans',sans-serif"}}>
      <SEO title="Why We Built Vima Vima | About" description="Learn the story behind Vima Vima — built by a med student, for pre-med and law students preparing for USMLE, MCAT, and LSAT." />
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{color:${T.accent};text-decoration:none}a:hover{text-decoration:underline}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(100,140,255,0.2);border-radius:10px}`}</style>

      <Nav T={T} isDark={isDark} setIsDark={setIsDark} />

      {/* Hero */}
      <section style={{maxWidth:760,margin:"0 auto",padding:"60px 24px 40px",textAlign:"center"}}>
        <h1 style={{fontSize:"clamp(36px,6vw,52px)",fontWeight:800,color:T.text,lineHeight:1.1,
          letterSpacing:"-1px",marginBottom:20}}>
          Why We Built Vima Vima
        </h1>
        <p style={{fontSize:"clamp(16px,2vw,18px)",color:T.dim,lineHeight:1.7,maxWidth:580,margin:"0 auto"}}>
          The story of how a frustrated MCAT tutor built the tracking system they wished existed.
        </p>
      </section>

      {/* Story Sections */}
      <section style={{maxWidth:720,margin:"0 auto",padding:"20px 24px 60px"}}>
        {[
          {
            title: "The Origin",
            content: "Vima Vima was born out of a frustration that thousands of pre-med and pre-law students share — the feeling that you studied the same material, did the same questions, and still couldn't figure out why you kept making the same mistakes.\n\nOur founder spent years as an MCAT tutor at the university level, working one-on-one with students preparing for one of the hardest standardized tests in the world. Through hundreds of tutoring sessions, one pattern became clear: students weren't failing because they didn't know the material. They were failing because they didn't know how they were thinking about it."
          },
          {
            title: "The Socratic Method",
            content: "The most powerful tool in the tutoring sessions wasn't a textbook or a practice test. It was asking the right questions. Inspired by the Socratic method — the idea that deep learning comes from guided self-discovery rather than passive review — our founder developed a system for helping students diagnose their own mistakes in real time.\n\nWhy did you pick that answer? What made you change your mind? Was it the material you didn't know, or the way the question was framed? These questions, asked consistently after every wrong answer, produced dramatic improvements in student performance. The Socratic approach turned wrong answers from dead ends into learning opportunities."
          },
          {
            title: "The Excel Sheet Problem",
            content: "When our founder entered medical school, the same pattern appeared again — but scaled. Students were tracking their NBME scores and question logs in sprawling Excel spreadsheets. Some were hundreds of rows long. They were disorganized, easy to forget about, and did nothing to help students understand the why behind their mistakes.\n\nWorse, passive review — scrolling through a list of wrong answers — wasn't producing retention. Students would review the same concept, get it wrong again two weeks later, and have no system for breaking the cycle."
          },
          {
            title: "The Solution",
            content: "Vima Vima was built to solve both problems at once. The question logging system is built on the Socratic framework — it doesn't just record that you got something wrong, it guides you through understanding why, and what to do differently. The AI study insights bring that tutoring experience to every session.\n\nThe spaced repetition integration with Anki ensures that what you learn from each mistake actually sticks. And the analytics dashboard gives you the data-driven picture of your performance that no Excel sheet ever could.\n\nThe name Vima Vima — and the ladder symbol — represents exactly that journey. Step by step. Question by question. Better every session."
          },
          {
            title: "Who It's For",
            content: "Vima Vima is built for pre-med students preparing for the MCAT, medical students tackling USMLE Step 1 and Step 2, and pre-law students mastering the LSAT. Whether you're six months out or six weeks out, Vima Vima meets you where you are and helps you get where you need to go."
          }
        ].map((section, i) => (
          <div key={i} style={{marginBottom:44}}>
            <h2 style={{fontSize:26,fontWeight:700,color:T.text,marginBottom:16}}>{section.title}</h2>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {section.content.split("\n\n").map((para, pi) => (
                <p key={pi} style={{fontSize:15,color:T.dim,lineHeight:1.8}}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:32,textAlign:"center",marginTop:60}}>
          <h3 style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:10}}>Ready to track your progress?</h3>
          <p style={{fontSize:14,color:T.muted,marginBottom:20,lineHeight:1.6}}>
            Start logging questions for free. No credit card required.
          </p>
          <a href="/app" style={{background:T.accent,borderRadius:8,padding:"12px 30px",color:"#fff",
            fontSize:14,fontWeight:600,textDecoration:"none",display:"inline-block"}}>
            Start Free →
          </a>
        </div>
      </section>

      <Footer T={T} />
    </div>
  );
}
