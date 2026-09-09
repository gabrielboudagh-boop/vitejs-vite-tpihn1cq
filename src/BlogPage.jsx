import { useEffect } from "react";
import { useTheme } from "./ThemeContext.jsx";
import BrandLogo from "./BrandLogo.jsx";

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
  {
    slug: "learn-from-wrong-answers-usmle",
    label: "USMLE",
    title: "The 4 Types of USMLE Wrong Answers (And Why Your Review Strategy Depends on It)",
    date: "September 2026",
    readTime: "8 min read",
    intro: "Every question you miss is data. But not all wrong answers are created equal. A question you miss because you didn't know the material requires a completely different response than a question you miss because you misread the stem. Here's how to categorize what happened and fix it.",
    sections: [
      {
        heading: "Type 1: Didn't Know The Concept",
        body: `This is the clearest category. The question tests a fact, process, or concept that wasn't in your knowledge base when you saw it. You guessed. You were between two answers and picked wrong. You eliminated three clearly incorrect answers and your remaining two options were both plausible but unfamiliar.\n\nFix: Study the concept. Open First Aid, read the relevant section, watch Pathoma, make an Anki card. This is direct knowledge acquisition. The intervention is unambiguous.`,
      },
      {
        heading: "Type 2: Knew The Concept But Wrong Application",
        body: `You knew what the question was testing. You could have written a paragraph about the topic on a blank page. But you applied the knowledge wrong in the context of this specific clinical scenario. You confused which condition causes what, or you misremembered the algorithm for management, or you applied the right principle to the wrong disease.\n\nFix: Work through the clinical reasoning without the answer choices. Read the vignette, cover the options, and see if you arrive at the right answer. This is algorithm practice, not knowledge review. Most students who spend time on Type 2 misses see rapid improvement because the content is already there — just the application is broken.`,
      },
      {
        heading: "Type 3: Misread The Question",
        body: `You knew the material. You could have answered correctly. But you missed a detail in the question stem. "The patient is a 65-year-old man" but you registered him as 35. "Acute presentation" but you were thinking chronic. "Baseline renal function normal" but you glanced over it. These aren't knowledge errors — they're attention errors.\n\nFix: Slow down on question stems. Develop a protocol: read the clinical scenario once completely, then re-read looking specifically for age, gender, timeline (acute/chronic), baseline status, and any negations ("no prior history"). The fix for Type 3 is pacing discipline and systematic re-reading, not more content review.`,
      },
      {
        heading: "Type 4: Silly Mistake or Unlucky Guess",
        body: `You narrowed it down to two answers. Both seemed reasonable. You guessed. You were wrong. On a different day, with different test conditions, you might have chosen right. This isn't a systematic error pattern — it's variance.\n\nFix: Track whether these happen randomly or cluster in specific question types or subjects. If a subject area generates more Type 4s than others, that might indicate partial knowledge that becomes reliable with more exposure. If Type 4s are truly random (distributed across all subjects), accept them as noise and focus on Types 1–3.`,
      },
      {
        heading: "Implementing a mistake taxonomy",
        body: `The most useful study habit isn't reading every explanation. It's categorizing your misses into these four types before you study anything. As you review a practice block: (1) Mark each wrong as 1, 2, 3, or 4. (2) If the block is mostly Type 1, spend the evening doing content review. If it's mostly Type 2, draw algorithms and clinical reasoning. If it's mostly Type 3, examine your reading habits.\n\nOver weeks of data, you'll notice patterns. "I consistently make Type 2 mistakes in Renal but Type 1 mistakes in Derm" tells you that you have weak content knowledge in Derm and weak algorithmic thinking in Renal. These require different interventions, and only a mistake taxonomy reveals it.`,
      },
    ],
  },
  {
    slug: "stop-changing-right-answers",
    label: "Study Strategy",
    title: "The Science Behind Why You Change Right Answers to Wrong Ones (And How to Stop)",
    date: "September 2026",
    readTime: "9 min read",
    intro: "Most students change right answers to wrong ones at roughly the same rate — around 2-3% of their answers per test. This isn't random. It's a specific cognitive bias that research has well-documented. Understanding the mechanism is the first step to stopping it.",
    sections: [
      {
        heading: "What the research actually says about answer changing",
        body: `The popular wisdom says 'Trust your gut — don't change answers.' This is oversimplified. A meta-analysis of 1,500+ students by Kruger et al. showed that roughly 50% of all answer changes are from wrong to right (improvement), while 33% go from right to wrong (harm), and 17% are wrong to wrong (neutral).\n\nIn other words, answer changes produce a net positive. On average, students who change answers score higher than students who never change them. But individual students who change right answers frequently still score lower because their specific pattern is different — they're in the harmful 33% category.`,
      },
      {
        heading: "Why confidence collapses on re-read",
        body: `When you change a right answer to a wrong one, it's almost always preceded by a moment of doubt on second-guessing. You read your answer choice again, and suddenly it seems less certain. You think "wait, could it be this other answer instead?" and switch.\n\nThe neuroscience here is interesting. When you first read the question and selected your answer, your brain formed a coherent narrative: "This clinical presentation = this diagnosis." But on re-read, your brain enters a different state — now it's searching for reasons to doubt, looking for alternative interpretations. The second narrative seems equally coherent because you're literally constructing it while in doubt-mode.`,
      },
      {
        heading: "The distinction between productive and harmful changes",
        body: `Productive changes: You identify a factual error in your reasoning. "I thought this was hereditary but I remember now it's acquired" → you change to the correct answer. Time spent: 10 seconds, decision made with high confidence.\n\nHarmful changes: You second-guess an answer you actually understood correctly. You think "they wouldn't make it that obvious" or "I might be overthinking" and switch to a more complex-sounding answer that sounds more "medical." Time spent: 30+ seconds, decision made with low confidence.\n\nThe key difference: productive changes are supported by recalled facts. Harmful changes are supported by feelings about test strategy.`,
      },
      {
        heading: "Building an answer-changing protocol",
        body: `Don't eliminate all changes — eliminate the low-confidence ones. Here's a protocol most high-scoring students use:\n\nIf you're considering a change, ask yourself: "Do I have a specific, factual reason for the change, or am I just doubting myself?" If it's factual (you recalled additional information), change. If it's emotional (you're second-guessing), don't.\n\nSet a time limit. If you haven't decided within 15 seconds of reconsidering, move on. Endless reconsideration almost always leads to a harmful change.\n\nTrack your changes. Log which questions you changed and whether they improved. After 10–15 blocks, you'll have data on your specific pattern. Some students have high-value changes; others have low-value changes. Only your data tells you which category you're in.`,
      },
      {
        heading: "The answer-changing tell in your analytics",
        body: `If you log questions in Vima Vima and mark "Did you change your answer," you can see your pattern clearly. Calculate: (# questions where you changed to correct) ÷ (# questions where you changed to wrong). Most high scorers are around 1.5:1. Most students who report "I change too many answers" are closer to 0.5:1.\n\nIf your ratio is below 1:1, your decision threshold is too low — you're changing on doubt rather than fact. The fix isn't to never change. It's to be more selective about when you allow yourself to change, following a protocol based on factual recall rather than test anxiety.`,
      },
    ],
  },
  {
    slug: "usmle-high-yield-systems",
    label: "USMLE",
    title: "USMLE High-Yield Systems: Ranking Frequencies and Allocating Study Time",
    date: "September 2026",
    readTime: "9 min read",
    intro: "The USMLE tests 17 organ systems. They're not tested equally. A data-driven approach to which systems deserve your time starts with knowing the actual frequency distribution, not assumptions.",
    sections: [
      {
        heading: "The frequency hierarchy (based on UWorld question data)",
        body: `Across multiple years of USMLE Step 1 data, the question frequency distribution isn't random. Some systems generate significantly more questions than others. Based on comprehensive question bank analysis:\n\n**Very High Yield** (15-18% of questions): Cardiovascular, Pulmonary, GI, Neurology, Renal\n\n**High Yield** (10-15%): Endocrinology, Hematology/Oncology, Immunology, Musculoskeletal, Infectious Disease\n\n**Moderate Yield** (5-10%): Psychiatry, Dermatology, Reproductive, Pharmacology (systems-applied)\n\n**Lower Yield** (2-5%): Genetics, Ophthalmology, Otolaryngology, Environmental\n\nThis doesn't mean skip the lower-yield systems. It means allocate your time proportionally to frequency with a 20% premium for weak areas.`,
      },
      {
        heading: "Why naive systems-based allocation fails",
        body: `Most students allocate study time evenly across systems or by interest. "I love Cardiology so I'll spend 3 weeks on it" or "I need to cover all 17 systems equally." Both strategies waste time.\n\nThe better approach: Spend 60% of your systems study time on the very-high-yield systems, 25% on high-yield, and 15% on everything else. Within each system, spend 70% on high-incidence topics (Cardiology: MI, arrhythmias, heart failure; Pulmonary: pneumonia, COPD, asthma) and 30% on lower-incidence but still testable topics.`,
      },
      {
        heading: "Subject mastery tiers",
        body: `Within each system, questions fall into predictable patterns. Define three tiers:\n\n**Tier 1 (Must-Know)**: Concepts tested in 5%+ of questions in that system. For Cardiology: acute MI, heart failure, arrhythmias, endocarditis. For Renal: acute kidney injury, chronic kidney disease, electrolyte disorders.\n\n**Tier 2 (Should-Know)**: Concepts tested in 1-5% of questions. These are your high-yield details within each system.\n\n**Tier 3 (Nice-To-Know)**: Rare presentations and obscure associations. You see these maybe once per exam.\n\nBefore boards, you should have near-complete mastery of Tier 1 across all systems. Tier 2 you should know well. Tier 3 you might look up during review but don't memorize preemptively.`,
      },
      {
        heading: "Using your practice data to calibrate allocation",
        body: `Abstract frequencies mean nothing if you don't know your specific pattern. Track by system and question-type in your practice:\n\nAfter 20 full-length exams, you'll see: "I'm 85% correct on Cardiology diagnosis questions but 60% on Cardiology management." That tells you to invest more time in management algorithms for Cardiology, not to review Cardiology pathophysiology again.\n\nThe same data also tells you: "Renal is my weak system overall" or "Neuro looks OK" — and you can start reallocating time away from your strengths toward your gaps.`,
      },
      {
        heading: "The 80/20 final push strategy",
        body: `In your final 3 weeks before the exam, identify the 20% of subjects and question-types that generate 80% of your misses. Stop doing anything else. Every single day of final review should target those specific gaps.\n\nIf your data shows you miss 60% of questions about heart failure management but 90% of questions about arrhythmia diagnosis, that's your priority. Three weeks is enough to close a specific gap if you target it relentlessly. It's not enough to improve "Cardiology" broadly — the domain is too large.`,
      },
    ],
  },
  {
    slug: "lsat-logical-reasoning",
    label: "LSAT",
    title: "LSAT Logical Reasoning: The 10 Question Types and a 6-Week Mastery Plan",
    date: "September 2026",
    readTime: "10 min read",
    intro: "Logical Reasoning accounts for 50% of your LSAT score. The 10 LR question types are highly predictable. Master the pattern-recognition for each type, and your score moves fast.",
    sections: [
      {
        heading: "The 10 Question Types You Must Know",
        body: `Every Logical Reasoning question fits into one of 10 categories. Once you know the category, you know what the question is asking and what to do with it:\n\n**Type 1 — Main Point**: "Which one of the following best expresses the main point of the passage?" The task is identifying the author's central claim.\n\n**Type 2 — Conclusion**: "Which one of the following is a conclusion on which the argument depends?" Usually asking for an unstated but essential premise.\n\n**Type 3 — Assumption**: "Which one of the following is an assumption required by the argument?" Very similar to Type 2 mechanically, but framed differently.\n\n**Type 4 — Strengthen**: "Which one of the following, if true, most strengthens the argument?" Add evidence that makes the conclusion more likely.\n\n**Type 5 — Weaken**: "Which one of the following, if true, most weakens the argument?" Find the answer that undermines the reasoning.\n\n**Type 6 — Inference**: "Which one of the following can be inferred from the above?" Go one logical step beyond what's stated.\n\n**Type 7 — Necessary Condition**: Asking what must be true if something else is true. "If the above is true, which must be true?"\n\n**Type 8 — Sufficient Condition**: "If the above is true, which could be false?" (or "must be true")\n\n**Type 9 — Parallel Reasoning**: "Which one of the following most closely parallels the reasoning above?" Identify the logical structure and find the answer with matching structure.\n\n**Type 10 — Flaw**: "The reasoning in the argument is flawed because..." Identify the logical error.`,
      },
      {
        heading: "Common error patterns by question type",
        body: `Each question type has predictable wrong-answer patterns:\n\n**Main Point/Conclusion**: Students pick supporting details instead of the central claim. Fix: The correct answer usually restates the main claim in slightly different words. If an answer is a detail mentioned once, it's usually wrong.\n\n**Strengthen/Weaken**: Students pick answers that strengthen/weaken the evidence rather than the logical link. If the argument says "Most students who use Anki score 80%+" and you pick an answer about "Anki cards are well-designed," you've strengthened the evidence but not the conclusion.\n\n**Assumption**: Students miss the logical gap. Practice the "denial test" — if the assumption is false, does the argument fall apart? If not, it's not required.\n\n**Inference**: Students go too far. "The study found X" does not let you infer "X is always true." Inferences must be one small logical step, not a leap.\n\n**Flaw**: Students identify a flaw that isn't actually present in the argument. Practice by asking: "Is this flaw actually described in the stimulus?" If you're adding information to make a flaw fit, the answer is wrong.`,
      },
      {
        heading: "Week 1-2: Learning the Question Types",
        body: `Don't do full sections yet. Do one question type at a time. Take 10 questions that are Type 1 (Main Point) only. Time them loosely (no limit). Review to understand the pattern. Then 10 Type 2 questions, and so on.\n\nBy the end of Week 2, you should be able to see a question and immediately know its type without reading deeply. This is pattern recognition, not memorization. You're training your eye to spot the logical structure quickly.`,
      },
      {
        heading: "Week 3-4: Building Accuracy Under Time",
        body: `Now you know the types. Run a strict 35-minute section and focus on accuracy within each type. After each section, review every question: Did I identify the type correctly? Did I understand the logical structure? Did I fall into a known error pattern?\n\nAt this stage, time pressure should produce accuracy (80%+), not speed. Speed comes later. Many students flip this — they try to go fast immediately and entrench bad habits.`,
      },
      {
        heading: "Week 5-6: Full Section Speed and Endurance",
        body: `Now you're drilling full sections, timed, back-to-back. Your goal is consistent -3 to -4 per section (32-33 correct out of 35). Most students need 2-3 weeks of consistent drilling to achieve this.\n\nIf you're still making errors after 4 weeks of study, it's almost always because you misidentified the question type. Review: which types are generating your mistakes? Spend focused time on those specific types, not generic "LR review." The type determines the strategy.`,
      },
    ],
  },
];

