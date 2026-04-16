// ============================================================
// FLINT — Data constants
// ------------------------------------------------------------
// Single responsibility: data tables that drive the UI.
// - Output types per tier (MECE)
// - Checkpoint definitions per output type
// - Signal vocabulary
// - Tier-specific field definitions per output type
// - Intent template catalogs per tier
// Depends on: flint-registry.js (for REGISTRY)
// ============================================================

// ------------------------------------------------------------
// OUTPUT TYPES PER TIER — MECE
// ------------------------------------------------------------
const OUTPUT_TYPES = {
  creative: [
    'Brainstorm',
    'Naming',
    'Concept',
    'Positioning',
    'Provocations',
    'Narrative',
    'Remix',
    'Other'
  ],
  strategic: [
    'Insight / Answer',
    'Executive Summary',
    'Recommendation Memo',
    'Talking Points',
    'Other'
  ],
  operational: [
    'Analysis / Report',
    'Dashboard / Visualization',
    'Presentation / Deck',
    'Deep Dive',
    'Weekly Summary',
    'Monitoring Setup',
    'Other'
  ],
  technical: [
    'SQL Analysis',
    'Data Pipeline',
    'Data Product (DPF)',
    'Interactive Dashboard',
    'SKILL.md',
    'Notebook',
    'Experiment Read',
    'AI Tool',
    'Plugin',
    'Other'
  ]
};

// ------------------------------------------------------------
// INTENT → suggested output type mapping
// Template id -> output type per tier
// ------------------------------------------------------------
const INTENT_TEMPLATE_OUTPUT_SUGGESTIONS = {
  // creative — pure ideation
  wild_ideas:        'Brainstorm',
  name_it:           'Naming',
  concept_sketch:    'Concept',
  positioning_play:  'Positioning',
  provoke_me:        'Provocations',
  story_it:          'Narrative',
  cross_pollinate:   'Remix',

  // strategic — CEO of your own shop
  growth_bet:        'Recommendation Memo',
  pricing_call:      'Recommendation Memo',
  market_read:       'Insight / Answer',
  weekly_ceo:        'Executive Summary',
  pitch_review:      'Recommendation Memo',

  // operational — running the shop
  weekly_plan:       'Analysis / Report',
  customer_work:     'Deep Dive',
  revenue_dashboard: 'Dashboard / Visualization',
  playbook:          'Presentation / Deck',
  train_collaborator:'Presentation / Deck',
  proposal:          'Presentation / Deck',
  alerting:          'Monitoring Setup',

  // technical — founding architect
  sql_pull:          'SQL Analysis',
  daily_pipeline:    'Data Pipeline',
  dpf_brief:         'Data Product (DPF)',
  live_dashboard:    'Interactive Dashboard',
  skill_workflow:    'SKILL.md',
  notebook_deepdive: 'Notebook',
  ab_test_read:      'Experiment Read',
  ai_tool:           'AI Tool',
  claude_plugin:     'Plugin'
};

