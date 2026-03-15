/* ═══════════════════════════════════════
   js/anim/identity.js — Identity & Access animation
   Central Avatar hub radiating to Karma, Wallet, Keys, SSO
   Accent: Violet (#A78BFA)
   ═══════════════════════════════════════ */

import * as engine from './network.js';

const CONFIG = {
  accent: '167,139,250',
  nodes: [
    { rx: 0.50, ry: 0.45, shape: 'circle',  label: 'Avatar',  isHub: true,  size: 16 },
    { rx: 0.20, ry: 0.22, shape: 'diamond', label: 'Karma',   isHub: false, size: 9 },
    { rx: 0.80, ry: 0.22, shape: 'diamond', label: 'Wallet',  isHub: false, size: 9 },
    { rx: 0.14, ry: 0.55, shape: 'diamond', label: 'Keys',    isHub: false, size: 9 },
    { rx: 0.86, ry: 0.55, shape: 'diamond', label: 'SSO',     isHub: false, size: 9 },
    { rx: 0.30, ry: 0.85, shape: 'circle',  label: 'OAPP 1',  isHub: false, size: 6 },
    { rx: 0.50, ry: 0.88, shape: 'circle',  label: 'OAPP 2',  isHub: false, size: 6 },
    { rx: 0.70, ry: 0.85, shape: 'circle',  label: 'OAPP 3',  isHub: false, size: 6 },
  ],
  edges: [
    [0,1], [0,2], [0,3], [0,4],
    [0,5], [0,6], [0,7],
    [1,3], [2,4],
  ],
  features: [
    { // universal avatar
      activeEdges: [[0,1],[0,2],[0,3],[0,4]],
      activeNodes: [0,1,2,3,4],
    },
    { // karma ledger
      activeEdges: [[0,1],[1,3],[0,5],[0,6],[0,7]],
      activeNodes: [0,1,5,6,7],
      overlay: 'Karma syncs across apps',
    },
    { // multi-chain wallet
      activeEdges: [[0,2],[2,4]],
      activeNodes: [0,2],
    },
    { // SSO
      activeEdges: [[0,4],[0,5],[0,6],[0,7]],
      activeNodes: [0,4,5,6,7],
      overlay: 'Login once → access all',
    },
  ],
};

export function init(c) { engine.init(c); engine.configure(CONFIG); }
export function setFeature(i) { engine.setFeature(i); }
export function start() { engine.start(); }
export function stop() { engine.stop(); }
