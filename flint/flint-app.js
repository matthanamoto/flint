// ============================================================
// FLINT — App logic
// ------------------------------------------------------------
// State, event handlers, prompt generation.
// Depends on: flint-registry.js (REGISTRY), flint-data.js
// ============================================================

// ------------------------------------------------------------
// STATE
// ------------------------------------------------------------
const state = {
  tier: 'operational',
  intent: '',
  supporting: '',
  outputType: '',
  audience: '',
  activeSignals: [],
  selectedRegistrySources: [], // array of table ids
  customSources: [],           // array of strings like "schema.table"
  // SKILL.md
  skillName: '',
  skillDesc: '',
  skillModes: '',
  skillCompanions: { scripts: false, references: false, assets: false },
  // AI Tool
  toolName: '',
  toolPurpose: '',
  toolLanguage: 'python',
  toolInvocation: 'cli',
  toolRefPath: '',
  // Plugin
  pluginName: '',
  pluginPurpose: '',
  pluginComponents: { commands: false, agents: false, skills: false, hooks: false, mcp: false },
  pluginMarketplace: '',
  pluginServices: '',
  // Agent actions — turn a prompt into action (save to vault / propose next steps)
  agentActions: { saveToVault: false, proposeNextSteps: false }
};

// ------------------------------------------------------------
// UTILITIES
// ------------------------------------------------------------
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}
function autoResizeAll() {
  document.querySelectorAll('textarea').forEach(autoResize);
}
document.addEventListener('input', function(e) {
  if (e.target.tagName === 'TEXTAREA') autoResize(e.target);
});

function $(id) { return document.getElementById(id); }
function getVal(id) { const el = $(id); return el ? el.value.trim() : ''; }
function getFieldValue(id) { const el = $('field_' + id); return el ? el.value.trim() : ''; }

// ------------------------------------------------------------
// THEME
// ------------------------------------------------------------
function initTheme() {
  const saved = localStorage.getItem('flint_theme');
  if (saved) document.documentElement.dataset.theme = saved;
  renderThemeIcon();
}
function toggleTheme() {
  const cur = document.documentElement.dataset.theme;
  const next = cur === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('flint_theme', next);
  renderThemeIcon();
}
function renderThemeIcon() {
  const btn = $('themeBtn');
  if (btn) btn.textContent = document.documentElement.dataset.theme === 'light' ? '\u263E' : '\u2600';
}

// ------------------------------------------------------------
// TIER
// ------------------------------------------------------------
function setTier(tier) {
  state.tier = tier;
  state.activeSignals = [];
  state.outputType = '';
  state.selectedRegistrySources = [];
  state.customSources = [];
  document.querySelectorAll('.tier-btn').forEach(b => b.classList.toggle('active', b.dataset.tier === tier));
  $('tierLabel').textContent = TIER_DISPLAY[tier];
  $('previewTierLabel').textContent = '\u2014 ' + TIER_DISPLAY[tier] + ' Builder';
  $('guardrailHint').textContent = GUARDRAIL_HINT[tier];
  updatePlaceholders();
  renderIntentTemplates();
  renderOutputTypes();
  renderTierFields();
  renderSourcesCard();
  renderSignals();
  renderCheckpoints();
  renderPreview();
  saveDraft();
}

function updatePlaceholders() {
  const intentEl = $('intentInput');
  const supportingEl = $('supportingDump');
  const placeholders = {
    creative: {
      intent: 'What are you chasing? The vaguer the better \u2014 this is pure ideation.',
      supporting: 'Drop anything you\'re circling \u2014 half-baked thoughts, screenshots, quotes, references, fragments...'
    },
    strategic: {
      intent: 'What call are you trying to make as the owner?',
      supporting: 'Paste any background \u2014 customer conversations, notes to self, market signals, prior thinking...'
    },
    operational: {
      intent: 'What needs to ship this week to move the business forward?',
      supporting: 'Dump the context \u2014 customer emails, notes, reference links, anything an agent should see to do the work...'
    },
    technical: {
      intent: 'What are you building into the foundation of the business?',
      supporting: 'Dump your context \u2014 customer requests, SQL snippets, error messages, prior findings...'
    }
  };
  if (intentEl) intentEl.placeholder = placeholders[state.tier].intent;
  if (supportingEl) supportingEl.placeholder = placeholders[state.tier].supporting;
}

// ------------------------------------------------------------
// INTENT TEMPLATES — helpers for flat vs. categorized format
// ------------------------------------------------------------
function isCategorized(raw) {
  return raw.length > 0 && raw[0].category !== undefined;
}

// Returns a flat array of all templates for the current tier (works for both formats)
function getFlatTemplates(tier) {
  const raw = INTENT_TEMPLATES[tier] || [];
  if (isCategorized(raw)) return raw.flatMap(g => g.items);
  return raw;
}

function renderIntentTemplates() {
  const row = $('intentTemplateRow');
  if (!row) return;
  const raw = INTENT_TEMPLATES[state.tier] || [];

  if (!raw.length) { row.innerHTML = ''; row.classList.remove('categorized'); return; }

  if (isCategorized(raw)) {
    row.classList.add('categorized');
    row.innerHTML = raw.map(group => `
      <div class="intent-category">
        <div class="intent-category-label">${group.category}</div>
        <div class="intent-category-chips">
          ${group.items.map(t =>
            `<button class="intent-template-chip" onclick="applyIntentTemplate('${t.id}')">${t.label}</button>`
          ).join('')}
        </div>
      </div>
    `).join('');
  } else {
    row.classList.remove('categorized');
    row.innerHTML = raw.map(t =>
      `<button class="intent-template-chip" onclick="applyIntentTemplate('${t.id}')">${t.label}</button>`
    ).join('');
  }
}

function applyIntentTemplate(id) {
  const template = getFlatTemplates(state.tier).find(t => t.id === id);
  if (!template) return;
  state.intent = template.text;
  $('intentInput').value = template.text;
  autoResize($('intentInput'));

  // Suggest an output type (user can override)
  const suggested = INTENT_TEMPLATE_OUTPUT_SUGGESTIONS[id];
  if (suggested && OUTPUT_TYPES[state.tier].includes(suggested)) {
    $('outputType').value = suggested;
    state.outputType = suggested;
    onOutputTypeChange();
  }
  renderCheckpoints();
  renderPreview();
  saveDraft();
}

// ------------------------------------------------------------
// OUTPUT TYPE
// ------------------------------------------------------------
function renderOutputTypes() {
  const sel = $('outputType');
  const customInput = $('customOutputType');
  const options = OUTPUT_TYPES[state.tier] || [];
  sel.innerHTML = '<option value="">Select...</option>' +
    options.map(o => `<option value="${o}">${o}</option>`).join('');
  if (state.outputType && options.includes(state.outputType)) {
    sel.value = state.outputType;
  } else {
    state.outputType = '';
    if (customInput) customInput.value = '';
  }
  onOutputTypeChange();
}

