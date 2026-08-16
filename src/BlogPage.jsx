import { useEffect } from "react";

const C = {
  bg:"#07090f", surface:"#0e1121", raised:"#141829",
  border:"rgba(100,140,255,0.13)", text:"#dce8ff",
  muted:"#8896b0", dim:"#a0b4cc", accent:"#3b6eff",
};

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
    <div style={{width:"100%",overflow:"hidden",margin:"36px 0"}}>
      <ins className="adsbygoogle" style={{display:"block"}}
        data-ad-client="ca-pub-4179326594130154"
        data-ad-format="auto" data-full-width-responsive="true"/>
    </div>
  );
}

// ── Article content ───────────────────────────────────────────────────────────
const ARTICLES = [
  {
    slug: "mcat-cars-framework",
    label: "MCAT",
    title: "MCAT CARS: The 6-Skill Framework That Separates 128 from 132",
    date: "August 2026",
    readTime: "9 min read",
    intro: "Most MCAT students treat CARS like a general reading comprehension test — read the passage, answer questions, move on. That approach caps your score. The students who score 132 aren't faster readers; they're using a structured framework that turns each passage into a diagnostic exercise before they even look at the questions.",
    sections: [
      {
        heading: "Why CARS is different from every other MCAT section",
        body: `The Chemistry, Biology, and Psychology sections reward knowing the right fact or applying the right formula. CARS rewards understanding how an author thinks. You can be a pre-med with a 3.9 GPA who has read more scientific literature than most practicing physicians, and still score 123 on CARS. This isn't a knowledge problem — it's a strategy problem.\n\nThe AAMC designs CARS passages specifically to penalize students who rely on outside knowledge. Every single answer choice can be checked against the passage text alone. The students who struggle are usually the ones who bring in knowledge that wasn't in the passage, misread the author's tone, or answer questions about what was argued in a paragraph rather than why that paragraph exists.`,
      },
      {
        heading: "The 6 CAR Skills",
        body: `The CAR framework gives you six lenses to analyze every passage before you look at a single question:\n\n**Main Idea** — In one sentence, what is the author's core claim? Not a description of the topic, not a summary of every paragraph — one sentence that captures the author's specific thesis. If you can't write this in under 20 seconds, you don't understand the passage yet.\n\n**Tone** — Is the author enthusiastic, skeptical, cautiously supportive, deeply critical, or neutral? Tone matters because roughly 25% of CARS questions ask directly or indirectly about the author's attitude. A "cautiously supportive" tone produces very different answer choices than "enthusiastic advocacy," and confusing them loses you points.\n\n**Arguments** — What evidence or reasoning does the author use to support the Main Idea? This is where passage structure matters. Most CARS passages have 2–3 supporting arguments and the questions often ask you to identify which one you encountered in a specific paragraph.\n\n**The Author** — What can you infer about who this person is and what they care about? Academic affiliation, philosophical commitments, disciplinary biases. An author who opens with "evolutionary psychology has long been criticized for methodological overreach" is signaling something about their stance before they've made a single argument.\n\n**Contrasting Theories** — Does the passage present opposing viewpoints? If yes, which does the author favor, and how do you know? About 40% of CARS passages pit two or more frameworks against each other, and the questions almost always ask which position the author endorses or which evidence supports.\n\n**Inference and Logic Traps** — Where does the passage invite you to assume something that isn't stated? The hardest CARS questions are the ones where the correct answer requires you to extend the author's logic exactly one step — no more, no less. Over-inference is the single most common error on CARS.`,
      },
      {
        heading: "How to use the framework in a timed passage",
        body: `You can't stop and write a CAR analysis for 9 minutes per passage on test day — but you can build the habit so it becomes automatic. Here's the practice protocol:\n\nFor every passage in your prep (not just every few), spend 90 seconds after reading it to mentally complete each of the six categories. You don't write them out. You just pause and ask: Main Idea? Tone? Arguments? Author? Contrasting Theories? Any inference traps I noticed?\n\nThen answer the questions. After you've checked your answers, go back and see which categories you had wrong, and correlate them with the questions you missed. You'll almost always find the pattern: students who miss tone questions had the tone wrong. Students who miss main point questions couldn't articulate the main idea. The framework makes your wrong answers diagnose themselves.\n\nOver time — usually 2–3 weeks of consistent practice — you stop consciously running through the categories and start doing it automatically as you read. That's the goal. The conscious practice just speeds up the unconscious internalization.`,
      },
      {
        heading: "The most common CARS mistake (and how to catch it)",
        body: `The most common error is outside-knowledge contamination. A student reads a CARS passage about a historical argument in philosophy of science, recognizes the concepts from an intro philosophy class, and starts answering questions from memory rather than from the passage. This consistently produces wrong answers because the AAMC has specifically designed answer choices to trap students who know the topic but aren't reading the author's actual argument.\n\nThe fix is simple but requires discipline: before selecting any answer, point to the specific sentence or paragraph in the passage that supports it. If you can't do this, you're making an inference the author didn't authorize. CARS rewards close reading, not encyclopedic knowledge. Treat every passage like it was written in a field you've never studied — because that's exactly how the scoring algorithm sees it.`,
      },
    ],
  },
  {
    slug: "usmle-step2-question-review",
    label: "USMLE",
    title: "USMLE Step 2 CK: How to Review a Practice Block for Maximum Retention",
    date: "August 2026",
    readTime: "8 min read",
    intro: "Most Step 2 CK students spend 40 minutes doing a UWorld block and 8 minutes reviewing it. That ratio is backwards. The block generates raw data. The review is where learning actually happens — but only if you're reviewing with a framework instead of just reading explanations.",
    sections: [
      {
        heading: "The problem with how most students review",
        body: `The typical approach: finish the block, click 'Review,' read the explanation for every question you missed, move on. This feels productive. It isn't. Reading an explanation once, without reflection or categorization, produces retention rates barely above zero for most students. Two weeks later, the same concept appears on a different question and they miss it again.\n\nThe issue is that there's no feedback loop. You read the explanation but you don't record why you missed it, you don't connect it to a pattern of similar misses, and you don't turn it into something you'll actually see again before test day. The explanation disappears into a folder you'll never open.`,
      },
      {
        heading: "The three-pass review method",
        body: `Pass 1 — Immediate triage (5 minutes): Before reading any explanations, go through each question and mark it as one of three categories: (A) Knew it, made a silly error; (B) Half-knew it, got confused at the last step; (C) Had no real idea. This takes 20 seconds per question. Don't read explanations yet — this is just categorization while the question is fresh.\n\nPass 2 — Deep review of B and C questions (15–20 minutes): These are your actual learning targets. For each B or C question, read the explanation, but then do one more thing: write or type one sentence that describes exactly what you would need to have known or done differently to get this right. Not a summary of the explanation — a prescription for future you. "I missed this because I didn't know that pericarditis chest pain improves when leaning forward." That specific.\n\nPass 3 — Pattern identification (5 minutes): After reviewing all B and C questions, look at your categories from the past 2–3 blocks. Are you consistently missing Cardiology Management questions? Consistently getting Diagnosis questions right but Management wrong? This is where Vima Vima's analytics come in — the patterns that would take you hours to spot manually become visible in seconds when the data is logged consistently.`,
      },
      {
        heading: "Categorizing wrong answers by mistake type",
        body: `The mistake type matters as much as the subject. A Cardiology miss caused by not knowing the material requires a different intervention than a Cardiology miss caused by misreading the question stem. Specifically:\n\n**Knowledge gaps** require direct re-study: read the relevant First Aid section, watch the Pathoma lecture, make an Anki card. The content isn't in your head and needs to go there.\n\n**Algorithm errors** (you knew the material but applied the wrong decision tree) require you to re-trace the clinical reasoning. Draw the algorithm out. Walk through it. The knowledge is there — the routing between pieces of knowledge is the problem.\n\n**Silly mistakes and misreads** are a pacing problem, not a knowledge problem. They require you to slow down on similar question types and build a habit of re-reading the question lead-in before selecting.`,
      },
      {
        heading: "Building your high-yield review list",
        body: `The goal of every review session isn't just to understand tonight's misses — it's to build a running list of high-yield concepts that your practice is revealing as gaps. Every B or C question that you've now reviewed is a candidate for the list.\n\nBy the time you're 4–6 weeks from your exam date, this list should be your primary study resource. It's not a textbook, not a question bank, not a shared Anki deck — it's a document of your specific weaknesses, in your words, derived from your actual wrong answers. That's a fundamentally different kind of review material than anything you can buy.`,
      },
    ],
  },
  {
    slug: "lsat-rc-tone-questions",
    label: "LSAT",
    title: "LSAT Reading Comprehension: Why You Keep Missing Tone Questions",
    date: "August 2026",
    readTime: "7 min read",
    intro: "Tone questions are the most consistently missed question type in LSAT Reading Comprehension. Students who consistently score -2 or -3 on an RC section usually find that at least one of those is a tone or attitude question. Here's why — and how to fix it.",
    sections: [
      {
        heading: "What tone questions are actually asking",
        body: `LSAT tone questions look like this: "The author's attitude toward the sociological model described in paragraph two is best characterized as…" or "Which of the following most accurately describes the author's stance on the historical consensus regarding X?"\n\nThey're not asking you to describe the passage topic. They're asking you to characterize the author's emotional or evaluative relationship to a specific claim or subject. This is a more precise task than it appears. The wrong answer choices are usually technically accurate descriptions of real stances that aren't quite the one the author takes. "Enthusiastic endorsement" and "cautious support" are both positive — but only one is right.`,
      },
      {
        heading: "The four-step tone identification process",
        body: `Step 1 — Identify evaluative language: Before you can characterize tone, you have to notice the words that carry attitude. Verbs like "argues," "claims," "insists" are relatively neutral. Verbs like "acknowledges," "concedes," or "admits" signal that what follows is something the author is granting reluctantly. Words like "unfortunately," "problematically," "notably" embed the author's evaluation directly into the prose.\n\nStep 2 — Distinguish the author from cited voices: Many RC passages describe multiple scholars' positions before the author states their own view. The author's tone toward the scholars' positions can be very different from their tone toward the underlying subject matter. Misreading which voice you're evaluating is one of the most common errors on tone questions.\n\nStep 3 — Check the conclusion paragraph: In almost every LSAT RC passage, the author's true tone is most explicitly stated in the final paragraph. If you're uncertain about tone after reading the body, the conclusion almost always settles it.\n\nStep 4 — Eliminate extreme answers: LSAT passage authors almost never express extreme admiration or extreme contempt. Answers with words like "enthusiastically," "vehemently," or "unconditionally" are almost always wrong. The correct answers tend to use qualified language: "cautiously optimistic," "skeptical but open," "sympathetic but critical."`,
      },
      {
        heading: "Common trap answer patterns",
        body: `The LSAT uses predictable traps on tone questions. Knowing them in advance prevents you from falling in:\n\n**Direction reversal**: The passage has a generally positive tone toward concept A and generally negative toward concept B. A trap answer applies the positive tone to B or the negative tone to A.\n\n**Scope error**: The author is skeptical of one specific aspect of a theory but finds the broader theory compelling. The trap answer characterizes the author as skeptical of the theory overall.\n\n**Tone magnification**: The author expresses mild concern. The trap answer says "alarmed" or "deeply troubled." Mildness matters — read the degree modifiers carefully.\n\n**Neutrality trap**: For passages where the author does have a clear stance, one answer choice will claim the author is "neutral" or "objective." This is almost always wrong in LSAT passages — the passages are selected specifically because they contain a discernible authorial perspective.`,
      },
      {
        heading: "How to build tone identification as a habit",
        body: `Tone is a skill that responds quickly to targeted practice. After every RC passage you review, write down the author's tone in one phrase. Do this even when you've answered all the tone questions correctly. The habit of consciously noting tone as you read makes it automatic over time.\n\nWhen you miss a tone question, go back to the passage and highlight every piece of evaluative language you can find. Then re-read those highlighted phrases and see what tone they collectively convey. In almost every case, the correct answer was in the passage — you just weren't reading for it.`,
      },
    ],
  },
  {
    slug: "spaced-repetition-anki-premed",
    label: "Study Strategy",
    title: "Building Your Personal Anki Deck from Real Exam Mistakes",
    date: "August 2026",
    readTime: "8 min read",
    intro: "Pre-made Anki decks — Anking, Zanki, Pepper — are extraordinary resources. They're also not the most powerful Anki decks you can use. The most powerful deck is the one you built yourself from your actual wrong answers, because it's a direct map to your specific knowledge gaps.",
    sections: [
      {
        heading: "Why pre-made decks underperform for advanced learners",
        body: `Pre-made decks are designed for the average student's average knowledge gaps. By the time you're 2–3 months into dedicated Step 1 or Step 2 prep, you're not the average student. You have specific gaps in specific topics that don't match the distribution of any pre-made deck.\n\nThe result is inefficiency: you spend time reviewing cards testing concepts you already know solidly (inefficient), while your actual gaps — the ones causing you to miss practice questions — aren't getting targeted flashcard coverage. The solution isn't to abandon pre-made decks. It's to build a parallel personal deck that runs alongside them and targets your specific wrong answers.`,
      },
      {
        heading: "The principle of wrong-answer cards",
        body: `Every question you get wrong is a natural flashcard candidate. The question reveals a gap in knowledge, reasoning, or application. The explanation closes the gap — temporarily. The flashcard makes the closure permanent.\n\nThe key is that the card must target the specific thing you got wrong, not the general topic of the question. If you missed a pericarditis question because you confused the ECG findings with myocarditis, your card should be: "What ECG finding distinguishes pericarditis from myocarditis?" Not: "What are the findings in pericarditis?" The general card already exists in Anking. The specific card — targeting your specific confusion — doesn't exist anywhere except a deck you build yourself.`,
      },
      {
        heading: "Card design that actually produces retention",
        body: `The two most common card design failures:\n\n**Cards that are too long**: A card that asks "What are the 7 features of pericarditis?" won't produce durable retrieval. Retrieval practice works through focused, single-concept prompts. Break multi-feature answers into separate cards.\n\n**Cards without context**: "What ECG finding is present in pericarditis?" produces brittle, context-less knowledge. "A 28-year-old man with pleuritic chest pain worse when lying flat has diffuse ST elevation in multiple leads — what diagnosis does this ECG pattern suggest?" forces you to do clinical reasoning on retrieval, not just fact recall.\n\nThe best wrong-answer cards are mini clinical vignettes. They force you to reconstruct the reasoning you failed to do correctly on the original question.`,
      },
      {
        heading: "Review schedules that keep you board-ready",
        body: `Anki's built-in spaced repetition algorithm handles the scheduling — the main thing you need to ensure is daily review time. The research on spaced repetition is unambiguous: short daily review sessions dramatically outperform long weekly sessions for long-term retention.\n\nFor most students in the 3 months before boards, a sustainable target is 30–45 minutes of Anki daily, split between mature cards from pre-made decks (maintenance) and new/learning cards from your personal wrong-answer deck (growth). New wrong-answer cards should enter your deck within 24–48 hours of the practice session that generated them — the closer to the original miss, the stronger the initial encoding.`,
      },
    ],
  },
  {
    slug: "data-driven-score-improvement",
    label: "Study Strategy",
    title: "From 60% to 75%: The Data-Driven Approach to Closing Your Score Gap",
    date: "August 2026",
    readTime: "10 min read",
    intro: "Most exam prep plateaus aren't knowledge plateaus — they're feedback loop failures. Students keep practicing without a systematic way to see what's actually happening to their performance across subjects and question types. Here's how data-driven review breaks that plateau.",
    sections: [
      {
        heading: "Why 60% is a stickier ceiling than it should be",
        body: `A 60% practice score is frustrating because it's not obviously wrong. It feels like progress is happening — you're doing the work, you're reviewing, you're reading explanations. But the score doesn't move. This is the classic plateau.\n\nWhat's actually happening: you're reviewing wrong answers randomly, not systematically. Some topics get a lot of your attention because the questions appear frequently. Others appear infrequently but represent big chunks of your actual score gap. Without data on your performance distribution, you can't know which is which — so you allocate your review time based on what feels like it needs attention, not what actually does.`,
      },
      {
        heading: "The 80/20 of high-yield review",
        body: `Pareto's principle applies to exam prep with unusual precision. On a typical USMLE Step 2 or MCAT practice exam, 80% of wrong answers tend to cluster in 20% of the tested categories. For most students, there are 3–4 subject areas or question types that are generating the majority of their misses. Fixing those would move their score significantly. The other 15–20 subject areas are contributing marginally.\n\nYou can't find those 20% categories without tracking data across sessions. A single practice session won't show the pattern — you might get lucky on your weak subjects in one block. But across 10–15 sessions, the pattern becomes clear: the same subjects appear disproportionately in your wrong columns, the same mistake types repeat.`,
      },
      {
        heading: "What to track and why",
        body: `The minimum useful dataset for meaningful analytics is four variables per question: subject, question type, result, and mistake type. Subject and question type tell you where the gaps are. Mistake type tells you why.\n\nMistake type is the most actionable variable because it determines what kind of intervention fixes the problem. "Didn't know the material" means study content. "Knew the material but wrong algorithm" means practice clinical reasoning with that type of presentation. "Silly mistake / misread" means slow down and change your question-reading habits. "Ran out of time" means your pacing strategy needs adjustment.\n\nWithout mistake-type tracking, you can know you're weak in Renal but not know whether it's a content issue, a reasoning issue, or a pacing issue — and those require completely different fixes.`,
      },
      {
        heading: "Weekly review framework",
        body: `The most effective cadence for data review is weekly, not daily. Daily data is too noisy — one bad block can look like a catastrophic weakness in a subject that was actually an off day. Weekly data aggregates enough questions to show reliable patterns.\n\nA useful weekly review takes 15 minutes and answers three questions: (1) What were my three weakest subjects this week, and does that match my weakest subjects from previous weeks? (2) What was my most common mistake type — is it the same as last week? (3) Did any subject go from weak to strong, and what did I do differently in how I studied it?\n\nThat third question is the most valuable. When something actually improves, that's your proof that a specific study intervention works. Scaling that intervention to other weak subjects is how you break the plateau.`,
      },
      {
        heading: "The compound effect of consistent logging",
        body: `The frustrating truth about data-driven improvement is that it requires consistency before it produces insight. If you've only logged 20 questions across 3 sessions, your data doesn't have enough signal to guide meaningful decisions. If you've logged 300 questions across 8 weeks, the patterns are unmistakable.\n\nThis is why the habit matters as much as the strategy. Students who log every session, even the bad ones — especially the bad ones — build a dataset that tells them exactly what they need to work on. Students who only log when they feel motivated have incomplete data and incomplete insight. The 75% scorer doesn't have more raw intelligence than the 60% scorer. They have a better feedback loop.`,
      },
    ],
  },
];

