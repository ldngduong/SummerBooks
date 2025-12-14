import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails } from '../redux/slices/orderSlice';
import { fetchOrderReviews } from '../redux/slices/reviewSlice';
import Loading from '../components/Common/Loading';
import ReviewForm from '../components/Review/ReviewForm';

const OrderDetails = () => {
  const {id} = useParams();
  const dispatch = useDispatch()
  const { orderDetails, loading } = useSelector((state) => state.order);
  const { reviews, loading: reviewsLoading } = useSelector((state) => state.review);
  const [showReviewForm, setShowReviewForm] = useState({});
  const [canReview, setCanReview] = useState(false);

  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
    orderDate.setDate(orderDate.getDate() + 10)
    return orderDate.toLocaleDateString()
  }  

  useEffect(() => {
    dispatch(fetchOrderDetails(id))
    dispatch(fetchOrderReviews(id))
  }, [id, dispatch])

  useEffect(() => {
    // Check if order can be reviewed
    if (orderDetails) {
      const isDelivered = orderDetails.status === 'Đã giao'
      
      if (isDelivered) {
        // If delivered but no deliveredAt, assume it was delivered now
        const deliveryDate = orderDetails.deliveredAt 
          ? new Date(orderDetails.deliveredAt) 
          : new Date(orderDetails.paidAt || Date.now())
        
        const expiryDate = new Date(deliveryDate)
        expiryDate.setDate(expiryDate.getDate() + 14)
        
        setCanReview(new Date() <= expiryDate)
      } else {
        setCanReview(false)
      }
    }
  }, [orderDetails])

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
                    <p className="text-gray-600 mb-2">{orderDetails && orderDetails.address}</p>
                </div>
                <div className="p-2 border border-gray-500 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Thông tin người nhận</h4>
                    <p className="text-gray-600 mb-">{orderDetails && orderDetails.name}</p>
                    <p className='text-gray-600 mb-2'>{orderDetails && orderDetails.phone}</p>
                </div>
            </div>
            <div className="flex flex-col gap-3 mb-4">
                {orderDetails && orderDetails.orderItems.map((item)=> {
                    const existingReview = reviews?.find(
                        r => r.productId.toString() === item.productId.toString()
                    )
                    const isShowingForm = showReviewForm[item.productId]
                    
                    return (
                        <div key={item.productId}>
                            <div className='flex items-center mb-2'>
                                <Link to={`/product/${item.productId}`}>
                                    <img src={item.image} alt="" className='w-16 h-16 object-cover rounded-md mr-4'/>
                                </Link>
                                <div className="flex-1">
                                    <Link to={`/product/${item.productId}`} className='text-md font-semibold text-blue-700'>{item.name}</Link>
                                    <p className='text-sm text-gray-500'>
                                        {item.author}
                                    </p>
                                </div>
                                <div className="ml-auto text-right mr-4">
                                    <p className='text-sm'>{item.price} vnđ | Số lượng: {item.quantity}</p>
                                    <p className='font-bold'>Tổng: {item.price * item.quantity} vnđ</p>
                                </div>
                                {canReview && !existingReview && !isShowingForm && (
                                    <button
                                        onClick={() => setShowReviewForm({ ...showReviewForm, [item.productId]: true })}
                                        className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm'
                                    >
                                        Đánh giá
                                    </button>
                                )}
                                {existingReview && (
                                    <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
                                        Đã đánh giá ({existingReview.rating}/10)
                                    </div>
                                )}
                            </div>
                            {isShowingForm && (
                                <ReviewForm
                                    orderId={id}
                                    productId={item.productId}
                                    productName={item.name}
                                    productImage={item.image}
                                    onSuccess={() => {
                                        setShowReviewForm({ ...showReviewForm, [item.productId]: false })
                                        dispatch(fetchOrderReviews(id))
                                    }}
                                    onCancel={() => {
                                        setShowReviewForm({ ...showReviewForm, [item.productId]: false })
                                    }}
                                />
                            )}
                            {existingReview && (
                                <div className="ml-20 mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                                    <div className="flex items-center mb-2">
                                        <span className="font-semibold text-gray-700 mr-2">Điểm: {existingReview.rating}/10</span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(existingReview.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {existingReview.comment && (
                                        <p className="text-gray-700 mb-2">{existingReview.comment}</p>
                                    )}
                                    {existingReview.images && existingReview.images.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {existingReview.images.map((image, idx) => (
                                                <img
                                                    key={idx}
                                                    src={image}
                                                    alt={`Review ${idx + 1}`}
                                                    className="w-20 h-20 object-cover rounded border border-gray-300"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
            <Link to='/profile' className='bg-gray-700 text-white px-2 py-1 rounded-xl text-sm hover:bg-gray-600 transition-all duration-300'>Quay lại</Link>
        </div>
    </div>
  )
}

export default OrderDetails