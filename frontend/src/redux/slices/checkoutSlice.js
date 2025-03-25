import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createOrder = createAsyncThunk('checkout/createOrder', async(checkoutData, {rejectWithValue}) => {
    const userToken = localStorage.getItem('userToken')
    try {
         console.log(checkoutData)
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/checkout/finalize`, checkoutData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('userToken')}`
            }
        })
        return response.data
    } catch (error) {
        console.log(userToken, 'ok')

        return rejectWithValue(error.response?.data || { message: "Lỗi không xác định" });
    }
})

const checkoutSlice = createSlice({
    name: 'checkout',
    initialState: {
        checkout: null,
        loading: false,
        error: null,
    },
    reducers: {
        
    },
    extraReducers: (builder) => {
        builder
        .addCase(createOrder.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(createOrder.fulfilled, (state, action) => {
            state.loading = false
            state.checkout = action.payload
        })
        .addCase(createOrder.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
    }
})

export default checkoutSlice.reducer;