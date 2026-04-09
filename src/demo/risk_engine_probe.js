import { applyRiskToRankedSignals } from "../core/risk_engine.js";

console.log("=== RISK ENGINE PROBE START ===");

const ranked = [
  { size: 0.005, realNet: 0.00005, score: 0.8, path: [1,2,3] },
  { size: 0.02, realNet: 0.0001, score: 0.9, path: [1,2,3,4,5] },
  { size: 0.001, realNet: -0.00001, score: 0.5, path: [1,2] }
];

const res = applyRiskToRankedSignals(ranked, {
  maxSize: 0.01,
  maxHops: 4,
  minRealNet: 0,
  minScore: 0.6,
  maxExposure: 0.02,
  currentExposure: 0
});

console.log(res);