function onOutputTypeChange() {
  const sel = $('outputType');
  const customInput = $('customOutputType');
  const isOther = sel.value === 'Other';
  customInput.style.display = isOther ? 'block' : 'none';
  state.outputType = isOther ? (customInput.value || 'Other') : sel.value;

  const isSkill  = state.tier === 'technical' && state.outputType === 'SKILL.md';
  const isTool   = state.tier === 'technical' && state.outputType === 'AI Tool';
  const isPlugin = state.tier === 'technical' && state.outputType === 'Plugin';
  const isDPF    = state.tier === 'technical' && state.outputType === 'Data Product (DPF)';

  $('skillSection').classList.toggle('visible', isSkill);
  $('toolSection').classList.toggle('visible', isTool);
  $('pluginSection').classList.toggle('visible', isPlugin);

  // Conditional output-type-aware sections hide the generic Guardrails card
  const hideDetails = isTool || isPlugin || isSkill;
  $('guardrailsCard').style.display = hideDetails ? 'none' : '';

  $('previewModeBadge').textContent = isSkill ? 'SKILL.md' : 'Prompt';

  renderTierFields();
  renderSourcesCard();
  renderCheckpoints();
  renderPreview();
  saveDraft();
}

function onCustomOutputInput() {
  const v = $('customOutputType').value;
  state.outputType = v || 'Other';
  renderCheckpoints();
  renderPreview();
  saveDraft();
}

// ------------------------------------------------------------
// TIER FIELDS (Guardrails card contents)
// ------------------------------------------------------------
function renderTierFields() {
  const container = $('tierFields');
  const fields = getTierFields(state.tier, state.outputType);
  container.innerHTML = fields.map(f => {
    const hint = f.hint ? `<span class="field-hint">${f.hint}</span>` : '';
    return `<div class="field-group">
      <label>${f.label}</label>
      <textarea rows="1" id="field_${f.id}" placeholder="${f.placeholder || ''}" oninput="onFieldChange()"></textarea>
      ${hint}
    </div>`;
  }).join('');
  setTimeout(autoResizeAll, 0);
}

function onFieldChange() {
  renderPreview();
  saveDraft();
}

// ------------------------------------------------------------
// DATA SOURCE PICKER
// ------------------------------------------------------------
function renderSourcesCard() {
  const card = $('sourcesCard');
  const show = OUTPUT_TYPES_WITH_SOURCES.has(state.outputType);
  card.style.display = show ? '' : 'none';
  if (!show) return;

  renderSourceSummary();
  renderSourceGrid();
}

function renderSourceSummary() {
  const summary = $('sourceSummary');
  const regChips = state.selectedRegistrySources.map(id => {
    const t = REGISTRY.tables.find(x => x.id === id);
    if (!t) return '';
    return `<span class="source-chip registry" title="${t.short}">${t.fqn}<span class="x" onclick="toggleRegistrySource('${id}')">&times;</span></span>`;
  }).join('');
  const customChips = state.customSources.map((fqn, i) =>
    `<span class="source-chip custom">${fqn}<span class="x" onclick="removeCustomSource(${i})">&times;</span></span>`
  ).join('');
  const clearLink = (state.selectedRegistrySources.length || state.customSources.length)
    ? `<button class="source-clear" onclick="clearAllSources()">Clear all</button>`
    : '';
  summary.innerHTML = regChips + customChips + clearLink;
}

function renderSourceGrid() {
  const grid = $('sourceGrid');
  grid.innerHTML = REGISTRY.tables.map(t => {
    const sel = state.selectedRegistrySources.includes(t.id) ? ' selected' : '';
    return `<span class="source-grid-chip${sel}" title="${t.fqn}" onclick="toggleRegistrySource('${t.id}')">${t.short}</span>`;
  }).join('');
  const toggle = $('sourceBrowseToggle');
  const count = REGISTRY.tables.length;
  toggle.querySelector('.label').textContent = `Browse data sources (${count})`;
}

function toggleSourceBrowse() {
  const grid = $('sourceGrid');
  const toggle = $('sourceBrowseToggle');
  const open = grid.classList.toggle('open');
  toggle.classList.toggle('open', open);
}

function toggleRegistrySource(id) {
  const idx = state.selectedRegistrySources.indexOf(id);
  if (idx >= 0) state.selectedRegistrySources.splice(idx, 1);
  else state.selectedRegistrySources.push(id);
  renderSourceSummary();
  renderSourceGrid();
  renderPreview();
  saveDraft();
}

function addCustomSource() {
  const input = $('customSourceInput');
  const val = input.value.trim();
  if (!val) return;
  if (!state.customSources.includes(val)) state.customSources.push(val);
  input.value = '';
  renderSourceSummary();
  renderPreview();
  saveDraft();
}

function onCustomSourceKey(e) {
  if (e.key === 'Enter') { e.preventDefault(); addCustomSource(); }
}

function removeCustomSource(i) {
  state.customSources.splice(i, 1);
  renderSourceSummary();
  renderPreview();
  saveDraft();
}

function clearAllSources() {
  state.selectedRegistrySources = [];
  state.customSources = [];
  renderSourceSummary();
  renderSourceGrid();
  renderPreview();
  saveDraft();
}

// ------------------------------------------------------------
// SIGNALS — toggle only on explicit click; never auto-activate
// ------------------------------------------------------------
function renderSignals() {
  const recs = RECOMMENDED_SIGNALS[state.tier] || [];
  const container = $('signalTiles');
  container.innerHTML = SIGNAL_VOCAB.map(group => `
    <div class="signal-group">
      <div class="signal-group-label">${group.group}</div>
      <div class="signal-tile-grid">
        ${group.signals.map(s => {
          const isActive = state.activeSignals.includes(s.id);
          const rec = recs.includes(s.id) ? ' title="Recommended for this tier"' : '';
          return `<div class="signal-tile${isActive ? ' active' : ''}"${rec} onclick="toggleSignal('${s.id}')">
            <span class="signal-tile-label">${s.label}</span>
            <span class="signal-tile-brief">${s.short}</span>
          </div>`;
        }).join('')}
      </div>
    </div>
  `).join('');
  updateSignalPreview();
}

function toggleSignal(id) {
  const idx = state.activeSignals.indexOf(id);
  if (idx >= 0) state.activeSignals.splice(idx, 1);
  else state.activeSignals.push(id);
  renderSignals();
  renderPreview();
  saveDraft();
}

function updateSignalPreview() {
  const badge = $('signalPreviewBadge');
  const preview = $('signalPreview');
  if (state.activeSignals.length === 0) {
    badge.textContent = ''; preview.textContent = '';
    return;
  }
  const prefix = state.activeSignals.map(s => `[${s}]`).join('');
  badge.textContent = state.activeSignals.length + ' active';
  preview.textContent = prefix;
}

function openSignalDrawer() {
  const content = $('signalDrawerContent');
  content.innerHTML = SIGNAL_VOCAB.map(group => `
    <div class="signal-drawer-group">
      <div class="signal-drawer-group-label">${group.group}</div>
      ${group.signals.map(s => `
        <div class="signal-drawer-item">
          <div class="signal-drawer-item-label">${s.label}</div>
          <div class="signal-drawer-item-desc">${s.desc}</div>
        </div>
      `).join('')}
    </div>
  `).join('');
  $('signalBackdrop').classList.add('open');
  $('signalDrawer').classList.add('open');
}

