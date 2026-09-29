import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = parseInt(process.env.PORT || '3000', 10);
const apiKey = process.env.GEMINI_API_KEY || '';

// Server-side Gemini client
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Latest Google candidate models in priority order
// Prioritizing models with separate quotas so gemini-3.8-flash token exhaustion automatically rotates
const CANDIDATE_MODELS = [
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash'
];

// Track quota-exhausted models with expiry (15 mins)
const quotaExhaustedMap = new Map<string, number>();

async function generateWithGemini(params: {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}): Promise<string | null> {
  if (!ai) return null;
  const now = Date.now();

  for (const model of CANDIDATE_MODELS) {
    const exhaustedUntil = quotaExhaustedMap.get(model);
    if (exhaustedUntil && now < exhaustedUntil) {
      // Model is temporarily quota-exhausted, skip to next candidate
      continue;
    }

    try {
      const config: any = {
        temperature: params.temperature ?? 0.7,
      };
      if (params.systemInstruction) {
        config.systemInstruction = params.systemInstruction;
      }
      if (params.responseMimeType) {
        config.responseMimeType = params.responseMimeType;
      }

      // 5-second timeout per model to ensure snappy UX
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout on model ${model}`)), 5000)
      );

      const generatePromise = ai.models.generateContent({
        model: model,
        contents: params.contents,
        config: config,
      }).then(res => res?.text || null);

      const text = await Promise.race([generatePromise, timeoutPromise]);
      if (text) {
        return text;
      }
    } catch (err: any) {
      const errMsg = String(err?.message || err);
      if (errMsg.includes('resource_exhausted') || errMsg.includes('Quota exceeded') || err?.status === 429) {
        console.warn(`[Gemini API] Quota exhausted for ${model}, rotating to alternative model.`);
        quotaExhaustedMap.set(model, now + 15 * 60 * 1000);
      } else {
        console.warn(`[Gemini API] Model ${model} unavailable:`, errMsg);
      }
      // Attempt next candidate model
    }
  }
  return null;
}

// Fallback catalog summary for context
const CATALOG_SUMMARY = `
NEXLAB Catalog Highlights:
- Crafting Interpreters by Robert Nystrom (Compilers, Bytecode, C/Java, Free Open Access)
- Designing Data-Intensive Applications by Martin Kleppmann (Distributed Systems, Databases, Storage Engines)
- Deep Learning by Ian Goodfellow, Yoshua Bengio, Aaron Courville (Seminal Neural Networks, Free Web Edition)
- Dive into Deep Learning by Aston Zhang et al. (PyTorch, Transformers, Vision, Free Open Access)
- Game Programming Patterns by Robert Nystrom (Game Architecture, ECS, Decoupling, C++, Free Web Edition)
- The Book of Shaders by Patricio Gonzalez Vivo & Jen Lowe (GLSL, Fragment Shaders, WebGL, Free Open Access)
- Eloquent JavaScript by Marijn Haverbeke (Modern JS, Async, Canvas, Free CC)
- Structure and Interpretation of Computer Programs by Harold Abelson & Gerald Jay Sussman (MIT Classic, Free Open Access)
- Pro Git by Scott Chacon & Ben Straub (Git Internals, Branching, Free CC)
- Shape Up by Ryan Singer (Basecamp, 6-Week Cycles, Appetite, Bets, Free Open Access)
- Refactoring UI by Adam Wathan & Steve Schoger (Design for Developers, Spacing, Visual Hierarchy)
- The Design of Everyday Things by Don Norman (Ergonomics, Affordances, Signifiers, Mental Models)
- The Nature of Code by Daniel Shiffman (Physics Simulation, Vectors, Particles, Autonomous Agents, Free CC)
- Zero to One by Peter Thiel (Startups, Monopolies, Power Law, Secrets)
- The Mom Test by Rob Fitzpatrick (Customer Discovery, Non-leading Interviews, Validation)
- Threat Modeling: Designing for Security by Adam Shostack (STRIDE, Threat Trees, Secure Arch)
- High Output Management by Andrew S. Grove (Managerial Leverage, 1-on-1s, OKRs, Operations)
- Cybernetics by Norbert Wiener (Feedback Loops, Control Systems, Public Domain)
- Show Your Work! by Austin Kleon (Content Strategy, Audience Building, Build in Public)
- INSPIRED by Marty Cagan (Product Discovery, Empowered Teams, Risk Mitigation)
- Python for Data Analysis by Wes McKinney (Pandas creator, Data Wrangling, Free Open Access)
- Clean Code by Robert C. Martin (Functions, Naming, Refactoring, TDD)
- The Pragmatic Programmer by David Thomas & Andrew Hunt (Software Craftsmanship, Orthogonality)
- Sketch of the Analytical Engine by Ada Lovelace (First Computer Algorithm 1843, Public Domain)
`;

// 1. AI Librarian Chat Endpoint
app.post('/api/gemini/librarian', async (req: Request, res: Response) => {
  try {
    const { messages, userProfile, currentGoal } = req.body;
    const lastUserMessage = messages?.[messages.length - 1]?.content || 'Hello';

    const systemInstruction = `You are NEXLAB AI, the personal digital librarian for developers, gamers, designers, content creators, founders, researchers, and technology professionals.
Tagline: "Knowledge for What You’re Building."
Your core purpose: discover and recommend the exact right books that match what the user is currently learning, building, or trying to achieve.

Behavior & Tone:
- Professional, knowledgeable, insightful, encouraging, and razor-sharp.
- Recommend books from the catalog or classic literature that match their user goal, skill level, current project, and available reading time.
- For EVERY recommendation, explain clearly WHY this book matches their exact goal.
- Highlight when books are legally free / open access (e.g. Crafting Interpreters, Game Programming Patterns, Deep Learning, SICP, Book of Shaders, Nature of Code, Shape Up, Eloquent JavaScript, Pro Git).
- Never recommend pirated or illegal sources.
- Format responses cleanly with readable markdown paragraphs and bullet points. No generic filler.

User Context:
Role: ${userProfile?.role || 'Builder'}
Skill Level: ${userProfile?.skillLevel || 'Intermediate'}
Current Goal: ${currentGoal || userProfile?.currentProject || 'Building modern software'}
Daily Reading Time: ${userProfile?.dailyReadingMinutes || 30} minutes/day
Interests: ${(userProfile?.interests || []).join(', ') || 'Technology & Design'}

Available Catalog:
${CATALOG_SUMMARY}
`;

    const prompt = `Conversation history:
${(messages || []).slice(-6).map((m: any) => `${m.sender === 'user' ? 'User' : 'NEXLAB AI'}: ${m.content}`).join('\n')}

User: ${lastUserMessage}
Respond as NEXLAB AI.`;

    const replyText = await generateWithGemini({
      contents: prompt,
      systemInstruction: systemInstruction,
      temperature: 0.7,
    });

    if (replyText) {
      // Extract book IDs mentioned
      const detectedBookIds: string[] = [];
      const idMap: Record<string, string> = {
        'crafting interpreters': 'crafting-interpreters',
        'designing data-intensive': 'designing-data-intensive-applications',
        'data-intensive applications': 'designing-data-intensive-applications',
        'deep learning': 'deep-learning-goodfellow',
        'dive into deep learning': 'dive-into-deep-learning',
        'game programming patterns': 'game-programming-patterns',
        'book of shaders': 'the-book-of-shaders',
        'eloquent javascript': 'eloquent-javascript',
        'structure and interpretation': 'sicp',
        'sicp': 'sicp',
        'pro git': 'pro-git',
        'shape up': 'shape-up',
        'refactoring ui': 'refactoring-ui',
        'design of everyday things': 'the-design-of-everyday-things',
        'nature of code': 'nature-of-code',
        'zero to one': 'zero-to-one',
        'mom test': 'the-mom-test',
        'threat modeling': 'threat-modeling-shostack',
        'high output management': 'high-output-management',
        'cybernetics': 'cybernetics-wiener',
        'show your work': 'show-your-work',
        'inspired': 'inspired-marty-cagan',
        'python for data analysis': 'python-for-data-analysis',
        'clean code': 'clean-code-martin',
        'pragmatic programmer': 'pragmatic-programmer',
        'ada lovelace': 'ada-lovelace-analytical-engine',
        'analytical engine': 'ada-lovelace-analytical-engine',
      };

      const lowerReply = (replyText + ' ' + lastUserMessage).toLowerCase();
      for (const [key, bookId] of Object.entries(idMap)) {
        if (lowerReply.includes(key) && !detectedBookIds.includes(bookId)) {
          detectedBookIds.push(bookId);
        }
      }

      return res.json({
        reply: replyText,
        recommendedBookIds: detectedBookIds.slice(0, 4),
        suggestedQuestions: [
          'What is the best chapter to start with?',
          'How should I structure my reading path with 30 mins a day?',
          'Are there legally free companion projects for this?'
        ]
      });
    }

    // High-quality trained fallback if Gemini model is in temporary high-demand
    const fallbackResponse = generateCuratedLibrarianResponse(lastUserMessage, userProfile);
    return res.json(fallbackResponse);
  } catch (error: any) {
    console.error('Error in /api/gemini/librarian:', error);
    const fallback = generateCuratedLibrarianResponse(req.body?.messages?.slice(-1)?.[0]?.content || '', req.body?.userProfile);
    return res.json(fallback);
  }
});

// 2. Intelligent Search Endpoint
app.post('/api/gemini/intelligent-search', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const prompt = `A user of the NEXLAB digital library is asking:
"${query}"

Based on the NEXLAB catalog below, provide:
1. A concise, intelligent summary (2-3 sentences) guiding the user on how to approach this domain or build goal.
2. Select the most relevant 2 to 4 book IDs from this exact list:
['crafting-interpreters', 'designing-data-intensive-applications', 'deep-learning-goodfellow', 'dive-into-deep-learning', 'game-programming-patterns', 'the-book-of-shaders', 'eloquent-javascript', 'sicp', 'pro-git', 'shape-up', 'refactoring-ui', 'the-design-of-everyday-things', 'nature-of-code', 'zero-to-one', 'the-mom-test', 'threat-modeling-shostack', 'high-output-management', 'cybernetics-wiener', 'show-your-work', 'inspired-marty-cagan', 'python-for-data-analysis', 'clean-code-martin', 'pragmatic-programmer', 'ada-lovelace-analytical-engine']
3. Explain briefly why each matches their goal.

Catalog Summary:
${CATALOG_SUMMARY}

Format your output as JSON with this structure:
{
  "synthesizedInsight": "Insightful guidance...",
  "recommendations": [
    { "bookId": "exact-id", "rationale": "Why this matches..." }
  ],
  "relatedTopics": ["Topic 1", "Topic 2", "Topic 3"]
}
`;

    const rawJson = await generateWithGemini({
      contents: prompt,
      responseMimeType: 'application/json',
      temperature: 0.4,
    });

    if (rawJson) {
      try {
        const parsed = JSON.parse(rawJson);
        return res.json(parsed);
      } catch {
        // Fall through to curated search
      }
    }

    // Curated fallback search
    const searchFallback = generateCuratedSearchResponse(query);
    return res.json(searchFallback);
  } catch (error: any) {
    console.error('Error in /api/gemini/intelligent-search:', error);
    const searchFallback = generateCuratedSearchResponse(req.body?.query || '');
    return res.json(searchFallback);
  }
});

// 3. Custom Reading Path Generator
app.post('/api/gemini/generate-path', async (req: Request, res: Response) => {
  try {
    const { goal, currentLevel, weeklyHours } = req.body;
    const prompt = `Generate a rigorous, multi-stage reading path for:
Goal: "${goal}"
Current Level: "${currentLevel || 'Intermediate'}"
Weekly Available Hours: ${weeklyHours || 5} hours/week

Pick 4 to 5 structured sequential milestones.
Reference relevant books from this catalog when applicable:
['crafting-interpreters', 'designing-data-intensive-applications', 'deep-learning-goodfellow', 'dive-into-deep-learning', 'game-programming-patterns', 'the-book-of-shaders', 'eloquent-javascript', 'sicp', 'pro-git', 'shape-up', 'refactoring-ui', 'the-design-of-everyday-things', 'nature-of-code', 'zero-to-one', 'the-mom-test', 'threat-modeling-shostack', 'high-output-management', 'cybernetics-wiener', 'show-your-work', 'inspired-marty-cagan', 'python-for-data-analysis', 'clean-code-martin', 'pragmatic-programmer']

Return JSON strictly formatted:
{
  "title": "Title of Reading Path",
  "tagline": "Short evocative tagline",
  "description": "Comprehensive path summary",
  "estimatedTotalHours": 60,
  "stages": [
    {
      "order": 1,
      "name": "Stage Name",
      "summary": "Stage description",
      "recommendedBookIds": ["book-id"],
      "milestoneGoal": "Concrete milestone project to complete",
      "estimatedHours": 15
    }
  ]
}`;

    const rawJson = await generateWithGemini({
      contents: prompt,
      responseMimeType: 'application/json',
      temperature: 0.5,
    });

    if (rawJson) {
      try {
        const parsed = JSON.parse(rawJson);
        return res.json(parsed);
      } catch {
        // Fall through to domain-synthesized path
      }
    }

    // Domain-aware synthesized path
    const fallbackPath = generateCuratedPath(goal);
    return res.json(fallbackPath);
  } catch (error: any) {
    console.error('Error in /api/gemini/generate-path:', error);
    const fallbackPath = generateCuratedPath(req.body?.goal || 'Architectural Mastery');
    return res.json(fallbackPath);
  }
});

function generateCuratedPath(goal: string) {
  const g = (goal || '').toLowerCase();
  if (g.includes('backend') || g.includes('distributed') || g.includes('database')) {
    return {
      title: `Path: Advanced Backend & Distributed Systems`,
      tagline: 'Mastering data engines, replication, and concurrency invariants',
      description: `Structured progression from core clean architecture to distributed consensus and resilient transaction pipelines for ${goal}.`,
      estimatedTotalHours: 54,
      stages: [
        {
          order: 1,
          name: 'Clean Code & Concurrency Fundamentals',
          summary: 'Eliminate code smells and structure decoupled domain services.',
          recommendedBookIds: ['clean-code-martin', 'pragmatic-programmer'],
          milestoneGoal: 'Refactor a monolithic service into decoupled modules with pure unit tests.',
          estimatedHours: 12
        },
        {
          order: 2,
          name: 'Storage Engines & Query Access Patterns',
          summary: 'Deep dive into LSM-trees, B-trees, indexing, and WAL journaling.',
          recommendedBookIds: ['designing-data-intensive-applications'],
          milestoneGoal: 'Benchmark read/write amplification across Postgres and Redis for a high-throughput endpoint.',
          estimatedHours: 16
        },
        {
          order: 3,
          name: 'Distributed Consensus & Replication',
          summary: 'Understand leader election, Raft, partition tolerance, and eventual consistency.',
          recommendedBookIds: ['designing-data-intensive-applications'],
          milestoneGoal: 'Implement an idempotent event-driven queue with distributed idempotency keys.',
          estimatedHours: 14
        },
        {
          order: 4,
          name: 'Threat Modeling & Defensive Operations',
          summary: 'Secure API gateways and model STRIDE threats across boundary surfaces.',
          recommendedBookIds: ['threat-modeling-shostack'],
          milestoneGoal: 'Publish a threat model document and verify zero-trust authentication.',
          estimatedHours: 12
        }
      ]
    };
  }

  if (g.includes('game') || g.includes('unreal') || g.includes('unity') || g.includes('shader')) {
    return {
      title: `Path: Game Architecture & Shader Mathematics`,
      tagline: 'From component patterns to real-time procedural rendering',
      description: `Comprehensive roadmap covering game loops, decoupled entity-component systems, physics simulation, and GLSL fragment shaders.`,
      estimatedTotalHours: 48,
      stages: [
        {
          order: 1,
          name: 'Game Programming Patterns & Decoupling',
          summary: 'Master Entity-Component-System, Object Pools, and Event Queues to maintain 60+ FPS.',
          recommendedBookIds: ['game-programming-patterns'],
          milestoneGoal: 'Build a decoupled game loop with object pool allocation in C++ or C#.',
          estimatedHours: 14
        },
        {
          order: 2,
          name: 'Mathematical Physics & Autonomous Agents',
          summary: 'Simulate Newtonian forces, particle systems, and Craig Reynolds steering behaviors.',
          recommendedBookIds: ['nature-of-code'],
          milestoneGoal: 'Implement an autonomous boids flocking simulation with spatial obstacle avoidance.',
          estimatedHours: 14
        },
        {
          order: 3,
          name: 'Fragment Shaders & Procedural Lighting',
          summary: 'Harness GPU parallelism with GLSL raymarching, Signed Distance Fields, and noise.',
          recommendedBookIds: ['the-book-of-shaders'],
          milestoneGoal: 'Render an interactive raymarched 3D scene in WebGL with ambient occlusion.',
          estimatedHours: 20
        }
      ]
    };
  }

  return {
    title: `Path: ${goal}`,
    tagline: 'Customized progression toward architectural mastery',
    description: `A curated progression tailored specifically for your target objective: ${goal}.`,
    estimatedTotalHours: 48,
    stages: [
      {
        order: 1,
        name: 'Core Foundations & Mental Models',
        summary: 'Establish theoretical ground truth and eliminate conceptual blind spots.',
        recommendedBookIds: ['pragmatic-programmer'],
        milestoneGoal: 'Write an architectural design spike outlining your technical invariants.',
        estimatedHours: 12
      },
      {
        order: 2,
        name: 'Applied Implementation & Tooling',
        summary: 'Build concrete working prototypes and explore design trade-offs.',
        recommendedBookIds: ['crafting-interpreters', 'designing-data-intensive-applications'],
        milestoneGoal: 'Implement the core subsystem with automated test suites.',
        estimatedHours: 18
      },
      {
        order: 3,
        name: 'Production Hardening & Ergonomics',
        summary: 'Refine performance, security, and human-centered user experience.',
        recommendedBookIds: ['refactoring-ui', 'the-design-of-everyday-things'],
        milestoneGoal: 'Ship an end-to-end milestone to production.',
        estimatedHours: 18
      }
    ]
  };
}

// Curated fallbacks for graceful offline/keyless reliability
function generateCuratedLibrarianResponse(query: string, profile: any) {
  const q = query.toLowerCase();
  if (q.includes('backend') || q.includes('database') || q.includes('distributed') || q.includes('scale')) {
    return {
      reply: `For backend engineering and scalable system design, your foundational companion is **Designing Data-Intensive Applications** by Martin Kleppmann.

Kleppmann breaks down the exact trade-offs behind storage engines (LSM-trees vs B-Trees), replication strategies, and distributed consensus. 

To maintain clean service boundaries, pair it with **The Pragmatic Programmer** by David Thomas & Andrew Hunt to sharpen your everyday defensive programming and architectural judgment.

If you have 30 minutes a day, focus on reading one section of Kleppmann's Chapter 3 (Storage & Retrieval) per evening—it will immediately transform how you query your database.`,
      recommendedBookIds: ['designing-data-intensive-applications', 'pragmatic-programmer'],
      suggestedQuestions: [
        'How should I study LSM-trees vs B-trees?',
        'What reading path should I follow for senior backend roles?',
        'Which free books cover distributed consensus?'
      ]
    };
  }

  if (q.includes('game') || q.includes('unreal') || q.includes('unity') || q.includes('physics') || q.includes('shader')) {
    return {
      reply: `For game development, start with the masterclass duo:

1. **Game Programming Patterns** by Robert Nystrom (Available completely **Free & Open Access**): Learn the Component pattern, Game Loops, Spatial Partitioning, and Object Pools that allow game engines to sustain 60+ FPS.
2. **The Book of Shaders** by Patricio Gonzalez Vivo & Jen Lowe (Also **Free & Open Access**): An interactive WebGL journey through fragment shaders, procedural noise, and raymarching.

If you want to simulate physics (vectors, gravity, spring oscillation), add **The Nature of Code** by Daniel Shiffman.`,
      recommendedBookIds: ['game-programming-patterns', 'the-book-of-shaders', 'nature-of-code'],
      suggestedQuestions: [
        'How do I implement the Component pattern in Unreal or Godot?',
        'Can I learn fragment shaders without deep linear algebra?',
        'What is the best way to architect a game state machine?'
      ]
    };
  }

  if (q.includes('frontend') || q.includes('ui') || q.includes('ux') || q.includes('design') || q.includes('css')) {
    return {
      reply: `To become an exceptional frontend and product developer:

1. **Refactoring UI** by Adam Wathan & Steve Schoger: Gives developers concrete, repeatable rules for spacing scales, visual hierarchy, typography contrast, and shadow depth.
2. **The Design of Everyday Things** by Don Norman: Teaches the psychological principles of affordances, signifiers, and mental models so your user interfaces make intuitive sense.
3. **Eloquent JavaScript (4th Edition)** by Marijn Haverbeke (Legally **Free & Open Access**): Essential for understanding asynchronous event loops, DOM performance, and prototype architecture.`,
      recommendedBookIds: ['refactoring-ui', 'the-design-of-everyday-things', 'eloquent-javascript'],
      suggestedQuestions: [
        'How do I create a strict 4px/8px spacing system?',
        'What are the key affordance rules for complex dashboards?',
        'Where can I practice building interactive Canvas components?'
      ]
    };
  }

  if (q.includes('startup') || q.includes('saas') || q.includes('founder') || q.includes('business')) {
    return {
      reply: `For building a high-impact tech startup or SaaS product:

1. **The Mom Test** by Rob Fitzpatrick: Mandatory reading before you write a single line of code. It teaches you how to talk to customers and uncover genuine willingness to pay without being misled by compliments.
2. **Shape Up** by Ryan Singer (Basecamp's official handbook, **Free & Open Access**): Teaches how to scope work with an appetite, run 6-week cycles, and kill bloated backlogs.
3. **Zero to One** by Peter Thiel: Clarifies how to build durable monopolies and identify contrarian secrets.`,
      recommendedBookIds: ['the-mom-test', 'shape-up', 'zero-to-one'],
      suggestedQuestions: [
        'How do I conduct my first 10 customer interviews?',
        'How does Shape Up replace traditional Scrum backlogs?',
        'What are the best metrics to validate a SaaS MVP?'
      ]
    };
  }

  if (q.includes('ai') || q.includes('machine learning') || q.includes('deep learning') || q.includes('llm')) {
    return {
      reply: `For mastering AI and deep learning:

1. **Dive into Deep Learning (D2L.ai)**: An extraordinary **Free Open Access** interactive textbook with runnable PyTorch and JAX notebooks for attention mechanisms, Transformers, and CNNs.
2. **Deep Learning** by Ian Goodfellow, Yoshua Bengio, & Aaron Courville: The definitive theoretical reference on backpropagation mathematics and representation learning (Free official web version).
3. **Cybernetics** by Norbert Wiener: The foundational text exploring feedback loops, self-correcting systems, and autonomous agency.`,
      recommendedBookIds: ['dive-into-deep-learning', 'deep-learning-goodfellow', 'cybernetics-wiener'],
      suggestedQuestions: [
        'How do self-attention mechanisms work mathematically?',
        'What is the best path from PyTorch basics to fine-tuning LLMs?',
        'Which chapters in Goodfellow cover generative loss landscapes?'
      ]
    };
  }

  if (q.includes('content') || q.includes('creator') || q.includes('strategy') || q.includes('audience') || q.includes('write')) {
    return {
      reply: `For content creators, technical writers, and audience builders:

1. **Show Your Work!** by Austin Kleon: The manifesto for building an authentic audience by sharing your process, experiments, and daily discoveries instead of pretending to be a genius.
2. **Refactoring UI** by Adam Wathan & Steve Schoger: Polish your graphics, slide decks, and digital media with rock-solid visual hierarchy and typography rules.
3. **The Mom Test** by Rob Fitzpatrick: Crucial for understanding what your audience actually values and will pay for versus polite praise.`,
      recommendedBookIds: ['show-your-work', 'refactoring-ui', 'the-mom-test'],
      suggestedQuestions: [
        'How do I build in public without giving away core advantages?',
        'What is the daily documentation habit recommended in Show Your Work?',
        'How can technical founders write engaging technical essays?'
      ]
    };
  }

  if (q.includes('security') || q.includes('cyber') || q.includes('threat') || q.includes('auth') || q.includes('fintech')) {
    return {
      reply: `For cybersecurity, secure software architecture, and fintech platforms:

1. **Threat Modeling: Designing for Security** by Adam Shostack: The definitive guide on STRIDE threat matrices, finding flaws before attackers do, and designing resilient boundaries.
2. **Designing Data-Intensive Applications** by Martin Kleppmann: Critical for understanding immutable audit logs, ACID transactions, and distributed consensus required for fintech systems.
3. **Clean Code** by Robert C. Martin: Minimize security vulnerabilities caused by spaghetti logic, ambiguous side-effects, and unhandled edge cases.`,
      recommendedBookIds: ['threat-modeling-shostack', 'designing-data-intensive-applications', 'clean-code-martin'],
      suggestedQuestions: [
        'How do I author a STRIDE threat model document?',
        'What are the consensus guarantees needed for financial transactions?',
        'How do I securely audit authentication boundaries?'
      ]
    };
  }

  if (q.includes('30 min') || q.includes('schedule') || q.includes('time') || q.includes('busy') || q.includes('plan')) {
    return {
      reply: `With **30 minutes a day**, you can comfortably complete **12 to 15 high-signal technical books per year** using our micro-cadence approach:

- **Daily Protocol (20-25 mins)**: Read 1 focused chapter subsection (approx. 10–15 pages).
- **Daily Reflection (5 mins)**: Write 1 one-sentence architectural insight or note in your personal library.

**Recommended 90-Day Starter Sprint (30 mins/day)**:
1. **Weeks 1–3**: *The Pragmatic Programmer* (bite-sized, modular tips).
2. **Weeks 4–8**: *Designing Data-Intensive Applications* (read one subsection of Chapter 3/Storage Engines each evening).
3. **Weeks 9–12**: *Refactoring UI* (visual, tactical design rules for devs).`,
      recommendedBookIds: ['pragmatic-programmer', 'designing-data-intensive-applications', 'refactoring-ui'],
      suggestedQuestions: [
        'How do I maintain reading momentum with a demanding job?',
        'Should I take notes or highlight while reading?',
        'Which chapters in Kleppmann are highest leverage?'
      ]
    };
  }

  if (q.includes('python') || q.includes('data') || q.includes('pandas') || q.includes('analytics')) {
    return {
      reply: `For mastering data engineering and Python data science:

1. **Python for Data Analysis (3rd Edition)** by Wes McKinney (Creator of pandas, **Free Open Access**): Learn practical data wrangling, NumPy vectorized arrays, and time series manipulation from the library creator.
2. **Dive into Deep Learning (D2L.ai)** (**Free Open Access**): Implement PyTorch and JAX tensor operations directly in interactive runnable notebooks.
3. **Designing Data-Intensive Applications** by Martin Kleppmann: Essential for bridging the gap between batch analytics and streaming data pipelines.`,
      recommendedBookIds: ['python-for-data-analysis', 'dive-into-deep-learning', 'designing-data-intensive-applications'],
      suggestedQuestions: [
        'What are the core performance differences between pandas and Polars?',
        'How should I transition from data analysis to deep learning models?',
        'Where can I find free datasets to practice pandas wrangling?'
      ]
    };
  }

  if (q.includes('compiler') || q.includes('interpreter') || q.includes('virtual machine') || q.includes('sicp') || q.includes('language')) {
    return {
      reply: `For programming language implementation and runtime internals:

1. **Crafting Interpreters** by Robert Nystrom (**Free & Open Access**): The most engaging programming book ever written. You build an AST tree-walk interpreter in Java and an industrial-strength bytecode VM with garbage collector in C.
2. **Structure and Interpretation of Computer Programs (SICP)** by Harold Abelson & Gerald Jay Sussman (**Free & Open Access**): The classic MIT foundational text that teaches you to conceptualize programs as data and meta-linguistic abstraction.
3. **Sketch of the Analytical Engine** by Ada Lovelace (**Public Domain**): The original 1843 paper demonstrating the world's first computer algorithm and computational universalism.`,
      recommendedBookIds: ['crafting-interpreters', 'sicp', 'ada-lovelace-analytical-engine'],
      suggestedQuestions: [
        'Should I start with jlox (tree-walk) or clox (bytecode VM)?',
        'How does recursive descent parsing handle operator precedence?',
        'Why is Scheme/Lisp used in SICP for metalinguistic abstraction?'
      ]
    };
  }

  return {
    reply: `Welcome to **NEXLAB AI**. I am your personal digital librarian.

Tell me what you are currently learning, building, or trying to achieve—whether that is mastering distributed backend systems, writing a game engine, shipping a SaaS product, learning fragment shaders, or diving into deep learning.

I will recommend curated books, highlight verified legal free/open-access editions, and provide an actionable reading schedule matching your available time.`,
    recommendedBookIds: ['crafting-interpreters', 'designing-data-intensive-applications', 'refactoring-ui', 'game-programming-patterns'],
    suggestedQuestions: [
      'What should I read to become a better backend developer?',
      'Give me books for learning game development.',
      'I am building a SaaS. What books should I study?',
      'I have only 30 minutes a day. Give me a reading path.'
    ]
  };
}

