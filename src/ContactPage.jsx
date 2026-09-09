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

export default function ContactPage() {
  const { isDark, setIsDark, theme: T } = useTheme();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    document.body.style.background = T.bg;
    document.body.style.color = T.text;
  }, [T]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus("error");
      return;
    }
    // Open mailto link
    const subject = encodeURIComponent("Contact from Vima Vima");
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    window.location.href = `mailto:vimavimasupport@gmail.com?subject=${subject}&body=${body}`;
    setStatus("submitted");
    setTimeout(() => {
      setFormData({ name: "", email: "", message: "" });
      setStatus("");
    }, 2000);
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'DM Sans',sans-serif"}}>
      <SEO title="Contact | Vima Vima" description="Get in touch with the Vima Vima team. Email support, feature requests, and feedback welcome." />
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{color:${T.accent};text-decoration:none}a:hover{text-decoration:underline}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(100,140,255,0.2);border-radius:10px}input,textarea{font-family:'DM Sans',sans-serif}`}</style>

      <Nav T={T} isDark={isDark} setIsDark={setIsDark} />

      {/* Hero */}
      <section style={{maxWidth:700,margin:"0 auto",padding:"60px 24px 40px",textAlign:"center"}}>
        <h1 style={{fontSize:"clamp(36px,6vw,52px)",fontWeight:800,color:T.text,lineHeight:1.1,
          letterSpacing:"-1px",marginBottom:16}}>
          Get in Touch
        </h1>
        <p style={{fontSize:14,color:T.muted,lineHeight:1.6,marginBottom:20}}>
          Questions, feedback, or feature requests? We'd love to hear from you.
        </p>
        <p style={{fontSize:14,color:T.dim,fontWeight:500}}>
          Email: <a href="mailto:vimavimasupport@gmail.com" style={{color:T.accent}}>vimavimasupport@gmail.com</a>
        </p>
      </section>

      {/* Contact Form */}
      <section style={{maxWidth:600,margin:"0 auto",padding:"40px 24px 60px"}}>
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:32}}>
          <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:20}}>
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:6}}>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                style={{width:"100%",padding:"10px 14px",background:T.bg,border:`1px solid ${T.border}`,
                  borderRadius:8,color:T.text,fontSize:13}}
              />
            </div>
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:6}}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                style={{width:"100%",padding:"10px 14px",background:T.bg,border:`1px solid ${T.border}`,
                  borderRadius:8,color:T.text,fontSize:13}}
              />
            </div>
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:6}}>Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us what's on your mind…"
                rows={6}
                style={{width:"100%",padding:"10px 14px",background:T.bg,border:`1px solid ${T.border}`,
                  borderRadius:8,color:T.text,fontSize:13,resize:"vertical"}}
              />
            </div>
            <button type="submit" style={{background:T.accent,border:"none",borderRadius:8,padding:"12px 24px",
              color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer"}}>
              Send Message
            </button>
            {status === "error" && <p style={{fontSize:13,color:T.danger}}>Please fill in all fields.</p>}
            {status === "submitted" && <p style={{fontSize:13,color:T.success}}>Message sent! We'll respond within 24-48 hours.</p>}
          </form>
          <div style={{marginTop:20,paddingTop:20,borderTop:`1px solid ${T.border}`,fontSize:13,color:T.muted,textAlign:"center"}}>
            💡 <strong>Tip:</strong> We typically respond within 24-48 hours.
          </div>
        </div>
      </section>

      <Footer T={T} />
    </div>
  );
}
