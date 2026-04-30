import { createSlice } from '@reduxjs/toolkit';

export const countSlice = createSlice({
    name: 'count',
    initialState: {
        value: 3339,
        products: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        increment: state => {
            state.value += 1;
        },
        decrement: state => {
            state.value -= 1;
        },
    }
});

export const { increment, decrement } = countSlice.actions;
export default countSlice.reducer;
