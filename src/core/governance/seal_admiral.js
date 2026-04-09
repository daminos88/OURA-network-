import fs from "fs";

const STATE_FILE = "state/governance.json";

const DEFAULT_STATE = {
  caseCounter: 0,
  cases: {}
};

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
    return structuredClone(DEFAULT_STATE);
  }

  const raw = fs.readFileSync(STATE_FILE, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    fs.writeFileSync(STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function initGovernance() {
  const state = loadState();
  saveState(state);
  return { ok: true, file: STATE_FILE };
}

export function openCase({ signal, oura, metadata = {} }) {
  const state = loadState();
  state.caseCounter += 1;

  const caseId = `case-${String(state.caseCounter).padStart(6, "0")}`;

  state.cases[caseId] = {
    id: caseId,
    createdAt: new Date().toISOString(),
    status: "PENDING_SEAL",
    signal,
    oura,
    metadata,
    seals: [],
    admirals: [],
    finalVerdict: null
  };

  saveState(state);
  return state.cases[caseId];
}

export function sealReview({ caseId, sealId, recommendation, note = "" }) {
  const state = loadState();
  const record = state.cases[caseId];
  if (!record) throw new Error(`unknown caseId: ${caseId}`);

  const allowed = new Set(["APPROVE", "REJECT", "ESCALATE"]);
  if (!allowed.has(recommendation)) {
    throw new Error(`invalid seal recommendation: ${recommendation}`);
  }

  record.seals = record.seals.filter(s => s.sealId !== sealId);
  record.seals.push({ sealId, recommendation, note, at: new Date().toISOString() });

  const approvals = record.seals.filter(s => s.recommendation === "APPROVE").length;
  const rejects = record.seals.filter(s => s.recommendation === "REJECT").length;

  if (rejects >= 1) {
    record.status = "REJECTED_BY_SEAL";
    record.finalVerdict = "REJECT";
  } else if (approvals >= 1) {
    record.status = "PENDING_ADMIRAL";
  }

  saveState(state);
  return record;
}

export function admiralVote({ caseId, admiralId, vote, note = "" }) {
  const state = loadState();
  const record = state.cases[caseId];
  if (!record) throw new Error(`unknown caseId: ${caseId}`);

  const allowed = new Set(["AUTHORIZE", "DENY"]);
  if (!allowed.has(vote)) {
    throw new Error(`invalid admiral vote: ${vote}`);
  }

  record.admirals = record.admirals.filter(a => a.admiralId !== admiralId);
  record.admirals.push({ admiralId, vote, note, at: new Date().toISOString() });

  const authorizations = record.admirals.filter(a => a.vote === "AUTHORIZE").length;
  const denials = record.admirals.filter(a => a.vote === "DENY").length;

  if (denials >= 1) {
    record.status = "DENIED_BY_ADMIRAL";
    record.finalVerdict = "DENY";
  } else if (authorizations >= 2) {
    record.status = "AUTHORIZED";
    record.finalVerdict = "AUTHORIZE";
  } else {
    record.status = "PENDING_ADMIRAL";
  }

  saveState(state);
  return record;
}

export function governanceGate({ signal, oura, metadata = {} }) {
  const caseRecord = openCase({ signal, oura, metadata });

  if (!oura || oura.decision !== "ACCEPT") {
    return { ok: true, caseId: caseRecord.id, action: "BLOCK", reason: "oura_reject", status: caseRecord.status };
  }

  return { ok: true, caseId: caseRecord.id, action: "ESCALATE_TO_SEAL", reason: "pending_human_governance", status: caseRecord.status };
}
