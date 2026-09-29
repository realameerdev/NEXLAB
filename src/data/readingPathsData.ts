import { ReadingPath } from '../types';

export const READING_PATHS_DATA: ReadingPath[] = [
  {
    id: 'full-stack-developer',
    title: 'Become a Full-Stack Developer',
    tagline: 'From modern browser runtimes to high-throughput distributed system design',
    description: 'A complete, rigorous engineering curriculum that takes you from fundamental client-side protocols through language deep dives, backend data modeling, and distributed production architecture.',
    category: 'Development',
    estimatedTotalHours: 110,
    targetRole: 'Senior Full-Stack Engineer',
    stages: [
      {
        order: 1,
        name: 'Web Fundamentals',
        summary: 'Master the HTTP protocol, browser event loops, DOM rendering pipelines, and modern CSS layout engines.',
        recommendedBookIds: ['eloquent-javascript', 'refactoring-ui'],
        milestoneGoal: 'Build an interactive web application with zero framework overhead and 100/100 Lighthouse performance.',
        estimatedHours: 15
      },
      {
        order: 2,
        name: 'JavaScript & Runtime Internals',
        summary: 'Deep dive into asynchronous runtimes, prototype chains, memory profiling, and event-driven architecture.',
        recommendedBookIds: ['eloquent-javascript'],
        milestoneGoal: 'Implement an asynchronous state engine and custom event bus from scratch.',
        estimatedHours: 18
      },
      {
        order: 3,
        name: 'Backend Development & Clean Code',
        summary: 'Architect maintainable server-side applications with separation of concerns, test-driven development, and clean boundaries.',
        recommendedBookIds: ['clean-code-martin', 'pragmatic-programmer'],
        milestoneGoal: 'Design a clean modular service layer with comprehensive unit tests and automated CI/CD.',
        estimatedHours: 16
      },
      {
        order: 4,
        name: 'Databases & Storage Engines',
        summary: 'Explore relational and document databases, B-trees, LSM-trees, ACID guarantees, and indexing strategies.',
        recommendedBookIds: ['designing-data-intensive-applications'],
        milestoneGoal: 'Benchmark read/write workloads across relational and key-value storage under high concurrency.',
        estimatedHours: 20
      },
      {
        order: 5,
        name: 'APIs & Communication Protocols',
        summary: 'Design idiomatic REST, GraphQL, and streaming WebSocket protocols with schema validation and authentication.',
        recommendedBookIds: ['threat-modeling-shostack', 'pro-git'],
        milestoneGoal: 'Deploy a multi-tenant API gateway with rate-limiting and OAuth2 token verification.',
        estimatedHours: 14
      },
      {
        order: 6,
        name: 'System Design & Distributed Data',
        summary: 'Learn leaderless replication, partition strategies, consensus protocols, and caching topologies.',
        recommendedBookIds: ['designing-data-intensive-applications'],
        milestoneGoal: 'Produce a complete production system design architecture document for a globally distributed platform.',
        estimatedHours: 22
      },
      {
        order: 7,
        name: 'Production Engineering & Reliability',
        summary: 'Observability, tracing, incident response, zero-downtime rollouts, and disaster recovery.',
        recommendedBookIds: ['shape-up', 'pragmatic-programmer'],
        milestoneGoal: 'Configure full observability metrics, SLO dashboards, and an automated deployment pipeline.',
        estimatedHours: 15
      }
    ]
  },
  {
    id: 'game-development',
    title: 'Game Development & Graphics Engineering',
    tagline: 'Master game engine architecture, procedural physics, and GPU shaders',
    description: 'A technical path designed for developers who want to build high-performance games, interactive simulations, and real-time graphics engines.',
    category: 'Game Development',
    estimatedTotalHours: 95,
    targetRole: 'Gameplay Engineer & Graphics Programmer',
    stages: [
      {
        order: 1,
        name: 'Math & Physics Foundations',
        summary: 'Vectors, matrices, Newtonian forces, friction, and angular momentum simulations.',
        recommendedBookIds: ['nature-of-code'],
        milestoneGoal: 'Write a 2D physics sandbox with particle collisions and gravity.',
        estimatedHours: 18
      },
      {
        order: 2,
        name: 'Game Architecture & Patterns',
        summary: 'Component systems, game loops, update methods, and decoupled event queues.',
        recommendedBookIds: ['game-programming-patterns'],
        milestoneGoal: 'Architect an entity-component-system (ECS) with decoupled state updates.',
        estimatedHours: 20
      },
      {
        order: 3,
        name: 'Graphics & Shaders',
        summary: 'Fragment and vertex shaders, GLSL, procedural noise, and raymarching.',
        recommendedBookIds: ['the-book-of-shaders'],
        milestoneGoal: 'Write custom GLSL shaders for water caustics, volumetric lighting, and procedural terrain.',
        estimatedHours: 24
      },
      {
        order: 4,
        name: 'Game Engine Mastery & Systems',
        summary: 'Spatial partitioning, object pools, sound engines, and memory cache locality.',
        recommendedBookIds: ['game-programming-patterns', 'crafting-interpreters'],
        milestoneGoal: 'Build a performant gameplay loop sustaining 60+ FPS with 1,000+ onscreen entities.',
        estimatedHours: 20
      },
      {
        order: 5,
        name: 'Gameplay Systems & Polish',
        summary: 'State machines, autonomous behavior trees, audio integration, and game feel.',
        recommendedBookIds: ['nature-of-code'],
        milestoneGoal: 'Ship a polished playable demo with responsive controls and custom visual effects.',
        estimatedHours: 13
      }
    ]
  },
  {
    id: 'ai-engineering',
    title: 'AI Engineering & Modern Deep Learning',
    tagline: 'From matrix calculus to foundation models and production LLM orchestration',
    description: 'Transform theoretical neural network mathematics into modern AI applications, fine-tuned transformer models, and autonomous agent systems.',
    category: 'AI & Machine Learning',
    estimatedTotalHours: 120,
    targetRole: 'Machine Learning Engineer & AI Architect',
    stages: [
      {
        order: 1,
        name: 'Mathematical Foundations',
        summary: 'Linear algebra, multivariate calculus, probability distributions, and information entropy.',
        recommendedBookIds: ['deep-learning-goodfellow'],
        milestoneGoal: 'Implement gradient descent and backpropagation from scratch using raw matrix operations.',
        estimatedHours: 22
      },
      {
        order: 2,
        name: 'Modern Neural Networks with PyTorch',
        summary: 'Multi-layer perceptrons, convolutional nets, regularization, and GPU acceleration.',
        recommendedBookIds: ['dive-into-deep-learning'],
        milestoneGoal: 'Train and validate a deep vision model on a custom dataset.',
        estimatedHours: 20
      },
      {
        order: 3,
        name: 'Attention Mechanisms & Transformers',
        summary: 'Self-attention, multi-head attention, positional encodings, and encoder-decoder topologies.',
        recommendedBookIds: ['dive-into-deep-learning', 'deep-learning-goodfellow'],
        milestoneGoal: 'Code a miniature GPT-style decoder-only transformer from scratch in PyTorch.',
        estimatedHours: 26
      },
      {
        order: 4,
        name: 'Foundation Models, Fine-Tuning & RAG',
        summary: 'LoRA, parameter-efficient fine-tuning (PEFT), vector embeddings, and retrieval pipelines.',
        recommendedBookIds: ['dive-into-deep-learning', 'python-for-data-analysis'],
        milestoneGoal: 'Deploy an enterprise RAG pipeline with hybrid search and reranking.',
        estimatedHours: 28
      },
      {
        order: 5,
        name: 'Autonomous Systems & Cybernetics',
        summary: 'Feedback loops, multi-agent coordination, tool-calling reasoning, and evaluation benchmarks.',
        recommendedBookIds: ['cybernetics-wiener'],
        milestoneGoal: 'Build an autonomous multi-step agent with self-correcting validation loops.',
        estimatedHours: 24
      }
    ]
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Engineering & Product Design',
    tagline: 'Bridging human cognitive psychology with pristine pixel-perfect UI execution',
    description: 'Learn the principles of ergonomic usability, typography math, color systems, micro-interactions, and design systems.',
    category: 'Design',
    estimatedTotalHours: 65,
    targetRole: 'Product Designer & Design Systems Engineer',
    stages: [
      {
        order: 1,
        name: 'Human Psychology & Ergonomics',
        summary: 'Affordances, signifiers, conceptual models, and cognitive load reduction.',
        recommendedBookIds: ['the-design-of-everyday-things'],
        milestoneGoal: 'Conduct a heuristic UX evaluation on a complex SaaS product flow.',
        estimatedHours: 14
      },
      {
        order: 2,
        name: 'Visual Hierarchy & Typography',
        summary: 'Modular type scales, contrast ratios, vertical rhythm, and line length rules.',
        recommendedBookIds: ['refactoring-ui'],
        milestoneGoal: 'Create a responsive typography system with strict WCAG AA accessibility.',
        estimatedHours: 15
      },
      {
        order: 3,
        name: 'Design Systems & Component Architecture',
        summary: 'Tokens, spatial scales, compound states, and tokenized themes.',
        recommendedBookIds: ['refactoring-ui'],
        milestoneGoal: 'Build a production-grade component library with dark/light themes.',
        estimatedHours: 20
      },
      {
        order: 4,
        name: 'Micro-Interactions & Fluid Motion',
        summary: 'Choreographed transitions, physics-based springs, and feedback states.',
        recommendedBookIds: ['the-design-of-everyday-things'],
        milestoneGoal: 'Implement accessible motion design and loading state transitions.',
        estimatedHours: 16
      }
    ]
  },
  {
    id: 'entrepreneurship-startups',
    title: 'Startup Engineering & Founder Strategy',
    tagline: 'From zero-to-one validation to product-market fit and defensible scale',
    description: 'A tactical reading path for technical founders and early operators turning code into durable high-margin businesses.',
    category: 'Startups',
    estimatedTotalHours: 60,
    targetRole: 'Technical Founder & CEO',
    stages: [
      {
        order: 1,
        name: 'Idea Validation & Truth-Finding',
        summary: 'Customer discovery calls, separating compliments from commitment, and problem scoping.',
        recommendedBookIds: ['the-mom-test'],
        milestoneGoal: 'Complete 15 customer discovery interviews and identify a high-pain problem.',
        estimatedHours: 12
      },
      {
        order: 2,
        name: 'Defensibility & Contrarian Strategy',
        summary: 'Monopoly dynamics, network effects, power laws, and proprietary technology.',
        recommendedBookIds: ['zero-to-one'],
        milestoneGoal: 'Formulate your startup thesis, 10x differentiator, and go-to-market wedge.',
        estimatedHours: 14
      },
      {
        order: 3,
        name: 'Product Cadence & Shipping Velocity',
        summary: 'Shaping work, 6-week cycles, eliminating backlogs, and betting tables.',
        recommendedBookIds: ['shape-up'],
        milestoneGoal: 'Shape, pitch, and ship a core MVP within a fixed 6-week boundary.',
        estimatedHours: 16
      },
      {
        order: 4,
        name: 'Organizational Leverage & Scaling',
        summary: 'Managerial leverage, 1-on-1s, OKRs, and operating cadence for engineering teams.',
        recommendedBookIds: ['high-output-management'],
        milestoneGoal: 'Design company operating principles, quarterly metrics, and hiring rubrics.',
        estimatedHours: 18
      }
    ]
  },
  {
    id: 'cybersecurity-defensive',
    title: 'Cybersecurity & Defensive Engineering',
    tagline: 'Systematic threat modeling, application security, and cryptographic foundations',
    description: 'Arm yourself with the methodologies required to anticipate malicious attacks, audit trust boundaries, and safeguard sensitive data.',
    category: 'Cybersecurity',
    estimatedTotalHours: 85,
    targetRole: 'Application Security Engineer',
    stages: [
      {
        order: 1,
        name: 'Threat Modeling & STRIDE',
        summary: 'Deconstruct systems into data flow diagrams, find threats, and plan mitigations.',
        recommendedBookIds: ['threat-modeling-shostack'],
        milestoneGoal: 'Author a complete STRIDE threat model document for an authentication service.',
        estimatedHours: 20
      },
      {
        order: 2,
        name: 'Secure Systems & Architecture',
        summary: 'Least privilege, cryptographic primitives, and safe data serialization.',
        recommendedBookIds: ['threat-modeling-shostack', 'designing-data-intensive-applications'],
        milestoneGoal: 'Implement end-to-end encrypted storage with verified key rotation.',
        estimatedHours: 25
      },
      {
        order: 3,
        name: 'Code-Level Vulnerability Prevention',
        summary: 'SQL injection, SSRF, IDOR, memory safety, and static analysis.',
        recommendedBookIds: ['clean-code-martin', 'crafting-interpreters'],
        milestoneGoal: 'Harden a full-stack codebase against OWASP Top 10 vulnerabilities.',
        estimatedHours: 22
      },
      {
        order: 4,
        name: 'Incident Response & Auditing',
        summary: 'Audit logging, intrusion detection, red team exercises, and forensics.',
        recommendedBookIds: ['pragmatic-programmer'],
        milestoneGoal: 'Deploy tamper-evident audit logs and automated security alerting.',
        estimatedHours: 18
      }
    ]
  },
  {
    id: 'product-management',
    title: 'Product Management & Discovery',
    tagline: 'Transforming customer problems into high-impact software experiences',
    description: 'Learn how the world’s elite product teams tackle value risk, usability risk, feasibility risk, and strategic roadmaps.',
    category: 'Product',
    estimatedTotalHours: 55,
    targetRole: 'Product Lead & VP of Product',
    stages: [
      {
        order: 1,
        name: 'Customer Discovery & Validation',
        summary: 'Non-leading interview tactics, validating willingness to pay, and uncovering real workflows.',
        recommendedBookIds: ['the-mom-test'],
        milestoneGoal: 'Conduct customer problem interviews and validate problem-solution fit.',
        estimatedHours: 12
      },
      {
        order: 2,
        name: 'Empowered Product Teams & Strategy',
        summary: 'Cross-functional collaboration, outcome-based missions, and tackling product risks.',
        recommendedBookIds: ['inspired-marty-cagan'],
        milestoneGoal: 'Write a comprehensive Product Requirements Document (PRD) centered on outcomes.',
        estimatedHours: 16
      },
      {
        order: 3,
        name: 'Execution & Appetite Scoping',
        summary: 'Fixed time, variable scope, Hill charts, and shipping work that matters.',
        recommendedBookIds: ['shape-up'],
        milestoneGoal: 'Run a 6-week shaping cycle from pitch to production deployment.',
        estimatedHours: 14
      },
      {
        order: 4,
        name: 'Growth, Positioning & Feedback Loops',
        summary: 'Ergonomic usability, feedback loops, and viral acquisition dynamics.',
        recommendedBookIds: ['the-design-of-everyday-things', 'cybernetics-wiener'],
        milestoneGoal: 'Define North Star metric, user acquisition loops, and telemetry tracking.',
        estimatedHours: 13
      }
    ]
  },
  {
    id: 'data-science-analytics',
    title: 'Data Science & Analytical Engineering',
    tagline: 'From tabular wrangling to statistical inference and distributed streaming data',
    description: 'Master data cleaning, time series analysis, vectorized computation, and modern analytical infrastructure.',
    category: 'Data & Analytics',
    estimatedTotalHours: 90,
    targetRole: 'Data Scientist & Analytics Engineer',
    stages: [
      {
        order: 1,
        name: 'Python Data Wrangling & pandas',
        summary: 'DataFrames, Series, missing data interpolation, and grouping transformations.',
        recommendedBookIds: ['python-for-data-analysis'],
        milestoneGoal: 'Clean, reshape, and analyze a real-world messy dataset with 1M+ rows.',
        estimatedHours: 24
      },
      {
        order: 2,
        name: 'Exploratory Analysis & Visualization',
        summary: 'Distributions, correlation vs causation, statistical charts, and time series.',
        recommendedBookIds: ['python-for-data-analysis'],
        milestoneGoal: 'Build an interactive analytical notebook answering a business question.',
        estimatedHours: 18
      },
      {
        order: 3,
        name: 'Machine Learning Pipelines',
        summary: 'Feature engineering, model training, cross-validation, and metric evaluation.',
        recommendedBookIds: ['dive-into-deep-learning'],
        milestoneGoal: 'Train, evaluate, and tune a predictive ML pipeline with automated validation.',
        estimatedHours: 26
      },
      {
        order: 4,
        name: 'Data Architecture & Storage Systems',
        summary: 'Columnar storage (Parquet), OLAP vs OLTP, and streaming data pipelines.',
        recommendedBookIds: ['designing-data-intensive-applications'],
        milestoneGoal: 'Design a scalable analytics data warehouse architecture.',
        estimatedHours: 22
      }
    ]
  },
  {
    id: 'content-creation-strategy',
    title: 'Content Strategy & Developer Audience Building',
    tagline: 'Documenting the build process and establishing technical authority',
    description: 'A focused guide for builders, indie hackers, and creative technologists wanting to share their knowledge publicly and cultivate an engaged audience.',
    category: 'Content Creation',
    estimatedTotalHours: 40,
    targetRole: 'Technical Content Creator & Developer Advocate',
    stages: [
      {
        order: 1,
        name: 'The Philosophy of Public Learning',
        summary: 'Overcoming imposter syndrome, showing your process, and building in public.',
        recommendedBookIds: ['show-your-work'],
        milestoneGoal: 'Publish 5 daily build logs documenting real architectural challenges.',
        estimatedHours: 10
      },
      {
        order: 2,
        name: 'Educational Prose & Technical Writing',
        summary: 'Explaining complex concepts with clarity, analogies, and code diagrams.',
        recommendedBookIds: ['eloquent-javascript', 'refactoring-ui'],
        milestoneGoal: 'Write a comprehensive technical tutorial with runnable interactive examples.',
        estimatedHours: 12
      },
      {
        order: 3,
        name: 'Distribution Architecture & Community',
        summary: 'Owning your platform, newsletter mechanics, and sustainable patronage.',
        recommendedBookIds: ['show-your-work', 'zero-to-one'],
        milestoneGoal: 'Launch an independent technical newsletter and resource repository.',
        estimatedHours: 10
      },
      {
        order: 4,
        name: 'Long-Form Authority & Book Creation',
        summary: 'Structuring multi-chapter deep dives, self-publishing, and open-access licensing.',
        recommendedBookIds: ['crafting-interpreters', 'the-book-of-shaders'],
        milestoneGoal: 'Draft the outline and chapter 1 for an open-source technical handbook.',
        estimatedHours: 8
      }
    ]
  }
];