// ------------------------------------------------------------
// INTENT TEMPLATES PER TIER
// ------------------------------------------------------------
// Two formats supported:
//   Flat (creative):        { id, label, text }[]
//   Categorized (others):   { category, items: { id, label, text }[] }[]
// ------------------------------------------------------------
const INTENT_TEMPLATES = {
  // Creative: small focused list, no categories needed
  creative: [
    { id: 'wild_ideas',       label: 'Wild ideas',
      text: "Give me 20 wild ideas for ... — no filter, no feasibility check. Include the obvious, the weird, and one or two you think I'd hate. I'll sort them after." },
    { id: 'name_it',          label: 'Name it',
      text: "I need names for .... Go wide — evocative, literal, metaphorical, made-up words. Give me a range to react to, not a shortlist of safe bets." },
    { id: 'concept_sketch',   label: 'Concept sketch',
      text: "Sketch a concept for ... — the shape of the idea, what it feels like, who it's for, what makes it different. Don't get operational yet, just paint it." },
    { id: 'positioning_play', label: 'Positioning play',
      text: "Help me position ... — what's the one sentence that makes someone lean in? Try three angles that feel different and tell me what each one trades away." },
    { id: 'provoke_me',       label: 'Provoke me',
      text: "I'm stuck on .... Challenge my framing. Tell me what a contrarian would say, what a beginner would ask, and what I'd be doing if I believed the opposite." },
    { id: 'story_it',         label: 'Story it',
      text: "Tell the story of ... the way I'd tell it on stage or in a podcast. Find the thread, the turn, and the line someone would quote back to me." },
    { id: 'cross_pollinate',  label: 'Cross-pollinate',
      text: "Steal from outside my world. How would ... be solved by a chef, a game designer, a street artist, a trial lawyer? Give me five lenses and what each one surfaces." }
  ],

  // Strategic: Direction vs. specific decisions
  strategic: [
    { category: 'Direction', items: [
      { id: 'growth_bet',   label: 'Growth bet',
        text: "I'm deciding whether to double down on ... or keep iterating on .... Walk me through the growth case, the risk, and what I'd need to be true to commit." },
      { id: 'market_read',  label: 'Market read',
        text: "What's happening in my market around ...? Who's winning, who's stuck, and where's the opening for a small operator like me?" },
      { id: 'weekly_ceo',   label: 'Weekly CEO check-in',
        text: "Give me a weekly CEO read on the business — what's growing, what's stalling, and what deserves my attention this week." }
    ]},
    { category: 'Decisions', items: [
      { id: 'pricing_call', label: 'Pricing call',
        text: "I'm considering moving pricing from ... to .... Tell me who this wins, who this loses, and what it does to margin and cash." },
      { id: 'pitch_review', label: 'Review a pitch',
        text: "Someone pitched me on .... Steel-man it, then tell me what I should push back on and what I'd need to see to say yes." }
    ]}
  ],

  // Operational: Planning → Client work → Systems
  operational: [
    { category: 'Planning', items: [
      { id: 'weekly_plan',       label: 'Weekly plan',
        text: "Plan my week — top 3 outcomes I need to ship, what's blocking me, what to cut. Favor revenue-generating work over polish." }
    ]},
    { category: 'Client work', items: [
      { id: 'customer_work',  label: 'Customer work',
        text: "I've got customer work for ... — help me break it down into tasks, decide what I do vs what an agent does, and sequence it so I can ship this week." },
      { id: 'proposal',       label: 'Proposal / scope',
        text: "Draft a proposal for ... — scope, price, timeline, and deliverables I'm confident I can hit. Keep it tight and founder-honest." }
    ]},
    { category: 'Systems', items: [
      { id: 'revenue_dashboard',  label: 'Revenue dashboard',
        text: "Build me a simple dashboard that tracks MRR, CAC, LTV, and runway. Update cadence: weekly. I'm the only reader." },
      { id: 'playbook',           label: 'Playbook / SOP',
        text: "Write me a playbook for ... — something I can hand to an agent (or a future hire) and have it run without me." },
      { id: 'train_collaborator', label: 'Train a collaborator',
        text: "Help me train someone to operate like me on .... Capture how I think about it, what I look for, and the mistakes to avoid — so they can run without me reviewing every step." },
      { id: 'alerting',           label: 'Monitoring / alerts',
        text: "Set up monitoring for ... — where to watch, what thresholds I should care about, and what I do when something breaks." }
    ]}
  ],

  // Technical: Query & analysis → Infrastructure → Interfaces → Automation
  technical: [
    { category: 'Query & analysis', items: [
      { id: 'sql_pull',         label: 'SQL pull',
        text: "Write SQL that pulls ... from .... I need to see the numbers fast and cleanly — no fluff." },
      { id: 'notebook_deepdive',label: 'Investigation notebook',
        text: "Build a notebook that investigates ... — pull the data, transform, visualize, and document what I learn so I can come back to it later." },
      { id: 'ab_test_read',     label: 'Experiment read',
        text: "I ran a test on .... Tell me if it worked, for which customers, and whether I should ship it, kill it, or iterate." }
    ]},
    { category: 'Infrastructure', items: [
      { id: 'daily_pipeline', label: 'Daily pipeline',
        text: "Build a daily pipeline that ingests ... and computes .... Keep it simple, idempotent, backfillable, and cheap to run on my infra." },
      { id: 'dpf_brief',      label: 'Core data product',
        text: "Draft a Data Product brief for .... This is a foundational dataset — everything I build will read from it. Define contract, SLAs, and schema." }
    ]},
    { category: 'Interfaces', items: [
      { id: 'live_dashboard', label: 'Customer-facing dashboard',
        text: "Build a self-contained HTML dashboard that shows ... — filterable by ..., refreshed from .... I can host this as a static file." }
    ]},
    { category: 'Automation', items: [
      { id: 'skill_workflow', label: 'Reusable skill',
        text: "Make a SKILL.md for the repeatable workflow of .... Something I can invoke any time I need this done without re-explaining." },
      { id: 'ai_tool',        label: 'Helper AI tool',
        text: "Build me a small AI tool that ... — something I can run from the CLI or plug into my flow to save me time on repetitive work." },
      { id: 'claude_plugin',  label: 'Claude Code plugin',
        text: "Package ... as a Claude Code plugin I can install and reuse across projects. Keep it small and focused." }
    ]}
  ]
};

