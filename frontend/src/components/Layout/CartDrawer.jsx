import React from 'react'
import { IoMdClose } from 'react-icons/io';
import CartContents from '../Cart/CartContents';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

const CartDrawer = ({drawerOpen, toggleCartDrawer}) => {
  const navigate = useNavigate();
  const {user, guestId} = useSelector((state) => state.auth)
  const {cart} = useSelector((state) => state.cart)
  const userId = user ? user._id : null;
  const handleCheckout = () => {
    // Kiểm tra giỏ hàng trống
    if (!cart || !cart.products || cart.products.length === 0) {
      toast.error('Giỏ hàng phải có ít nhất 1 sản phẩm để đặt hàng')
      toggleCartDrawer()
      setTimeout(() => {
        navigate('/')
      }, 1500)
      return
    }
    
    toggleCartDrawer()
    if (!user){
      navigate('/login?redirect=checkout')
    }
    else{
      navigate('/checkout')

    }
  }

  return (
    <div className={`fixed top-0 right-0 w-full sm:w-1/2 md:w-[30rem] h-full
                 bg-white shadow-lg transform transition-transform duration-300 flex flex-col z-50
                   ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
        <div className="flex justify-end p-4">
            <button onClick={toggleCartDrawer}>
                <IoMdClose className='h-6 w-6 text-gray-600 cursor-pointer'/>
            </button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
            <h2 className='text-xl font-semibold mb-4'>Giỏ hàng</h2>
            {cart && cart?.products?.length > 0 ? <CartContents cart = {cart} userId = {userId} guestId = {guestId} /> : (<p>Giỏ hàng trống</p>)}
        </div>
        <div className="p-4 bg-white sticky bottom-0">
            <button 
              onClick={handleCheckout}
              className='w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition duration-300 cursor-pointer'
            >
            Mua ngay
            </button>
            {cart && cart?.products?.length > 0 && (
              <p className='text-xs text-gray-600 mt-2 text-center'>Phí vận chuyển và mã giảm giá sẽ được tính khi thanh toán.</p>
            )}
        </div>
    </div>
  )
}

export default CartDrawer

// truyền những thuộc tính xuất hiện trong return từ parent sang child. 
// chỉ cần truyền state và toggleFunction sang vì state được quản lý bởi setState bên parent
// parent sẽ quản lý toggleState của child