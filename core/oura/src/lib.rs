pub mod ast;
pub mod ir;
pub mod lexer;
pub mod lower;
pub mod parser;
pub mod validate;

pub use ast::*;
pub use ir::*;
pub use lexer::*;
pub use lower::*;
pub use parser::*;
pub use validate::*;

pub fn compile_oura(source: &str) -> Result<Vec<ir::Rule>, String> {
    let tokens = lexer::lex(source)?;
    let ast = parser::parse(&tokens)?;
    validate::validate(&ast)?;
    lower::lower(&ast)
}