// ------------------------------------------------------------
// SIGNAL VOCABULARY — prompt-defined only
// Signals are NEVER auto-activated. User must toggle explicitly.
// ------------------------------------------------------------
const SIGNAL_VOCAB = [
  { group: 'Context Scope', signals: [
    { id:'none',      label:'[none]',      short:'Clean-slate AI',
      desc:'Turns off all workspace context. The AI responds from its general training only.',
      instruction:'Ignore all workspace context, team knowledge, and custom rules. Respond from your general training only.' },
    { id:'quick',     label:'[quick]',     short:'Skip discovery',
      desc:'Skips knowledge discovery and answers directly from what is in context.',
      instruction:'Skip knowledge search and discovery steps. Answer directly from what is already in context.' },
    { id:'personal',  label:'[personal]',  short:'Your files only',
      desc:'Restricts the AI to your personal files and notes only.',
      instruction:'Use only my personal files and notes. Do not reference shared team knowledge.' },
    { id:'shared',    label:'[shared]',    short:'Team knowledge',
      desc:'Restricts the AI to shared team knowledge only.',
      instruction:'Use only shared team knowledge. Do not reference my personal files.' },
    { id:'workspace', label:'[workspace]', short:'Project files',
      desc:'Searches files in the current project workspace.',
      instruction:'Search the current project workspace files for relevant context before answering.' }
  ]},
  { group: 'Depth & Reasoning', signals: [
    { id:'deep',  label:'[deep]',  short:'Full reasoning',
      desc:'Maximum reasoning depth. Show intermediate steps, calculations, and logic.',
      instruction:'Use maximum reasoning depth. Show all intermediate steps, calculations, and logic. Prioritize thoroughness over brevity.' },
    { id:'scan',  label:'[scan]',  short:'Quick overview',
      desc:'Surface-level overview only — the lay of the land, no deep analysis.',
      instruction:'Give a surface-level overview only. No deep analysis — just the lay of the land so I can decide where to dig in.' },
    { id:'eli5',  label:'[eli5]',  short:'No jargon',
      desc:'Explain with no assumed prior context. Define terms, use analogies.',
      instruction:'Explain as if I have no prior context on this topic. Define all terms, avoid jargon, use analogies where helpful.' }
  ]},
  { group: 'Output Format', signals: [
    { id:'brief',   label:'[brief]',   short:'Owner-ready',
      desc:'Owner\'s one-pager: concise, dollar-denominated, so-what-first. Designed for you to decide in one read.',
      instruction:'Format output as an owner-ready one-pager: concise, dollar-denominated where applicable, so-what first followed by evidence. I am the decision-maker — no approval chain, no hedging.' },
    { id:'code',    label:'[code]',    short:'Code only',
      desc:'Return only the code, query, or executable output — no commentary.',
      instruction:'Skip all explanation and commentary. Return only the code, query, or executable output. Add inline comments only where logic is non-obvious.' },
    { id:'table',   label:'[table]',   short:'Tables first',
      desc:'Force tables wherever possible. Markdown tables with clear headers.',
      instruction:'Present results in tabular format wherever possible. Use markdown tables with clear headers. Avoid prose for data that fits in rows and columns.' },
    { id:'bullets', label:'[bullets]', short:'Bullet points',
      desc:'Bullet-point format, no prose paragraphs.',
      instruction:'Use bullet points for all output. No prose paragraphs. Each point should be self-contained and scannable.' },
    { id:'prose',   label:'[prose]',   short:'Narrative',
      desc:'Flowing prose paragraphs. Suppress bullets and tables.',
      instruction:'Write in flowing prose paragraphs. Avoid bullet lists and tables — use narrative structure instead.' }
  ]},
  { group: 'Behavior', signals: [
    { id:'skip-planning', label:'[skip-planning]', short:'Jump to action',
      desc:'Bypass planning and scoping. Go straight to execution.',
      instruction:'Skip all planning, scoping, and confirmation steps. Go straight to execution.' },
    { id:'explore',   label:'[explore]',   short:'Think freely',
      desc:'Think out loud with no commitment to a direction.',
      instruction:'Think out loud with no commitment to a direction. Explore freely — challenge assumptions, consider wild ideas, no need to converge on a recommendation yet.' },
    { id:'audit',     label:'[audit]',     short:'Cite sources',
      desc:'Cite every source: file paths, table names, columns, assumptions.',
      instruction:'Cite every source: file paths, table names, column references, assumptions made. I need to verify your work.' },
    { id:'challenge', label:'[challenge]', short:'Push back',
      desc:'Steel-man the opposite before answering. Push back on framing.',
      instruction:'Before answering, steel-man the opposite position. Push back on my framing. Tell me what I might be wrong about and why, then give your recommendation.' },
    { id:'draft',     label:'[draft]',     short:'First pass',
      desc:'First-pass output. Speed and structure over polish.',
      instruction:'This is a first draft. Prioritize speed and structure over polish. Use placeholders where details are uncertain — I will iterate on this.' },
    { id:'ship',      label:'[ship]',      short:'Production-ready',
      desc:'Production-ready: full error handling, edge cases, docs.',
      instruction:'Output must be production-ready. Include full error handling, edge cases, input validation, and documentation. No shortcuts, no TODOs, no placeholders.' }
  ]}
];

