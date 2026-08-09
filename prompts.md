# AI Interview Agent - Development Prompts History

* **Project Name**: AI Interview Agent
* **AI Tool**: Google Antigravity IDE
* **Development Approach**: AI-assisted / vibe coding

---

## Chronological Prompts Log

### 1. User Instruction (2026-08-07T14:56:51Z)
```text
You are a senior AI Architect and Full Stack Engineer.

I am participating in the ABTalks Vibe Coding Hackathon.

I have attached the three official hackathon files:
1. Curriculum JSON
2. Candidate Profiles
3. Technical Specification

Read all three files completely before generating anything.

Your task is to understand every requirement and propose a production-ready architecture for an AI Interview Agent.

The architecture must satisfy every mandatory requirement from the specification while remaining feasible within a hackathon.

Deliver:

• Complete feature list
• User flow
• API flow
• Database schema (if needed)
• Folder structure
• Component hierarchy
• AI workflow
• Conversation memory design
• RAG strategy
• Evaluation strategy
• Tech stack
• UI pages
• Edge cases
• Stretch features that increase judging score

Do not write code yet.
```

**Purpose**: Initial project requirements definition, system architecture design, and feature layout planning.

---

### 2. User Instruction (2026-08-07T15:27:35Z)
```text
API keys have been enabled but still there is no response from the interviewer
```

**Purpose**: Debugging initial interviewer response issues after configuring API keys.

---

### 3. User Instruction (2026-08-07T15:42:58Z)
```text
Initialization error: {"error":{"code":404,"message":"models/gemini-1.5-pro is not found for API version v1beta, or is not supported for generateContent. Call ModelService.ListModels to see the list of available models and their supported methods.","status":"NOT_FOUND"}}
```

**Purpose**: Resolving model version loading errors (Gemini 1.5 Pro endpoint availability issues).

---

### 4. User Instruction (2026-08-07T15:55:55Z)
```text
Error: {"error":{"code":429,"message":"You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. \n* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.5-flash\nPlease retry in 26.593599834s.","status":"RESOURCE_EXHAUSTED","details":[{"@type":"type.googleapis.com/google.rpc.Help","links":[{"description":"Learn more about Gemini API quotas","url":"https://ai.google.dev/gemini-api/docs/rate-limits"}]},{"@type":"type.googleapis.com/google.rpc.QuotaFailure","violations":[{"quotaMetric":"generativelanguage.googleapis.com/generate_content_free_tier_requests","quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier","quotaDimensions":{"location":"global","model":"gemini-3.5-flash"},"quotaValue":"20"}]},{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"26s"}]}} what this issue tells
```

**Purpose**: Investigating Gemini API rate limit constraints and resource exhaustion.

---

### 5. User Instruction (2026-08-07T15:58:16Z)
```text
when deploying it as real product we shouldnt face this issue regarding the limit..so delay and give response once limit resets
```

**Purpose**: Designing error handling policies for API rate limits and implementing graceful retry/delay logic.

---

### 6. User Instruction (2026-08-07T16:06:15Z)
```text
can we use anyother ai that is without limits
```

**Purpose**: Exploring alternative LLM service providers to bypass quota limitations.

---

### 7. User Instruction (2026-08-07T16:07:28Z)
```text
is qroq ai good for this project?
```

**Purpose**: Evaluating Groq API speed, feasibility, and model options for real-time interview generation.

---

### 8. User Instruction (2026-08-07T16:09:14Z)
```text
gsk_[REDACTED_API_KEY]    use this groq api key
```

**Purpose**: Adding the Groq API key credential to the backend environment configurations.

---

### 9. User Instruction (2026-08-07T16:38:26Z)
```text
the evaluation process is not shown in recruiter dashboard page and still it is showing gemini enabled so remove that...evalute and show full report in dashboard
```

**Purpose**: Integrating the grading system with the recruiter dashboard and removing outdated UI flags.

---

### 10. User Instruction (2026-08-07T16:51:33Z)
```text
still not evaluating
```

**Purpose**: Debugging evaluation trigger failures when session completes.

