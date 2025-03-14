import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchUsers = createAsyncThunk('adminUser/fetchUsers', async() => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
    })
    return response.data
})

export const addUser = createAsyncThunk('adminUser/addUser', async(userData, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, userData,  {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('userToken')}`
            }
        })
        console.log(response.data)

        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

export const updateUser = createAsyncThunk('adminUser/updateUser', async({id, name, email, role}, {rejectWithValue}) => {
    try {
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`, {name, email, role},  {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('userToken')}`
            }
        })
        console.log(response.data)
        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

export const deleteUser = createAsyncThunk('adminUser/deleteUser', async({id}, {rejectWithValue}) => {
    try {
        const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`,  {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('userToken')}`
            }
        })
        console.log(response.data)
        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data.message)
    }
})

const adminUserSlice = createSlice({
    name: 'adminUser',
    initialState: {
        user: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        // fetch all user
        builder
        .addCase(fetchUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
        })
        .addCase(fetchUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        // update user
        builder
        .addCase(updateUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateUser.fulfilled, (state, action) => {
            state.loading = false;
            const updatedUser = action.payload.user
            const userIndex = state.user.findIndex((user) => user._id === updatedUser._id)
            if(userIndex !== -1){
                state.user[userIndex] = updatedUser
            }
        })
        .addCase(updateUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        // delete user
        builder
        .addCase(deleteUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteUser.fulfilled, (state, action) => {
            state.loading = false;
            const deletedUser = action.payload
            state.user = state.user.filter((user) => user._id !== deletedUser._id)
        })
        .addCase(deleteUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        // add user
        builder
        .addCase(addUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(addUser.fulfilled, (state, action) => {
            state.loading = false;
            const addedUser = action.payload
            state.user.push(addedUser)
        })
        .addCase(addUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
    }
})

export default adminUserSlice.reducer