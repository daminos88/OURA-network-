use crate::ast::*;
use crate::ir;

pub fn lower(program: &AstProgram) -> Result<Vec<ir::Rule>, String> {
    let mut rules = Vec::with_capacity(program.rules.len());

    for (idx, rule) in program.rules.iter().enumerate() {
        let conditions = rule
            .when
            .iter()
            .map(lower_condition)
            .collect::<Result<Vec<_>, _>>()?;

        rules.push(ir::Rule {
            name: rule.name.clone(),
            conditions,
            action: lower_action(rule.then.action),
            requires_quorum: rule.then.quorum,
            priority: idx,
        });
    }

    Ok(rules)
}

fn lower_condition(cond: &AstCondition) -> Result<ir::Condition, String> {
    Ok(ir::Condition {
        metric: lower_metric(&cond.metric),
        operator: lower_operator(cond.operator),
        operand: lower_operand(&cond.operand),
    })
}

fn lower_metric(metric: &AstMetric) -> ir::Metric {
    match metric {
        AstMetric::Trust => ir::Metric::Trust,
        AstMetric::Pressure => ir::Metric::Pressure,
        AstMetric::Risk => ir::Metric::Risk,
        AstMetric::Latency => ir::Metric::Latency,
        AstMetric::ErrorRate => ir::Metric::ErrorRate,
        AstMetric::DeltaTrust => ir::Metric::DeltaTrust,
        AstMetric::DeltaPressure => ir::Metric::DeltaPressure,
        AstMetric::DeltaRisk => ir::Metric::DeltaRisk,
        AstMetric::DeltaLatency => ir::Metric::DeltaLatency,
        AstMetric::DeltaErrorRate => ir::Metric::DeltaErrorRate,
        AstMetric::Threshold(name) => ir::Metric::Threshold(name.clone()),
    }
}

fn lower_operand(operand: &AstOperand) -> ir::Operand {
    match operand {
        AstOperand::Number(v) => ir::Operand::Number(*v),
        AstOperand::Threshold(name) => ir::Operand::Threshold(name.clone()),
    }
}

fn lower_operator(op: AstOperator) -> ir::Operator {
    match op {
        AstOperator::Lt => ir::Operator::Lt,
        AstOperator::Lte => ir::Operator::Lte,
        AstOperator::Gt => ir::Operator::Gt,
        AstOperator::Gte => ir::Operator::Gte,
        AstOperator::Eq => ir::Operator::Eq,
        AstOperator::Neq => ir::Operator::Neq,
    }
}

fn lower_action(action: AstAction) -> ir::Decision {
    match action {
        AstAction::NoOp => ir::Decision::NoOp,
        AstAction::Warn => ir::Decision::Warn,
        AstAction::ReduceTraffic => ir::Decision::ReduceTraffic,
        AstAction::Rotate => ir::Decision::Rotate,
        AstAction::Isolate => ir::Decision::Isolate,
        AstAction::Rejoin => ir::Decision::Rejoin,
    }
}
