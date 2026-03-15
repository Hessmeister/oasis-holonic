# Product Pages Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the illustrative section 08 gallery with 8 real OASIS product cards and build a data-driven `product.html` sticky-split product detail page, piloted with the MCP Server.

**Architecture:** A single `product.html` at the site root reads `?p=<slug>` from the URL, imports product records from `js/products.js`, and dynamically loads a per-product animation module from `js/anim/<key>.js`. The sticky-split layout (scrolling feature list on the left, sticky canvas on the right) is styled via `css/product.css`. Section 08 in `index.html` is updated in-place — same card HTML structure, new data.

**Tech Stack:** Vanilla JS ES modules, HTML5 Canvas, CSS Grid with `position: sticky`, `IntersectionObserver`, GitHub Pages static hosting (no build step).

**Spec:** `docs/superpowers/specs/2026-03-15-product-pages-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `js/products.js` | Create | All 8 product records; MCP Server fully authored, others as stubs |
| `js/anim/mcp.js` | Create | Canvas animation for MCP Server — 4 `setFeature` states |
| `css/product.css` | Create | Sticky-split layout, hero, CTA strip, nav bar, mobile |
| `product.html` | Create | Data-driven product page template |
| `index.html` | Modify | Section 08: replace 6 example cards with 8 real product cards |

---

## Chunk 1: Data layer and animation

### Task 1: js/products.js — product data

**Files:**
- Create: `js/products.js`

- [ ] **Step 1: Create the file with all 8 product records**

```js
/* ═══════════════════════════════════════
   products.js — OASIS product catalogue
   Keyed by URL slug.
   ═══════════════════════════════════════ */

