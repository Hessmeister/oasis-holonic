/* ═══════════════════════════════════════
   js/anim/bridge.js — Interoperability Bridge animation
   Chain A ↔ OASIS Bridge ↔ Chain B with swap flows
   Accent: Emerald (#34D399)
   ═══════════════════════════════════════ */

import * as engine from './network.js';

const CONFIG = {
  accent: '52,211,153',
  nodes: [
    { rx: 0.12, ry: 0.30, shape: 'circle',  label: 'ETH',     isHub: false, size: 10 },
    { rx: 0.12, ry: 0.55, shape: 'circle',  label: 'SOL',     isHub: false, size: 10 },
    { rx: 0.12, ry: 0.80, shape: 'circle',  label: 'MATIC',   isHub: false, size: 10 },
    { rx: 0.42, ry: 0.50, shape: 'square',  label: 'Bridge',  isHub: true,  size: 14 },
    { rx: 0.65, ry: 0.30, shape: 'diamond', label: 'Rates',   isHub: false, size: 8 },
    { rx: 0.65, ry: 0.70, shape: 'diamond', label: 'Fees',    isHub: false, size: 8 },
    { rx: 0.88, ry: 0.30, shape: 'circle',  label: 'SOL',     isHub: false, size: 10 },
    { rx: 0.88, ry: 0.55, shape: 'circle',  label: 'ETH',     isHub: false, size: 10 },
    { rx: 0.88, ry: 0.80, shape: 'circle',  label: 'XRD',     isHub: false, size: 10 },
  ],
  edges: [
    [0,3], [1,3], [2,3],
    [3,4], [3,5],
    [3,6], [3,7], [3,8],
    [4,6], [4,7], [5,8],
  ],
  features: [
    { // atomic swaps
      activeEdges: [[0,3],[3,6],[1,3],[3,7]],
      activeNodes: [0,1,3,6,7],
      overlay: 'All-or-nothing transfers',
    },
    { // real-time rates
      activeEdges: [[3,4],[4,6],[4,7]],
      activeNodes: [3,4,6,7],
    },
    { // any asset
      activeEdges: [[0,3],[1,3],[2,3],[3,6],[3,7],[3,8]],
      activeNodes: [0,1,2,3,6,7,8],
    },
    { // transparent fees
      activeEdges: [[3,5],[5,8],[2,3]],
      activeNodes: [2,3,5,8],
    },
  ],
};

export function init(c) { engine.init(c); engine.configure(CONFIG); }
export function setFeature(i) { engine.setFeature(i); }
export function start() { engine.start(); }
export function stop() { engine.stop(); }
