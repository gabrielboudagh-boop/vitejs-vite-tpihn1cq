import React from "react";

export default function PrivacyPolicy() {
  const hour = new Date().getHours();
  const dark = !(hour >= 6 && hour < 20);

  const C = dark ? {
    bg: "#07090f", surface: "#0e1121", text: "#dce8ff",
    muted: "#8896b0", border: "rgba(100,140,255,0.13)", accent: "#3b6eff",
  } : {
    bg: "#f5f7fa", surface: "#ffffff", text: "#0a0d1a",
    muted: "#6b7280", border: "rgba(0,0,0,0.08)", accent: "#0055d4",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px" }}>

        <a href="/" style={{ color: C.accent, fontSize: 14, textDecoration: "none", display: "inline-block", marginBottom: 32 }}>
          ← Back to Vima Vima
        </a>

        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 40 }}>Last updated: August 2026</p>

        {[
          {
            title: "1. Introduction",
            body: `Vima Vima ("we," "our," or "us") operates vimavima.online. This Privacy Policy explains how we collect, use, and protect your information when you use our platform. By using Vima Vima, you agree to the collection and use of information in accordance with this policy.`
          },
          {
            title: "2. Information We Collect",
            body: `We collect the following types of information:\n\n• Account information: When you sign in with Google or email, we collect your name and email address.\n• Study data: Question logs, session records, performance analytics, and flashcard content you create within the app.\n• Usage data: Pages visited, features used, and time spent on the platform.\n• Device information: Browser type, operating system, and IP address for security and analytics purposes.`
          },
          {
            title: "3. How We Use Your Information",
            body: `We use the information we collect to:\n\n• Provide, maintain, and improve the Vima Vima platform\n• Personalize your study experience and analytics\n• Generate AI-powered study insights based on your question logs\n• Send important account and service updates\n• Analyze usage patterns to improve our features\n• Comply with legal obligations`
          },
          {
            title: "4. Data Storage and Security",
            body: `Your data is stored securely using Supabase, a SOC 2 compliant database platform. We implement industry-standard security measures including encryption in transit (HTTPS/TLS) and at rest. We retain your data for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us.`
          },
          {
            title: "5. Third-Party Services",
            body: `We use the following third-party services:\n\n• Supabase — authentication and database storage\n• Google OAuth — sign-in authentication\n• Anthropic Claude API — AI-generated study insights\n• Google AdSense — advertising\n• Cloudflare — hosting and security\n\nEach of these services has its own privacy policy governing how they handle your data.`
          },
          {
            title: "6. Advertising",
            body: `We use Google AdSense to display advertisements on our platform. Google may use cookies and similar technologies to show you personalized ads based on your browsing history. You can opt out of personalized advertising by visiting Google's Ad Settings at adssettings.google.com.`
          },
          {
            title: "7. Cookies",
            body: `We use cookies and similar tracking technologies to maintain your session, remember your preferences, and analyze how our platform is used. You can control cookies through your browser settings, though disabling cookies may affect some functionality.`
          },
          {
            title: "8. Your Rights",
            body: `You have the right to:\n\n• Access the personal data we hold about you\n• Request correction of inaccurate data\n• Request deletion of your account and data\n• Export your study data\n• Opt out of marketing communications\n\nTo exercise any of these rights, contact us at vimavimasupport@gmail.com.`
          },
          {
            title: "9. Children's Privacy",
            body: `Vima Vima is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.`
          },
          {
            title: "10. Changes to This Policy",
            body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date. Continued use of the platform after changes constitutes acceptance of the updated policy.`
          },
          {
            title: "11. Contact Us",
            body: `If you have any questions about this Privacy Policy, please contact us:\n\nEmail: vimavimasupport@gmail.com\nWebsite: vimavima.online`
          },
        ].map(({ title, body }) => (
          <div key={title} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: C.text }}>{title}</h2>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, whiteSpace: "pre-line" }}>{body}</p>
          </div>
        ))}

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 32, marginTop: 20, textAlign: "center" }}>
          <p style={{ color: C.muted, fontSize: 13 }}>© 2026 Vima Vima. All rights reserved.</p>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 24 }}>
            <a href="/terms" style={{ color: C.accent, fontSize: 13, textDecoration: "none" }}>Terms of Service</a>
            <a href="/" style={{ color: C.accent, fontSize: 13, textDecoration: "none" }}>Home</a>
          </div>
        </div>

      </div>
    </div>
  );
}
