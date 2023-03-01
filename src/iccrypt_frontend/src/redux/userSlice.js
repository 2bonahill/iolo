import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        isLoggedIn: false,
        principal: null,
        hasAccount: false,
    },
    reducers: {
        logIn: (state, action) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the Immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            state.isLoggedIn = true;
            state.principal = action.payload;
        },
        logOut: (state) => {
            state.isLoggedIn = false;
            state.principal = null;
        },
        setAccountState: (state, action) => {
            state.hasAccount = action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const { logIn, logOut, setAccountState } = userSlice.actions;

export default userSlice.reducer;