---

### 11. User Instruction (2026-08-07T17:09:50Z)
```text
add option for generating the report as pdf with all the person details and the review...and generate a overall performace rating of the person...and since this is an onilne interview there is a high chance of cheating, so start the interview in full screen mode, restrict shortcut keys(copy,paste etc), restrict extensions,tab switches,highlighting text, anypopup ai tools that generate answers,and restrict block using char length checking once evry 200ms
```

**Purpose**: Implementing PDF export, custom performance rating logic, and proctoring controls (fullscreen locks, key blocks, and interval checks).

---

### 12. User Instruction (2026-08-07T17:25:13Z)
```text
the report is generated like this and then whats the use of these 6 options..also change the ui completelyYou are an award-winning Senior Product Designer and Frontend Engineer specializing in premium AI SaaS applications.

Your task is to design and build a world-class UI for an AI Interview Agent that could compete with products like ChatGPT, Perplexity AI, Cursor, Linear, Vercel, and Notion.

This is for a hackathon, so the UI must immediately impress judges.

=========================================================
DESIGN GOAL
=========================================================

The UI should feel premium, futuristic, elegant, and highly interactive.

The first impression should make users think:
"This looks like a funded startup."

Avoid generic admin dashboards.

The design should have personality while maintaining professionalism.

=========================================================
COLOR PALETTE
=========================================================

Primary:
Navy Blue (#0A2540)

Secondary:
Royal Blue (#2563EB)

Accent:
Cyan (#38BDF8)

Background:
#F8FAFC
#EEF4FF
White

Cards:
Glassmorphism with subtle blur

Text:
Dark Navy
Slate Gray

Success:
Emerald

=========================================================
DESIGN STYLE
=========================================================

Apple-level minimalism

Linear inspired spacing

Vercel typography

Perplexity AI layout

Cursor AI interactions

Modern AI SaaS

Soft gradients

Glassmorphism

Floating cards

Rounded corners (18-24px)

Premium shadows

Smooth blur effects

Elegant micro interactions

=========================================================
ANIMATIONS
=========================================================

Use multiple animation libraries.

Framer Motion

Motion One

GSAP

Lenis Smooth Scroll

React Spring (where suitable)

Lottie animations

Magic UI components

Aceternity UI animations

React Bits components (if useful)

Use animations throughout:

Page transitions

Hero animations

Card hover

Floating back
<truncated 2020 bytes>
e

Weaknesses

Strengths

Recommendations

Export buttons

=========================================================

6. Settings

Theme

Animation settings

Voice

Interview style

=========================================================

UX REQUIREMENTS
=========================================================

Mobile-first

Perfect responsiveness

Accessibility

Keyboard shortcuts

Dark mode

Light mode

Fast loading

Premium interactions

=========================================================
COMPONENTS
=========================================================

Use reusable components.

Animated Button

Gradient Card

Glass Card

Timeline

Progress Ring

Skill Chip

Stat Card

AI Message Bubble

Code Block

Animated Badge

Tooltip

Toast

Modal

Drawer

Command Palette

=========================================================
CHARTS
=========================================================

Use Recharts.

Animated

Responsive

Beautiful gradients

=========================================================
ICONS
=========================================================

Lucide React

Heroicons

Animated icons where appropriate

=========================================================
CODING STYLE
=========================================================

React

Vite

Tailwind CSS

TypeScript

Framer Motion

Component-based architecture

Reusable

Clean folder structure

Maintainable

=========================================================
IMPORTANT
=========================================================

Do NOT build a generic dashboard.

Design this like a premium AI startup product that could win a design award.

Every section should contain subtle animations.

Every interaction should feel smooth.

Every page transition should feel cinematic.

Prioritize aesthetics without sacrificing usability.

The final product should look significantly better than a typical hackathon submission....
```

**Purpose**: Redesigning the frontend dashboard and user interface from standard templates to a high-fidelity AI SaaS design system.

---

