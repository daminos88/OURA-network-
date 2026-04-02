#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    Rule,
    When,
    Then,
    And,
    Quorum,

    Trust,
    Pressure,
    Risk,
    Latency,
    ErrorRate,

    Delta,
    Theta,

    Identifier(String),
    Number(f64),

    LBrace,
    RBrace,
    Colon,
    Dot,

    Lt,
    Lte,
    Gt,
    Gte,
    Eq,
    Neq,

    ActionNoOp,
    ActionWarn,
    ActionReduceTraffic,
    ActionRotate,
    ActionIsolate,
    ActionRejoin,
}

pub fn lex(input: &str) -> Result<Vec<Token>, String> {
    let mut tokens = Vec::new();
    let mut chars = input.chars().peekable();

    while let Some(&c) = chars.peek() {
        match c {
            '{' => { tokens.push(Token::LBrace); chars.next(); }
            '}' => { tokens.push(Token::RBrace); chars.next(); }
            ':' => { tokens.push(Token::Colon); chars.next(); }
            '.' => { tokens.push(Token::Dot); chars.next(); }

            '<' => {
                chars.next();
                if chars.peek() == Some(&'=') {
                    chars.next();
                    tokens.push(Token::Lte);
                } else {
                    tokens.push(Token::Lt);
                }
            }
            '>' => {
                chars.next();
                if chars.peek() == Some(&'=') {
                    chars.next();
                    tokens.push(Token::Gte);
                } else {
                    tokens.push(Token::Gt);
                }
            }
            '=' => {
                chars.next();
                if chars.peek() == Some(&'=') {
                    chars.next();
                    tokens.push(Token::Eq);
                } else {
                    return Err("unexpected '='".into());
                }
            }
            '!' => {
                chars.next();
                if chars.peek() == Some(&'=') {
                    chars.next();
                    tokens.push(Token::Neq);
                } else {
                    return Err("unexpected '!'".into());
                }
            }

            'Δ' => { tokens.push(Token::Delta); chars.next(); }
            'Θ' => { tokens.push(Token::Theta); chars.next(); }

            c if c.is_whitespace() => { chars.next(); }

            c if c.is_ascii_digit() || c == '-' => {
                let mut num = String::new();
                while let Some(&d) = chars.peek() {
                    if d.is_ascii_digit() || d == '.' || d == '-' {
                        num.push(d);
                        chars.next();
                    } else { break; }
                }
                let parsed = num.parse::<f64>().map_err(|_| "invalid number")?;
                tokens.push(Token::Number(parsed));
            }

            c if c.is_alphabetic() || c == '_' => {
                let mut ident = String::new();
                while let Some(&d) = chars.peek() {
                    if d.is_alphanumeric() || d == '_' {
                        ident.push(d);
                        chars.next();
                    } else { break; }
                }

                let token = match ident.as_str() {
                    "rule" => Token::Rule,
                    "when" => Token::When,
                    "then" => Token::Then,
                    "and" => Token::And,
                    "quorum" => Token::Quorum,

                    "trust" => Token::Trust,
                    "pressure" => Token::Pressure,
                    "risk" => Token::Risk,
                    "latency" => Token::Latency,
                    "error_rate" => Token::ErrorRate,

                    "noop" => Token::ActionNoOp,
                    "warn" => Token::ActionWarn,
                    "reduce_traffic" => Token::ActionReduceTraffic,
                    "rotate" => Token::ActionRotate,
                    "isolate" => Token::ActionIsolate,
                    "rejoin" => Token::ActionRejoin,

                    _ => Token::Identifier(ident),
                };

                tokens.push(token);
            }

            _ => return Err(format!("unexpected character '{}'", c)),
        }
    }

    Ok(tokens)
}