export const PRODUCTS = {

  'mcp-server': {
    name: 'MCP Server',
    category: 'Tools',
    tagline: 'AI agents that talk to <em>OASIS</em>',
    description: 'Every OASIS capability — NFT minting, wallet management, smart contracts, data operations — is available through natural language. The MCP Server exposes 60+ tools to any AI agent or IDE that speaks the Model Context Protocol.',
    tags: ['MCP', 'AI Agents', 'Natural Language', 'A2A'],
    animation: 'mcp',
    features: [
      {
        id: 'tools',
        heading: '60+ tools',
        body: 'Every OASIS operation exposed as an MCP tool. Minting, wallet queries, contract deployment, holon CRUD. If OASIS can do it, your agent can call it.',
        code: '// list tools\nawait mcp.listTools();\n// → ["oasis_mint_nft", "oasis_wallet_balance",\n//    "oasis_deploy_contract", ...]',
      },
      {
        id: 'natural-language',
        heading: 'Natural language commands',
        body: 'Describe what you want. "Mint an NFT called Holon #1 on Ethereum and replicate to Solana" executes as a single agent action, no manual API wiring.',
        code: '"Mint an NFT called Holon #1 on Ethereum\n and replicate to Solana"',
      },
      {
        id: 'a2a',
        heading: 'A2A Protocol',
        body: 'Agents talk to each other. One agent mints; another monitors; a third notifies. The OASIS MCP Server is a first-class citizen in multi-agent pipelines.',
      },
      {
        id: 'any-ide',
        heading: 'Any IDE, any client',
        body: 'Works with Cursor, VS Code, Windsurf, and any client that supports MCP. Install once, use everywhere.',
        code: '# Install\nnpm install -g @oasis/mcp-server\n\n# Add to cursor settings.json\n"mcpServers": { "oasis": { "command": "oasis-mcp" } }',
      },
    ],
    links: {
      docs: 'https://oasisweb4.com/docs/mcp',
      github: 'https://github.com/NextGenSoftwareUK/OASIS',
    },
  },

  'star-cli': {
    name: 'STAR CLI',
    category: 'Tools',
    tagline: 'Generate <em>OAPPs</em> from the command line',
    description: 'Low/no-code generator for OAPPs, metaverses, and holonic games. Scaffold a full OASIS application in one command.',
    tags: ['CLI', 'Code Generation', 'Scaffold', 'OAPP'],
    animation: 'mcp', // stub — replace with star.js when authored
    features: [
      {
        id: 'scaffold',
        heading: 'One-command scaffold',
        body: 'Run `star new my-oapp` and get a full project: providers configured, holons defined, wallet linked.',
        code: 'star new my-oapp --provider ethereum,mongodb',
      },
      {
        id: 'holarchy',
        heading: 'Holarchy mapping',
        body: 'Define your Star → Planet → Moon → Zome hierarchy in a simple YAML config. STAR generates all the boilerplate.',
      },
      {
        id: 'deploy',
        heading: 'One-command deploy',
        body: 'Push to any provider with a single command. STAR handles provider auth, migrations, and replication.',
        code: 'star deploy --target holochain,ethereum',
      },
      {
        id: 'plugins',
        heading: 'Plugin ecosystem',
        body: 'First-party plugins for avatar systems, NFT minting, karma tracking, and cross-chain bridges.',
      },
    ],
    links: {
      github: 'https://github.com/NextGenSoftwareUK/OASIS',
    },
  },

  'identity': {
    name: 'Identity & Access',
    category: 'Protocol',
    tagline: 'One avatar, <em>everywhere</em>',
    description: 'Unified avatar, karma, wallet, and keys across every OASIS application. Log in once and your identity follows you.',
    tags: ['Avatar', 'Karma', 'SSO', 'Cross-app'],
    animation: 'mcp',
    features: [
      {
        id: 'avatar',
        heading: 'Universal avatar',
        body: 'A single Avatar holon carries your credentials, provider wallets, and JWT tokens across every OAPP.',
      },
      {
        id: 'karma',
        heading: 'Karma ledger',
        body: 'Numerical reputation tracked via akashic records. Earned in one app, visible in every other.',
      },
      {
        id: 'wallet',
        heading: 'Multi-chain wallet',
        body: 'One wallet, all chains. Ethereum, Solana, Radix — balances and NFTs in one place.',
      },
      {
        id: 'sso',
        heading: 'Single sign-on',
        body: 'OAuth-compatible SSO. Existing apps can delegate identity to OASIS without re-building auth.',
      },
    ],
    links: {
      github: 'https://github.com/NextGenSoftwareUK/OASIS',
    },
  },

  'nfts': {
    name: 'NFTs & Digital Assets',
    category: 'Protocol',
    tagline: 'Mint once, <em>own everywhere</em>',
    description: 'Cross-chain NFT minting with automatic replication. One mint call, every chain.',
    tags: ['NFTs', 'Cross-chain', 'Replication', 'ERC-721'],
    animation: 'mcp',
    features: [
      {
        id: 'mint',
        heading: 'Single mint, every chain',
        body: 'One API call mints your NFT on Ethereum and replicates the holon to Solana, Polygon, or any configured provider.',
      },
      {
        id: 'metadata',
        heading: 'Persistent metadata',
        body: 'Metadata stored as a holon — immutable, content-addressed, replicated. Your art survives provider outages.',
      },
      {
        id: 'inventory',
        heading: 'Avatar inventory',
        body: 'Every NFT is automatically added to the owner\'s Avatar inventory. Accessible from any OAPP.',
      },
      {
        id: 'royalties',
        heading: 'Cross-chain royalties',
        body: 'Royalty logic encoded in the holon. Enforced regardless of which chain the NFT is traded on.',
      },
    ],
    links: {
      github: 'https://github.com/NextGenSoftwareUK/OASIS',
    },
  },

  'smart-contracts': {
    name: 'Smart Contracts',
    category: 'Protocol',
    tagline: 'Write once, <em>deploy everywhere</em>',
    description: 'Write contract logic once and deploy to Ethereum, Solana, and Radix simultaneously via OASIS provider abstraction.',
    tags: ['Solidity', 'Rust', 'Multi-chain', 'Deploy'],
    animation: 'mcp',
    features: [
      {
        id: 'write-once',
        heading: 'Write once',
        body: 'Define contract logic in OASIS\'s provider-agnostic DSL. OASIS compiles to Solidity, Rust, or Scrypto.',
      },
      {
        id: 'deploy-all',
        heading: 'Deploy to all chains',
        body: 'One deploy command pushes to all configured chains simultaneously. No per-chain toolchain required.',
      },
      {
        id: 'verify',
        heading: 'Unified verification',
        body: 'OASIS tracks deployment addresses across chains. Verify and audit from one interface.',
      },
      {
        id: 'upgrade',
        heading: 'Holonic upgrades',
        body: 'Upgradeable contracts encoded as mutable holons. Push logic updates without re-deploying.',
      },
    ],
    links: {
      github: 'https://github.com/NextGenSoftwareUK/OASIS',
    },
  },

  'bridge': {
    name: 'Interoperability Bridge',
    category: 'Protocol',
    tagline: 'Atomic swaps, <em>real-time rates</em>',
    description: 'Cross-chain asset transfers with atomic swap guarantees and live exchange rates.',
    tags: ['Bridge', 'Atomic Swap', 'DeFi', 'Cross-chain'],
    animation: 'mcp',
    features: [
      {
        id: 'atomic',
        heading: 'Atomic swaps',
        body: 'Transfers are all-or-nothing. If any leg fails, the full transaction rolls back across all chains.',
      },
      {
        id: 'rates',
        heading: 'Real-time exchange rates',
        body: 'Live rate feeds from multiple DEXs. OASIS routes your swap through the best path automatically.',
      },
      {
        id: 'any-asset',
        heading: 'Any asset',
        body: 'ETH, SOL, tokens, NFTs. The bridge moves holons — the asset type is just metadata.',
      },
      {
        id: 'fees',
        heading: 'Transparent fees',
        body: 'Fee breakdown shown before confirmation. No hidden gas surprises.',
      },
    ],
    links: {
      github: 'https://github.com/NextGenSoftwareUK/OASIS',
    },
  },

  'data-storage': {
    name: 'Data & Storage',
    category: 'Infrastructure',
    tagline: 'Holonic routing, <em>zero downtime</em>',
    description: 'Automatic replication and failover across MongoDB, IPFS, Holochain, and cloud providers.',
    tags: ['MongoDB', 'IPFS', 'Holochain', 'Replication'],
    animation: 'mcp',
    features: [
      {
        id: 'routing',
        heading: 'Holonic routing',
        body: 'OASIS routes reads and writes to the best available provider based on latency, cost, and availability.',
      },
      {
        id: 'replication',
        heading: 'Automatic replication',
        body: 'Configure replication rules once. OASIS keeps copies in sync across your provider stack.',
      },
      {
        id: 'failover',
        heading: 'Instant failover',
        body: 'Provider goes down? OASIS switches to the next available copy in milliseconds, invisibly.',
      },
      {
        id: 'search',
        heading: 'Unified query layer',
        body: 'One query API across all providers. OASIS translates to MongoDB aggregations, IPFS CID lookups, or Holochain DHT queries.',
      },
    ],
    links: {
      github: 'https://github.com/NextGenSoftwareUK/OASIS',
    },
  },

  'infrastructure': {
    name: 'Infrastructure & Tools',
    category: 'Infrastructure',
    tagline: 'SDKs for <em>every stack</em>',
    description: 'SDKs, Web Kits, and framework integrations for .NET, Node.js, Unity, and more.',
    tags: ['.NET SDK', 'Node.js', 'Unity', 'REST API'],
    animation: 'mcp',
    features: [
      {
        id: 'sdks',
        heading: 'First-party SDKs',
        body: '.NET, Node.js, and Unity SDKs with full IntelliSense support. Type-safe holon operations out of the box.',
      },
      {
        id: 'rest',
        heading: 'REST API',
        body: 'Provider-agnostic REST API. If you can make an HTTP request, you can use OASIS.',
      },
      {
        id: 'web-kit',
        heading: 'Web Kit',
        body: 'React, Vue, and vanilla JS components for wallet connection, NFT display, and avatar profiles.',
      },
      {
        id: 'local-dev',
        heading: 'Local dev environment',
        body: 'Run a full OASIS stack locally with one Docker command. Includes mock providers for offline development.',
      },
    ],
    links: {
      github: 'https://github.com/NextGenSoftwareUK/OASIS',
    },
  },

};
```

- [ ] **Step 2: Verify the file parses cleanly**

Open `product.html?p=mcp-server` in the browser (or run a quick check):
```bash
node --input-type=module <<'EOF'
import { PRODUCTS } from './js/products.js';
const keys = Object.keys(PRODUCTS);
console.assert(keys.length === 8, 'Expected 8 products, got ' + keys.length);
console.assert(PRODUCTS['mcp-server'].features.length === 4, 'MCP should have 4 features');
console.log('OK:', keys.join(', '));
EOF
```
Expected: `OK: mcp-server, star-cli, identity, nfts, smart-contracts, bridge, data-storage, infrastructure`

- [ ] **Step 3: Commit**

```bash
git add js/products.js
git commit -m "feat: add products.js data file — 8 OASIS products, MCP Server fully authored"
```

---

### Task 2: js/anim/mcp.js — MCP Server canvas animation

**Files:**
- Create: `js/anim/mcp.js` (create `js/anim/` directory first)

The animation shows 4 diamond-shaped agent nodes around a central OASIS API square hub. Exports the `init / setFeature / start / stop` interface required by `product.html`.

**4 feature states:**
- State 0: All 4 agents simultaneously burst particles toward hub
- State 1: Typewriter label appears above Agent 0 → particle travels hub and back
- State 2: Peer edges (agent↔agent) become orange and active; hub edges dim
- State 3: Agent labels swap to "Cursor / VS Code / Windsurf / Claude"

- [ ] **Step 1: Create the anim directory**

```bash
mkdir -p js/anim
```

- [ ] **Step 2: Create js/anim/mcp.js**

```js
/* ═══════════════════════════════════════
   js/anim/mcp.js — MCP Server animation
   Exported interface: init · setFeature · start · stop
   ═══════════════════════════════════════ */

let canvas, ctx, w, h, dpr;
let running = false;
let time = 0;
let particles = [];
let state = -1;          // -1 = idle
let _litState = {};
let typingLabel = null;  // { text, progress, sent } — for state 1
let agentLabels = ['Agent', 'Agent', 'Agent', 'Agent'];

// Node layout (ratios): 4 diamond agents at corners, hub square at centre
const NODE_DEFS = [
  { rx: 0.15, ry: 0.22, shape: 'diamond', agentIdx: 0 },  // top-left
  { rx: 0.85, ry: 0.22, shape: 'diamond', agentIdx: 1 },  // top-right
  { rx: 0.15, ry: 0.78, shape: 'diamond', agentIdx: 2 },  // bottom-left
  { rx: 0.85, ry: 0.78, shape: 'diamond', agentIdx: 3 },  // bottom-right
  { rx: 0.50, ry: 0.50, shape: 'square',  agentIdx: null }, // hub
];

// Hub edges: each agent ↔ hub
const HUB_EDGES  = [[0,4],[1,4],[2,4],[3,4]];
// Peer edges: agents ↔ agents
const PEER_EDGES = [[0,1],[0,2],[1,3],[2,3]];

// ── Public API ──────────────────────────────────────────────────────────────

export function init(c) {
  canvas = c;
  ctx = canvas.getContext('2d');
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  _resize();
  window.addEventListener('resize', _resize);
}

export function setFeature(index) {
  state = index;
  particles = [];
  typingLabel = null;

  if (index === 3) {
    agentLabels = ['Cursor', 'VS Code', 'Windsurf', 'Claude'];
  } else {
    agentLabels = ['Agent', 'Agent', 'Agent', 'Agent'];
  }

  if (index === 0) {
    // Burst: staggered wave from all 4 agents → hub
    HUB_EDGES.forEach(([from, to], i) => {
      for (let j = 0; j < 6; j++) {
        _spawnAt(from, to, (i * 60 + j * 25) / 1000);
      }
    });
  }

  if (index === 1) {
    typingLabel = { text: '"Mint an NFT on Ethereum and replicate to Solana"', progress: 0, sent: false };
  }
}

export function start() {
  if (running) return;
  running = true;
  requestAnimationFrame(_loop);
}

export function stop() {
  running = false;
}

// ── Internal ────────────────────────────────────────────────────────────────

function _resize() {
  const parent = canvas.parentElement;
  w = parent.offsetWidth;
  h = parent.offsetHeight || Math.min(w * 0.75, 460);
  canvas.width  = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function _nodePos(i) {
  const n = NODE_DEFS[i];
  return { x: n.rx * w, y: n.ry * h };
}

function _spawnAt(from, to, delay = 0) {
  particles.push({
    from, to,
    t: -(delay),       // negative t = waiting; advances once > 0
    speed: 0.0025 + Math.random() * 0.003,
    size: 1.5 + Math.random(),
  });
}

function _drawShape(x, y, shape, size) {
  ctx.beginPath();
  if (shape === 'diamond') {
    ctx.moveTo(x,          y - size * 1.35);
    ctx.lineTo(x + size,   y);
    ctx.lineTo(x,          y + size * 1.35);
    ctx.lineTo(x - size,   y);
    ctx.closePath();
  } else if (shape === 'square') {
    ctx.rect(x - size * 0.9, y - size * 0.9, size * 1.8, size * 1.8);
  } else {
    ctx.arc(x, y, size, 0, Math.PI * 2);
  }
}

function _particleNearNode(nodeIdx) {
  const np = _nodePos(nodeIdx);
  const hit = Math.max(30, w * 0.035);
  for (const p of particles) {
    if (p.t <= 0 || p.t >= 1) continue;
    const fp = _nodePos(p.from), tp = _nodePos(p.to);
    const e = p.t < 0.5 ? 2*p.t*p.t : 1 - Math.pow(-2*p.t+2, 2)/2;
    const px = fp.x + (tp.x - fp.x) * e;
    const py = fp.y + (tp.y - fp.y) * e;
    if (Math.sqrt((px - np.x)**2 + (py - np.y)**2) < hit) return true;
  }
  return false;
}

function _litVal(nodeIdx, isHit, t) {
  const key = 'n' + nodeIdx;
  if (!_litState[key]) _litState[key] = { litAt: 0, val: 0 };
  const s = _litState[key];
  if (isHit) s.litAt = t;
  const elapsed = t - s.litAt, dur = 700;
  if (elapsed < dur) {
    const p = elapsed / dur;
    s.val = p < 0.08 ? p / 0.08 : p < 0.5 ? 1.0 : 1.0 - (p - 0.5) / 0.5;
  } else {
    s.val = 0;
  }
  return s.val;
}

function _draw(t) {
  ctx.clearRect(0, 0, w, h);

  const isPeer = state === 2;

  // ── Hub edges ──────────────────────────────
  HUB_EDGES.forEach(([a, b]) => {
    const pa = _nodePos(a), pb = _nodePos(b);
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = isPeer ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // ── Peer edges ─────────────────────────────
  PEER_EDGES.forEach(([a, b]) => {
    const pa = _nodePos(a), pb = _nodePos(b);
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = isPeer ? 'rgba(255,107,26,0.40)' : 'rgba(255,255,255,0.05)';
    ctx.lineWidth = isPeer ? 1.5 : 1;
    ctx.stroke();
  });

  // ── Ambient particle spawn ──────────────────
  if (state !== 0 && Math.random() < 0.028) {
    const pool = isPeer ? PEER_EDGES : HUB_EDGES;
    const e = pool[Math.floor(Math.random() * pool.length)];
    const rev = Math.random() > 0.5;
    _spawnAt(rev ? e[1] : e[0], rev ? e[0] : e[1]);
  }

  // ── State 1: typing label advance ───────────
  if (state === 1 && typingLabel) {
    typingLabel.progress = Math.min(typingLabel.progress + 0.007, 1);
    if (typingLabel.progress >= 1 && !typingLabel.sent) {
      typingLabel.sent = true;
      _spawnAt(0, 4);
      setTimeout(() => _spawnAt(4, 0), 700);
    }
  }

  // ── Advance particles ───────────────────────
  particles = particles.filter(p => p.t <= 1.05);
  particles.forEach(p => { p.t += p.speed; });

  // ── Draw nodes ─────────────────────────────
  NODE_DEFS.forEach((node, i) => {
    const { x, y } = _nodePos(i);
    const isHub = i === 4;
    const size  = isHub ? 9 : 7;

    const isHit = _particleNearNode(i);
    const lit   = _litVal(i, isHit, t);

    // Glow
    if (lit > 0.05) {
      const gc = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      const col = isHub ? '255,107,26' : '255,255,255';
      gc.addColorStop(0, `rgba(${col},${0.22 * lit})`);
      gc.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gc;
      ctx.fillRect(x - size*4.5, y - size*4.5, size*9, size*9);
    }

    _drawShape(x, y, node.shape, size);
    ctx.strokeStyle = isHub
      ? `rgba(255,107,26,${0.65 + lit*0.35})`
      : `rgba(255,255,255,${0.50 + lit*0.50})`;
    ctx.lineWidth = 1 + lit * 0.8;
    ctx.stroke();

    // Label
    const label   = isHub ? 'OASIS API' : agentLabels[node.agentIdx];
    const labelA  = 0.65 + lit * 0.35;
    const weight  = lit > 0.3 ? 600 : 400;
    const fSize   = 10 + lit * 2;
    // Top-row nodes: label above; bottom-row + hub: label below
    const above   = (i === 0 || i === 1);
    const lx      = x;
    const ly      = above ? y - size - 11 : y + size + 13;

    ctx.save();
    if (lit > 0.05) {
      ctx.shadowColor = `rgba(255,255,255,${0.65 * lit})`;
      ctx.shadowBlur  = 13 * lit;
    }
    ctx.fillStyle    = isHub ? `rgba(255,107,26,${labelA})` : `rgba(255,255,255,${labelA})`;
    ctx.font         = `${weight} ${fSize}px Inter, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = above ? 'bottom' : 'top';
    ctx.fillText(label, lx, ly);
    ctx.restore();
  });

  // ── Draw particles ──────────────────────────
  particles.forEach(p => {
    if (p.t <= 0 || p.t > 1) return;
    const fp = _nodePos(p.from), tp = _nodePos(p.to);
    const e  = p.t < 0.5 ? 2*p.t*p.t : 1 - Math.pow(-2*p.t+2, 2)/2;
    const px = fp.x + (tp.x - fp.x) * e;
    const py = fp.y + (tp.y - fp.y) * e;
    const a  = Math.min(p.t * 5, 1, (1 - p.t) * 5);
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.85 * a})`;
    ctx.fill();
  });

  // ── State 1: typewriter overlay ─────────────
  if (state === 1 && typingLabel) {
    const { x, y } = _nodePos(0);
    const chars = Math.floor(typingLabel.text.length * typingLabel.progress);
    const txt   = typingLabel.text.slice(0, chars);
    const cursorOn = typingLabel.progress < 1 || Math.sin(t * 0.006) > 0;

    ctx.save();
    ctx.fillStyle    = 'rgba(255,255,255,0.70)';
    ctx.font         = '400 9px "Courier New", monospace';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'bottom';
    const tw = ctx.measureText(txt).width;
    ctx.fillText(txt, x - tw / 2, y - 26);
    if (cursorOn) {
      ctx.fillStyle = 'rgba(255,107,26,0.9)';
      ctx.fillText('▌', x - tw / 2 + tw, y - 26);
    }
    ctx.restore();
  }
}

const _loop = (timestamp) => {
  if (!running) return;
  time = timestamp;
  _draw(timestamp);
  requestAnimationFrame(_loop);
};
```

- [ ] **Step 3: Verify syntax (no bundler — just open in browser and check console)**

After `product.html` is built (Task 4), navigate to `product.html?p=mcp-server` and confirm the canvas renders without errors.

- [ ] **Step 4: Commit**

```bash
git add js/anim/mcp.js
git commit -m "feat: add js/anim/mcp.js — MCP Server canvas animation, 4 feature states"
```

---

## Chunk 2: Page template and styles

### Task 3: css/product.css — sticky-split layout

**Files:**
- Create: `css/product.css`

- [ ] **Step 1: Create css/product.css**

```css
/* ═══════════════════════════════════════
   product.css — Product detail page styles
   Sticky-split layout + hero + CTA strip
   ═══════════════════════════════════════ */

/* ── Product nav ─────────────────────────────────────────────────────────── */
.pd-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--pad);
  height: 56px;
  background: var(--bg-sage);
  border-bottom: 1px solid rgba(30,28,26,0.12);
}

.pd-nav-logo {
  display: flex;
  align-items: center;
  color: var(--black);
  text-decoration: none;
}

.pd-nav-logo .nav-logo-svg {
  height: 24px;
  width: auto;
  color: var(--black);
}

.pd-back {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--black);
  text-decoration: none;
  opacity: 0.55;
  transition: opacity 0.2s;
}
.pd-back:hover { opacity: 1; }

/* ── Hero ─────────────────────────────────────────────────────────────────── */
.pd-hero {
  position: relative;
  display: flex;
  align-items: center;
  gap: 3rem;
  padding: 5rem var(--pad) 4rem;
  background: var(--near-black);
  overflow: hidden;
}

.pd-hero::before {
  /* full-bleed same as site sections */
  content: '';
  position: absolute;
  inset: 0;
  background: var(--near-black);
  z-index: 0;
}

.pd-hero-text {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
}

.pd-category {
  display: block;
  font-family: var(--font-sans);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--orange);
  margin-bottom: 0.75rem;
}

.pd-tagline {
  font-family: var(--font-serif);
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: #fff;
  margin: 0 0 1.2rem;
}

.pd-tagline em {
  font-style: italic;
  color: var(--orange);
}

.pd-description {
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(255,255,255,0.65);
  max-width: 46ch;
  margin: 0;
}

.pd-hero-canvas {
  position: relative;
  z-index: 1;
  flex: 0 0 360px;
  height: 260px;
}

.pd-hero-canvas canvas {
  width: 100%;
  height: 100%;
}

/* ── Sticky split ─────────────────────────────────────────────────────────── */
.pd-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--near-black);
}

.pd-left {
  padding: 4rem var(--pad) 4rem calc(var(--pad) + 0.5rem);
  border-right: 1px solid rgba(255,255,255,0.07);
}

.pd-right {
  position: sticky;
  top: 56px;               /* height of .pd-nav */
  align-self: start;
  height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(255,255,255,0.015);
}

.pd-right canvas {
  width: 100%;
  height: 100%;
  max-height: 500px;
}

/* ── Feature items ────────────────────────────────────────────────────────── */
.pd-feature {
  padding: 2.5rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  border-left: 2px solid rgba(255,255,255,0.1);
  padding-left: 1.5rem;
  transition: border-color 0.4s;
}

.pd-feature:last-child {
  border-bottom: none;
}

.pd-feature.is-active {
  border-left-color: var(--orange);
}

.pd-feature-heading {
  font-family: var(--font-serif);
  font-size: 1.45rem;
  font-weight: 500;
  color: rgba(255,255,255,0.92);
  letter-spacing: -0.02em;
  margin: 0 0 0.75rem;
  line-height: 1.25;
}

.pd-feature.is-active .pd-feature-heading {
  color: #fff;
}

.pd-feature-body {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  line-height: 1.75;
  color: rgba(255,255,255,0.55);
  margin: 0 0 1rem;
}

.pd-feature.is-active .pd-feature-body {
  color: rgba(255,255,255,0.72);
}

.pd-feature-code {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 3px;
  padding: 1rem 1.25rem;
  margin: 0;
  overflow-x: auto;
}

.pd-feature-code code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.82rem;
  line-height: 1.6;
  color: rgba(255,255,255,0.65);
  white-space: pre;
}

/* ── CTA strip ────────────────────────────────────────────────────────────── */
.pd-cta {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 3rem var(--pad);
  background: var(--orange);
}

.pd-cta-btn {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-decoration: none;
  padding: 0.7rem 1.6rem;
  border-radius: 2px;
  transition: opacity 0.2s;
}

.pd-cta-btn:hover { opacity: 0.8; }

.pd-cta-btn--primary {
  background: var(--near-black);
  color: #fff;
}

.pd-cta-btn--ghost {
  background: transparent;
  color: var(--near-black);
  border: 1px solid var(--near-black);
}

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .pd-hero {
    flex-direction: column;
    padding: 3rem var(--pad);
  }

  .pd-hero-canvas {
    flex: none;
    width: 100%;
    height: 200px;
  }

  .pd-split {
    grid-template-columns: 1fr;
  }

  /* On mobile: canvas strip above features, not sticky */
  .pd-right {
    position: relative;
    top: auto;
    height: 240px;
    align-self: auto;
    order: -1;
  }

  .pd-left {
    border-right: none;
    padding: 2rem var(--pad);
  }
}

@media (max-width: 560px) {
  .pd-tagline { font-size: 1.85rem; }
  .pd-cta { flex-direction: column; align-items: flex-start; }
}
```

- [ ] **Step 2: Verify the file was written correctly**

```bash
wc -l css/product.css
```
Expected: ~200+ lines.

- [ ] **Step 3: Commit**

```bash
git add css/product.css
git commit -m "feat: add css/product.css — sticky-split layout, hero, CTA, responsive"
```

---

### Task 4: product.html — data-driven product page template

**Files:**
- Create: `product.html` (site root)

- [ ] **Step 1: Create product.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OASIS</title>
  <meta name="description" content="OASIS product detail">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Newsreader:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/product.css">
  <link rel="icon" type="image/svg+xml" href="img/oasis-icon-light.svg" media="(prefers-color-scheme: light)">
  <link rel="icon" type="image/svg+xml" href="img/oasis-icon-dark.svg" media="(prefers-color-scheme: dark)">
  <link rel="icon" type="image/svg+xml" href="img/oasis-icon-light.svg">
</head>
<body>

<!-- NAV -->
<nav class="pd-nav">
  <a href="index.html" class="pd-nav-logo" aria-label="OASIS home">
    <svg class="nav-logo-svg" viewBox="0 0 550 149" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M69.4925 20.4674H84.4214C116.226 20.4674 133.914 38.6417 133.914 75.4771C133.914 112.15 116.389 130 84.4214 130H69.4925C37.5252 130 20 112.15 20 75.4771C20 38.6417 37.6875 20.4674 69.4925 20.4674ZM84.4214 39.6153H69.4925C48.3974 39.6153 39.1479 50.3251 39.1479 75.4771C39.1479 100.467 48.2351 110.852 69.4925 110.852H84.4214C105.517 110.852 114.604 100.467 114.604 75.3148C114.604 50.3251 105.517 39.6153 84.4214 39.6153Z" fill="currentColor"/>
      <path d="M195.795 41.8871L161.069 130H139.974L178.432 32.6376C182.489 22.4146 189.953 18.5201 201.474 18.5201C212.833 18.5201 220.298 22.4146 224.192 32.6376L261.19 130H239.932L206.667 41.8871C205.693 39.2907 203.908 38.1548 201.312 38.1548C198.716 38.1548 196.931 39.2907 195.795 41.8871Z" fill="currentColor"/>
      <path d="M306.493 20.4674H361.989V39.6153H305.843C295.945 39.6153 291.564 44.9702 291.564 52.5969C291.564 59.25 294.971 65.5786 307.791 65.5786H333.429C363.287 65.5786 370.265 82.1302 370.265 97.8704C370.265 116.369 360.366 130 335.377 130H274.363V110.852H336.026C346.411 110.852 351.117 105.173 351.117 97.2213C351.117 90.0814 347.385 83.5906 333.916 83.5906H308.44C279.231 83.5906 272.416 67.2013 272.416 51.9478C272.416 33.7735 282.152 20.4674 306.493 20.4674Z" fill="currentColor"/>
      <path d="M391.543 20.4674H410.691V130H391.543V20.4674Z" fill="currentColor"/>
      <path d="M466.228 20.4674H521.724V39.6153H465.579C455.68 39.6153 451.299 44.9702 451.299 52.5969C451.299 59.25 454.706 65.5786 467.526 65.5786H493.165C523.022 65.5786 530 82.1302 530 97.8704C530 116.369 520.101 130 495.112 130H434.098V110.852H495.761C506.146 110.852 510.852 105.173 510.852 97.2213C510.852 90.0814 507.12 83.5906 493.651 83.5906H468.175C438.966 83.5906 432.151 67.2013 432.151 51.9478C432.151 33.7735 441.887 20.4674 466.228 20.4674Z" fill="currentColor"/>
      <circle cx="200.746" cy="111.116" r="18.8842" fill="#FF5E00"/>
    </svg>
  </a>
  <a href="index.html#gallery" class="pd-back">← Products</a>
</nav>

<!-- HERO -->
<section class="pd-hero">
  <div class="pd-hero-text">
    <span id="pd-category" class="pd-category"></span>
    <h1 id="pd-tagline" class="pd-tagline"></h1>
    <p id="pd-description" class="pd-description"></p>
  </div>
</section>

<!-- STICKY SPLIT -->
<div class="pd-split">
  <!-- Left: scrolling features -->
  <div class="pd-left" id="pd-features"></div>

  <!-- Right: sticky canvas -->
  <div class="pd-right">
    <canvas id="pd-canvas"></canvas>
  </div>
</div>

<!-- CTA STRIP -->
<section class="pd-cta" id="pd-cta">
  <a id="pd-docs-btn"   href="#" class="pd-cta-btn pd-cta-btn--primary">Docs →</a>
  <a id="pd-github-btn" href="#" class="pd-cta-btn pd-cta-btn--ghost">GitHub →</a>
</section>

<!-- FOOTER -->
<div class="footer">
  <div class="footer-col">
    <span class="footer-label">Project</span>
    <span class="footer-value">OASIS: Open Advanced<br>Scalable Interoperable System</span>
  </div>
  <div class="vdiv"></div>
  <div class="footer-col">
    <span class="footer-label">Source</span>
    <span class="footer-value"><a href="https://github.com/NextGenSoftwareUK/OASIS" target="_blank">github.com/NextGenSoftwareUK/OASIS</a></span>
  </div>
  <div class="vdiv"></div>
  <div class="footer-col">
    <span class="footer-label">By</span>
    <span class="footer-value">NextGen Software<br>2025</span>
  </div>
  <div class="vdiv"></div>
  <div class="footer-col">
    <span class="footer-label">Community</span>
    <span class="footer-value">
      <a href="https://x.com/oasisweb4" target="_blank">X / Twitter</a><br>
      <a href="https://discord.gg/RU6Z8YJ" target="_blank">Discord</a><br>
      <a href="https://t.me/oasisweb4chat" target="_blank">Telegram</a>
    </span>
  </div>
</div>

<script type="module">
  import { PRODUCTS } from './js/products.js';

  // ── Route ────────────────────────────────────────────────────────────────
  const slug    = new URLSearchParams(location.search).get('p');
  const product = PRODUCTS[slug];

  if (!product) {
    location.replace('index.html#gallery');
  }

  // ── Populate hero ────────────────────────────────────────────────────────
  document.title = `OASIS — ${product.name}`;
  document.getElementById('pd-category').textContent = product.category;
  document.getElementById('pd-tagline').innerHTML    = product.tagline;
  document.getElementById('pd-description').textContent = product.description;

  // ── Build feature list ───────────────────────────────────────────────────
  const featuresEl = document.getElementById('pd-features');
  product.features.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = 'pd-feature';
    div.dataset.featureIndex = i;

    const codeBlock = f.code
      ? `<pre class="pd-feature-code"><code>${escHtml(f.code)}</code></pre>`
      : '';

    div.innerHTML = `
      <h3 class="pd-feature-heading">${f.heading}</h3>
      <p class="pd-feature-body">${f.body}</p>
      ${codeBlock}
    `;
    featuresEl.appendChild(div);
  });

  // ── CTA links ────────────────────────────────────────────────────────────
  const docsBtn   = document.getElementById('pd-docs-btn');
  const githubBtn = document.getElementById('pd-github-btn');

  if (product.links.docs)   { docsBtn.href   = product.links.docs;   }
  else                      { docsBtn.style.display   = 'none';        }
  if (product.links.github) { githubBtn.href = product.links.github; }
  else                      { githubBtn.style.display = 'none';        }

  // ── Load animation ───────────────────────────────────────────────────────
  const canvas = document.getElementById('pd-canvas');
  const anim   = await import(`./js/anim/${product.animation}.js`);
  anim.init(canvas);
  anim.start();

  // ── IntersectionObserver: feature → setFeature ───────────────────────────
  const featObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const idx = parseInt(e.target.dataset.featureIndex, 10);
      anim.setFeature(idx);
      document.querySelectorAll('.pd-feature').forEach((el, i) => {
        el.classList.toggle('is-active', i === idx);
      });
    });
  }, {
    threshold: 0.4,
    rootMargin: '-15% 0px -15% 0px',
  });

  document.querySelectorAll('.pd-feature').forEach(el => featObs.observe(el));

  // ── IntersectionObserver: pause animation when off-screen ───────────────
  const visObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) anim.start(); else anim.stop();
    });
  }, { threshold: 0 });
  visObs.observe(canvas);

  // ── Utility ──────────────────────────────────────────────────────────────
  function escHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
</script>

</body>
</html>
```