function closeSignalDrawer() {
  $('signalBackdrop').classList.remove('open');
  $('signalDrawer').classList.remove('open');
}

// ------------------------------------------------------------
// CHECKPOINTS
// ------------------------------------------------------------
function getCheckpoints() {
  if (state.tier === 'technical') {
    return TECH_CHECKPOINTS[state.outputType] || TIER_CHECKPOINTS.technical;
  }
  return TIER_CHECKPOINTS[state.tier];
}

function renderCheckpoints() {
  const container = $('checkpointRoadmap');
  const cps = getCheckpoints();
  container.innerHTML = cps.map(cp => `
    <div class="cp-pill"><span class="cp-num">${cp.num}</span><span>${cp.label}</span></div>
  `).join('');
}

// ------------------------------------------------------------
// SUPPORTING MATERIAL collapsible
// ------------------------------------------------------------
function toggleSupporting() {
  const btn = $('supportingToggle');
  const body = $('supportingBody');
  const open = body.classList.toggle('open');
  btn.classList.toggle('open', open);
}

// ------------------------------------------------------------
// INTENT / SUPPORTING field handlers
// ------------------------------------------------------------
function onIntentChange() {
  state.intent = $('intentInput').value;
  renderCheckpoints();
  renderPreview();
  saveDraft();
}
function onSupportingChange() {
  state.supporting = $('supportingDump').value;
  renderPreview();
  saveDraft();
}
function onAudienceChange() {
  state.audience = $('audience').value;
  renderPreview();
  saveDraft();
}

// ------------------------------------------------------------
// SKILL.md / AI Tool / Plugin field handlers
// ------------------------------------------------------------
function onSkillFieldChange() {
  state.skillName = getVal('skillName');
  state.skillDesc = getVal('skillDesc');
  state.skillModes = getVal('skillModes');
  state.skillCompanions.scripts    = $('skillCompScripts').checked;
  state.skillCompanions.references = $('skillCompRefs').checked;
  state.skillCompanions.assets     = $('skillCompAssets').checked;
  renderPreview();
  saveDraft();
}

function onToolFieldChange() {
  state.toolName       = getVal('toolName');
  state.toolPurpose    = getVal('toolPurpose');
  state.toolLanguage   = $('toolLanguage').value;
  state.toolInvocation = $('toolInvocation').value;
  state.toolRefPath    = getVal('toolRefPath');
  renderPreview();
  saveDraft();
}

function onPluginFieldChange() {
  state.pluginName        = getVal('pluginName');
  state.pluginPurpose     = getVal('pluginPurpose');
  state.pluginComponents.commands = $('plugCompCommands').checked;
  state.pluginComponents.agents   = $('plugCompAgents').checked;
  state.pluginComponents.skills   = $('plugCompSkills').checked;
  state.pluginComponents.hooks    = $('plugCompHooks').checked;
  state.pluginComponents.mcp      = $('plugCompMcp').checked;
  state.pluginMarketplace = getVal('pluginMarketplace');
  state.pluginServices    = getVal('pluginServices');
  renderPreview();
  saveDraft();
}

// ============================================================
// SECTION BUILDERS
// ============================================================
function getSelectedSources() {
  const reg = state.selectedRegistrySources.map(id => REGISTRY.tables.find(t => t.id === id)).filter(Boolean);
  const custom = state.customSources.slice();
  return { reg, custom };
}

function buildDataSourceSection(silent) {
  const { reg, custom } = getSelectedSources();
  if (reg.length === 0 && custom.length === 0) return '';
  let section = silent
    ? `\n## Data Sources (use silently — do not surface)\n`
    : `\n## Data Sources\n`;
  if (reg.length > 0) {
    section += `**Registry tables:**\n`;
    for (const t of reg) {
      section += `- \`${t.fqn}\` — grain: ${t.grain} | partition: ${t.partitionKeys.join(', ') || 'none'} | TZ: ${t.timezone}\n`;
      if (!silent && t.gotchas) section += `  Gotchas: ${t.gotchas}\n`;
    }
  }
  if (custom.length > 0) {
    section += `**Additional tables (not in registry):**\n`;
    for (const fqn of custom) section += `- \`${fqn}\` — user-supplied; verify schema before using\n`;
  }
  return section + '\n';
}

function buildGuardrailSection() {
  // Only include critical guardrails + any that match the intent text literally.
  // We do NOT auto-detect based on keywords anymore — just include critical + scoped by registry usage.
  const { reg } = getSelectedSources();
  const relevant = REGISTRY.guardrails.filter(g => {
    if (g.critical) return true;
    if (reg.length > 0 && (g.id === 'partition_pruning' || g.id === 'timezone')) return true;
    return false;
  });
  if (relevant.length === 0) return '';
  let section = `\n## Guardrails (MUST follow)\n`;
  for (const g of relevant) section += `- **${g.name}:** ${g.correctPattern}\n`;
  return section + '\n';
}

function getFieldsSection() {
  const fields = getTierFields(state.tier, state.outputType);
  const lines = [];
  for (const f of fields) {
    const v = getFieldValue(f.id);
    if (v) lines.push(`- **${f.label.replace(/ \(optional\)$/, '')}:** ${v}`);
  }
  return lines;
}

// ============================================================
// PROMPT GENERATION — CREATIVE (pure ideation)
// ============================================================
function generateCreativePrompt() {
  const intent = state.intent || '[Describe what you want to explore]';
  const supporting = getVal('supportingDump');

  let p = `## Spark\n${intent}\n\n`;
  if (supporting) p += `## Raw material\n${supporting}\n\n`;

  p += `## Mode\nThis is pure ideation \u2014 I'm not asking you to converge on "the answer." Go wide first, converge only at the end. Favor range over polish.\n\n`;

  const fieldLines = getFieldsSection();
  if (fieldLines.length) p += `**Creative brief:**\n${fieldLines.join('\n')}\n\n`;

  p += `## Process \u2014 Diverge \u2192 Cluster \u2192 Sharpen\n`;
  p += `1. **Diverge** \u2014 Give me a wide spread. Obvious, weird, contrarian, and one I'd probably hate. No filtering yet, no feasibility checks. Aim for range over quality.\n`;
  p += `2. **Cluster** \u2014 Group what you generated into 3-5 themes. Name each theme in 2-4 words. Tell me what each theme trades away.\n`;
  p += `3. **Sharpen** \u2014 Pick the 2-3 strongest threads (your call) and sharpen them into something I could actually show someone. No hedging, no "it depends" \u2014 take a stance.\n\n`;

  p += `## Constraints\n`;
  p += `- Don't ask me to clarify upfront \u2014 run with the spark and surface ambiguity only after the Diverge pass.\n`;
  p += `- Skip throat-clearing. No "here are some ideas" preambles.\n`;
  p += `- If a branch feels dead, say so \u2014 don't pad it out.\n\n`;

  return p;
}

