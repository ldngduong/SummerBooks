import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchVouchers = createAsyncThunk('adminVoucher/fetchVouchers', async() => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/vouchers`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
    })
    return response.data
})

export const addVoucher = createAsyncThunk('adminVoucher/addVoucher', async(voucherData, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/vouchers`, voucherData,  {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('userToken')}`
            }
        })
        return response.data
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.response?.data?.errors || 'Lỗi không xác định')
    }
})

export const updateVoucher = createAsyncThunk('adminVoucher/updateVoucher', async({id, ...voucherData}, {rejectWithValue}) => {
    try {
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/vouchers/${id}`, voucherData,  {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('userToken')}`
            }
        })
        return response.data
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.response?.data?.errors || 'Lỗi không xác định')
    }
})

export const deleteVoucher = createAsyncThunk('adminVoucher/deleteVoucher', async({id}, {rejectWithValue}) => {
    try {
        const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/vouchers/${id}`,  {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('userToken')}`
            }
        })
        return {id, ...response.data}
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Lỗi không xác định')
    }
})

const adminVoucherSlice = createSlice({
    name: 'adminVoucher',
    initialState: {
        vouchers: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        // fetch all vouchers
        builder
        .addCase(fetchVouchers.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchVouchers.fulfilled, (state, action) => {
            state.loading = false;
            state.vouchers = action.payload;
        })
        .addCase(fetchVouchers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        // update voucher
        builder
        .addCase(updateVoucher.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateVoucher.fulfilled, (state, action) => {
            state.loading = false;
            const updatedVoucher = action.payload
            const voucherIndex = state.vouchers.findIndex((voucher) => voucher._id === updatedVoucher._id)
            if(voucherIndex !== -1){
                state.vouchers[voucherIndex] = updatedVoucher
            }
        })
        .addCase(updateVoucher.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        // delete voucher
        builder
        .addCase(deleteVoucher.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteVoucher.fulfilled, (state, action) => {
            state.loading = false;
            state.vouchers = state.vouchers.filter((voucher) => voucher._id !== action.payload.id)
        })
        .addCase(deleteVoucher.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        // add voucher
        builder
        .addCase(addVoucher.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(addVoucher.fulfilled, (state, action) => {
            state.loading = false;
            const addedVoucher = action.payload
            state.vouchers.push(addedVoucher)
        })
        .addCase(addVoucher.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
    }
})

export default adminVoucherSlice.reducer