// ------------------------------------------------------------
// CHECKPOINT DEFINITIONS — per tier & per technical output type
// ------------------------------------------------------------
const TIER_CHECKPOINTS = {
  creative: [
    { num:1, label:'Diverge' },
    { num:2, label:'Cluster' },
    { num:3, label:'Sharpen' }
  ],
  strategic: [
    { num:1, label:'Confirm interpretation' },
    { num:2, label:'Deliver answer' }
  ],
  operational: [
    { num:1, label:'Confirm approach' },
    { num:2, label:'Review first draft' },
    { num:3, label:'Final deliverable' }
  ],
  technical: [
    { num:1, label:'Quick check' },
    { num:2, label:'Build' },
    { num:3, label:'Validate' },
    { num:4, label:'Deliver' }
  ]
};
const TECH_CHECKPOINTS = {
  'SQL Analysis': [
    { num:1, label:'Understand question' },
    { num:2, label:'Resolve contracts' },
    { num:3, label:'Compose query' },
    { num:4, label:'Validate' },
    { num:5, label:'Present' }
  ],
  'Data Pipeline': [
    { num:1, label:'Quick check' },
    { num:2, label:'DDL + schema' },
    { num:3, label:'ETL logic' },
    { num:4, label:'Validate' },
    { num:5, label:'Schedule' }
  ],
  'Data Product (DPF)': [
    { num:1, label:'Scope & owners' },
    { num:2, label:'Contract' },
    { num:3, label:'Schema + SLAs' },
    { num:4, label:'Consumers & access' },
    { num:5, label:'Ship brief' }
  ],
  'Interactive Dashboard': [
    { num:1, label:'Schema' },
    { num:2, label:'Layout' },
    { num:3, label:'Charts' },
    { num:4, label:'Interactivity' },
    { num:5, label:'Deploy' }
  ],
  'SKILL.md': [
    { num:0, label:'Verify access' },
    { num:1, label:'Quick check' },
    { num:2, label:'Execute' },
    { num:3, label:'Deliver' }
  ],
  'Notebook': [
    { num:1, label:'Setup' },
    { num:2, label:'Query' },
    { num:3, label:'Transform' },
    { num:4, label:'Visualize' },
    { num:5, label:'Document' }
  ],
  'Experiment Read': [
    { num:1, label:'Identify test' },
    { num:2, label:'Pull data' },
    { num:3, label:'Compute effects' },
    { num:4, label:'Segment' },
    { num:5, label:'Interpret' },
    { num:6, label:'Report' }
  ],
  'AI Tool': [
    { num:1, label:'Scaffold' },
    { num:2, label:'Implement' },
    { num:3, label:'Test' },
    { num:4, label:'Document' }
  ],
  'Plugin': [
    { num:1, label:'Scaffold' },
    { num:2, label:'Manifest' },
    { num:3, label:'Components' },
    { num:4, label:'Integration' },
    { num:5, label:'Test' },
    { num:6, label:'Publish' }
  ]
};

