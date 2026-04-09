function nowIso() {
  return new Date().toISOString();
}

export function appendLedgerEntry(ledger = [], entry = {}) {
  const record = {
    id: `ledger-${ledger.length + 1}`,
    at: nowIso(),
    type: entry.type || "EVENT",
    source: entry.source || "unknown",
    payload: entry.payload || {},
    refs: entry.refs || {}
  };

  return [...ledger, record];
}

export function buildDecisionLedger({
  winner = null,
  ranked = [],
  risk = null,
  routePlan = null,
  txPlan = null,
  governance = null
} = {}) {
  let ledger = [];

  ledger = appendLedgerEntry(ledger, {
    type: "RANKED_SIGNALS",
    source: "signal_ranker",
    payload: { ranked }
  });

  if (winner) {
    ledger = appendLedgerEntry(ledger, {
      type: "WINNER_SELECTED",
      source: "hybrid_orchestrator_v2",
      payload: { winner }
    });
  }

  if (risk) {
    ledger = appendLedgerEntry(ledger, {
      type: "RISK_DECISION",
      source: "risk_engine",
      payload: { risk }
    });
  }

  if (routePlan) {
    ledger = appendLedgerEntry(ledger, {
      type: "ROUTE_PLAN",
      source: "route_builder",
      payload: { routePlan }
    });
  }

  if (txPlan) {
    ledger = appendLedgerEntry(ledger, {
      type: "TX_PLAN",
      source: "tx_builder",
      payload: { txPlan }
    });
  }

  if (governance) {
    ledger = appendLedgerEntry(ledger, {
      type: "GOVERNANCE_STATE",
      source: "seal_admiral",
      payload: { governance }
    });
  }

  return ledger;
}