function generateCuratedSearchResponse(query: string) {
  const q = query.toLowerCase();
  if (q.includes('game')) {
    return {
      synthesizedInsight: "Game development combines spatial mathematics, high-speed rendering pipelines, and decoupled software architecture. The key is mastering patterns like Component Systems and Object Pools before tackling shaders.",
      recommendations: [
        { bookId: 'game-programming-patterns', rationale: 'Essential architecture patterns to prevent game code from turning into spaghetti.' },
        { bookId: 'the-book-of-shaders', rationale: 'Live interactive GLSL guide for creating procedural graphics and lighting.' },
        { bookId: 'nature-of-code', rationale: 'Simulate Newtonian forces, particle dynamics, and autonomous steering behaviors.' }
      ],
      relatedTopics: ['Game Loops', 'GLSL Fragment Shaders', 'Component Systems', 'Vector Physics']
    };
  }
  if (q.includes('frontend') || q.includes('ui') || q.includes('css')) {
    return {
      synthesizedInsight: "Great frontend development bridges human visual psychology with crisp component architectures and strict accessibility. Focus on typographic hierarchy and spacing discipline.",
      recommendations: [
        { bookId: 'refactoring-ui', rationale: 'Tactical design rules for developers to create sleek, production-grade interfaces.' },
        { bookId: 'the-design-of-everyday-things', rationale: 'Understand how users build mental models, affordances, and signifiers.' },
        { bookId: 'eloquent-javascript', rationale: 'Master asynchronous event loops and browser DOM rendering mechanics.' }
      ],
      relatedTopics: ['Visual Hierarchy', 'Design Systems', 'Micro-interactions', 'WCAG AA Accessibility']
    };
  }
  if (q.includes('ai') || q.includes('startup') || q.includes('saas')) {
    return {
      synthesizedInsight: "Building an AI startup requires pairing deep transformer/embedding mechanics with ruthless customer problem validation and efficient 6-week shipping cadence.",
      recommendations: [
        { bookId: 'the-mom-test', rationale: 'Validate customer pain points and avoid misleading false positives.' },
        { bookId: 'dive-into-deep-learning', rationale: 'Hands-on interactive PyTorch implementations of modern transformer architectures.' },
        { bookId: 'shape-up', rationale: 'Basecamp method to ship concrete MVPs without getting bogged down in backlog churn.' }
      ],
      relatedTopics: ['Customer Discovery', 'Transformers', 'Fixed Appetite Scoping', 'Unit Economics']
    };
  }
  if (q.includes('backend') || q.includes('system') || q.includes('database') || q.includes('distributed') || q.includes('fintech')) {
    return {
      synthesizedInsight: "Robust backend systems rely on solid data modeling, clear concurrency boundaries, and an understanding of storage engine trade-offs (LSM-trees vs B-trees) under high network partitions.",
      recommendations: [
        { bookId: 'designing-data-intensive-applications', rationale: 'The seminal guide to distributed consensus, transactions, replication, and data models.' },
        { bookId: 'crafting-interpreters', rationale: 'Master low-level virtual machines, memory allocation, and execution stacks.' },
        { bookId: 'clean-code-martin', rationale: 'Maintain clear separation of domain layers and resilient defensive programming.' }
      ],
      relatedTopics: ['LSM-Trees', 'Distributed Consensus', 'Eventual Consistency', 'Idempotency Keys']
    };
  }
  if (q.includes('security') || q.includes('cyber') || q.includes('auth')) {
    return {
      synthesizedInsight: "Proactive security requires threat modeling during architecture design rather than patching vulnerabilities after deployment. STRIDE analysis exposes attack vectors early.",
      recommendations: [
        { bookId: 'threat-modeling-shostack', rationale: 'Actionable STRIDE threat trees and security architecture design.' },
        { bookId: 'designing-data-intensive-applications', rationale: 'Secure multi-tenant replication and tamper-evident write-ahead logs.' }
      ],
      relatedTopics: ['STRIDE Model', 'Boundary Auditing', 'Least Privilege', 'Cryptographic Nonces']
    };
  }
  if (q.includes('content') || q.includes('write') || q.includes('creator')) {
    return {
      synthesizedInsight: "Building an audience as a creator or founder starts with showing your work and sharing your learning process rather than waiting for an elusive masterpiece.",
      recommendations: [
        { bookId: 'show-your-work', rationale: 'The blueprint for daily documentation, generosity, and authentic discovery.' },
        { bookId: 'refactoring-ui', rationale: 'Elevate visual polish for media, diagrams, and digital products.' }
      ],
      relatedTopics: ['Building in Public', 'Documentation Habit', 'Visual Hierarchy', 'Personal Distribution']
    };
  }
  if (q.includes('python') || q.includes('data')) {
    return {
      synthesizedInsight: "Data engineering begins with fast vectorized in-memory transformations before moving to distributed batch and streaming pipelines.",
      recommendations: [
        { bookId: 'python-for-data-analysis', rationale: 'Official guide to pandas, NumPy, and structured time series wrangling.' },
        { bookId: 'dive-into-deep-learning', rationale: 'Hands-on interactive neural architectures with runnable code.' }
      ],
      relatedTopics: ['Vectorization', 'Pandas & Polars', 'Tensors', 'Data Pipelines']
    };
  }
  return {
    synthesizedInsight: "Discover books matched precisely to your current project. High-signal literature cuts through weeks of trial and error.",
    recommendations: [
      { bookId: 'crafting-interpreters', rationale: 'Understand software from first principles by building two complete language interpreters.' },
      { bookId: 'designing-data-intensive-applications', rationale: 'The definitive architectural guide to distributed systems, replication, and storage engines.' }
    ],
    relatedTopics: ['System Architecture', 'Compilers', 'Distributed Systems', 'Software Craftsmanship']
  };
}

// Production / Dev Vite Middleware Setup
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve static files from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Vite Dev Middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NEXLAB server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