### 13. User Instruction (2026-08-07T17:46:27Z)
```text
Console Error

React has detected a change in the order of Hooks called by RecruiterDashboard. This will lead to bugs and errors if not fixed. For more information, read the Rules of Hooks: https://react.dev/link/rules-of-hooks

   Previous render            Next render
   ------------------------------------------------------
1. useState                   useState
2. useState                   useState
3. useState                   useState
4. useState                   useState
5. useState                   useState
6. useState                   useState
7. useState                   useState
8. useEffect                  useEffect
9. useEffect                  useEffect
10. useEffect                 useEffect
11. undefined                 useState
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Show More
src\app\recruiter\page.tsx (122:45) @ RecruiterDashboard


  120 |   ] : [];
  121 |
> 122 |   const [activeTab, setActiveTab] = useState<'candidates' | 'results' | 'settings'>('candidates');
      |                                             ^
  123 |   const [difficulty, setDifficulty] = useState<'JUNIOR' | 'MID' | 'SENIOR'>('MID');
  124 |   const [proctorStrictness, setProctorStrictness] = useState<'SOFT' | 'STRICT' | 'PARALYZE'>('STRICT');
  125 |   const [synthVoice, setSynthVoice] = useState<'MALE' | 'FEMALE' | 'MUTED'>('FEMALE');
Call Stack
19

Show 18 ignore-listed frame(s)
RecruiterDashboard
src\app\recruiter\page.tsx (122:45)
1
2 fix
```

**Purpose**: Fixing a React Hooks violation ('Rules of Hooks') in the RecruiterDashboard component.

---

### 14. User Instruction (2026-08-07T17:56:12Z)
```text
fix these and remove ai configurations..single screen interview is enough..in report pdf only first turn is visible...remove separate scroll option for techinical diagnostics
```

**Purpose**: Streamlining the interview screen, removing developer configs, and fixing layout bugs in the PDF exporter.

---

### 15. User Instruction (2026-08-07T18:02:44Z)
```text
text not visible
```

**Purpose**: Fixing contrast and readability issues with dark/light text rendering.

---

### 16. User Instruction (2026-08-07T18:14:48Z)
```text
after scrolling the screen is like this fix it...remove empty spaces..add option to enter new user by adding json code..instead of blue use purple color..change font of abtalks vibe..remvoe hackathon mentioning..remove enter recruiter hub...use image in home page bg
```

**Purpose**: Removing unwanted layout white-spaces, enabling manual candidate JSON importing, and switching color themes from blue to purple.

---

### 17. User Instruction (2026-08-07T18:25:36Z)
```text
continue and  no text visible in home page due to the bg image
```

**Purpose**: General development support task / code refinement.

---

### 18. User Instruction (2026-08-07T18:41:34Z)
```text
so many blank space there as shown in first img...and still the texts are not clear in home page...instead of splitting screen for executive summary and technical diagnostics, show them one by one so that the unwanted blank spaces can be removed......add search option to search candidates...
```

**Purpose**: Refactoring the recruiter layout to display summary sections sequentially and adding search inputs.

---

### 19. User Instruction (2026-08-07T18:45:13Z)
```text
show all candidate name and above that add ptio to search
```

**Purpose**: Updating the search bar implementation and candidate lists layout.

---

### 20. User Instruction (2026-08-07T18:54:12Z)
```text
design and formatting is okay but colour is not good so suggest me good colour combos
```

**Purpose**: Inquiring about visual color systems and design recommendations for light/dark interfaces.

---

### 21. User Instruction (2026-08-07T18:56:31Z)
```text
use only black and white..light theme as well as dark theme..
```

**Purpose**: Implementing a sleek, minimal monochrome styling palette for light and dark themes.

---

### 22. User Instruction (2026-08-07T19:08:05Z)
```text
remove these kind of dots everywhere,,dont show which ai model we are using....use old interview screen just questions and answers in full screen..remove that box showing abtalks...add light and dark theme
```

**Purpose**: Removing unnecessary UI decorative items, hiding internal model names, and introducing the theme toggler.

---

