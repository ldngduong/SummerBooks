import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import Loading from '../components/Common/Loading'

const UserVouchers = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [activeVouchers, setActiveVouchers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchVouchers()
  }, [user, navigate])

  const fetchVouchers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user-vouchers/my-vouchers`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      )
      setActiveVouchers(response.data.active || [])
    } catch (error) {
      toast.error('Không thể tải danh sách voucher')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'Không giới hạn'
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ'
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const currentVouchers = activeVouchers

  if (loading) {
    return <Loading />
  }

  return (
    <div className='min-h-screen container mx-auto p-4 md:p-6'>
      <div className='mb-6'>
        <button 
          onClick={() => navigate('/profile')}
          className='text-blue-600 hover:text-blue-800 mb-4'
        >
          ← Quay lại
        </button>
        <h1 className='text-3xl font-bold'>Voucher của tôi</h1>
      </div>

      <div className="mb-6">
        <h2 className='text-xl font-semibold'>Voucher còn hạn ({activeVouchers.length})</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {currentVouchers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {currentVouchers.map((userVoucher) => {
              const voucher = userVoucher.voucher
              if (!voucher) return null

              return (
                <div
                  key={userVoucher._id}
                  className="border-2 rounded-lg p-4 border-green-500 bg-green-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-mono font-bold text-xl text-blue-600">
                        {voucher.code}
                      </h3>
                      {userVoucher.used && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Đã sử dụng
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {voucher.value}%
                      </p>
                      <p className="text-xs text-gray-500">Giảm giá</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Giảm tối đa: </span>
                      <span className="font-semibold">
                        {formatCurrency(voucher.max_discount_amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Đơn tối thiểu: </span>
                      <span className="font-semibold">
                        {formatCurrency(voucher.min_order_value)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Hạn sử dụng: </span>
                      <span className="font-semibold">
                        {formatDate(voucher.end_date)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Số lượt còn lại: </span>
                      <span className="font-semibold">
                        {voucher.remain || 0}
                      </span>
                    </div>
                    {userVoucher.used && userVoucher.used_at && (
                      <div>
                        <span className="text-gray-600">Đã dùng: </span>
                        <span className="font-semibold">
                          {formatDate(userVoucher.used_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">
              Bạn chưa có voucher còn hạn nào
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserVouchers

