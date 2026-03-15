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
    accent: '255,107,26',
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
    animation: 'star-cli',
    accent: '0,201,219',
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
    animation: 'identity',
    accent: '167,139,250',
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
    animation: 'nfts',
    accent: '244,114,182',
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
    animation: 'smart-contracts',
    accent: '245,158,11',
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
    animation: 'bridge',
    accent: '52,211,153',
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
    animation: 'data-storage',
    accent: '56,189,248',
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
    animation: 'infrastructure',
    accent: '251,146,60',
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
