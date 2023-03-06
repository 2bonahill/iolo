use std::{cell::RefCell, fmt};

use candid::{CandidType, Deserialize};
use serde::Serialize;

thread_local! {

    static UUID_COUNTER: RefCell<u128>  = RefCell::new(0);
}

#[derive(
    Debug, CandidType, Deserialize, Serialize, Clone, Copy, Eq, Hash, Ord, PartialEq, PartialOrd,
)]
pub struct UUID(u128);
impl UUID {
    pub fn new() -> Self {
        // get current counter
        let mut current_counter =
            UUID_COUNTER.with(|counter: &RefCell<u128>| -> u128 { *counter.borrow() });

        // increment the counter
        current_counter += 1;

        // update the counter
        UUID_COUNTER.with(|counter: &RefCell<u128>| {
            *counter.borrow_mut() = current_counter;
        });

        UUID(current_counter)
    }
}

impl fmt::Display for UUID {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl Default for UUID {
    fn default() -> Self {
        Self::new()
    }
}
