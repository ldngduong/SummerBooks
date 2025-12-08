import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import Loading from '../Common/Loading'

const GiftVoucher = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [voucher, setVoucher] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    gift_type: 'individual', // 'individual', 'new_users', 'order_count'
    user_ids: [],
    order_count: 1
  })

  useEffect(() => {
    fetchVoucher()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (formData.gift_type === 'individual' && searchTerm) {
      searchUsers()
    } else if (formData.gift_type === 'individual') {
      fetchUsers()
    }
  }, [searchTerm, formData.gift_type])

  const fetchVoucher = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/vouchers/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      )
      setVoucher(response.data)
    } catch (error) {
      toast.error('Không thể tải thông tin voucher')
      navigate('/admin/vouchers')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      )
      setUsers(response.data)
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng')
    }
  }

  const searchUsers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users?search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      )
      setUsers(response.data)
    } catch (error) {
      console.error('Search users error:', error)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (name === 'gift_type') {
      setFormData(prev => ({
        ...prev,
        gift_type: value,
        user_ids: [],
        order_count: 1
      }))
    }
  }

  const handleUserSelect = (userId) => {
    setFormData(prev => {
      const userIds = prev.user_ids.includes(userId)
        ? prev.user_ids.filter(id => id !== userId)
        : [...prev.user_ids, userId]
      return { ...prev, user_ids: userIds }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.gift_type === 'individual' && formData.user_ids.length === 0) {
      return toast.error('Vui lòng chọn ít nhất một người dùng')
    }

    if (formData.gift_type === 'order_count' && (!formData.order_count || formData.order_count < 1)) {
      return toast.error('Vui lòng nhập số đơn hàng hợp lệ')
    }

    setSubmitting(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user-vouchers/gift`,
        {
          voucher_id: id,
          gift_type: formData.gift_type,
          user_ids: formData.gift_type === 'individual' ? formData.user_ids : undefined,
          order_count: formData.gift_type === 'order_count' ? formData.order_count : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      )
      
      toast.success(response.data.message || 'Tặng voucher thành công')
      navigate('/admin/vouchers')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Tặng voucher không thành công')
    } finally {
      setSubmitting(false)
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

  if (loading) {
    return <Loading />
  }

  if (!voucher) {
    return null
  }

  return (
    <div className='flex flex-col h-full relative'>
      <div className='flex items-center gap-4 mb-6'>
        <button 
          onClick={() => navigate('/admin/vouchers')}
          className='text-blue-600 hover:text-blue-800'
        >
          ← Quay lại
        </button>
        <h1 className='text-3xl font-bold'>Tặng voucher</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Thông tin voucher */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className='text-xl font-semibold mb-4'>Thông tin voucher</h2>
            <div className="space-y-3">
              <div>
                <label className='text-sm text-gray-600'>Mã voucher:</label>
                <p className='font-mono font-semibold text-lg'>{voucher.code}</p>
              </div>
              <div>
                <label className='text-sm text-gray-600'>Giá trị giảm:</label>
                <p className='font-semibold'>{voucher.value}%</p>
              </div>
              <div>
                <label className='text-sm text-gray-600'>Giảm tối đa:</label>
                <p className='text-sm'>{formatCurrency(voucher.max_discount_amount)}</p>
              </div>
              <div>
                <label className='text-sm text-gray-600'>Đơn tối thiểu:</label>
                <p className='text-sm'>{formatCurrency(voucher.min_order_value)}</p>
              </div>
              <div>
                <label className='text-sm text-gray-600'>Ngày bắt đầu:</label>
                <p className='text-sm'>{formatDate(voucher.start_date)}</p>
              </div>
              <div>
                <label className='text-sm text-gray-600'>Ngày kết thúc:</label>
                <p className='text-sm'>{formatDate(voucher.end_date)}</p>
              </div>
              <div>
                <label className='text-sm text-gray-600'>Giới hạn sử dụng:</label>
                <p className='text-sm'>{voucher.limit}</p>
              </div>
              <div>
                <label className='text-sm text-gray-600'>Trạng thái:</label>
                <p className='text-sm'>
                  <span className={`px-2 py-1 rounded ${
                    voucher.status === 'active' ? 'bg-green-100 text-green-800' :
                    voucher.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {voucher.status === 'active' ? 'Active' : 
                     voucher.status === 'inactive' ? 'Inactive' : 'Expired'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form tặng voucher */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className='text-xl font-semibold mb-4'>Chọn đối tượng tặng voucher</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className='text-sm text-gray-600 block mb-2 font-semibold'>
                  Tặng cho:
                </label>
                <select
                  name='gift_type'
                  value={formData.gift_type}
                  onChange={handleFormChange}
                  className='border-gray-600 border w-full p-2 rounded-lg'
                  required
                >
                  <option value="individual">Người dùng cụ thể</option>
                  <option value="new_users">Nhóm người dùng mới (tạo tài khoản &lt; 15 ngày)</option>
                  <option value="order_count">Nhóm người dùng đã mua số đơn hàng</option>
                </select>
              </div>

              {/* Người dùng cụ thể */}
              {formData.gift_type === 'individual' && (
                <div className="mb-6">
                  <label className='text-sm text-gray-600 block mb-2 font-semibold'>
                    Tìm kiếm người dùng:
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo tên hoặc email..."
                    className='border-gray-600 border w-full p-2 rounded-lg mb-4'
                  />
                  
                  <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {users.length > 0 ? (
                      <div className="space-y-2">
                        {users.map((user) => (
                          <label
                            key={user._id}
                            className='flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer'
                          >
                            <input
                              type="checkbox"
                              checked={formData.user_ids.includes(user._id)}
                              onChange={() => handleUserSelect(user._id)}
                              className='w-4 h-4'
                            />
                            <div>
                              <p className='font-medium'>{user.name}</p>
                              <p className='text-sm text-gray-500'>{user.email}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className='text-gray-500 text-center py-4'>Không tìm thấy người dùng</p>
                    )}
                  </div>
                  {formData.user_ids.length > 0 && (
                    <p className='text-sm text-green-600 mt-2'>
                      Đã chọn: {formData.user_ids.length} người dùng
                    </p>
                  )}
                </div>
              )}

              {/* Nhóm người dùng mới */}
              {formData.gift_type === 'new_users' && (
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className='text-sm text-blue-800'>
                      Voucher sẽ được tặng cho tất cả người dùng đã tạo tài khoản trong vòng 15 ngày gần nhất.
                    </p>
                  </div>
                </div>
              )}

              {/* Nhóm người dùng đã mua số đơn hàng */}
              {formData.gift_type === 'order_count' && (
                <div className="mb-6">
                  <label className='text-sm text-gray-600 block mb-2 font-semibold'>
                    Số đơn hàng tối thiểu:
                  </label>
                  <input
                    type="number"
                    name='order_count'
                    value={formData.order_count}
                    onChange={handleFormChange}
                    min="1"
                    className='border-gray-600 border w-full p-2 rounded-lg'
                    required
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Voucher sẽ được tặng cho tất cả người dùng đã mua từ {formData.order_count} đơn hàng trở lên.
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className='bg-blue-600 hover:bg-blue-500 disabled:bg-gray-400 transition-all duration-300 rounded-lg px-6 py-2 text-white cursor-pointer'
                >
                  {submitting ? 'Đang xử lý...' : 'Xác nhận tặng voucher'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/vouchers')}
                  className='bg-gray-600 hover:bg-gray-500 transition-all duration-300 rounded-lg px-6 py-2 text-white cursor-pointer'
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GiftVoucher