// ============================================================
// PROMPT GENERATION — STRATEGIC
// ============================================================
function generateStrategicPrompt() {
  const intent = state.intent || '[Describe your question here]';
  const audience = getVal('audience');
  const supporting = getVal('supportingDump');

  let p = `## Question\n${intent}\n\n`;
  p += `## Instructions\nAnswer this as a ${state.outputType || 'founder-ready read'} — I'm the owner making the call, not a committee reviewing a deck.\n`;
  if (audience) p += `Format for: ${audience}. Plain language, no jargon.\n`;

  const fieldLines = getFieldsSection();
  if (fieldLines.length) p += `\n**Constraints:**\n${fieldLines.join('\n')}\n`;
  p += '\n';

  if (supporting) p += `## Background\n${supporting}\n\n`;

  p += `## Checkpoint\nBefore delivering, confirm how you're reading the question in 1-2 sentences. If it could mean multiple things, lay out the options and ask which one. STOP and wait.\n\n`;

  p += `## Deliverable\nPresent:\n`;
  p += `- 2-sentence headline — the so-what for the business\n`;
  p += `- Supporting evidence (clean table or short chart description, no raw SQL dumps)\n`;
  p += `- Confidence level and what would change your read\n`;
  p += `- Recommended next move — what I should do Monday morning\n\n`;

  const ds = buildDataSourceSection(true);
  if (ds) p += ds;

  return p;
}

// ============================================================
// PROMPT GENERATION — OPERATIONAL
// ============================================================
function generateOperationalPrompt() {
  const intent = state.intent || '[Describe what you need created]';
  const audience = getVal('audience');
  const supporting = getVal('supportingDump');

  let p = `## Brief\n${intent}\n\n`;
  if (supporting) p += `## Raw Context\n${supporting}\n\n`;

  p += `## Deliverable\nBuild a ${state.outputType || 'deliverable'}`;
  if (audience) p += ` for ${audience}`;
  p += '.\n';

  const fieldLines = getFieldsSection();
  if (fieldLines.length) p += fieldLines.join('\n') + '\n';
  p += '\n';

  p += `## Execution Plan\nFollow these steps IN ORDER. At each gate, present your work and STOP so I can review before you keep building.\n\n`;
  p += `**Step 1 — Confirm Approach (GATE)**\nRestate the ask in one sentence, name the data sources and method, call out key assumptions, and flag anything you need from me. STOP.\n\n`;
  p += `**Step 2 — First Draft (GATE)**\nShip a working version fast. Separate what you're confident about, what needs validation, and anything that surprised you. STOP.\n\n`;
  p += `**Step 3 — Final Deliverable**\nPolish based on my feedback. Include a short methodology note and 1-3 concrete next moves I can take this week.\n\n`;

  const ds = buildDataSourceSection(false);
  if (ds) p += ds;
  const gr = buildGuardrailSection();
  if (gr) p += gr;

  return p;
}

// ============================================================
// PROMPT GENERATION — TECHNICAL (dispatcher)
// ============================================================
function generateTechnicalPrompt() {
  switch (state.outputType) {
    case 'SKILL.md':             return generateSkillPrompt();
    case 'AI Tool':              return generateAiToolPrompt();
    case 'Plugin':               return generatePluginPrompt();
    case 'SQL Analysis':         return generateSqlAnalysisPrompt();
    case 'Data Pipeline':        return generateDataPipelinePrompt();
    case 'Data Product (DPF)':   return generateDpfPrompt();
    case 'Interactive Dashboard':return generateDashboardPrompt();
    case 'Notebook':             return generateNotebookPrompt();
    case 'Experiment Read':      return generateExperimentPrompt();
    default:                     return generateGenericTechnicalPrompt();
  }
}

function generateGenericTechnicalPrompt() {
  const intent = state.intent || '[Describe the problem]';
  const supporting = getVal('supportingDump');
  const audience = getVal('audience');
  let p = `## Problem\n${intent}\n\n`;
  if (supporting) p += `## Context\n${supporting}\n\n`;
  p += `## Target Output\n${state.outputType || 'Technical deliverable'}\n`;
  if (audience) p += `Audience: ${audience}\n`;
  const fieldLines = getFieldsSection();
  if (fieldLines.length) p += fieldLines.join('\n') + '\n';
  p += '\n## Quick Check\nRestate how you read this problem in 1-2 sentences. Flag if off base.\n\n';
  const ds = buildDataSourceSection(false); if (ds) p += ds;
  const gr = buildGuardrailSection();       if (gr) p += gr;
  p += `## Go\nBuild it. Surface ambiguity briefly and propose your best option rather than stopping.\n`;
  return p;
}

// ------------------------------------------------------------
// SQL Analysis
// ------------------------------------------------------------
function generateSqlAnalysisPrompt() {
  const intent = state.intent || '[Describe the question]';
  const supporting = getVal('supportingDump');
  let p = `## Problem\n${intent}\n\n`;
  if (supporting) p += `## Context\n${supporting}\n\n`;
  p += `## Target Output\nSQL query + result presentation\n`;
  const fieldLines = getFieldsSection();
  if (fieldLines.length) p += fieldLines.join('\n') + '\n';
  p += '\n';
  p += `## Process — Contract-Driven Query Building\n`;
  p += `1. **Understand question** — Restate the question and the decision it informs. Flag if ambiguous.\n`;
  p += `2. **Resolve contracts** — Pull metric definitions from the catalog. State timezone assumption. Identify partitions needed for pruning. For YoY, align on iso_week not raw calendar date.\n`;
  p += `3. **Compose query** — Write the SQL. Use CTEs for readability. Split-date patterns where metrics span period boundaries.\n`;
  p += `4. **Validate** — Row counts, null checks, reconciliation vs a known reference number.\n`;
  p += `5. **Present** — Headline finding, table of results, SQL in a collapsible section.\n\n`;
  const ds = buildDataSourceSection(false); if (ds) p += ds;
  const gr = buildGuardrailSection();       if (gr) p += gr;
  return p;
}

// ------------------------------------------------------------
// Data Pipeline
// ------------------------------------------------------------
function generateDataPipelinePrompt() {
  const intent = state.intent || '[Describe the pipeline]';
  const supporting = getVal('supportingDump');
  let p = `## Problem\n${intent}\n\n`;
  if (supporting) p += `## Context\n${supporting}\n\n`;
  p += `## Target Output\nProduction data pipeline\n`;
  const fieldLines = getFieldsSection();
  if (fieldLines.length) p += fieldLines.join('\n') + '\n';
  p += '\n';
  p += `## Process\n`;
  p += `1. **Quick check** — Restate the pipeline goal, source tables, target table, and grain in 1-2 sentences.\n`;
  p += `2. **DDL + schema** — Define the target schema: columns, types, partition key, primary key. Show the CREATE TABLE.\n`;
  p += `3. **ETL logic** — Write the transformation. Make it idempotent and backfillable by date range. Use partition pruning on sources.\n`;
  p += `4. **Validate** — Row counts, uniqueness on grain, dq checks (null/type/range), reconciliation vs a reference total.\n`;
  p += `5. **Schedule** — Cadence, dependencies, alerting on failure, SLA.\n\n`;
  const ds = buildDataSourceSection(false); if (ds) p += ds;
  const gr = buildGuardrailSection();       if (gr) p += gr;
  return p;
}

