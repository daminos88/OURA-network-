#[derive(Debug, Clone)]
pub struct Rule {
    pub name: String,
    pub conditions: Vec<Condition>,
    pub action: Decision,
    pub requires_quorum: bool,
    pub priority: usize,
}

#[derive(Debug, Clone)]
pub struct Condition {
    pub metric: Metric,
    pub operator: Operator,
    pub operand: Operand,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Metric {
    Trust,
    Pressure,
    Risk,
    Latency,
    ErrorRate,
    DeltaTrust,
    DeltaPressure,
    DeltaRisk,
    DeltaLatency,
    DeltaErrorRate,
    Threshold(String),
}

#[derive(Debug, Clone, PartialEq)]
pub enum Operand {
    Number(f64),
    Threshold(String),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Operator {
    Lt,
    Lte,
    Gt,
    Gte,
    Eq,
    Neq,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Decision {
    NoOp,
    Warn,
    ReduceTraffic,
    Rotate,
    Isolate,
    Rejoin,
}
