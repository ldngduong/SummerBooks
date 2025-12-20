import React, { use, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addUser, deleteUser, fetchUsers, updateUser } from '../../redux/slices/adminUserSlice'
import Loading from '../Common/Loading'
import { toast } from 'sonner'

const UserManager = () => {

  const {user, loading} = useSelector((state) => state.adminUser)
  const dispatch = useDispatch()    

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  const [isShowForm, setIsShowForm] = useState(false)
  const handleToggleForm = () => {
    setIsShowForm(!isShowForm)
  }
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: ''
  })
  const handleFormChange = (e) => {
    setFormData({...formData, [e.target.name]:e.target.value})
  }

  const validateName = (name) => {
    if(!name || name.trim() === ''){
      return 'Tên người dùng không được để trống.'
    }
    const namePattern = /^[\p{L}\s]{2,}$/u
    if(!namePattern.test(name.trim())){
      return 'Tên người dùng không hợp lệ.'
    }
    return ''
  }

  const validateEmail = (email) => {
    if(!email || email.trim() === ''){
      return 'Email không được để trống.'
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!emailPattern.test(email.trim())){
      return 'Email không hợp lệ.'
    }
    return ''
  }

  const validatePassword = (password) => {
    if(!password || password.trim() === ''){
      return 'Mật khẩu không được để trống.'
    }
    const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-]).{8,}$/
    if(!passwordPattern.test(password)){
      return 'Mật khẩu không hợp lệ. Tối thiểu 8 ký tự trong đó tối thiểu 1 ký tự đặc biệt và 1 ký tự in hoa.'
    }
    return ''
  }

  const validateRole = (role) => {
    if(!role || role.trim() === ''){
      return 'Vai trò không được để trống.'
    }
    return ''
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate tên
    const nameErr = validateName(formData.name)
    if(nameErr){
      return toast.error(nameErr)
    }

    // Validate email
    const emailErr = validateEmail(formData.email)
    if(emailErr){
      return toast.error(emailErr)
    }

    // Validate password
    const passwordErr = validatePassword(formData.password)
    if(passwordErr){
      return toast.error(passwordErr)
    }

    // Validate role
    const roleErr = validateRole(formData.role)
    if(roleErr){
      return toast.error(roleErr)
    }

    try{
      await dispatch(addUser({
        email: formData.email.trim(),
        name: formData.name.trim(),
        password: formData.password,
        role: formData.role
      })).unwrap()
      toast.success('Thêm người dùng thành công')
      setFormData({
        email: '',
        password: '',
        name: '',
        role: ''
      })
    } catch (error) {
      toast.error(error.message || 'Thêm người dùng không thành công. Vui lòng kiểm tra lại thông tin');
    }
  }
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa người dùng này?");
        if (isConfirmed) {
          await dispatch(deleteUser({id}))
          toast.success('Xóa người dùng thành công.')
        }
  }
  const [editingRoles, setEditingRoles] = useState({})

  const handleRoleChange = (id, e) => {
    const selectedRole = e.target.value
    if(selectedRole && selectedRole !== ''){
      dispatch(updateUser({id, role: selectedRole}))
      // Reset về undefined để hiển thị giá trị mới từ server
      const newEditingRoles = {...editingRoles}
      delete newEditingRoles[id]
      setEditingRoles(newEditingRoles)
    }
  }

  const handleRoleFocus = (id) => {
    // Khi click vào dropdown, set giá trị trống để hiển thị danh sách
    setEditingRoles({...editingRoles, [id]: ''})
  }

  const handleRoleBlur = (id) => {
    // Khi blur mà chưa chọn, reset về giá trị ban đầu
    const newEditingRoles = {...editingRoles}
    delete newEditingRoles[id]
    setEditingRoles(newEditingRoles)
  }
  if(loading){
    return <Loading />
  }
  return (
    <div className='flex flex-col h-full relative'>
        <h1 className='text-3xl font-bold mb-6'>Quản lý người dùng</h1>
        <div className="flex h-full shadow-md w-full p-4 gap-3 flex-col-reverse lg:flex-row">
            <div className="w-full lg:w-2/3">
                <h2 className='mb-4 font-semibold text-lg'>Danh sách người dùng</h2>
                <div className="w-full rounded-lg overflow-auto shadow-md">
                    <table className="w-full border-separate border-spacing-0">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 first:rounded-tl-lg last:rounded-tr-lg">UID</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Vai trò</th>
                                <th className="px-4 py-2 last:rounded-tr-lg">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {user && user.length>0 ? (user.map((user)=> (
                                <tr key={user._id} className='hover:bg-gray-100 transition-all duration-300'>
                                    <th className='px-4 py-3'>{user._id.substring(0,3)}...{user._id.substring(user._id.length-4)}</th>
                                    <th className='px-4 py-3'>{user.email}</th>
                                    <th className=''>
                                        <select 
                                            value={editingRoles[user._id] !== undefined ? editingRoles[user._id] : user.role} 
                                            onChange={(e) => {handleRoleChange(user._id, e)}} 
                                            onFocus={() => handleRoleFocus(user._id)}
                                            onBlur={() => handleRoleBlur(user._id)}
                                            className='px-2 py-1 rounded-md border border-gray-500' 
                                            name="role" 
                                        >
                                            <option value="" disabled hidden>Chọn vai trò</option>
                                            <option value="Khách hàng">Khách hàng</option>
                                            <option value="Nhân viên nhập liệu">Nhân viên nhập liệu</option>
                                            <option value="Nhân viên bán hàng">Nhân viên bán hàng</option>
                                            <option value="Quản trị viên">Quản trị viên</option>
                                        </select>
                                    </th>
                                    <th onClick={() => handleDelete(user._id)} className='hover:text-red-600 transition-all duration-200 text-red-400 px-4 py-3 cursor-pointer'>Xóa</th>
                                </tr>
                            ))) : (
                                <tr>                            
                                    <th colSpan={5} className='px-4 py-3'>Không có người dùng.</th>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="w-full lg:w-1/3 h-fit font-semibold relative">
                <h2 className='hidden lg:block mb-4 font-semibold text-lg'>Thêm người dùng</h2>
                <button onClick={handleToggleForm} className='cursor-pointer mb-2 inline-block lg:hidden bg-gray-600 text-white rounded-lg px-4 py-2'>{isShowForm ? 'Đóng' : 'Thêm người dùng'}</button>
                    <form className={`w-full transition-all duration-500 rounded-lg overflow-hidden shadow-lg ${isShowForm ? 'max-h-1000' : 'max-h-0 lg:max-h-1000'}`} onSubmit={handleFormSubmit}>
                    <div className="p-4">
                        <div className="mb-4 w-full">
                            <label className='text-sm text-gray-600 block mb-1'>Tên <span className='text-red-500'>*</span></label>
                            <input name='name' onChange={handleFormChange} value={formData.name} className='border-gray-600 border w-full p-2 rounded-lg' type="text" placeholder='Tên người dùng' />
                        </div>
                        <div className="mb-4 w-full">
                            <label className='text-sm text-gray-600 block mb-1'>Email <span className='text-red-500'>*</span></label>
                            <input name='email' onChange={handleFormChange} value={formData.email} className='border-gray-600 border w-full p-2 rounded-lg' type="email" placeholder='email@example.com' />
                        </div>
                        <div className="mb-4 w-full">
                            <label className='text-sm text-gray-600 block mb-1'>Mật khẩu <span className='text-red-500'>*</span></label>
                            <input name='password' onChange={handleFormChange} value={formData.password} className='border-gray-600 border w-full p-2 rounded-lg' type="password" placeholder='Mật khẩu' />
                        </div>
                        <div className="mb-4 w-full">
                            <label className='text-sm text-gray-600 block mb-1'>Vai trò <span className='text-red-500'>*</span></label>
                            <select name='role' onChange={handleFormChange} value={formData.role} className='border-gray-600 border w-full p-2 rounded-lg'>
                                <option value="" disabled hidden>Chọn vai trò</option>
                                <option value="Khách hàng">Khách hàng</option>
                                <option value="Nhân viên nhập liệu">Nhân viên nhập liệu</option>
                                <option value="Nhân viên bán hàng">Nhân viên bán hàng</option>
                                <option value="Quản trị viên">Quản trị viên</option>
                            </select>
                        </div>
                        <div className="mb-4 w-full">
                            <button className='bg-blue-600 hover:bg-blue-500 transition-all duration-300 rounded-lg w-full py-2 text-white cursor-pointer'>Thêm</button>
                        </div>
                    </div>
                    </form>
            </div>
        </div>
    </div>
  )
}

export default UserManager