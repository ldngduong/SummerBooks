import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";

const loadCartFromStorage = () => {
    const storedCart = localStorage.getItem('cart')
    return storedCart ? JSON.parse(storedCart) : {products: []}
}

const saveCartToStorage = (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart))
}

export const fetchCart = createAsyncThunk('cart/fetchCart', async(userId, {rejectWithValue}) => {
    try{
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
            params: {userId}
        })
        return response.data
    } catch(error){
        console.log(error)
        return rejectWithValue(error.response.data)
    }
})

export const checkout = createAsyncThunk('cart/checkout', async(checkoutData, {rejectWithValue}) => {
    const userToken = localStorage.getItem('userToken')
    try {
         console.log(checkoutData)
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cart/checkout`, checkoutData, {
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

export const addToCart = createAsyncThunk('cart/addToCart', async ({productId, quantity, author, userId}, {rejectWithValue}) => {
    try {
       const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
        productId, quantity, author, userId
       }) 
       return response.data
    } catch (error) {
        console.log(error)
        return rejectWithValue(error.response.data)
    }
})

export const updateCartItemQuantity = createAsyncThunk('cart/updateCartItemQuantity', async ({productId, quantity, author, userId}, {rejectWithValue}) => {
    try {
       const product = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}`)
       if(quantity > product.data.countInStock){
            return rejectWithValue({ message: 'Số lượng sách trong kho không đủ!' });
        }
       const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
        productId, quantity, author, userId
       }) 
       return response.data
    } catch (error) {
        console.log(error)
        return rejectWithValue(error.response.data)
    }
})

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        checkout: null,
        cart: loadCartFromStorage(),
        loading: false,
        error: null
    },
    reducers: {
        clearCart: (state) => {
            state.cart = {products: []}
            localStorage.removeItem('cart')
        }
    },
    extraReducers: (builder) => {
        builder
        // fetchCart
        .addCase(fetchCart.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(fetchCart.fulfilled, (state, action) => {
            state.loading = false
            state.cart = action.payload
            saveCartToStorage(state.cart)
        }).addCase(fetchCart.rejected, (state, action) => {
            state.loading = false
            state.error = action.error.message || 'Lỗi'
        })
        // addToCart
        .addCase(addToCart.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(addToCart.fulfilled, (state, action) => {
            state.loading = false
            state.cart = action.payload
            saveCartToStorage(state.cart);

        }).addCase(addToCart.rejected, (state, action) => {
            state.loading = false
            state.error = action.error.message || 'Lỗi'
        })
        // updatecart
        .addCase(updateCartItemQuantity.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
            state.loading = false
            state.cart = action.payload
            saveCartToStorage(state.cart);

        }).addCase(updateCartItemQuantity.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload?.message || "Lỗi";
            toast.error(state.error); 
        })
        // checkout cart
        .addCase(checkout.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(checkout.fulfilled, (state, action) => {
            state.loading = false
            state.checkout = action.payload
        })
        .addCase(checkout.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
    }
})

export const {clearCart} = cartSlice.actions
export default cartSlice.reducer