### 23. User Instruction (2026-08-07T19:18:22Z)
```text
start in full screen and dont show these things...interview should be in full page not in small box..dont tell interviewerthinking voic etc, just questions and answers
```

**Purpose**: Adjusting interview room configurations to open in full screen page-wide layouts.

---

### 24. User Instruction (2026-08-07T19:21:44Z)
```text
show sun moon theme option after entering recruiter age not in home page
```

**Purpose**: Refining placement of the theme toggler after candidate credentials entry.

---

### 25. User Instruction (2026-08-07T19:27:20Z)
```text
i need this type of interview screen..it should automatically start in full screen and dont allo violations(tabswitch,copy,paste etc) instead show an option to end interview
```

**Purpose**: Adjusting interview room configurations to open in full screen page-wide layouts.

---

### 26. User Instruction (2026-08-08T05:52:05Z)
```text
next questions are not asked..allowing tab switches...interview not ending after giving end interview
```

**Purpose**: Debugging session flow and next-turn rendering failures.

---

### 27. User Instruction (2026-08-08T06:00:53Z)
```text
the warning should come faster and allow 2 warning and terminaate in 3rd warning...till 2 warning they can continue ..and warning msg is not clear oth text and bg is black...
```

**Purpose**: Fine-tuning proctoring warnings count rules and contrast settings.

---

### 28. User Instruction (2026-08-08T06:07:09Z)
```text
exam should be in same tab..when terminated or came out the interview should be over and evaluated..no re attempt and continuing of the interview
```

**Purpose**: Implementing auto-termination evaluation when the user tries to bypass tabs or exit.

---

### 29. User Instruction (2026-08-08T15:29:04Z)
```text
i got terminated and im able to attend interview again..and then once the interview is completed dont show start interview button...when i end interview without attending any question it is showing 3.5/5 rating..start interview button should be more highlighted..provide evaluation reports under each persons matrix not separate button at top...while ending interview it is showing warning...once interview started then they cannot attend again no matter whether he left or terminated what ever it is
```

**Purpose**: Preventing re-entries for terminated sessions and displaying evaluation metrics in-line.

---

### 30. User Instruction (2026-08-08T15:48:14Z)
```text
for everyone it is showing assesment completed..no pending completed or attend interview option should only available
```

**Purpose**: Correcting status listings inside the recruiter dashboard candidates grid.

---

### 31. User Instruction (2026-08-08T15:54:00Z)
```text
why it is showing in progress..it should be completed and review and rating should be given or not started...and then first question is not visible in screen
```

**Purpose**: Fixing status mapping logic and resolving welcome question rendering failures.

---

### 32. User Instruction (2026-08-08T16:30:19Z)
```text
not fixed anything
```

**Purpose**: Checking resolution progress on proctoring bugs.

---

### 33. User Instruction (2026-08-08T16:31:44Z)
```text
jm,,.k
```

**Purpose**: Keyboard check / test user input entry.

---

### 34. User Instruction (2026-08-08T16:36:41Z)
```text
remove all interview attempts
```

**Purpose**: Wiping database session records to clean up previous developer attempts.

---

### 35. User Instruction (2026-08-09T09:30:13Z)
```text
Dynamic Scrambled Custom Font Mappings
Create a font mapping where character keycodes are completely scrambled (e.g. keycode for 'H' displays glyph 'E', etc.).
The browser displays the text visually correctly, but any OCR camera attempt or clipboard grabber attempting to process the raw content will capture absolute gibberish.
```

**Purpose**: Designing and adding the dynamically scrambled character-to-glyph Font mapping obfuscation feature.

---

### 36. User Instruction (2026-08-09T09:38:21Z)
```text
im not able to write properly ..the questions should be scrambled text not the answers
```

**Purpose**: Targeting scrambling features strictly to interviewer question text to preserve typing usability.

---

### 37. User Instruction (2026-08-09T10:19:45Z)
```text
still im able to take photos of the question clearly
```

**Purpose**: Addressing camera recording concerns by experimenting with visual obfuscation tools.

---

### 38. User Instruction (2026-08-09T10:52:13Z)
```text
change the circular mask into a square and increase its size
```

