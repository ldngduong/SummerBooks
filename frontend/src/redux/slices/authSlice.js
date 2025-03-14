import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'
import { clearCart, fetchCart, mergeCart } from './cartSlice';
const userFromStorage = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
const initialGuestId = localStorage.getItem('guestId') || `guest_${new Date().getTime()}`
localStorage.setItem('guestId', initialGuestId)
const initialState = {
    user: userFromStorage,
    guestId: initialGuestId,
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
        const guestId = localStorage.getItem('guestId');
        const userId = response.data.user._id
        if (localStorage.getItem('cart')) {
            dispatch(mergeCart({ guestId, userId }));
        } else {
            dispatch(fetchCart({ userId, guestId }));
        }
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
        const guestId = localStorage.getItem('guestId');
        const userId = response.data.user._id
        if (localStorage.getItem('cart')) {
            dispatch(mergeCart({ guestId, userId }));
        } else {
            dispatch(fetchCart({ userId, guestId }));
        }
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
            state.guestId = `guest_${new Date().getTime()}`
            localStorage.removeItem('userInfo')
            localStorage.removeItem('userToken')
            clearCart()
            localStorage.setItem('guestId', state.guestId)
        },
        generateNewGuestId: (state) => {
            state.guestId = `guest_${new Date().getTime()}`
            localStorage.setItem('guestId', state.guestId)
        }
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

export const {logout, generateNewGuestId} = authSlice.actions
export default authSlice.reducer