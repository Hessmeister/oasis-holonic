/* ═══════════════════════════════════════
   js/anim/star-cli.js — STAR CLI animation
   Code generation flow: CLI → Parser → Generator → Output files
   Accent: Cyan (#00C9DB)
   ═══════════════════════════════════════ */

import * as engine from './network.js';

const CONFIG = {
  accent: '0,201,219',
  nodes: [
    { rx: 0.50, ry: 0.20, shape: 'triangle', label: 'CLI',       isHub: false, size: 11, labelAbove: true },
    { rx: 0.50, ry: 0.42, shape: 'square',   label: 'STAR',      isHub: true,  size: 14 },
    { rx: 0.18, ry: 0.72, shape: 'diamond',  label: 'Holons',    isHub: false, size: 9 },
    { rx: 0.50, ry: 0.72, shape: 'diamond',  label: 'Providers', isHub: false, size: 9 },
    { rx: 0.82, ry: 0.72, shape: 'diamond',  label: 'Wallets',   isHub: false, size: 9 },
    { rx: 0.18, ry: 0.92, shape: 'circle',   label: 'OAPP',      isHub: false, size: 7 },
    { rx: 0.50, ry: 0.92, shape: 'circle',   label: 'Deploy',    isHub: false, size: 7 },
    { rx: 0.82, ry: 0.92, shape: 'circle',   label: 'Plugins',   isHub: false, size: 7 },
  ],
  edges: [
    [0,1], [1,2], [1,3], [1,4], [2,5], [3,6], [4,7],
  ],
  features: [
    { // scaffold
      activeEdges: [[0,1],[1,2],[1,3],[1,4]],
      activeNodes: [0,1,2,3,4],
      overlay: '$ star new my-oapp',
    },
    { // holarchy mapping
      activeEdges: [[1,2],[2,5]],
      activeNodes: [1,2,5],
      overlay: 'Star → Planet → Moon → Zome',
    },
    { // deploy
      activeEdges: [[1,3],[3,6]],
      activeNodes: [1,3,6],
      overlay: '$ star deploy --target all',
    },
    { // plugins
      activeEdges: [[1,4],[4,7]],
      activeNodes: [1,4,7],
    },
  ],
};

export function init(c) { engine.init(c); engine.configure(CONFIG); }
export function setFeature(i) { engine.setFeature(i); }
export function start() { engine.start(); }
export function stop() { engine.stop(); }
