use oura::ir::{Condition, Decision, Metric, Operand, Operator, Rule};

use crate::context::EvaluationContext;

#[derive(Debug, Clone)]
pub struct EvaluationResult {
    pub decision: Decision,
    pub matched_rule: Option<String>,
    pub requires_quorum: bool,
}

pub fn evaluate_rules(
    rules: &[Rule],
    ctx: &EvaluationContext,
) -> Result<EvaluationResult, String> {
    for rule in rules {
        if rule_matches(rule, ctx)? {
            return Ok(EvaluationResult {
                decision: rule.action,
                matched_rule: Some(rule.name.clone()),
                requires_quorum: rule.requires_quorum,
            });
        }
    }

    Ok(EvaluationResult {
        decision: Decision::NoOp,
        matched_rule: None,
        requires_quorum: false,
    })
}

fn rule_matches(rule: &Rule, ctx: &EvaluationContext) -> Result<bool, String> {
    for cond in &rule.conditions {
        if !condition_matches(cond, ctx)? {
            return Ok(false);
        }
    }
    Ok(true)
}

fn condition_matches(cond: &Condition, ctx: &EvaluationContext) -> Result<bool, String> {
    let left = resolve_metric(&cond.metric, ctx)?;
    let right = resolve_operand(&cond.operand, ctx)?;

    Ok(compare(left, cond.operator, right))
}

fn resolve_metric(metric: &Metric, ctx: &EvaluationContext) -> Result<f64, String> {
    match metric {
        Metric::Trust => Ok(ctx.trust),
        Metric::Pressure => Ok(ctx.pressure),
        Metric::Risk => Ok(ctx.risk),
        Metric::Latency => Ok(ctx.latency),
        Metric::ErrorRate => Ok(ctx.error_rate),

        Metric::DeltaTrust => Ok(ctx.delta_trust),
        Metric::DeltaPressure => Ok(ctx.delta_pressure),
        Metric::DeltaRisk => Ok(ctx.delta_risk),
        Metric::DeltaLatency => Ok(ctx.delta_latency),
        Metric::DeltaErrorRate => Ok(ctx.delta_error_rate),

        Metric::Threshold(name) => ctx
            .threshold(name)
            .ok_or_else(|| format!("missing threshold '{}'", name)),
    }
}

fn resolve_operand(operand: &Operand, ctx: &EvaluationContext) -> Result<f64, String> {
    match operand {
        Operand::Number(v) => Ok(*v),
        Operand::Threshold(name) => ctx
            .threshold(name)
            .ok_or_else(|| format!("missing threshold '{}'", name)),
    }
}

fn compare(left: f64, op: Operator, right: f64) -> bool {
    match op {
        Operator::Lt => left < right,
        Operator::Lte => left <= right,
        Operator::Gt => left > right,
        Operator::Gte => left >= right,
        Operator::Eq => left == right,
        Operator::Neq => left != right,
    }
}