// ── Layout helpers ────────────────────────────────────────────────────────────
function Layout({ children }) {
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

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{color:${C.accent};text-decoration:none}a:hover{text-decoration:underline}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(100,140,255,0.2);border-radius:10px}`}</style>
      <nav style={{position:"sticky",top:0,zIndex:100,background:C.surface+"ee",backdropFilter:"blur(12px)",
        borderBottom:`1px solid ${C.border}`,padding:"14px 32px",
        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <a href="/" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
            <span style={{fontSize:20}}>🪜</span>
            <span style={{fontSize:15,fontWeight:700,color:C.text}}>VIMA VIMA</span>
          </a>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <a href="/blog" style={{fontSize:13,color:C.muted,fontWeight:500}}>All Guides</a>
          <a href="/app" style={{fontSize:13,color:C.text,fontWeight:500}}>Sign In</a>
        </div>
      </nav>
      {children}
      <footer style={{borderTop:`1px solid ${C.border}`,padding:"28px 24px",textAlign:"center",marginTop:80}}>
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

// ── Blog index ────────────────────────────────────────────────────────────────
function BlogIndex() {
  return (
    <Layout>
      <div style={{maxWidth:760,margin:"0 auto",padding:"60px 24px"}}>
        <h1 style={{fontSize:34,fontWeight:800,color:C.text,marginBottom:10}}>Study Strategy Guides</h1>
        <p style={{fontSize:15,color:C.muted,lineHeight:1.7,marginBottom:48}}>
          Evidence-based study frameworks for MCAT, USMLE, and LSAT students. These guides
          are built from real prep patterns — not generic advice.
        </p>
        <AdUnit/>
        <div style={{display:"flex",flexDirection:"column",gap:18}}>
          {ARTICLES.map(a => (
            <a key={a.slug} href={`/blog/${a.slug}`}
              style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"22px 24px",display:"block",textDecoration:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span style={{fontSize:10,background:C.accent+"20",color:C.accent,borderRadius:5,padding:"2px 8px",fontWeight:600}}>{a.label}</span>
                <span style={{fontSize:11,color:C.muted}}>{a.readTime}</span>
                <span style={{fontSize:11,color:C.muted}}>·</span>
                <span style={{fontSize:11,color:C.muted}}>{a.date}</span>
              </div>
              <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:8,lineHeight:1.35}}>{a.title}</div>
              <p style={{fontSize:13,color:C.muted,lineHeight:1.65}}>{a.intro.slice(0,180)}…</p>
              <div style={{fontSize:12,color:C.accent,marginTop:12}}>Read full guide →</div>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}

// ── Individual article ────────────────────────────────────────────────────────
function Article({ article }) {
  return (
    <Layout>
      <article style={{maxWidth:700,margin:"0 auto",padding:"60px 24px"}}>
        {/* Breadcrumb */}
        <div style={{fontSize:12,color:C.muted,marginBottom:24}}>
          <a href="/" style={{color:C.muted}}>Home</a>
          {" › "}
          <a href="/blog" style={{color:C.muted}}>Guides</a>
          {" › "}
          <span style={{color:C.dim}}>{article.label}</span>
        </div>

        {/* Header */}
        <div style={{marginBottom:36}}>
          <span style={{fontSize:11,background:C.accent+"20",color:C.accent,borderRadius:5,padding:"3px 10px",fontWeight:600}}>{article.label}</span>
          <h1 style={{fontSize:"clamp(24px,4vw,34px)",fontWeight:800,color:C.text,marginTop:14,marginBottom:10,lineHeight:1.2}}>{article.title}</h1>
          <div style={{fontSize:12,color:C.muted,display:"flex",gap:12}}>
            <span>{article.date}</span>
            <span>·</span>
            <span>{article.readTime}</span>
          </div>
        </div>

        {/* Intro */}
        <p style={{fontSize:16,color:C.dim,lineHeight:1.8,marginBottom:36,fontStyle:"italic",borderLeft:`3px solid ${C.accent}`,paddingLeft:16}}>
          {article.intro}
        </p>

        <AdUnit/>

        {/* Sections */}
        {article.sections.map((s, i) => (
          <section key={i} style={{marginBottom:40}}>
            <h2 style={{fontSize:20,fontWeight:700,color:C.text,marginBottom:16}}>{s.heading}</h2>
            {s.body.split("\n\n").map((para, j) => (
              <p key={j} style={{fontSize:14,color:C.muted,lineHeight:1.85,marginBottom:14}}
                dangerouslySetInnerHTML={{__html: para
                  .replace(/\*\*(.+?)\*\*/g,"<strong style='color:#a0b4cc;font-weight:600'>$1</strong>")
                  .replace(/\*(.+?)\*/g,"<em>$1</em>")
                }}/>
            ))}
            {i === 1 && <AdUnit/>}
          </section>
        ))}

        {/* CTA */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"24px",textAlign:"center",marginTop:48}}>
          <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:8}}>Apply this framework in Vima Vima</div>
          <p style={{fontSize:13,color:C.muted,marginBottom:18,lineHeight:1.6}}>
            Vima Vima structures this kind of reflection automatically. Log your practice questions,
            see your analytics, and build Anki cards from real misses — no account required to try it.
          </p>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <a href="/" style={{background:C.accent,borderRadius:8,padding:"10px 24px",color:"#fff",fontSize:14,fontWeight:600}}>Try the Free Demo</a>
            <a href="/app" style={{background:C.raised,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 18px",color:C.dim,fontSize:14}}>Sign In</a>
          </div>
        </div>

        {/* Related */}
        <div style={{marginTop:48}}>
          <h3 style={{fontSize:16,fontWeight:600,color:C.text,marginBottom:16}}>More guides</h3>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {ARTICLES.filter(a => a.slug !== article.slug).slice(0,3).map(a => (
              <a key={a.slug} href={`/blog/${a.slug}`}
                style={{background:C.raised,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",textDecoration:"none"}}>
                <span style={{fontSize:13,color:C.text,fontWeight:500}}>{a.title}</span>
                <span style={{fontSize:12,color:C.accent,flexShrink:0,marginLeft:12}}>→</span>
              </a>
            ))}
          </div>
        </div>
      </article>
    </Layout>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────
export default function BlogPage({ slug }) {
  const article = ARTICLES.find(a => a.slug === slug);
  if (!slug || !article) return <BlogIndex/>;
  return <Article article={article}/>;
}