// ------------------------------------------------------------
// Data Product (DPF)
// ------------------------------------------------------------
function generateDpfPrompt() {
  const intent = state.intent || '[Describe the data product]';
  const supporting = getVal('supportingDump');
  let p = `## Problem\n${intent}\n\n`;
  if (supporting) p += `## Context\n${supporting}\n\n`;
  p += `## Target Output\nData Product brief (DPF-style)\n`;
  const fieldLines = getFieldsSection();
  if (fieldLines.length) p += fieldLines.join('\n') + '\n';
  p += '\n';
  p += `## Process\n`;
  p += `1. **Scope & owner** — What is this dataset, why it matters to the business, and who maintains it (usually just me). If a collaborator is co-owner, name them.\n`;
  p += `2. **Contract** — Semantics, grain, canonical keys, update cadence, and how I'll handle changes without breaking my own dashboards.\n`;
  p += `3. **Schema + SLAs** — Column-level schema with types + nullability. Realistic freshness target for a one-person shop; quality checks I can actually maintain.\n`;
  p += `4. **Consumers & access** — Name every downstream reader (my dashboards, customer-facing reports, a trainee's notebook). How I'll tell them before I change something.\n`;
  p += `5. **Ship brief** — One-pager: name, purpose, contract, freshness target, consumers, owner. Something I'd hand a future hire on day one.\n\n`;
  const ds = buildDataSourceSection(false); if (ds) p += ds;
  const gr = buildGuardrailSection();       if (gr) p += gr;
  return p;
}

// ------------------------------------------------------------
// Interactive Dashboard
// ------------------------------------------------------------
function generateDashboardPrompt() {
  const intent = state.intent || '[Describe the dashboard]';
  const supporting = getVal('supportingDump');
  let p = `## Problem\n${intent}\n\n`;
  if (supporting) p += `## Context\n${supporting}\n\n`;
  p += `## Target Output\nSelf-contained interactive HTML dashboard (Plotly / D3 / Chart.js)\n`;
  const fieldLines = getFieldsSection();
  if (fieldLines.length) p += fieldLines.join('\n') + '\n';
  p += '\n';
  p += `## Process\n`;
  p += `1. **Schema** — Define the input data shape (columns, types) and how the dashboard will receive it (static embed vs API fetch).\n`;
  p += `2. **Layout** — Sketch the grid: KPI row, main chart, breakdowns, filters. Responsive.\n`;
  p += `3. **Charts** — Choose chart types per question. Plotly default. Consistent color palette + theme (dark/light).\n`;
  p += `4. **Interactivity** — Filters, cross-filtering, tooltips, drill-downs. Debounce API calls.\n`;
  p += `5. **Deploy** — Single HTML file with all JS/CSS inline or CDN. Document how to refresh the data.\n\n`;
  const ds = buildDataSourceSection(false); if (ds) p += ds;
  const gr = buildGuardrailSection();       if (gr) p += gr;
  return p;
}

// ------------------------------------------------------------
// Notebook (Databricks)
// ------------------------------------------------------------
function generateNotebookPrompt() {
  const intent = state.intent || '[Describe the investigation]';
  const supporting = getVal('supportingDump');
  let p = `## Problem\n${intent}\n\n`;
  if (supporting) p += `## Context\n${supporting}\n\n`;
  p += `## Target Output\nDatabricks notebook (\`# Databricks notebook source\`, \`# COMMAND ----------\` separators, \`# MAGIC %sql\` / \`# MAGIC %md\` prefixes)\n`;
  const fieldLines = getFieldsSection();
  if (fieldLines.length) p += fieldLines.join('\n') + '\n';
  p += '\n';
  p += `## Process\n`;
  p += `1. **Setup** — Imports, params (widgets), config. Markdown title + TL;DR cell.\n`;
  p += `2. **Query** — \`%sql\` cells to pull from production tables. Partition pruning required.\n`;
  p += `3. **Transform** — Python/pandas/spark for aggregation and shaping.\n`;
  p += `4. **Visualize** — Charts inline (display()/matplotlib/plotly).\n`;
  p += `5. **Document** — Markdown cells explaining methodology, findings, caveats, next steps. Share as HTML.\n\n`;
  const ds = buildDataSourceSection(false); if (ds) p += ds;
  const gr = buildGuardrailSection();       if (gr) p += gr;
  return p;
}

// ------------------------------------------------------------
// Experiment Read
// ------------------------------------------------------------
function generateExperimentPrompt() {
  const intent = state.intent || '[Describe the experiment]';
  const supporting = getVal('supportingDump');
  let p = `## Problem\n${intent}\n\n`;
  if (supporting) p += `## Context\n${supporting}\n\n`;
  p += `## Target Output\nExperiment read — treatment effects with confidence intervals, segment deep-dive, recommendation\n`;
  const fieldLines = getFieldsSection();
  if (fieldLines.length) p += fieldLines.join('\n') + '\n';
  p += '\n';
  p += `## Process — Rigorous A/B Analysis\n`;
  p += `1. **Identify test** — Confirm test ID, recipes, exposure window, randomization unit. Check for version-overlap issues.\n`;
  p += `2. **Pull data** — ITC (intent-to-treat) cohort. Avoid post-treatment conditioning — do not filter on outcomes of the treatment.\n`;
  p += `3. **Compute effects** — Estimate treatment effect per metric. Delta Method CIs (or bootstrap). Power check.\n`;
  p += `4. **Segment** — Pre-registered segments only (to avoid p-hacking). Flag heterogeneity but don't overclaim.\n`;
  p += `5. **Interpret** — Is the effect real (stat sig + practical sig)? Any guardrail metric regressions?\n`;
  p += `6. **Report** — Recommendation (ship / kill / iterate), with CIs and caveats. One-paragraph owner-ready summary — I'm the one deciding.\n\n`;
  const ds = buildDataSourceSection(false); if (ds) p += ds;
  const gr = buildGuardrailSection();       if (gr) p += gr;
  return p;
}

