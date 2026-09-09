import React from "react";

export default function TermsOfService() {
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

        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 40 }}>Last updated: August 2026</p>

        {[
          {
            title: "1. Acceptance of Terms",
            body: `By accessing or using Vima Vima at vimavima.online, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to update these terms at any time, and your continued use of the platform constitutes acceptance of any changes.`
          },
          {
            title: "2. Description of Service",
            body: `Vima Vima is an AI-powered exam performance analytics platform designed for students preparing for standardized tests including the USMLE, MCAT, and LSAT. The platform allows users to log questions, track performance, generate analytics, and create Anki flashcard decks. AI-generated study insights are provided by the Anthropic Claude API.`
          },
          {
            title: "3. User Accounts",
            body: `To use Vima Vima, you must create an account using a valid email address or Google account. You are responsible for:\n\n• Maintaining the confidentiality of your account credentials\n• All activity that occurs under your account\n• Providing accurate and current information\n• Notifying us immediately of any unauthorized use of your account\n\nYou must be at least 13 years old to create an account.`
          },
          {
            title: "4. Acceptable Use",
            body: `You agree to use Vima Vima only for lawful purposes. You must not:\n\n• Share your account with others\n• Attempt to reverse engineer, hack, or disrupt the platform\n• Use the platform to distribute spam or malicious content\n• Violate any applicable laws or regulations\n• Scrape or harvest data from the platform without permission\n• Impersonate any person or entity`
          },
          {
            title: "5. User Content",
            body: `You retain ownership of the study data, notes, and content you create within Vima Vima. By using the platform, you grant us a limited license to store, process, and display your content solely for the purpose of providing our services. We do not sell your personal study data to third parties.`
          },
          {
            title: "6. AI-Generated Content",
            body: `Vima Vima uses AI to generate study insights and flashcard suggestions. These are provided for educational purposes only and should not be considered definitive medical, legal, or professional advice. AI-generated content may contain errors. You are responsible for verifying information against authoritative sources before relying on it for exam preparation.`
          },
          {
            title: "7. Intellectual Property",
            body: `The Vima Vima platform, including its design, logo, features, and underlying code, is owned by Vima Vima and protected by intellectual property laws. You may not copy, reproduce, or distribute any part of the platform without our express written permission. The VIMA VIMA name and ladder logo are trademarks of Vima Vima.`
          },
          {
            title: "8. Third-Party Services",
            body: `Vima Vima integrates with third-party services including Google OAuth, Supabase, Anthropic, and Google AdSense. Your use of these services is subject to their respective terms and privacy policies. We are not responsible for the practices of third-party services.`
          },
          {
            title: "9. Advertising",
            body: `Vima Vima displays advertisements provided by Google AdSense. By using our platform, you acknowledge that you may see ads. We are not responsible for the content of third-party advertisements. Clicking on ads may take you to external websites governed by their own terms.`
          },
          {
            title: "10. Disclaimer of Warranties",
            body: `Vima Vima is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the platform will be error-free, uninterrupted, or that AI-generated content will be accurate. We make no warranty that using Vima Vima will improve your exam scores.`
          },
          {
            title: "11. Limitation of Liability",
            body: `To the fullest extent permitted by law, Vima Vima shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including but not limited to loss of data, exam performance outcomes, or reliance on AI-generated content.`
          },
          {
            title: "12. Termination",
            body: `We reserve the right to suspend or terminate your account at any time for violations of these Terms of Service. You may delete your account at any time by contacting vimavimasupport@gmail.com. Upon termination, your data will be deleted within 30 days.`
          },
          {
            title: "13. Governing Law",
            body: `These Terms of Service are governed by the laws of the State of Michigan, United States, without regard to its conflict of law provisions. Any disputes arising from these terms shall be resolved in the courts of Michigan.`
          },
          {
            title: "14. Contact Us",
            body: `If you have any questions about these Terms of Service, please contact us:\n\nEmail: vimavimasupport@gmail.com\nWebsite: vimavima.online`
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
            <a href="/privacy" style={{ color: C.accent, fontSize: 13, textDecoration: "none" }}>Privacy Policy</a>
            <a href="/" style={{ color: C.accent, fontSize: 13, textDecoration: "none" }}>Home</a>
          </div>
        </div>

      </div>
    </div>
  );
}