- [ ] **Step 2: Open in browser and verify**

Navigate to `product.html?p=mcp-server` (serve locally via `npx serve .` or `python3 -m http.server 8080`).

Checklist:
- [ ] Page title updates to "OASIS — MCP Server"
- [ ] Hero shows category badge, tagline, description
- [ ] Canvas renders with 4 agent nodes + OASIS API hub
- [ ] Scrolling through features triggers `setFeature(0..3)`
- [ ] Active feature gets orange left border
- [ ] CTA strip shows "Docs →" and "GitHub →" buttons
- [ ] Footer visible at bottom
- [ ] No console errors

- [ ] **Step 3: Test unknown slug redirects**

Navigate to `product.html?p=bogus` — should redirect to `index.html#gallery`.

- [ ] **Step 4: Commit**

```bash
git add product.html
git commit -m "feat: add product.html — data-driven sticky-split product detail page"
```

---

## Chunk 3: Gallery update and integration

### Task 5: index.html section 08 — replace gallery cards

**Files:**
- Modify: `index.html` (section 08, id="gallery")

Replace the entire contents of section 08 — heading, filter bar, and all 6 `.gallery-card` divs — with the new heading and 8 real product cards. The `.gallery-grid` grid CSS is unchanged; only the data changes.

- [ ] **Step 1: Replace the section-head heading**

Old:
```html
    <div class="section-head">
      <span class="sh-num">08</span>
      <h2>What builders<br>have <em>shipped</em></h2>
    </div>
```

New:
```html
    <div class="section-head">
      <span class="sh-num">08</span>
      <h2>What we've <em>built</em></h2>
    </div>
```

- [ ] **Step 2: Remove the filter bar**

Delete this entire block:
```html
    <div class="gallery-filters stagger">
      <button class="gf-btn is-active" data-filter="all">All</button>
      <button class="gf-btn" data-filter="identity">Identity</button>
      <button class="gf-btn" data-filter="gaming">Gaming</button>
      <button class="gf-btn" data-filter="defi">DeFi</button>
      <button class="gf-btn" data-filter="storage">Storage</button>
      <button class="gf-btn" data-filter="governance">Governance</button>
    </div>
```

- [ ] **Step 3: Replace all gallery cards**

Replace the entire `<div class="gallery-grid stagger" id="galleryGrid">` block (including its 6 child cards) with:

```html
    <div class="gallery-grid stagger" id="galleryGrid">

      <div class="gallery-card">
        <div class="gc-top"><span class="gc-cat">Tools</span></div>
        <h3 class="gc-title">MCP Server</h3>
        <p class="gc-desc">AI agents that talk to OASIS via 60+ natural language tools. Works with Cursor, VS Code, Windsurf, and any MCP-compatible client.</p>
        <div class="gc-tags">
          <span class="gc-tag">MCP</span>
          <span class="gc-tag">AI Agents</span>
          <span class="gc-tag">Natural Language</span>
        </div>
        <div class="gc-foot">
          <a href="product.html?p=mcp-server" class="gc-link">Explore &rarr;</a>
        </div>
      </div>

      <div class="gallery-card">
        <div class="gc-top"><span class="gc-cat">Tools</span></div>
        <h3 class="gc-title">STAR CLI</h3>
        <p class="gc-desc">Low/no-code generator for OAPPs, metaverses, and holonic games. Scaffold a full OASIS application in one command.</p>
        <div class="gc-tags">
          <span class="gc-tag">CLI</span>
          <span class="gc-tag">Code Generation</span>
          <span class="gc-tag">Scaffold</span>
        </div>
        <div class="gc-foot">
          <a href="product.html?p=star-cli" class="gc-link">Explore &rarr;</a>
        </div>
      </div>

      <div class="gallery-card">
        <div class="gc-top"><span class="gc-cat">Protocol</span></div>
        <h3 class="gc-title">Identity & Access</h3>
        <p class="gc-desc">Unified avatar, karma, wallet, and keys across every app. One identity — everywhere you go in the OASIS ecosystem.</p>
        <div class="gc-tags">
          <span class="gc-tag">Avatar</span>
          <span class="gc-tag">Karma</span>
          <span class="gc-tag">SSO</span>
        </div>
        <div class="gc-foot">
          <a href="product.html?p=identity" class="gc-link">Explore &rarr;</a>
        </div>
      </div>

      <div class="gallery-card">
        <div class="gc-top"><span class="gc-cat">Protocol</span></div>
        <h3 class="gc-title">NFTs & Digital Assets</h3>
        <p class="gc-desc">Mint once, own everywhere — cross-chain with automatic replication. One API call, every chain.</p>
        <div class="gc-tags">
          <span class="gc-tag">NFTs</span>
          <span class="gc-tag">Cross-chain</span>
          <span class="gc-tag">ERC-721</span>
        </div>
        <div class="gc-foot">
          <a href="product.html?p=nfts" class="gc-link">Explore &rarr;</a>
        </div>
      </div>

      <div class="gallery-card">
        <div class="gc-top"><span class="gc-cat">Protocol</span></div>
        <h3 class="gc-title">Smart Contracts</h3>
        <p class="gc-desc">Write once, deploy to Ethereum, Solana, and Radix simultaneously via OASIS provider abstraction.</p>
        <div class="gc-tags">
          <span class="gc-tag">Solidity</span>
          <span class="gc-tag">Multi-chain</span>
          <span class="gc-tag">Deploy</span>
        </div>
        <div class="gc-foot">
          <a href="product.html?p=smart-contracts" class="gc-link">Explore &rarr;</a>
        </div>
      </div>

      <div class="gallery-card">
        <div class="gc-top"><span class="gc-cat">Protocol</span></div>
        <h3 class="gc-title">Interoperability Bridge</h3>
        <p class="gc-desc">Atomic cross-chain swaps with real-time exchange rates. All-or-nothing transfers across any connected chain.</p>
        <div class="gc-tags">
          <span class="gc-tag">Bridge</span>
          <span class="gc-tag">Atomic Swap</span>
          <span class="gc-tag">DeFi</span>
        </div>
        <div class="gc-foot">
          <a href="product.html?p=bridge" class="gc-link">Explore &rarr;</a>
        </div>
      </div>

      <div class="gallery-card">
        <div class="gc-top"><span class="gc-cat">Infrastructure</span></div>
        <h3 class="gc-title">Data & Storage</h3>
        <p class="gc-desc">Holonic routing with automatic replication and failover across MongoDB, IPFS, Holochain, and cloud providers.</p>
        <div class="gc-tags">
          <span class="gc-tag">MongoDB</span>
          <span class="gc-tag">IPFS</span>
          <span class="gc-tag">Replication</span>
        </div>
        <div class="gc-foot">
          <a href="product.html?p=data-storage" class="gc-link">Explore &rarr;</a>
        </div>
      </div>

      <div class="gallery-card">
        <div class="gc-top"><span class="gc-cat">Infrastructure</span></div>
        <h3 class="gc-title">Infrastructure & Tools</h3>
        <p class="gc-desc">SDKs, Web Kits, and framework integrations for .NET, Node.js, Unity, and any stack that can make an HTTP request.</p>
        <div class="gc-tags">
          <span class="gc-tag">.NET SDK</span>
          <span class="gc-tag">Node.js</span>
          <span class="gc-tag">REST API</span>
        </div>
        <div class="gc-foot">
          <a href="product.html?p=infrastructure" class="gc-link">Explore &rarr;</a>
        </div>
      </div>

    </div>
```

Note: The 8th card creates a 3+3+2 layout in the 3-column grid. This is fine — the last row is left-aligned.

- [ ] **Step 4: Verify in browser**

Load `index.html` and scroll to section 08.
- [ ] Heading reads "What we've built"
- [ ] No filter bar present
- [ ] 8 cards visible in 3-column grid
- [ ] Each card's "Explore →" link opens correct `product.html?p=<slug>`
- [ ] Hovering a card shows orange border

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: section 08 — replace illustrative gallery with 8 real OASIS product cards"
```

---

### Task 6: Smoke test full flow

- [ ] **Step 1: Start local server**

```bash
npx serve . --listen 8080
# or
python3 -m http.server 8080
```

- [ ] **Step 2: Full flow test**

| Test | URL | Expected |
|------|-----|----------|
| Gallery renders | `localhost:8080` → scroll to §08 | 8 product cards, 3-column grid |
| MCP Server card | click "Explore →" on MCP Server | navigates to `product.html?p=mcp-server` |
| Hero renders | `product.html?p=mcp-server` | Category badge, tagline with italic "OASIS", description paragraph |
| Canvas starts | (same) | Agent nodes and hub visible, particles moving |
| Scroll state 0 | scroll to "60+ tools" feature | canvas burst of particles, orange left-border on feature |
| Scroll state 1 | scroll to "Natural language" feature | typewriter text visible above top-left agent node |
| Scroll state 2 | scroll to "A2A Protocol" feature | peer edges turn orange, hub edges dim |
| Scroll state 3 | scroll to "Any IDE" feature | agent labels change to Cursor/VS Code/Windsurf/Claude |
| Back link | click "← Products" in nav | returns to `index.html#gallery` |
| Stub product | `product.html?p=star-cli` | page renders with stub content, same canvas |
| Bad slug | `product.html?p=bogus` | redirects to `index.html#gallery` |
| Mobile | resize browser < 900px | canvas strip above features, no sticky, single column |

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: verify product pages full flow — no changes needed"
# (skip commit if no files changed during testing)
```

---

## Summary

After all tasks are complete, the following will be live:

1. **Section 08** shows 8 real OASIS product cards with "Explore →" links
2. **`product.html`** renders any product from `js/products.js` via URL param
3. **MCP Server** has full copy, 4-state canvas animation, sticky split layout
4. **Other 7 products** have stub content and share the MCP animation until their own `js/anim/<key>.js` files are authored

To add a new product animation later: create `js/anim/<key>.js` with the same `init / setFeature / start / stop` exports, set `animation: '<key>'` in `products.js`, and no changes to `product.html` or the template are needed.