// ------------------------------------------------------------
// SKILL.md
// ------------------------------------------------------------
function generateSkillPrompt() {
  const intent = state.intent || '[Describe the workflow]';
  const supporting = getVal('supportingDump');
  const name = (state.skillName || 'custom-workflow').toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 64);
  const desc = state.skillDesc || 'Use when asked to perform this workflow.';
  const modes = (state.skillModes || '').split(',').map(m => m.trim()).filter(Boolean);
  const companions = [];
  if (state.skillCompanions.scripts)    companions.push('scripts/');
  if (state.skillCompanions.references) companions.push('references/');
  if (state.skillCompanions.assets)     companions.push('assets/');

  // ASCII tree
  const treeLines = [`${name}/`, `\u251C\u2500\u2500 SKILL.md`];
  companions.forEach((c, i) => {
    const isLast = i === companions.length - 1;
    treeLines.push(`${isLast ? '\u2514' : '\u251C'}\u2500\u2500 ${c}`);
  });
  const tree = treeLines.join('\n');

  let s = `# Build a Claude Skill: \`${name}\`\n\n`;
  s += `## Context\n${intent}\n\n`;
  if (supporting) s += `## Supporting material\n${supporting}\n\n`;

  s += `## Scaffold this directory\n\`\`\`\n${tree}\n\`\`\`\n\n`;

  s += `## SKILL.md content\n\n`;
  s += `Write \`SKILL.md\` with this YAML frontmatter — the \`description\` is the only text an agent reads before activating the skill, so make the trigger keywords surface here:\n\n`;
  s += '```markdown\n';
  s += `---\nname: ${name}\ndescription: ${JSON.stringify(desc)}\n---\n\n`;
  s += `# ${name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}\n\n`;
  s += `## When to Use\n- ${desc}\n- [Add 2-3 more trigger phrases users/agents would naturally say]\n\n`;
  s += `## When NOT to Use\n- [Negative trigger: describe adjacent tasks this skill should NOT handle]\n- [Routing hint: point to the correct skill/tool for those cases]\n\n`;
  if (modes.length > 0) {
    s += `## Modes\nThis skill has distinct sub-workflows. Pick the mode first, then follow its steps.\n\n`;
    modes.forEach(m => {
      s += `### Mode: ${m}\n1. [Step 1 for "${m}"]\n2. [Step 2]\n3. [Step 3 — deliver]\n\n`;
    });
  } else {
    s += `## Steps\n`;
    s += `### Step 0 — Verify access\nConfirm required data/files are accessible. If not, surface the exact command/SQL for manual execution.\n\n`;
    s += `### Step 1 — Quick check (GATE)\nRestate the request. Confirm interpretation before continuing. STOP.\n\n`;
    s += `### Step 2 — Execute\n[Define the main execution logic here]\n\n`;
    s += `### Step 3 — Deliver\nPresent final output with methodology notes and any caveats.\n\n`;
  }

  if (companions.length > 0) {
    s += `## Companion files\n`;
    if (state.skillCompanions.scripts)    s += `- \`scripts/\` — executable helpers the skill can invoke (bash, python). Progressive disclosure: keep them small.\n`;
    if (state.skillCompanions.references) s += `- \`references/\` — long-form docs loaded only on demand (schemas, playbooks).\n`;
    if (state.skillCompanions.assets)     s += `- \`assets/\` — templates, fixtures, example outputs.\n`;
    s += '\n';
  }
  s += '```\n\n';

  s += `## Best practices\n`;
  s += `- **Progressive disclosure**: keep \`SKILL.md\` short. Push depth into \`references/\` that load on demand.\n`;
  s += `- **Trigger keywords in description**: the description is the only pre-activation signal. Include natural phrasings.\n`;
  s += `- **Negative triggers**: explicitly list what this skill should NOT do so it doesn't fire on adjacent tasks.\n`;
  s += `- **Idempotent**: running the skill twice with the same input should produce the same output.\n\n`;

  const ds = buildDataSourceSection(false); if (ds) s += ds;
  return s;
}

// ------------------------------------------------------------
// AI Tool
// ------------------------------------------------------------
function generateAiToolPrompt() {
  const intent = state.intent || '[Describe what the tool does]';
  const supporting = getVal('supportingDump');
  const name = (state.toolName || 'new-tool').toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const purpose = state.toolPurpose || '{what it does}';
  const lang = state.toolLanguage || 'python';
  const invocation = state.toolInvocation || 'cli';
  const refPath = state.toolRefPath;

  const langLabel = { python: 'Python', typescript: 'TypeScript (Node)', shell: 'Shell (bash)' }[lang] || lang;
  const ext = { python: 'py', typescript: 'ts', shell: 'sh' }[lang] || 'py';

  let p = `# Build an AI Tool: \`${name}\`\n\n`;
  p += `## Context\n${intent}\n\n`;
  if (supporting) p += `## Supporting material\n${supporting}\n\n`;

  p += `## Tool spec\n`;
  p += `- **Name:** \`${name}\`\n`;
  p += `- **Purpose:** ${purpose}\n`;
  p += `- **Language:** ${langLabel}\n`;
  p += `- **Invocation:** ${invocation === 'cli' ? 'CLI' : invocation === 'slash' ? 'Slash command (.claude/commands/)' : 'Skill-invoked'}\n`;
  if (refPath) p += `- **Reference code:** \`${refPath}\` — read this first and use it as a starting point.\n`;
  p += '\n';

  // File structure depends on invocation + language
  p += `## File structure\n\`\`\`\n`;
  if (invocation === 'slash') {
    p += `.claude/commands/${name}.md        # slash command definition (YAML frontmatter + prompt)\n`;
    p += `tools/${name}/\n\u251C\u2500\u2500 ${name}.${ext}\n\u251C\u2500\u2500 README.md\n`;
    if (lang === 'python') p += `\u2514\u2500\u2500 requirements.txt\n`;
    else if (lang === 'typescript') p += `\u2514\u2500\u2500 package.json\n`;
  } else if (invocation === 'skill') {
    p += `.claude/skills/${name}/\n\u251C\u2500\u2500 SKILL.md                # skill that invokes this tool\n\u251C\u2500\u2500 scripts/${name}.${ext}\n\u2514\u2500\u2500 README.md\n`;
  } else {
    p += `tools/${name}/\n\u251C\u2500\u2500 ${name}.${ext}\n\u251C\u2500\u2500 README.md\n`;
    if (lang === 'python') p += `\u2514\u2500\u2500 requirements.txt\n`;
    else if (lang === 'typescript') p += `\u2514\u2500\u2500 package.json\n`;
  }
  p += `\`\`\`\n\n`;

  // Invocation-specific examples
  if (invocation === 'slash') {
    p += `## Slash command format (\`.claude/commands/${name}.md\`)\n`;
    p += '```markdown\n---\nname: ' + name + '\ndescription: ' + JSON.stringify(purpose) + '\n---\n\n# ' + name + '\n\n{{user prompt goes here — invoke tools/' + name + '/' + name + '.' + ext + '}}\n```\n\n';
  } else if (invocation === 'skill') {
    p += `## Callsite from SKILL.md\n`;
    p += '```markdown\n### Step 2 — Run tool\n```\nbash scripts/' + name + '.' + ext + ' --input ...\n```\n```\n\n';
  } else {
    p += `## CLI pattern (${langLabel})\n`;
    if (lang === 'python') p += `Use \`argparse\`. Ship \`--help\`. Return JSON to stdout; log to stderr.\n\n`;
    else if (lang === 'typescript') p += `Use \`commander\`. Ship \`--help\`. Return JSON to stdout.\n\n`;
    else p += `Use \`getopts\`. Ship \`-h\`/\`--help\`. Exit non-zero on error.\n\n`;
  }

  p += `## Build process\n`;
  p += `1. **Scaffold** — Create the directory and stub files above.\n`;
  p += `2. **Implement** — Write the core logic${refPath ? ' starting from `' + refPath + '`' : ''}. Keep it small and pure.\n`;
  p += `3. **Test** — Run it end-to-end with realistic inputs. Include at least one failure-path test.\n`;
  p += `4. **Document** — README with: what it does, how to install, how to call, inputs/outputs, examples.\n\n`;

  p += `Walk me through each step. Stop at each checkpoint.\n`;
  return p;
}

