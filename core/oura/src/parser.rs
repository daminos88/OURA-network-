use crate::ast::*;
use crate::lexer::Token;

pub fn parse(tokens: &[Token]) -> Result<AstProgram, String> {
    let mut p = Parser { tokens, pos: 0 };
    p.parse_program()
}

struct Parser<'a> {
    tokens: &'a [Token],
    pos: usize,
}

impl<'a> Parser<'a> {
    fn parse_program(&mut self) -> Result<AstProgram, String> {
        let mut rules = Vec::new();

        while !self.is_eof() {
            rules.push(self.parse_rule()?);
        }

        if rules.is_empty() {
            return Err("program contains no rules".to_string());
        }

        Ok(AstProgram { rules })
    }

    fn parse_rule(&mut self) -> Result<AstRule, String> {
        self.expect_simple(Token::Rule)?;

        let name = match self.next() {
            Some(Token::Identifier(s)) => s.clone(),
            other => return Err(format!("expected rule name, found {:?}", other)),
        };

        self.expect_simple(Token::LBrace)?;
        let when = self.parse_when_block()?;
        let then = self.parse_then_block()?;
        self.expect_simple(Token::RBrace)?;

        Ok(AstRule { name, when, then })
    }

    fn parse_when_block(&mut self) -> Result<Vec<AstCondition>, String> {
        self.expect_simple(Token::When)?;
        self.expect_simple(Token::Colon)?;

        let mut conditions = vec![self.parse_condition()?];

        while self.peek() == Some(&Token::And) {
            self.advance();
            conditions.push(self.parse_condition()?);
        }

        Ok(conditions)
    }

    fn parse_then_block(&mut self) -> Result<AstThen, String> {
        self.expect_simple(Token::Then)?;
        self.expect_simple(Token::Colon)?;

        let action = self.parse_action()?;
        let quorum = if self.peek() == Some(&Token::Quorum) {
            self.advance();
            true
        } else {
            false
        };

        Ok(AstThen { action, quorum })
    }

    fn parse_condition(&mut self) -> Result<AstCondition, String> {
        let metric = self.parse_metric()?;
        let operator = self.parse_operator()?;
        let operand = self.parse_operand()?;

        Ok(AstCondition {
            metric,
            operator,
            operand,
        })
    }

    fn parse_metric(&mut self) -> Result<AstMetric, String> {
        match self.next() {
            Some(Token::Trust) => Ok(AstMetric::Trust),
            Some(Token::Pressure) => Ok(AstMetric::Pressure),
            Some(Token::Risk) => Ok(AstMetric::Risk),
            Some(Token::Latency) => Ok(AstMetric::Latency),
            Some(Token::ErrorRate) => Ok(AstMetric::ErrorRate),

            Some(Token::Delta) => match self.next() {
                Some(Token::Trust) => Ok(AstMetric::DeltaTrust),
                Some(Token::Pressure) => Ok(AstMetric::DeltaPressure),
                Some(Token::Risk) => Ok(AstMetric::DeltaRisk),
                Some(Token::Latency) => Ok(AstMetric::DeltaLatency),
                Some(Token::ErrorRate) => Ok(AstMetric::DeltaErrorRate),
                other => Err(format!("expected field after Δ, found {:?}", other)),
            },

            Some(Token::Theta) => {
                self.expect_simple(Token::Dot)?;
                match self.next() {
                    Some(Token::Identifier(name)) => Ok(AstMetric::Threshold(name.clone())),
                    other => Err(format!("expected threshold identifier after Θ., found {:?}", other)),
                }
            }

            other => Err(format!("expected metric, found {:?}", other)),
        }
    }

    fn parse_operand(&mut self) -> Result<AstOperand, String> {
        match self.next() {
            Some(Token::Number(n)) => Ok(AstOperand::Number(*n)),

            Some(Token::Theta) => {
                self.expect_simple(Token::Dot)?;
                match self.next() {
                    Some(Token::Identifier(name)) => Ok(AstOperand::Threshold(name.clone())),
                    other => Err(format!("expected threshold identifier after Θ., found {:?}", other)),
                }
            }

            other => Err(format!("expected operand, found {:?}", other)),
        }
    }

    fn parse_operator(&mut self) -> Result<AstOperator, String> {
        match self.next() {
            Some(Token::Lt) => Ok(AstOperator::Lt),
            Some(Token::Lte) => Ok(AstOperator::Lte),
            Some(Token::Gt) => Ok(AstOperator::Gt),
            Some(Token::Gte) => Ok(AstOperator::Gte),
            Some(Token::Eq) => Ok(AstOperator::Eq),
            Some(Token::Neq) => Ok(AstOperator::Neq),
            other => Err(format!("expected operator, found {:?}", other)),
        }
    }

    fn parse_action(&mut self) -> Result<AstAction, String> {
        match self.next() {
            Some(Token::ActionNoOp) => Ok(AstAction::NoOp),
            Some(Token::ActionWarn) => Ok(AstAction::Warn),
            Some(Token::ActionReduceTraffic) => Ok(AstAction::ReduceTraffic),
            Some(Token::ActionRotate) => Ok(AstAction::Rotate),
            Some(Token::ActionIsolate) => Ok(AstAction::Isolate),
            Some(Token::ActionRejoin) => Ok(AstAction::Rejoin),
            other => Err(format!("expected action, found {:?}", other)),
        }
    }

    fn expect_simple(&mut self, expected: Token) -> Result<(), String> {
        match self.next() {
            Some(tok) if *tok == expected => Ok(()),
            other => Err(format!("expected {:?}, found {:?}", expected, other)),
        }
    }

    fn peek(&self) -> Option<&'a Token> {
        self.tokens.get(self.pos)
    }

    fn next(&mut self) -> Option<&'a Token> {
        let tok = self.tokens.get(self.pos);
        if tok.is_some() {
            self.pos += 1;
        }
        tok
    }

    fn advance(&mut self) {
        self.pos += 1;
    }

    fn is_eof(&self) -> bool {
        self.pos >= self.tokens.len()
    }
}
