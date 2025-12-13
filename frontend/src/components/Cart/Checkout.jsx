import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import Loading from '../Common/Loading'
import { checkout, fetchCart } from '../../redux/slices/cartSlice';

const Checkout = () => {
  const [load, setLoad] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {cart, loading, error} = useSelector((state) => state.cart)
  const {user} = useSelector((state) => state.auth)
  const [usableVouchers, setUsableVouchers] = useState([])
  const [selectedVoucher, setSelectedVoucher] = useState(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [finalPrice, setFinalPrice] = useState(0)

  useEffect(() => {
    if(!user|| !cart || !cart.products || cart.products.length === 0){
        navigate('/')
    }
  }, [cart, navigate])

  useEffect(() => {
    if (user && cart && cart.totalPrice) {
      fetchUsableVouchers()
    }
  }, [user, cart?.totalPrice])

  useEffect(() => {
    if (cart && cart.totalPrice) {
      calculatePrice()
    }
  }, [selectedVoucher, cart?.totalPrice])

  const fetchUsableVouchers = async () => {
    try {
      // Đảm bảo totalPrice là số (loại bỏ dấu phẩy nếu có)
      const totalPrice = typeof cart.totalPrice === 'string' 
        ? parseFloat(cart.totalPrice.replace(/,/g, '')) 
        : parseFloat(cart.totalPrice) || 0;
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user-vouchers/usable?totalPrice=${totalPrice}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      )
      setUsableVouchers(response.data.vouchers || [])
    } catch (error) {
      console.error('Fetch usable vouchers error:', error)
    }
  }

  const calculatePrice = () => {
    if (!cart || !cart.totalPrice) return

    const originalPrice = parseFloat(cart.totalPrice) || 0
    let discount = 0

    if (selectedVoucher && selectedVoucher.voucher) {
      const voucher = selectedVoucher.voucher
      const discountPercent = voucher.value / 100
      discount = originalPrice * discountPercent

      // Áp dụng giới hạn giảm tối đa nếu có
      if (voucher.max_discount_amount && discount > voucher.max_discount_amount) {
        discount = voucher.max_discount_amount
      }
    }

    setDiscountAmount(discount)
    setFinalPrice(Math.max(0, originalPrice - discount))
  }

  const handleVoucherChange = (e) => {
    const voucherId = e.target.value
    if (voucherId === '') {
      setSelectedVoucher(null)
    } else {
      const voucher = usableVouchers.find(v => v._id === voucherId)
      setSelectedVoucher(voucher)
    }
  }

  const handleCreateOrder = async (e) => {
    e.preventDefault()
    setLoad(true)
    try {
        // Gửi originalPrice (cart.totalPrice) để backend tính lại discount chính xác
        const originalPrice = typeof cart.totalPrice === 'string' 
          ? parseFloat(cart.totalPrice.replace(/,/g, '')) 
          : parseFloat(cart.totalPrice) || 0;
        
        const result = await dispatch(checkout({
          user: user._id, 
          orderItems: cart.products, 
          address, 
          totalPrice: originalPrice, 
          name: firstName + " " + lastName, 
          phone,
          userVoucherId: selectedVoucher?._id || null
        })).unwrap()
        
        // Nếu checkout thành công, navigate đến trang xác nhận
        if (result && result._id) {
          navigate('/order-confirmation')
        }
    } catch (error) {
        console.log('Checkout error:', error)
        const errorMessage = error?.message || error?.error?.message || 'Đặt hàng không thành công'
        toast.error(errorMessage)
        
        // Nếu có sản phẩm bị xóa, refresh lại giỏ hàng
        if (error?.removedProducts || errorMessage.includes('không còn tồn tại')) {
          if (user?._id) {
            dispatch(fetchCart(user._id))
          }
        }
    } finally {
        setLoad(false)
    }
  }

  const [address, setAddress] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState(0)

  
  if(loading){
    return <Loading />
  }
  if(!cart || !cart.products || cart.products.length === 0){
    return <p>Giỏ hàng trống</p>
  }

  return (
    <div className='flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6'>
        <div className="bg-white rounded-lg p-1">
            <h2 className='text-2xl uppercase mb-6'>Đặt hàng</h2>
            <form onSubmit={handleCreateOrder} className=''>
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
                            value={firstName} 
                            className='w-full p-2 border rounded'
                            required
                        />
                    </div>
                    <div className="">
                        <label htmlFor="" className='block text-gray-700'>Tên</label>
                        <input 
                            type="text" 
                            onChange={(e) => setLastName(e.target.value)} 
                            value={lastName} 
                            className='w-full p-2 border rounded'
                            required
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="" className='block text-gray-700'>SĐT</label>
                    <input
                        type="number" 
                        value={phone} 
                        className='w-full p-2 border rounded'
                        onChange={(e) => setPhone(e.target.value)} 
                        required
                    />
                </div>
                <h3 className='text-lg mb-4'>Địa chỉ</h3>
                <div className="mb-4">
                    <label htmlFor="" className='block text-gray-700'>Địa chỉ giao hàng</label>
                    <textarea 
                        onChange={(e) => setAddress(e.target.value)} 
                        value={address} 
                        className='w-full p-2 border rounded'
                        rows="3"
                        placeholder="Nhập địa chỉ đầy đủ (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                        required
                    />
                </div>
                <h3 className='text-lg mb-4 mt-6'>Voucher</h3>
                <div className="mb-4">
                    <label htmlFor="voucher" className='block text-gray-700 mb-2'>Chọn voucher (nếu có)</label>
                    <select
                        id="voucher"
                        value={selectedVoucher?._id || ''}
                        onChange={handleVoucherChange}
                        className='w-full p-2 border rounded'
                    >
                        <option value="">Không sử dụng voucher</option>
                        {usableVouchers.map((uv) => (
                            <option key={uv._id} value={uv._id}>
                                {uv.voucher.code} - Giảm {uv.voucher.value}%
                                {uv.voucher.max_discount_amount && ` (Tối đa ${new Intl.NumberFormat('vi-VN').format(uv.voucher.max_discount_amount)} đ)`}
                            </option>
                        ))}
                    </select>
                    {selectedVoucher && (
                        <p className='text-sm text-green-600 mt-2'>
                            Đã chọn: {selectedVoucher.voucher.code} - Giảm {selectedVoucher.voucher.value}%
                        </p>
                    )}
                </div>
                {load ? (<Loading />) : (<button className='bg-amber-600 text-white hover:bg-amber-700 border-none transition-all duration-300 w-full px-4 py-2 cursor-pointer rounded-lg'>Đặt hàng</button>)}
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
                <p className=''>{new Intl.NumberFormat('vi-VN').format(cart.totalPrice)} đ</p>
            </div>
            {selectedVoucher && discountAmount > 0 && (
                <div className="flex justify-between items-center text-lg mb-4 text-green-600">
                    <p>Giảm giá ({selectedVoucher.voucher.code})</p>
                    <p className='font-semibold'>-{new Intl.NumberFormat('vi-VN').format(discountAmount)} đ</p>
                </div>
            )}
            <div className="flex justify-between items-center text-lg pb-4 border-b border-gray-300">
                <p>Phí vận chuyển</p>
                <p className=''>Miễn phí</p>
            </div>
            <div className="flex justify-between items-center text-lg mt-4">
                <p>Thành tiền</p>
                <p className='font-bold text-orange-600'>
                    {new Intl.NumberFormat('vi-VN').format(finalPrice || cart.totalPrice)} đ
                </p>
            </div>
        </div>
    </div>
  )
}

export default Checkout