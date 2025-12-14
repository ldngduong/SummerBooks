import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { addVoucher, deleteVoucher, fetchVouchers, updateVoucher } from '../../redux/slices/adminVoucherSlice'
import Loading from '../Common/Loading'
import { toast } from 'sonner'

const VoucherManager = () => {
  const {activeVouchers, expiredVouchers, outOfStockVouchers, loading} = useSelector((state) => state.adminVoucher)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('active') // 'active', 'expired', or 'outOfStock'    

  useEffect(() => {
    dispatch(fetchVouchers())
  }, [dispatch])

  const [isShowForm, setIsShowForm] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  
  const handleToggleForm = () => {
    setIsShowForm(!isShowForm)
    if (isEditMode) {
      setIsEditMode(false)
      setEditingVoucher(null)
    }
  }
  
  const [formData, setFormData] = useState({
    code: '',
    value: 0,
    start_date: '',
    end_date: '',
    remain: 1,
    max_discount_amount: '',
    min_order_value: 0,
    status: 'active'
  })

  const [editFormData, setEditFormData] = useState({
    code: '',
    value: 0,
    start_date: '',
    end_date: '',
    remain: 1,
    max_discount_amount: '',
    min_order_value: 0,
    status: 'active'
  })

  const validateVoucherCode = (code) => {
    // Format: 4 chữ cái + 4 chữ số (ví dụ: ABCD1234)
    const codePattern = /^[A-Z]{4}[0-9]{4}$/
    return codePattern.test(code.toUpperCase())
  }

  const handleFormChange = (e) => {
    const value = e.target.name === 'code' ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) : e.target.value
    setFormData({...formData, [e.target.name]: value})
  }

  const handleEditFormChange = (e) => {
    const value = e.target.name === 'code' ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) : e.target.value
    setEditFormData({...editFormData, [e.target.name]: value})
  }

  const handleEdit = (voucher) => {
    setEditingVoucher(voucher)
    setIsEditMode(true)
    setIsShowForm(true)
    
    // Format date for datetime-local input
    const formatDateForInput = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }

    setEditFormData({
      code: voucher.code || '',
      value: voucher.value || 0,
      start_date: formatDateForInput(voucher.start_date),
      end_date: formatDateForInput(voucher.end_date),
      remain: voucher.remain || 1,
      max_discount_amount: voucher.max_discount_amount || '',
      min_order_value: voucher.min_order_value || 0,
      status: voucher.status || 'active'
    })
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditingVoucher(null)
    setIsShowForm(false)
    setEditFormData({
      code: '',
      value: 0,
      start_date: '',
      end_date: '',
      remain: 1,
      max_discount_amount: '',
      min_order_value: 0,
      status: 'active'
    })
  }

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    if(editFormData.code === '' || editFormData.value === 0 || editFormData.start_date === '' || editFormData.end_date === ''){
        return toast.error('Vui lòng nhập đầy đủ thông tin');
    }
    if(!validateVoucherCode(editFormData.code)){
      return toast.error('Mã voucher phải có định dạng: 4 chữ cái và 4 chữ số (VD: ABCD1234)');
    }
    if(editFormData.value < 1 || editFormData.value > 100){
      return toast.error('Giá trị giảm giá phải từ 1% đến 100%');
    }
    if(new Date(editFormData.start_date) >= new Date(editFormData.end_date)){
      return toast.error('Ngày kết thúc phải sau ngày bắt đầu');
    }
    if(editFormData.remain < 0 || editFormData.remain > 100){
      return toast.error('Số lượt còn lại phải từ 0 đến 100');
    }
    try{
      const voucherData = {
        ...editFormData,
        start_date: new Date(editFormData.start_date).toISOString(),
        end_date: new Date(editFormData.end_date).toISOString(),
        max_discount_amount: editFormData.max_discount_amount === '' ? null : Number(editFormData.max_discount_amount),
        min_order_value: Number(editFormData.min_order_value) || 0,
      }
      await dispatch(updateVoucher({id: editingVoucher._id, ...voucherData})).unwrap()
      toast.success('Cập nhật voucher thành công')
      handleCancelEdit()
    } catch (error) {
      const errorMessage = Array.isArray(error) ? error.join(', ') : (error || 'Cập nhật voucher không thành công')
      toast.error(errorMessage)
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if(formData.code === '' || formData.value === 0 || formData.start_date === '' || formData.end_date === ''){
        return toast.error('Vui lòng nhập đầy đủ thông tin');
    }
    if(!validateVoucherCode(formData.code)){
      return toast.error('Mã voucher phải có định dạng: 4 chữ cái và 4 chữ số (VD: ABCD1234)');
    }
    if(formData.value < 1 || formData.value > 100){
      return toast.error('Giá trị giảm giá phải từ 1% đến 100%');
    }
    if(new Date(formData.start_date) >= new Date(formData.end_date)){
      return toast.error('Ngày kết thúc phải sau ngày bắt đầu');
    }
    if(formData.remain < 0 || formData.remain > 100){
      return toast.error('Số lượt còn lại phải từ 0 đến 100');
    }
    try{
      const voucherData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        max_discount_amount: formData.max_discount_amount === '' ? null : Number(formData.max_discount_amount),
        min_order_value: Number(formData.min_order_value) || 0,
      }
      await dispatch(addVoucher(voucherData)).unwrap()
      toast.success('Thêm voucher thành công')
      setFormData({
        code: '',
        value: 0,
        start_date: '',
        end_date: '',
        remain: 1,
        max_discount_amount: '',
        min_order_value: 0,
        status: 'active'
      })
      setIsShowForm(false)
    } catch (error) {
      const errorMessage = Array.isArray(error) ? error.join(', ') : (error || 'Thêm voucher không thành công')
      toast.error(errorMessage)
    }
  }

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa voucher này?");
    if (isConfirmed) {
      try {
        await dispatch(deleteVoucher({id})).unwrap()
        toast.success('Xóa voucher thành công.')
      } catch (error) {
        toast.error(error || 'Xóa voucher không thành công')
      }
    }
  }

  const handleStatusChange = (id, e) => {
    dispatch(updateVoucher({id, status: e.target.value}))
    toast.success('Cập nhật trạng thái thành công')
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

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'Không giới hạn'
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ'
  }

  // Get current vouchers based on active tab
  const currentVouchers = activeTab === 'active' 
    ? activeVouchers 
    : activeTab === 'expired' 
    ? expiredVouchers 
    : outOfStockVouchers

  if(loading){
    return <Loading />
  }

  return (
    <div className='flex flex-col h-full relative'>
        <h1 className='text-3xl font-bold mb-6'>Quản lý voucher</h1>
        <div className="flex h-full shadow-md w-full p-4 gap-3 flex-col-reverse lg:flex-row">
            <div className="w-full lg:w-2/3">
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            activeTab === 'active'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Voucher còn hạn ({activeVouchers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('expired')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            activeTab === 'expired'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Voucher hết hạn ({expiredVouchers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('outOfStock')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            activeTab === 'outOfStock'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Hết lượt sử dụng ({outOfStockVouchers.length})
                    </button>
                </div>
                <h2 className='mb-4 font-semibold text-lg'>
                    {activeTab === 'active' 
                        ? 'Danh sách voucher còn hạn' 
                        : activeTab === 'expired'
                        ? 'Danh sách voucher hết hạn sử dụng'
                        : 'Danh sách voucher hết lượt sử dụng'}
                </h2>
                <div className="w-full rounded-lg overflow-auto shadow-md">
                    <table className="w-full border-separate border-spacing-0">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 first:rounded-tl-lg">Mã voucher</th>
                                <th className="px-4 py-2">Giá trị giảm</th>
                                <th className="px-4 py-2">Giảm tối đa</th>
                                <th className="px-4 py-2">Đơn tối thiểu</th>
                                <th className="px-4 py-2">Ngày bắt đầu</th>
                                <th className="px-4 py-2">Ngày kết thúc</th>
                                <th className="px-4 py-2">Số lượt còn lại</th>
                                <th className="px-4 py-2">Trạng thái</th>
                                <th className="px-4 py-2 last:rounded-tr-lg">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentVouchers && currentVouchers.length > 0 ? (currentVouchers.map((voucher)=> (
                                <tr key={voucher._id} className='hover:bg-gray-100 transition-all duration-300'>
                                    <th className='px-4 py-3 font-mono font-semibold'>{voucher.code}</th>
                                    <th className='px-4 py-3'>{voucher.value}%</th>
                                    <th className='px-4 py-3 text-sm'>{formatCurrency(voucher.max_discount_amount)}</th>
                                    <th className='px-4 py-3 text-sm'>{formatCurrency(voucher.min_order_value)}</th>
                                    <th className='px-4 py-3'>{formatDate(voucher.start_date)}</th>
                                    <th className='px-4 py-3'>{formatDate(voucher.end_date)}</th>
                                    <th className='px-4 py-3'>{voucher.remain}</th>
                                    <th className='px-4 py-3'>
                                        <select 
                                            value={voucher.status} 
                                            onChange={(e) => {handleStatusChange(voucher._id, e)}} 
                                            className='px-2 py-1 rounded-md border border-gray-500' 
                                            name="status" 
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </th>
                                    <th className='px-4 py-3'>
                                        <div className='flex gap-2 flex-wrap'>
                                            {activeTab === 'active' && (
                                                <button 
                                                    onClick={() => navigate(`/admin/vouchers/${voucher._id}/gift`)} 
                                                    disabled={voucher.status === 'inactive'}
                                                    className={`transition-all duration-200 cursor-pointer px-2 py-1 rounded ${
                                                        voucher.status === 'inactive'
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                            : 'bg-green-500 text-white hover:bg-green-600'
                                                    }`}
                                                >
                                                    Tặng voucher
                                                </button>
                                            )}
                                            {activeTab === 'active' && (
                                                <span className='text-gray-300'>|</span>
                                            )}
                                            {activeTab !== 'expired' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleEdit(voucher)} 
                                                        className='text-blue-600 hover:text-blue-800 transition-all duration-200 cursor-pointer'
                                                    >
                                                        Sửa
                                                    </button>
                                                    <span className='text-gray-300'>|</span>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(voucher._id)} 
                                                className='text-red-400 hover:text-red-600 transition-all duration-200 cursor-pointer'
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </th>
                                </tr>
                            ))) : (
                                <tr>                            
                                    <th colSpan={9} className='px-4 py-3'>Không có voucher.</th>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="w-full lg:w-1/3 h-fit font-semibold relative">
                <h2 className='hidden lg:block mb-4 font-semibold text-lg'>{isEditMode ? 'Sửa voucher' : 'Thêm voucher'}</h2>
                <button onClick={handleToggleForm} className='cursor-pointer mb-2 inline-block lg:hidden bg-gray-600 text-white rounded-lg px-4 py-2'>{isShowForm ? 'Đóng' : (isEditMode ? 'Sửa voucher' : 'Thêm voucher')}</button>
                    {isEditMode ? (
                        <form className={`w-full transition-all duration-500 rounded-lg overflow-hidden shadow-lg ${isShowForm ? 'max-h-1000' : 'max-h-0 lg:max-h-1000'}`} onSubmit={handleUpdateSubmit}>
                        <div className="p-4">
                            <div className="mb-4 w-full">
                                <label className='text-sm text-gray-600 block mb-1'>Mã voucher (4 chữ cái + 4 chữ số)</label>
                                <input 
                                    name='code' 
                                    onChange={handleEditFormChange} 
                                    value={editFormData.code} 
                                    className='border-gray-600 border w-full p-2 rounded-lg uppercase font-mono' 
                                    type="text" 
                                    pattern="[A-Z]{4}[0-9]{4}"
                                    maxLength={8}
                                    placeholder="ABCD1234"
                                    required
                                />
                                <p className='text-xs text-gray-500 mt-1'>Ví dụ: ABCD1234, SUMM2024</p>
                            </div>
                            <div className="mb-4 w-full">
                                <label className='text-sm text-gray-600 block mb-1'>Giá trị giảm giá (%)</label>
                                <input 
                                    name='value' 
                                    onChange={handleEditFormChange} 
                                    value={editFormData.value} 
                                    className='border-gray-600 border w-full p-2 rounded-lg' 
                                    type="number" 
                                    min="1" 
                                    max="100"
                                    required
                                />
                            </div>
                            <div className="mb-4 w-full">
                                <label className='text-sm text-gray-600 block mb-1'>Ngày bắt đầu</label>
                                <input 
                                    name='start_date' 
                                    onChange={handleEditFormChange} 
                                    value={editFormData.start_date} 
                                    className='border-gray-600 border w-full p-2 rounded-lg' 
                                    type="datetime-local" 
                                    required
                                />
                            </div>
                            <div className="mb-4 w-full">
                                <label className='text-sm text-gray-600 block mb-1'>Ngày kết thúc</label>
                                <input 
                                    name='end_date' 
                                    onChange={handleEditFormChange} 
                                    value={editFormData.end_date} 
                                    className='border-gray-600 border w-full p-2 rounded-lg' 
                                    type="datetime-local" 
                                    required
                                />
                            </div>
                            <div className="mb-4 w-full">
                                <label className='text-sm text-gray-600 block mb-1'>Số lượt còn lại (0-100)</label>
                                <input 
                                    name='remain' 
                                    onChange={handleEditFormChange} 
                                    value={editFormData.remain} 
                                    className='border-gray-600 border w-full p-2 rounded-lg' 
                                    type="number" 
                                    min="0"
                                    max="100"
                                    placeholder="1-100"
                                    required
                                />
                            </div>
                            <div className="mb-4 w-full">
                                <label className='text-sm text-gray-600 block mb-1'>Số tiền tối đa được giảm (VNĐ)</label>
                                <input 
                                    name='max_discount_amount' 
                                    onChange={handleEditFormChange} 
                                    value={editFormData.max_discount_amount} 
                                    className='border-gray-600 border w-full p-2 rounded-lg' 
                                    type="number" 
                                    min="0"
                                    placeholder="Để trống nếu không giới hạn"
                                />
                                <p className='text-xs text-gray-500 mt-1'>Ví dụ: 50000 (tối đa giảm 50.000 VNĐ)</p>
                            </div>
                            <div className="mb-4 w-full">
                                <label className='text-sm text-gray-600 block mb-1'>Giá trị đơn hàng tối thiểu (VNĐ)</label>
                                <input 
                                    name='min_order_value' 
                                    onChange={handleEditFormChange} 
                                    value={editFormData.min_order_value} 
                                    className='border-gray-600 border w-full p-2 rounded-lg' 
                                    type="number" 
                                    min="0"
                                    placeholder="0"
                                    required
                                />
                                <p className='text-xs text-gray-500 mt-1'>Đơn hàng phải có giá trị tối thiểu này để áp dụng voucher</p>
                            </div>
                            <div className="mb-4 w-full">
                                <label className='text-sm text-gray-600 block mb-1'>Trạng thái</label>
                                <select 
                                    name='status' 
                                    onChange={handleEditFormChange} 
                                    value={editFormData.status} 
                                    className='border-gray-600 border w-full p-2 rounded-lg'
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="mb-4 w-full flex gap-2">
                                <button type='submit' className='bg-blue-600 hover:bg-blue-500 transition-all duration-300 rounded-lg flex-1 py-2 text-white cursor-pointer'>Cập nhật</button>
                                <button type='button' onClick={handleCancelEdit} className='bg-gray-600 hover:bg-gray-500 transition-all duration-300 rounded-lg flex-1 py-2 text-white cursor-pointer'>Hủy</button>
                            </div>
                        </div>
                        </form>
                    ) : (
                        <form className={`w-full transition-all duration-500 rounded-lg overflow-hidden shadow-lg ${isShowForm ? 'max-h-1000' : 'max-h-0 lg:max-h-1000'}`} onSubmit={handleFormSubmit}>
                    <div className="p-4">
                        <div className="mb-4 w-full">
                            <label className='text-sm text-gray-600 block mb-1'>Mã voucher (4 chữ cái + 4 chữ số)</label>
                            <input 
                                name='code' 
                                onChange={handleFormChange} 
                                value={formData.code} 
                                className='border-gray-600 border w-full p-2 rounded-lg uppercase font-mono' 
                                type="text" 
                                pattern="[A-Z]{4}[0-9]{4}"
                                maxLength={8}
                                placeholder="ABCD1234"
                                required
                            />
                            <p className='text-xs text-gray-500 mt-1'>Ví dụ: ABCD1234, SUMM2024</p>
                        </div>
                        <div className="mb-4 w-full">
                            <label className='text-sm text-gray-600 block mb-1'>Giá trị giảm giá (%)</label>
                            <input 
                                name='value' 
                                onChange={handleFormChange} 
                                value={formData.value} 
                                className='border-gray-600 border w-full p-2 rounded-lg' 
                                type="number" 
                                min="1" 
                                max="100"
                                placeholder="1-100"
                                required
                            />
                        </div>
                        <div className="mb-4 w-full">
                            <label className='text-sm text-gray-600 block mb-1'>Ngày bắt đầu</label>
                            <input 
                                name='start_date' 
                                onChange={handleFormChange} 
                                value={formData.start_date} 
                                className='border-gray-600 border w-full p-2 rounded-lg' 
                                type="datetime-local" 
                                required
                            />
                        </div>
                        <div className="mb-4 w-full">
                            <label className='text-sm text-gray-600 block mb-1'>Ngày kết thúc</label>
                            <input 
                                name='end_date' 
                                onChange={handleFormChange} 
                                value={formData.end_date} 
                                className='border-gray-600 border w-full p-2 rounded-lg' 
                                type="datetime-local" 
                                required
                            />
                        </div>
                        <div className="mb-4 w-full">
                            <label className='text-sm text-gray-600 block mb-1'>Số lượt còn lại (0-100)</label>
                            <input 
                                name='remain' 
                                onChange={handleFormChange} 
                                value={formData.remain} 
                                className='border-gray-600 border w-full p-2 rounded-lg' 
                                type="number" 
                                min="0"
                                max="100"
                                placeholder="1-100"
                                required
                            />
                        </div>
                        <div className="mb-4 w-full">
                            <label className='text-sm text-gray-600 block mb-1'>Số tiền tối đa được giảm (VNĐ)</label>
                            <input 
                                name='max_discount_amount' 
                                onChange={handleFormChange} 
                                value={formData.max_discount_amount} 
                                className='border-gray-600 border w-full p-2 rounded-lg' 
                                type="number" 
                                min="0"
                                placeholder="Để trống = không giới hạn"
                            />
                            <p className='text-xs text-gray-500 mt-1'>Để trống nếu không giới hạn số tiền giảm tối đa</p>
                        </div>
                        <div className="mb-4 w-full">
                            <label className='text-sm text-gray-600 block mb-1'>Giá trị đơn hàng tối thiểu (VNĐ)</label>
                            <input 
                                name='min_order_value' 
                                onChange={handleFormChange} 
                                value={formData.min_order_value} 
                                className='border-gray-600 border w-full p-2 rounded-lg' 
                                type="number" 
                                min="0"
                                placeholder="0"
                                required
                            />
                        </div>
                        <div className="mb-4 w-full">
                            <label className='text-sm text-gray-600 block mb-1'>Trạng thái</label>
                            <select 
                                name='status' 
                                onChange={handleFormChange} 
                                value={formData.status} 
                                className='border-gray-600 border w-full p-2 rounded-lg'
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="mb-4 w-full">
                            <button className='bg-blue-600 hover:bg-blue-500 transition-all duration-300 rounded-lg w-full py-2 text-white cursor-pointer'>Thêm</button>
                        </div>
                    </div>
                    </form>
                    )}
            </div>
        </div>
    </div>
  )
}

export default VoucherManager