**Purpose**: Modifying the font overlay mask shape to a square.

---

### 39. User Instruction (2026-08-09T10:59:18Z)
```text
make it a rectangle so that it is easy to read
```

**Purpose**: Adjusting the visual mask shape to a larger rectangle.

---

### 40. User Instruction (2026-08-09T11:28:16Z)
```text
removethis feature..let the text be fully visible
```

**Purpose**: Removing the camera mask feature entirely and restoring full text visibility.

---

### 41. User Instruction (2026-08-09T11:31:27Z)
```text
https://github.com/Pravin17-Hub/AI-Interview-Agent.git push the project to this repo
```

**Purpose**: Configuring Git remote origin and attempting initial repository push.

---

### 42. User Instruction (2026-08-09T11:33:40Z)
```text
help me with deployment
```

**Purpose**: Inquiring about hosting options and deployment paths for Next.js in production.

---

### 43. User Instruction (2026-08-09T11:36:52Z)
```text
i want to use postgresql
```

**Purpose**: Migrating the datasource configuration from SQLite to a production-ready PostgreSQL model.

---

### 44. User Instruction (2026-08-09T11:55:09Z)
```text
query to create tables
```

**Purpose**: Generating the PostgreSQL SQL DDL schema commands for manual table creation.

---

### 45. User Instruction (2026-08-09T12:02:28Z)
```text
in db url key do i need to enter which key
```

**Purpose**: Clarifying Supabase PostgreSQL connection string URI format details.

---

### 46. User Instruction (2026-08-09T12:18:28Z)
```text
how to add the candidate data in db
```

**Purpose**: Explaining candidates JSON data configuration pathways and API endpoints.

---

### 47. User Instruction (2026-08-09T12:20:12Z)
```text
currently no data in db how to sync old data
```

**Purpose**: Creating a mock database seeding script to populate candidate records.

---

### 48. User Instruction (2026-08-09T12:24:50Z)
```text
do i need to push again
```

**Purpose**: Confirming if local modifications (seeding scripts) should be committed to remote origin.

---

### 49. User Instruction (2026-08-09T12:33:42Z)
```text
PS C:\Users\Dell\Desktop\AI Interview Agent> npx prisma db push
Loaded Prisma config from prisma.config.ts.

Prisma config detected, skipping environment variable loading.
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "db.utqjvoipvurluitibfof.supabase.co:5432"

The database is already in sync with the Prisma schema.

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 114ms
┌─────────────────────────────────────────────────────────┐
│  Update available 6.19.3 -> 7.9.1                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘

PS C:\Users\Dell\Desktop\AI Interview Agent>
```

**Purpose**: Verifying schema sync success and client generation steps.

---

### 50. User Instruction (2026-08-09T12:39:41Z)
```text
run completed
```

**Purpose**: Confirming database seeding script has executed successfully.

---

### 51. User Instruction (2026-08-09T12:42:16Z)
```text
ai agents not generating questions
```

**Purpose**: Investigating backend 500 errors and blank pages on session start.

---

### 52. User Instruction (2026-08-09T12:46:05Z)
```text
1. no error msgs only blank screen
2. yes added
3. yes
```

**Purpose**: Debugging client-side rendering blockages and error hiding policies.

---

### 53. User Instruction (2026-08-09T12:50:46Z)
```text
E.C.P enabled
enable_copy.js:270 data is Object
enable_copy.js:274 isAggressiveModeOn true
enable_copy.js:35 enable copy top called
enable_copy.js:95 newInlineScriptUrl chrome-extension://fpjppnhnpnknbenelmbnidjbolhandnf/content_script_web_accessible/ecp_aggressive.js
enable_copy.js:252 enable copy executed
ecp_aggressive.js:10 E.C.P. aggresive inline script execution start.
ecp_aggressive.js:31 E.C.P. aggresive inline script execution successfully complete.
/api/interview?sessionId=session-CAND-001:1  Failed to load resource: the server responded with a status of 500 ()
/api/interview?sessionId=session-CAND-001:1  Failed to load resource: the server responded with a status of 500 ()
/api/interview:1  Failed to load resource: the server responded with a status of 500 ()
/api/interview:1  Failed to load resource: the server responded with a status of 500 ()
/api/interview:1  Failed to load resource: the server responded with a status of 500 ()
```

