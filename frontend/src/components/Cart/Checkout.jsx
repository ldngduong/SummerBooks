import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCcPaypal } from "react-icons/fa";
import PaypalButton from './PaypalButton';
import {useDispatch, useSelector} from 'react-redux'
import { createCheckout } from '../../redux/slices/checkoutSlice';
import Loading from '../Common/Loading'
import axios from 'axios';
const Checkout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [checkoutID, setCheckoutID] = useState(null)
  const {cart, loading, error} = useSelector((state) => state.cart)
  const {user} = useSelector((state) => state.auth)

  useEffect(() => {
    if(!user|| !cart || !cart.products || cart.products.length === 0){
        navigate('/')
    }
  }, [cart, navigate])
  

  const handleCreateCheckout = async (e) => {
    e.preventDefault()
    if (cart && cart.products.length > 0){
        const res = await dispatch(createCheckout({
            checkoutItems: cart.products,
            shippingAddress,
            paymentMethod: 'Ship COD',
            totalPrice: cart.totalPrice,
            name: firstName + ' ' + lastName,
            phone: phone
        }))
        setCheckoutID(res.payload._id)
        handlePaymentSuccess(res.payload._id)
    }
  }

  const [shippingAddress, setShippingAddress] = useState({
    address1: '',
    address2: '',
    address3: '',
    city: '',
  })

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState(0)

  const handlePaymentSuccess = async (id) => {
    try {
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/checkout/${id}/pay`, 
            {paymentStatus: 'Đã thanh toán'}, 
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('userToken')}`
            }
        })
        await handleFinalizeCheckout(id)
    } catch (error) {
        console.log(error)
    }
    navigate('/order-confirmation')
  }

  const handleFinalizeCheckout = async (checkoutId) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/finalize`, 
            {}, 
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('userToken')}`
            }
        })
        console.log(`finalized checkout ${checkoutID}`)
        navigate('/order-confirmation')
    } catch (error) {
        console.log(error)
    }
  }
  if(loading){
    return <Loading />
  }
  if(!cart || !cart.products || cart.products.length === 0){
    return <p>Giỏ hàng trống</p>
  }

  return (
    <div className='flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6'>
        <div className="bg-white rounded-lg p-1">
            <h2 className='text-2xl uppercase mb-6'>Thanh toán</h2>
            <form onSubmit={handleCreateCheckout} className=''>
                <h3 className='text-lg mb-4'>Thông tin</h3>
                <div className="mb-4">
                    <label htmlFor="" className='block text-gray-700'>Email</label>
                    <input type="email" value={user? user.email : ''} className='bg-gray-200 w-full p-2 border rounded' disabled/>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className="">
                        <label htmlFor="" className='block text-gray-700'>Họ</label>
                        <input 
                            type="text" 
                            onChange={(e) => setFirstName(e.target.value)} 
                            value={shippingAddress.firstName} 
                            className='w-full p-2 border rounded'
                            required
                        />
                    </div>
                    <div className="">
                        <label htmlFor="" className='block text-gray-700'>Tên</label>
                        <input 
                            type="text" 
                            onChange={(e) => setLastName(e.target.value)} 
                            value={shippingAddress.lastName} 
                            className='w-full p-2 border rounded'
                            required
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="" className='block text-gray-700'>SĐT</label>
                    <input
                        type="number" 
                        value={shippingAddress.phone} 
                        className='w-full p-2 border rounded'
                        onChange={(e) => setPhone(e.target.value)} 
                    />
                </div>
                <h3 className='text-lg mb-4'>Địa chỉ</h3>
                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className="">
                        <label htmlFor="" className='block text-gray-700'>Tên đường, số nhà</label>
                        <input 
                            type="text" 
                            onChange={(e) => setShippingAddress({...shippingAddress, address1: e.target.value})} 
                            value={shippingAddress.address1} 
                            className='w-full p-2 border rounded'
                            required
                        />
                    </div>
                    <div className="">
                        <label htmlFor="" className='block text-gray-700'>Phường/xã</label>
                        <input 
                            type="text" 
                            onChange={(e) => setShippingAddress({...shippingAddress, address2: e.target.value})} 
                            value={shippingAddress.address2} 
                            className='w-full p-2 border rounded'
                            required
                        />
                    </div>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className="">
                        <label htmlFor="" className='block text-gray-700'>Quận/Huyện</label>
                        <input 
                            type="text" 
                            onChange={(e) => setShippingAddress({...shippingAddress, address3: e.target.value})} 
                            value={shippingAddress.address3} 
                            className='w-full p-2 border rounded'
                            required
                        />
                    </div>
                    <div className="">
                        <label htmlFor="" className='block text-gray-700'>Tỉnh/Thành phố</label>
                        <input 
                            type="text" 
                            onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} 
                            value={shippingAddress.city} 
                            className='w-full p-2 border rounded'
                            required
                        />
                    </div>
                </div>
                    <button className='bg-amber-600 text-white hover:bg-amber-700 transition-all duration-300 w-full px-4 py-2 cursor-pointer rounded-lg'>Mua</button>
            </form>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className='text-lg mb-4'>Chi tiết hóa đơn</h3>
            <div className="border-t border-gray-300 mb-4">
                {cart.products.map((product, index) => (
                    <div key={index} className='flex items-start justify-between py-2 border-b border-gray-300'>
                        <div className="flex items-start">
                            <img src={product.image} className='w-20 h-24 object-cover mr-4' alt="" />
                            <div className="">
                                <h3 className='text-md'>{product.name}</h3>
                                <p className='text-gray-500'>{product.author}</p>
                            </div>
                        </div>
                        <div className="">
                            <p className='text-lg font-medium'>{product.price} vnđ</p>
                            <p className='text-md'>x {product.quantity}</p>
                            <p className='text-md'>Tổng: {product.price * product.quantity}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center text-lg mb-4">
                <p>Tổng</p>
                <p className=''>{cart.totalPrice}</p>
            </div>
            <div className="flex justify-between items-center text-lg pb-4 border-b border-gray-300">
                <p>Phí vận chuyển</p>
                <p className=''>Miễn phí</p>
            </div>
            <div className="flex justify-between items-center text-lg mt-4">
                <p>Thành tiền</p>
                <p className='font-bold'>{cart.totalPrice}</p>
            </div>
        </div>
    </div>
  )
}

export default Checkout