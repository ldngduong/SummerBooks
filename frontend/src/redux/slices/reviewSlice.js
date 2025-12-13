import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch reviews for a product (public, no auth required)
export const fetchProductReviews = createAsyncThunk(
    'review/fetchProductReviews',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/reviews/product/${productId}`
            )
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Lỗi không xác định" })
        }
    }
)

// Fetch reviews for an order
export const fetchOrderReviews = createAsyncThunk(
    'review/fetchOrderReviews',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/reviews/order/${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            )
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Lỗi không xác định" })
        }
    }
)

// Create a review
export const createReview = createAsyncThunk(
    'review/createReview',
    async (reviewData, { rejectWithValue }) => {
        try {
            const formData = new FormData()
            formData.append('orderId', reviewData.orderId)
            formData.append('productId', reviewData.productId)
            formData.append('rating', reviewData.rating)
            if (reviewData.comment) {
                formData.append('comment', reviewData.comment)
            }
            
            // Append images
            if (reviewData.images && reviewData.images.length > 0) {
                reviewData.images.forEach((image) => {
                    formData.append('images', image)
                })
            }

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/reviews`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Lỗi không xác định" })
        }
    }
)

const reviewSlice = createSlice({
    name: 'review',
    initialState: {
        reviews: [], // For order reviews
        productReviews: [], // For product reviews
        loading: false,
        productReviewsLoading: false,
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
        // fetchProductReviews
        .addCase(fetchProductReviews.pending, (state) => {
            state.productReviewsLoading = true
            state.error = null
        })
        .addCase(fetchProductReviews.fulfilled, (state, action) => {
            state.productReviewsLoading = false
            state.productReviews = action.payload
        })
        .addCase(fetchProductReviews.rejected, (state, action) => {
            state.productReviewsLoading = false
            state.error = action.payload
        })
        // fetchOrderReviews
        .addCase(fetchOrderReviews.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(fetchOrderReviews.fulfilled, (state, action) => {
            state.loading = false
            state.reviews = action.payload
        })
        .addCase(fetchOrderReviews.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
        // createReview
        .addCase(createReview.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(createReview.fulfilled, (state, action) => {
            state.loading = false
            state.reviews.push(action.payload)
            // Also add to productReviews if it matches
            if (state.productReviews.length > 0) {
                state.productReviews.unshift(action.payload)
            }
        })
        .addCase(createReview.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
    }
})

export const { clearError } = reviewSlice.actions
export default reviewSlice.reducer


