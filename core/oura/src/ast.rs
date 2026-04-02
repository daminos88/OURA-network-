#[derive(Debug, Clone)]
pub struct AstProgram {
    pub rules: Vec<AstRule>,
}

#[derive(Debug, Clone)]
pub struct AstRule {
    pub name: String,
    pub when: Vec<AstCondition>,
    pub then: AstThen,
}

#[derive(Debug, Clone)]
pub struct AstCondition {
    pub metric: AstMetric,
    pub operator: AstOperator,
    pub operand: AstOperand,
}

#[derive(Debug, Clone)]
pub struct AstThen {
    pub action: AstAction,
    pub quorum: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AstMetric {
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
pub enum AstOperand {
    Number(f64),
    Threshold(String),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AstOperator {
    Lt,
    Lte,
    Gt,
    Gte,
    Eq,
    Neq,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AstAction {
    NoOp,
    Warn,
    ReduceTraffic,
    Rotate,
    Isolate,
    Rejoin,
}
