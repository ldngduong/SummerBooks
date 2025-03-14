import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails } from '../redux/slices/orderSlice';
import Loading from '../components/Common/Loading';

const OrderDetails = () => {
  const {id} = useParams();
  const dispatch = useDispatch()
  const { orderDetails, loading } = useSelector((state) => state.order);

  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
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
    <div className='max-w-7xl mx-auto p-4 sm:p-6'>
        <h2 className='text-2xl md:text-3xl font-bold mb-6'>Chi tiết đơn hàng</h2>
        <div className="w-full rounded-lg border border-gray-600 p-4">
            <div className="flex flex-col justify-between mb-1">
                <p className='font-bold'>Mã đơn hàng: {orderDetails && orderDetails._id}</p>
                <div className="w-fit">
                <p className={`text-sm font-medium px-1 py-0.5 rounded-lg ${orderDetails && orderDetails.status === 'Đã giao' ? 'bg-emerald-200 text-emerald-900' : orderDetails && orderDetails.status === 'Đang giao' ? 'bg-blue-300 text-blue-900' : orderDetails && orderDetails.status === 'Chờ duyệt' ? 'bg-amber-300 text-amber-900' : 'bg-red-300 text-red-900' }`}>{orderDetails && orderDetails.status}</p>
                </div>
            </div>
            <div className="flex justify-between mb-4">
                <p className='text-sm'>{orderDetails && new Date(orderDetails.paidAt).toLocaleDateString()}</p>
                <div className="">
                    <p className={`text-gray-700 text-sm ${orderDetails && orderDetails.isDelivered===false ? 'block' : 'hidden'}`}>Dự kiến giao hàng: {calculateEstimatedDelivery(orderDetails && orderDetails.paidAt)}</p>
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
                    <p className="text-gray-600 mb-">{orderDetails && orderDetails.name} {orderDetails && orderDetails.lastName}</p>
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
                            <Link to={`/product/${item.productId}`} className='text-md font-semibold text-blue-700'>{item.name}</Link>
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
            <Link to='/profile' className='bg-gray-700 text-white px-2 py-1 rounded-xl text-sm hover:bg-gray-600 transition-all duration-300'>Quay lại</Link>
        </div>
    </div>
  )
}

export default OrderDetails