import { ouraVerdict } from "../core/oura_engine.js";

console.log("=== OURA PROBE START ===");

const scenarios = [
  { netEth: 0.001, costs: { totalCost: 0.0001 }, size: 0.002 },
  { netEth: -0.0001, costs: { totalCost: 0.00005 }, size: 0.002 },
  { netEth: 0.00005, costs: { totalCost: 0.00004 }, size: 0.002 },
];

for (const s of scenarios) {
  const res = ouraVerdict(s);
  console.log({ input: s, result: res });
}
