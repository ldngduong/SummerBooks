import {configureStore} from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import productReducer from './slices/productsSlice'
import cartReducer from './slices/cartSlice'
import orderReducer from './slices/orderSlice'
import adminUserReducer from './slices/adminUserSlice'
import adminProductReducer from './slices/adminProductSlice'
import adminOrderProduct from './slices/adminOrderSlice'
import shopManager from './slices/shopManagerSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        cart: cartReducer,
        order: orderReducer,
        adminUser: adminUserReducer,
        adminProduct: adminProductReducer,
        adminOrder: adminOrderProduct,
        shopManager: shopManager
    }
})

export default store