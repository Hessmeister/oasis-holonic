/* ═══════════════════════════════════════
   js/anim/data-storage.js — Data & Storage animation
   Router hub directing to multiple provider backends with failover
   Accent: Sky blue (#38BDF8)
   ═══════════════════════════════════════ */

import * as engine from './network.js';

const CONFIG = {
  accent: '56,189,248',
  nodes: [
    { rx: 0.50, ry: 0.20, shape: 'triangle', label: 'Query',     isHub: false, size: 10, labelAbove: true },
    { rx: 0.50, ry: 0.45, shape: 'hexagon',  label: 'Router',    isHub: true,  size: 15 },
    { rx: 0.15, ry: 0.45, shape: 'diamond',  label: 'Rules',     isHub: false, size: 8 },
    { rx: 0.15, ry: 0.78, shape: 'circle',   label: 'MongoDB',   isHub: false, size: 9 },
    { rx: 0.38, ry: 0.85, shape: 'circle',   label: 'IPFS',      isHub: false, size: 9 },
    { rx: 0.62, ry: 0.85, shape: 'circle',   label: 'Holochain', isHub: false, size: 9 },
    { rx: 0.85, ry: 0.78, shape: 'circle',   label: 'Cloud',     isHub: false, size: 9 },
    { rx: 0.85, ry: 0.45, shape: 'diamond',  label: 'Failover',  isHub: false, size: 8 },
  ],
  edges: [
    [0,1], [1,2], [1,3], [1,4], [1,5], [1,6], [1,7],
    [2,3], [3,4], [4,5], [5,6], [6,7],
  ],
  features: [
    { // holonic routing
      activeEdges: [[0,1],[1,3],[1,4],[1,5],[1,6]],
      activeNodes: [0,1,3,4,5,6],
      overlay: 'Route to best provider',
    },
    { // automatic replication
      activeEdges: [[1,2],[2,3],[3,4],[4,5],[5,6]],
      activeNodes: [1,2,3,4,5,6],
    },
    { // instant failover
      activeEdges: [[1,7],[6,7],[1,3],[1,5]],
      activeNodes: [1,3,5,7],
      overlay: 'Provider down → instant switch',
    },
    { // unified query
      activeEdges: [[0,1],[1,3],[1,4],[1,5],[1,6]],
      activeNodes: [0,1,3,4,5,6],
      overlay: 'One query, any backend',
    },
  ],
};

export function init(c) { engine.init(c); engine.configure(CONFIG); }
export function setFeature(i) { engine.setFeature(i); }
export function start() { engine.start(); }
export function stop() { engine.stop(); }
