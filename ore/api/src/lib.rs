pub mod consts;
pub mod error;
pub mod event;
pub mod instruction;
pub mod sdk;
pub mod state;

pub mod prelude {
    pub use crate::consts::*;
    pub use crate::error::*;
    pub use crate::event::*;
    pub use crate::instruction::*;
    pub use crate::sdk::*;
    pub use crate::state::*;
}

use steel::*;

declare_id!("B1ETcSDAmhsESxL3R3Sc9at1PLiyr4riRD2ss9TRYUa8");
