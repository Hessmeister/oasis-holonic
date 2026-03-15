# Product Pages — Design Spec
**Date:** 2026-03-15
**Status:** Approved

---

## Overview

Replace the illustrative "example apps" gallery (section 08) with OASIS's 8 real products, and build a single data-driven product detail page (`product.html`) that each card links to. First pilot: MCP Server.

---

## Part 1 — Gallery Section Redesign (index.html section 08)

### Changes
- **Heading:** "What we've built" (replaces "What builders have shipped")
- **Cards:** 8 real product cards replacing 6 illustrative example cards
- **Filter bar:** Removed (8 real products don't need it)
- **Card structure:** category badge · product name · one-sentence pitch · tech tags · "Explore →" link to `product.html?p=<slug>`
- **Layout:** Existing 3-column gallery grid unchanged

### The 8 Products (card slugs)
| Slug | Name | Category | One-liner |
|------|------|----------|-----------|
| `mcp-server` | MCP Server | Tools | AI agents that talk to OASIS via 60+ natural language tools |
| `star-cli` | STAR CLI | Tools | Low/no-code generator for OAPPs, metaverses, and holonic games |
| `identity` | Identity & Access | Protocol | Unified avatar, karma, wallet, and keys across every app |
| `nfts` | NFTs & Digital Assets | Protocol | Mint once, own everywhere — cross-chain with auto-replication |
| `smart-contracts` | Smart Contracts | Protocol | Write once, deploy to Ethereum, Solana, and Radix simultaneously |
| `bridge` | Interoperability Bridge | Protocol | Atomic cross-chain swaps with real-time exchange rates |
| `data-storage` | Data & Storage | Infrastructure | Holonic routing with automatic replication and failover |
| `infrastructure` | Infrastructure & Tools | Infrastructure | SDKs, Web Kits, and framework integrations for any stack |

---

## Part 2 — product.html Template (Sticky Split)

### Architecture
- **Single file:** `product.html` at site root
- **Routing:** reads `?p=<slug>` from URL via `new URLSearchParams(location.search).get('p')`
- **Data source:** imports `PRODUCTS` from `js/products.js`
- **Animation:** dynamically imports `js/anim/<animation-key>.js` per product

### Page Structure

```
┌─────────────────────────────────────────┐
│ NAV (sage, same as main site)           │
│ OASIS logo · ← Products                │
├─────────────────────────────────────────┤
│ HERO (section--dark, full width)        │
│ [category label]                        │
│ [large headline]          [canvas anim] │
│ [description paragraph]                 │
├──────────────────────┬──────────────────┤
│ LEFT: scroll column  │ RIGHT: sticky    │
│                      │ canvas           │
│ feature 0            │ (same canvas,    │
│  h3 + body + code?   │  transitions     │
│                      │  state per       │
│ feature 1            │  feature via     │
│  h3 + body           │  Intersection-   │
│                      │  Observer)       │
│ feature 2            │                  │
│  h3 + body + code?   │                  │
│                      │                  │
│ feature 3            │                  │
│  h3 + body           │                  │
├──────────────────────┴──────────────────┤
│ CTA STRIP (section--orange)             │
│ [Docs →]  [GitHub →]                   │
├─────────────────────────────────────────┤
│ FOOTER (same as main site)              │
└─────────────────────────────────────────┘
```

### Responsive behaviour
- Desktop (>900px): sticky split active, canvas fills right column
- Mobile (<900px): canvas collapses to a fixed-height strip above the features; no sticky

---

## Part 3 — Data Architecture

### js/products.js
Exports a single `PRODUCTS` object keyed by slug. Each product:

```js
{
  name: string,           // display name
  category: string,       // badge text
  tagline: string,        // large headline (can include <em>)
  description: string,    // hero paragraph
  tags: string[],         // tech tags shown on gallery card
  animation: string,      // key → js/anim/<key>.js
  features: [
    {
      id: string,         // used by IntersectionObserver
      heading: string,
      body: string,
      code?: string,      // optional code block
    }
  ],
  links: {
    docs?: string,
    github?: string,
  }
}
```

### js/anim/ directory
One file per animation key. Each exports:
```js
export function init(canvas) { ... }      // called once on page load
export function setFeature(index) { ... } // called when feature scrolls into view
export function start() { ... }           // resume animation loop
export function stop() { ... }            // pause when off-screen
```

---

## Part 4 — MCP Server Pilot

### Content

**Tagline:** `AI agents that talk to <em>OASIS</em>`
**Description:** Every OASIS capability — NFT minting, wallet management, smart contracts, data operations — is available through natural language. The MCP Server exposes 60+ tools to any AI agent or IDE that speaks the Model Context Protocol.

**Features:**
1. **60+ tools** — Every OASIS operation exposed as an MCP tool. Minting, wallet queries, contract deployment, holon CRUD. If OASIS can do it, your agent can call it.
2. **Natural language commands** — Describe what you want. "Mint an NFT called Holon #1 on Ethereum and replicate to Solana" executes as a single agent action, no manual API wiring.
3. **A2A Protocol** — Agents talk to each other. One agent mints; another monitors; a third notifies. The OASIS MCP Server is a first-class citizen in multi-agent pipelines.
4. **Any IDE, any client** — Works with Cursor, VS Code, Windsurf, and any client that supports MCP. Install once, use everywhere.

### Animation (js/anim/mcp.js)

Canvas shows 4–5 labelled diamond-shaped agent nodes arranged around a central OASIS API hub (square). Idle state: nodes pulse softly, slow ambient particles.

State transitions via `setFeature(index)`:
- **State 0 (60+ tools):** All agents simultaneously send a burst of particles to the hub, highlighting breadth
- **State 1 (Natural language):** A short text label types itself above one agent node, then a single particle travels to the hub which responds with a return particle
- **State 2 (A2A):** Particles route *between* agent nodes directly (peer edges activate), hub becomes secondary
- **State 3 (Any IDE):** Agent node labels update to "Cursor", "VS Code", "Windsurf", "Claude" — emphasising client-agnostic nature

Drawing primitives reused from `flow.js`: same node shapes, same particle system, same lit-state glow logic.

---

## Build Order

1. `js/products.js` — data for all 8 products (stubs for non-pilot products)
2. `js/anim/mcp.js` — MCP Server animation
3. `product.html` — template (renders any product from data)
4. `css/product.css` — sticky split layout styles
5. Section 08 in `index.html` — replace gallery cards, add links
6. Test full flow: gallery card → product page → animation scroll

Subsequent products: add content to `products.js` + add `js/anim/<key>.js`. No template changes needed.