// ------------------------------------------------------------
// GUARDRAILS — field definitions per tier & output type
// ------------------------------------------------------------
const TIER_FIELDS_BASE = {
  creative: {
    _default: [
      { id:'spark',          label:'What\'s the spark? (optional)', placeholder:'e.g. A new way to package the onboarding I do for every customer; a podcast angle nobody\'s doing' },
      { id:'whosItFor',      label:'Who\'s it for? (optional)', placeholder:'e.g. Just me; potential customers; operators like me; nobody yet \u2014 it\'s pure exploration' },
      { id:'offLimits',      label:'Off-limits / avoid (optional)', placeholder:'e.g. Don\'t go corporate; no gimmicks; keep it founder-honest' },
      { id:'rawInspo',       label:'Reference points / inspiration (optional)', placeholder:'e.g. Rick Rubin on creativity; the way Patagonia talks about itself; a chef plating a single ingredient' }
    ],
    'Naming': [
      { id:'spark',          label:'What are we naming?', placeholder:'e.g. A small internal tool; my new product tier; a weekly email' },
      { id:'vibeWords',      label:'Vibe words (optional)', placeholder:'e.g. sharp, quiet, cult-favorite, utilitarian' },
      { id:'offLimits',      label:'Words/tones to avoid (optional)', placeholder:'e.g. no "AI-powered", no "intelligent", nothing ending in -ify' }
    ],
    'Positioning': [
      { id:'spark',          label:'What are we positioning?', placeholder:'e.g. My consulting offer; a new pricing tier; a side project I\'m about to launch' },
      { id:'whosItFor',      label:'Who\'s it for?', placeholder:'e.g. Solo operators doing customer-facing data work' },
      { id:'offLimits',      label:'Positioning to avoid (optional)', placeholder:'e.g. Don\'t lean on "AI-native"; don\'t compete on price' }
    ],
    'Narrative': [
      { id:'spark',          label:'The story / moment', placeholder:'e.g. How I got my first customer; why I left the old stack; the week everything broke' },
      { id:'whosItFor',      label:'Where will it live?', placeholder:'e.g. Podcast intro; blog post; talk opener; internal team Slack' }
    ]
  },
  strategic: {
    _default: [
      { id:'hypothesis',       label:'Your current hypothesis (optional)', placeholder:'e.g. Customers on my starter plan are churning because they outgrow it before I can upsell them' },
      { id:'decisionContext',  label:'The call you\'re making (optional)', placeholder:'e.g. Whether to raise the starter-tier limits or introduce a mid-tier' },
      { id:'scopeLimits',      label:'Trade-offs you won\'t accept (optional)', placeholder:'e.g. Nothing that requires taking on debt or hiring full-time' }
    ],
    'Executive Summary': [
      { id:'keyMessage',       label:'The headline you want to land (optional)', placeholder:'e.g. Retention dropped 3pts — it\'s concentrated in one customer segment' },
      { id:'decisionContext',  label:'What you\'ll do with this (optional)', placeholder:'e.g. Decide what I focus on next quarter' },
      { id:'timeline',         label:'When you need it (optional)', placeholder:'e.g. Before my Monday planning block' }
    ],
    'Talking Points': [
      { id:'audienceSetting',  label:'Setting (optional)', placeholder:'e.g. Customer call, partner intro, podcast interview, Slack update to a collaborator' },
      { id:'hypothesis',       label:'Your current read (optional)', placeholder:'e.g. Onboarding is finally clicking — activation is up' }
    ],
    'Recommendation Memo': [
      { id:'decisionContext',  label:'The decision you\'re making', placeholder:'e.g. Whether to sunset the legacy tier, ship the new pricing, or hold' },
      { id:'timeline',         label:'By when you decide', placeholder:'e.g. End of this week' },
      { id:'scopeLimits',      label:'Non-negotiables (optional)', placeholder:'e.g. Can\'t break existing customers; no changes that require new hires' }
    ]
  },
  operational: {
    _default: [
      { id:'successCriteria',  label:'What "done" looks like', placeholder:'e.g. Numbers reconcile to my own tracker; ready for me to act on Monday' },
      { id:'timeline',         label:'Deadline', placeholder:'e.g. First pass tonight, final by Friday' },
      { id:'servesWho',        label:'Who does this serve?', placeholder:'e.g. Me (decision-maker), a customer I\'m pitching, a collaborator I\'m training' },
      { id:'dependencies',     label:'Blockers / dependencies (optional)', placeholder:'e.g. Need the Stripe export; waiting on customer reply' },
      { id:'soWhat',           label:'So what? (optional)', placeholder:'e.g. If MRR is stalling, I re-prioritize this week toward sales calls' }
    ],
    'Dashboard / Visualization': [
      { id:'successCriteria',  label:'What "done" looks like', placeholder:'e.g. Matches my source of truth within 1%; I can scan it in under 60 seconds' },
      { id:'refreshCadence',   label:'Refresh cadence', placeholder:'e.g. Weekly on Sunday, manual refresh, live' },
      { id:'servesWho',        label:'Who does this serve?', placeholder:'e.g. Just me; me + a collaborator I\'m training; a customer dashboard' },
      { id:'soWhat',           label:'What call does it help you make?', placeholder:'e.g. When to cut spend, when to push on sales, when runway is tight' }
    ],
    'Presentation / Deck': [
      { id:'narrativeArc',     label:'What\'s the story?', placeholder:'e.g. We\'re winning on signups but losing on retention — here\'s why and what I\'m doing about it' },
      { id:'deckLength',       label:'Length / format', placeholder:'e.g. 5 slides max, PDF, ready to email' },
      { id:'servesWho',        label:'Who will read it?', placeholder:'e.g. A prospective customer, an advisor, a collaborator I\'m onboarding' },
      { id:'timeline',         label:'When is it due?', placeholder:'e.g. Before Friday\'s pitch call' }
    ],
    'Deep Dive': [
      { id:'successCriteria',  label:'What "done" looks like', placeholder:'e.g. I can explain the gap in one sentence and back it with evidence' },
      { id:'servesWho',        label:'Who does this serve?', placeholder:'e.g. My own decision; a customer who asked' },
      { id:'soWhat',           label:'What action could this drive?', placeholder:'e.g. Whether to double down on the experiment or kill it' }
    ],
    'Weekly Summary': [
      { id:'reportingPeriod',  label:'Reporting period', placeholder:'e.g. Week of 4/7, last 7 days, since last Monday' },
      { id:'servesWho',        label:'Who will read it?', placeholder:'e.g. Just me (my weekly journal); a collaborator I keep in the loop' },
      { id:'soWhat',           label:'What should it tell you?', placeholder:'e.g. Am I on-pace? What changed? What needs my attention next week?' }
    ],
    'Monitoring Setup': [
      { id:'alertThresholds',  label:'Alert thresholds', placeholder:'e.g. MRR drops >5% WoW, site down >2 min, API error rate >1%' },
      { id:'alertChannels',    label:'Alert channels', placeholder:'e.g. SMS to me, email, Slack DM — I\'m the oncall' },
      { id:'servesWho',        label:'Who responds?', placeholder:'e.g. Just me; me + one trusted collaborator' }
    ]
  },
  technical: {
    _default: [
      { id:'constraints',      label:'Constraints / conventions', placeholder:'e.g. Stay on my current stack, no new paid services, no PII leakage' },
      { id:'productionReqs',   label:'Production requirements', placeholder:'e.g. Runs under 5 min on my laptop; cheap to re-run; backfillable' },
      { id:'testing',          label:'Testing expectations', placeholder:'e.g. Reconciles to my own tracker; smoke test before I ship' }
    ],
    'SQL Analysis': [
      { id:'constraints',      label:'Constraints', placeholder:'e.g. Partition-pruned; must reconcile to my own source of truth' },
      { id:'testing',          label:'Validation checks', placeholder:'e.g. Row counts reconcile, no nulls in key columns' }
    ],
    'Data Pipeline': [
      { id:'targetTable',      label:'Target table', placeholder:'e.g. warehouse.customer_lifetime_value' },
      { id:'cadence',          label:'Refresh cadence', placeholder:'e.g. Daily at 2am local' },
      { id:'constraints',      label:'Constraints / conventions', placeholder:'e.g. Idempotent, partitioned by date, user-grain' },
      { id:'testing',          label:'Validation checks', placeholder:'e.g. Row count ±2% vs source; null check on grain key' }
    ],
    'Data Product (DPF)': [
      { id:'dpfName',          label:'Data product name', placeholder:'e.g. Customer 360 Core' },
      { id:'domain',           label:'Domain / owner', placeholder:'e.g. Me (owner); co-maintained with my data collaborator' },
      { id:'consumers',        label:'Who will read from it?', placeholder:'e.g. My dashboards, my customer-facing reports, a trainee\'s notebook' },
      { id:'sla',              label:'SLAs', placeholder:'e.g. Freshness < 4h, best-effort uptime (it\'s just me running it)' },
      { id:'contract',         label:'Contract (schema + semantics)', placeholder:'e.g. One row per active customer; canonical customer_id; typed event history' }
    ],
    'Interactive Dashboard': [
      { id:'refreshCadence',   label:'Refresh cadence', placeholder:'e.g. Weekly, manual, live' },
      { id:'vizFramework',     label:'Framework', placeholder:'e.g. Plotly, D3, Chart.js (self-contained HTML I can host statically)' },
      { id:'dataSource',       label:'Data source mode', placeholder:'e.g. Static embedded CSV vs live API fetch' }
    ],
    'Notebook': [
      { id:'constraints',      label:'Constraints', placeholder:'e.g. Runs on my laptop; shareable as HTML so I can send it to a customer or a trainee' },
      { id:'testing',          label:'Validation', placeholder:'e.g. Totals reconcile to my own tracker' }
    ],
    'Experiment Read': [
      { id:'testName',         label:'Test name / ID', placeholder:'e.g. pricing_v2, onboarding_flow_b' },
      { id:'recipeNames',      label:'Recipes', placeholder:'e.g. Control, Simplified, Guided' },
      { id:'focusMetrics',     label:'Focus metrics', placeholder:'e.g. Conversion rate, MRR, retention, LTV' },
      { id:'testing',          label:'Validation', placeholder:'e.g. Delta Method CIs, check version overlap' }
    ]
  }
};