// ------------------------------------------------------------
// Plugin (Claude Code Plugin / Marketplace)
// ------------------------------------------------------------
function generatePluginPrompt() {
  const intent = state.intent || '[Describe the plugin]';
  const supporting = getVal('supportingDump');
  const name = (state.pluginName || 'new-plugin').toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const purpose = state.pluginPurpose || '{what the plugin does}';
  const marketplace = state.pluginMarketplace || '{marketplace / repo}';
  const services = state.pluginServices;

  const c = state.pluginComponents;
  const componentList = [];
  if (c.commands) componentList.push('Slash commands');
  if (c.agents)   componentList.push('Agents');
  if (c.skills)   componentList.push('Skills');
  if (c.hooks)    componentList.push('Hooks');
  if (c.mcp)      componentList.push('MCP server');

  let p = `# Build a Claude Code Plugin: \`${name}\`\n\n`;
  p += `## Context\n${intent}\n\n`;
  if (supporting) p += `## Supporting material\n${supporting}\n\n`;

  p += `## Plugin spec\n`;
  p += `- **Name:** \`${name}\`\n`;
  p += `- **Purpose:** ${purpose}\n`;
  p += `- **Target marketplace:** ${marketplace}\n`;
  if (componentList.length) p += `- **Components:** ${componentList.join(', ')}\n`;
  if (services)             p += `- **External services:** ${services}\n`;
  p += '\n';

  // Plugin directory tree
  p += `## Plugin directory\n\`\`\`\n`;
  p += `${name}/\n\u251C\u2500\u2500 plugin.json              # manifest\n\u251C\u2500\u2500 README.md\n`;
  if (c.commands) p += `\u251C\u2500\u2500 commands/                # slash commands\n\u2502   \u2514\u2500\u2500 example.md\n`;
  if (c.agents)   p += `\u251C\u2500\u2500 agents/                  # subagent definitions\n\u2502   \u2514\u2500\u2500 example.md\n`;
  if (c.skills)   p += `\u251C\u2500\u2500 skills/\n\u2502   \u2514\u2500\u2500 example/SKILL.md\n`;
  if (c.hooks)    p += `\u251C\u2500\u2500 hooks/\n\u2502   \u2514\u2500\u2500 pre-commit.sh\n`;
  if (c.mcp)      p += `\u251C\u2500\u2500 mcp-server/              # MCP server scaffold\n\u2502   \u251C\u2500\u2500 index.ts\n\u2502   \u2514\u2500\u2500 package.json\n`;
  p += `\u2514\u2500\u2500 LICENSE\n\`\`\`\n\n`;

  // plugin.json manifest
  p += `## \`plugin.json\` manifest\n`;
  p += '```json\n{\n';
  p += `  "name": "${name}",\n`;
  p += `  "version": "0.1.0",\n`;
  p += `  "description": ${JSON.stringify(purpose)},\n`;
  p += `  "components": {\n`;
  const manifestParts = [];
  if (c.commands) manifestParts.push('    "commands": "./commands"');
  if (c.agents)   manifestParts.push('    "agents": "./agents"');
  if (c.skills)   manifestParts.push('    "skills": "./skills"');
  if (c.hooks)    manifestParts.push('    "hooks": "./hooks"');
  if (c.mcp)      manifestParts.push('    "mcp": "./mcp-server"');
  p += manifestParts.join(',\n') + (manifestParts.length ? '\n' : '');
  p += `  }\n}\n\`\`\`\n\n`;

  if (c.mcp) {
    p += `## MCP server scaffold\nUse the \`@modelcontextprotocol/sdk\` TypeScript SDK. Expose tools for: ${services || '[the external services above]'}. Implement \`ListTools\` and \`CallTool\` handlers.\n\n`;
  }

  p += `## Build process\n`;
  p += `1. **Scaffold** — Create the directory tree above.\n`;
  p += `2. **Manifest** — Fill in \`plugin.json\`.\n`;
  p += `3. **Components** — Implement each selected component as stubs first, then wire real behavior.\n`;
  p += `4. **Integration** — If external services (${services || 'none listed'}) — build the integration layer${c.mcp ? ' inside the MCP server' : ''}.\n`;
  p += `5. **Test** — Install locally via \`claude plugin install ./${name}\`. Exercise each component.\n`;
  p += `6. **Publish** — Tag a release. Submit to \`${marketplace}\` per its contribution guide. README must include install instructions.\n\n`;

  p += `Walk me through each step. Stop at each checkpoint.\n`;
  return p;
}

// ============================================================
// SIGNAL PREFIX
// ============================================================
function getSignalPrefix() {
  if (state.activeSignals.length === 0) return '';
  const prefix = state.activeSignals.map(s => `[${s}]`).join('') + '\n\n';
  const all = SIGNAL_VOCAB.flatMap(g => g.signals);
  const defs = state.activeSignals.map(id => all.find(s => s.id === id)).filter(Boolean);
  if (defs.length === 0) return prefix;
  let block = prefix + '## Signal Definitions\nThe following signals modify how you respond:\n';
  defs.forEach(s => { block += `- **${s.label}**: ${s.instruction}\n`; });
  return block + '\n';
}

// ============================================================
// MASTER GENERATION
// ============================================================
function generatePrompt() {
  const prefix = getSignalPrefix();
  let body;
  if (state.tier === 'creative')         body = generateCreativePrompt();
  else if (state.tier === 'strategic')   body = generateStrategicPrompt();
  else if (state.tier === 'operational') body = generateOperationalPrompt();
  else                                   body = generateTechnicalPrompt();
  return prefix + body + buildAgentActionsSection();
}

// ============================================================
// AGENT ACTIONS \u2014 turn the prompt into action
// Appends directives when user toggles Save to Vault / Propose next steps
// ============================================================
function buildAgentActionsSection() {
  const a = state.agentActions || {};
  if (!a.saveToVault && !a.proposeNextSteps) return '';

  let s = `\n## Agent actions (execute after delivering the answer)\n`;

  if (a.saveToVault) {
    const tierSlug = state.tier || 'creative';
    s += `- **Save to AIOS Inbox.** Write the core idea/output to \`~/hanamoto_ai/Inbox/\` as a new \`.md\` file.\n`;
    s += `  - Filename: \`YYYY-MM-DD-<short-kebab-slug-from-intent>.md\` (use today's date).\n`;
    s += `  - Start with YAML frontmatter: \`---\\ncreated: <ISO date>\\ntier: ${tierSlug}\\nsource: flint\\ntags: [inbox, ${tierSlug}]\\n---\`\n`;
    s += `  - Body: a one-paragraph summary of the idea, then the full output under a \`## Full output\` heading. Keep it scannable so I can process it in my next Inbox review.\n`;
  }
  if (a.proposeNextSteps) {
    s += `- **Propose next steps.** After the main deliverable, add a \`## Next moves\` section with 3-5 concrete actions I could take. For each: the action, which agent or tool to run it (e.g. a SKILL.md, a slash command, a one-shot Claude Code task), and the smallest version I could ship today.\n`;
  }
  return s + '\n';
}