// ── Layout helpers ────────────────────────────────────────────────────────────
function Layout({ children, T, isDark, setIsDark }) {
  useEffect(() => {
    injectAdSense();
    if (!document.querySelector('link[href*="DM+Sans"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap";
      document.head.appendChild(link);
    }
    document.body.style.background = T.bg;
    document.body.style.margin = "0";
    document.body.style.fontFamily = "'DM Sans', sans-serif";
  }, [T]);

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{color:${T.accent};text-decoration:none}a:hover{text-decoration:underline}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(100,140,255,0.2);border-radius:10px}`}</style>
      <nav style={{position:"sticky",top:0,zIndex:100,background:T.surface+"ee",backdropFilter:"blur(12px)",
        borderBottom:`1px solid ${T.border}`,padding:"14px 32px",
        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <a href="/" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
            <BrandLogo dark={isDark} height={28}/>
          </a>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <a href="/blog" style={{fontSize:13,color:T.muted,fontWeight:500}}>All Guides</a>
          <button onClick={() => setIsDark(!isDark)} style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,
            padding:"7px 14px",color:T.text,fontSize:13,fontWeight:600,cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif"}}>
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <a href="/app" style={{fontSize:13,color:T.text,fontWeight:500}}>Sign In</a>
        </div>
      </nav>
      {children}
      <footer style={{borderTop:`1px solid ${T.border}`,padding:"28px 24px",textAlign:"center",marginTop:80}}>
        <div style={{fontSize:13,color:T.muted,marginBottom:8,display:"flex",gap:20,justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/" style={{color:T.muted}}>Home</a>
          <a href="/blog" style={{color:T.muted}}>Study Guides</a>
          <a href="/about" style={{color:T.muted}}>About</a>
          <a href="/faq" style={{color:T.muted}}>FAQ</a>
          <a href="/contact" style={{color:T.muted}}>Contact</a>
          <a href="/terms" style={{color:T.muted}}>Terms</a>
          <a href="/privacy" style={{color:T.muted}}>Privacy</a>
        </div>
        <div style={{fontSize:12,color:T.muted+"66"}}>© 2026 Vima Vima · Built for serious exam prep</div>
      </footer>
    </div>
  );
}

// ── Blog index ────────────────────────────────────────────────────────────────
function BlogIndex({ T }) {
  return (
    <Layout T={T} isDark={T.name === "dark"} setIsDark={() => {}}>
      <div style={{maxWidth:760,margin:"0 auto",padding:"60px 24px"}}>
        <h1 style={{fontSize:34,fontWeight:800,color:T.text,marginBottom:10}}>Study Strategy Guides</h1>
        <p style={{fontSize:15,color:T.muted,lineHeight:1.7,marginBottom:48}}>
          Evidence-based study frameworks for MCAT, USMLE, and LSAT students. These guides
          are built from real prep patterns — not generic advice.
        </p>
        <AdUnit/>
        <div style={{display:"flex",flexDirection:"column",gap:18}}>
          {ARTICLES.map(a => (
            <a key={a.slug} href={`/blog/${a.slug}`}
              style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"22px 24px",display:"block",textDecoration:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span style={{fontSize:10,background:T.accent+"20",color:T.accent,borderRadius:5,padding:"2px 8px",fontWeight:600}}>{a.label}</span>
                <span style={{fontSize:11,color:T.muted}}>{a.readTime}</span>
                <span style={{fontSize:11,color:T.muted}}>·</span>
                <span style={{fontSize:11,color:T.muted}}>{a.date}</span>
              </div>
              <div style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:8,lineHeight:1.35}}>{a.title}</div>
              <p style={{fontSize:13,color:T.muted,lineHeight:1.65}}>{a.intro.slice(0,180)}…</p>
              <div style={{fontSize:12,color:T.accent,marginTop:12}}>Read full guide →</div>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}

// ── Individual article ────────────────────────────────────────────────────────
function Article({ article, T }) {
  return (
    <Layout T={T} isDark={T.name === "dark"} setIsDark={() => {}}>
      <article style={{maxWidth:700,margin:"0 auto",padding:"60px 24px"}}>
        {/* Breadcrumb */}
        <div style={{fontSize:12,color:T.muted,marginBottom:24}}>
          <a href="/" style={{color:T.muted}}>Home</a>
          {" › "}
          <a href="/blog" style={{color:T.muted}}>Guides</a>
          {" › "}
          <span style={{color:T.dim}}>{article.label}</span>
        </div>

        {/* Header */}
        <div style={{marginBottom:36}}>
          <span style={{fontSize:11,background:T.accent+"20",color:T.accent,borderRadius:5,padding:"3px 10px",fontWeight:600}}>{article.label}</span>
          <h1 style={{fontSize:"clamp(24px,4vw,34px)",fontWeight:800,color:T.text,marginTop:14,marginBottom:10,lineHeight:1.2}}>{article.title}</h1>
          <div style={{fontSize:12,color:T.muted,display:"flex",gap:12}}>
            <span>{article.date}</span>
            <span>·</span>
            <span>{article.readTime}</span>
          </div>
        </div>

        {/* Intro */}
        <p style={{fontSize:16,color:T.dim,lineHeight:1.8,marginBottom:36,fontStyle:"italic",borderLeft:`3px solid ${T.accent}`,paddingLeft:16}}>
          {article.intro}
        </p>

        <AdUnit/>

        {/* Sections */}
        {article.sections.map((s, i) => (
          <section key={i} style={{marginBottom:40}}>
            <h2 style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:16}}>{s.heading}</h2>
            {s.body.split("\n\n").map((para, j) => (
              <p key={j} style={{fontSize:14,color:T.muted,lineHeight:1.85,marginBottom:14}}
                dangerouslySetInnerHTML={{__html: para
                  .replace(/\*\*(.+?)\*\*/g,`<strong style='color:${T.dim};font-weight:600'>$1</strong>`)
                  .replace(/\*(.+?)\*/g,"<em>$1</em>")
                }}/>
            ))}
            {i === 1 && <AdUnit/>}
          </section>
        ))}

        {/* CTA */}
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"24px",textAlign:"center",marginTop:48}}>
          <div style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:8}}>Apply this framework in Vima Vima</div>
          <p style={{fontSize:13,color:T.muted,marginBottom:18,lineHeight:1.6}}>
            Vima Vima structures this kind of reflection automatically. Log your practice questions,
            see your analytics, and build Anki cards from real misses — no account required to try it.
          </p>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <a href="/" style={{background:T.accent,borderRadius:8,padding:"10px 24px",color:"#fff",fontSize:14,fontWeight:600}}>Try the Free Demo</a>
            <a href="/app" style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 18px",color:T.dim,fontSize:14}}>Sign In</a>
          </div>
        </div>

        {/* Related */}
        <div style={{marginTop:48}}>
          <h3 style={{fontSize:16,fontWeight:600,color:T.text,marginBottom:16}}>More guides</h3>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {ARTICLES.filter(a => a.slug !== article.slug).slice(0,3).map(a => (
              <a key={a.slug} href={`/blog/${a.slug}`}
                style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:10,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",textDecoration:"none"}}>
                <span style={{fontSize:13,color:T.text,fontWeight:500}}>{a.title}</span>
                <span style={{fontSize:12,color:T.accent,flexShrink:0,marginLeft:12}}>→</span>
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
  const { isDark, setIsDark, theme: T } = useTheme();
  
  useEffect(() => {
    document.body.style.background = T.bg;
    document.body.style.color = T.text;
  }, [T]);
  
  const article = ARTICLES.find(a => a.slug === slug);
  if (!slug || !article) return <BlogIndex T={T} />;
  return <Article article={article} T={T} />;
}
