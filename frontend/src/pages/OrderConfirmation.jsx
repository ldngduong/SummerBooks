import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../redux/slices/cartSlice';
import Loading from '../components/Common/Loading';

const OrderConfirmation = () => {
  const dispatch = useDispatch()
  const {checkout, loading} = useSelector((state) => state.cart)

  const navigate = useNavigate()

  useEffect(() => {
    // Chỉ xử lý khi không còn loading
    if (!loading) {
      if(checkout && checkout._id){
          dispatch(clearCart())
          localStorage.removeItem('cart')
      } else if(checkout === null) {
          // Chỉ redirect nếu checkout là null (không phải đang loading)
          navigate('/profile')
      }
    }
  }, [checkout, loading, dispatch, navigate])
  
  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
    orderDate.setDate(orderDate.getDate() + 10)
    return orderDate.toLocaleDateString()
  }  

  if(loading){
    return <Loading />
  }
     
  return (
    <div className='max-w-4xl mx-auto p-6 bg-white'>
        <h1 className='text-4xl font-bold text-center text-gray-700 mb-8'>Cảm ơn bạn vì đã mua hàng</h1>
        {checkout && (
        <div className='p-6 rounded-lg border'>
            <div className="flex flex-col md:flex-row justify-between mb-10">
                <div className="">
                    <h2 className='text-xl font-semibold'>Mã đơn hàng: {checkout._id}</h2>
                    <p className='text-gray-500'>Thời gian: {new Date(checkout.paidAt).toLocaleDateString()}</p>
                </div>
                <div className="">
                    <p className='text-gray-700 text-sm'>Dự kiến giao hàng: {calculateEstimatedDelivery(checkout.paidAt)}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-2 border border-gray-500 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Phương thức thanh toán</h4>
                    <p className="text-gray-600 mb-2">Ship COD</p>
                </div>
                <div className="p-2 border border-gray-500 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Địa chỉ</h4>
                    <p className="text-gray-600 mb-2">{checkout.address || (checkout.shippingAddress && `${checkout.shippingAddress.address1}, ${checkout.shippingAddress.address2}, ${checkout.shippingAddress.address3}, ${checkout.shippingAddress.city}`)}</p>
                </div>
                <div className="p-2 border border-gray-500 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Thông tin người nhận</h4>
                    <p className="text-gray-600 mb-2">{checkout.name || `${checkout.firstName || ''} ${checkout.lastName || ''}`.trim()}</p>
                    <p className='text-gray-600 mb-2'>{checkout.phone}</p>
                </div>
            </div>
            <div className="flex flex-col gap-3">
                {checkout.orderItems.map((item)=> (
                    <div key={item.productId} className='flex gap-1 items-center'>
                        <img src={item.image} alt="" className='w-16 h-16 object-cover rounded-md mr-4'/>
                        <div className="">
                            <h4 className='text-md font-semibold'>{item.name}</h4>
                            <p className='text-sm text-gray-500'>
                                {item.author}
                            </p>
                        </div>
                        <div className="ml-auto text-right">
                            <p className='text-md'>{item.price} vnđ</p>
                            <p className='text-sm text-gray-500'>Số lượng: {item.quantity}</p>
                        </div>
                    </div>   
                ))}
            </div>
            
        </div>
        )}
    </div>
  )
}

export default OrderConfirmation