function onAgentActionChange() {
  state.agentActions.saveToVault      = $('agentActionSaveVault').checked;
  state.agentActions.proposeNextSteps = $('agentActionNextSteps').checked;
  renderPreview();
  saveDraft();
}

// ============================================================
// SEND TO CLAUDE \u2014 open claude.ai/new with prompt pre-filled
// ============================================================
function sendToClaude() {
  const text = generatePrompt();
  // claude.ai/new accepts ?q=<urlencoded>. Cap at ~6000 chars to stay under URL limits.
  const MAX = 6000;
  const payload = text.length > MAX ? text.slice(0, MAX) + '\n\n[\u2026truncated; paste remainder manually]' : text;
  const url = 'https://claude.ai/new?q=' + encodeURIComponent(payload);
  window.open(url, '_blank', 'noopener');
  // Also drop to clipboard so the user can paste the full thing if truncated
  try { navigator.clipboard.writeText(text); } catch(e) {}
  const fb = $('copyFeedback');
  if (fb) {
    fb.textContent = text.length > MAX
      ? 'Opening Claude \u2014 full prompt copied (truncated in URL).'
      : 'Opening Claude with prompt pre-filled.';
    fb.classList.add('visible');
    setTimeout(() => fb.classList.remove('visible'), 2500);
  }
}

// ============================================================
// MOBILE TAB SWITCHING
// ============================================================
let _activeTab = 'build';

function switchTab(tab) {
  _activeTab = tab;
  const grid = document.querySelector('.main-grid');
  if (grid) {
    // Strip all tab-active-* classes then add the new one
    grid.className = grid.className
      .split(' ')
      .filter(c => !c.startsWith('tab-active-'))
      .concat('tab-active-' + tab)
      .join(' ');
  }
  document.querySelectorAll('.tab-btn').forEach(b => {
    const active = b.dataset.tab === tab;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', String(active));
  });
  // Re-render preview when switching to preview tab (content may have changed)
  if (tab === 'preview') renderPreview();
  else updatePreviewBadge(); // update badge visibility when leaving preview
}

function updatePreviewBadge() {
  const badge = $('tabBadgePreview');
  if (!badge) return;
  const hasContent = !!(state.intent || getVal('supportingDump'));
  badge.classList.toggle('visible', hasContent && _activeTab !== 'preview');
}

// ============================================================
// RENDER PREVIEW
// ============================================================
function renderPreview() {
  const area = $('previewArea');
  if (!state.intent && !getVal('supportingDump')) {
    area.innerHTML = '<span style="color:var(--text-muted);line-height:1.8">' +
      '1. Pick your tier above<br>' +
      '2. Click an intent template or type your own goal<br>' +
      '3. Pick output type; fill the guardrails<br>' +
      '4. Your prompt builds itself here</span>';
    updatePreviewBadge();
    return;
  }
  area.textContent = generatePrompt();
  updatePreviewBadge();
}

// ============================================================
// ACTIONS
// ============================================================
function copyToClipboard() {
  const text = generatePrompt();
  navigator.clipboard.writeText(text).then(() => {
    const fb = $('copyFeedback');
    fb.textContent = 'Copied! Paste into Claude Code.';
    fb.classList.add('visible');
    setTimeout(() => fb.classList.remove('visible'), 2000);
  });
}

function downloadFile() {
  const text = generatePrompt();
  const isSkill = state.tier === 'technical' && state.outputType === 'SKILL.md';
  const filename = isSkill
    ? ((state.skillName || 'custom-workflow') + '-SKILL.md')
    : 'flint-prompt.md';
  const blob = new Blob([text], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// PERSISTENCE
// ============================================================
function saveDraft() {
  try {
    localStorage.setItem('flint_draft', JSON.stringify({
      tier: state.tier,
      intent: state.intent,
      supporting: state.supporting,
      outputType: state.outputType,
      audience: state.audience,
      activeSignals: state.activeSignals,
      selectedRegistrySources: state.selectedRegistrySources,
      customSources: state.customSources,
      agentActions: state.agentActions,
      savedAt: new Date().toISOString()
    }));
  } catch(e) {}
}

function loadDraft() {
  try {
    const raw = localStorage.getItem('flint_draft');
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.tier) state.tier = d.tier;
    if (d.intent) state.intent = d.intent;
    if (d.supporting) state.supporting = d.supporting;
    if (d.outputType) state.outputType = d.outputType;
    if (d.audience) state.audience = d.audience;
    if (Array.isArray(d.activeSignals)) state.activeSignals = d.activeSignals;
    if (Array.isArray(d.selectedRegistrySources)) state.selectedRegistrySources = d.selectedRegistrySources;
    if (Array.isArray(d.customSources)) state.customSources = d.customSources;
    if (d.agentActions && typeof d.agentActions === 'object') {
      state.agentActions.saveToVault      = !!d.agentActions.saveToVault;
      state.agentActions.proposeNextSteps = !!d.agentActions.proposeNextSteps;
    }

    // Reflect into DOM
    document.querySelectorAll('.tier-btn').forEach(b => b.classList.toggle('active', b.dataset.tier === state.tier));
    $('tierLabel').textContent = TIER_DISPLAY[state.tier];
    $('previewTierLabel').textContent = '\u2014 ' + TIER_DISPLAY[state.tier] + ' Builder';
    $('guardrailHint').textContent = GUARDRAIL_HINT[state.tier];
    $('intentInput').value = state.intent || '';
    $('supportingDump').value = state.supporting || '';
    $('audience').value = state.audience || '';
    updatePlaceholders();
    renderIntentTemplates();
    renderOutputTypes();
    if (state.outputType) $('outputType').value = state.outputType;
    renderTierFields();
    renderSourcesCard();
    renderSignals();
    renderCheckpoints();
    // Reflect agent action toggles
    const sv = $('agentActionSaveVault');
    const ns = $('agentActionNextSteps');
    if (sv) sv.checked = !!state.agentActions.saveToVault;
    if (ns) ns.checked = !!state.agentActions.proposeNextSteps;
    renderPreview();
    autoResizeAll();
  } catch(e) { /* ignore */ }
}

// ============================================================
// INIT
// ============================================================
(function init() {
  initTheme();
  setTier(state.tier);       // establishes initial UI
  loadDraft();               // overlays persisted state
  switchTab('build');        // establish mobile tab state (no-op on desktop)
})();
