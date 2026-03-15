/* ═══════════════════════════════════════
   js/anim/smart-contracts.js — Smart Contracts animation
   Write-once source → compiler → multi-chain deployment
   Accent: Amber (#F59E0B)
   ═══════════════════════════════════════ */

import * as engine from './network.js';

const CONFIG = {
  accent: '245,158,11',
  nodes: [
    { rx: 0.50, ry: 0.20, shape: 'square',   label: 'Source',    isHub: false, size: 11, labelAbove: true },
    { rx: 0.50, ry: 0.42, shape: 'hexagon',  label: 'Compiler',  isHub: true,  size: 14 },
    { rx: 0.18, ry: 0.70, shape: 'diamond',  label: 'Solidity',  isHub: false, size: 9 },
    { rx: 0.50, ry: 0.70, shape: 'diamond',  label: 'Rust',      isHub: false, size: 9 },
    { rx: 0.82, ry: 0.70, shape: 'diamond',  label: 'Scrypto',   isHub: false, size: 9 },
    { rx: 0.18, ry: 0.92, shape: 'circle',   label: 'Ethereum',  isHub: false, size: 7 },
    { rx: 0.50, ry: 0.92, shape: 'circle',   label: 'Solana',    isHub: false, size: 7 },
    { rx: 0.82, ry: 0.92, shape: 'circle',   label: 'Radix',     isHub: false, size: 7 },
  ],
  edges: [
    [0,1], [1,2], [1,3], [1,4], [2,5], [3,6], [4,7],
    [2,3], [3,4],
  ],
  features: [
    { // write once
      activeEdges: [[0,1]],
      activeNodes: [0,1],
      overlay: 'Provider-agnostic DSL',
    },
    { // deploy to all
      activeEdges: [[0,1],[1,2],[1,3],[1,4],[2,5],[3,6],[4,7]],
      activeNodes: [0,1,2,3,4,5,6,7],
    },
    { // unified verification
      activeEdges: [[2,5],[3,6],[4,7]],
      activeNodes: [5,6,7],
      overlay: 'Verify across all chains',
    },
    { // holonic upgrades
      activeEdges: [[0,1],[1,2],[1,3],[1,4]],
      activeNodes: [0,1,2,3,4],
      overlay: 'Push updates without redeploy',
    },
  ],
};

export function init(c) { engine.init(c); engine.configure(CONFIG); }
export function setFeature(i) { engine.setFeature(i); }
export function start() { engine.start(); }
export function stop() { engine.stop(); }
