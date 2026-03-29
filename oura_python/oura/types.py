from dataclasses import dataclass
from typing import List, Optional

@dataclass
class OuraScores:
    R: float
    B: float

@dataclass
class OuraMeta:
    oura_version: str
    selected_priority: Optional[int]

@dataclass
class OuraEvaluationResult:
    matched: bool
    matched_rules: List[str]
    scores: Optional[OuraScores]
    meta: OuraMeta

@dataclass
class OuraVerificationResult:
    valid: bool
    status: str
    bundle_id: Optional[str]
    policy_version: Optional[str]
    key_id: Optional[str]
    expires_at: Optional[int]
    stale: bool
