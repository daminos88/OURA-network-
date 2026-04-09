import { scoreRouteLiquidity, filterWeakRoutes } from "../core/reserve_scanner.js";

console.log("=== RESERVE SCANNER PROBE START ===");

const routes = [
  {
    name: "strong_route",
    route: [
      { reserveIn: 500000, reserveOut: 600000 },
      { reserveIn: 450000, reserveOut: 470000 }
    ]
  },
  {
    name: "weak_route",
    route: [
      { reserveIn: 50, reserveOut: 80 },
      { reserveIn: 40, reserveOut: 30 }
    ]
  }
];

for (const r of routes) {
  console.log(r.name, scoreRouteLiquidity(r.route));
}

const filtered = filterWeakRoutes(routes, {
  minWeakestDepth: 100,
  minLiquidityScore: 2
});

console.log("FILTERED:", filtered);
