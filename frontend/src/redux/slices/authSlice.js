import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'
import { clearCart, fetchCart } from './cartSlice';
const userFromStorage = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
const initialState = {
    user: userFromStorage,
    loading: false,
    error: null
}



export const loginUser = createAsyncThunk('auth/loginUser', async (userData, {dispatch, rejectWithValue}) => {
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/users/login`, 
            userData
        )
        localStorage.setItem('userInfo', JSON.stringify(response.data.user))
        localStorage.setItem('userToken', response.data.token)
        const userId = response.data.user._id
        console.log("Fetching cart for user:", userId);

        dispatch(fetchCart(userId));
        return response.data.user
    } catch (error) {
        return rejectWithValue(error.response.data.message)
    }
})

export const registerUser = createAsyncThunk('auth/registerUser', async (userData, {dispatch, rejectWithValue}) => {
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/users/register`, 
            userData
        )
        localStorage.setItem('userInfo', JSON.stringify(response.data.user))
        localStorage.setItem('userToken', response.data.token)
        const userId = response.data.user._id
        dispatch(fetchCart(userId));
        return response.data.user
    } catch (error) {
        return rejectWithValue(error.response.data.message)
    }
})

// slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null
            localStorage.removeItem('userInfo')
            localStorage.removeItem('userToken')
            clearCart()
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;  
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;  
                state.error=null

            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Đăng nhập thất bại';  
            })
            
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;  
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;  
                state.error=null
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Đăng nhập thất bại';  
            })
    }
})

export const {logout} = authSlice.actions
export default authSlice.reducer