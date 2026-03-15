/* ═══════════════════════════════════════
   js/anim/infrastructure.js — Infrastructure & Tools animation
   SDK/API hub connecting to multiple platform outputs
   Accent: Warm orange-red (#FB923C) — close to main orange but distinct
   ═══════════════════════════════════════ */

import * as engine from './network.js';

const CONFIG = {
  accent: '251,146,60',
  nodes: [
    { rx: 0.50, ry: 0.40, shape: 'square',  label: 'OASIS API', isHub: true,  size: 14 },
    { rx: 0.18, ry: 0.20, shape: 'diamond', label: '.NET SDK',  isHub: false, size: 9 },
    { rx: 0.50, ry: 0.18, shape: 'diamond', label: 'Node.js',   isHub: false, size: 9, labelAbove: true },
    { rx: 0.82, ry: 0.20, shape: 'diamond', label: 'Unity',     isHub: false, size: 9 },
    { rx: 0.14, ry: 0.50, shape: 'circle',  label: 'REST',      isHub: false, size: 8 },
    { rx: 0.86, ry: 0.50, shape: 'circle',  label: 'GraphQL',   isHub: false, size: 8 },
    { rx: 0.22, ry: 0.82, shape: 'hexagon', label: 'React',     isHub: false, size: 8 },
    { rx: 0.50, ry: 0.85, shape: 'hexagon', label: 'Vue',       isHub: false, size: 8 },
    { rx: 0.78, ry: 0.82, shape: 'hexagon', label: 'Docker',    isHub: false, size: 8 },
  ],
  edges: [
    [0,1], [0,2], [0,3], [0,4], [0,5],
    [0,6], [0,7], [0,8],
    [1,4], [3,5], [6,7], [7,8],
  ],
  features: [
    { // first-party SDKs
      activeEdges: [[0,1],[0,2],[0,3]],
      activeNodes: [0,1,2,3],
    },
    { // REST API
      activeEdges: [[0,4],[0,5],[1,4],[3,5]],
      activeNodes: [0,4,5],
    },
    { // web kit
      activeEdges: [[0,6],[0,7],[6,7],[7,8]],
      activeNodes: [0,6,7],
      overlay: 'React · Vue · Vanilla JS',
    },
    { // local dev
      activeEdges: [[0,8],[7,8]],
      activeNodes: [0,8],
      overlay: '$ docker compose up oasis',
    },
  ],
};

export function init(c) { engine.init(c); engine.configure(CONFIG); }
export function setFeature(i) { engine.setFeature(i); }
export function start() { engine.start(); }
export function stop() { engine.stop(); }
