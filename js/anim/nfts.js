/* ═══════════════════════════════════════
   js/anim/nfts.js — NFT & Digital Assets animation
   Mint hub radiating to multiple chains with replication flow
   Accent: Rose/Pink (#F472B6)
   ═══════════════════════════════════════ */

import * as engine from './network.js';

const CONFIG = {
  accent: '244,114,182',
  nodes: [
    { rx: 0.50, ry: 0.22, shape: 'hexagon', label: 'Mint',      isHub: true, size: 14, labelAbove: true },
    { rx: 0.50, ry: 0.48, shape: 'square',  label: 'OASIS',     isHub: true, size: 12 },
    { rx: 0.15, ry: 0.48, shape: 'diamond', label: 'Metadata',  isHub: false, size: 8 },
    { rx: 0.15, ry: 0.80, shape: 'circle',  label: 'Ethereum',  isHub: false, size: 9 },
    { rx: 0.42, ry: 0.85, shape: 'circle',  label: 'Solana',    isHub: false, size: 9 },
    { rx: 0.58, ry: 0.85, shape: 'circle',  label: 'Polygon',   isHub: false, size: 9 },
    { rx: 0.85, ry: 0.80, shape: 'circle',  label: 'Radix',     isHub: false, size: 9 },
    { rx: 0.85, ry: 0.48, shape: 'diamond', label: 'Inventory',  isHub: false, size: 8 },
  ],
  edges: [
    [0,1], [1,2], [1,3], [1,4], [1,5], [1,6], [1,7],
    [3,4], [4,5], [5,6],
  ],
  features: [
    { // single mint every chain
      activeEdges: [[0,1],[1,3],[1,4],[1,5],[1,6]],
      activeNodes: [0,1,3,4,5,6],
      overlay: 'Mint once → replicate everywhere',
    },
    { // persistent metadata
      activeEdges: [[0,1],[1,2]],
      activeNodes: [0,1,2],
    },
    { // avatar inventory
      activeEdges: [[1,7],[1,3],[1,4],[1,5],[1,6]],
      activeNodes: [1,7,3,4,5,6],
    },
    { // cross-chain royalties
      activeEdges: [[3,4],[4,5],[5,6]],
      activeNodes: [3,4,5,6],
      overlay: 'Royalties enforced on every chain',
    },
  ],
};

export function init(c) { engine.init(c); engine.configure(CONFIG); }
export function setFeature(i) { engine.setFeature(i); }
export function start() { engine.start(); }
export function stop() { engine.stop(); }