**Purpose**: Analyzing console logs showing Vercel API 500 connection timeouts.

---

### 54. User Instruction (2026-08-09T12:58:03Z)
```text
{"status":"error","message":"Failed to connect to the database.","error":"\nInvalid `prisma.$queryRaw()` invocation:\n\n\nCan't reach database server at `db.utqjvoipvurluitibfof.supabase.co:5432`\n\nPlease make sure your database server is running at `db.utqjvoipvurluitibfof.supabase.co:5432`.","prismaErrorMeta":null,"prismaErrorCode":null,"env":{"hasGroqKey":true,"hasGeminiKey":true,"dbUrlPrefix":"postgresql://postgres:vir..."}}
```

**Purpose**: Resolving Vercel-to-Supabase IPv6 direct connection failures.

---

### 55. User Instruction (2026-08-09T13:03:35Z)
```text
cant find  ouuler url
```

**Purpose**: General development support task / code refinement.

---

### 56. User Instruction (2026-08-09T13:14:44Z)
```text
no colour for skipped and unlisted
```

**Purpose**: Improving light mode contrast for Skipped and Unlisted timeline cells and legend keys.

---

### 57. User Instruction (2026-08-09T13:16:51Z)
```text
what does the red box indicate on date 7
```

**Purpose**: Explaining the significance of failed timeline status indicators.

---

### 58. User Instruction (2026-08-09T13:19:24Z)
```text
Review the complete AI conversation history for this project in this Antigravity IDE session/workspace.

Create a file named `prompts.md` in the project root.

The file must contain the actual prompts/instructions that I sent to the AI during development, in chronological order.

Requirements:
1. Include only prompts/messages written by me, not AI responses.
2. Preserve the original wording of my prompts as much as possible.
3. Do not invent, rewrite, or reconstruct prompts that are not present in the conversation history.
4. Include prompts related to:
   - Project planning
   - UI/UX design
   - Feature implementation
   - Code generation
   - Database/API development
   - Debugging
   - Error fixing
   - Testing
   - Deployment
   - Refactoring
5. Remove irrelevant conversational messages such as simple acknowledgements.
6. Keep the prompts in chronological order.
7. Number each prompt.
8. Add a short `Purpose` section below each prompt explaining what that prompt was used for.
9. At the top, include:
   - Project name
   - AI tool: Google Antigravity IDE
   - Development approach: AI-assisted / vibe coding
10. At the end, add a short summary of how AI was used in the project.

Most importantly: DO NOT fabricate or create prompts that are not actually present in the available conversation history.

Save the final result as:

prompts.md

After creating it, show me the file path and tell me how many actual user prompts were extracted.
```

**Purpose**: General development support task / code refinement.

---

## Summary of AI Usage

During this project, the AI functioned as a pair programmer, senior architect, and proctoring systems consultant:
1. **Architectural Scaffolding**: Structured the initial Next.js + TailwindCSS + Prisma application, implementing a modular candidate registry and dynamic LLM orchestration logic.
2. **API & Database Migration**: Guided transition from SQLite to a robust PostgreSQL setup (Supabase) under strict serverless networking rules (using transaction poolers to overcome Vercel-to-Supabase connection limits).
3. **Complex Feature Engineering**: Implemented advanced dynamic font-scrambling maps using `opentype.js` on the client-side to obfuscate OCR reads, along with custom proctoring handlers for tab-switching and keyboard intercepts.
4. **Iterative UI Refinement**: Adapted UI components to meet specific monochrome styling guidelines, optimized light/dark contrast values, and polished timeline grid representations.
5. **CI/CD Configuration & Debugging**: Assisted in resolving secret key push protections, git amendments, and live production error diagnostic routes to ensure successful deployment.
