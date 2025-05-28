import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
};

export const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },
        logout: (state) => {
            state.user = null;
        },
        updateProfilez: (state, action) => { 
            if (state.user) { 
                state.user.name = action.payload.name;
                state.user.email = action.payload.email;
                state.user.phone = action.payload.phone;
                state.user.photo = action.payload.image; 
            } 
        }
    },
});

export const { setUser, logout, updateProfilez } = userSlice.actions

export default userSlice.reducer;