function getTierFields(tier, outputType) {
  const base = TIER_FIELDS_BASE[tier] || {};
  return base[outputType] || base._default || [];
}

// ------------------------------------------------------------
// RECOMMENDED SIGNALS per tier (visual hint only — not auto-activated)
// ------------------------------------------------------------
const RECOMMENDED_SIGNALS = {
  creative: ['explore', 'challenge', 'draft'],
  strategic: ['brief', 'quick'],
  operational: ['table', 'audit'],
  technical: ['code', 'shared']
};

// ------------------------------------------------------------
// TIER DISPLAY NAMES
// ------------------------------------------------------------
const TIER_DISPLAY = {
  creative: 'Creative',
  strategic: 'Strategic',
  operational: 'Operational',
  technical: 'Technical'
};

// ------------------------------------------------------------
// GUARDRAILS CARD LABEL per tier
// ------------------------------------------------------------
const GUARDRAIL_HINT = {
  creative: 'Nothing is gated \u2014 what are you exploring? What\'s off-limits?',
  strategic: 'The call, the deadline, the trade-offs you won\'t accept.',
  operational: 'Success criteria, deadline, who this serves, blockers.',
  technical: 'Constraints, conventions, production requirements, testing.'
};

// ------------------------------------------------------------
// OUTPUT TYPES THAT HAVE A DEDICATED DATA SOURCE PICKER
// ------------------------------------------------------------
const OUTPUT_TYPES_WITH_SOURCES = new Set([
  'SQL Analysis',
  'Data Pipeline',
  'Data Product (DPF)',
  'Interactive Dashboard',
  'Notebook',
  'Experiment Read',
  'Analysis / Report',
  'Dashboard / Visualization',
  'Deep Dive',
  'Weekly Summary'
]);
