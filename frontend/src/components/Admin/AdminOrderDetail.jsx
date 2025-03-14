import React, { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loading from '../Common/Loading';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails } from '../../redux/slices/orderSlice';

const AdminOrderDetail = () => {
    const {id} = useParams();
    const dispatch = useDispatch()
    const { orderDetails, loading } = useSelector((state) => state.order);
  
    const calculateEstimatedDelivery = (paidAt) => {
      const orderDate = new Date(paidAt);
      orderDate.setDate(orderDate.getDate() + 10)
      return orderDate.toLocaleDateString()
    }  
  
    useEffect(() => {
      dispatch(fetchOrderDetails(id))
    }, [id, dispatch])
  
    if(loading){
      return <Loading />
    }
  return (
    <div className='flex flex-col h-full'>
        <h1 className='text-3xl font-bold mb-6'>Quản lý đơn hàng</h1>
        <div className="flex h-full shadow-md w-full p-4 gap-3 flex-col">
            <div className="flex justify-between mb-1">
                <p className='font-bold'>Mã đơn hàng: {orderDetails && orderDetails._id}</p>
            </div>
            <div className="flex justify-between mb-4">
                <p className='text-sm'>{orderDetails && new Date(orderDetails.paidAt).toLocaleDateString('vi-VN')}</p>
                <div className="">
                    <p className={`text-gray-700 text-sm ${orderDetails && orderDetails.paidAt===false ? 'block' : 'hidden'}`}>Dự kiến giao hàng: {calculateEstimatedDelivery(orderDetails && orderDetails.createdAt)}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-2 border border-gray-500 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Phương thức thanh toán</h4>
                    <p className="text-gray-600 mb-2">Ship COD</p>
                </div>
                <div className="p-2 border border-gray-500 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Địa chỉ</h4>
                    <p className="text-gray-600 mb-">{orderDetails && orderDetails.shippingAddress.address1}, {orderDetails && orderDetails.shippingAddress.address2}</p>
                    <p className='text-gray-600 mb-2'>{orderDetails && orderDetails.shippingAddress.address3}, {orderDetails && orderDetails.shippingAddress.city}</p>
                </div>
                <div className="p-2 border border-gray-500 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Thông tin người nhận</h4>
                    <p className="text-gray-600 mb-">{orderDetails && orderDetails.name}</p>
                    <p className='text-gray-600 mb-2'>{orderDetails && orderDetails.phone}</p>
                </div>
            </div>
            <div className="flex flex-col gap-3 mb-4">
                {orderDetails && orderDetails.orderItems.map((item)=> (
                    <div key={item.productId} className='flex items-center'>
                        <Link to={`/product/${item.productId}`}>
                            <img src={item.image} alt="" className='w-16 h-16 object-cover rounded-md mr-4'/>
                        </Link>
                        <div className="">
                            <Link to={`/product/${item.productId}`} className='text-md font-semibold underline text-blue-600'>{item.name}</Link>
                            <p className='text-sm text-gray-500'>
                                {item.author}
                            </p>
                        </div>
                        <div className="ml-auto text-right">
                            <p className='text-sm'>{item.price} vnđ | Số lượng: {item.quantity}</p>
                            <p className='font-bold'>Tổng: {item.price * item.quantity} vnđ</p>
                        </div>
                    </div>   
                ))}
            </div>
            <div className="w-fit">
                <Link to='/admin/orders' className='bg-gray-700 text-white px-2 py-1 rounded-xl text-sm hover:bg-gray-600 transition-all duration-300'>Quay lại</Link>
            </div>
        </div>
    </div>
  )
}

export default AdminOrderDetail