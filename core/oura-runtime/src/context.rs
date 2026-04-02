use std::collections::HashMap;

#[derive(Debug, Clone, Default)]
pub struct EvaluationContext {
    pub trust: f64,
    pub pressure: f64,
    pub risk: f64,
    pub latency: f64,
    pub error_rate: f64,

    pub delta_trust: f64,
    pub delta_pressure: f64,
    pub delta_risk: f64,
    pub delta_latency: f64,
    pub delta_error_rate: f64,

    pub thresholds: HashMap<String, f64>,
}

impl EvaluationContext {
    pub fn threshold(&self, name: &str) -> Option<f64> {
        self.thresholds.get(name).copied()
    }
}
