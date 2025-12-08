import { BrowserRouter, Route, Routes } from "react-router-dom";
import UserLayout from "./components/Layout/UserLayout";
import Home from "./pages/Home";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import UserVouchers from "./pages/UserVouchers";
import CollectionsPage from "./pages/CollectionsPage";
import ShopManager from "./components/Admin/ShopManager";
import ProductsDetails from "./components/Products/ProductsDetails";
import Checkout from "./components/Cart/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderDetails from "./pages/OrderDetails";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminHome from "./pages/AdminHome";
import UserManager from "./components/Admin/UserManager";
import OrderManager from "./components/Admin/OrderManager";
import ProductManager from "./components/Admin/ProductManager";
import VoucherManager from "./components/Admin/VoucherManager";
import GiftVoucher from "./components/Admin/GiftVoucher";
import AdminOrderDetail from "./components/Admin/AdminOrderDetail";
import EditProduct from "./components/Admin/EditProduct";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import {useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchShopManager } from "./redux/slices/shopManagerSlice";
import FullLoading from './components/Common/FullLoading'
function App() {
  const dispatch = useDispatch();
  const { shopManager } = useSelector((state) => state.shopManager);

  useEffect(() => {
    dispatch(fetchShopManager());
  }, [dispatch]);
  if(!shopManager){
    return <FullLoading />
  }
  return (
        <>
        <title>{shopManager.name}</title>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="profile" element={<Profile />} />
              <Route path="my-vouchers" element={<UserVouchers />} />
              <Route path="collections/:collection" element={<CollectionsPage />} />
              <Route path="product/:id" element={<ProductsDetails />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-confirmation" element={<OrderConfirmation />} />
              <Route path="order/:id" element={<OrderDetails />} />
            </Route>
            <Route
              path="/admin"
              element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}
            >
              <Route index element={<AdminHome />} />
              <Route path="users" element={<UserManager />} />
              <Route path="orders" element={<OrderManager />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="products" element={<ProductManager />} />
              <Route path="vouchers" element={<VoucherManager />} />
              <Route path="vouchers/:id/gift" element={<GiftVoucher />} />
              <Route path="shop-manager" element={<ShopManager />} />
              <Route path="products/:id/edit" element={<EditProduct />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </>
  );
}

export default App;
